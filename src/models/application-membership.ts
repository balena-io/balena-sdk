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
	Application,
	InjectedDependenciesParam,
	BalenaModel,
	ApplicationMembershipRole,
} from '..';
import { mergePineOptions } from '../util';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
	ResourceAlternateKey,
} from 'pinejs-client-core';

const RESOURCE = 'user_application_membership';
type ApplicationMembership = BalenaModel[typeof RESOURCE];

type ResourceKey =
	| number
	| ResourceAlternateKey<
			Pick<ApplicationMembership['Read'], 'user' | 'is_member_of__application'>
	  >;

export interface ApplicationMembershipCreationOptions {
	application: string | number;
	username: string;
	roleName?: ApplicationMembershipRole['Read']['name'];
}

const getApplicationMembershipModel = function (
	deps: InjectedDependenciesParam,
	getApplication: <T extends ODataOptionsWithoutCount<Application['Read']>>(
		slugOrUuidOrId: string | number,
		options?: T,
	) => Promise<OptionsToResponse<Application['Read'], T, undefined>[number]>,
) {
	const { pine } = deps;

	const getRoleId = async (
		roleName: ApplicationMembershipRole['Read']['name'],
	) => {
		const role = await pine.get({
			resource: 'application_membership_role',
			id: {
				name: roleName,
			},
			options: {
				$select: 'id',
			},
		});
		// Throw if the user provided a roleName, but we didn't find that role
		if (!role) {
			throw new errors.BalenaApplicationMembershipRoleNotFound(roleName);
		}
		return role.id;
	};

	const exports = {
		/**
		 * @summary Get a single application membership
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.application.membership
		 *
		 * @description
		 * This method returns a single application membership.
		 *
		 * @param {number|Object} membershipId - the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - application membership
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.membership.get(5).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async get<
			T extends ODataOptionsWithoutCount<ApplicationMembership['Read']>,
		>(
			membershipId: ResourceKey,
			options?: T,
		): Promise<
			OptionsToResponse<ApplicationMembership['Read'], T, undefined>[number]
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
					`Application Membership not found: ${membershipId}`,
				);
			}
			return result;
		},

		/**
		 * @summary Get all memberships by application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.application.membership
		 *
		 * @description
		 * This method returns all application memberships for a specific application.
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - application memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.membership.getAllByApplication('myorganization/myapp').then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.application.membership.getAllByApplication(123).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async getAllByApplication<
			T extends ODataOptionsWithoutCount<ApplicationMembership['Read']>,
		>(
			slugOrUuidOrId: number | string,
			options?: T,
		): Promise<OptionsToResponse<ApplicationMembership['Read'], T, undefined>> {
			const { id } = await getApplication(slugOrUuidOrId, {
				$select: 'id',
			});
			return (await pine.get({
				resource: RESOURCE,
				options: mergePineOptions(
					{ $filter: { is_member_of__application: id } },
					options,
				),
			})) as OptionsToResponse<ApplicationMembership['Read'], T, undefined>;
		},

		/**
		 * @summary Get all memberships by user
		 * @name getAllByUser
		 * @public
		 * @function
		 * @memberof balena.models.application.membership
		 *
		 * @description
		 * This method returns all application memberships for a specific user.
		 *
		 * @param {String|Number} usernameOrId - the user's username (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - application memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.membership.getAllByUser('balena_os').then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.application.membership.getAllByUser(123).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async getAllByUser<
			T extends ODataOptionsWithoutCount<ApplicationMembership['Read']>,
		>(
			usernameOrId: number | string,
			options?: T,
		): Promise<OptionsToResponse<ApplicationMembership['Read'], T, undefined>> {
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
			})) as OptionsToResponse<ApplicationMembership['Read'], T, undefined>;
		},

		/**
		 * @summary Creates a new membership for an application
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.application.membership
		 *
		 * @description This method adds a user to an application by their username if they are a member of the organization.
		 *
		 * @param {Object} options - membership creation parameters
		 * @param {String|Number} options.application - application handle (string), or id (number)
		 * @param {String} options.username - the username of the balena user that will become a member
		 * @param {String} [options.roleName="member"] - the role name to be granted to the membership
		 *
		 * @fulfil {Object} - application membership
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.membership.create({ application: "myApp", username: "user123", roleName: "member" }).then(function(membership) {
		 * 	console.log(membership);
		 * });
		 */
		async create({
			application,
			username,
			roleName,
		}: ApplicationMembershipCreationOptions) {
			const appOptions = {
				$select: 'id',
				$expand: {
					organization: {
						$select: 'id',
						$expand: {
							organization_membership: {
								$select: 'id',
								$filter: {
									user: {
										$any: {
											$alias: 'u',
											$expr: {
												u: { username },
											},
										},
									},
								},
							},
						},
					},
				},
			} as const;

			const [{ id, organization }, roleId] = await Promise.all([
				getApplication(application, appOptions),
				roleName ? getRoleId(roleName) : undefined,
			]);

			// If the user does not have an organization membership, they cannot be added to an application
			if (organization[0].organization_membership.length === 0) {
				throw new Error(
					'It is necessary that each user (Auth) that is member of an application that has an organization, is member of the organization',
				);
			}
			type ApplicationMembershipBase = Omit<
				ApplicationMembership['Write'],
				'user'
			>;
			type ApplicationMembershipPostBody = ApplicationMembershipBase & {
				username: string;
			};
			const body: Partial<ApplicationMembershipPostBody> = {
				username,
				is_member_of__application: id,
			};
			if (roleName) {
				body.application_membership_role = roleId;
			}
			return await pine.post({
				resource: RESOURCE,
				body,
			});
		},

		/**
		 * @summary Changes the role of an application member
		 * @name changeRole
		 * @public
		 * @function
		 * @memberof balena.models.application.membership
		 *
		 * @description This method changes the role of an application member.
		 *
		 * @param {Number|Object} idOrUniqueKey - the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership that will be changed
		 * @param {String} roleName - the role name to be granted to the membership
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.membership.changeRole(123, "member").then(function() {
		 * 	console.log('OK');
		 * });
		 *
		 * @example
		 * balena.models.application.membership.changeRole({
		 * 	user: 123,
		 * 	is_member_of__application: 125,
		 * }, "member").then(function() {
		 * 	console.log('OK');
		 * });
		 */
		async changeRole(
			idOrUniqueKey: ResourceKey,
			roleName: ApplicationMembershipRole['Read']['name'],
		): Promise<void> {
			const roleId = await getRoleId(roleName);
			await pine.patch({
				resource: RESOURCE,
				id: idOrUniqueKey,
				body: {
					application_membership_role: roleId,
				},
			});
		},

		/**
		 * @summary Remove a membership
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.application.membership
		 *
		 * @param {Number|Object} idOrUniqueKey - the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership that will be removed
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.membership.remove(123);
		 *
		 * @example
		 * balena.models.application.membership.remove({
		 * 	user: 123,
		 * 	is_member_of__application: 125,
		 * });
		 */
		async remove(idOrUniqueKey: ResourceKey): Promise<void> {
			await pine.delete({ resource: RESOURCE, id: idOrUniqueKey });
		},
	};
	return exports;
};

export default getApplicationMembershipModel;
