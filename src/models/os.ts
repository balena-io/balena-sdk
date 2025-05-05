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
import once from 'lodash/once';

import {
	isNotFoundResponse,
	onlyIf,
	mergePineOptions,
	mergePineOptionsTyped,
	type ExtendedPineTypedResult,
} from '../util';
import type { BalenaRequestStreamResult } from 'balena-request';
import type {
	Dictionary,
	ResolvableReturnType,
	TypeOrDictionary,
} from '../../typings/utils';
import type { ResourceTagBase, ApplicationTag, Release } from '../types/models';
import type {
	InjectedDependenciesParam,
	InjectedOptionsParam,
	PineOptions,
	PineTypedResult,
} from '..';
import { getAuthDependentMemoize } from '../util/cache';
import { BalenaReleaseNotFound } from 'balena-errors';

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

const baseReleasePineOptions = {
	$select: ['id', 'known_issue_list', 'raw_version', 'variant', 'phase'],
	$expand: {
		release_tag: {
			$select: ['tag_key', 'value'],
		},
	},
} satisfies PineOptions<Release>;

export interface OsVersion
	extends PineTypedResult<Release, typeof baseReleasePineOptions> {
	strippedVersion: string;
	basedOnVersion?: string;
	osType: string;
	line?: OsLines;
}

export interface ImgConfigOptions {
	network?: 'ethernet' | 'wifi';
	appUpdatePollInterval?: number;
	provisioningKeyName?: string;
	provisioningKeyExpiryDate?: string;
	provisioningKeyDescription?: string;
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

export interface OsDownloadOptions
	extends Pick<
		ImgConfigOptions,
		| 'developmentMode'
		| 'appUpdatePollInterval'
		| 'network'
		| 'wifiKey'
		| 'wifiSsid'
	> {
	deviceType: string;
	version?: string;
	appId?: number;
	fileType?: '.img' | '.zip' | '.gz';
	imageType?: 'raw' | 'flasher';
}

const sortVersions = (a: OsVersion, b: OsVersion) => {
	return bSemver.rcompare(a.raw_version, b.raw_version);
};

/**
 * device/os architectures that show in the keys are also able to
 * run app containers compiled for the architectures in the values
 * @private
 */
const archCompatibilityMap: Partial<Dictionary<string[]>> = {
	aarch64: ['armv7hf', 'rpi'],
	armv7hf: ['rpi'],
};

const tagsToDictionary = (
	tags: Array<Pick<ResourceTagBase, 'tag_key' | 'value'>>,
): Partial<Dictionary<string>> => {
	const result: Dictionary<string> = {};
	for (const { tag_key, value } of tags) {
		result[tag_key] = value;
	}
	return result;
};

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

type HostAppTagSet = ReturnType<typeof getOsAppTags>;
// TODO: Drop this function & just use `release.phase` once we migrate our OS release process
const getOsVersionReleaseLine = (
	phase: Release['phase'],
	version: string,
	appTags: HostAppTagSet,
) => {
	if (phase == null) {
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
	}
	if (phase === 'end-of-life') {
		return 'outdated';
	}
	return phase;
};

const getOsModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const {
		pine,
		request,
		pubsub,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;
	const { apiUrl, isBrowser } = opts;

	const hupActionHelper = once(() => {
		const osUpdateUtils =
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			require('../util/device-actions/os-update/utils') as typeof import('../util/device-actions/os-update/utils');
		return osUpdateUtils.hupActionHelper;
	});

	const authDependentMemoizer = getAuthDependentMemoize(pubsub);

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
					owns__release: mergePineOptionsTyped(baseReleasePineOptions, options),
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
		const results: OsVersion[] = [];
		for (const release of releases) {
			const tagMap = tagsToDictionary(release.release_tag);
			const releaseSemverObj = !release.raw_version.startsWith('0.0.0')
				? bSemver.parse(release.raw_version)
				: null;

			let strippedVersion: string | undefined;
			let variant: string = release.variant;
			if (releaseSemverObj == null) {
				/**
				 * We need a fallback to the deprecated release_tags for the version & variant
				 * since the versioning format of balenaOS [2019.10.0.dev, 2022.01.0] was non-semver compliant
				 * and they were not migrated to the release semver fields.
				 */
				const fullVariantName = tagMap[VARIANT_TAG_NAME];
				if (typeof fullVariantName === 'string') {
					// TODO: Drop this once we migrate all variant tags to the release.variant field.
					variant = OsVariantNames.includes(fullVariantName)
						? OsVariant[fullVariantName as keyof typeof OsVariant]
						: fullVariantName;
				}

				strippedVersion = tagMap[VERSION_TAG_NAME];
				if (strippedVersion == null) {
					continue;
				}
				// Backfill the native release_version field
				// TODO: This potentially generates an invalid semver and we should be doing
				// something like `.join(!version.includes('+') ? '+' : '.')`,  but this needs
				// discussion since otherwise it will break all ESR released that used a non-semver compliant
				// versioning format like "2019.10.0.dev".
				release.raw_version = [strippedVersion, variant]
					.filter((x) => !!x)
					.join('.');
			} else {
				strippedVersion = [
					releaseSemverObj.version,
					// build parts w/o variant
					releaseSemverObj.build.filter((b) => b !== release.variant).join('.'),
				]
					.filter((x) => !!x)
					.join('+');
			}
			// TODO: Drop this call & just use `release.phase` once we migrate our OS release process
			const line =
				getOsVersionReleaseLine(release.phase, strippedVersion, appTags) ??
				undefined;

			results.push({
				...release,
				// TODO: Drop the explicit assignment once the variant field of all OS releases is backfilled.
				variant,
				osType: appTags.osType,
				line,
				strippedVersion,
				basedOnVersion: tagMap[BASED_ON_VERSION_TAG_NAME] ?? strippedVersion,
			});
		}
		return results;
	};

