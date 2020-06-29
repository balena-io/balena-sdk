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

import * as Promise from 'bluebird';

import * as bSemver from 'balena-semver';
import once = require('lodash/once');
import * as memoizee from 'memoizee';
import * as semver from 'semver';

import { isNotFoundResponse, onlyIf, treatAsMissingApplication } from '../util';
import type * as deviceTypesUtilsType from '../util/device-types';
import type { hupActionHelper as hupActionHelperType } from '../util/device-actions/os-update/utils';

import { BalenaRequestStreamResult } from '../../typings/balena-request';
import {
	DeviceTypeJson,
	ImgConfigOptions,
	OsUpdateVersions,
	OsVersions,
} from '../../typings/balena-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '..';

const BALENAOS_VERSION_REGEX = /v?\d+\.\d+\.\d+(\.rev\d+)?((\-|\+).+)?/;

const DEVICE_TYPES_ENDPOINT_CACHING_INTERVAL = 10 * 60 * 1000; // 10 minutes

const getOsModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { request, pubsub } = deps;
	const { apiUrl, isBrowser } = opts;

	const configModel = once(() => require('./config').default(deps, opts));
	const applicationModel = once(() =>
		require('./application').default(deps, opts),
	);
	const deviceTypesUtils = once(
		// Hopefully TS 3.9 will allow us to drop this type cast
		// and infer the types from the require
		() => require('../util/device-types') as typeof deviceTypesUtilsType,
	);
	const hupActionHelper = once(
		() =>
			require('../util/device-actions/os-update/utils')
				.hupActionHelper as typeof hupActionHelperType,
	);

	const withDeviceTypesEndpointCaching = <T extends (...args: any[]) => any>(
		fn: T,
	) => {
		const memoizedFn = memoizee(fn, {
			maxAge: DEVICE_TYPES_ENDPOINT_CACHING_INTERVAL,
			primitive: true,
			promise: true,
		});

		pubsub.subscribe('auth.keyChange', () => memoizedFn.clear());

		return memoizedFn;
	};

	/**
	 * @summary Get device types with caching
	 * @description Utility method exported for testability.
	 * @name _getDeviceTypes
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getDeviceTypes = withDeviceTypesEndpointCaching<
		() => Promise<DeviceTypeJson.DeviceType[]>
	>(() => configModel().getDeviceTypes());

	const getValidatedDeviceType = (deviceTypeSlug: string) =>
		_getDeviceTypes().then((types) =>
			deviceTypesUtils().getBySlug(types, deviceTypeSlug),
		);

	/**
	 * @summary Get OS versions download size
	 * @description Utility method exported for testability.
	 * @name _getDownloadSize
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getDownloadSize = withDeviceTypesEndpointCaching(
		(deviceType: string, version: string) =>
			request
				.send({
					method: 'GET',
					url: `/device-types/v1/${deviceType}/images/${version}/download-size`,
					baseUrl: apiUrl,
					// optionally authenticated, so we send the token in all cases
				})
				.get('body')
				.get('size'),
	);

	const isDevelopmentVersion = (version: string) =>
		/(\.|\+|-)dev/.test(version);

	/**
	 * @summary Get OS versions
	 * @description Utility method exported for testability.
	 * @name _getOsVersions
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _getOsVersions = withDeviceTypesEndpointCaching((deviceType: string) =>
		request
			.send({
				method: 'GET',
				url: `/device-types/v1/${deviceType}/images`,
				baseUrl: apiUrl,
				// optionally authenticated, so we send the token in all cases
			})
			.get('body')
			.then(({ versions, latest }: { versions: any[]; latest: any }) => {
				versions.sort(bSemver.rcompare);
				const potentialRecommendedVersions = versions.filter(
					(version) =>
						!(semver.prerelease(version) || isDevelopmentVersion(version)),
				);
				const recommended =
					(potentialRecommendedVersions != null
						? potentialRecommendedVersions[0]
						: undefined) || null;

				return {
					versions,
					recommended,
					latest,
					default: recommended || latest,
				};
			}),
	);

	/**
	 * @summary Clears the cached results from the `device-types/v1` endpoint.
	 * @description Utility method exported for testability.
	 * @name _clearDeviceTypesEndpointCaches
	 * @private
	 * @function
	 * @memberof balena.models.os
	 */
	const _clearDeviceTypesEndpointCaches = () => {
		_getDeviceTypes.clear();
		_getDownloadSize.clear();
		_getOsVersions.clear();
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

	const deviceImageUrl = (deviceType: string, version: string) =>
		`/download?deviceType=${deviceType}&version=${version}`;

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
		osVersions: OsVersions,
	) {
		if (['default', 'latest', 'recommended'].includes(versionOrRange)) {
			return osVersions[versionOrRange as keyof OsVersions] as string;
		}

		const semverVersions = osVersions.versions.map(fixNonSemver);

		// TODO: Once we integrate balena-semver, balena-semver should learn to handle this itself
		const semverVersionOrRange = fixNonSemver(versionOrRange);
		if (semverVersions.includes(semverVersionOrRange)) {
			// If the _exact_ version you're looking for exists, it's not a range, and
			// we should return it exactly, not any old equivalent version.
			return unfixNonSemver(semverVersionOrRange);
		}

		const maxVersion = semver.maxSatisfying(
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
	const getDownloadSize = function (
		deviceType: string,
		version: string = 'latest',
	): Promise<number> {
		return getValidatedDeviceType(deviceType).then(() =>
			_getDownloadSize(deviceType, version),
		);
	};

	/**
	 * @summary Get OS supported versions
	 * @name getSupportedVersions
	 * @public
	 * @function
	 * @memberof balena.models.os
	 *
	 * @param {String} deviceType - device type slug
	 * @fulfil {Object} - the versions information, of the following structure:
	 * * versions - an array of strings,
	 * containing exact version numbers supported by the current environment
	 * * recommended - the recommended version, i.e. the most recent version
	 * that is _not_ pre-release, can be `null`
	 * * latest - the most recent version, including pre-releases
	 * * default - recommended (if available) or latest otherwise
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	 * 	console.log('Supported OS versions for raspberry-pi', osVersions);
	 * });
	 *
	 * balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	 * 	if (error) throw error;
	 * 	console.log('Supported OS versions for raspberry-pi', osVersions);
	 * });
	 */
	const getSupportedVersions = function (
		deviceType: string,
	): Promise<OsVersions> {
		return getValidatedDeviceType(deviceType).then(() =>
			_getOsVersions(deviceType),
		);
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
	 * @fulfil {String|null} - the version number, or `null` if no matching versions are found
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	 * 	console.log('Supported OS versions for raspberry-pi', osVersions);
	 * });
	 *
	 * balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	 * 	if (error) throw error;
	 * 	console.log('Supported OS versions for raspberry-pi', osVersions);
	 * });
	 */
	const getMaxSatisfyingVersion = function (
		deviceType: string,
		versionOrRange: keyof OsVersions = 'latest',
	): Promise<string> {
		return getValidatedDeviceType(deviceType)
			.then(() => getSupportedVersions(deviceType))
			.then((osVersions) =>
				_getMaxSatisfyingVersion(versionOrRange, osVersions),
			);
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
	const getLastModified = function (
		deviceType: string,
		version: string = 'latest',
	): Promise<Date> {
		return getValidatedDeviceType(deviceType)
			.then(() => normalizeVersion(version))
			.then((ver) =>
				request.send({
					method: 'HEAD',
					url: deviceImageUrl(deviceType, ver),
					baseUrl: apiUrl,
					// optionally authenticated, so we send the token in all cases
				}),
			)
			.catch(isNotFoundResponse, () => {
				throw new Error('No such version for the device type');
			})
			.then((response) => new Date(response.headers.get('last-modified')!));
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
	const download = onlyIf(!isBrowser)(function (
		deviceType: string,
		version: string = 'latest',
	): Promise<BalenaRequestStreamResult> {
		return getValidatedDeviceType(deviceType)
			.then(() => {
				if (version === 'latest') {
					return _getOsVersions(deviceType).get('latest');
				}

				return normalizeVersion(version);
			})
			.then((ver) =>
				request.stream({
					method: 'GET',
					url: deviceImageUrl(deviceType, ver),
					baseUrl: apiUrl,
					// optionally authenticated, so we send the token in all cases
				}),
			)
			.catch(isNotFoundResponse, function () {
				throw new Error('No such version for the device type');
			});
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
	 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number).
	 * @param {Object} options - OS configuration options to use.
	 * @param {String} options.version - Required: the OS version of the image.
	 * @param {String} [options.network='ethernet'] - The network type that
	 * the device will use, one of 'ethernet' or 'wifi'.
	 * @param {Number} [options.appUpdatePollInterval] - How often the OS checks
	 * for updates, in minutes.
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
	 * balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 *
	 * balena.models.os.getConfig(123, { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 *
	 * balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }, function(error, config) {
	 * 	if (error) throw error;
	 * 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	 * });
	 */
	const getConfig = function (
		nameOrSlugOrId: string | number,
		options: ImgConfigOptions,
	): Promise<object> {
		return Promise.try(() => {
			if (!options?.version) {
				throw new Error('An OS version is required when calling os.getConfig');
			}

			options.network = options.network ?? 'ethernet';

			return applicationModel()
				._getId(nameOrSlugOrId)
				.then((applicationId: number) =>
					request.send({
						method: 'POST',
						url: '/download-config',
						baseUrl: apiUrl,
						body: Object.assign(options, { appId: applicationId }),
					}),
				)
				.get('body')
				.catch(isNotFoundResponse, treatAsMissingApplication(nameOrSlugOrId));
		});
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
	const isSupportedOsUpdate = (
		deviceType: string,
		currentVersion: string,
		targetVersion: string,
	): Promise<boolean> =>
		getValidatedDeviceType(deviceType).then(() =>
			hupActionHelper().isSupportedOsUpdate(
				deviceType,
				currentVersion,
				targetVersion,
			),
		);

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
	const getSupportedOsUpdateVersions = (
		deviceType: string,
		currentVersion: string,
	): Promise<OsUpdateVersions> =>
		getSupportedVersions(deviceType).then(({ versions: allVersions }) => {
			// use bSemver.compare to find the current version in the OS list
			// to benefit from the baked-in normalization
			const current = allVersions.find(
				(v) => bSemver.compare(v, currentVersion) === 0,
			);

			const versions = allVersions.filter((v) =>
				// avoid the extra call to getValidatedDeviceType, since getSupportedVersions already does that
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
		});

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
		_getOsVersions,
		_clearDeviceTypesEndpointCaches,
		_getMaxSatisfyingVersion,
		getDownloadSize,
		getSupportedVersions,
		getMaxSatisfyingVersion,
		getLastModified,
		download,
		getConfig,
		isSupportedOsUpdate,
		getSupportedOsUpdateVersions,
		isArchitectureCompatibleWith,
	};
};

export default getOsModel;
