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
	InjectedDependenciesParam,
	InjectedOptionsParam,
	Application,
} from '..';
import type {
	CurrentServiceWithCommit,
	DeviceWithServiceDetails,
} from '../util/device-service-details';

import * as url from 'url';

import once from 'lodash/once';
import * as errors from 'balena-errors';

import { isId, mergePineOptions, withSupervisorLockedError } from '../util';

import {
	getCurrentServiceDetailsPineExpand,
	generateCurrentServiceDetails,
} from '../util/device-service-details';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';
import type { PickDeferred } from '@balena/abstract-sql-to-typescript';

const getApplicationModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const {
		request,
		pine,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;
	const { apiUrl } = opts;

	/* eslint-disable @typescript-eslint/no-require-imports */
	const membershipModel = (
		require('./application-membership') as typeof import('./application-membership')
	).default(deps, (...args: Parameters<typeof exports.get>) =>
		exports.get(...args),
	);

	const inviteModel = (
		require('./application-invite') as typeof import('./application-invite')
	).default(deps, opts, (...args: Parameters<typeof exports.get>) =>
		exports.get(...args),
	);

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');

	const batchApplicationOperation = once(() =>
		(
			require('../util/request-batching') as typeof import('../util/request-batching')
		).batchResourceOperationFactory<Application['Read']>({
			getAll: exports.getAll,
			NotFoundError: errors.BalenaApplicationNotFound,
			AmbiguousResourceError: errors.BalenaAmbiguousApplication,
			chunkSize: opts.requestBatchingChunkSize,
		}),
	);
	/* eslint-enable @typescript-eslint/no-require-imports */

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'application_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'application',
			async getResourceId(slugOrUuidOrId): Promise<number> {
				if (
					typeof slugOrUuidOrId !== 'string' &&
					typeof slugOrUuidOrId !== 'number'
				) {
					throw new Error(
						`Unexpected type for slugOrUuidOrId provided in application tagsModel getResourceId: ${typeof slugOrUuidOrId}`,
					);
				}
				const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const configVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'application_config_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			async getResourceId(slugOrUuidOrId): Promise<number> {
				if (
					typeof slugOrUuidOrId !== 'string' &&
					typeof slugOrUuidOrId !== 'number'
				) {
					throw new Error(
						`Unexpected type for slugOrUuidOrId provided in application configVarModel getResourceId: ${typeof slugOrUuidOrId}`,
					);
				}
				const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
				return id;
			},
		},
	);
	const envVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'application_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			async getResourceId(slugOrUuidOrId): Promise<number> {
				if (
					typeof slugOrUuidOrId !== 'string' &&
					typeof slugOrUuidOrId !== 'number'
				) {
					throw new Error(
						`Unexpected type for slugOrUuidOrId provided in application envVarModel getResourceId: ${typeof slugOrUuidOrId}`,
					);
				}
				const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	const buildVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'build_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			async getResourceId(slugOrUuidOrId): Promise<number> {
				if (
					typeof slugOrUuidOrId !== 'string' &&
					typeof slugOrUuidOrId !== 'number'
				) {
					throw new Error(
						`Unexpected type for slugOrUuidOrId provided in application buildVarModel getResourceId: ${typeof slugOrUuidOrId}`,
					);
				}
				const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
				return id;
			},
		},
	);

	// Infer dashboardUrl from apiUrl if former is undefined
	const dashboardUrl = opts.dashboardUrl ?? apiUrl.replace(/api/, 'dashboard');

	// Internal method for name/id disambiguation
	// Note that this throws an exception for missing names, but not missing ids
	const getId = async (slugOrUuidOrId: string | number) => {
		if (isId(slugOrUuidOrId)) {
			return slugOrUuidOrId;
		} else {
			const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
			return id;
		}
	};

	const isDirectlyAccessibleByUserFilter = {
		is_directly_accessible_by__user: {
			$any: {
				$alias: 'dau',
				$expr: {
					1: 1,
				},
			},
		},
	};

	const exports = {
		_getId: getId,

		/**
		 * @summary Get Dashboard URL for a specific application
		 * @function getDashboardUrl
		 * @memberof balena.models.application
		 *
		 * @param {Number} id - Application id
		 *
		 * @returns {String} - Dashboard URL for the specific application
		 * @throws Exception if the id is not a finite number
		 *
		 * @example
		 * balena.models.application.get('myorganization/myapp').then(function(application) {
		 * 	const dashboardApplicationUrl = balena.models.application.getDashboardUrl(application.id);
		 * 	console.log(dashboardApplicationUrl);
		 * });
		 */
		getDashboardUrl(id: number): string {
			if (typeof id !== 'number' || !Number.isFinite(id)) {
				throw new Error('The id option should be a finite number');
			}

			return url.resolve(dashboardUrl, `/apps/${id}`);
		},

		/**
		 * @summary Get all applications
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @param {String} [context] - extra access filters, undefined or 'directly_accessible'
		 * @fulfil {Object[]} - applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAll().then(function(applications) {
		 * 	console.log(applications);
		 * });
		 */
		async getAll(
			options?: ODataOptionsWithoutCount<Application['Read']>,
			context?: 'directly_accessible',
		): Promise<Array<Application['Read']>> {
			const apps = await pine.get({
				resource: 'application',
				options: mergePineOptions(
					{
						...(context === 'directly_accessible' && {
							$filter: isDirectlyAccessibleByUserFilter,
						}),
						$orderby: { app_name: 'asc' },
					},
					options ?? {},
				),
			});
			return apps;
		},

		/**
		 * @summary Get all applications directly accessible by the user
		 * @name getAllDirectlyAccessible
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAllDirectlyAccessible().then(function(applications) {
		 * 	console.log(applications);
		 * });
		 */
		async getAllDirectlyAccessible(
			options?: ODataOptionsWithoutCount<Application['Read']>,
		): Promise<Array<Application['Read']>> {
			return await exports.getAll(options, 'directly_accessible');
		},

		/**
		 * @summary Get all applications of an organization
		 * @name getAllByOrganization
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number|String} orgHandleOrId - organization handle (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAllByOrganization().then(function(applications) {
		 * 	console.log(applications);
		 * });
		 */
		async getAllByOrganization(
			orgHandleOrId: number | string,
			options?: ODataOptionsWithoutCount<Application['Read']>,
		): Promise<Array<Application['Read']>> {
			const { id: orgId } = await sdkInstance.models.organization.get(
				orgHandleOrId,
				{
					$select: 'id',
				},
			);
			const apps = await pine.get({
				resource: 'application',
				options: mergePineOptions(
					{
						$filter: {
							organization: orgId,
						},
						$orderby: { app_name: 'asc' },
					},
					options ?? {},
				),
			});
			return apps;
		},

		/**
		 * @summary Get a single application
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @param {String} [context] - extra access filters, undefined or 'directly_accessible'
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.get('myorganization/myapp').then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.get('1bf99a68cf9e4266986e6dec7a6e8f46').then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.get(123).then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		async get(
			slugOrUuidOrId: string | number,
			options?: ODataOptionsWithoutCount<Application['Read']>,
			context?: 'directly_accessible',
		): Promise<Application['Read']> {
			options ??= {};

			const accessFilter =
				context === 'directly_accessible'
					? isDirectlyAccessibleByUserFilter
					: null;

			let application;
			if (isId(slugOrUuidOrId)) {
				application = await pine.get({
					resource: 'application',
					id: slugOrUuidOrId,
					options: mergePineOptions(
						accessFilter != null ? { $filter: accessFilter } : {},
						options,
					),
				});
			} else if (typeof slugOrUuidOrId === 'string') {
				const lowerCaseSlugOrUuid = slugOrUuidOrId.toLowerCase();
				const applications = await pine.get({
					resource: 'application',
					options: mergePineOptions(
						{
							$filter: {
								...accessFilter,
								$or: {
									slug: lowerCaseSlugOrUuid,
									uuid: lowerCaseSlugOrUuid,
								},
							},
						},
						options,
					),
				});
				if (applications.length > 1) {
					throw new errors.BalenaAmbiguousApplication(slugOrUuidOrId);
				}
				application = applications[0];
			}
			if (application == null) {
				throw new errors.BalenaApplicationNotFound(slugOrUuidOrId);
			}
			return application;
		},

		/**
		 * @summary Get a single application directly accessible by the user
		 * @name getDirectlyAccessible
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getDirectlyAccessible('myorganization/myapp').then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.getDirectlyAccessible(123).then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		async getDirectlyAccessible(
			slugOrUuidOrId: string | number,
			options?: ODataOptionsWithoutCount<Application['Read']>,
		): Promise<Application['Read']> {
			return await exports.get(slugOrUuidOrId, options, 'directly_accessible');
		},

		/**
		 * @summary Get a single application and its devices, along with each device's
		 * associated services' essential details
		 * @name getWithDeviceServiceDetails
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description
		 * This method does not map exactly to the underlying model: it runs a
		 * larger prebuilt query, and reformats it into an easy to use and
		 * understand format. If you want more control, or to see the raw model
		 * directly, use `application.get(uuidOrId, options)` instead.
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails('myorganization/myapp').then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
		 * 	console.log(device);
		 * })
		 */
		async getWithDeviceServiceDetails(
			slugOrUuidOrId: string | number,
			options?: ODataOptionsWithoutCount<Application['Read']>,
		): Promise<
			Application['Read'] & {
				owns__device: Array<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
			}
		> {
			options ??= {};
			const serviceOptions = mergePineOptions(
				{
					$expand: [
						{
							owns__device: {
								$expand: getCurrentServiceDetailsPineExpand(true),
							},
						},
					],
				},
				options,
			);

			const app = (await exports.get(
				slugOrUuidOrId,
				serviceOptions,
			)) as Application['Read'] & {
				owns__device: Array<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
			};
			if (app.owns__device) {
				app.owns__device = app.owns__device.map((d) =>
					generateCurrentServiceDetails<CurrentServiceWithCommit>(d),
				);
			}
			return app;
		},

		/**
		 * @summary Get a single application using the appname and the handle of the owning organization
		 * @name getAppByName
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String} appName - application name
		 * @param {Object} [options={}] - extra pine options to use
		 * @param {String} [context] - extra access filters, undefined or 'directly_accessible'
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAppByName('MyApp').then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		async getAppByName(
			appName: string,
			options?: ODataOptionsWithoutCount<Application['Read']>,
			context?: 'directly_accessible',
		): Promise<Application['Read']> {
			options ??= {};

			const accessFilter =
				context === 'directly_accessible'
					? isDirectlyAccessibleByUserFilter
					: null;

			const applications = await pine.get({
				resource: 'application',
				options: mergePineOptions(
					{
						$filter: {
							...accessFilter,
							app_name: appName,
						},
					},
					options,
				),
			});
			if (applications.length === 0) {
				throw new errors.BalenaApplicationNotFound(appName);
			}

			if (applications.length > 1) {
				throw new errors.BalenaAmbiguousApplication(appName);
			}
			const [application] = applications;
			return application;
		},

		/**
		 * @summary Check if an application exists
		 * @name has
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @fulfil {Boolean} - has application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.has('myorganization/myapp').then(function(hasApp) {
		 * 	console.log(hasApp);
		 * });
		 *
		 * @example
		 * balena.models.application.has(123).then(function(hasApp) {
		 * 	console.log(hasApp);
		 * });
		 */
		has: async (slugOrUuidOrId: string | number): Promise<boolean> => {
			try {
				await exports.get(slugOrUuidOrId, { $select: ['id'] });
				return true;
			} catch (err) {
				if (err instanceof errors.BalenaApplicationNotFound) {
					return false;
				}
				throw err;
			}
		},

		/**
		 * @summary Check if the user has access to any applications
		 * @name hasAny
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @fulfil {Boolean} - has any applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.hasAny().then(function(hasAny) {
		 * 	console.log('Has any?', hasAny);
		 * });
		 */
		hasAny: async (): Promise<boolean> => {
			const applications = await exports.getAll(
				{ $select: ['id'] },
				'directly_accessible',
			);
			return applications.length !== 0;
		},

		/**
		 * @summary Create an application
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} options - application creation parameters
		 * @param {String} options.name - application name
		 * @param {String} [options.uuid] - application uuid
		 * @param {String} [options.applicationClass] - application class: 'app' | 'fleet' | 'block'
		 * @param {String} options.deviceType - device type slug
		 * @param {(String|Number)} options.organization - handle (string) or id (number) of the organization that the application will belong to or null
		 *
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', deviceType: 'raspberry-pi' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.create({ name: 'My Block', applicationClass: 'block', deviceType: 'raspberry-pi' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		async create({
			name,
			uuid,
			applicationClass,
			deviceType,
			organization,
		}: {
			name: string;
			uuid?: string;
			applicationClass?: 'app' | 'fleet' | 'block';
			deviceType: string;
			organization: number | string;
		}): Promise<PickDeferred<Application['Read']>> {
			if (organization == null) {
				throw new errors.BalenaInvalidParameterError(
					'organization',
					organization,
				);
			}

			const deviceTypeIdPromise = (async () => {
				const dt = await sdkInstance.models.deviceType.get(deviceType, {
					$select: 'id',
				});
				return dt.id;
			})();

			const organizationPromise = pine
				.get({
					resource: 'organization',
					id: {
						[isId(organization) ? 'id' : 'handle']: organization,
					},
					options: {
						$select: ['id'],
					},
				})
				.then(function (org) {
					if (!org) {
						throw new errors.BalenaOrganizationNotFound(organization);
					}
					return org.id;
				});

			const [deviceTypeId, organizationId] = await Promise.all([
				deviceTypeIdPromise,
				organizationPromise,
			]);
			const body: Partial<Application['Write']> = {
				app_name: name,
				uuid,
				is_for__device_type: deviceTypeId,
			};

			if (organizationId) {
				body.organization = organizationId;
			}

			if (applicationClass) {
				body.is_of__class = applicationClass;
			}

			return await pine.post({
				resource: 'application',
				body,
			});
		},

		/**
		 * @summary Remove application
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number|Number[]} slugOrUuidOrIdOrIds - application slug (string), uuid (string) or id (number) or array of ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.remove('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.remove(123);
		 */
		remove: async (
			slugOrUuidOrIdOrIds: string | number | number[],
		): Promise<void> => {
			if (typeof slugOrUuidOrIdOrIds === 'string') {
				const applicationId = (
					await sdkInstance.models.application.get(slugOrUuidOrIdOrIds, {
						$select: 'id',
					})
				).id;
				await pine.delete({
					resource: 'application',
					id: applicationId,
				});
				return;
			}
			await batchApplicationOperation()({
				parameterName: 'slugOrUuidOrIdOrIds',
				uuidOrIdOrArray: slugOrUuidOrIdOrIds,
				fn: async (applications) => {
					await pine.delete({
						resource: 'application',
						options: {
							$filter: {
								id: { $in: applications.map((d) => d.id) },
							},
						},
					});
				},
			});
		},

		/**
		 * @summary Rename application
		 * @name rename
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {String} newName - new application name (string)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.rename('myorganization/myapp', 'MyRenamedApp');
		 *
		 * @example
		 * balena.models.application.rename(123, 'MyRenamedApp');
		 */
		rename: async (
			slugOrUuidOrId: string | number,
			newAppName: string,
		): Promise<void> => {
			const applicationId = (
				await sdkInstance.models.application.get(slugOrUuidOrId, {
					$select: 'id',
				})
			).id;
			await pine.patch({
				resource: 'application',
				id: applicationId,
				body: {
					app_name: newAppName,
				},
			});
		},

		/**
		 * @summary Restart application
		 * @name restart
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.restart('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.restart(123);
		 */
		restart: (slugOrUuidOrId: string | number): Promise<void> =>
			withSupervisorLockedError(async () => {
				const applicationId = (
					await sdkInstance.models.application.get(slugOrUuidOrId, {
						$select: 'id',
					})
				).id;

				await request.send({
					method: 'POST',
					url: `/application/${applicationId}/restart`,
					baseUrl: apiUrl,
				});
			}),

		/**
		 * @summary Generate a device provisioning key for a specific application
		 * @name generateProvisioningKey
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} generateProvisioningKeyParams - an object containing the parameters for the provisioning key generation
		 * @param {String|Number} generateProvisioningKeyParams.slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {String} generateProvisioningKeyParams.keyExpiryDate - Expiry Date for provisioning key
		 * @param {String} [generateProvisioningKeyParams.keyName] - Provisioning key name
		 * @param {String} [generateProvisioningKeyParams.keyDescription] - Description for provisioning key
		 * @fulfil {String} - device provisioning key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey({slugOrUuidOrId: 'myorganization/myapp', keyExpiryDate: '2030-10-12'}).then(function(key) {
		 * 	console.log(key);
		 * });
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey({slugOrUuidOrId: 123, keyExpiryDate: '2030-10-12'}).then(function(key) {
		 * 	console.log(key);
		 * });
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey({slugOrUuidOrId: 123, keyExpiryDate: '2030-10-12', keyName: 'api key name', keyDescription: 'api key long description'}).then(function(key) {
		 * 	console.log(key);
		 * });
		 */
		generateProvisioningKey: async ({
			slugOrUuidOrId,
			keyExpiryDate,
			keyName,
			keyDescription,
		}: {
			slugOrUuidOrId: string | number;
			keyExpiryDate: string | null;
			keyName?: string;
			keyDescription?: string;
		}): Promise<string> => {
			const applicationId = (
				await sdkInstance.models.application.get(slugOrUuidOrId, {
					$select: 'id',
				})
			).id;
			const { body } = await request.send({
				method: 'POST',
				url: '/api-key/v2/',
				baseUrl: apiUrl,
				body: {
					actorType: 'application',
					actorTypeId: applicationId,
					roles: ['provisioning-api-key'],
					name: keyName,
					description: keyDescription,
					expiryDate: keyExpiryDate,
				},
			});
			return body;
		},

		/**
		 * @summary Purge devices by application id
		 * @name purge
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number} appId - application id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.purge(123);
		 */
		purge: (appId: number): Promise<void> =>
			withSupervisorLockedError(async () => {
				await request.send({
					method: 'POST',
					url: '/supervisor/v1/purge',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							appId: `${appId}`,
						},
					},
				});
			}),

		/**
		 * @summary Shutdown devices by application id
		 * @name shutdown
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number} appId - application id
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.shutdown(123);
		 */
		shutdown: (appId: number, options?: { force?: boolean }): Promise<void> =>
			withSupervisorLockedError(async () => {
				options ??= {};

				await request.send({
					method: 'POST',
					url: '/supervisor/v1/shutdown',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							force: Boolean(options.force),
						},
					},
				});
			}),

		/**
		 * @summary Reboot devices by application id
		 * @name reboot
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Number} appId - application id
		 * @param {Object} [options] - options
		 * @param {Boolean} [options.force=false] - override update lock
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.reboot(123);
		 */
		reboot: (appId: number, options?: { force?: boolean }): Promise<void> =>
			withSupervisorLockedError(async () => {
				options ??= {};

				await request.send({
					method: 'POST',
					url: '/supervisor/v1/reboot',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							force: Boolean(options.force),
						},
					},
				});
			}),

		/**
		 * @summary Get whether the application is configured to receive updates whenever a new release is available
		 * @name willTrackNewReleases
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @fulfil {Boolean} - is tracking the latest release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases('myorganization/myapp').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases(123).then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		willTrackNewReleases: async (
			slugOrUuidOrId: string | number,
		): Promise<boolean> => {
			const { should_track_latest_release } = await exports.get(
				slugOrUuidOrId,
				{
					$select: 'should_track_latest_release',
				},
			);
			return should_track_latest_release;
		},

		/**
		 * @summary Get whether the application is up to date and is tracking the latest finalized release for updates
		 * @name isTrackingLatestRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @fulfil {Boolean} - is tracking the latest release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease('myorganization/myapp').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease(123).then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		isTrackingLatestRelease: async (
			slugOrUuidOrId: string | number,
		): Promise<boolean> => {
			const appOptions = {
				$select: 'should_track_latest_release',
				$expand: {
					should_be_running__release: { $select: 'id' },
					owns__release: {
						$select: 'id',
						$top: 1,
						$filter: {
							is_final: true,
							is_passing_tests: true,
							is_invalidated: false,
							status: 'success',
						},
						$orderby: { created_at: 'desc' },
					},
				},
			} as const;

			const application = (await exports.get(
				slugOrUuidOrId,
				appOptions,
			)) as NonNullable<
				OptionsToResponse<
					Application['Read'],
					typeof appOptions,
					typeof slugOrUuidOrId
				>
			>;
			const trackedRelease = application.should_be_running__release[0];
			const latestRelease = application.owns__release[0];
			return (
				application.should_track_latest_release &&
				(!latestRelease || trackedRelease?.id === latestRelease.id)
			);
		},

		/**
		 * @summary Set a specific application to run a particular release
		 * @name pinToRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description Configures the application to run a particular release
		 * and not get updated when the latest release changes.
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {String} fullReleaseHash - the hash of a successful release (string)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.pinToRelease('myorganization/myapp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 */
		pinToRelease: async (
			slugOrUuidOrId: string | number,
			fullReleaseHash: string,
		): Promise<void> => {
			const applicationId = await getId(slugOrUuidOrId);
			const release = await sdkInstance.models.release.get(fullReleaseHash, {
				$select: 'id',
				$top: 1,
				$filter: {
					belongs_to__application: applicationId,
					status: 'success',
				},
			});
			await pine.patch({
				resource: 'application',
				id: applicationId,
				body: {
					should_be_running__release: release.id,
					should_track_latest_release: false,
				},
			});
		},

		/**
		 * @summary Get the hash of the current release for a specific application
		 * @name getTargetReleaseHash
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @fulfil {String|undefined} - The release hash of the current release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash('myorganization/myapp').then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash(123).then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash('myorganization/myapp', function(release) {
		 * 	console.log(release);
		 * });
		 */
		getTargetReleaseHash: async (
			slugOrUuidOrId: string | number,
		): Promise<string | undefined> => {
			const appOptions = {
				$select: 'id',
				$expand: { should_be_running__release: { $select: 'commit' } },
			} as const;

			const application = (await exports.get(
				slugOrUuidOrId,
				appOptions,
			)) as NonNullable<
				OptionsToResponse<
					Application['Read'],
					typeof appOptions,
					typeof slugOrUuidOrId
				>
			>;
			return application.should_be_running__release[0]?.commit;
		},

		/**
		 * @summary Configure a specific application to track the latest finalized available release
		 * @name trackLatestRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description The application's current release will be updated with each new successfully built release.
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.trackLatestRelease('myorganization/myapp').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.trackLatestRelease(123).then(function() {
		 * 	...
		 * });
		 */
		trackLatestRelease: async (
			slugOrUuidOrId: string | number,
		): Promise<void> => {
			const appOptions = {
				$select: 'id',
				$expand: {
					owns__release: {
						$select: 'id',
						$top: 1,
						$filter: {
							is_final: true,
							is_passing_tests: true,
							is_invalidated: false,
							status: 'success',
						},
						$orderby: { created_at: 'desc' },
					},
				},
			} as const;

			const application = await exports.get(slugOrUuidOrId, appOptions);
			const body: Partial<Application['Write']> = {
				should_track_latest_release: true,
			};
			const latestRelease = application.owns__release?.[0];
			if (latestRelease) {
				body.should_be_running__release = latestRelease.id;
			}
			await pine.patch({
				resource: 'application',
				id: application.id,
				body,
			});
		},

		/**
		 * @summary Enable device urls for all devices that belong to an application
		 * @name enableDeviceUrls
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.enableDeviceUrls('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.enableDeviceUrls(123);
		 */
		enableDeviceUrls: async (
			slugOrUuidOrId: string | number,
		): Promise<void> => {
			const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
			await pine.patch({
				resource: 'device',
				body: {
					is_web_accessible: true,
				},
				options: {
					$filter: {
						belongs_to__application: id,
					},
				},
			});
		},

		/**
		 * @summary Disable device urls for all devices that belong to an application
		 * @name disableDeviceUrls
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.disableDeviceUrls('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.disableDeviceUrls(123);
		 */
		disableDeviceUrls: async (
			slugOrUuidOrId: string | number,
		): Promise<void> => {
			const { id } = await exports.get(slugOrUuidOrId, { $select: 'id' });
			await pine.patch({
				resource: 'device',
				body: {
					is_web_accessible: false,
				},
				options: {
					$filter: {
						belongs_to__application: id,
					},
				},
			});
		},

		/**
		 * @summary Grant support access to an application until a specified time
		 * @name grantSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.grantSupportAccess('myorganization/myapp', Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
		 */
		async grantSupportAccess(
			slugOrUuidOrId: string | number,
			expiryTimestamp: number,
		): Promise<void> {
			if (expiryTimestamp == null || expiryTimestamp <= Date.now()) {
				throw new errors.BalenaInvalidParameterError(
					'expiryTimestamp',
					expiryTimestamp,
				);
			}

			const applicationId = (
				await sdkInstance.models.application.get(slugOrUuidOrId, {
					$select: 'id',
				})
			).id;
			await pine.patch({
				resource: 'application',
				id: applicationId,
				body: { is_accessible_by_support_until__date: expiryTimestamp },
			});
		},

		/**
		 * @summary Revoke support access to an application
		 * @name revokeSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess('myorganization/myapp');
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess(123);
		 */
		revokeSupportAccess: async (
			slugOrUuidOrId: string | number,
		): Promise<void> => {
			const applicationId = (
				await sdkInstance.models.application.get(slugOrUuidOrId, {
					$select: 'id',
				})
			).id;
			await pine.patch({
				resource: 'application',
				id: applicationId,
				body: { is_accessible_by_support_until__date: null },
			});
		},

		/**
		 * @namespace balena.models.application.tags
		 * @memberof balena.models.application
		 */
		tags: {
			/**
			 * @summary Get all application tags for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 */
			getAllByApplication: tagsModel.getAllByParent,

			/**
			 * @summary Set an application tag
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @param {String|undefined} value - tag value
			 *
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.application.tags.set(123, 'EDITOR', 'vim');
			 */
			set: tagsModel.set,

			/**
			 * @summary Remove an application tag
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.remove('myorganization/myapp', 'EDITOR');
			 */
			remove: tagsModel.remove,
		},

		/**
		 * @namespace balena.models.application.configVar
		 * @memberof balena.models.application
		 */
		configVar: {
			/**
			 * @summary Get all config variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application config variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			getAllByApplication: configVarModel.getAllByParent,

			/**
			 * @summary Get the value of a specific config variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - config variable name
			 * @fulfil {String|undefined} - the config variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.get('myorganization/myapp', 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 */
			get: configVarModel.get,

			/**
			 * @summary Set the value of a specific config variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - config variable name
			 * @param {String} value - config variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.set('myorganization/myapp', 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 */
			set: configVarModel.set,

			/**
			 * @summary Clear the value of a specific config variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - config variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.remove('myorganization/myapp', 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 */
			remove: configVarModel.remove,
		},

		/**
		 * @namespace balena.models.application.envVar
		 * @memberof balena.models.application
		 */
		envVar: {
			/**
			 * @summary Get all environment variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			getAllByApplication: envVarModel.getAllByParent,

			/**
			 * @summary Get the value of a specific environment variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - environment variable name
			 * @fulfil {String|undefined} - the environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.get('myorganization/myapp', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 */
			get: envVarModel.get,

			/**
			 * @summary Set the value of a specific environment variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - environment variable name
			 * @param {String} value - environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.set('myorganization/myapp', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 */
			set: envVarModel.set,

			/**
			 * @summary Clear the value of a specific environment variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.remove('myorganization/myapp', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 */
			remove: envVarModel.remove,
		},

		/**
		 * @namespace balena.models.application.buildVar
		 * @memberof balena.models.application
		 */
		buildVar: {
			/**
			 * @summary Get all build environment variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application build environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			getAllByApplication: buildVarModel.getAllByParent,

			/**
			 * @summary Get the value of a specific build environment variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @fulfil {String|undefined} - the build environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.get('myorganization/myapp', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 */
			get: buildVarModel.get,

			/**
			 * @summary Set the value of a specific build environment variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @param {String} value - build environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.set('myorganization/myapp', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 */
			set: buildVarModel.set,

			/**
			 * @summary Clear the value of a specific build environment variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.remove('myorganization/myapp', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 */
			remove: buildVarModel.remove,
		},

		/**
		 * @namespace balena.models.application.membership
		 * @memberof balena.models.application
		 */
		membership: membershipModel,

		/**
		 * @namespace balena.models.application.invite
		 * @memberof balena.models.application
		 */
		invite: inviteModel,
	};

	return exports;
};

export { getApplicationModel as default };