	const _transformHostApps = (apps: HostAppInfo[]) => {
		const osVersionsByDeviceType: Dictionary<OsVersion[]> = {};
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

		// transform version sets
		Object.keys(osVersionsByDeviceType).forEach((deviceType) => {
			osVersionsByDeviceType[deviceType].sort(sortVersions);
		});

		return osVersionsByDeviceType;
	};

	const _getAllOsVersions = async (
		deviceTypes: string[],
		options: PineOptions<Release> | undefined,
		convenienceFilter: 'supported' | 'include_draft' | 'all',
	): Promise<Dictionary<OsVersion[]>> => {
		const extraFilterOptions =
			convenienceFilter === 'supported' || convenienceFilter === 'include_draft'
				? ({
						$filter: {
							...(convenienceFilter === 'supported' && { is_final: true }),
							is_invalidated: false,
							status: 'success',
						},
					} satisfies PineOptions<Release>)
				: undefined;

		const finalOptions =
			options != null
				? mergePineOptions(options, extraFilterOptions)
				: extraFilterOptions;

		const hostapps = await _getOsVersions(deviceTypes, finalOptions);
		return _transformHostApps(hostapps);
	};

	const _memoizedGetAllOsVersions = authDependentMemoizer(
		async (
			deviceTypes: string[],
			convenienceFilter: 'supported' | 'include_draft' | 'all',
		) => {
			return await _getAllOsVersions(deviceTypes, undefined, convenienceFilter);
		},
	);

