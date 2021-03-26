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

import type { InjectedDependenciesParam } from '..';
import type * as BalenaSdk from '..';
import { ReleaseDelta } from '../types/models';
import { mergePineOptions } from '../util';

const getReleaseDeltaModel = function (deps: InjectedDependenciesParam) {
	const { pine } = deps;

	const exports = {
		/**
		 * @summary Get all releases deltas
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.releaseDelta
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - releases deltas
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all releases generated deltas.
		 *
		 * @example
		 * balena.models.releaseDelta.getAll(123, 321).then(function(releasesDeltas) {
		 * 	console.log(releasesDeltas);
		 * });
		 *
		 * @example
		 * balena.models.releaseDelta.getAll(123, 321, function(error, releasesDeltas) {
		 * 	if (error) throw error;
		 * 	console.log(releasesDeltas);
		 * });
		 */
		async getAll(
			options: BalenaSdk.PineOptions<BalenaSdk.ReleaseDelta> = {},
		): Promise<ReleaseDelta[]> {
			return pine.get<any>({
				resource: 'release_delta',
				options: mergePineOptions({}, options),
			});
		},
		/**
		 * @summary Get deltas for a specific release
		 * @name getByRelease
		 * @public
		 * @function
		 * @memberof balena.models.releaseDelta
		 *
		 * @param {String|Number} releaseId - release id
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release deltas
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all release generated deltas.
		 *
		 * @example
		 * balena.models.releaseDelta.getByRelease(123, 321).then(function(releaseDeltas) {
		 * 	console.log(releaseDeltas);
		 * });
		 *
		 * @example
		 * balena.models.releaseDelta.getByRelease(123, 321, function(error, releaseDeltas) {
		 * 	if (error) throw error;
		 * 	console.log(releaseDeltas);
		 * });
		 */
		async getByRelease(
			releaseId: number,
			options: BalenaSdk.PineOptions<BalenaSdk.ReleaseDelta> = {},
		): Promise<ReleaseDelta[]> {
			return pine.get<any>({
				resource: 'release_delta',
				options: mergePineOptions(
					{
						$filter: {
							$or: {
								originates_from__release: releaseId,
								produces__release: releaseId,
							},
						},
					},
					options,
				),
			});
		},
		/**
		 * @summary Get or create delta size between two releases
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.releaseDelta
		 *
		 * @param {String|Number} releaseId1 - first release id
		 * @param {String|Number} releaseId2 - second release id
		 * @fulfil {Object[]} - releases delta
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns the delta size between two releases.
		 *
		 * @example
		 * balena.models.releaseDelta.create(123, 321).then(function(deltaSize) {
		 * 	console.log(deltaSize);
		 * });
		 *
		 * @example
		 * balena.models.releaseDelta.create(123, 321, function(error, deltaSize) {
		 * 	if (error) throw error;
		 * 	console.log(deltaSize);
		 * });
		 */
		async create(
			releaseId1: number,
			releaseId2: number,
		): Promise<ReleaseDelta> {
			return pine.post<ReleaseDelta>({
				resource: 'release_delta',
				body: {
					originates_from__release: releaseId1,
					produces__release: releaseId2,
				},
			});
		},
	};
	return exports;
};

export { getReleaseDeltaModel as default };
