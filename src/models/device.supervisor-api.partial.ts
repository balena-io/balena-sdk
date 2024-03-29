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
import type {
	InjectedOptionsParam,
	InjectedDependenciesParam,
	PineTypedResult,
	PineOptions,
} from '..';
import type { Device } from '../types/models';

import {
	isNotFoundResponse,
	treatAsMissingDevice,
	withSupervisorLockedError,
} from '../util';

import { ensureVersionCompatibility } from '../util/device-os-version';

// The min version where /apps API endpoints are implemented is 1.8.0 but we'll
// be accepting >= 1.8.0-alpha.0 instead. This is a workaround for a published 1.8.0-p1
// prerelease supervisor version, which precedes 1.8.0 but comes after 1.8.0-alpha.0
// according to semver.
export const MIN_SUPERVISOR_APPS_API = '1.8.0-alpha.0';

export const MIN_SUPERVISOR_MC_API = '7.0.0';

// Degraded network, slow devices, compressed docker binaries and any combination of these factors
// can cause proxied device requests to surpass the default timeout (currently 30s). This was
// noticed during tests and the endpoints that resulted in container management actions were
// affected in particular.
export const CONTAINER_ACTION_ENDPOINT_TIMEOUT = 50000;

export interface SupervisorStatus {
	api_port: string;
	ip_address: string;
	os_version: string;
	supervisor_version: string;
	update_pending: boolean;
	update_failed: boolean;
	update_downloaded: boolean;
	status?: string | null;
	commit?: string | null;
	download_progress?: string | null;
}

