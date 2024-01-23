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

import type {
	InjectedOptionsParam,
	InjectedDependenciesParam,
	PineOptions,
	PineTypedResult,
	PineFilter,
} from '..';
import type {
	Device,
	DeviceServiceEnvironmentVariable,
	DeviceVariable,
	DeviceTag,
	Application,
	DeviceHistory,
} from '../types/models';
import { DeviceOverallStatus as OverallStatus } from '../types/device-overall-status';
import type * as DeviceState from '../types/device-state';
import {
	CurrentServiceWithCommit,
	DeviceWithServiceDetails,
} from '../util/device-service-details';
import type { OsUpdateActionResult } from '../util/device-actions/os-update';

import * as url from 'url';

import once = require('lodash/once');
import groupBy = require('lodash/groupBy');
import * as bSemver from 'balena-semver';
import * as errors from 'balena-errors';
import memoizee from 'memoizee';

import {
	isId,
	isNoDeviceForKeyResponse,
	isFullUuid,
	mergePineOptions,
	treatAsMissingDevice,
	limitedMap,
} from '../util';

import {
	getDeviceOsSemverWithVariant,
	ensureVersionCompatibility,
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
import {
	getSupervisorApiHelper,
	MIN_SUPERVISOR_MC_API,
} from './device.supervisor-api.partial';

import type {
	SubmitBody,
	SelectableProps,
} from '../../typings/pinejs-client-core';
import type {
	AtLeast,
	Dictionary,
	ResolvableReturnType,
} from '../../typings/utils';
import type { DeviceType } from '../types/models';

import { subDays } from 'date-fns/subDays';

const MIN_OS_MC = '2.12.0';
const OVERRIDE_LOCK_ENV_VAR = 'RESIN_OVERRIDE_LOCK';

export * as DeviceState from '../types/device-state';
export type { DeviceOverallStatus as OverallStatus } from '../types/device-overall-status';
export type { SupervisorStatus } from './device.supervisor-api.partial';

export type DeviceMetrics = Pick<
	Device,
	| 'memory_usage'
	| 'memory_total'
	| 'storage_block_device'
	| 'storage_usage'
	| 'storage_total'
	| 'cpu_usage'
	| 'cpu_temp'
	| 'cpu_id'
	| 'is_undervolted'
>;

const DEFAULT_DAYS_OF_REQUESTED_HISTORY = 7;

const getDeviceModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const {
		pine,
		request,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;
	const { apiUrl, deviceUrlsBase } = opts;
	/* eslint-disable @typescript-eslint/no-var-requires */
	const registerDevice = once(() =>
		(
			require('balena-register-device') as typeof import('balena-register-device')
		).getRegisterDevice({ request }),
	);

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');
	const hupActionHelper = once(
		() =>
			(
				require('../util/device-actions/os-update/utils') as typeof import('../util/device-actions/os-update/utils')
			).hupActionHelper,
	);
	const dateUtils = once(
		() => require('../util/date') as typeof import('../util/date'),
	);

	const batchDeviceOperation = once(() =>
		(
			require('../util/request-batching') as typeof import('../util/request-batching')
		).batchResourceOperationFactory<Device>({
			getAll,
			NotFoundError: errors.BalenaDeviceNotFound,
			AmbiguousResourceError: errors.BalenaAmbiguousDevice,
			chunkSize: opts.requestBatchingChunkSize,
		}),
	);

	const getOsUpdateHelper = once(async () => {
		const $deviceUrlsBase = await getDeviceUrlsBase();
		const { getOsUpdateHelper: _getOsUpdateHelper } =
			require('../util/device-actions/os-update') as typeof import('../util/device-actions/os-update');
		return _getOsUpdateHelper($deviceUrlsBase, request);
	});
	/* eslint-enable @typescript-eslint/no-var-requires */

	const tagsModel = buildDependentResource<DeviceTag>(
		{ pine },
		{
			resourceName: 'device_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'device',
			async getResourceId(uuidOrId): Promise<number> {
				if (typeof uuidOrId !== 'string' && typeof uuidOrId !== 'number') {
					throw new Error(
						`Unexpected type for uuidOrId provided in device tagsModel getResourceId: ${typeof uuidOrId}`,
					);
				}
				const { id } = await exports.get(uuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const configVarModel = buildDependentResource<DeviceVariable>(
		{ pine },
		{
			resourceName: 'device_config_variable',
			resourceKeyField: 'name',
			parentResourceName: 'device',
			async getResourceId(uuidOrId): Promise<number> {
				if (typeof uuidOrId !== 'string' && typeof uuidOrId !== 'number') {
					throw new Error(
						`Unexpected type for uuidOrId provided in device configVarModel getResourceId: ${typeof uuidOrId}`,
					);
				}
				const { id } = await exports.get(uuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const envVarModel = buildDependentResource<DeviceVariable>(
		{ pine },
		{
			resourceName: 'device_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'device',
			async getResourceId(uuidOrId): Promise<number> {
				if (typeof uuidOrId !== 'string' && typeof uuidOrId !== 'number') {
					throw new Error(
						`Unexpected type for uuidOrId provided in device envVarModel getResourceId: ${typeof uuidOrId}`,
					);
				}
				const { id } = await exports.get(uuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	// Infer dashboardUrl from apiUrl if former is undefined
	const dashboardUrl = opts.dashboardUrl ?? apiUrl!.replace(/api/, 'dashboard');

	const getDeviceUrlsBase = once(async function () {
		if (deviceUrlsBase != null) {
			return deviceUrlsBase;
		}
		return (await sdkInstance.models.config.getAll()).deviceUrlsBase;
	});

	// Internal method for uuid/id disambiguation
	// Note that this throws an exception for missing uuids, but not missing ids
	const getId = async (uuidOrId: string | number) => {
		if (isId(uuidOrId)) {
			return uuidOrId;
		} else {
			const { id } = await exports.get(uuidOrId, { $select: 'id' });
			return id;
		}
	};

	const getAppliedConfigVariableValue = async (
		uuidOrId: string | number,
		name: string,
	) => {
		const options = {
			$expand: {
				device_config_variable: {
					$select: 'value',
					$filter: {
						name,
					},
				},
				belongs_to__application: {
					$select: 'id',
					$expand: {
						application_config_variable: {
							$select: 'value',
							$filter: {
								name,
							},
						},
					},
				},
			},
		} as const;

		const {
			device_config_variable: [deviceConfig],
			belongs_to__application: [
				{
					application_config_variable: [appConfig],
				},
			],
		} = (await exports.get(uuidOrId, options)) as PineTypedResult<
			Device,
			typeof options
		>;
		return (deviceConfig ?? appConfig)?.value;
	};

	const set = async (
		uuidOrIdOrArray: string | string[] | number | number[],
		body: SubmitBody<Device>,
	): Promise<void> => {
		await batchDeviceOperation()({
			uuidOrIdOrArray,
			fn: async (devices) => {
				await pine.patch<Device>({
					resource: 'device',
					options: {
						$filter: {
							id: { $in: devices.map((d) => d.id) },
						},
					},
					body,
				});
			},
		});
	};

	const historyTimeRangeFilterWithGuard = (
		fromDate?: Date,
		toDate?: Date,
	): PineFilter<DeviceHistory> => {
		let fromDateFilter;
		let toDateFilter;
		if (fromDate != null) {
			if (!(fromDate instanceof Date)) {
				throw new errors.BalenaInvalidParameterError('fromDate', fromDate);
			}
			fromDateFilter = { $ge: fromDate };
		}

		if (toDate != null) {
			if (!(toDate instanceof Date)) {
				throw new errors.BalenaInvalidParameterError('toDate', toDate);
			}
			toDateFilter = { $le: toDate };
		}

		const timeRangeFilter =
			fromDateFilter || toDateFilter
				? { created_at: { ...fromDateFilter, ...toDateFilter } }
				: {};
		return timeRangeFilter;
	};

	async function getAll(options?: PineOptions<Device>): Promise<Device[]> {
		if (options == null) {
			options = {};
		}

		const devices = await pine.get({
			resource: 'device',
			options: mergePineOptions({ $orderby: 'device_name asc' }, options),
		});
		return devices as Device[];
	}

	async function startOsUpdate(
		uuidOrUuids: string,
		targetOsVersion: string,
	): Promise<OsUpdateActionResult>;
	async function startOsUpdate(
		uuidOrUuids: string[],
		targetOsVersion: string,
	): Promise<Dictionary<OsUpdateActionResult>>;
	async function startOsUpdate(
		uuidOrUuids: string | string[],
		targetOsVersion: string,
	): Promise<OsUpdateActionResult | Dictionary<OsUpdateActionResult>> {
		if (!targetOsVersion) {
			throw new errors.BalenaInvalidParameterError(
				'targetOsVersion',
				targetOsVersion,
			);
		}

		const isDraft =
			(bSemver.parse(targetOsVersion)?.prerelease.length ?? 0) > 0;

		const getDeviceType = memoizee(
			async (deviceTypeId: number) =>
				await sdkInstance.models.deviceType.get(deviceTypeId, {
					$select: 'slug',
				}),
			{ primitive: true, promise: true },
		);
		const getAvailableOsVersions = memoizee(
			async (slug: string, includeDraft: boolean) =>
				await sdkInstance.models.os.getAvailableOsVersions(slug, {
					includeDraft,
				}),
			{ primitive: true, promise: true },
		);

		const osUpdateHelper = await getOsUpdateHelper();
		const results: Dictionary<
			ResolvableReturnType<typeof osUpdateHelper.startOsUpdate>
		> = {};

		await batchDeviceOperation()({
			uuidOrIdOrArray: uuidOrUuids,
			options: {
				$select: [
					'uuid',
					'is_online',
					'os_version',
					'supervisor_version',
					'os_variant',
				],
			},
			groupByNavigationPoperty: 'is_of__device_type',
			fn: async (devices, deviceTypeId) => {
				const dt = await getDeviceType(deviceTypeId);
				for (const device of devices) {
					// this will throw an error if the action isn't available
					exports._checkOsUpdateTarget(
						{
							...device,
							is_of__device_type: [dt],
						},
						targetOsVersion,
					);

					const osVersions = await getAvailableOsVersions(dt.slug, isDraft);

					if (
						!osVersions.some(
							(v) => bSemver.compare(v.raw_version, targetOsVersion) === 0,
						)
					) {
						throw new errors.BalenaInvalidParameterError(
							'targetOsVersion',
							targetOsVersion,
						);
					}
				}
				await limitedMap(devices, async (device) => {
					results[device.uuid] = await osUpdateHelper.startOsUpdate(
						device.uuid,
						targetOsVersion,
					);
				});
			},
		});
		if (Array.isArray(uuidOrUuids)) {
			return results;
		}
		return results[uuidOrUuids];
	}

	const exports = {
		_getId: getId,
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
		getDashboardUrl(uuid: string): string {
			if (typeof uuid !== 'string' || uuid.length === 0) {
				throw new Error('The uuid option should be a non empty string');
			}

			return url.resolve(dashboardUrl, `/devices/${uuid}/summary`);
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
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - devices
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getAllByApplication('myorganization/myapp').then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByApplication(123).then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByApplication('myorganization/myapp', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
		 * 	console.log(device);
		 * })
		 */
		async getAllByApplication(
			slugOrUuidOrId: string | number,
			options?: PineOptions<Device>,
		): Promise<Device[]> {
			if (options == null) {
				options = {};
			}

			const { id } = await sdkInstance.models.application.get(slugOrUuidOrId, {
				$select: 'id',
			});
			return await getAll(
				mergePineOptions({ $filter: { belongs_to__application: id } }, options),
			);
		},

		/**
		 * @summary Get all devices by organization
		 * @name getAllByOrganization
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
		 * @param {String|Number} handleOrId - organization handle (string) or id (number).
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - devices
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getAllByOrganization('myorganization').then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByOrganization(123).then(function(devices) {
		 * 	console.log(devices);
		 * });
		 *
		 * @example
		 * balena.models.device.getAllByOrganization('myorganization', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
		 * 	console.log(device);
		 * })
		 */
		async getAllByOrganization(
			handleOrId: string | number,
			options?: PineOptions<Device>,
		): Promise<Device[]> {
			if (options == null) {
				options = {};
			}

			const { id } = await sdkInstance.models.organization.get(handleOrId, {
				$select: 'id',
			});
			return await getAll(
				mergePineOptions(
					{
						$filter: {
							belongs_to__application: {
								$any: {
									$alias: 'bta',
									$expr: {
										bta: {
											organization: id,
										},
									},
								},
							},
						},
					},
					options,
				),
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
		 */
		async get(
			uuidOrId: string | number,
			options?: PineOptions<Device>,
		): Promise<Device> {
			if (options == null) {
				options = {};
			}

			if (uuidOrId == null) {
				throw new errors.BalenaDeviceNotFound(uuidOrId);
			}

			let device;
			const isPotentiallyFullUuid = isFullUuid(uuidOrId);
			if (isPotentiallyFullUuid || isId(uuidOrId)) {
				device = await pine.get({
					resource: 'device',
					id: isPotentiallyFullUuid ? { uuid: uuidOrId } : uuidOrId,
					options,
				});
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
				if (devices.length > 1) {
					throw new errors.BalenaAmbiguousDevice(uuidOrId);
				}
				device = devices[0];
			}
			if (device == null) {
				throw new errors.BalenaDeviceNotFound(uuidOrId);
			}
			return device as Device;
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
		 */
		async getWithServiceDetails(
			uuidOrId: string | number,
			options?: PineOptions<Device>,
		): Promise<DeviceWithServiceDetails<CurrentServiceWithCommit>> {
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
		 */
		async getByName(
			name: string,
			options?: PineOptions<Device>,
		): Promise<Device[]> {
			if (options == null) {
				options = {};
			}

			const devices = await getAll(
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
		 */
		getName: async (uuidOrId: string | number): Promise<string> => {
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
		 */
		getApplicationName: async (uuidOrId: string | number): Promise<string> => {
			const deviceOptions = {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'app_name' } },
			} as const;

			const device = (await exports.get(
				uuidOrId,
				deviceOptions,
			)) as PineTypedResult<Device, typeof deviceOptions>;
			return device.belongs_to__application[0].app_name;
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
		 */
		has: async (uuidOrId: string | number): Promise<boolean> => {
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
		 */
		isOnline: async (uuidOrId: string | number): Promise<boolean> => {
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
		 */
		getLocalIPAddresses: async (
			uuidOrId: string | number,
		): Promise<string[]> => {
			const { is_online, ip_address } = await exports.get(uuidOrId, {
				$select: ['is_online', 'ip_address'],
			});
			if (!is_online) {
				throw new Error(`The device is offline: ${uuidOrId}`);
			}
			return (ip_address ?? '').split(' ');
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
		 */
		getMACAddresses: async (uuidOrId: string | number): Promise<string[]> => {
			const { mac_address } = await exports.get(uuidOrId, {
				$select: ['mac_address'],
			});
			if (mac_address == null) {
				return [];
			}
			return mac_address.split(' ');
		},

		/**
		 * @summary Get the metrics related information for a device
		 * @name getMetrics
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @fulfil {Object} - device metrics
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getMetrics('7cf02a6').then(function(deviceMetrics) {
		 * 	console.log(deviceMetrics);
		 * });
		 *
		 * @example
		 * balena.models.device.getMetrics(123).then(function(deviceMetrics) {
		 * 	console.log(deviceMetrics);
		 * });
		 */
		getMetrics: async (uuidOrId: string | number): Promise<DeviceMetrics> => {
			const device = await exports.get(uuidOrId, {
				$select: [
					'memory_usage',
					'memory_total',
					'storage_block_device',
					'storage_usage',
					'storage_total',
					'cpu_usage',
					'cpu_temp',
					'cpu_id',
					'is_undervolted',
				],
			});
			// TODO: Drop the manual __metadata removal once we bump to the v7 model.
			// @ts-expect-error __metadata isn't in the pine client typings
			delete device.__metadata;
			return device;
		},

		/**
		 * @summary Remove device
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.remove('7cf02a6');
		 *
		 * @example
		 * balena.models.device.remove(123);
		 */
		remove: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await batchDeviceOperation()({
				uuidOrIdOrArray,
				fn: async (devices) => {
					await pine.delete({
						resource: 'device',
						options: {
							$filter: {
								id: { $in: devices.map((d) => d.id) },
							},
						},
					});
				},
			});
		},

		/**
		 * @summary Deactivate device
		 * @name deactivate
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.deactivate('7cf02a6');
		 *
		 * @example
		 * balena.models.device.deactivate(123);
		 */
		deactivate: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await set(uuidOrIdOrArray, {
				is_active: false,
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
		 */
		rename: async (
			uuidOrId: string | number,
			newName: string,
		): Promise<void> => {
			await set(uuidOrId, {
				device_name: newName,
			});
		},

		/**
		 * @summary Note a device
		 * @name setNote
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @param {String} note - the note
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.setNote('7cf02a6', 'My useful note');
		 *
		 * @example
		 * balena.models.device.setNote(123, 'My useful note');
		 */
		setNote: async (
			uuidOrIdOrArray: string | string[] | number | number[],
			note: string,
		): Promise<void> => {
			await set(uuidOrIdOrArray, { note });
		},

		/**
		 * @summary Set a custom location for a device
		 * @name setCustomLocation
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @param {Object} location - the location ({ latitude: 123, longitude: 456 })
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
		 *
		 * @example
		 * balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
		 */
		setCustomLocation: async (
			uuidOrIdOrArray: string | string[] | number | number[],
			location: { latitude: string | number; longitude: string | number },
		): Promise<void> => {
			await set(uuidOrIdOrArray, {
				custom_latitude: String(location.latitude),
				custom_longitude: String(location.longitude),
			});
		},

		/**
		 * @summary Clear the custom location of a device
		 * @name unsetCustomLocation
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.unsetCustomLocation('7cf02a6');
		 *
		 * @example
		 * balena.models.device.unsetCustomLocation(123);
		 */
		unsetCustomLocation: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await exports.setCustomLocation(uuidOrIdOrArray, {
				latitude: '',
				longitude: '',
			});
		},

		/**
		 * @summary Move a device to another application
		 * @name move
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @param {String|Number} applicationSlugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.move('7cf02a6', 'myorganization/myapp');
		 *
		 * @example
		 * balena.models.device.move(123, 'myorganization/myapp');
		 *
		 * @example
		 * balena.models.device.move(123, 456);
		 */
		move: async (
			uuidOrIdOrArray: string | string[] | number | number[],
			applicationSlugOrUuidOrId: string | number,
		): Promise<void> => {
			const applicationOptions = {
				$select: 'id',
				$expand: {
					is_for__device_type: {
						$select: 'is_of__cpu_architecture',
						$expand: {
							is_of__cpu_architecture: {
								$select: 'slug',
							},
						},
					},
				},
			} as const;
			const application = (await sdkInstance.models.application.get(
				applicationSlugOrUuidOrId,
				applicationOptions,
			)) as PineTypedResult<Application, typeof applicationOptions>;
			const appCpuArchSlug =
				application.is_for__device_type[0].is_of__cpu_architecture[0].slug;

			const deviceOptions = {
				$select: 'is_of__device_type',
				$expand: {
					is_of__device_type: {
						$select: 'is_of__cpu_architecture',
						$expand: {
							is_of__cpu_architecture: {
								$select: 'slug',
							},
						},
					},
				},
			} as const;
			await batchDeviceOperation()({
				uuidOrIdOrArray,
				options: deviceOptions,
				groupByNavigationPoperty: 'belongs_to__application',
				fn: async (devices) => {
					for (const device of devices) {
						const isCompatibleMove =
							sdkInstance.models.os.isArchitectureCompatibleWith(
								device.is_of__device_type[0].is_of__cpu_architecture[0].slug,
								appCpuArchSlug,
							);
						if (!isCompatibleMove) {
							throw new errors.BalenaInvalidDeviceType(
								`Incompatible application: ${applicationSlugOrUuidOrId}`,
							);
						}
					}

					await pine.patch<Device>({
						resource: 'device',
						options: {
							$filter: {
								id: { $in: devices.map((d) => d.id) },
							},
						},
						body: {
							belongs_to__application: application.id,
						},
					});
				},
			});
		},

		...getSupervisorApiHelper(deps, opts),

		/**
		 * @summary Get the target supervisor state on a device
		 * @name getSupervisorTargetState
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Number} version - (optional) target state version (2 or 3), default to 2
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
		 * balena.models.device.getSupervisorTargetState(123, 3).then(function(state) {
		 * 	console.log(state);
		 * });
		 */
		getSupervisorTargetState: async (
			uuidOrId: string | number,
			version: 2 | 3 = 2,
		): Promise<DeviceState.DeviceState> => {
			const { uuid } = await exports.get(uuidOrId, { $select: 'uuid' });
			const { body } = await request.send({
				url: `/device/v${version}/${uuid}/state`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Get the target supervisor state on a "generic" device on a fleet
		 * @name getSupervisorTargetStateForApp
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|Number} uuidOrId - fleet uuid (string) or id (number)
		 * @param {String} release - (optional) release uuid (default tracked)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.getSupervisorTargetStateForApp('7cf02a6').then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 * @example
		 * balena.models.device.getSupervisorTargetStateForApp(123).then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 * @example
		 * balena.models.device.getSupervisorTargetStateForApp(123, '7cf02a6').then(function(state) {
		 * 	console.log(state);
		 * });
		 *
		 */
		getSupervisorTargetStateForApp: async (
			slugOrUuidOrId: string | number,
			release?: string | number,
		): Promise<DeviceState.DeviceStateV3> => {
			const { uuid } = await sdkInstance.models.application.get(
				slugOrUuidOrId,
				{
					$select: 'uuid',
				},
			);
			const { body } = await request.send({
				url: `/device/v3/fleet/${uuid}/state/?releaseUuid=${release ?? ''}`,
				baseUrl: apiUrl,
			});
			return body;
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
		generateUniqueKey(): string {
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
		 * @param {String|Number} applicationSlugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {String} uuid - device uuid
		 * @param {String} [deviceTypeSlug] - device type slug (string) or alias (string)
		 *
		 * @fulfil {Object} Device registration info ({ id: "...", uuid: "...", api_key: "..." })
		 * @returns {Promise}
		 *
		 * @example
		 * var uuid = balena.models.device.generateUniqueKey();
		 * balena.models.device.register('myorganization/myapp', uuid).then(function(registrationInfo) {
		 * 	console.log(registrationInfo);
		 * });
		 *
		 * @example
		 * var uuid = balena.models.device.generateUniqueKey();
		 * balena.models.device.register('myorganization/myapp', uuid, 'raspberry-pi').then(function(registrationInfo) {
		 * 	console.log(registrationInfo);
		 * });
		 *
		 * @example
		 * var uuid = balena.models.device.generateUniqueKey();
		 * balena.models.device.register(123, uuid).then(function(registrationInfo) {
		 * 	console.log(registrationInfo);
		 * });
		 */
		async register(
			applicationSlugOrUuidOrId: string | number,
			uuid: string,
			deviceTypeSlug?: string,
		): Promise<{
			id: number;
			uuid: string;
			api_key: string;
		}> {
			const deviceTypeOptions = {
				$select: 'slug',
				$expand: {
					is_of__cpu_architecture: {
						$select: 'slug',
					},
				},
			} as const;

			const applicationOptions = {
				$select: 'id',
				$expand: { is_for__device_type: deviceTypeOptions },
			} as const;

			const [{ id: userId }, apiKey, application, deviceType] =
				await Promise.all([
					sdkInstance.auth.getUserInfo(),
					sdkInstance.models.application.generateProvisioningKey(
						applicationSlugOrUuidOrId,
					),
					sdkInstance.models.application.get(
						applicationSlugOrUuidOrId,
						applicationOptions,
					) as Promise<PineTypedResult<Application, typeof applicationOptions>>,
					typeof deviceTypeSlug === 'string'
						? (sdkInstance.models.deviceType.get(deviceTypeSlug, {
								$select: 'slug',
								$expand: {
									is_of__cpu_architecture: {
										$select: 'slug',
									},
								},
							}) as Promise<
								PineTypedResult<DeviceType, typeof deviceTypeOptions>
							>)
						: null,
				]);
			if (deviceType != null) {
				const isCompatibleParameter =
					sdkInstance.models.os.isArchitectureCompatibleWith(
						deviceType.is_of__cpu_architecture[0].slug,
						application.is_for__device_type[0].is_of__cpu_architecture[0].slug,
					);
				if (!isCompatibleParameter) {
					throw new errors.BalenaInvalidDeviceType(
						`Incompatible device type: ${deviceTypeSlug}`,
					);
				}
			}

			return await registerDevice().register({
				userId,
				applicationId: application.id,
				uuid,
				deviceType: (deviceType ?? application.is_for__device_type[0]).slug,
				provisioningApiKey: apiKey,
				apiEndpoint: apiUrl!,
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
		 * @param {String} [keyName] - Device key name
		 * @param {String} [keyDescription] - Description for device key
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
		 */
		generateDeviceKey: async (
			uuidOrId: string | number,
			keyName?: string,
			keyDescription?: string,
			keyExpiryDate?: string,
		): Promise<string> => {
			try {
				const deviceId = await getId(uuidOrId);
				const { body } = await request.send({
					method: 'POST',
					url: `/api-key/device/${deviceId}/device-key`,
					baseUrl: apiUrl,
					body: {
						name: keyName,
						description: keyDescription,
						expiryDate: keyExpiryDate,
					},
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
		 */
		hasDeviceUrl: async (uuidOrId: string | number): Promise<boolean> => {
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
		 */
		getDeviceUrl: async (uuidOrId: string | number): Promise<string> => {
			const { is_web_accessible, uuid } = await exports.get(uuidOrId, {
				$select: ['is_web_accessible', 'uuid'],
			});
			if (!is_web_accessible) {
				throw new Error(`Device is not web accessible: ${uuidOrId}`);
			}
			const $deviceUrlsBase = await getDeviceUrlsBase();
			return `https://${uuid}.${$deviceUrlsBase}`;
		},

		/**
		 * @summary Enable device url for a device
		 * @name enableDeviceUrl
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.enableDeviceUrl('7cf02a6');
		 *
		 * @example
		 * balena.models.device.enableDeviceUrl(123);
		 */
		enableDeviceUrl: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await set(uuidOrIdOrArray, {
				is_web_accessible: true,
			});
		},

		/**
		 * @summary Disable device url for a device
		 * @name disableDeviceUrl
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.disableDeviceUrl('7cf02a6');
		 *
		 * @example
		 * balena.models.device.disableDeviceUrl(123);
		 */
		disableDeviceUrl: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await set(uuidOrIdOrArray, {
				is_web_accessible: false,
			});
		},

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
		 */
		async enableLocalMode(uuidOrId: string | number): Promise<void> {
			const selectedProps: Array<SelectableProps<Device>> = [
				'id',
				...LOCAL_MODE_SUPPORT_PROPERTIES,
			];
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
		 */
		disableLocalMode: (uuidOrId: string | number): Promise<void> =>
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
		 */
		isInLocalMode: async (uuidOrId: string | number): Promise<boolean> => {
			const value = await exports.configVar.get(uuidOrId, LOCAL_MODE_ENV_VAR);
			return value === '1';
		},

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
		getLocalModeSupport,

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
		 */
		enableLockOverride: (uuidOrId: string | number): Promise<void> =>
			configVarModel.set(uuidOrId, OVERRIDE_LOCK_ENV_VAR, '1'),

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
		 */
		disableLockOverride: (uuidOrId: string | number): Promise<void> =>
			configVarModel.set(uuidOrId, OVERRIDE_LOCK_ENV_VAR, '0'),

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
		 */
		hasLockOverride: async (uuidOrId: string | number): Promise<boolean> => {
			return (
				(await getAppliedConfigVariableValue(
					uuidOrId,
					OVERRIDE_LOCK_ENV_VAR,
				)) === '1'
			);
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
		 */
		async getStatus(uuidOrId: string | number): Promise<string> {
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
		 */
		async getProgress(uuidOrId: string | number): Promise<number | null> {
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
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
		 */
		async grantSupportAccess(
			uuidOrIdOrArray: string | string[] | number | number[],
			expiryTimestamp: number,
		): Promise<void> {
			if (expiryTimestamp == null || expiryTimestamp <= Date.now()) {
				throw new errors.BalenaInvalidParameterError(
					'expiryTimestamp',
					expiryTimestamp,
				);
			}

			await set(uuidOrIdOrArray, {
				// @ts-expect-error a number is valid to set but it will always be returned as an ISO string so the typings specify string rather than string | number
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
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.revokeSupportAccess('7cf02a6');
		 *
		 * @example
		 * balena.models.device.revokeSupportAccess(123);
		 */
		revokeSupportAccess: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await set(uuidOrIdOrArray, {
				is_accessible_by_support_until__date: null,
			});
		},

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
		lastOnline(
			device: AtLeast<Device, 'last_connectivity_event' | 'is_online'>,
		): string {
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
		getOsVersion: (
			device: AtLeast<Device, 'os_variant' | 'os_version'>,
		): string => getDeviceOsSemverWithVariant(device)!,

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
		 */
		isTrackingApplicationRelease: async (
			uuidOrId: string | number,
		): Promise<boolean> => {
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
		getTargetReleaseHash: async (
			uuidOrId: string | number,
		): Promise<string | undefined> => {
			const deviceOptions = {
				$select: 'id',
				$expand: {
					should_be_running__release: {
						$select: 'commit',
					},
					belongs_to__application: {
						$select: 'id',
						$expand: { should_be_running__release: { $select: 'commit' } },
					},
				},
			} as const;

			const { should_be_running__release, belongs_to__application } =
				(await exports.get(uuidOrId, deviceOptions)) as PineTypedResult<
					Device,
					typeof deviceOptions
				>;
			if (should_be_running__release.length > 0) {
				return should_be_running__release[0]!.commit;
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
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
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
		 */
		pinToRelease: async (
			uuidOrIdOrArray: string | string[] | number | number[],
			fullReleaseHashOrId: string | number,
		): Promise<void> => {
			const getRelease = memoizee(
				async (appId: number) => {
					const releaseFilterProperty = isId(fullReleaseHashOrId)
						? 'id'
						: 'commit';
					return await sdkInstance.models.release.get(fullReleaseHashOrId, {
						$top: 1,
						$select: 'id',
						$filter: {
							[releaseFilterProperty]: fullReleaseHashOrId,
							status: 'success',
							belongs_to__application: appId,
						},
						$orderby: 'created_at desc',
					});
				},
				{ primitive: true, promise: true },
			);
			await batchDeviceOperation()({
				uuidOrIdOrArray,
				groupByNavigationPoperty: 'belongs_to__application',
				fn: async (devices, appId) => {
					const release = await getRelease(appId);
					await pine.patch<Device>({
						resource: 'device',
						options: {
							$filter: {
								id: { $in: devices.map((d) => d.id) },
							},
						},
						body: {
							should_be_running__release: release.id,
						},
					});
				},
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
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.device.trackApplicationRelease('7cf02a6').then(function() {
		 * 	...
		 * });
		 */
		trackApplicationRelease: async (
			uuidOrIdOrArray: string | string[] | number | number[],
		): Promise<void> => {
			await set(uuidOrIdOrArray, {
				should_be_running__release: null,
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
		 * @param {String|String[]|Number|Number[]} uuidOrIdOrArray - device uuid (string) or id (number) or array of full uuids or ids
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
		 */
		setSupervisorRelease: async (
			uuidOrIdOrArray: string | string[] | number | number[],
			supervisorVersionOrId: string | number,
		): Promise<void> => {
			const releaseFilterProperty = isId(supervisorVersionOrId)
				? 'id'
				: 'supervisor_version';
			const getRelease = memoizee(
				async (deviceTypeSlug: string) => {
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
												slug: deviceTypeSlug,
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
					return supervisorRelease;
				},
				{ primitive: true, promise: true },
			);
			await batchDeviceOperation()({
				uuidOrIdOrArray,
				options: {
					$select: ['id', 'supervisor_version', 'os_version'],
					$expand: { is_of__device_type: { $select: 'slug' } },
				},
				fn: async (devices) => {
					devices.forEach((device) => {
						ensureVersionCompatibility(
							device.supervisor_version,
							MIN_SUPERVISOR_MC_API,
							'supervisor',
						);
						ensureVersionCompatibility(device.os_version, MIN_OS_MC, 'host OS');
					});
					const devicesByDeviceType = groupBy(
						devices,
						(device) => device.is_of__device_type[0].slug,
					);
					await Promise.all(
						Object.entries(devicesByDeviceType).map(
							async ([dt, devicesOfType]) => {
								const release = await getRelease(dt);
								await pine.patch<Device>({
									resource: 'device',
									options: {
										$filter: {
											id: { $in: devicesOfType.map((d) => d.id) },
										},
									},
									body: {
										should_be_managed_by__supervisor_release: release.id,
									},
								});
							},
						),
					);
				},
			});
		},

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
			{
				uuid,
				is_of__device_type,
				is_online,
				os_version,
				os_variant,
			}: Pick<Device, 'uuid' | 'is_online' | 'os_version' | 'os_variant'> & {
				is_of__device_type: [Pick<DeviceType, 'slug'>];
			},
			targetOsVersion: string,
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

			const currentOsVersion =
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

		/**
		 * @summary Start an OS update on a device
		 * @name startOsUpdate
		 * @public
		 * @function
		 * @memberof balena.models.device
		 *
		 * @param {String|String[]} uuidOrUuids - full device uuid or array of full uuids
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
		 */
		startOsUpdate,

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
		 */
		getOsUpdateStatus: async (uuid: string): Promise<OsUpdateActionResult> => {
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
		tags: {
			/**
			 * @summary Get all device tags for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.tags
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 */
			async getAllByApplication(
				slugOrUuidOrId: string | number,
				options?: PineOptions<DeviceTag>,
			): Promise<DeviceTag[]> {
				if (options == null) {
					options = {};
				}
				const { id } = await sdkInstance.models.application.get(
					slugOrUuidOrId,
					{
						$select: 'id',
					},
				);
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
			 */
			getAllByDevice: tagsModel.getAllByParent,

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
			 */
			remove: tagsModel.remove,
		},

		/**
		 * @namespace balena.models.device.configVar
		 * @memberof balena.models.device
		 */
		configVar: {
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
			 */
			getAllByDevice: configVarModel.getAllByParent,

			/**
			 * @summary Get all device config variables by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.configVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device config variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.configVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			async getAllByApplication(
				slugOrUuidOrId: string | number,
				options?: PineOptions<DeviceVariable>,
			): Promise<DeviceVariable[]> {
				if (options == null) {
					options = {};
				}

				const { id } = await sdkInstance.models.application.get(
					slugOrUuidOrId,
					{
						$select: 'id',
					},
				);
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
			 */
			remove: configVarModel.remove,
		},

		/**
		 * @namespace balena.models.device.envVar
		 * @memberof balena.models.device
		 */
		envVar: {
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
			 */
			getAllByDevice: envVarModel.getAllByParent,

			/**
			 * @summary Get all device environment variables by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.envVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - device environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.envVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			async getAllByApplication(
				slugOrUuidOrId: string | number,
				options?: PineOptions<DeviceVariable>,
			): Promise<DeviceVariable[]> {
				if (options == null) {
					options = {};
				}

				const { id } = await sdkInstance.models.application.get(
					slugOrUuidOrId,
					{
						$select: 'id',
					},
				);
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
			 */
			remove: envVarModel.remove,
		},

		/**
		 * @namespace balena.models.device.serviceVar
		 * @memberof balena.models.device
		 */
		serviceVar: {
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
			 */
			async getAllByDevice(
				uuidOrId: string | number,
				options?: PineOptions<DeviceServiceEnvironmentVariable>,
			): Promise<DeviceServiceEnvironmentVariable[]> {
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
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			async getAllByApplication(
				slugOrUuidOrId: string | number,
				options?: PineOptions<DeviceServiceEnvironmentVariable>,
			): Promise<DeviceServiceEnvironmentVariable[]> {
				if (options == null) {
					options = {};
				}

				const { id } = await sdkInstance.models.application.get(
					slugOrUuidOrId,
					{
						$select: 'id',
					},
				);
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
			 * @param {String|Number} serviceNameOrId - service name (string) or id (number)
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
			 * balena.models.device.serviceVar.get('7cf02a6', 'myservice', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 */
			async get(
				uuidOrId: string | number,
				serviceNameOrId: string | number,
				key: string,
			): Promise<string | undefined> {
				const { id: deviceId } = await exports.get(uuidOrId, { $select: 'id' });
				const [variable] = await pine.get({
					resource: 'device_service_environment_variable',
					options: {
						$select: 'value',
						$filter: {
							service_install: {
								$any: {
									$alias: 'si',
									$expr: {
										si: {
											device: deviceId,
											installs__service:
												typeof serviceNameOrId === 'number'
													? serviceNameOrId
													: {
															$any: {
																$alias: 'is',
																$expr: {
																	is: {
																		service_name: serviceNameOrId,
																	},
																},
															},
														},
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
			 * @param {String|Number} serviceNameOrId - service name (string) or id (number)
			 * @param {String} key - variable name
			 * @param {String} value - variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override').then(function() {
			 * 	...
			 * });
			 *
			 *
			 * @example
			 * balena.models.device.serviceVar.set('7cf02a6', 'myservice', 'VAR', 'override').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
			 * 	...
			 * });
			 */
			async set(
				uuidOrId: string | number,
				serviceNameOrId: string | number,
				key: string,
				value: string,
			): Promise<void> {
				value = String(value);

				let deviceFilter;
				if (isId(uuidOrId)) {
					deviceFilter = uuidOrId;
				} else if (isFullUuid(uuidOrId)) {
					deviceFilter = {
						$any: {
							$alias: 'd',
							$expr: {
								d: {
									uuid: uuidOrId,
								},
							},
						},
					};
				} else {
					const device = await exports.get(uuidOrId, { $select: 'id' });
					deviceFilter = device.id;
				}

				const serviceInstalls = await pine.get({
					resource: 'service_install',
					options: {
						$select: 'id',
						$filter: {
							device: deviceFilter,
							installs__service:
								typeof serviceNameOrId === 'number'
									? serviceNameOrId
									: {
											$any: {
												$alias: 's',
												$expr: {
													s: {
														service_name: serviceNameOrId,
													},
												},
											},
										},
						},
					},
				});

				const [serviceInstall] = serviceInstalls;
				if (serviceInstall == null) {
					throw new errors.BalenaServiceNotFound(serviceNameOrId);
				}

				if (serviceInstalls.length > 1) {
					throw new errors.BalenaAmbiguousDevice(uuidOrId);
				}

				await pine.upsert<DeviceServiceEnvironmentVariable>({
					resource: 'device_service_environment_variable',
					id: {
						service_install: serviceInstall.id,
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
			 * @param {String|Number} serviceNameOrId - service name (string) or id (number)
			 * @param {String} key - variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.remove('7cf02a6', 'myservice', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
			 * 	...
			 * });
			 */
			async remove(
				uuidOrId: string | number,
				serviceNameOrId: string | number,
				key: string,
			): Promise<void> {
				const { id: deviceId } = await exports.get(uuidOrId, { $select: 'id' });
				await pine.delete({
					resource: 'device_service_environment_variable',
					options: {
						$filter: {
							service_install: {
								$any: {
									$alias: 'si',
									$expr: {
										si: {
											device: deviceId,
											installs__service:
												typeof serviceNameOrId === 'number'
													? serviceNameOrId
													: {
															$any: {
																$alias: 'is',
																$expr: {
																	is: {
																		service_name: serviceNameOrId,
																	},
																},
															},
														},
										},
									},
								},
							},
							name: key,
						},
					},
				});
			},
		},

		/**
		 * @namespace balena.models.device.history
		 * @memberof balena.models.device
		 */
		history: {
			/**
			 * @summary Get all history entries for a device
			 * @name getAllByDevice
			 * @public
			 * @function
			 * @memberof balena.models.device.history
			 *
			 * @param {String|Number} uuidOrId - device uuid (32 / 62 digits string) or id (number)
			 * @param {Object} [options] - options
			 * @param {Date} [options.fromDate=subDays(new Date(), 7)] - history entries older or equal to this date - default now() - 7 days
			 * @param {Date} [options.toDate] - history entries younger or equal to this date
			 * @fulfil {Object[]} - device history
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.history.getAllByDevice('7cf02a687b74206f92cb455969cf8e98').then(function(entries) {
			 * 	console.log(entries);
			 * });
			 *
			 * @example
			 * balena.models.device.history.getAllByDevice(999999).then(function(entries) {
			 * 	console.log(entries);
			 * });
			 *
			 *
			 * @example
			 * // get all device history entries between now - 20 days and now - 10 days
			 * balena.models.device.history.getAllByDevice(999999, { fromDate: subDays(new Date(), 20), toDate: subDays(new Date(), 10)})
			 */
			async getAllByDevice(
				uuidOrId: string | number,
				{
					fromDate = subDays(new Date(), DEFAULT_DAYS_OF_REQUESTED_HISTORY),
					toDate,
					...options
				}: PineOptions<DeviceHistory> & { fromDate?: Date; toDate?: Date } = {},
			): Promise<DeviceHistory[]> {
				let $filter: PineFilter<DeviceHistory> =
					historyTimeRangeFilterWithGuard(fromDate, toDate);

				if (isId(uuidOrId)) {
					$filter = { ...$filter, tracks__device: uuidOrId };
				} else if (isFullUuid(uuidOrId)) {
					$filter = {
						...$filter,
						uuid: uuidOrId,
					};
				} else {
					throw new errors.BalenaInvalidParameterError('uuidOrId', uuidOrId);
				}

				return await pine.get<DeviceHistory>({
					resource: 'device_history',
					options: mergePineOptions(
						{
							$filter,
						},
						options,
					),
				});
			},

			/**
			 * @summary Get all device history entries by application with time frame
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.device.history
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options] - options
			 * @param {Date} [options.fromDate=subDays(new Date(), 7)] - history entries older or equal to this date - default now() - 7 days
			 * @param {Date} [options.toDate] - history entries younger or equal to this date
			 * @fulfil {Object[]} - device history
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.device.history.getAllByApplication('myorganization/myapp').then(function(entries) {
			 * 	console.log(entries);
			 * });
			 *
			 * @example
			 * balena.models.device.history.getAllByApplication(999999).then(function(entries) {
			 * 	console.log(entries);
			 * });
			 *
			 *  @example
			 * // get all device history entries between now - 20 days and now - 10 days
			 * balena.models.device.history.getAllByApplication(999999, { fromDate: subDays(new Date(), 20), toDate: subDays(new Date(), 10)})
			 *
			 */
			async getAllByApplication(
				slugOrUuidOrId: string | number,
				{
					fromDate = subDays(new Date(), DEFAULT_DAYS_OF_REQUESTED_HISTORY),
					toDate,
					...options
				}: PineOptions<DeviceHistory> & { fromDate?: Date; toDate?: Date } = {},
			): Promise<DeviceHistory[]> {
				const { id: applicationId } = await sdkInstance.models.application.get(
					slugOrUuidOrId,
					{
						$select: 'id',
					},
				);

				return await pine.get<DeviceHistory>({
					resource: 'device_history',
					options: mergePineOptions(
						{
							$filter: {
								...historyTimeRangeFilterWithGuard(fromDate, toDate),
								belongs_to__application: applicationId,
							},
						},
						options,
					),
				});
			},
		},
	};

	return exports;
};

export { getDeviceModel as default };