	async function getAvailableOsVersions(
		deviceType: string,
		options?: { includeDraft?: boolean },
	): Promise<OsVersion[]>;
	async function getAvailableOsVersions(
		deviceTypes: string[],
		options?: { includeDraft?: boolean },
	): Promise<Dictionary<OsVersion[]>>;
	// We define the includeDraft-only overloads separately in order to avoid,
	// "Expression produces a union type that is too complex to represent." errors.
	async function getAvailableOsVersions<TP extends PineOptions<Release>>(
		deviceType: string,
		options: TP & { includeDraft?: boolean },
	): Promise<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>;
	async function getAvailableOsVersions<TP extends PineOptions<Release>>(
		deviceTypes: string[],
		options: TP & { includeDraft?: boolean },
	): Promise<
		Dictionary<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>
	>;
	/**
	 * @summary Get the supported OS versions for the provided device type(s)
	 * @name getAvailableOsVersions
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String|String[]} deviceTypes - device type slug or array of slugs
	 * @param {Object} [options] - Extra pine options & draft filter to use
	 * @param {Boolean} [options.includeDraft=false] - Whether pre-releases should be included in the results
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
	async function getAvailableOsVersions<
		TP extends PineOptions<Release> | undefined,
	>(
		deviceTypes: string[] | string,
		// TODO: Consider providing a different way to for specifying includeDraft in the next major
		// eg: make a methods that returns the complex filter
		options?: TP & { includeDraft?: boolean },
	): Promise<
		TypeOrDictionary<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>
	> {
		const pineOptionEntries =
			options != null
				? Object.entries(options).filter(([key]) => key.startsWith('$'))
				: undefined;
		const pineOptions =
			pineOptionEntries != null && pineOptionEntries.length > 0
				? (Object.fromEntries(pineOptionEntries) as TP)
				: undefined;

		const singleDeviceTypeArg =
			typeof deviceTypes === 'string' ? deviceTypes : false;
		deviceTypes = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
		const convenienceFilter =
			options?.includeDraft === true ? 'include_draft' : 'supported';
		const versionsByDt = (
			pineOptions == null
				? await _memoizedGetAllOsVersions(
						deviceTypes.slice().sort(),
						convenienceFilter,
					)
				: await _getAllOsVersions(deviceTypes, pineOptions, convenienceFilter)
		) as Dictionary<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>;
		return singleDeviceTypeArg
			? (versionsByDt[singleDeviceTypeArg] ?? [])
			: versionsByDt;
	}

	async function getAllOsVersions<TP extends PineOptions<Release> | undefined>(
		deviceType: string,
		options?: TP,
	): Promise<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>;
	async function getAllOsVersions<TP extends PineOptions<Release> | undefined>(
		deviceTypes: string[],
		options?: TP,
	): Promise<
		Dictionary<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>
	>;
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
	async function getAllOsVersions<TP extends PineOptions<Release> | undefined>(
		deviceTypes: string[] | string,
		options?: TP,
	): Promise<
		TypeOrDictionary<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>
	> {
		const singleDeviceTypeArg =
			typeof deviceTypes === 'string' ? deviceTypes : false;
		deviceTypes = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
		const versionsByDt = (
			options == null
				? await _memoizedGetAllOsVersions(deviceTypes.slice().sort(), 'all')
				: await _getAllOsVersions(deviceTypes, options, 'all')
		) as Dictionary<Array<ExtendedPineTypedResult<Release, OsVersion, TP>>>;
		return singleDeviceTypeArg
			? (versionsByDt[singleDeviceTypeArg] ?? [])
			: versionsByDt;
	}

	/**
	 * @summary Resolve the canonical device type slug
	 * @description Utility method exported for testability.
	 * @name _getNormalizedDeviceTypeSlug
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getNormalizedDeviceTypeSlug = authDependentMemoizer(
		async (deviceTypeSlug: string) => {
			const dt = await sdkInstance.models.deviceType.get(deviceTypeSlug, {
				$select: 'slug',
			});
			return dt.slug;
		},
	);

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
			return body.size as number;
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
		_getNormalizedDeviceTypeSlug.clear();
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
		const vNormalized = v.startsWith('v') ? v.substring(1) : v;
		// We still don't want to allow `balenaOS` prefixes, which balena-semver allows.
		if (!bSemver.valid(vNormalized) || !/^\d/.test(vNormalized)) {
			throw new Error(`Invalid semver version: ${v}`);
		}
		return vNormalized;
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
		osVersions: Array<Pick<OsVersion, 'raw_version'>>,
	) {
		if (versionOrRange === 'latest') {
			return osVersions[0]?.raw_version;
		}

		// TODO-next-major: Drop the `default` parameter value
		if (versionOrRange === 'default') {
			return osVersions[0]?.raw_version;
		}

		const versions = osVersions.map((v) => v.raw_version);
		if (versions.includes(versionOrRange)) {
			// If the _exact_ version you're looking for exists, it's not a range, and
			// we should return it exactly, not any old equivalent version.
			return versionOrRange;
		}

		const maxVersion = bSemver.maxSatisfying(versions, versionOrRange);

		return maxVersion;
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
	 */
	const getDownloadSize = async function (
		deviceType: string,
		version = 'latest',
	): Promise<number> {
		deviceType = await _getNormalizedDeviceTypeSlug(deviceType);
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
	 * * `'latest'/'default'` in which case the most recent version is returned, excluding pre-releases,
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
		versionOrRange = 'latest',
		osType?: 'default' | 'esr',
	): Promise<string | null> {
		deviceType = await _getNormalizedDeviceTypeSlug(deviceType);
		let osVersions = await getAvailableOsVersions(deviceType);
		if (osType != null) {
			osVersions = osVersions.filter((v) => v.osType === osType);
		}
		return _getMaxSatisfyingVersion(versionOrRange, osVersions) ?? null;
	};

