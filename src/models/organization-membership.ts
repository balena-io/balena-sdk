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

import * as errors from 'balena-errors';
import type {
	Organization,
	OrganizationMembership,
	OrganizationMembershipTag,
	InjectedDependenciesParam,
	OrganizationMembershipRole,
} from '..';
import { mergePineOptions } from '../util';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
	ResourceAlternateKey,
} from 'pinejs-client-core';

const RESOURCE = 'organization_membership';

type ResourceKey =
	| number
	| ResourceAlternateKey<
			Pick<
				OrganizationMembership['Read'],
				'user' | 'is_member_of__organization'
			>
	  >;

const getOrganizationMembershipModel = function (
	deps: InjectedDependenciesParam,
	getOrganization: (
		handleOrId: string | number,
		options?: ODataOptionsWithoutCount<Organization['Read']>,
	) => Promise<Organization['Read']>,
) {
	const { pine } = deps;

	const { buildDependentResource } =
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'organization_membership_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'organization_membership',
			async getResourceId(membershipId): Promise<number> {
				if (typeof membershipId !== 'number') {
					throw new Error(
						`Unexpected type for membershipId provided in organization-membership tagsModel getResourceId: ${typeof membershipId}`,
					);
				}
				const membership = await exports.get(membershipId);
				return membership.id;
			},
		},
	);

	const getRoleId = async (
		roleName: OrganizationMembershipRole['Read']['name'],
	) => {
		const role = await pine.get({
			resource: 'organization_membership_role',
			id: {
				name: roleName,
			},
			options: {
				$select: 'id',
			},
		});
		// Throw if the user provided a roleName, but we didn't find that role
		if (!role) {
			throw new errors.BalenaOrganizationMembershipRoleNotFound(roleName);
		}
		return role.id;
	};

	const exports = {
		/**
		 * @summary Get a single organization membership
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @description
		 * This method returns a single organization membership.
		 *
		 * @param {number|Object} membershipId - the id or an object with the unique `user` & `is_member_of__organization` numeric pair of the membership
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - organization membership
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.get(5).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async get<
			T extends ODataOptionsWithoutCount<OrganizationMembership['Read']>,
		>(
			membershipId: ResourceKey,
			options?: T,
		): Promise<
			OptionsToResponse<OrganizationMembership['Read'], T, undefined>[number]
		> {
			if (
				typeof membershipId !== 'number' &&
				typeof membershipId !== 'object'
			) {
				throw new errors.BalenaInvalidParameterError(
					'membershipId',
					membershipId,
				);
			}

			const result = await pine.get({
				resource: RESOURCE,
				id: membershipId,
				options,
			});
			if (result == null) {
				throw new errors.BalenaError(
					`Organization Membership not found: ${membershipId}`,
				);
			}
			return result;
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
		 */
		async getAllByOrganization<
			T extends ODataOptionsWithoutCount<OrganizationMembership['Read']>,
		>(
			handleOrId: number | string,
			options?: T,
		): Promise<
			OptionsToResponse<OrganizationMembership['Read'], T, undefined>
		> {
			const { id } = await getOrganization(handleOrId, {
				$select: 'id',
			});
			return (await pine.get({
				resource: RESOURCE,
				options: mergePineOptions(
					{ $filter: { is_member_of__organization: id } },
					options,
				),
			})) as OptionsToResponse<OrganizationMembership['Read'], T, undefined>;
		},

		/**
		 * @summary Get all memberships by user
		 * @name getAllByUser
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @description
		 * This method returns all organization memberships for a specific user.
		 *
		 * @param {String|Number} usernameOrId - the user's username (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - organization memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.getAllByUser('balena_os').then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.organization.membership.getAllByUser(123).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async getAllByUser<
			T extends ODataOptionsWithoutCount<OrganizationMembership['Read']>,
		>(
			usernameOrId: number | string,
			options?: T,
		): Promise<
			OptionsToResponse<OrganizationMembership['Read'], T, undefined>
		> {
			if (
				typeof usernameOrId !== 'number' &&
				typeof usernameOrId !== 'string'
			) {
				throw new errors.BalenaInvalidParameterError(
					'usernameOrId',
					usernameOrId,
				);
			}
			return (await pine.get({
				resource: RESOURCE,
				options: mergePineOptions(
					{
						$filter: {
							user:
								typeof usernameOrId === 'number'
									? usernameOrId
									: {
											$any: {
												$alias: 'u',
												$expr: {
													u: {
														username: usernameOrId,
													},
												},
											},
										},
						},
					},
					options,
				),
			})) as OptionsToResponse<OrganizationMembership['Read'], T, undefined>;
		},

		/**
		 * @summary Changes the role of an organization member
		 * @name changeRole
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @description This method changes the role of an organization member.
		 *
		 * @param {Number|Object} idOrUniqueKey - the id or an object with the unique `user` & `is_member_of__organization` numeric pair of the membership that will be changed
		 * @param {String} roleName - the role name to be granted to the membership
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.changeRole(123, "member").then(function() {
		 * 	console.log('OK');
		 * });
		 *
		 * @example
		 * balena.models.organization.membership.changeRole({
		 * 	user: 123,
		 * 	is_member_of__organization: 125,
		 * }, "member").then(function() {
		 * 	console.log('OK');
		 * });
		 */
		async changeRole(
			idOrUniqueKey: ResourceKey,
			roleName: OrganizationMembershipRole['Read']['name'],
		): Promise<void> {
			const roleId = await getRoleId(roleName);
			await pine.patch({
				resource: 'organization_membership',
				id: idOrUniqueKey,
				body: {
					organization_membership_role: roleId,
				},
			});
		},

		/**
		 * @summary Remove a membership
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @param {Number} id - organization membership id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.remove(123);
		 *
		 * @example
		 * balena.models.organization.membership.remove({
		 * 	user: 123,
		 * 	is_member_of__application: 125,
		 * });
		 */
		async remove(idOrUniqueKey: ResourceKey): Promise<void> {
			await pine.delete({ resource: RESOURCE, id: idOrUniqueKey });
		},

		/**
		 * @namespace balena.models.organization.memberships.tags
		 * @memberof balena.models.organization.memberships
		 */
		tags: {
			/**
			 * @summary Get all organization membership tags for an organization
			 * @name getAllByOrganization
			 * @public
			 * @function
			 * @memberof balena.models.organization.memberships.tags
			 *
			 * @param {String|Number} handleOrId - organization handle (string) or id (number).
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - organization membership tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAllByOrganization('MyOrg').then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAllByOrganization(999999).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 */
			async getAllByOrganization<
				T extends ODataOptionsWithoutCount<OrganizationMembershipTag['Read']>,
			>(
				handleOrId: string | number,
				options?: T,
			): Promise<
				OptionsToResponse<OrganizationMembershipTag['Read'], T, undefined>
			> {
				const { id } = await getOrganization(handleOrId, {
					$select: 'id',
				});
				return (await tagsModel.getAll(
					mergePineOptions(
						{
							$filter: {
								organization_membership: {
									$any: {
										$alias: 'om',
										$expr: { om: { is_member_of__organization: id } },
									},
								},
							},
						},
						options,
					),
				)) as OptionsToResponse<
					OrganizationMembershipTag['Read'],
					T,
					undefined
				>;
			},

			/**
			 * @summary Get all organization membership tags for all memberships of an organization
			 * @name getAllByOrganizationMembership
			 * @public
			 * @function
			 * @memberof balena.models.organization.memberships.tags
			 *
			 * @param {Number} membershipId - organization membership id (number).
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - organization membership tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAllByOrganizationMembership(5).then(function(tags) {
			 * 	console.log(tags);
			 * });
			 */
			getAllByOrganizationMembership: tagsModel.getAllByParent,

			/**
			 * @summary Set an organization membership tag
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.organization.memberships.tags
			 *
			 * @param {Number} handleOrId - organization handle (string) or id (number).
			 * @param {String} tagKey - tag key
			 * @param {String|undefined} value - tag value
			 *
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.organization.memberships.tags.set(5, 'EDITOR', 'vim');
			 */
			set: tagsModel.set,

			/**
			 * @summary Remove an organization membership tag
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.organization.memberships.tags
			 *
			 * @param {Number} handleOrId - organization handle (string) or id (number).
			 * @param {String} tagKey - tag key
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.organization.memberships.tags.remove(5, 'EDITOR');
			 */
			remove: tagsModel.remove,
		},
	};
	return exports;
};

export default getOrganizationMembershipModel;
