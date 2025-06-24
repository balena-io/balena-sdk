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
import type { UserHasPublicKey, InjectedDependenciesParam } from '..';
import type { ODataOptionsWithoutCount } from 'pinejs-client-core';

const getKeyModel = function (deps: InjectedDependenciesParam) {
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
	 */
	function getAll<T extends ODataOptionsWithoutCount<UserHasPublicKey['Read']>>(
		options?: T,
	) {
		return pine.get({
			resource: 'user__has__public_key',
			options,
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
	 */
	async function get(id: number) {
		const key = await pine.get({
			resource: 'user__has__public_key',
			id,
		});
		if (key == null) {
			throw new errors.BalenaKeyNotFound(id);
		}
		return key;
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
	 */
	function remove(id: number): Promise<void> {
		return pine.delete({
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
	 */
	async function create(title: string, key: string) {
		// Avoid ugly whitespaces
		key = key.trim();

		const { id: userId } = await sdkInstance.auth.getUserInfo();
		return await pine.post({
			resource: 'user__has__public_key',
			body: {
				title,
				public_key: key,
				user: userId,
			},
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
