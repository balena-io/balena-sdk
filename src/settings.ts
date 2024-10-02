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

import type { InjectedDependenciesParam } from '.';

const getSettings = function ({ settings }: InjectedDependenciesParam) {
	const exports = {
		/**
		 * @summary Get a single setting. **Only implemented in Node.js**
		 * @name get
		 * @function
		 * @public
		 * @memberof balena.settings
		 *
		 * @param {String} [key] - setting key
		 * @fulfil {*} - setting value
		 * @returns {Promise}
		 *
		 * @example
		 * balena.settings.get('apiUrl').then(function(apiUrl) {
		 * 	console.log(apiUrl);
		 * });
		 */
		// eslint-disable-next-line @typescript-eslint/require-await -- we return a promise for future proofing
		get: async (key: string): Promise<string> => settings.get(key),

		/**
		 * @summary Get all settings **Only implemented in Node.js**
		 * @name getAll
		 * @function
		 * @public
		 * @memberof balena.settings
		 *
		 * @fulfil {Object} - settings
		 * @returns {Promise}
		 *
		 * @example
		 * balena.settings.getAll().then(function(settings) {
		 * 	console.log(settings);
		 * });
		 */
		// eslint-disable-next-line @typescript-eslint/require-await -- we return a promise for future proofing
		getAll: async (): Promise<{ [key: string]: string }> => settings.getAll(),
	};

	return exports;
};

export default getSettings;