	/**
	 * @summary Download an OS image
	 * @name download
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {Object} options - OS image options to use.
	 * @param {String} options.deviceType - device type slug
	 * @param {String} [options.version='latest'] - semver-compatible version or 'latest', defaults to 'latest'
	 * Unsupported (unpublished) version will result in rejection.
	 * The version **must** be the exact version number.
	 * @param {Boolean} [options.developmentMode] - controls development mode for unified balenaOS releases.
	 * @param {Number} [options.appId] - the application ID (number).
	 * @param {String} [options.fileType] - download file type. One of '.img' or '.zip' or '.gz'.
	 * @param {String} [options.imageType] - download file type. One of 'raw' or 'flasher'
	 * @param {Number} [options.appUpdatePollInterval] - how often the OS checks for updates, in minutes.
	 * @param {String} [options.network] - the network type that the device will use, one of 'ethernet' or 'wifi'.
	 * @param {String} [options.wifiKey] - the key for the wifi network the device will connect to if network is wifi.
	 * @param {String} [options.wifiSsid] - the ssid for the wifi network the device will connect to if network is wifi.
	 * @fulfil {ReadableStream} - download stream
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.download({deviceType: 'raspberry-pi'}).then(function(stream) {
	 * 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	 * });
	 */
	const download = onlyIf(!isBrowser)(async function ({
		deviceType,
		version = 'latest',
		...restOptions
	}: OsDownloadOptions): Promise<BalenaRequestStreamResult> {
		try {
			const slug = await _getNormalizedDeviceTypeSlug(deviceType);
			if (version === 'latest') {
				const foundVersion = (await getAvailableOsVersions(slug)).find(
					(v) => v.osType === OsTypes.DEFAULT,
				);
				if (!foundVersion) {
					throw new BalenaReleaseNotFound(
						'No version available for this device type',
					);
				}
				version = foundVersion.raw_version;
			} else {
				version = normalizeVersion(version);
			}
			return await request.stream({
				method: 'GET',
				url: '/download',
				qs: {
					...restOptions,
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
	 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number).
	 * @param {Object} options - OS configuration options to use.
	 * @param {String} options.version - Required: the OS version of the image.
	 * @param {String} [options.network='ethernet'] - The network type that
	 * the device will use, one of 'ethernet' or 'wifi'.
	 * @param {Number} [options.appUpdatePollInterval] - How often the OS checks
	 * for updates, in minutes.
	 * @param {String} [options.provisioningKeyName] - Name assigned to API key
	 * @param {String} [options.provisioningKeyExpiryDate] - Expiry Date assigned to API key
	 * @param {Boolean} [options.developmentMode] - Controls development mode for unified balenaOS releases.
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
	 * balena.models.os.getConfig('myorganization/myapp', { version: '2.12.7+rev1.prod' }).then(function(config) {
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 *
	 * balena.models.os.getConfig(123, { version: '2.12.7+rev1.prod' }).then(function(config) {
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 */
	const getConfig = async function (
		slugOrUuidOrId: string | number,
		options: ImgConfigOptions,
	): Promise<object> {
		if (!options?.version) {
			throw new Error('An OS version is required when calling os.getConfig');
		}

		options.network = options.network ?? 'ethernet';

		const applicationId = (
			await sdkInstance.models.application.get(slugOrUuidOrId, {
				$select: 'id',
			})
		).id;

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
	 */
	const isSupportedOsUpdate = async (
		deviceType: string,
		currentVersion: string,
		targetVersion: string,
	): Promise<boolean> => {
		deviceType = await _getNormalizedDeviceTypeSlug(deviceType);
		return hupActionHelper().isSupportedOsUpdate(
			deviceType,
			currentVersion,
			targetVersion,
		);
	};

	/**
	 * @summary Returns the OS update type based on device type, current and target balenaOS versions
	 * @name getOsUpdateType
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} currentVersion - semver-compatible version for the starting OS version
	 * @param {String} targetVersion - semver-compatible version for the target OS version
	 * @fulfil {String} - Currently available types are:
	 *   - resinhup11
	 *   - resinhup12
	 *   - balenahup
	 * 	 - takeover
	 *
	 *  Throws error in any of these cases:
	 *   - Current or target versions are invalid
	 *   - Current or target versions do not match in dev/prod type
	 *   - Current and target versions imply a downgrade operation
	 *   - Action is not supported by device type
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getOsUpdateType('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(osUpdateType) {
	 * 	console.log(osUpdateType);
	 * });
	 */
	const getOsUpdateType = async (
		deviceType: string,
		currentVersion: string,
		targetVersion: string,
	): Promise<string> => {
		deviceType = await _getNormalizedDeviceTypeSlug(deviceType);
		return hupActionHelper().getHUPActionType(
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
	 * @param {Object} [options] - Extra options to filter the OS releases by
	 * @param {Boolean} [options.includeDraft=false] - Whether pre-releases should be included in the results
	 * @fulfil {Object[]|Object} - An array of OsVersion objects when a single device type slug is provided,
	 * or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.
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
	 */
	const getSupportedOsUpdateVersions = async (
		deviceType: string,
		currentVersion: string,
		options?: { includeDraft?: boolean },
	): Promise<OsUpdateVersions> => {
		deviceType = await _getNormalizedDeviceTypeSlug(deviceType);
		const allVersions = (await getAvailableOsVersions(deviceType, options))
			.filter((v) => v.osType === OsTypes.DEFAULT)
			.map((v) => v.raw_version);
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
	const isArchitectureCompatibleWith = (
		osArchitecture: string,
		applicationArchitecture: string,
	): boolean => {
		const compatibleArches = archCompatibilityMap[osArchitecture];
		return (
			osArchitecture === applicationArchitecture ||
			(Array.isArray(compatibleArches) &&
				compatibleArches.includes(applicationArchitecture))
		);
	};

	/**
	 * @summary Returns the Releases of the supervisor for the CPU Architecture
	 * @name getSupervisorReleasesForCpuArchitecture
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String|Number} cpuArchitectureSlugOrId - The slug (string) or id (number) for the CPU Architecture
	 * @param {Object} [options={}] - extra pine options to use
	 * @returns {Promise<String>} - An array of Release objects that can be used to manage a device as supervisors.
	 *
	 * @example
	 * const results = balena.models.os.getSupervisorReleasesForCpuArchitecture('aarch64');
	 *
	 * const [result] = balena.models.os.getSupervisorReleasesForCpuArchitecture(
	 * 	'aarch64',
	 * 	{ $filter: { raw_version: '12.11.0' } },
	 * );
	 *
	 * const [result] = balena.models.os.getSupervisorReleasesForCpuArchitecture(
	 * 	'aarch64',
	 * 	{
	 * 			$select: ['id', 'raw_version', 'known_issue_list', 'created_at', 'contract'],
	 * 			$expand: {
	 * 				release_image: {
	 * 					$select: 'id',
	 * 					$expand: {
	 * 						image: {
	 * 							$select: 'is_stored_at__image_location',
	 * 						},
	 * 					},
	 * 				},
	 * 			},
	 * 		$filter: { raw_version: '12.11.0' }
	 * 	},
	 * );
	 */
	const getSupervisorReleasesForCpuArchitecture = async <
		TP extends PineOptions<Release> | undefined,
	>(
		cpuArchitectureSlugOrId: string | number,
		options?: TP,
	): Promise<
		Array<
			ExtendedPineTypedResult<
				Release,
				Pick<Release, 'id' | 'raw_version' | 'known_issue_list'>,
				TP
			>
		>
	> => {
		const results = await pine.get({
			resource: 'release',
			options: mergePineOptionsTyped(
				{
					$select: ['id', 'raw_version', 'known_issue_list'],
					$filter: {
						status: 'success' as const,
						is_final: true,
						is_invalidated: false,
						semver_major: { $gt: 0 },
						belongs_to__application: {
							$any: {
								$alias: 'a',
								$expr: {
									$and: [
										{ a: { slug: { $startswith: 'balena_os/' } } },
										{ a: { slug: { $endswith: '-supervisor' } } },
									],
									a: {
										is_public: true,
										is_host: false,
										is_for__device_type: {
											$any: {
												$alias: 'dt',
												$expr: {
													dt: {
														is_of__cpu_architecture:
															typeof cpuArchitectureSlugOrId === 'number'
																? cpuArchitectureSlugOrId
																: {
																		$any: {
																			$alias: 'c',
																			$expr: {
																				c: {
																					slug: cpuArchitectureSlugOrId,
																				},
																			},
																		},
																	},
													},
												},
											},
										},
									},
								},
							},
						},
					},
					$orderby: [
						{ semver_major: 'desc' },
						{ semver_minor: 'desc' },
						{ semver_patch: 'desc' },
						{ revision: 'desc' },
					],
				},
				options,
			),
		});

		return results as Array<
			ExtendedPineTypedResult<
				Release,
				Pick<Release, 'id' | 'raw_version' | 'known_issue_list'>,
				TP
			>
		>;
	};

	return {
		// Cast the exported types for internal methods so `@types/memoizee` can be a dev depenency.
		_getNormalizedDeviceTypeSlug: _getNormalizedDeviceTypeSlug as (
			deviceTypeSlug: string,
		) => Promise<string>,
		_getDownloadSize: _getDownloadSize as (
			deviceType: string,
			version: string,
		) => Promise<number>,
		_clearDeviceTypesAndOsVersionCaches,
		_getMaxSatisfyingVersion,
		OsTypes,
		getAllOsVersions,
		getAvailableOsVersions,
		getMaxSatisfyingVersion,
		getDownloadSize,
		download,
		getConfig,
		isSupportedOsUpdate,
		getOsUpdateType,
		getSupportedOsUpdateVersions,
		isArchitectureCompatibleWith,
		getSupervisorReleasesForCpuArchitecture,
	};
};

export default getOsModel;
