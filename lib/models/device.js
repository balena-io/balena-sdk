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

import * as url from 'url';

const once = require('lodash/once');
import * as bSemver from 'balena-semver';
import * as semver from 'semver';
import * as errors from 'balena-errors';

import {
	isId,
	isNoDeviceForKeyResponse,
	isNotFoundResponse,
	mergePineOptions,
	treatAsMissingDevice,
	LOCKED_STATUS_CODE,
} from '../util';

import {
	getDeviceOsSemverWithVariant,
	normalizeDeviceOsVersion,
} from '../util/device-os-version';
import {
	getCurrentServiceDetailsPineExpand,
	generateCurrentServiceDetails,
} from '../util/device-service-details';

import {
	checkLocalModeSupported,
	getLocalModeSupport,
	LOCAL_MODE_ENV_VAR,
	LOCAL_MODE_SUPPORT_PROPERTIES,
} from '../util/local-mode';

import { OverallStatus } from './device-ts';

// The min version where /apps API endpoints are implemented is 1.8.0 but we'll
// be accepting >= 1.8.0-alpha.0 instead. This is a workaround for a published 1.8.0-p1
// prerelease supervisor version, which precedes 1.8.0 but comes after 1.8.0-alpha.0
// according to semver.
const MIN_SUPERVISOR_APPS_API = '1.8.0-alpha.0';

const MIN_SUPERVISOR_MC_API = '7.0.0';

// Degraded network, slow devices, compressed docker binaries and any combination of these factors
// can cause proxied device requests to surpass the default timeout (currently 30s). This was
// noticed during tests and the endpoints that resulted in container management actions were
// affected in particular.
const CONTAINER_ACTION_ENDPOINT_TIMEOUT = 50000;

