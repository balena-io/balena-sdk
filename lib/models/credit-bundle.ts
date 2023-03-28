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

import once = require('lodash/once');
import type {
	CreditBundle,
	InjectedDependenciesParam,
	InjectedOptionsParam,
	PineOptions,
} from '..';
import { SubmitBody } from '../../typings/pinejs-client-core';
import { mergePineOptions } from '../util';

const getCreditBundleModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine } = deps;

	const organizationModel = once(() =>
		(require('./organization') as typeof import('./organization')).default(
			deps,
			opts,
		),
	);

	const getOrgId = async (organization: string | number): Promise<number> => {
		const { id } = await organizationModel().get(organization, {
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
			options?: PineOptions<CreditBundle>,
		): Promise<CreditBundle[]> => {
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
		): Promise<CreditBundle> => {
			const orgId = await getOrgId(organization);
			const body: SubmitBody<CreditBundle> = {
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
