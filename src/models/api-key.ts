/*
Copyright 2018 Balena

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
import * as errors from 'balena-errors';

import type * as BalenaSdk from '..';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import { mergePineOptions } from '../util';

const getApiKeysModel = function (
	{
		pine,
		request,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	}: InjectedDependenciesParam,
	{ apiUrl }: InjectedOptionsParam,
) {
	const exports = {
		/**
		 * @summary Creates a new user API key
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @description This method registers a new api key for the current user with the name given.
		 *
		 * @param {Object} createApiKeyParams - an object containing the parameters for the creation of an API key
		 * @param {String} createApiKeyParams.name - the API key name
		 * @param {String} createApiKeyParams.expiryDate - the API key expiry date
		 * @param {String} [createApiKeyParams.description=null] - the API key description
		 *
		 * @fulfil {String} - API key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.create({name: apiKeyName, expiryDate: 2030-10-12}).then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 *
		 * @example
		 * balena.models.apiKey.create({name: apiKeyName, expiryDate: 2030-10-12, description: apiKeyDescription}).then(function(apiKey) {
		 * 	console.log(apiKey);
		 * });
		 */
		async create({
			name,
			expiryDate,
			description = null,
		}: {
			name: string;
			expiryDate: string | null;
			description?: string | null;
		}): Promise<string> {
			if (expiryDate === undefined) {
				throw new errors.BalenaInvalidParameterError(
					'createApiKeyParams.expiryDate',
					expiryDate,
				);
			}
			const apiKeyBody: {
				name: string;
				expiryDate: string | null;
				description?: string | null;
			} = {
				name,
				expiryDate,
			};
			if (typeof description === 'string' && !!description) {
				apiKeyBody.description = description;
			}
			try {
				const { body } = await request.send({
					method: 'POST',
					url: '/api-key/user/full',
					baseUrl: apiUrl,
					body: apiKeyBody,
				});
				return body;
			} catch {
				throw new errors.BalenaNotLoggedIn();
			}
		},

		/**
		 * @summary Get all accessible API keys
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getAll().then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 */
		async getAll(
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey['Read']> = {},
		) {
			return await pine.get({
				resource: 'api_key',
				options: mergePineOptions(
					{
						$orderby: {
							name: 'asc',
						},
					},
					options,
				),
			});
		},

		/**
		 * @summary Get all named user API keys of the current user
		 * @name getAllNamedUserApiKeys
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getAllNamedUserApiKeys().then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 */
		async getAllNamedUserApiKeys(
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey['Read']> = {},
		) {
			return await exports.getAll(
				mergePineOptions(
					{
						$filter: {
							is_of__actor: await sdkInstance.auth.getActorId(),
							// the only way to reason whether it's
							// a named user api key vs a deprecated user api key
							// is whether it has a name.
							name: {
								$ne: null,
							},
						},
					},
					options,
				),
			);
		},

		/**
		 * @summary Get all provisioning API keys for an application
		 * @name getProvisioningApiKeysByApplication
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getProvisioningApiKeysByApplication('myorganization/myapp').then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 */
		async getProvisioningApiKeysByApplication(
			slugOrUuidOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey['Read']> = {},
		) {
			const appOpts = {
				$select: 'actor' as const,
			};
			const { actor } = (await sdkInstance.models.application.get(
				slugOrUuidOrId,
				appOpts,
			));

			return await exports.getAll(
				mergePineOptions(
					{
						$filter: {
							is_of__actor: actor.__id,
						},
					},
					options,
				),
			);
		},

		/**
		 * @summary Get all API keys for a device
		 * @name getDeviceApiKeysByDevice
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {String|Number} uuidOrId - device, uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - apiKeys
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.getDeviceApiKeysByDevice('7cf02a6').then(function(apiKeys) {
		 * 	console.log(apiKeys);
		 * });
		 */
		async getDeviceApiKeysByDevice(
			uuidOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ApiKey['Read']> = {},
		) {
			const deviceOpts = {
				$select: 'actor' as const,
			};
			const { actor } = (await sdkInstance.models.device.get(
				uuidOrId,
				deviceOpts,
			)) as BalenaSdk.PineTypedResult<BalenaSdk.Device, typeof deviceOpts>;

			return await pine.get({
				resource: 'api_key',
				options: mergePineOptions(
					{
						$filter: {
							is_of__actor: actor.__id,
						},
						$orderby: {
							name: 'asc'
						},
					},
					options,
				),
			});
		},

		/**
		 * @summary Update the details of an API key
		 * @name update
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Number} id - API key id
		 * @param {Object} apiKeyInfo - an object with the updated name|description|expiryDate
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.update(123, { name: 'updatedName' });
		 *
		 * @example
		 * balena.models.apiKey.update(123, { description: 'updated description' });
		 *
		 * @example
		 * balena.models.apiKey.update(123, { expiryDate: '2022-04-29' });
		 *
		 * @example
		 * balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
		 */
		async update(
			id: number,
			apiKeyInfo: {
				name?: string;
				description?: string | null;
				expiryDate?: string | null;
			},
		) {
			if (!apiKeyInfo) {
				throw new errors.BalenaInvalidParameterError('apiKeyInfo', apiKeyInfo);
			}
			if (apiKeyInfo.name === null || apiKeyInfo.name === '') {
				throw new errors.BalenaInvalidParameterError(
					'apiKeyInfo.name',
					apiKeyInfo.name,
				);
			}
			const body = {
				name: apiKeyInfo.name,
				description: apiKeyInfo.description,
				expiry_date: apiKeyInfo.expiryDate,
			};
			await pine.patch({
				resource: 'api_key',
				id,
				body,
			});
		},

		/**
		 * @summary Revoke an API key
		 * @name revoke
		 * @public
		 * @function
		 * @memberof balena.models.apiKey
		 *
		 * @param {Number} id - API key id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.apiKey.revoke(123);
		 */
		async revoke(id: number): Promise<void> {
			await pine.delete({
				resource: 'api_key',
				id,
			});
		},
	};

	return exports;
};

export default getApiKeysModel;