const getDeviceModel = function (deps, opts) {
	const {
		pine,
		request,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;
	let { apiUrl, dashboardUrl, deviceUrlsBase } = opts;

	const registerDevice = once(() =>
		require('balena-register-device').getRegisterDevice({ request }),
	);
	const configModel = once(() => require('./config').default(deps, opts));
	const applicationModel = once(() =>
		require('./application').default(deps, opts),
	);
	const osModel = once(() => require('./os').default(deps, opts));

	const { addCallbackSupportToModule } = require('../util/callbacks');

	const { buildDependentResource } = require('../util/dependent-resource');
	const hupActionHelper = once(
		() => require('../util/device-actions/os-update/utils').hupActionHelper,
	);
	const deviceTypesUtils = once(() => require('../util/device-types'));
	const dateUtils = once(() => require('../util/date'));

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'device_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'device',
			async getResourceId(uuidOrId) {
				const { id } = await exports.get(uuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const configVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'device_config_variable',
			resourceKeyField: 'name',
			parentResourceName: 'device',
			async getResourceId(uuidOrId) {
				const { id } = await exports.get(uuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const envVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'device_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'device',
			async getResourceId(uuidOrId) {
				const { id } = await exports.get(uuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	// Infer dashboardUrl from apiUrl if former is undefined
	if (dashboardUrl == null) {
		dashboardUrl = apiUrl.replace(/api/, 'dashboard');
	}

	const getDeviceUrlsBase = once(async function () {
		if (deviceUrlsBase != null) {
			return deviceUrlsBase;
		}
		return (await configModel().getAll()).deviceUrlsBase;
	});

	const getOsUpdateHelper = once(async () => {
		const $deviceUrlsBase = await getDeviceUrlsBase();
		const {
			getOsUpdateHelper: _getOsUpdateHelper,
		} = require('../util/device-actions/os-update');
		return _getOsUpdateHelper($deviceUrlsBase, request);
	});

	// Internal method for uuid/id disambiguation
	// Note that this throws an exception for missing uuids, but not missing ids
	const getId = async (uuidOrId) => {
		if (isId(uuidOrId)) {
			return uuidOrId;
		} else {
			const { id } = await exports.get(uuidOrId, { $select: 'id' });
			return id;
		}
	};

	/**
	 * @summary Ensure supervisor version compatibility using semver
	 * @name ensureSupervisorCompatibility
	 * @private
	 * @function
	 *
	 * @param {String} version - version under check
	 * @param {String} minVersion - minimum accepted version
	 * @throws {Error} Will reject if the given version is < than the given minimum version
	 * @returns {void}
	 *
	 * @example
	 * ensureSupervisorCompatibility(version, MIN_VERSION)
	 * console.log('Is compatible');
	 *
	 */
	const ensureSupervisorCompatibility = function (version, minVersion) {
		if (semver.lt(version, minVersion)) {
			throw new Error(
				`Incompatible supervisor version: ${version} - must be >= ${minVersion}`,
			);
		}
	};

	const addExtraInfo = function (device) {
		normalizeDeviceOsVersion(device);
		return device;
	};

	const setLockOverriden = async (uuidOrId, shouldOverride) => {
		const deviceId = await getId(uuidOrId);
		const value = shouldOverride ? '1' : '0';
		return await request.send({
			method: 'POST',
			url: `/device/${deviceId}/lock-override`,
			baseUrl: apiUrl,
			body: {
				value,
			},
		});
	};

	const set = async (uuidOrId, body) => {
		const { id } = await exports.get(uuidOrId, { $select: 'id' });
		return await pine.patch({
			resource: 'device',
			body,
			id,
		});
	};

	const exports = {
		OverallStatus,
		/**
		 * @summary Get Dashboard URL for a specific device
		 * @function getDashboardUrl
		 * @memberof balena.models.device
		 *
		 * @param {String} uuid - Device uuid
		 *
		 * @returns {String} - Dashboard URL for the specific device
		 * @throws Exception if the uuid is empty
		 *
		 * @example
		 * dashboardDeviceUrl = balena.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
		 */
		getDashboardUrl(uuid) {
			if (typeof uuid !== 'string' || uuid.length === 0) {
				throw new Error('The uuid option should be a non empty string');
			}

			return url.resolve(dashboardUrl, `/devices/${uuid}/summary`);
		},

		/**
		 * @summary Get all devices
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - devices
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all devices that the current user can access.
		 * In order to have the following computed properties in the result
		 * you have to explicitly define them in a `$select` in the extra options:
		 * * `overall_status`
		 * * `overall_progress`
		 *
		 * @example
		 * balena.models.device.getAll().then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAll({ $select: ['overall_status', 'overall_progress'] }).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.getAll(function(error, devices) {
		 * 	if (error) throw error;
		 * 	console.log(devices);
		 * });
		 */
		async getAll(options) {
			if (options == null) {
				options = {};
			}

			const devices = await pine.get({
				resource: 'device',
				options: mergePineOptions({ $orderby: 'device_name asc' }, options),
			});
			return devices.map(addExtraInfo);
		},

		/**
		 * @summary Get all devices by application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * This method returns all devices of a specific application.
		 * In order to have the following computed properties in the result
		 * you have to explicitly define them in a `$select` in the extra options:
		 * * `overall_status`
		 * * `overall_progress`
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - devices
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getAllByApplication('MyApp').then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByApplication(123).then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByApplication('MyApp', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.getAllByApplication('MyApp', function(error, devices) {
		 * 	if (error) throw error;
		 * 	console.log(devices);
		 * });
		 */
		async getAllByApplication(nameOrSlugOrId, options) {
			if (options == null) {
				options = {};
			}

			const { id } = await applicationModel().get(nameOrSlugOrId, {
				$select: 'id',
			});
			return await exports.getAll(
				mergePineOptions({ $filter: { belongs_to__application: id } }, options),
			);
		},

		/**
		 * @summary Get all devices by parent device
		 * @name getAllByParentDevice
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} parentUuidOrId - parent device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - devices
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByParentDevice(123).then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
		 * 	if (error) throw error;
		 * 	console.log(devices);
		 * });
		 */
		async getAllByParentDevice(parentUuidOrId, options) {
			if (options == null) {
				options = {};
			}

			const { id } = await exports.get(parentUuidOrId, { $select: 'id' });
			return await exports.getAll(
				mergePineOptions({ $filter: { is_managed_by__device: id } }, options),
			);
		},

		/**
		 * @summary Get a single device
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * This method returns a single device by id or uuid.
		 * In order to have the following computed properties in the result
		 * you have to explicitly define them in a `$select` in the extra options:
		 * * `overall_status`
		 * * `overall_progress`
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - device
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.get('7cf02a6').then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.get(123).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.get('7cf02a6', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.get('7cf02a6', function(error, device) {
		 * 	if (error) throw error;
		 * 	console.log(device);
		 * });
		 */
		async get(uuidOrId, options) {
			if (options == null) {
				options = {};
			}

			if (uuidOrId == null) {
				throw new errors.BalenaDeviceNotFound(uuidOrId);
			}

			let device;
			if (isId(uuidOrId)) {
				device = await pine.get({
					resource: 'device',
					id: uuidOrId,
					options,
				});
				if (device == null) {
					throw new errors.BalenaDeviceNotFound(uuidOrId);
				}
			} else {
				const devices = await pine.get({
					resource: 'device',
					options: mergePineOptions(
						{
							$filter: {
								uuid: { $startswith: uuidOrId },
							},
						},
						options,
					),
				});
				if (devices.length === 0) {
					throw new errors.BalenaDeviceNotFound(uuidOrId);
				}

				if (devices.length > 1) {
					throw new errors.BalenaAmbiguousDevice(uuidOrId);
				}
				device = devices[0];
			}
			return addExtraInfo(device);
		},

		/**
		 * @summary Get a single device along with its associated services' details,
		 * including their associated commit
		 * @name getWithServiceDetails
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * This method does not map exactly to the underlying model: it runs a
		 * larger prebuilt query, and reformats it into an easy to use and
		 * understand format. If you want more control, or to see the raw model
		 * directly, use `device.get(uuidOrId, options)` instead.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - device with service details
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.getWithServiceDetails(123).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.device.getWithServiceDetails('7cf02a6', function(error, device) {
		 * 	if (error) throw error;
		 * 	console.log(device);
		 * });
		 */
		async getWithServiceDetails(uuidOrId, options) {
			if (options == null) {
				options = {};
			}

			const device = await exports.get(
				uuidOrId,
				mergePineOptions(
					{ $expand: getCurrentServiceDetailsPineExpand(true) },
					options,
				),
			);
			return generateCurrentServiceDetails(device);
		},

		/**
		 * @summary Get devices by name
		 * @name getByName
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String} name - device name
		 * @fulfil {Object[]} - devices
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getByName('MyDevice').then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getByName('MyDevice', function(error, devices) {
		 * 	if (error) throw error;
		 * 	console.log(devices);
		 * });
		 */
		async getByName(name, options) {
			if (options == null) {
				options = {};
			}

			const devices = await exports.getAll(
				mergePineOptions({ $filter: { device_name: name } }, options),
			);
			if (devices.length === 0) {
				throw new errors.BalenaDeviceNotFound(name);
			}
			return devices;
		},

		/**
		 * @summary Get the name of a device
		 * @name getName
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - device name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getName('7cf02a6').then(function(deviceName) {
		 * 	console.log(deviceName);
		 * });
		 *
		 * @example
		 * balena.models.device.getName(123).then(function(deviceName) {
		 * 	console.log(deviceName);
		 * });
		 *
		 * @example
		 * balena.models.device.getName('7cf02a6', function(error, deviceName) {
		 * 	if (error) throw error;
		 * 	console.log(deviceName);
		 * });
		 */
		getName: async (uuidOrId) => {
			const { device_name } = await exports.get(uuidOrId, {
				$select: 'device_name',
			});
			return device_name;
		},

		/**
		 * @summary Get application name
		 * @name getApplicationName
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - application name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
		 * 	console.log(applicationName);
		 * });
		 *
		 * @example
		 * balena.models.device.getApplicationName(123).then(function(applicationName) {
		 * 	console.log(applicationName);
		 * });
		 *
		 * @example
		 * balena.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
		 * 	if (error) throw error;
		 * 	console.log(applicationName);
		 * });
		 */
		getApplicationName: async (uuidOrId) => {
			const device = await exports.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'app_name' } },
			});
			return device.belongs_to__application[0].app_name;
		},

		/**
		 * @summary Get application container information
		 * @name getApplicationInfo
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @deprecated
		 * @description
		 * This is not supported on multicontainer devices, and will be removed in a future major release
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Object} - application info
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
		 * 	console.log(appInfo);
		 * });
		 *
		 * @example
		 * balena.models.device.getApplicationInfo(123).then(function(appInfo) {
		 * 	console.log(appInfo);
		 * });
		 *
		 * @example
		 * balena.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
		 * 	if (error) throw error;
		 * 	console.log(appInfo);
		 * });
		 */
		getApplicationInfo: async (uuidOrId) => {
			const device = await exports.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_APPS_API,
			);
			const appId = device.belongs_to__application[0].id;
			const { body } = await request.send({
				method: 'POST',
				url: `/supervisor/v1/apps/${appId}`,
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId,
					method: 'GET',
				},
			});
			return body;
		},

		/**
		 * @summary Check if a device exists
		 * @name has
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Boolean} - has device
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.has('7cf02a6').then(function(hasDevice) {
		 * 	console.log(hasDevice);
		 * });
		 *
		 * @example
		 * balena.models.device.has(123).then(function(hasDevice) {
		 * 	console.log(hasDevice);
		 * });
		 *
		 * @example
		 * balena.models.device.has('7cf02a6', function(error, hasDevice) {
		 * 	if (error) throw error;
		 * 	console.log(hasDevice);
		 * });
		 */
		has: async (uuidOrId) => {
			try {
				await exports.get(uuidOrId, { $select: ['id'] });
				return true;
			} catch (err) {
				if (err instanceof errors.BalenaDeviceNotFound) {
					return false;
				}
				throw err;
			}
		},

		/**
		 * @summary Check if a device is online
		 * @name isOnline
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Boolean} - is device online
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.isOnline('7cf02a6').then(function(isOnline) {
		 * 	console.log('Is device online?', isOnline);
		 * });
		 *
		 * @example
		 * balena.models.device.isOnline(123).then(function(isOnline) {
		 * 	console.log('Is device online?', isOnline);
		 * });
		 *
		 * @example
		 * balena.models.device.isOnline('7cf02a6', function(error, isOnline) {
		 * 	if (error) throw error;
		 * 	console.log('Is device online?', isOnline);
		 * });
		 */
		isOnline: async (uuidOrId) => {
			const { is_online } = await exports.get(uuidOrId, {
				$select: 'is_online',
			});
			return is_online;
		},

		/**
		 * @summary Get the local IP addresses of a device
		 * @name getLocalIPAddresses
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String[]} - local ip addresses
		 * @reject {Error} Will reject if the device is offline
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
		 * 	localIPAddresses.forEach(function(localIP) {
		 * 		console.log(localIP);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
		 * 	localIPAddresses.forEach(function(localIP) {
		 * 		console.log(localIP);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
		 * 	if (error) throw error;
		 *
		 * 	localIPAddresses.forEach(function(localIP) {
		 * 		console.log(localIP);
		 * 	});
		 * });
		 */
		getLocalIPAddresses: async (uuidOrId) => {
			const { is_online, ip_address, vpn_address } = await exports.get(
				uuidOrId,
				{ $select: ['is_online', 'ip_address', 'vpn_address'] },
			);
			if (!is_online) {
				throw new Error(`The device is offline: ${uuidOrId}`);
			}
			const ips = ip_address.split(' ');
			return ips.filter((ip) => ip !== vpn_address);
		},

		/**
		 * @summary Get the MAC addresses of a device
		 * @name getMACAddresses
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String[]} - mac addresses
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getMACAddresses('7cf02a6').then(function(macAddresses) {
		 * 	macAddresses.forEach(function(mac) {
		 * 		console.log(mac);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.models.device.getMACAddresses(123).then(function(macAddresses) {
		 * 	macAddresses.forEach(function(mac) {
		 * 		console.log(mac);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.models.device.getMACAddresses('7cf02a6', function(error, macAddresses) {
		 * 	if (error) throw error;
		 *
		 * 	macAddresses.forEach(function(mac) {
		 * 		console.log(mac);
		 * 	});
		 * });
		 */
		getMACAddresses: async (uuidOrId) => {
			const { mac_address } = await exports.get(uuidOrId, {
				$select: ['mac_address'],
			});
			if (mac_address == null) {
				return [];
			}
			return mac_address.split(' ');
		},

		/**
		 * @summary Remove device
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.remove('7cf02a6');
		 *
		 * @example
		 * balena.models.device.remove(123);
		 *
		 * @example
		 * balena.models.device.remove('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		remove: async (uuidOrId) => {
			const { uuid } = await exports.get(uuidOrId, { $select: 'uuid' });
			return await pine.delete({
				resource: 'device',
				id: {
					uuid,
				},
			});
		},

		/**
		 * @summary Identify device
		 * @name identify
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.identify('7cf02a6');
		 *
		 * @example
		 * balena.models.device.identify(123);
		 *
		 * @example
		 * balena.models.device.identify('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		identify: async (uuidOrId) => {
			const device = await exports.get(uuidOrId);
			await request.send({
				method: 'POST',
				url: '/supervisor/v1/blink',
				baseUrl: apiUrl,
				body: {
					uuid: device.uuid,
				},
			});
		},

		/**
		 * @summary Rename device
		 * @name rename
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} newName - the device new name
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.rename('7cf02a6', 'NewName');
		 *
		 * @example
		 * balena.models.device.rename(123, 'NewName');
		 *
		 * @example
		 * balena.models.device.rename('7cf02a6', 'NewName', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		rename: (uuidOrId, newName) =>
			set(uuidOrId, {
				device_name: newName,
			}),

		/**
		 * @summary Note a device
		 * @name note
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String} note - the note
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.note('7cf02a6', 'My useful note');
		 *
		 * @example
		 * balena.models.device.note(123, 'My useful note');
		 *
		 * @example
		 * balena.models.device.note('7cf02a6', 'My useful note', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		note: (uuidOrId, note) => set(uuidOrId, { note }),

		/**
		 * @summary Set a custom location for a device
		 * @name setCustomLocation
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} location - the location ({ latitude: 123, longitude: 456 })
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
		 *
		 * @example
		 * balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
		 *
		 * @example
		 * balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		setCustomLocation: (uuidOrId, location) =>
			set(uuidOrId, {
				custom_latitude: String(location.latitude),
				custom_longitude: String(location.longitude),
			}),

		/**
		 * @summary Clear the custom location of a device
		 * @name unsetCustomLocation
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.unsetCustomLocation('7cf02a6');
		 *
		 * @example
		 * balena.models.device.unsetCustomLocation(123);
		 *
		 * @example
		 * balena.models.device.unsetLocation('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		unsetCustomLocation: (uuidOrId) =>
			exports.setCustomLocation(uuidOrId, {
				latitude: '',
				longitude: '',
			}),

		/**
		 * @summary Move a device to another application
		 * @name move
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String|Number} applicationNameOrSlugOrId - application name (string), slug (string) or id (number)
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.move('7cf02a6', 'MyApp');
		 *
		 * @example
		 * balena.models.device.move(123, 'MyApp');
		 *
		 * @example
		 * balena.models.device.move(123, 456);
		 *
		 * @example
		 * balena.models.device.move('7cf02a6', 'MyApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		move: async (uuidOrId, applicationNameOrSlugOrId) => {
			const [device, deviceTypes, application] = await Promise.all([
				exports.get(uuidOrId, {
					$select: 'uuid',
					$expand: { is_of__device_type: { $select: 'slug' } },
				}),
				configModel().getDeviceTypes(),
				applicationModel().get(applicationNameOrSlugOrId, {
					$select: 'id',
					$expand: { is_for__device_type: { $select: 'slug' } },
				}),
			]);
			const osDeviceType = deviceTypesUtils().getBySlug(
				deviceTypes,
				device.is_of__device_type[0].slug,
			);
			const targetAppDeviceType = deviceTypesUtils().getBySlug(
				deviceTypes,
				application.is_for__device_type[0].slug,
			);
			const isCompatibleMove = deviceTypesUtils().isDeviceTypeCompatibleWith(
				osDeviceType,
				targetAppDeviceType,
			);
			if (!isCompatibleMove) {
				throw new errors.BalenaInvalidDeviceType(
					`Incompatible application: ${applicationNameOrSlugOrId}`,
				);
			}

			await pine.patch({
				resource: 'device',
				body: {
					belongs_to__application: application.id,
				},
				id: {
					uuid: device.uuid,
				},
			});
		},

		/**
		 * @summary Start application on device
		 * @name startApplication
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @deprecated
		 * @description
		 * This is not supported on multicontainer devices, and will be removed in a future major release
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - application container id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.startApplication('7cf02a6').then(function(containerId) {
		 * 	console.log(containerId);
		 * });
		 *
		 * @example
		 * balena.models.device.startApplication(123).then(function(containerId) {
		 * 	console.log(containerId);
		 * });
		 *
		 * @example
		 * balena.models.device.startApplication('7cf02a6', function(error, containerId) {
		 * 	if (error) throw error;
		 * 	console.log(containerId);
		 * });
		 */
		startApplication: async (uuidOrId) => {
			const device = await exports.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_APPS_API,
			);
			const appId = device.belongs_to__application[0].id;
			const { body } = await request.send({
				method: 'POST',
				url: `/supervisor/v1/apps/${appId}/start`,
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId,
				},
				timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
			});
			return body.containerId;
		},

		/**
		 * @summary Stop application on device
		 * @name stopApplication
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @deprecated
		 * @description
		 * This is not supported on multicontainer devices, and will be removed in a future major release
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - application container id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.stopApplication('7cf02a6').then(function(containerId) {
		 * 	console.log(containerId);
		 * });
		 *
		 * @example
		 * balena.models.device.stopApplication(123).then(function(containerId) {
		 * 	console.log(containerId);
		 * });
		 *
		 * @example
		 * balena.models.device.stopApplication('7cf02a6', function(error, containerId) {
		 * 	if (error) throw error;
		 * 	console.log(containerId);
		 * });
		 */
		stopApplication: async (uuidOrId) => {
			const device = await exports.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_APPS_API,
			);
			const appId = device.belongs_to__application[0].id;
			const { body } = await request.send({
				method: 'POST',
				url: `/supervisor/v1/apps/${appId}/stop`,
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId,
				},
				timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
			});
			return body.containerId;
		},

		/**
		 * @summary Restart application on device
		 * @name restartApplication
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * This function restarts the Docker container running
		 * the application on the device, but doesn't reboot
		 * the device itself.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.restartApplication('7cf02a6');
		 *
		 * @example
		 * balena.models.device.restartApplication(123);
		 *
		 * @example
		 * balena.models.device.restartApplication('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		restartApplication: async (uuidOrId) => {
			try {
				const deviceId = await getId(uuidOrId);
				const { body } = await request.send({
					method: 'POST',
					url: `/device/${deviceId}/restart`,
					baseUrl: apiUrl,
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
				});
				return body;
			} catch (err) {
				if (isNotFoundResponse(err)) {
					treatAsMissingDevice(uuidOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Start a service on a device
		 * @name startService
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} imageId - id of the image to start
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.startService('7cf02a6', 123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.startService(1, 123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.startService('7cf02a6', 123, function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		startService: async (uuidOrId, imageId) => {
			const device = await exports.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API,
			);
			const appId = device.belongs_to__application[0].id;
			return await request.send({
				method: 'POST',
				url: `/supervisor/v2/applications/${appId}/start-service`,
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId,
					data: {
						appId,
						imageId,
					},
				},
				timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
			});
		},

		/**
		 * @summary Stop a service on a device
		 * @name stopService
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} imageId - id of the image to stop
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.stopService('7cf02a6', 123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.stopService(1, 123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.stopService('7cf02a6', 123, function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		stopService: async (uuidOrId, imageId) => {
			const device = await exports.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API,
			);
			const appId = device.belongs_to__application[0].id;
			return await request.send({
				method: 'POST',
				url: `/supervisor/v2/applications/${appId}/stop-service`,
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId,
					data: {
						appId,
						imageId,
					},
				},
				timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
			});
		},

		/**
		 * @summary Restart a service on a device
		 * @name restartService
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} imageId - id of the image to restart
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.restartService('7cf02a6', 123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.restartService(1, 123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.restartService('7cf02a6', 123, function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		restartService: async (uuidOrId, imageId) => {
			const device = await exports.get(uuidOrId, {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API,
			);
			const appId = device.belongs_to__application[0].id;
			return await request.send({
				method: 'POST',
				url: `/supervisor/v2/applications/${appId}/restart-service`,
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId,
					data: {
						appId,
						imageId,
					},
				},
				timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
			});
		},

		/**
		 * @summary Reboot device
		 * @name reboot
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.reboot('7cf02a6');
		 *
		 * @example
		 * balena.models.device.reboot(123);
		 *
		 * @example
		 * balena.models.device.reboot('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async reboot(uuidOrId, options) {
			if (options == null) {
				options = {};
			}

			try {
				const deviceId = await getId(uuidOrId);
				const { body } = await request
					.send({
						method: 'POST',
						url: '/supervisor/v1/reboot',
						baseUrl: apiUrl,
						body: {
							deviceId,
							data: {
								force: Boolean(options?.force),
							},
						},
					})
					.catch(function (err) {
						if (err.statusCode === LOCKED_STATUS_CODE) {
							throw new errors.BalenaSupervisorLockedError();
						}

						throw err;
					});
				return body;
			} catch (err) {
				if (isNotFoundResponse(err)) {
					treatAsMissingDevice(uuidOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Shutdown device
		 * @name shutdown
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.shutdown('7cf02a6');
		 *
		 * @example
		 * balena.models.device.shutdown(123);
		 *
		 * @example
		 * balena.models.device.shutdown('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async shutdown(uuidOrId, options) {
			if (options == null) {
				options = {};
			}

			const device = await exports.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			return await request
				.send({
					method: 'POST',
					url: '/supervisor/v1/shutdown',
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId: device.belongs_to__application[0].id,
						data: {
							force: Boolean(options?.force),
						},
					},
				})
				.catch(function (err) {
					if (err.statusCode === LOCKED_STATUS_CODE) {
						throw new errors.BalenaSupervisorLockedError();
					}

					throw err;
				});
		},

		/**
		 * @summary Purge device
		 * @name purge
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * This function clears the user application's `/data` directory.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.purge('7cf02a6');
		 *
		 * @example
		 * balena.models.device.purge(123);
		 *
		 * @example
		 * balena.models.device.purge('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		purge: async (uuidOrId) => {
			const device = await exports.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			return await request
				.send({
					method: 'POST',
					url: '/supervisor/v1/purge',
					baseUrl: apiUrl,
					body: {
						deviceId: device.id,
						appId: device.belongs_to__application[0].id,
						data: {
							appId: device.belongs_to__application[0].id,
						},
					},
				})
				.catch(function (err) {
					if (err.statusCode === LOCKED_STATUS_CODE) {
						throw new errors.BalenaSupervisorLockedError();
					}

					throw err;
				});
		},

		/**
		 * @summary Trigger an update check on the supervisor
		 * @name update
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.update('7cf02a6', {
		 * 	force: true
		 * });
		 *
		 * @example
		 * balena.models.device.update(123, {
		 * 	force: true
		 * });
		 *
		 * @example
		 * balena.models.device.update('7cf02a6', {
		 * 	force: true
		 * }, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async update(uuidOrId, options) {
			if (options == null) {
				options = {};
			}

			const device = await exports.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			return await request.send({
				method: 'POST',
				url: '/supervisor/v1/update',
				baseUrl: apiUrl,
				body: {
					deviceId: device.id,
					appId: device.belongs_to__application[0].id,
					data: {
						force: Boolean(options?.force),
					},
				},
			});
		},

		/**
		 * @summary Get the target supervisor state on a device
		 * @name getSupervisorTargetState
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getSupervisorTargetState('7cf02a6').then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 * @example
		 * balena.models.device.getSupervisorTargetState(123).then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 * @example
		 * balena.models.device.getSupervisorTargetState('7cf02a6', function(error, state) {
		 * 	if (error) throw error;
		 * 	console.log(state);
		 * });
		 */
		getSupervisorTargetState: async (uuidOrId) => {
			const { uuid } = await exports.get(uuidOrId, { $select: 'uuid' });
			const { body } = await request.send({
				url: `/device/v2/${uuid}/state`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Get the supervisor state on a device
		 * @name getSupervisorState
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getSupervisorState('7cf02a6').then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 * @example
		 * balena.models.device.getSupervisorState(123).then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 * @example
		 * balena.models.device.getSupervisorState('7cf02a6', function(error, state) {
		 * 	if (error) throw error;
		 * 	console.log(state);
		 * });
		 */
		getSupervisorState: async (uuidOrId) => {
			const { uuid } = await exports.get(uuidOrId, { $select: 'uuid' });
			const { body } = await request.send({
				method: 'POST',
				url: '/supervisor/v1/device',
				baseUrl: apiUrl,
				body: {
					uuid,
					method: 'GET',
				},
			});
			return body;
		},

		/**
		 * @summary Get display name for a device
		 * @name getDisplayName
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @see {@link balena.models.device.getSupportedDeviceTypes} for a list of supported devices
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @fulfil {String} - device display name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
		 * 	console.log(deviceTypeName);
		 * 	// Raspberry Pi
		 * });
		 *
		 * @example
		 * balena.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypeName);
		 * 	// Raspberry Pi
		 * });
		 */
		getDisplayName: async (deviceTypeSlug) => {
			try {
				const { name } = await exports.getManifestBySlug(deviceTypeSlug);
				return name;
			} catch (error) {
				if (error instanceof errors.BalenaInvalidDeviceType) {
					return;
				}

				throw error;
			}
		},

		/**
		 * @summary Get device slug
		 * @name getDeviceSlug
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @see {@link balena.models.device.getSupportedDeviceTypes} for a list of supported devices
		 *
		 * @param {String} deviceTypeName - device type name
		 * @fulfil {String} - device slug name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
		 * 	console.log(deviceTypeSlug);
		 * 	// raspberry-pi
		 * });
		 *
		 * @example
		 * balena.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypeSlug);
		 * 	// raspberry-pi
		 * });
		 */
		getDeviceSlug: async (deviceTypeName) => {
			try {
				const { slug } = await exports.getManifestBySlug(deviceTypeName);
				return slug;
			} catch (error) {
				if (error instanceof errors.BalenaInvalidDeviceType) {
					return;
				}

				throw error;
			}
		},

		/**
		 * @summary Get supported device types
		 * @name getSupportedDeviceTypes
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @fulfil {String[]} - supported device types
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
		 * 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		 * 		console.log('Balena supports:', supportedDeviceType);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
		 * 	if (error) throw error;
		 *
		 * 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		 * 		console.log('Balena supports:', supportedDeviceType);
		 * 	});
		 * });
		 */
		getSupportedDeviceTypes: async () => {
			const deviceTypes = await configModel().getDeviceTypes();
			return deviceTypes.map((dt) => dt.name);
		},

		/**
		 * @summary Get a device manifest by slug
		 * @name getManifestBySlug
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String} slug - device slug
		 * @fulfil {Object} - device manifest
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
		 * 	console.log(manifest);
		 * });
		 *
		 * @example
		 * balena.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
		 * 	if (error) throw error;
		 * 	console.log(manifest);
		 * });
		 */
		getManifestBySlug: async (slug) => {
			const deviceTypes = await configModel().getDeviceTypes();
			const deviceManifest = deviceTypes.find(
				(deviceType) =>
					deviceType.name === slug ||
					deviceType.slug === slug ||
					deviceType.aliases?.includes(slug),
			);
			if (deviceManifest == null) {
				throw new errors.BalenaInvalidDeviceType(slug);
			}
			return deviceManifest;
		},

		/**
		 * @summary Get a device manifest by application name
		 * @name getManifestByApplication
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {Object} - device manifest
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getManifestByApplication('MyApp').then(function(manifest) {
		 * 	console.log(manifest);
		 * });
		 *
		 * @example
		 * balena.models.device.getManifestByApplication(123).then(function(manifest) {
		 * 	console.log(manifest);
		 * });
		 *
		 * @example
		 * balena.models.device.getManifestByApplication('MyApp', function(error, manifest) {
		 * 	if (error) throw error;
		 * 	console.log(manifest);
		 * });
		 */
		getManifestByApplication: async (nameOrSlugOrId) => {
			const {
				is_for__device_type: [deviceType],
			} = await applicationModel().get(nameOrSlugOrId, {
				$select: 'id',
				$expand: { is_for__device_type: { $select: 'slug' } },
			});
			return await exports.getManifestBySlug(deviceType.slug);
		},

		/**
		 * @summary Generate a random key, useful for both uuid and api key.
		 * @name generateUniqueKey
		 * @function
		 * @public
		 * @memberof balena.models.device
		 *
		 * @returns {String} A generated key
		 *
		 * @example
		 * randomKey = balena.models.device.generateUniqueKey();
		 * // randomKey is a randomly generated key that can be used as either a uuid or an api key
		 * console.log(randomKey);
		 */
		generateUniqueKey: function () {
			// Wrap with a function so that we can lazy load registerDevice
			return registerDevice().generateUniqueKey();
		},

		/**
		 * @summary Register a new device with a Balena application.
		 * @name register
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} applicationNameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {String} uuid - device uuid
		 *
		 * @fulfil {Object} Device registration info ({ id: "...", uuid: "...", api_key: "..." })
		 * @returns {Promise}
		 *
		 * @example
		 * var uuid = balena.models.device.generateUniqueKey();
		 * balena.models.device.register('MyApp', uuid).then(function(registrationInfo) {
		 * 	console.log(registrationInfo);
		 * });
		 *
		 * @example
		 * var uuid = balena.models.device.generateUniqueKey();
		 * balena.models.device.register(123, uuid).then(function(registrationInfo) {
		 * 	console.log(registrationInfo);
		 * });
		 *
		 * @example
		 * var uuid = balena.models.device.generateUniqueKey();
		 * balena.models.device.register('MyApp', uuid, function(error, registrationInfo) {
		 * 	if (error) throw error;
		 * 	console.log(registrationInfo);
		 * });
		 */
		async register(applicationNameOrSlugOrId, uuid) {
			const [userId, apiKey, application] = await Promise.all([
				sdkInstance.auth.getUserId(),
				applicationModel().generateProvisioningKey(applicationNameOrSlugOrId),
				applicationModel().get(applicationNameOrSlugOrId, {
					$select: 'id',
					$expand: { is_for__device_type: { $select: 'slug' } },
				}),
			]);
			return await registerDevice().register({
				userId,
				applicationId: application.id,
				uuid,
				deviceType: application.is_for__device_type[0].slug,
				provisioningApiKey: apiKey,
				apiEndpoint: apiUrl,
			});
		},

		/**
		 * @summary Generate a device key
		 * @name generateDeviceKey
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
		 * 	console.log(deviceApiKey);
		 * });
		 *
		 * @example
		 * balena.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
		 * 	console.log(deviceApiKey);
		 * });
		 *
		 * @example
		 * balena.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
		 * 	if (error) throw error;
		 * 	console.log(deviceApiKey);
		 * });
		 */
		generateDeviceKey: async (uuidOrId) => {
			try {
				const deviceId = await getId(uuidOrId);
				const { body } = await request.send({
					method: 'POST',
					url: `/api-key/device/${deviceId}/device-key`,
					baseUrl: apiUrl,
				});
				return body;
			} catch (err) {
				if (isNoDeviceForKeyResponse(err)) {
					treatAsMissingDevice(uuidOrId, err);
				}
				throw err;
			}
		},

		/**
		 * @summary Check if a device is web accessible with device utls
		 * @name hasDeviceUrl
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Boolean} - has device url
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
		 * 	if (hasDeviceUrl) {
		 * 		console.log('The device has device URL enabled');
		 * 	}
		 * });
		 *
		 * @example
		 * balena.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
		 * 	if (hasDeviceUrl) {
		 * 		console.log('The device has device URL enabled');
		 * 	}
		 * });
		 *
		 * @example
		 * balena.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
		 * 	if (error) throw error;
		 *
		 * 	if (hasDeviceUrl) {
		 * 		console.log('The device has device URL enabled');
		 * 	}
		 * });
		 */
		hasDeviceUrl: async (uuidOrId) => {
			const { is_web_accessible } = await exports.get(uuidOrId, {
				$select: 'is_web_accessible',
			});
			return is_web_accessible;
		},

		/**
		 * @summary Get a device url
		 * @name getDeviceUrl
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - device url
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getDeviceUrl('7cf02a6').then(function(url) {
		 * 	console.log(url);
		 * });
		 *
		 * @example
		 * balena.models.device.getDeviceUrl(123).then(function(url) {
		 * 	console.log(url);
		 * });
		 *
		 * @example
		 * balena.models.device.getDeviceUrl('7cf02a6', function(error, url) {
		 * 	if (error) throw error;
		 * 	console.log(url);
		 * });
		 */
		getDeviceUrl: async (uuidOrId) => {
			const hasDeviceUrl = await exports.hasDeviceUrl(uuidOrId);
			if (!hasDeviceUrl) {
				throw new Error(`Device is not web accessible: ${uuidOrId}`);
			}
			const $deviceUrlsBase = await getDeviceUrlsBase();
			const { uuid } = await exports.get(uuidOrId, { $select: 'uuid' });
			return `https://${uuid}.${$deviceUrlsBase}`;
		},

		/**
		 * @summary Enable device url for a device
		 * @name enableDeviceUrl
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.enableDeviceUrl('7cf02a6');
		 *
		 * @example
		 * balena.models.device.enableDeviceUrl(123);
		 *
		 * @example
		 * balena.models.device.enableDeviceUrl('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		enableDeviceUrl: (uuidOrId) =>
			set(uuidOrId, {
				is_web_accessible: true,
			}),

		/**
		 * @summary Disable device url for a device
		 * @name disableDeviceUrl
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.disableDeviceUrl('7cf02a6');
		 *
		 * @example
		 * balena.models.device.disableDeviceUrl(123);
		 *
		 * @example
		 * balena.models.device.disableDeviceUrl('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		disableDeviceUrl: (uuidOrId) =>
			set(uuidOrId, {
				is_web_accessible: false,
			}),

		/**
		 * @summary Enable local mode
		 * @name enableLocalMode
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.enableLocalMode('7cf02a6');
		 *
		 * @example
		 * balena.models.device.enableLocalMode(123);
		 *
		 * @example
		 * balena.models.device.enableLocalMode('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async enableLocalMode(uuidOrId) {
			const selectedProps = ['id', ...LOCAL_MODE_SUPPORT_PROPERTIES];
			const device = await exports.get(uuidOrId, { $select: selectedProps });
			checkLocalModeSupported(device);
			return await exports.configVar.set(device.id, LOCAL_MODE_ENV_VAR, '1');
		},

		/**
		 * @summary Disable local mode
		 * @name disableLocalMode
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.disableLocalMode('7cf02a6');
		 *
		 * @example
		 * balena.models.device.disableLocalMode(123);
		 *
		 * @example
		 * balena.models.device.disableLocalMode('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		disableLocalMode: (uuidOrId) =>
			exports.configVar.set(uuidOrId, LOCAL_MODE_ENV_VAR, '0'),

		/**
		 * @summary Check if local mode is enabled on the device
		 * @name isInLocalMode
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Boolean} - has device url
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.isInLocalMode('7cf02a6').then(function(isInLocalMode) {
		 * 	if (isInLocalMode) {
		 * 		console.log('The device has local mode enabled');
		 * 	}
		 * });
		 *
		 * @example
		 * balena.models.device.isInLocalMode(123).then(function(isInLocalMode) {
		 * 	if (isInLocalMode) {
		 * 		console.log('The device has local mode enabled');
		 * 	}
		 * });
		 *
		 * @example
		 * balena.models.device.isInLocalMode('7cf02a6', function(error, isInLocalMode) {
		 * 	if (error) throw error;
		 *
		 * 	if (isInLocalMode) {
		 * 		console.log('The device has local mode enabled');
		 * 	}
		 * });
		 */
		isInLocalMode: (uuidOrId) =>
			exports.configVar
				.get(uuidOrId, LOCAL_MODE_ENV_VAR)
				.then((value) => value === '1'),

		/**
		 * @summary Returns whether local mode is supported along with a message describing the reason why local mode is not supported.
		 * @name getLocalModeSupport
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {Object} device - A device object
		 * @returns {Object} Local mode support info ({ supported: true/false, message: "..." })
		 *
		 * @example
		 * balena.models.device.get('7cf02a6').then(function(device) {
		 * 	balena.models.device.getLocalModeSupport(device);
		 * })
		 */
		getLocalModeSupport: getLocalModeSupport,

		/**
		 * @summary Enable lock override
		 * @name enableLockOverride
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.enableLockOverride('7cf02a6');
		 *
		 * @example
		 * balena.models.device.enableLockOverride(123);
		 *
		 * @example
		 * balena.models.device.enableLockOverride('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		enableLockOverride: (uuidOrId) => setLockOverriden(uuidOrId, true),

		/**
		 * @summary Disable lock override
		 * @name disableLockOverride
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.disableLockOverride('7cf02a6');
		 *
		 * @example
		 * balena.models.device.disableLockOverride(123);
		 *
		 * @example
		 * balena.models.device.disableLockOverride('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		disableLockOverride: (uuidOrId) => setLockOverriden(uuidOrId, false),

		/**
		 * @summary Check if a device has the lock override enabled
		 * @name hasLockOverride
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.hasLockOverride('7cf02a6');
		 *
		 * @example
		 * balena.models.device.hasLockOverride(123);
		 *
		 * @example
		 * balena.models.device.hasLockOverride('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		hasLockOverride: async (uuidOrId) => {
			const deviceId = await getId(uuidOrId);
			const { body } = await request.send({
				method: 'GET',
				url: `/device/${deviceId}/lock-override`,
				baseUrl: apiUrl,
			});
			return body === '1';
		},

		/**
		 * @summary Ping a device
		 * @name ping
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * This is useful to signal that the supervisor is alive and responding.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.ping('7cf02a6');
		 *
		 * @example
		 * balena.models.device.ping(123);
		 *
		 * @example
		 * balena.models.device.ping('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		ping: async (uuidOrId) => {
			const device = await exports.get(uuidOrId, {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			});
			return await request.send({
				method: 'POST',
				url: '/supervisor/ping',
				baseUrl: apiUrl,
				body: {
					method: 'GET',
					deviceId: device.id,
					appId: device.belongs_to__application[0].id,
				},
			});
		},

		/**
		 * @summary Get the status of a device
		 * @name getStatus
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * Convenience method for getting the overall status of a device.
		 * It's recommended to use `balena.models.device.get()` instead,
		 * in case that you need to retrieve more device fields than just the status.
		 *
		 * @see {@link balena.models.device.get} for an example on selecting the `overall_status` field.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - device status
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getStatus('7cf02a6').then(function(status) {
		 * 	console.log(status);
		 * });
		 *
		 * @example
		 * balena.models.device.getStatus(123).then(function(status) {
		 * 	console.log(status);
		 * });
		 *
		 * @example
		 * balena.models.device.getStatus('7cf02a6', function(error, status) {
		 * 	if (error) throw error;
		 * 	console.log(status);
		 * });
		 */
		async getStatus(uuidOrId) {
			if (typeof uuidOrId !== 'string' && typeof uuidOrId !== 'number') {
				throw new errors.BalenaInvalidParameterError('uuidOrId', uuidOrId);
			}

			const { overall_status } = await exports.get(uuidOrId, {
				$select: 'overall_status',
			});
			return overall_status;
		},

		/**
		 * @summary Get the progress of a device
		 * @name getProgress
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * Convenience method for getting the overall progress of a device.
		 * It's recommended to use `balena.models.device.get()` instead,
		 * in case that you need to retrieve more device fields than just the progress.
		 *
		 * @see {@link balena.models.device.get} for an example on selecting the `overall_progress` field.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Number|Null} - device progress
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getProgress('7cf02a6').then(function(progress) {
		 * 	console.log(progress);
		 * });
		 *
		 * @example
		 * balena.models.device.getProgress(123).then(function(progress) {
		 * 	console.log(progress);
		 * });
		 *
		 * @example
		 * balena.models.device.getProgress('7cf02a6', function(error, progress) {
		 * 	if (error) throw error;
		 * 	console.log(progress);
		 * });
		 */
		async getProgress(uuidOrId) {
			if (typeof uuidOrId !== 'string' && typeof uuidOrId !== 'number') {
				throw new errors.BalenaInvalidParameterError('uuidOrId', uuidOrId);
			}

			const { overall_progress } = await exports.get(uuidOrId, {
				$select: 'overall_progress',
			});
			return overall_progress;
		},

		/**
		 * @summary Grant support access to a device until a specified time
		 * @name grantSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		async grantSupportAccess(uuidOrId, expiryTimestamp) {
			if (expiryTimestamp == null || expiryTimestamp <= Date.now()) {
				throw new errors.BalenaInvalidParameterError(
					'expiryTimestamp',
					expiryTimestamp,
				);
			}

			return await set(uuidOrId, {
				is_accessible_by_support_until__date: expiryTimestamp,
			});
		},

		/**
		 * @summary Revoke support access to a device
		 * @name revokeSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.revokeSupportAccess('7cf02a6');
		 *
		 * @example
		 * balena.models.device.revokeSupportAccess(123);
		 *
		 * @example
		 * balena.models.device.revokeSupportAccess('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		revokeSupportAccess: (uuidOrId) =>
			set(uuidOrId, {
				is_accessible_by_support_until__date: null,
			}),

		/**
		 * @summary Get a string showing when a device was last set as online
		 * @name lastOnline
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * If the device has never been online this method returns the string `Connecting...`.
		 *
		 * @param {Object} device - A device object
		 * @returns {String}
		 *
		 * @example
		 * balena.models.device.get('7cf02a6').then(function(device) {
		 * 	balena.models.device.lastOnline(device);
		 * })
		 */
		lastOnline(device) {
			const lce = device.last_connectivity_event;

			if (!lce) {
				return 'Connecting...';
			}

			const { timeSince } = dateUtils();
			if (device.is_online) {
				return `Online (for ${timeSince(lce, false)})`;
			}

			return timeSince(lce);
		},

		/**
		 * @summary Get the OS version (version number and variant combined) running on a device
		 * @name getOsVersion
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {Object} device - A device object
		 * @returns {?String}
		 *
		 * @example
		 * balena.models.device.get('7cf02a6').then(function(device) {
		 * 	console.log(device.os_version); // => 'balenaOS 2.26.0+rev1'
		 * 	console.log(device.os_variant); // => 'prod'
		 * 	balena.models.device.getOsVersion(device); // => '2.26.0+rev1.prod'
		 * })
		 */
		getOsVersion: (device) => getDeviceOsSemverWithVariant(device),

		/**
		 * @summary Get whether the device is configured to track the current application release
		 * @name isTrackingApplicationRelease
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Boolean} - is tracking the current application release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.isTrackingApplicationRelease('7cf02a6').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.device.isTrackingApplicationRelease('7cf02a6', function(error, isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		isTrackingApplicationRelease: async (uuidOrId) => {
			const { should_be_running__release } = await exports.get(uuidOrId, {
				$select: 'should_be_running__release',
			});
			return !should_be_running__release;
		},

		/**
		 * @summary Get the hash of the currently tracked release for a specific device
		 * @name getTargetReleaseHash
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {String} - The release hash of the currently tracked release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getTargetReleaseHash('7cf02a6').then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.device.getTargetReleaseHash('7cf02a6', function(release) {
		 * 	console.log(release);
		 * });
		 */
		getTargetReleaseHash: async (uuidOrId) => {
			const {
				should_be_running__release,
				belongs_to__application,
			} = await exports.get(uuidOrId, {
				$select: 'id',
				$expand: {
					should_be_running__release: {
						$select: 'commit',
					},
					belongs_to__application: {
						$select: 'id',
						$expand: { should_be_running__release: { $select: ['commit'] } },
					},
				},
			});
			if (should_be_running__release.length > 0) {
				return should_be_running__release[0].commit;
			}
			const targetRelease =
				belongs_to__application[0].should_be_running__release[0];
			if (targetRelease) {
				return targetRelease.commit;
			}
		},

		/**
		 * @summary Set a specific device to run a particular release
		 * @name pinToRelease
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description Configures the device to run a particular release
		 * and not get updated when the current application release changes.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String|Number} fullReleaseHashOrId - the hash of a successful release (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		pinToRelease: async (uuidOrId, fullReleaseHashOrId) => {
			let deviceId;
			let releaseId;
			if (isId(uuidOrId) && isId(fullReleaseHashOrId)) {
				deviceId = uuidOrId;
				releaseId = fullReleaseHashOrId;
			} else {
				const releaseFilterProperty = isId(fullReleaseHashOrId)
					? 'id'
					: 'commit';
				const { id, belongs_to__application } = await exports.get(uuidOrId, {
					$select: 'id',
					$expand: {
						belongs_to__application: {
							$select: 'id',
							$expand: {
								owns__release: {
									$top: 1,
									$select: 'id',
									$filter: {
										[releaseFilterProperty]: fullReleaseHashOrId,
										status: 'success',
									},
									$orderby: 'created_at desc',
								},
							},
						},
					},
				});
				const app = belongs_to__application[0];
				const release = app.owns__release[0];
				if (!release) {
					throw new errors.BalenaReleaseNotFound(fullReleaseHashOrId);
				}
				deviceId = id;
				releaseId = release.id;
			}
			return await pine.patch({
				resource: 'device',
				id: deviceId,
				body: { should_be_running__release: releaseId },
			});
		},

		/**
		 * @summary Set a specific device to run a particular supervisor release
		 * @name setSupervisorRelease
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description Configures the device to run a particular supervisor release.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {String|Number} supervisorVersionOrId - the version of a released supervisor (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.setSupervisorRelease('7cf02a6', 'v10.8.0').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.setSupervisorRelease(123, 'v11.4.14').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.setSupervisorRelease('7cf02a6', 123, function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		setSupervisorRelease: async (uuidOrId, supervisorVersionOrId) => {
			let deviceId;
			let releaseId;
			if (isId(uuidOrId) && isId(supervisorVersionOrId)) {
				deviceId = uuidOrId;
				releaseId = supervisorVersionOrId;
			} else {
				const releaseFilterProperty = isId(supervisorVersionOrId)
					? 'id'
					: 'supervisor_version';
				const device = await exports.get(uuidOrId, {
					$select: 'id',
					$expand: { is_of__device_type: { $select: 'slug' } },
				});
				const [supervisorRelease] = await pine.get({
					resource: 'supervisor_release',
					options: {
						$top: 1,
						$select: 'id',
						$filter: {
							[releaseFilterProperty]: supervisorVersionOrId,
							is_for__device_type: {
								$any: {
									$alias: 'dt',
									$expr: {
										dt: {
											slug: device.is_of__device_type[0].slug,
										},
									},
								},
							},
						},
					},
				});
				if (supervisorRelease == null) {
					throw new errors.BalenaReleaseNotFound(supervisorVersionOrId);
				}
				deviceId = device.id;
				releaseId = supervisorRelease.id;
			}
			return await pine.patch({
				resource: 'device',
				id: deviceId,
				body: { should_be_managed_by__supervisor_release: releaseId },
			});
		},

		/**
		 * @summary Configure a specific device to track the current application release
		 * @name trackApplicationRelease
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description The device's current release will be updated with each new successfully built release.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.trackApplicationRelease('7cf02a6').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.device.trackApplicationRelease('7cf02a6', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		trackApplicationRelease: (uuidOrId) =>
			set(uuidOrId, {
				should_be_running__release: null,
			}),

		/**
		 * @summary Check whether the provided device can update to the target os version
		 * @name _checkOsUpdateTarget
		 * @private
		 * @function
		 * @memberof balena.models.device
		 *
		 * @description
		 * Utility method exported for testability
		 *
		 * @param {Object} device - A device object
		 * @param {String} targetOsVersion - semver-compatible version for the target device
		 * @throws Exception if update isn't supported
		 * @returns {void}
		 */
		_checkOsUpdateTarget(
			{ uuid, is_of__device_type, is_online, os_version, os_variant },
			targetOsVersion,
		) {
			if (!uuid) {
				throw new Error('The uuid of the device is not available');
			}

			if (!is_online) {
				throw new Error(`The device is offline: ${uuid}`);
			}

			if (!os_version) {
				throw new Error(
					`The current os version of the device is not available: ${uuid}`,
				);
			}

			const deviceType = is_of__device_type?.[0]?.slug;
			if (!deviceType) {
				throw new Error(
					`The device type of the device is not available: ${uuid}`,
				);
			}

			// error the property is missing
			if (os_variant === undefined) {
				throw new Error(
					`The os variant of the device is not available: ${uuid}`,
				);
			}

			let currentOsVersion =
				getDeviceOsSemverWithVariant({
					os_version,
					os_variant,
				}) || os_version;

			// if the os_version couldn't be parsed
			// rely on getHUPActionType to throw an error

			// this will throw an error if the action isn't available
			hupActionHelper().getHUPActionType(
				deviceType,
				currentOsVersion,
				targetOsVersion,
			);
		},

		// TODO: This is a temporary solution for ESR, as the ESR-supported versions are not part of the SDK yet.
		// 	It should be removed once the getSupportedVersions is updated to support ESR as well.
		_startOsUpdate: async (uuid, targetOsVersion, skipCheck) => {
			if (!targetOsVersion) {
				throw new errors.BalenaInvalidParameterError(
					'targetOsVersion',
					targetOsVersion,
				);
			}

			const device = await exports.get(uuid, {
				$select: ['is_online', 'os_version', 'os_variant'],
				$expand: { is_of__device_type: { $select: 'slug' } },
			});

			device.uuid = uuid;
			// this will throw an error if the action isn't available
			exports._checkOsUpdateTarget(device, targetOsVersion);
			if (!skipCheck) {
				const { versions: allVersions } = await osModel().getSupportedVersions(
					device.is_of__device_type[0].slug,
				);
				if (
					!allVersions.some((v) => bSemver.compare(v, targetOsVersion) === 0)
				) {
					throw new errors.BalenaInvalidParameterError(
						'targetOsVersion',
						targetOsVersion,
					);
				}
			}

			const osUpdateHelper = await getOsUpdateHelper();

			await osUpdateHelper.startOsUpdate(uuid, targetOsVersion);
		},
		/**
		 * @summary Start an OS update on a device
		 * @name startOsUpdate
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String} uuid - full device uuid
		 * @param {String} targetOsVersion - semver-compatible version for the target device
		 * Unsupported (unpublished) version will result in rejection.
		 * The version **must** be the exact version number, a "prod" variant and greater than the one running on the device.
		 * To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`.
		 * @fulfil {Object} - action response
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod').then(function(status) {
		 * 	console.log(result.status);
		 * });
		 *
		 * @example
		 * balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod', function(error, status) {
		 * 	if (error) throw error;
		 * 	console.log(result.status);
		 * });
		 */
		startOsUpdate: async (uuid, targetOsVersion) => {
			if (!targetOsVersion) {
				throw new errors.BalenaInvalidParameterError(
					'targetOsVersion',
					targetOsVersion,
				);
			}

			const device = await exports.get(uuid, {
				$select: ['is_online', 'os_version', 'os_variant'],
				$expand: { is_of__device_type: { $select: 'slug' } },
			});

			device.uuid = uuid;
			// this will throw an error if the action isn't available
			exports._checkOsUpdateTarget(device, targetOsVersion);

			const { versions: allVersions } = await osModel().getSupportedVersions(
				device.is_of__device_type[0].slug,
			);

			if (!allVersions.some((v) => bSemver.compare(v, targetOsVersion) === 0)) {
				throw new errors.BalenaInvalidParameterError(
					'targetOsVersion',
					targetOsVersion,
				);
			}

			const osUpdateHelper = await getOsUpdateHelper();
			await osUpdateHelper.startOsUpdate(uuid, targetOsVersion);
		},

		/**
		 * @summary Get the OS update status of a device
		 * @name getOsUpdateStatus
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String} uuid - full device uuid
		 * @fulfil {Object} - action response
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getOsUpdateStatus('7cf02a687b74206f92cb455969cf8e98').then(function(status) {
		 * 	console.log(result.status);
		 * });
		 *
		 * @example
		 * balena.models.device.getOsUpdateStatus('7cf02a687b74206f92cb455969cf8e98', function(error, status) {
		 * 	if (error) throw error;
		 * 	console.log(result.status);
		 * });
		 */
		getOsUpdateStatus: async (uuid) => {
			try {
				const osUpdateHelper = await getOsUpdateHelper();
				return await osUpdateHelper.getOsUpdateStatus(uuid);
			} catch (err) {
				if (err.statusCode !== 400) {
					throw err;
				}

				// as an attempt to reduce the requests for this method
				// check whether the device exists only when the request rejects
				// so that it's rejected with the appropriate BalenaDeviceNotFound error
				await exports.get(uuid, { $select: 'id' });
				// if the device exists, then re-throw the original error
				throw err;
			}
		},

		/**
		 * @namespace balena.models.device.tags
		 * @memberof balena.models.device
		 */
		tags: addCallbackSupportToModule({
			/**
			 * @summary Get all device tags for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.tags
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.tags.getAllByApplication('MyApp').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.device.tags.getAllByApplication('MyApp', function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			async getAllByApplication(nameOrSlugOrId, options) {
				if (options == null) {
					options = {};
				}
				const { id } = await applicationModel().get(nameOrSlugOrId, {
					$select: 'id',
				});
				return await tagsModel.getAll(
					mergePineOptions(
						{
							$filter: {
								device: {
									$any: {
										$alias: 'd',
										$expr: { d: { belongs_to__application: id } },
									},
								},
							},
						},
						options,
					),
				);
			},

			/**
			 * @summary Get all device tags for a device
			 * @name getAllByDevice
			 * @public
			 * @function
			 * @memberof balena.models.device.tags
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.tags.getAllByDevice('7cf02a6').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.device.tags.getAllByDevice(123).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.device.tags.getAllByDevice('7cf02a6', function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAllByDevice: tagsModel.getAllByParent,

			/**
			 * @summary Get all device tags
			 * @name getAll
			 * @public
			 * @function
			 * @memberof balena.models.device.tags
			 *
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.tags.getAll().then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.device.tags.getAll(function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAll: tagsModel.getAll,

			/**
			 * @summary Set a device tag
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.device.tags
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @param {String|undefined} value - tag value
			 *
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.device.tags.set(123, 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			set: tagsModel.set,

			/**
			 * @summary Remove a device tag
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.device.tags
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.tags.remove('7cf02a6', 'EDITOR');
			 *
			 * @example
			 * balena.models.device.tags.remove('7cf02a6', 'EDITOR', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			remove: tagsModel.remove,
		}),

		/**
		 * @namespace balena.models.device.configVar
		 * @memberof balena.models.device
		 */
		configVar: addCallbackSupportToModule({
			/**
			 * @summary Get all config variables for a device
			 * @name getAllByDevice
			 * @public
			 * @function
			 * @memberof balena.models.device.configVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device config variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.configVar.getAllByDevice('7cf02a6').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.getAllByDevice(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.getAllByDevice('7cf02a6', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			getAllByDevice: configVarModel.getAllByParent,

			/**
			 * @summary Get all device config variables by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.configVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device config variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.configVar.getAllByApplication('MyApp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.getAllByApplication('MyApp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			async getAllByApplication(nameOrSlugOrId, options) {
				if (options == null) {
					options = {};
				}

				const { id } = await applicationModel().get(nameOrSlugOrId, {
					$select: 'id',
				});
				return await configVarModel.getAll(
					mergePineOptions(
						{
							$filter: {
								device: {
									$any: {
										$alias: 'd',
										$expr: {
											d: {
												belongs_to__application: id,
											},
										},
									},
								},
							},
							$orderby: 'name asc',
						},
						options,
					),
				);
			},

			/**
			 * @summary Get the value of a specific config variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.device.configVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} key - config variable name
			 * @fulfil {String|undefined} - the config variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.get(999999, 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			get: configVarModel.get,

			/**
			 * @summary Set the value of a specific config variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.device.configVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} key - config variable name
			 * @param {String} value - config variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			set: configVarModel.set,

			/**
			 * @summary Clear the value of a specific config variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.device.configVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} key - config variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.remove(999999, 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: configVarModel.remove,
		}),

		/**
		 * @namespace balena.models.device.envVar
		 * @memberof balena.models.device
		 */
		envVar: addCallbackSupportToModule({
			/**
			 * @summary Get all environment variables for a device
			 * @name getAllByDevice
			 * @public
			 * @function
			 * @memberof balena.models.device.envVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.envVar.getAllByDevice('7cf02a6').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.getAllByDevice(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.getAllByDevice('7cf02a6', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			getAllByDevice: envVarModel.getAllByParent,

			/**
			 * @summary Get all device environment variables by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.envVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.envVar.getAllByApplication('MyApp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.getAllByApplication('MyApp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			async getAllByApplication(nameOrSlugOrId, options) {
				if (options == null) {
					options = {};
				}

				const { id } = await applicationModel().get(nameOrSlugOrId, {
					$select: 'id',
				});
				return await envVarModel.getAll(
					mergePineOptions(
						{
							$filter: {
								device: {
									$any: {
										$alias: 'd',
										$expr: {
											d: {
												belongs_to__application: id,
											},
										},
									},
								},
							},
							$orderby: 'name asc',
						},
						options,
					),
				);
			},

			/**
			 * @summary Get the value of a specific environment variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.device.envVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} key - environment variable name
			 * @fulfil {String|undefined} - the environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.envVar.get('7cf02a6', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.get('7cf02a6', 'VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			get: envVarModel.get,

			/**
			 * @summary Set the value of a specific environment variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.device.envVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} key - environment variable name
			 * @param {String} value - environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			set: envVarModel.set,

			/**
			 * @summary Clear the value of a specific environment variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.device.envVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {String} key - environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.envVar.remove('7cf02a6', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.remove('7cf02a6', 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: envVarModel.remove,
		}),

		/**
		 * @namespace balena.models.device.serviceVar
		 * @memberof balena.models.device
		 */
		serviceVar: addCallbackSupportToModule({
			/**
			 * @summary Get all service variable overrides for a device
			 * @name getAllByDevice
			 * @public
			 * @function
			 * @memberof balena.models.device.serviceVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByDevice('7cf02a6').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByDevice(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByDevice('7cf02a6', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			async getAllByDevice(uuidOrId, options) {
				if (options == null) {
					options = {};
				}

				const { id: deviceId } = await exports.get(uuidOrId, { $select: 'id' });
				return await pine.get({
					resource: 'device_service_environment_variable',
					options: mergePineOptions(
						{
							$filter: {
								service_install: {
									$any: {
										$alias: 'si',
										$expr: { si: { device: deviceId } },
									},
								},
							},
						},
						options,
					),
				});
			},

			/**
			 * @summary Get all device service variable overrides by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.serviceVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByApplication('MyApp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByApplication('MyApp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
			 * });
			 */
			async getAllByApplication(nameOrSlugOrId, options) {
				if (options == null) {
					options = {};
				}

				const { id } = await applicationModel().get(nameOrSlugOrId, {
					$select: 'id',
				});
				return await pine.get({
					resource: 'device_service_environment_variable',
					options: mergePineOptions(
						{
							$filter: {
								service_install: {
									$any: {
										$alias: 'si',
										$expr: {
											si: {
												device: {
													$any: {
														$alias: 'd',
														$expr: {
															d: {
																belongs_to__application: id,
															},
														},
													},
												},
											},
										},
									},
								},
							},
							$orderby: 'name asc',
						},
						options,
					),
				});
			},

			/**
			 * @summary Get the overriden value of a service variable on a device
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.device.serviceVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Number} id - service id
			 * @param {String} key - variable name
			 * @fulfil {String|undefined} - the variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
			 * });
			 */
			async get(uuidOrId, serviceId, key) {
				const { id: deviceId } = await exports.get(uuidOrId, { $select: 'id' });
				const [variable] = await pine.get({
					resource: 'device_service_environment_variable',
					options: {
						$filter: {
							service_install: {
								$any: {
									$alias: 'si',
									$expr: {
										si: {
											device: deviceId,
											service: serviceId,
										},
									},
								},
							},
							name: key,
						},
					},
				});
				return variable?.value;
			},

			/**
			 * @summary Set the overriden value of a service variable on a device
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.device.serviceVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Number} id - service id
			 * @param {String} key - variable name
			 * @param {String} value - variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			async set(uuidOrId, serviceId, key, value) {
				value = String(value);

				const deviceFilter = isId(uuidOrId)
					? uuidOrId
					: {
							$any: {
								$alias: 'd',
								$expr: {
									d: {
										uuid: uuidOrId,
									},
								},
							},
					  };

				const serviceInstalls = await pine.get({
					resource: 'service_install',
					options: {
						$filter: {
							device: deviceFilter,
							service: serviceId,
						},
					},
				});

				if (serviceInstalls.length === 0) {
					throw new errors.BalenaServiceNotFound(serviceId);
				}
				if (serviceInstalls.length > 1) {
					throw new errors.BalenaAmbiguousDevice(uuidOrId);
				}
				const serviceInstallId = serviceInstalls[0].id;

				await pine.upsert({
					resource: 'device_service_environment_variable',
					id: {
						service_install: serviceInstallId,
						name: key,
					},
					body: {
						value,
					},
				});
			},

			/**
			 * @summary Clear the overridden value of a service variable on a device
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.device.serviceVar
			 *
			 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
			 * @param {Number} id - service id
			 * @param {String} key - variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			async remove(uuidOrId, serviceId, key) {
				const { id: deviceId } = await exports.get(uuidOrId, { $select: 'id' });
				return await pine.delete({
					resource: 'device_service_environment_variable',
					options: {
						$filter: {
							service_install: {
								$any: {
									$alias: 'si',
									$expr: {
										si: {
											device: deviceId,
											service: serviceId,
										},
									},
								},
							},
							name: key,
						},
					},
				});
			},
		}),
	};

	return exports;
};

export { getDeviceModel as default };
