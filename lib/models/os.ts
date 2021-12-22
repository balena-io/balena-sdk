/*
Copyright 2016 Balena

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as bSemver from 'balena-semver';
import once = require('lodash/once');

import {
	isNotFoundResponse,
	onlyIf,
	treatAsMissingApplication,
	mergePineOptionsTyped,
} from '../util';
import type { BalenaRequestStreamResult } from 'balena-request';
import type { Dictionary, ResolvableReturnType } from '../../typings/utils';
import type * as DeviceTypeJson from '../types/device-type-json';
import type { ResourceTagBase, ApplicationTag, Release } from '../types/models';
import type {
	InjectedDependenciesParam,
	InjectedOptionsParam,
	PineOptions,
} from '..';
import { getAuthDependentMemoize } from '../util/cache';
import { toWritable } from '../util/types';

const RELEASE_POLICY_TAG_NAME = 'release-policy';
const ESR_NEXT_TAG_NAME = 'esr-next';
const ESR_CURRENT_TAG_NAME = 'esr-current';
const ESR_SUNSET_TAG_NAME = 'esr-sunset';
const VARIANT_TAG_NAME = 'variant';
const VERSION_TAG_NAME = 'version';
const BASED_ON_VERSION_TAG_NAME = 'meta-balena-base';

export enum OsTypes {
	DEFAULT = 'default',
	ESR = 'esr',
}

// Do not change the enum key names b/c they need to
// match with the release_tag values.
export enum OsVariant {
	production = 'prod',
	development = 'dev',
}

export type OsLines = 'next' | 'current' | 'sunset' | 'outdated' | undefined;

const releaseSelectedFields = toWritable([
	'id',
	'known_issue_list',
	'raw_version',
] as const);
export interface OsVersion
	extends Pick<Release, typeof releaseSelectedFields[number]> {
	/** @deprecated use OsVersion.raw_version. */
	rawVersion: string;
	strippedVersion: string;
	basedOnVersion?: string;
	osType: string;
	line?: OsLines;
	variant?: string;
	/** @deprecated */
	formattedVersion: string;
	/** @deprecated */
	isRecommended?: boolean;
}

export interface OsVersionsByDeviceType {
	[deviceTypeSlug: string]: OsVersion[];
}

const BALENAOS_VERSION_REGEX = /v?\d+\.\d+\.\d+(\.rev\d+)?((\-|\+).+)?/;

export interface ImgConfigOptions {
	network?: 'ethernet' | 'wifi';
	appUpdatePollInterval?: number;
	provisioningKeyName?: string;
	wifiKey?: string;
	wifiSsid?: string;
	ip?: string;
	gateway?: string;
	netmask?: string;
	deviceType?: string;
	version: string;
	developmentMode?: boolean;
}

export interface OsUpdateVersions {
	versions: string[];
	recommended: string | undefined;
	current: string | undefined;
}

const getOsModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine, request, pubsub } = deps;
	const { apiUrl, isBrowser } = opts;

	const configModel = once(() =>
		(require('./config') as typeof import('./config')).default(deps, opts),
	);
	const applicationModel = once(() =>
		(require('./application') as typeof import('./application')).default(
			deps,
			opts,
		),
	);
	const deviceTypesUtils = once(
		// Hopefully TS 3.9 will allow us to drop this type cast
		// and infer the types from the require
		() =>
			require('../util/device-types') as typeof import('../util/device-types'),
	);
	const hupActionHelper = once(
		() =>
			(
				require('../util/device-actions/os-update/utils') as typeof import('../util/device-actions/os-update/utils')
			).hupActionHelper,
	);

	const authDependentMemoizer = getAuthDependentMemoize(pubsub);

	const sortVersions = (a: OsVersion, b: OsVersion) => {
		return bSemver.rcompare(a.rawVersion, b.rawVersion);
	};

	const tagsToDictionary = (
		tags: Array<Pick<ResourceTagBase, 'tag_key' | 'value'>>,
	): Dictionary<string> => {
		const result: Dictionary<string> = {};
		for (const { tag_key, value } of tags) {
			result[tag_key] = value;
		}
		return result;
	};

	type HostAppTagSet = ReturnType<typeof getOsAppTags>;
	const getOsAppTags = (
		applicationTags: Array<Pick<ApplicationTag, 'tag_key' | 'value'>>,
	) => {
		const tagMap = tagsToDictionary(applicationTags);
		return {
			osType: tagMap[RELEASE_POLICY_TAG_NAME] ?? OsTypes.DEFAULT,
			nextLineVersionRange: tagMap[ESR_NEXT_TAG_NAME] ?? '',
			currentLineVersionRange: tagMap[ESR_CURRENT_TAG_NAME] ?? '',
			sunsetLineVersionRange: tagMap[ESR_SUNSET_TAG_NAME] ?? '',
		};
	};

	const getOsVersionReleaseLine = (version: string, appTags: HostAppTagSet) => {
		// All patches belong to the same line.
		if (bSemver.satisfies(version, `^${appTags.nextLineVersionRange}`)) {
			return 'next';
		}
		if (bSemver.satisfies(version, `^${appTags.currentLineVersionRange}`)) {
			return 'current';
		}
		if (bSemver.satisfies(version, `^${appTags.sunsetLineVersionRange}`)) {
			return 'sunset';
		}

		if (appTags.osType?.toLowerCase() === OsTypes.ESR) {
			return 'outdated';
		}
	};

	type HostAppInfo = ResolvableReturnType<typeof _getOsVersions>[number];
	const _getOsVersions = async (
		deviceTypes: string[],
		options?: PineOptions<Release>,
	) => {
		return await pine.get({
			resource: 'application',
			options: {
				$select: 'is_for__device_type',
				$expand: {
					application_tag: {
						$select: ['tag_key', 'value'],
					},
					is_for__device_type: {
						$select: 'slug',
					},
					owns__release: mergePineOptionsTyped(
						{
							$select: releaseSelectedFields,
							$expand: {
								release_tag: {
									$select: ['tag_key', 'value'],
								},
							},
						},
						options,
					),
				},
				$filter: {
					is_host: true,
					is_for__device_type: {
						$any: {
							$alias: 'dt',
							$expr: {
								dt: {
									slug: { $in: deviceTypes },
								},
							},
						},
					},
				},
			},
		});
	};

	const _getOsVersionsFromReleases = (
		releases: HostAppInfo['owns__release'],
		appTags: HostAppTagSet,
	) => {
		const OsVariantNames = Object.keys(OsVariant);
		const OsVariantKeywords = new Set(Object.values(OsVariant) as string[]);
		return releases.map((release): OsVersion => {
			const tagMap = tagsToDictionary(release.release_tag!);
			const releaseSemverObj = !release.raw_version.startsWith('0.0.0')
				? bSemver.parse(release.raw_version)
				: null;

			let version: string;
			let variant: string | undefined;
			if (releaseSemverObj != null) {
				version = releaseSemverObj.version;
				const nonVariantBuildParts = releaseSemverObj.build.filter(
					(b) => !OsVariantKeywords.has(b),
				);
				if (nonVariantBuildParts.length > 0) {
					version += `+${nonVariantBuildParts.join('.')}`;
				}
				variant = releaseSemverObj.build.find((b) => OsVariantKeywords.has(b));
			} else {
				// TODO: Drop this `else` once we migrate all version & variant tags to release.semver field
				/** Ideally 'production' | 'development' | undefined. */
				const fullVariantName = tagMap[VARIANT_TAG_NAME] as string | undefined;
				variant =
					typeof fullVariantName === 'string'
						? OsVariantNames.includes(fullVariantName)
							? OsVariant[fullVariantName as keyof typeof OsVariant]
							: fullVariantName
						: undefined;

				version = tagMap[VERSION_TAG_NAME] ?? '';
				// Backfill the native rel
				// TODO: This potentially generates an invalid semver and we should be doing
				// something like `.join(!version.includes('+') ? '+' : '.')`,  but this needs
				// discussion since otherwise it will break all ESR released as of writing this.
				release.raw_version = [version, variant].filter((x) => !!x).join('.');
			}
			const basedOnVersion = tagMap[BASED_ON_VERSION_TAG_NAME] ?? version;
			const line = getOsVersionReleaseLine(version, appTags);

			// TODO: Don't append the variant and sent it as a separate parameter when requesting a download when we don't use /device-types anymore and the API and image maker can handle it. Also rename `rawVersion` -> `versionWithVariant` if it is needed (it might not be needed anymore).
			// The version coming from release tags doesn't contain the variant, so we append it here
			return {
				...release,
				osType: appTags.osType,
				line,
				strippedVersion: version,
				rawVersion: release.raw_version,
				basedOnVersion,
				variant,
				formattedVersion: `v${version}${line ? ` (${line})` : ''}`,
			};
		});
	};

	const _transformHostApps = (apps: HostAppInfo[]) => {
		const osVersionsByDeviceType: OsVersionsByDeviceType = {};
		apps.forEach((hostApp) => {
			const hostAppDeviceType = hostApp.is_for__device_type[0]?.slug;
			if (!hostAppDeviceType) {
				return;
			}

			osVersionsByDeviceType[hostAppDeviceType] ??= [];

			const appTags = getOsAppTags(hostApp.application_tag ?? []);
			osVersionsByDeviceType[hostAppDeviceType].push(
				..._getOsVersionsFromReleases(hostApp.owns__release ?? [], appTags),
			);
		});

		return osVersionsByDeviceType;
	};

	// This mutates the passed object.
	const _transformVersionSets = (
		osVersionsByDeviceType: OsVersionsByDeviceType,
	) => {
		Object.keys(osVersionsByDeviceType).forEach((deviceType) => {
			osVersionsByDeviceType[deviceType].sort(sortVersions);
			const recommendedPerOsType: Dictionary<boolean> = {};

			// Note: the recommended version settings might come from the server in the future, for now we just set it to the latest version for each os type.
			osVersionsByDeviceType[deviceType].forEach((version) => {
				if (!recommendedPerOsType[version.osType]) {
					if (
						version.variant !== 'dev' &&
						!version.known_issue_list &&
						!bSemver.prerelease(version.rawVersion)
					) {
						const additionalFormat = version.line
							? ` (${version.line}, recommended)`
							: ' (recommended)';

						version.isRecommended = true;
						version.formattedVersion = `v${version.strippedVersion}${additionalFormat}`;
						recommendedPerOsType[version.osType] = true;
					}
				}
			});
		});

		return osVersionsByDeviceType;
	};

	const _getAllOsVersions = async (
		deviceTypes: string[],
		options?: PineOptions<Release>,
	): Promise<OsVersionsByDeviceType> => {
		const hostapps = await _getOsVersions(deviceTypes, options);
		return await _transformVersionSets(_transformHostApps(hostapps));
	};

	const _memoizedGetAllOsVersions = authDependentMemoizer(
		async (deviceTypes: string[], listedByDefault: boolean | null) => {
			return await _getAllOsVersions(
				deviceTypes,
				listedByDefault
					? {
							$filter: {
								is_final: true,
								is_invalidated: false,
								status: 'success',
							},
					  }
					: undefined,
			);
		},
	);

	async function getAvailableOsVersions(
		deviceType: string,
	): Promise<OsVersion[]>;
	async function getAvailableOsVersions(
		deviceTypes: string[],
	): Promise<OsVersionsByDeviceType>;
	/**
	 * @summary Get the supported OS versions for the provided device type(s)
	 * @name getAvailableOsVersions
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String|String[]} deviceTypes - device type slug or array of slugs
	 * @fulfil {Object[]|Object} - An array of OsVersion objects when a single device type slug is provided,
	 * or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getAvailableOsVersions('raspberrypi3');
	 *
	 * @example
	 * balena.models.os.getAvailableOsVersions(['fincm3', 'raspberrypi3']);
	 */
	async function getAvailableOsVersions(
		deviceTypes: string[] | string,
	): Promise<OsVersionsByDeviceType | OsVersion[]> {
		const singleDeviceTypeArg =
			typeof deviceTypes === 'string' ? deviceTypes : false;
		deviceTypes = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
		const versionsByDt = await _memoizedGetAllOsVersions(
			deviceTypes.sort(),
			true,
		);
		return singleDeviceTypeArg
			? versionsByDt[singleDeviceTypeArg] ?? []
			: versionsByDt;
	}

	async function getAllOsVersions(
		deviceType: string,
		options?: PineOptions<Release>,
	): Promise<OsVersion[]>;
	async function getAllOsVersions(
		deviceTypes: string[],
		options?: PineOptions<Release>,
	): Promise<OsVersionsByDeviceType>;
	/**
	 * @summary Get all OS versions for the provided device type(s), inlcuding invalidated ones
	 * @name getAllOsVersions
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String|String[]} deviceTypes - device type slug or array of slugs
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]|Object} - An array of OsVersion objects when a single device type slug is provided,
	 * or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getAllOsVersions('raspberrypi3');
	 *
	 * @example
	 * balena.models.os.getAllOsVersions(['fincm3', 'raspberrypi3']);
	 *
	 * @example
	 * balena.models.os.getAllOsVersions(['fincm3', 'raspberrypi3'], { $filter: { is_invalidated: false } });
	 */
	async function getAllOsVersions(
		deviceTypes: string[] | string,
		options?: PineOptions<Release>,
	): Promise<OsVersionsByDeviceType | OsVersion[]> {
		const singleDeviceTypeArg =
			typeof deviceTypes === 'string' ? deviceTypes : false;
		deviceTypes = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
		const versionsByDt =
			options == null
				? await _memoizedGetAllOsVersions(deviceTypes.sort(), null)
				: await _getAllOsVersions(deviceTypes, options);
		return singleDeviceTypeArg
			? versionsByDt[singleDeviceTypeArg] ?? []
			: versionsByDt;
	}

	/**
	 * @summary Get device types with caching
	 * @description Utility method exported for testability.
	 * @name _getDeviceTypes
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getDeviceTypes = authDependentMemoizer<
		() => Promise<DeviceTypeJson.DeviceType[]>
	>(() => configModel().getDeviceTypes());

	const getNormalizedDeviceTypeSlug = async (deviceTypeSlug: string) => {
		const types = await _getDeviceTypes();
		return deviceTypesUtils().getBySlug(types, deviceTypeSlug).slug;
	};

	/**
	 * @summary Get OS versions download size
	 * @description Utility method exported for testability.
	 * @name _getDownloadSize
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getDownloadSize = authDependentMemoizer(
		async (deviceType: string, version: string) => {
			const { body } = await request.send({
				method: 'GET',
				url: `/device-types/v1/${deviceType}/images/${version}/download-size`,
				baseUrl: apiUrl,
			});
			return body.size;
		},
	);

	/**
	 * @summary Clears the cached results from the `device-types/v1` endpoint.
	 * @description Utility method exported for testability.
	 * @name _clearDeviceTypesAndOsVersionCaches
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _clearDeviceTypesAndOsVersionCaches = () => {
		_getDeviceTypes.clear();
		_getDownloadSize.clear();
		_memoizedGetAllOsVersions.clear();
	};

	const normalizeVersion = (v: string) => {
		if (!v) {
			throw new Error(`Invalid version: ${v}`);
		}
		if (v === 'latest') {
			return v;
		}
		const vNormalized = v[0] === 'v' ? v.substring(1) : v;
		if (!BALENAOS_VERSION_REGEX.test(vNormalized)) {
			throw new Error(`Invalid semver version: ${v}`);
		}
		return vNormalized;
	};

	const fixNonSemver = (version: string) => {
		if (version == null) {
			return version;
		}

		return version.replace(/\.rev(\d+)/, '+FIXED-rev$1');
	};

	const unfixNonSemver = (version: string) => {
		if (version == null) {
			return version;
		}

		return version.replace(/\+FIXED-rev(\d+)/, '.rev$1');
	};

	/**
	 * @summary Get the max OS version satisfying the given range.
	 * @description Utility method exported for testability.
	 * @name _getMaxSatisfyingVersion
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getMaxSatisfyingVersion = function (
		versionOrRange: string,
		osVersions: Array<Pick<OsVersion, 'rawVersion' | 'isRecommended'>>,
	) {
		if (versionOrRange === 'recommended') {
			return osVersions.find((v) => v.isRecommended)?.rawVersion;
		}

		if (versionOrRange === 'latest') {
			return osVersions[0]?.rawVersion;
		}

		if (versionOrRange === 'default') {
			return (osVersions.find((v) => v.isRecommended) ?? osVersions[0])
				?.rawVersion;
		}

		const versions = osVersions.map((v) => v.rawVersion);
		const semverVersions = versions.map(fixNonSemver);

		// TODO: Once we integrate balena-semver, balena-semver should learn to handle this itself
		const semverVersionOrRange = fixNonSemver(versionOrRange);
		if (semverVersions.includes(semverVersionOrRange)) {
			// If the _exact_ version you're looking for exists, it's not a range, and
			// we should return it exactly, not any old equivalent version.
			return unfixNonSemver(semverVersionOrRange);
		}

		const maxVersion = bSemver.maxSatisfying(
			semverVersions,
			semverVersionOrRange,
		);

		return unfixNonSemver(maxVersion!);
	};

	/**
	 * @summary Get OS download size estimate
	 * @name getDownloadSize
	 * @public
	 * @function
	 * @memberof balena.models.os
	 * @description **Note!** Currently only the raw (uncompressed) size is reported.
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'.
	 * The version **must** be the exact version number.
	 * @fulfil {Number} - OS image download size, in bytes.
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	 * 	console.log('The OS download size for raspberry-pi', size);
	 * });
	 *
	 * balena.models.os.getDownloadSize('raspberry-pi', function(error, size) {
	 * 	if (error) throw error;
	 * 	console.log('The OS download size for raspberry-pi', size);
	 * });
	 */
	const getDownloadSize = async function (
		deviceType: string,
		version: string = 'latest',
	): Promise<number> {
		deviceType = await getNormalizedDeviceTypeSlug(deviceType);
		return await _getDownloadSize(deviceType, version);
	};

	/**
	 * @summary Get the max OS version satisfying the given range
	 * @name getMaxSatisfyingVersion
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} versionOrRange - can be one of
	 * * the exact version number,
	 * in which case it is returned if the version is supported,
	 * or `null` is returned otherwise,
	 * * a [semver](https://www.npmjs.com/package/semver)-compatible
	 * range specification, in which case the most recent satisfying version is returned
	 * if it exists, or `null` is returned,
	 * * `'latest'` in which case the most recent version is returned, including pre-releases,
	 * * `'recommended'` in which case the recommended version is returned, i.e. the most
	 * recent version excluding pre-releases, which can be `null` if only pre-release versions
	 * are available,
	 * * `'default'` in which case the recommended version is returned if available,
	 * or `latest` is returned otherwise.
	 * Defaults to `'latest'`.
	 * @param {String} [osType] - can be one of 'default', 'esr' or null to include all types
	 *
	 * @fulfil {String|null} - the version number, or `null` if no matching versions are found
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getMaxSatisfyingVersion('raspberry-pi', '^2.11.0').then(function(version) {
	 * 	console.log(version);
	 * });
	 */
	const getMaxSatisfyingVersion = async function (
		deviceType: string,
		versionOrRange: string = 'latest',
		osType?: 'default' | 'esr',
	): Promise<string | null> {
		deviceType = await getNormalizedDeviceTypeSlug(deviceType);
		let osVersions = await getAvailableOsVersions(deviceType);
		if (osType != null) {
			osVersions = osVersions.filter((v) => v.osType === osType);
		}
		return _getMaxSatisfyingVersion(versionOrRange, osVersions) ?? null;
	};

	/**
	 * @summary Get the OS image last modified date
	 * @name getLastModified
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'.
	 * Unsupported (unpublished) version will result in rejection.
	 * The version **must** be the exact version number.
	 * To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`.
	 * @fulfil {Date} - last modified date
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getLastModified('raspberry-pi').then(function(date) {
	 * 	console.log('The raspberry-pi image was last modified in ' + date);
	 * });
	 *
	 * balena.models.os.getLastModified('raspberrypi3', '2.0.0').then(function(date) {
	 * 	console.log('The raspberry-pi image was last modified in ' + date);
	 * });
	 *
	 * balena.models.os.getLastModified('raspberry-pi', function(error, date) {
	 * 	if (error) throw error;
	 * 	console.log('The raspberry-pi image was last modified in ' + date);
	 * });
	 */
	const getLastModified = async function (
		deviceType: string,
		version: string = 'latest',
	): Promise<Date> {
		try {
			deviceType = await getNormalizedDeviceTypeSlug(deviceType);
			version = normalizeVersion(version);
			const response = await request.send({
				method: 'HEAD',
				url: '/download',
				qs: {
					deviceType,
					version,
				},
				baseUrl: apiUrl,
			});
			return new Date(response.headers.get('last-modified')!);
		} catch (err) {
			if (isNotFoundResponse(err)) {
				throw new Error('No such version for the device type');
			}
			throw err;
		}
	};

	/**
	 * @summary Download an OS image
	 * @name download
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'
	 * Unsupported (unpublished) version will result in rejection.
	 * The version **must** be the exact version number.
	 * To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`.
	 * @param {Object} options - OS configuration options to use.
	 * @fulfil {ReadableStream} - download stream
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.download('raspberry-pi').then(function(stream) {
	 * 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	 * });
	 *
	 * balena.models.os.download('raspberry-pi', function(error, stream) {
	 * 	if (error) throw error;
	 * 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	 * });
	 */
	const download = onlyIf(!isBrowser)(async function (
		deviceType: string,
		version: string = 'latest',
		// TODO: make the downloadOptions the only argument in the next major
		options: { developmentMode?: boolean } = {},
	): Promise<BalenaRequestStreamResult> {
		try {
			const slug = await getNormalizedDeviceTypeSlug(deviceType);
			if (version === 'latest') {
				const versions = (await getAvailableOsVersions(slug)).filter(
					(v) => v.osType === OsTypes.DEFAULT,
				);
				version = (versions.find((v) => v.isRecommended) ?? versions[0])
					?.rawVersion;
			} else {
				version = normalizeVersion(version);
			}
			return await request.stream({
				method: 'GET',
				url: '/download',
				qs: {
					...(typeof options === 'object' && options),
					deviceType,
					version,
				},
				baseUrl: apiUrl,
				// optionally authenticated, so we send the token in all cases
			});
		} catch (err) {
			if (isNotFoundResponse(err)) {
				throw new Error('No such version for the device type');
			}
			throw err;
		}
	});

	/**
	 * @summary Get an applications config.json
	 * @name getConfig
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @description
	 * Builds the config.json for a device in the given application, with the given
	 * options.
	 *
	 * Note that an OS version is required. For versions < 2.7.8, config
	 * generation is only supported when using a session token, not an API key.
	 *
	 * @param {String|Number} slugOrId - application slug (string) or id (number).
	 * @param {Object} options - OS configuration options to use.
	 * @param {String} options.version - Required: the OS version of the image.
	 * @param {String} [options.network='ethernet'] - The network type that
	 * the device will use, one of 'ethernet' or 'wifi'.
	 * @param {Number} [options.appUpdatePollInterval] - How often the OS checks
	 * for updates, in minutes.
	 * @param {String} [options.provisioningKeyName] - Name assigned to API key
	 * @param {Boolean} [options.developmentMode] - Controls delopment mode for unified balenaOS releases.
	 * @param {String} [options.wifiKey] - The key for the wifi network the
	 * device will connect to.
	 * @param {String} [options.wifiSsid] - The ssid for the wifi network the
	 * device will connect to.
	 * @param {String} [options.ip] - static ip address.
	 * @param {String} [options.gateway] - static ip gateway.
	 * @param {String} [options.netmask] - static ip netmask.
	 * @fulfil {Object} - application configuration as a JSON object.
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getConfig('myorganization/myapp', { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 *
	 * balena.models.os.getConfig(123, { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 *
	 * balena.models.os.getConfig('myorganization/myapp', { version: ''2.12.7+rev1.prod'' }, function(error, config) {
	 * 	if (error) throw error;
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 */
	const getConfig = async function (
		slugOrId: string | number,
		options: ImgConfigOptions,
	): Promise<object> {
		if (!options?.version) {
			throw new Error('An OS version is required when calling os.getConfig');
		}

		options.network = options.network ?? 'ethernet';

		try {
			const applicationId = await applicationModel()._getId(slugOrId);

			const { body } = await request.send({
				method: 'POST',
				url: '/download-config',
				baseUrl: apiUrl,
				body: {
					...options,
					appId: applicationId,
				},
			});
			return body;
		} catch (err) {
			if (isNotFoundResponse(err)) {
				treatAsMissingApplication(slugOrId, err);
			}
			throw err;
		}
	};

	/**
	 * @summary Returns whether the provided device type supports OS updates between the provided balenaOS versions
	 * @name isSupportedOsUpdate
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} currentVersion - semver-compatible version for the starting OS version
	 * @param {String} targetVersion - semver-compatible version for the target OS version
	 * @fulfil {Boolean} - whether upgrading the OS to the target version is supported
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(isSupported) {
	 * 	console.log(isSupported);
	 * });
	 *
	 * balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod', function(error, config) {
	 * 	if (error) throw error;
	 * 	console.log(isSupported);
	 * });
	 */
	const isSupportedOsUpdate = async (
		deviceType: string,
		currentVersion: string,
		targetVersion: string,
	): Promise<boolean> => {
		deviceType = await getNormalizedDeviceTypeSlug(deviceType);
		return hupActionHelper().isSupportedOsUpdate(
			deviceType,
			currentVersion,
			targetVersion,
		);
	};

	/**
	 * @summary Returns the supported OS update targets for the provided device type
	 * @name getSupportedOsUpdateVersions
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} currentVersion - semver-compatible version for the starting OS version
	 * @fulfil {Object} - the versions information, of the following structure:
	 * * versions - an array of strings,
	 * containing exact version numbers that OS update is supported
	 * * recommended - the recommended version, i.e. the most recent version
	 * that is _not_ pre-release, can be `null`
	 * * current - the provided current version after normalization
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod').then(function(isSupported) {
	 * 	console.log(isSupported);
	 * });
	 *
	 * balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod', function(error, config) {
	 * 	if (error) throw error;
	 * 	console.log(isSupported);
	 * });
	 */
	const getSupportedOsUpdateVersions = async (
		deviceType: string,
		currentVersion: string,
	): Promise<OsUpdateVersions> => {
		deviceType = await getNormalizedDeviceTypeSlug(deviceType);
		const allVersions = (await getAvailableOsVersions(deviceType))
			.filter((v) => v.osType === OsTypes.DEFAULT)
			.map((v) => v.rawVersion);
		// use bSemver.compare to find the current version in the OS list
		// to benefit from the baked-in normalization
		const current = allVersions.find(
			(v) => bSemver.compare(v, currentVersion) === 0,
		);

		const versions = allVersions.filter((v) =>
			hupActionHelper().isSupportedOsUpdate(deviceType, currentVersion, v),
		);

		const recommended = versions.filter((v) => !bSemver.prerelease(v))[0] as
			| string
			| undefined;

		return {
			versions,
			recommended,
			current,
		};
	};

	/**
	 * @summary Returns whether the specified OS architecture is compatible with the target architecture
	 * @name isArchitectureCompatibleWith
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} osArchitecture - The OS's architecture as specified in its device type
	 * @param {String} applicationArchitecture - The application's architecture as specified in its device type
	 * @returns {Boolean} - Whether the specified OS architecture is capable of running
	 * applications build for the target architecture
	 *
	 * @example
	 * const result1 = balena.models.os.isArchitectureCompatibleWith('aarch64', 'armv7hf');
	 * console.log(result1);
	 *
	 * const result2 = balena.models.os.isArchitectureCompatibleWith('armv7hf', 'amd64');
	 * console.log(result2);
	 */
	const isArchitectureCompatibleWith: ReturnType<
		typeof deviceTypesUtils
	>['isOsArchitectureCompatibleWith'] = function (...args) {
		// Wrap with a function so that we can lazy load the deviceTypesUtils
		return deviceTypesUtils().isOsArchitectureCompatibleWith(...args);
	};

	return {
		_getDeviceTypes,
		_getDownloadSize,
		_clearDeviceTypesAndOsVersionCaches,
		_getMaxSatisfyingVersion,
		OsTypes,
		getAllOsVersions,
		getAvailableOsVersions,
		getMaxSatisfyingVersion,
		getDownloadSize,
		getLastModified,
		download,
		getConfig,
		isSupportedOsUpdate,
		getSupportedOsUpdateVersions,
		isArchitectureCompatibleWith,
	};
};

export default getOsModel;
