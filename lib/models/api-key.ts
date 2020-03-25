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
import * as Promise from 'bluebird';
import isString = require('lodash/isString');
import pick = require('lodash/pick');

import * as BalenaSdk from '../../typings/balena-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '../balena';
import { findCallback, mergePineOptions } from '../util';

const getApiKeysModel = function(
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine, request } = deps;
	const { apiUrl } = opts;
	exports = {};

	/**
	 * @summary Creates a new user API key
	 * @name create
	 * @public
	 * @function
	 * @memberof balena.models.apiKey
	 *
	 * @description This method registers a new api key for the current user with the name given.
	 *
	 * @param {String} name - the API key name
	 * @param {String} [description=null] - the API key description
	 *
	 * @fulfil {String} - API key
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.apiKey.create(apiKeyName).then(function(apiKey) {
	 * 	console.log(apiKey);
	 * });
	 *
	 * @example
	 * balena.models.apiKey.create(apiKeyName, apiKeyDescription).then(function(apiKey) {
	 * 	console.log(apiKey);
	 * });
	 *
	 * @example
	 * balena.models.apiKey.create(apiKeyName, function(error, apiKey) {
	 * 	if (error) throw error;
	 * 	console.log(apiKey);
	 * });
	 */
	exports.create = function(
		name: string,
		description: string | null = null,
		_callback?: (error?: Error, result?: string) => void,
	): Promise<string> {
		_callback = findCallback(arguments);

		const apiKeyBody: { name: string; description?: string | null } = {
			name,
		};
		if (isString(description) && !!description) {
			apiKeyBody.description = description;
		}
		return request
			.send({
				method: 'POST',
				url: '/api-key/user/full',
				baseUrl: apiUrl,
				body: apiKeyBody,
			})
			.get('body')
			.catch(function() {
				throw new errors.BalenaNotLoggedIn();
			})
			.asCallback(_callback);
	};

	/**
	 * @summary Get all API keys
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
	 *
	 * @example
	 * balena.models.apiKey.getAll(function(error, apiKeys) {
	 * 	if (error) throw error;
	 * 	console.log(apiKeys);
	 * });
	 */
	exports.getAll = function(
		options: BalenaSdk.PineOptions<BalenaSdk.ApiKey> = {},
		callback?: (error?: Error, apiKeys?: BalenaSdk.ApiKey[]) => void,
	): Promise<BalenaSdk.ApiKey[]> {
		callback = findCallback(arguments);
		return pine
			.get<BalenaSdk.ApiKey>({
				resource: 'api_key',
				options: mergePineOptions(
					{
						// the only way to reason whether
						// it's a named user api key is whether
						// it has a name
						$filter: {
							name: {
								$ne: null,
							},
						},
						$orderby: 'name asc',
					},
					options,
				),
			})
			.asCallback(callback);
	};

	/**
	 * @summary Update the details of an API key
	 * @name update
	 * @public
	 * @function
	 * @memberof balena.models.apiKey
	 *
	 * @param {Number} id - API key id
	 * @param {Object} apiKeyInfo - an object with the updated name or description
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.apiKey.update(123, { name: 'updatedName' });
	 *
	 * @example
	 * balena.models.apiKey.update(123, { description: 'updated description' });
	 *
	 * @example
	 * balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
	 *
	 * @example
	 * balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' }, function(error, apiKeys) {
	 * 	if (error) throw error;
	 * 	console.log(apiKeys);
	 * });
	 */
	exports.update = function(
		id: number,
		apiKeyInfo: { name?: string; description?: string },
		callback?: (error?: Error) => void,
	): Promise<void> {
		return Promise.try<void>(() => {
			if (!apiKeyInfo) {
				throw new errors.BalenaInvalidParameterError('apiKeyInfo', apiKeyInfo);
			}
			if (apiKeyInfo.name === null || apiKeyInfo.name === '') {
				throw new errors.BalenaInvalidParameterError(
					'apiKeyInfo.name',
					apiKeyInfo.name,
				);
			}
			return pine
				.patch<BalenaSdk.ApiKey>({
					resource: 'api_key',
					id,
					body: pick(apiKeyInfo, ['name', 'description']),
					options: {
						// the only way to reason whether
						// it's a named user api key is whether
						// it has a name
						$filter: {
							name: {
								$ne: null,
							},
						},
					},
				})
				.return();
		}).asCallback(callback);
	};

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
	 *
	 * @example
	 * balena.models.apiKey.revoke(123, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.revoke = function(
		id: number,
		callback?: (error?: Error) => void,
	): Promise<void> {
		return pine
			.delete({
				resource: 'api_key',
				id,
				options: {
					// so that we don't accidentally delete
					// a non named user api key
					$filter: {
						name: {
							$ne: null,
						},
					},
				},
			})
			.return()
			.asCallback(callback);
	};

	return exports;
};

export default getApiKeysModel;
