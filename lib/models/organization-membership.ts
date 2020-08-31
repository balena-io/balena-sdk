/*
Copyright 2020 Balena

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

import type { OrganizationMembership, PineOptions, BalenaSDK } from '../..';
import { InjectedDependenciesParam } from '..';
import { mergePineOptions } from '../util';

const RESOURCE = 'organization_membership';

const getOrganizationMembershipModel = function (
	deps: InjectedDependenciesParam,
	getOrganization: BalenaSDK['models']['organization']['get'],
) {
	const { pine } = deps;

	const exports = {
		/**
		 * @summary Get all organization memberships
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @description
		 * This method returns all organization memberships.
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - organization memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.getAll().then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.organization.membership.getAll(function(error, memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		getAll(
			options: PineOptions<OrganizationMembership> = {},
		): Promise<OrganizationMembership[]> {
			return pine.get({
				resource: RESOURCE,
				options,
			});
		},

		/**
		 * @summary Get all memberships by organization
		 * @name getAllByOrganization
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @description
		 * This method returns all organization memberships for a specific organization.
		 *
		 * @param {String|Number} handleOrId - organization handle (string) or id (number).
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - organization memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.getAllByOrganization('MyOrg').then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.organization.membership.getAllByOrganization(123).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.organization.membership.getAllByOrganization(123, function(error, memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async getAllByOrganization(
			handleOrId: number | string,
			options: PineOptions<OrganizationMembership> = {},
		): Promise<OrganizationMembership[]> {
			const { id } = await getOrganization(handleOrId, {
				$select: 'id',
			});
			return await exports.getAll(
				mergePineOptions(
					{ $filter: { is_member_of__organization: id } },
					options,
				),
			);
		},
	};
	return exports;
};

export default getOrganizationMembershipModel;
