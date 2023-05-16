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
import type { ResourceAlternateKey } from '../../typings/pinejs-client-core';
import type {
	Organization,
	OrganizationMembership,
	OrganizationMembershipRoles,
	OrganizationMembershipTag,
	PineOptions,
	PineSubmitBody,
	InjectedDependenciesParam,
} from '..';
import { mergePineOptions } from '../util';

const RESOURCE = 'organization_membership';
type ResourceKey =
	| number
	| ResourceAlternateKey<
			Pick<OrganizationMembership, 'user' | 'is_member_of__organization'>
	  >;

export interface OrganizationMembershipCreationOptions {
	organization: string | number;
	username: string;
	roleName?: OrganizationMembershipRoles;
}

const getOrganizationMembershipModel = function (
	deps: InjectedDependenciesParam,
	getOrganization: (
		handleOrId: string | number,
		options?: PineOptions<Organization>,
	) => Promise<Organization>,
) {
	const { pine } = deps;

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');

	const tagsModel = buildDependentResource<OrganizationMembershipTag>(
		{ pine },
		{
			resourceName: 'organization_membership_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'organization_membership',
			async getResourceId(membershipId: string | number): Promise<number> {
				// @ts-expect-error
				const membership = await exports.get(membershipId);
				return membership.id;
			},
		},
	);

	const getRoleId = async (roleName: string) => {
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
		 *
		 * @example
		 * balena.models.organization.membership.get(5, function(error, memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async get(
			membershipId: ResourceKey,
			options: PineOptions<OrganizationMembership> = {},
		): Promise<OrganizationMembership> {
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

		/**
		 * @summary Creates a new membership for an organization
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.organization.membership
		 *
		 * @description This method adds a user to an organization by their usename.
		 *
		 * @param {Object} options - membership creation parameters
		 * @param {String|Number} options.organization - organization handle (string), or id (number)
		 * @param {String} options.username - the username of the balena user that will become a member
		 * @param {String} [options.roleName="member"] - the role name to be granted to the membership
		 *
		 * @fulfil {Object} - organization membership
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.membership.create({ organization: "myorg", username: "user123", roleName: "member" }).then(function(membership) {
		 * 	console.log(membership);
		 * });
		 *
		 * @example
		 * balena.models.organization.membership.create({ organization: 53, username: "user123" }, function(error, membership) {
		 * 	console.log(membership);
		 * });
		 */
		async create({
			organization,
			username,
			roleName,
		}: OrganizationMembershipCreationOptions): Promise<OrganizationMembership> {
			const [{ id }, roleId] = await Promise.all([
				getOrganization(organization, { $select: 'id' }),
				roleName ? getRoleId(roleName) : undefined,
			]);
			type OrganizationMembershipBase = Omit<OrganizationMembership, 'user'>;
			type OrganizationMembershipPostBody = OrganizationMembershipBase & {
				username: string;
			};
			const body: PineSubmitBody<OrganizationMembershipPostBody> = {
				username,
				is_member_of__organization: id,
			};
			if (roleName) {
				body.organization_membership_role = roleId;
			}
			return (await pine.post<OrganizationMembershipBase>({
				resource: RESOURCE,
				body,
			})) as OrganizationMembership;
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
		 *
		 * @example
		 * balena.models.organization.membership.changeRole(123, "administrator", function(error) {
		 * 	console.log('OK');
		 * });
		 */
		async changeRole(
			idOrUniqueKey: ResourceKey,
			roleName: string,
		): Promise<void> {
			const roleId = await getRoleId(roleName);
			await pine.patch<OrganizationMembership>({
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
		 *
		 * @example
		 * balena.models.organization.membership.remove(123,function(error) {
		 * 	if (error) throw error;
		 * 	...
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
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAllByOrganization('MyOrg', function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			async getAllByOrganization(
				handleOrId: string | number,
				options?: PineOptions<OrganizationMembershipTag>,
			): Promise<OrganizationMembershipTag[]> {
				if (options == null) {
					options = {};
				}
				const { id } = await getOrganization(handleOrId, {
					$select: 'id',
				});
				return await tagsModel.getAll(
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
				);
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
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAllByOrganizationMembership(5, function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAllByOrganizationMembership: tagsModel.getAllByParent,

			/**
			 * @summary Get all organization membership tags
			 * @name getAll
			 * @public
			 * @function
			 * @memberof balena.models.organization.memberships.tags
			 *
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - organization membership tags
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAll().then(function(tags) {
			 * 	console.log(tags);
			 * });
			 *
			 * @example
			 * balena.models.organization.memberships.tags.getAll(function(error, tags) {
			 * 	if (error) throw error;
			 * 	console.log(tags)
			 * });
			 */
			getAll: tagsModel.getAll,

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
			 *
			 * @example
			 * balena.models.organization.memberships.tags.set(5, 'EDITOR', 'vim', function(error) {
			 * 	if (error) throw error;
			 * });
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
			 *
			 * @example
			 * balena.models.organization.memberships.tags.remove(5, 'EDITOR', function(error) {
			 * 	if (error) throw error;
			 * });
			 */
			remove: tagsModel.remove,
		},
	};
	return exports;
};

export default getOrganizationMembershipModel;
