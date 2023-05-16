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
	OrganizationInvite,
	OrganizationMembershipRoles,
	PineOptions,
	PineSubmitBody,
	InjectedDependenciesParam,
	InjectedOptionsParam,
} from '..';
import { mergePineOptions } from '../util';

export interface OrganizationInviteOptions {
	invitee: string;
	roleName?: OrganizationMembershipRoles;
	message?: string;
}

const RESOURCE = 'invitee__is_invited_to__organization';

const getOrganizationInviteModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
	getOrganization: (
		handleOrId: string | number,
		options?: PineOptions<Organization>,
	) => Promise<Organization>,
) {
	const { request, pine } = deps;
	const { apiUrl } = opts;

	const exports = {
		/**
		 * @summary Get all invites
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.organization.invite
		 *
		 * @description
		 * This method returns all invites.
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - invites
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.invite.getAll().then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.organization.invite.getAll(function(error, invites) {
		 * 	console.log(invites);
		 * });
		 */
		getAll(
			options: PineOptions<OrganizationInvite> = {},
		): Promise<OrganizationInvite[]> {
			return pine.get({
				resource: RESOURCE,
				options,
			});
		},

		/**
		 * @summary Get all invites by organization
		 * @name getAllByOrganization
		 * @public
		 * @function
		 * @memberof balena.models.organization.invite
		 *
		 * @description
		 * This method returns all invites for a specific organization.
		 *
		 * @param {String|Number} handleOrId - organization handle (string), or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - invites
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.invite.getAllByOrganization('MyOrg').then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.organization.invite.getAllByOrganization(123).then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.organization.invite.getAllByOrganization(123, function(error, invites) {
		 * 	console.log(invites);
		 * });
		 */
		async getAllByOrganization(
			handleOrId: number | string,
			options: PineOptions<OrganizationInvite> = {},
		): Promise<OrganizationInvite[]> {
			const { id } = await getOrganization(handleOrId, {
				$select: 'id',
			});
			return await exports.getAll(
				mergePineOptions(
					{ $filter: { is_invited_to__organization: id } },
					options,
				),
			);
		},

		/**
		 * @summary Creates a new invite for an organization
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.organization.invite
		 *
		 * @description This method invites a user by their email to an organization.
		 *
		 * @param {String|Number} handleOrId - organization handle (string), or id (number)
		 * @param {Object} options - invite creation parameters
		 * @param {String} options.invitee - the email/balena_username of the invitee
		 * @param {String} [options.roleName="developer"] - the role name to be granted to the invitee
		 * @param {String} [message=null] - the message to send along with the invite
		 *
		 * @fulfil {String} - organization invite
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.invite.create('MyOrg', { invitee: "invitee@example.org", roleName: "developer", message: "join my org" }).then(function(invite) {
		 * 	console.log(invite);
		 * });
		 *
		 * @example
		 * balena.models.organization.invite.create(53, { invitee: "invitee@example.org" }, function(error, invite) {
		 * 	console.log(invite);
		 * });
		 */
		async create(
			handleOrId: string | number,
			{ invitee, roleName, message }: OrganizationInviteOptions,
		): Promise<OrganizationInvite> {
			const [{ id }, roles] = await Promise.all([
				getOrganization(handleOrId, { $select: 'id' }),
				roleName
					? pine.get({
							resource: 'organization_membership_role',
							options: {
								$top: 1,
								$select: ['id'],
								$filter: {
									name: roleName,
								},
							},
					  })
					: undefined,
			]);
			type OrganizationInviteBase = Omit<OrganizationInvite, 'invitee'>;
			type OrganizationInvitePostBody = OrganizationInviteBase & {
				invitee: string;
			};
			const body: PineSubmitBody<OrganizationInvitePostBody> = {
				invitee,
				is_invited_to__organization: id,
				message,
			};
			if (roles) {
				const [{ id: roleId }] = roles;
				// Throw if the user provided a roleName, but we didn't find that role
				if (!roleId && roleName) {
					throw new errors.BalenaOrganizationMembershipRoleNotFound(roleName);
				}
				body.organization_membership_role = roleId;
			}
			return (await pine.post<OrganizationInviteBase>({
				resource: RESOURCE,
				body,
			})) as OrganizationInvite;
		},

		/**
		 * @summary Revoke an invite
		 * @name revoke
		 * @public
		 * @function
		 * @memberof balena.models.organization.invite
		 *
		 * @param {Number} id - organization invite id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.invite.revoke(123);
		 *
		 * @example
		 * balena.models.organization.invite.revoke(123,function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		async revoke(id: number): Promise<void> {
			await pine.delete({ resource: RESOURCE, id });
		},

		/**
		 * @summary Accepts an invite
		 * @name accept
		 * @public
		 * @function
		 * @memberof balena.models.organization.invite
		 *
		 * @description This method adds the calling user to the organization.
		 *
		 * @param {String} invitationToken - invite token
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.organization.invite.accept("qwerty-invitation-token");
		 *
		 * @example
		 * balena.models.organization.invite.accept("qwerty-invitation-token", function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		async accept(invitationToken: string): Promise<void> {
			try {
				await request.send({
					method: 'POST',
					url: `/org/v1/invitation/${invitationToken}`,
					baseUrl: apiUrl,
				});
			} catch (err) {
				if (err.statusCode === 401) {
					throw new errors.BalenaNotLoggedIn();
				}
				throw err;
			}
		},
	};
	return exports;
};

export default getOrganizationInviteModel;
