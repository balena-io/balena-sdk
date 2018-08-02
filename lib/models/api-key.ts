/*
Copyright 2018 Resin.io

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
import isString = require('lodash/isString');
import pick = require('lodash/pick');
import * as errors from 'resin-errors';
import * as ResinSdk from '../../typings/resin-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '../resin';
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
	 * @memberof resin.models.apiKey
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
	 * resin.models.apiKey.create(apiKeyName).then(function(apiKey) {
	 * 	console.log(apiKey);
	 * });
	 *
	 * @example
	 * resin.models.apiKey.create(apiKeyName, apiKeyDescription).then(function(apiKey) {
	 * 	console.log(apiKey);
	 * });
	 *
	 * @example
	 * resin.models.apiKey.create(apiKeyName, function(error, apiKey) {
	 * 	if (error) throw error;
	 * 	console.log(apiKey);
	 * });
	 */
	exports.create = function(
		name: string,
		description: string | null = null,
		_callback:
			| ((error?: Error, result?: string) => void)
			| undefined = undefined,
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
				throw new errors.ResinNotLoggedIn();
			})
			.asCallback(_callback);
	};

	/**
	 * @summary Get all API keys
	 * @name getAll
	 * @public
	 * @function
	 * @memberof resin.models.apiKey
	 *
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - apiKeys
	 * @returns {Promise}
	 *
	 * @example
	 * resin.models.apiKey.getAll().then(function(apiKeys) {
	 * 	console.log(apiKeys);
	 * });
	 *
	 * @example
	 * resin.models.apiKey.getAll(function(error, apiKeys) {
	 * 	if (error) throw error;
	 * 	console.log(apiKeys);
	 * });
	 */
	exports.getAll = function(
		options: ResinSdk.PineOptionsFor<ResinSdk.ApiKey> = {},
		callback: (error?: Error, apiKeys?: ResinSdk.ApiKey[]) => void,
	): Promise<ResinSdk.ApiKey[]> {
		callback = findCallback(arguments);
		return pine
			.get<ResinSdk.ApiKey>({
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
	 * @memberof resin.models.apiKey
	 *
	 * @param {Number} id - API key id
	 * @param {Object} apiKeyInfo - an object with the updated name or description
	 * @returns {Promise}
	 *
	 * @example
	 * resin.models.apiKey.update(123, { name: 'updatedName' });
	 *
	 * @example
	 * resin.models.apiKey.update(123, { description: 'updated description' });
	 *
	 * @example
	 * resin.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
	 *
	 * @example
	 * resin.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' }, function(error, apiKeys) {
	 * 	if (error) throw error;
	 * 	console.log(apiKeys);
	 * });
	 */
	exports.update = function(
		id: number,
		apiKeyInfo: { name?: string; description?: string },
		callback: (error?: Error) => void,
	): Promise<void> {
		return Promise.try<void>(() => {
			if (!apiKeyInfo) {
				throw new errors.ResinInvalidParameterError('apiKeyInfo', apiKeyInfo);
			}
			if (apiKeyInfo.name === null || apiKeyInfo.name === '') {
				throw new errors.ResinInvalidParameterError(
					'apiKeyInfo.name',
					apiKeyInfo.name,
				);
			}
			return pine
				.patch<ResinSdk.ApiKey>({
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
	 * @memberof resin.models.apiKey
	 *
	 * @param {Number} id - API key id
	 * @returns {Promise}
	 *
	 * @example
	 * resin.models.apiKey.revoke(123);
	 *
	 * @example
	 * resin.models.apiKey.revoke(123, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	exports.revoke = function(
		id: number,
		callback: (error?: Error) => void,
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
