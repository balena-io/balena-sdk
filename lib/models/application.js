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

import * as Promise from 'bluebird';
const once = require('lodash/once');
import * as errors from 'balena-errors';

import {
	isId,
	isNoApplicationForKeyResponse,
	isNotFoundResponse,
	mergePineOptions,
	treatAsMissingApplication,
	LOCKED_STATUS_CODE,
} from '../util';

import { normalizeDeviceOsVersion } from '../util/device-os-version';
import {
	getCurrentServiceDetailsPineExpand,
	generateCurrentServiceDetails,
} from '../util/device-service-details';

const getApplicationModel = function (deps, opts) {
	const { request, pine } = deps;
	let { apiUrl, dashboardUrl } = opts;

	const deviceModel = once(() => require('./device').default(deps, opts));
	const releaseModel = once(() => require('./release').default(deps, opts));
	const inviteModel = require('./application-invite').default(
		deps,
		opts,
		(nameOrSlugOrId, options) => exports.get(nameOrSlugOrId, options),
	);

	const { addCallbackSupportToModule } = require('../util/callbacks');

	const { buildDependentResource } = require('../util/dependent-resource');

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'application_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'application',
			getResourceId(nameOrSlugOrId) {
				return exports.get(nameOrSlugOrId, { $select: 'id' }).get('id');
			},
		},
	);

	const configVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'application_config_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			getResourceId(nameOrSlugOrId) {
				return exports.get(nameOrSlugOrId, { $select: 'id' }).get('id');
			},
		},
	);
	const envVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'application_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			getResourceId(nameOrSlugOrId) {
				return exports.get(nameOrSlugOrId, { $select: 'id' }).get('id');
			},
		},
	);
	const buildVarModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'build_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'application',
			getResourceId(nameOrSlugOrId) {
				return exports.get(nameOrSlugOrId, { $select: 'id' }).get('id');
			},
		},
	);

	// Infer dashboardUrl from apiUrl if former is undefined
	if (dashboardUrl == null) {
		dashboardUrl = apiUrl.replace(/api/, 'dashboard');
	}

	// Internal method for name/id disambiguation
	// Note that this throws an exception for missing names, but not missing ids
	const getId = (nameOrSlugOrId) =>
		Promise.try(function () {
			if (isId(nameOrSlugOrId)) {
				return nameOrSlugOrId;
			} else {
				return exports.get(nameOrSlugOrId, { $select: 'id' }).get('id');
			}
		});

	const normalizeApplication = function (application) {
		if (Array.isArray(application.owns__device)) {
			application.owns__device.forEach((device) =>
				normalizeDeviceOsVersion(device),
			);
		}
		return application;
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
		 * balena.models.application.get('MyApp').then(function(application) {
		 * 	const dashboardApplicationUrl = balena.models.application.getDashboardUrl(application.id);
		 * 	console.log(dashboardApplicationUrl);
		 * });
		 */
		getDashboardUrl(id) {
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
		 * @fulfil {Object[]} - applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAll().then(function(applications) {
		 * 	console.log(applications);
		 * });
		 *
		 * @example
		 * balena.models.application.getAll(function(error, applications) {
		 * 	if (error) throw error;
		 * 	console.log(applications);
		 * });
		 */
		getAll(options) {
			if (options == null) {
				options = {};
			}

			return pine
				.get({
					resource: 'my_application',
					options: mergePineOptions({ $orderby: 'app_name asc' }, options),
				})
				.map(function (application) {
					normalizeApplication(application);
					return application;
				});
		},

		/**
		 * @summary Get applications and their devices, along with each device's
		 * associated services' essential details
		 * @name getAllWithDeviceServiceDetails
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description
		 * This method does not map exactly to the underlying model: it runs a
		 * larger prebuilt query, and reformats it into an easy to use and
		 * understand format. If you want more control, or to see the raw model
		 * directly, use `application.getAll(options)` instead.
		 * **NOTE:** In contrast with device.getWithServiceDetails() the service details
		 * in the result of this method do not include the associated commit.
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - applications
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAllWithDeviceServiceDetails().then(function(applications) {
		 * 	console.log(applications);
		 * })
		 *
		 * @example
		 * balena.models.application.getAllWithDeviceServiceDetails(function(error, applications) {
		 * 	if (error) throw error;
		 * 	console.log(applications);
		 * });
		 */
		getAllWithDeviceServiceDetails(options) {
			if (options == null) {
				options = {};
			}

			const serviceOptions = mergePineOptions(
				{
					$expand: [
						{
							owns__device: {
								$expand: getCurrentServiceDetailsPineExpand(false),
							},
						},
					],
				},
				options,
			);

			return exports.getAll(serviceOptions).then(function (apps) {
				apps.forEach((app) => {
					app.owns__device = app.owns__device.map(
						generateCurrentServiceDetails,
					);
				});
				return apps;
			});
		},

		/**
		 * @summary Get a single application
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.get('MyApp').then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.get(123).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.get('MyApp', function(error, application) {
		 * 	if (error) throw error;
		 * 	console.log(application);
		 * });
		 */
		get(nameOrSlugOrId, options) {
			if (options == null) {
				options = {};
			}

			return Promise.try(function () {
				if (nameOrSlugOrId == null) {
					throw new errors.BalenaApplicationNotFound(nameOrSlugOrId);
				}

				if (isId(nameOrSlugOrId)) {
					return pine
						.get({
							resource: 'application',
							id: nameOrSlugOrId,
							options: mergePineOptions({}, options),
						})
						.tap(function (application) {
							if (application == null) {
								throw new errors.BalenaApplicationNotFound(nameOrSlugOrId);
							}
						});
				} else {
					return pine
						.get({
							resource: 'application',
							options: mergePineOptions(
								{
									$filter: {
										$or: {
											app_name: nameOrSlugOrId,
											slug: nameOrSlugOrId.toLowerCase(),
										},
									},
								},
								options,
							),
						})
						.tap(function (applications) {
							if (applications.length === 0) {
								throw new errors.BalenaApplicationNotFound(nameOrSlugOrId);
							}

							if (applications.length > 1) {
								throw new errors.BalenaAmbiguousApplication(nameOrSlugOrId);
							}
						})
						.get(0);
				}
			}).tap(normalizeApplication);
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
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails('7cf02a6').then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
		 * 	console.log(device);
		 * })
		 *
		 * @example
		 * balena.models.application.getWithDeviceServiceDetails('7cf02a6', function(error, device) {
		 * 	if (error) throw error;
		 * 	console.log(device);
		 * });
		 */
		getWithDeviceServiceDetails(nameOrSlugOrId, options) {
			if (options == null) {
				options = {};
			}

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

			return exports.get(nameOrSlugOrId, serviceOptions).then(function (app) {
				if (app && app.owns__device) {
					app.owns__device = app.owns__device.map(
						generateCurrentServiceDetails,
					);
				}

				return app;
			});
		},

		/**
		 * @summary Get a single application using the appname and the handle of the owning organization
		 * @name getAppByOwner
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String} appName - application name
		 * @param {String} owner - The handle of the owning organization
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getAppByOwner('MyApp', 'MyOrg').then(function(application) {
		 * 	console.log(application);
		 * });
		 */
		getAppByOwner(appName, owner, options) {
			if (options == null) {
				options = {};
			}

			appName = appName.toLowerCase();
			owner = owner.toLowerCase();

			return pine
				.get({
					resource: 'application',
					options: mergePineOptions(
						{
							$filter: {
								slug: `${owner}/${appName}`,
							},
						},
						options,
					),
				})
				.tap(function (applications) {
					if (applications.length === 0) {
						throw new errors.BalenaApplicationNotFound(`${owner}/${appName}`);
					}
					if (applications.length > 1) {
						throw new errors.BalenaAmbiguousApplication(`${owner}/${appName}`);
					}
				})
				.get(0)
				.tap(normalizeApplication);
		},

		/**
		 * @summary Check if an application exists
		 * @name has
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {Boolean} - has application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.has('MyApp').then(function(hasApp) {
		 * 	console.log(hasApp);
		 * });
		 *
		 * @example
		 * balena.models.application.has(123).then(function(hasApp) {
		 * 	console.log(hasApp);
		 * });
		 *
		 * @example
		 * balena.models.application.has('MyApp', function(error, hasApp) {
		 * 	if (error) throw error;
		 * 	console.log(hasApp);
		 * });
		 */
		has: (nameOrSlugOrId) =>
			exports
				.get(nameOrSlugOrId, { $select: ['id'] })
				.return(true)
				.catch(errors.BalenaApplicationNotFound, () => false),

		/**
		 * @summary Check if the user has any applications
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
		 *
		 * @example
		 * balena.models.application.hasAny(function(error, hasAny) {
		 * 	if (error) throw error;
		 * 	console.log('Has any?', hasAny);
		 * });
		 */
		hasAny: () =>
			exports
				.getAll({ $select: ['id'] })
				.then((applications) => applications.length !== 0),

		/**
		 * @summary Create an application
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {Object} options - application creation parameters
		 * @param {String} options.name - application name
		 * @param {String} [options.applicationType] - application type slug e.g. microservices-starter
		 * @param {String} options.deviceType - device type slug
		 * @param {(Number|String)} [options.parent] - parent application name or id
		 * @param {(String|Number)} options.organization - handle (string) or id (number) of the organization that the application will belong to or null
		 *
		 * @fulfil {Object} - application
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', applicationType: 'essentials', deviceType: 'raspberry-pi' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', applicationType: 'microservices', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
		 * 	console.log(application);
		 * });
		 *
		 * @example
		 * balena.models.application.create({ name: 'My App', applicationType: 'microservices-starter', deviceType: 'raspberry-pi' }, function(error, application) {
		 * 	if (error) throw error;
		 * 	console.log(application);
		 * });
		 */
		create({ name, applicationType, deviceType, parent, organization }) {
			if (organization == null) {
				throw new errors.BalenaInvalidParameterError(
					'organization',
					organization,
				);
			}

			const applicationTypePromise = !applicationType
				? Promise.resolve()
				: pine
						.get({
							resource: 'application_type',
							options: {
								$select: ['id'],
								$filter: {
									slug: applicationType,
								},
							},
						})
						.get(0)
						.then(function (appType) {
							if (!appType) {
								throw new Error(`Invalid application type: ${applicationType}`);
							}
							return appType.id;
						});

			const parentAppPromise = parent
				? exports.get(parent, { $select: ['id'] })
				: Promise.resolve();

			const deviceTypeIdPromise = deviceModel()
				.getManifestBySlug(deviceType)
				.then(function (deviceManifest) {
					if (deviceManifest == null) {
						throw new errors.BalenaInvalidDeviceType(deviceType);
					}

					if (deviceManifest.state === 'DISCONTINUED') {
						throw new errors.BalenaDiscontinuedDeviceType(deviceType);
					}

					return pine.get({
						resource: 'device_type',
						options: {
							$select: ['id'],
							$filter: {
								// this way we get the un-aliased device type slug
								slug: deviceManifest.slug,
							},
						},
					});
				})
				.then(function ([dt]) {
					if (dt == null) {
						throw new errors.BalenaInvalidDeviceType(deviceType);
					}
					return dt.id;
				});

			const organizationPromise = pine
				.get({
					resource: 'organization',
					options: {
						$top: 1,
						$select: ['id'],
						$filter: {
							[isId(organization) ? 'id' : 'handle']: organization,
						},
					},
				})
				.then(function ([org]) {
					if (!org) {
						throw new errors.BalenaOrganizationNotFound(organization);
					}
					return org.id;
				});

			return Promise.all([
				deviceTypeIdPromise,
				applicationTypePromise,
				parentAppPromise,
				organizationPromise,
			]).then(function ([
				deviceTypeId,
				applicationTypeId,
				parentApplication,
				organizationId,
			]) {
				const body = {
					app_name: name,
					is_for__device_type: deviceTypeId,
				};

				if (parentApplication) {
					Object.assign(body, {
						depends_on__application: parentApplication.id,
					});
				}

				if (applicationTypeId) {
					Object.assign(body, { application_type: applicationTypeId });
				}

				if (organizationId) {
					Object.assign(body, { organization: organizationId });
				}

				return pine.post({
					resource: 'application',
					body,
				});
			});
		},

		/**
		 * @summary Remove application
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.remove('MyApp');
		 *
		 * @example
		 * balena.models.application.remove(123);
		 *
		 * @example
		 * balena.models.application.remove('MyApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		remove: (nameOrSlugOrId) =>
			getId(nameOrSlugOrId)
				.then((applicationId) =>
					pine.delete({
						resource: 'application',
						id: applicationId,
					}),
				)
				.catch(isNotFoundResponse, treatAsMissingApplication(nameOrSlugOrId)),

		/**
		 * @summary Restart application
		 * @name restart
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.restart('MyApp');
		 *
		 * @example
		 * balena.models.application.restart(123);
		 *
		 * @example
		 * balena.models.application.restart('MyApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		restart: (nameOrSlugOrId) =>
			getId(nameOrSlugOrId)
				.then((applicationId) =>
					request.send({
						method: 'POST',
						url: `/application/${applicationId}/restart`,
						baseUrl: apiUrl,
					}),
				)
				.return(undefined)
				.catch(isNotFoundResponse, treatAsMissingApplication(nameOrSlugOrId)),

		/**
		 * @summary Generate an API key for a specific application
		 * @name generateApiKey
		 * @public
		 * @function
		 * @memberof balena.models.application
		 * @deprecated
		 * @description
		 * Generally you shouldn't use this method: if you're provisioning a recent BalenaOS
		 * version (2.4.0+) then generateProvisioningKey should work just as well, but
		 * be more secure.
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {String} - api key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.generateApiKey('MyApp').then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.application.generateApiKey(123).then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.application.generateApiKey('MyApp', function(error, apiKey) {
		 * 	if (error) throw error;
		 * 	console.log(apiKey);
		 * });
		 */
		generateApiKey: (nameOrSlugOrId) =>
			// Do a full get, not just getId, because the actual api endpoint doesn't fail if the id
			// doesn't exist. TODO: Can use getId once https://github.com/balena-io/balena-api/issues/110 is resolved
			exports
				.get(nameOrSlugOrId, { $select: 'id' })
				.then(({ id }) =>
					request.send({
						method: 'POST',
						url: `/application/${id}/generate-api-key`,
						baseUrl: apiUrl,
					}),
				)
				.get('body'),

		/**
		 * @summary Generate a device provisioning key for a specific application
		 * @name generateProvisioningKey
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {String} - device provisioning key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey('MyApp').then(function(key) {
		 * 	console.log(key);
		 * });
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey(123).then(function(key) {
		 * 	console.log(key);
		 * });
		 *
		 * @example
		 * balena.models.application.generateProvisioningKey('MyApp', function(error, key) {
		 * 	if (error) throw error;
		 * 	console.log(key);
		 * });
		 */
		generateProvisioningKey: (nameOrSlugOrId) =>
			getId(nameOrSlugOrId)
				.then((applicationId) =>
					request.send({
						method: 'POST',
						url: `/api-key/application/${applicationId}/provisioning`,
						baseUrl: apiUrl,
					}),
				)
				.catch(
					isNoApplicationForKeyResponse,
					treatAsMissingApplication(nameOrSlugOrId),
				)
				.get('body'),

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
		 *
		 * @example
		 * balena.models.application.purge(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		purge: (appId) =>
			request
				.send({
					method: 'POST',
					url: '/supervisor/v1/purge',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							appId: `${appId}`,
						},
					},
				})
				.catch(function (err) {
					if (err.statusCode === LOCKED_STATUS_CODE) {
						throw new errors.BalenaSupervisorLockedError();
					}

					throw err;
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
		 *
		 * @example
		 * balena.models.application.shutdown(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		shutdown(appId, options) {
			if (options == null) {
				options = {};
			}
			return request
				.send({
					method: 'POST',
					url: '/supervisor/v1/shutdown',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							force: Boolean(options.force),
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
		 *
		 * @example
		 * balena.models.application.reboot(123, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		reboot(appId, options) {
			if (options == null) {
				options = {};
			}
			return request
				.send({
					method: 'POST',
					url: '/supervisor/v1/reboot',
					baseUrl: apiUrl,
					body: {
						appId,
						data: {
							force: Boolean(options.force),
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
		 * @summary Get whether the application is configured to receive updates whenever a new release is available
		 * @name willTrackNewReleases
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {Boolean} - is tracking the latest release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases('MyApp').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases(123).then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.willTrackNewReleases('MyApp', function(error, isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		willTrackNewReleases: (nameOrSlugOrId) =>
			exports
				.get(nameOrSlugOrId, { $select: 'should_track_latest_release' })
				.get('should_track_latest_release'),

		/**
		 * @summary Get whether the application is up to date and is tracking the latest release for updates
		 * @name isTrackingLatestRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {Boolean} - is tracking the latest release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease('MyApp').then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease(123).then(function(isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 *
		 * @example
		 * balena.models.application.isTrackingLatestRelease('MyApp', function(error, isEnabled) {
		 * 	console.log(isEnabled);
		 * });
		 */
		isTrackingLatestRelease: (nameOrSlugOrId) =>
			exports
				.get(nameOrSlugOrId, {
					$select: ['should_track_latest_release'],
					$expand: {
						should_be_running__release: { $select: ['id'] },
						owns__release: {
							$select: 'id',
							$top: 1,
							$filter: {
								status: 'success',
							},
							$orderby: 'created_at desc',
						},
					},
				})
				.then(function (application) {
					const trackedRelease = application.should_be_running__release[0];
					const latestRelease = application.owns__release[0];
					return (
						application.should_track_latest_release &&
						(!latestRelease ||
							(trackedRelease && trackedRelease.id === latestRelease.id))
					);
				}),

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
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {String} fullReleaseHash - the hash of a successful release (string)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.pinToRelease('MyApp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.pinToRelease('MyApp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		pinToRelease: (nameOrSlugOrId, fullReleaseHash) =>
			getId(nameOrSlugOrId).then((applicationId) =>
				releaseModel()
					.get(fullReleaseHash, {
						$select: 'id',
						$top: 1,
						$filter: {
							belongs_to__application: applicationId,
							status: 'success',
						},
					})
					.then((release) =>
						pine.patch({
							resource: 'application',
							id: applicationId,
							body: {
								should_be_running__release: release.id,
								should_track_latest_release: false,
							},
						}),
					),
			),

		/**
		 * @summary Get the hash of the current release for a specific application
		 * @name getTargetReleaseHash
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @fulfil {String} - The release hash of the current release
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash('MyApp').then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash(123).then(function(release) {
		 * 	console.log(release);
		 * });
		 *
		 * @example
		 * balena.models.application.getTargetReleaseHash('MyApp', function(release) {
		 * 	console.log(release);
		 * });
		 */
		getTargetReleaseHash: (nameOrSlugOrId) =>
			exports
				.get(nameOrSlugOrId, {
					$select: 'id',
					$expand: { should_be_running__release: { $select: ['commit'] } },
				})
				.then(
					(application) => application.should_be_running__release[0]?.commit,
				),

		/**
		 * @summary Configure a specific application to track the latest available release
		 * @name trackLatestRelease
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @description The application's current release will be updated with each new successfully built release.
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.trackLatestRelease('MyApp').then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.trackLatestRelease(123).then(function() {
		 * 	...
		 * });
		 *
		 * @example
		 * balena.models.application.trackLatestRelease('MyApp', function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		trackLatestRelease: (nameOrSlugOrId) =>
			exports
				.get(nameOrSlugOrId, {
					$select: 'id',
					$expand: {
						owns__release: {
							$select: 'id',
							$top: 1,
							$filter: {
								status: 'success',
							},
							$orderby: 'created_at desc',
						},
					},
				})
				.then((application) => {
					const body = { should_track_latest_release: true };

					const latestRelease = application.owns__release[0];
					if (latestRelease) {
						body.should_be_running__release = latestRelease.id;
					}

					return pine.patch({
						resource: 'application',
						id: application.id,
						body,
					});
				}),

		/**
		 * @summary Enable device urls for all devices that belong to an application
		 * @name enableDeviceUrls
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.enableDeviceUrls('MyApp');
		 *
		 * @example
		 * balena.models.application.enableDeviceUrls(123);
		 *
		 * @example
		 * balena.models.device.enableDeviceUrls('MyApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		enableDeviceUrls: (nameOrSlugOrId) =>
			exports.get(nameOrSlugOrId, { $select: 'id' }).then(({ id }) =>
				pine.patch({
					resource: 'device',
					body: {
						is_web_accessible: true,
					},
					options: {
						$filter: {
							belongs_to__application: id,
						},
					},
				}),
			),

		/**
		 * @summary Disable device urls for all devices that belong to an application
		 * @name disableDeviceUrls
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.disableDeviceUrls('MyApp');
		 *
		 * @example
		 * balena.models.application.disableDeviceUrls(123);
		 *
		 * @example
		 * balena.models.device.disableDeviceUrls('MyApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		disableDeviceUrls: (nameOrSlugOrId) =>
			exports.get(nameOrSlugOrId, { $select: 'id' }).then(({ id }) =>
				pine.patch({
					resource: 'device',
					body: {
						is_web_accessible: false,
					},
					options: {
						$filter: {
							belongs_to__application: id,
						},
					},
				}),
			),

		/**
		 * @summary Grant support access to an application until a specified time
		 * @name grantSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
		 *
		 * @example
		 * balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000, function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		grantSupportAccess(nameOrSlugOrId, expiryTimestamp) {
			if (expiryTimestamp == null || expiryTimestamp <= Date.now()) {
				throw new errors.BalenaInvalidParameterError(
					'expiryTimestamp',
					expiryTimestamp,
				);
			}

			return getId(nameOrSlugOrId)
				.then((applicationId) =>
					pine.patch({
						resource: 'application',
						id: applicationId,
						body: { is_accessible_by_support_until__date: expiryTimestamp },
					}),
				)
				.catch(isNotFoundResponse, treatAsMissingApplication(nameOrSlugOrId));
		},

		/**
		 * @summary Revoke support access to an application
		 * @name revokeSupportAccess
		 * @public
		 * @function
		 * @memberof balena.models.application
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess('MyApp');
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess(123);
		 *
		 * @example
		 * balena.models.application.revokeSupportAccess('MyApp', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		revokeSupportAccess: (nameOrSlugOrId) =>
			getId(nameOrSlugOrId)
				.then((applicationId) =>
					pine.patch({
						resource: 'application',
						id: applicationId,
						body: { is_accessible_by_support_until__date: null },
					}),
				)
				.catch(isNotFoundResponse, treatAsMissingApplication(nameOrSlugOrId)),

		/**
		 * @namespace balena.models.application.tags
		 * @memberof balena.models.application
		 */
		tags: addCallbackSupportToModule({
			/**
			 * @summary Get all application tags for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication('MyApp').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAllByApplication('MyApp', function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAllByApplication: tagsModel.getAllByParent,

			/**
			 * @summary Get all application tags
			 * @name getAll
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.getAll().then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.application.tags.getAll(function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAll: tagsModel.getAll,

			/**
			 * @summary Set an application tag
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @param {String|undefined} value - tag value
			 *
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.set('7cf02a6', 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.application.tags.set(123, 'EDITOR', 'vim');
			 *
			 * @example
			 * balena.models.application.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			set: tagsModel.set,

			/**
			 * @summary Remove an application tag
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.application.tags
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} tagKey - tag key
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.tags.remove('7cf02a6', 'EDITOR');
			 *
			 * @example
			 * balena.models.application.tags.remove('7cf02a6', 'EDITOR', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			remove: tagsModel.remove,
		}),

		/**
		 * @namespace balena.models.application.configVar
		 * @memberof balena.models.application
		 */
		configVar: addCallbackSupportToModule({
			/**
			 * @summary Get all config variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application config variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication('MyApp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.getAllByApplication('MyApp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
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
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - config variable name
			 * @fulfil {String|undefined} - the config variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.get('MyApp', 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.get('MyApp', 'BALENA_VAR', function(error, value) {
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
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - config variable name
			 * @param {String} value - config variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue', function(error) {
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
			 * @memberof balena.models.application.configVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - config variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.configVar.remove('MyApp', 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.configVar.remove('MyApp', 'BALENA_VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: configVarModel.remove,
		}),

		/**
		 * @namespace balena.models.application.envVar
		 * @memberof balena.models.application
		 */
		envVar: addCallbackSupportToModule({
			/**
			 * @summary Get all environment variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication('MyApp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.getAllByApplication('MyApp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
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
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - environment variable name
			 * @fulfil {String|undefined} - the environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.get('MyApp', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.get('MyApp', 'VAR', function(error, value) {
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
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - environment variable name
			 * @param {String} value - environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue', function(error) {
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
			 * @memberof balena.models.application.envVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.envVar.remove('MyApp', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.envVar.remove('MyApp', 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: envVarModel.remove,
		}),

		/**
		 * @namespace balena.models.application.buildVar
		 * @memberof balena.models.application
		 */
		buildVar: addCallbackSupportToModule({
			/**
			 * @summary Get all build environment variables for an application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.application.buildVar
			 *
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - application build environment variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication('MyApp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.getAllByApplication('MyApp', function(error, vars) {
			 * 	if (error) throw error;
			 * 	console.log(vars)
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
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @fulfil {String|undefined} - the build environment variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.get('MyApp', 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.get('MyApp', 'VAR', function(error, value) {
			 * 	if (error) throw error;
			 * 	console.log(value)
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
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @param {String} value - build environment variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.set('MyApp', 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.set('MyApp', 'VAR', 'newvalue', function(error) {
			 * 	if (error) throw error;
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
			 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
			 * @param {String} key - build environment variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.application.buildVar.remove('MyApp', 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.application.buildVar.remove('MyApp', 'VAR', function(error) {
			 * 	if (error) throw error;
			 * 	...
			 * });
			 */
			remove: buildVarModel.remove,
		}),

		/**
		 * @namespace balena.models.application.invite
		 * @memberof balena.models.application
		 */
		invite: addCallbackSupportToModule(inviteModel),
	};

	return exports;
};

export { getApplicationModel as default };
