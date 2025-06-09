/*
Copyright 2023 Balena

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

import type { ODataOptionsWithoutCount } from 'pinejs-client-core';
import type { CreditBundle, InjectedDependenciesParam } from '..';
import { mergePineOptions } from '../util';
import type { PickDeferred } from '@balena/abstract-sql-to-typescript';

const getCreditBundleModel = function ({
	pine,
	// Do not destructure sub-modules, to allow lazy loading only when needed.
	sdkInstance,
}: InjectedDependenciesParam) {
	const getOrgId = async (organization: string | number): Promise<number> => {
		const { id } = await sdkInstance.models.organization.get(organization, {
			$select: 'id',
		});
		return id;
	};

	const exports = {
		/**
		 * @summary Get all of the credit bundles purchased by the given org
		 * @name getAllByOrg
		 * @public
		 * @function
		 * @memberof balena.models.creditBundle
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 * @param {Object} [options={}] - extra pine options to use
		 *
		 * @fulfil {Object[]} - credit bundles
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.creditBundle.getAllByOrg(orgId).then(function(creditBundles) {
		 * 	console.log(creditBundles);
		 * });
		 *
		 */

		getAllByOrg: async (
			organization: string | number,
			options?: ODataOptionsWithoutCount<CreditBundle['Read']>,
		): Promise<Array<CreditBundle['Read']>> => {
			const orgId = await getOrgId(organization);
			const creditBundles = await pine.get({
				resource: 'credit_bundle',
				options: mergePineOptions(options ?? {}, {
					$filter: { belongs_to__organization: orgId },
					$orderby: { created_at: 'desc' },
				}),
			});
			return creditBundles;
		},

		/**
		 * @summary Purchase a credit bundle for the given feature and org of the given quantity
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.creditBundle
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 * @param {Number} featureId - id (number) of the feature for which credits are being purchased.
		 * @param {Number} creditsToPurchase - number of credits being purchased.
		 *
		 * @fulfil {Object[]} - credit bundles
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.creditBundle.create(orgId, featureId, creditsToPurchase).then(function(creditBundle) {
		 * 	console.log(creditBundle);
		 * });
		 *
		 */

		create: async (
			organization: string | number,
			featureId: number,
			creditsToPurchase: number,
		): Promise<PickDeferred<CreditBundle['Read']>> => {
			const orgId = await getOrgId(organization);
			const body: CreditBundle['Write'] = {
				belongs_to__organization: orgId,
				is_for__feature: featureId,
				original_quantity: creditsToPurchase,
			};
			return await pine.post({
				resource: 'credit_bundle',
				body,
			});
		},
	};

	return exports;
};

export default getCreditBundleModel;