export const getSupervisorApiHelper = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const {
		request,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;
	const { apiUrl } = opts;

	const getId = (uuidOrId: string | number) =>
		sdkInstance.models.device._getId(uuidOrId);

	const exports = {
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
		 */
		ping: async (uuidOrId: string | number): Promise<void> => {
			const deviceOptions = {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			} as const;

			const device = (await sdkInstance.models.device.get(
				uuidOrId,
				deviceOptions,
			)) as PineTypedResult<Device, typeof deviceOptions>;
			await request.send({
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
		 */
		getApplicationInfo: async (
			uuidOrId: string | number,
		): Promise<{
			appId: string;
			commit: string;
			containerId: string;
			env: { [key: string]: string | number };
			imageId: string;
		}> => {
			const deviceOptions = {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			} satisfies PineOptions<Device>;

			const device = (await sdkInstance.models.device.get(
				uuidOrId,
				deviceOptions,
			)) as PineTypedResult<Device, typeof deviceOptions>;
			ensureVersionCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_APPS_API,
				'supervisor',
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
		 */
		identify: async (uuidOrId: string | number): Promise<void> => {
			const device = await sdkInstance.models.device.get(uuidOrId, {
				$select: 'uuid',
			});
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
		 */
		restartApplication: (uuidOrId: string | number): Promise<void> =>
			withSupervisorLockedError(async () => {
				try {
					const deviceOptions = {
						$select: ['id', 'supervisor_version'],
						$expand: { belongs_to__application: { $select: 'id' } },
					} satisfies PineOptions<Device>;
					const device = (await sdkInstance.models.device.get(
						uuidOrId,
						deviceOptions,
					)) as PineTypedResult<Device, typeof deviceOptions>;
					// TODO: Drop this once we drop support for ResinOS v2.11.0.
					if (
						!bSemver.valid(device.supervisor_version) ||
						bSemver.lt(device.supervisor_version, '7.0.0')
					) {
						return (
							await request.send({
								method: 'POST',
								url: `/device/${device.id}/restart`,
								baseUrl: apiUrl,
								timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
							})
						).body;
					}

					const appId = device.belongs_to__application[0].id;
					const { body } = await request.send({
						method: 'POST',
						url: `/supervisor/v1/restart`,
						baseUrl: apiUrl,
						body: {
							deviceId: device.id,
							appId,
							data: {
								appId,
							},
						},
						timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT,
					});
					return body;
				} catch (err) {
					if (isNotFoundResponse(err)) {
						treatAsMissingDevice(uuidOrId, err);
					}
					throw err;
				}
			}),

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
		 */
		startApplication: async (uuidOrId: string | number): Promise<void> => {
			const deviceOptions = {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			} satisfies PineOptions<Device>;
			const device = (await sdkInstance.models.device.get(
				uuidOrId,
				deviceOptions,
			)) as PineTypedResult<Device, typeof deviceOptions>;
			ensureVersionCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_APPS_API,
				'supervisor',
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
		 */
		stopApplication: (uuidOrId: string | number): Promise<void> =>
			withSupervisorLockedError(async () => {
				const deviceOptions = {
					$select: ['id', 'supervisor_version'],
					$expand: { belongs_to__application: { $select: 'id' } },
				} satisfies PineOptions<Device>;
				const device = (await sdkInstance.models.device.get(
					uuidOrId,
					deviceOptions,
				)) as PineTypedResult<Device, typeof deviceOptions>;
				ensureVersionCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_APPS_API,
					'supervisor',
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
			}),

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
		 */
		reboot: (
			uuidOrId: string | number,
			options?: { force?: boolean },
		): Promise<void> =>
			withSupervisorLockedError(async () => {
				if (options == null) {
					options = {};
				}

				try {
					const deviceId = await getId(uuidOrId);
					const { body } = await request.send({
						method: 'POST',
						url: '/supervisor/v1/reboot',
						baseUrl: apiUrl,
						body: {
							deviceId,
							data: {
								force: Boolean(options?.force),
							},
						},
					});
					return body;
				} catch (err) {
					if (isNotFoundResponse(err)) {
						treatAsMissingDevice(uuidOrId, err);
					}
					throw err;
				}
			}),

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
		 */
		shutdown: (
			uuidOrId: string | number,
			options: { force?: boolean },
		): Promise<void> =>
			withSupervisorLockedError(async () => {
				if (options == null) {
					options = {};
				}

				const deviceOptions = {
					$select: 'id',
					$expand: { belongs_to__application: { $select: 'id' } },
				} as const;

				const device = (await sdkInstance.models.device.get(
					uuidOrId,
					deviceOptions,
				)) as PineTypedResult<Device, typeof deviceOptions>;
				await request.send({
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
				});
			}),

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
		 */
		purge: (uuidOrId: string | number): Promise<void> =>
			withSupervisorLockedError(async () => {
				const deviceOptions = {
					$select: 'id',
					$expand: { belongs_to__application: { $select: 'id' } },
				} as const;
				const device = (await sdkInstance.models.device.get(
					uuidOrId,
					deviceOptions,
				)) as PineTypedResult<Device, typeof deviceOptions>;
				await request.send({
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
				});
			}),

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
		 */
		async update(
			uuidOrId: string | number,
			options: { force?: boolean },
		): Promise<void> {
			if (options == null) {
				options = {};
			}

			const deviceOptions = {
				$select: 'id',
				$expand: { belongs_to__application: { $select: 'id' } },
			} as const;

			const device = (await sdkInstance.models.device.get(
				uuidOrId,
				deviceOptions,
			)) as PineTypedResult<Device, typeof deviceOptions>;
			await request.send({
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
		 */
		getSupervisorState: async (
			uuidOrId: string | number,
		): Promise<SupervisorStatus> => {
			const { uuid } = await sdkInstance.models.device.get(uuidOrId, {
				$select: 'uuid',
			});
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
		 */
		startService: async (
			uuidOrId: string | number,
			imageId: number,
		): Promise<void> => {
			const deviceOptions = {
				$select: ['id', 'supervisor_version'],
				$expand: { belongs_to__application: { $select: 'id' } },
			} satisfies PineOptions<Device>;
			const device = (await sdkInstance.models.device.get(
				uuidOrId,
				deviceOptions,
			)) as PineTypedResult<Device, typeof deviceOptions>;
			ensureVersionCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API,
				'supervisor',
			);
			const appId = device.belongs_to__application[0].id;
			await request.send({
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
		 */
		stopService: (uuidOrId: string | number, imageId: number): Promise<void> =>
			withSupervisorLockedError(async () => {
				const deviceOptions = {
					$select: ['id', 'supervisor_version'],
					$expand: { belongs_to__application: { $select: 'id' } },
				} satisfies PineOptions<Device>;
				const device = (await sdkInstance.models.device.get(
					uuidOrId,
					deviceOptions,
				)) as PineTypedResult<Device, typeof deviceOptions>;
				ensureVersionCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_MC_API,
					'supervisor',
				);
				const appId = device.belongs_to__application[0].id;
				await request.send({
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
			}),

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
		 */
		restartService: (
			uuidOrId: string | number,
			imageId: number,
		): Promise<void> =>
			withSupervisorLockedError(async () => {
				const deviceOptions = {
					$select: ['id', 'supervisor_version'],
					$expand: { belongs_to__application: { $select: 'id' } },
				} satisfies PineOptions<Device>;
				const device = (await sdkInstance.models.device.get(
					uuidOrId,
					deviceOptions,
				)) as PineTypedResult<Device, typeof deviceOptions>;
				ensureVersionCompatibility(
					device.supervisor_version,
					MIN_SUPERVISOR_MC_API,
					'supervisor',
				);
				const appId = device.belongs_to__application[0].id;
				await request.send({
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
			}),
	};

	return exports;
};
