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

import * as errors from 'balena-errors';
import * as Promise from 'bluebird';
import * as BalenaSdk from '../../typings/balena-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import { mergePineOptions } from '../util';

const getKeyModel = function (
	deps: InjectedDependenciesParam,
	_opts: InjectedOptionsParam,
) {
	const {
		pine,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;

	/**
	 * @summary Get all ssh keys
	 * @name getAll
	 * @public
	 * @function
	 * @memberof balena.models.key
	 *
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - ssh keys
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.key.getAll().then(function(keys) {
	 * 	console.log(keys);
	 * });
	 *
	 * @example
	 * balena.models.key.getAll(function(error, keys) {
	 * 	if (error) throw error;
	 * 	console.log(keys);
	 * });
	 */
	function getAll(
		options: BalenaSdk.PineOptions<BalenaSdk.SSHKey> = {},
	): Promise<BalenaSdk.SSHKey[]> {
		return pine.get<BalenaSdk.SSHKey>({
			resource: 'user__has__public_key',
			options: mergePineOptions({}, options),
		});
	}

	/**
	 * @summary Get a single ssh key
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.key
	 *
	 * @param {Number} id - key id
	 * @fulfil {Object} - ssh key
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.key.get(51).then(function(key) {
	 * 	console.log(key);
	 * });
	 *
	 * @example
	 * balena.models.key.get(51, function(error, key) {
	 * 	if (error) throw error;
	 * 	console.log(key);
	 * });
	 */
	function get(id: number): Promise<BalenaSdk.SSHKey> {
		return pine
			.get<BalenaSdk.SSHKey>({
				resource: 'user__has__public_key',
				id,
			})
			.tap(function (key) {
				if (key == null) {
					throw new errors.BalenaKeyNotFound(id);
				}
			});
	}

	/**
	 * @summary Remove ssh key
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.key
	 *
	 * @param {Number} id - key id
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.key.remove(51);
	 *
	 * @example
	 * balena.models.key.remove(51, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	function remove(id: number): Promise<string> {
		return pine.delete<BalenaSdk.SSHKey>({
			resource: 'user__has__public_key',
			id,
		});
	}

	/**
	 * @summary Create a ssh key
	 * @name create
	 * @public
	 * @function
	 * @memberof balena.models.key
	 *
	 * @param {String} title - key title
	 * @param {String} key - the public ssh key
	 *
	 * @fulfil {Object} - ssh key
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	 * 	console.log(key);
	 * });
	 *
	 * @example
	 * balena.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, key) {
	 * 	if (error) throw error;
	 * 	console.log(key);
	 * });
	 */
	function create(title: string, key: string): Promise<BalenaSdk.SSHKey> {
		return Promise.try(() => {
			// Avoid ugly whitespaces
			key = key.trim();

			return sdkInstance.auth.getUserId().then((userId) =>
				pine.post<BalenaSdk.SSHKey>({
					resource: 'user__has__public_key',
					body: {
						title,
						public_key: key,
						user: userId,
					},
				}),
			);
		});
	}

	return {
		getAll,
		get,
		remove,
		create,
	};
};

export default getKeyModel;
