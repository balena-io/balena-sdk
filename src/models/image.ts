/*
Copyright 2017 Balena

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
import type { Image, InjectedDependenciesParam } from '..';
import type { ODataOptionsWithoutCount } from 'pinejs-client-core';

const getImageModel = function (deps: InjectedDependenciesParam) {
	const { pine } = deps;
	const exports = {
		/**
		 * @summary Get a specific image
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.image
		 *
		 * @param {Number} id - image id
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - image
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.image.get(123).then(function(image) {
		 * 	console.log(image);
		 * });
		 */
		async get(
			id: number,
			options: ODataOptionsWithoutCount<Image['Read']> = {},
		): Promise<Image['Read']> {
			const image = await pine.get({
				resource: 'image',
				id,
				options,
			});
			if (image == null) {
				throw new errors.BalenaImageNotFound(id);
			}
			return image;
		},

		/**
		 * @summary Get the logs for an image
		 * @name getLogs
		 * @public
		 * @function
		 * @memberof balena.models.image
		 *
		 * @param {Number} id - image id
		 * @fulfil {string | null} - logs
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.image.getLogs(123).then(function(logs) {
		 * 	console.log(logs);
		 * });
		 */
		getLogs: async (id: number): Promise<string | null> => {
			const { build_log } = await exports.get(id, { $select: 'build_log' });
			return build_log;
		},
	};

	return exports;
};

export default getImageModel;
