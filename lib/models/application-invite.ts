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
import * as Promise from 'bluebird';
import {
	Application,
	ApplicationInvite,
	ApplicationMembershipRole,
	PineOptions,
	ApplicationInviteOptions,
	BalenaSDK,
	PineSubmitBody,
} from '../../typings/balena-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import { mergePineOptions } from '../util';

const RESOURCE = 'invitee__is_invited_to__application';

const getApplicationInviteModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
	getApplication: BalenaSDK['models']['application']['get'],
) {
	const { request, pine } = deps;
	const { apiUrl } = opts;

	const exports = {
		/**
		 * @summary Get all invites
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.application.invite
		 *
		 * @description
		 * This method returns all invites.
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - invites
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.getAll().then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.application.invite.getAll(function(error, invites) {
		 * 	console.log(invites);
		 * });
		 */
		getAll(
			options: PineOptions<ApplicationInvite> = {},
		): Promise<ApplicationInvite[]> {
			return pine.get({
				resource: RESOURCE,
				options,
			});
		},

		/**
		 * @summary Get all invites by application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.application.invite
		 *
		 * @description
		 * This method returns all invites for a specific application.
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - invites
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.getAllByApplication('MyApp').then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.application.invite.getAllByApplication(123).then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.application.invite.getAllByApplication(123, function(error, invites) {
		 * 	console.log(invites);
		 * });
		 */
		getAllByApplication(
			nameOrSlugOrId: number | string,
			options: PineOptions<ApplicationInvite> = {},
		): Promise<ApplicationInvite[]> {
			return getApplication(nameOrSlugOrId, {
				$select: 'id',
			}).then(({ id }: Application) =>
				exports.getAll(
					mergePineOptions(
						{ $filter: { is_invited_to__application: id } },
						options,
					),
				),
			);
		},

		/**
		 * @summary Creates a new invite for an application
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.application.invite
		 *
		 * @description This method invites a user by their email/username to an application.
		 *
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} options - invite creation parameters
		 * @param {String} options.invitee - the email/balena_username of the invitee
		 * @param {String} [options.roleName="developer"] - the role name to be granted to the invitee
		 * @param {String} [message=null] - the message to send along with the invite
		 *
		 * @fulfil {String} - application invite
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.create('MyApp', { collabortor: "invitee@example.org", roleName: "developer", message: "join my app" }).then(function(invite) {
		 * 	console.log(invite);
		 * });
		 *
		 * @example
		 * balena.models.application.invite.create(53, { invitee: "invitee_username" }).then(function(invite) {
		 * 	console.log(invite);
		 * });
		 *
		 * @example
		 * balena.models.application.invite.create(53, { invitee: "invitee_username" }, function(error, invite) {
		 * 	console.log(invite);
		 * });
		 */
		create(
			nameOrSlugOrId: string | number,
			{ invitee, roleName, message }: ApplicationInviteOptions,
		): Promise<Partial<ApplicationInvite>> {
			return Promise.all([
				getApplication(nameOrSlugOrId, { $select: 'id' }).get('id'),
				roleName
					? pine.get<ApplicationMembershipRole>({
							resource: 'application_membership_role',
							options: {
								$top: 1,
								$select: ['id'],
								$filter: {
									name: roleName,
								},
							},
					  })
					: undefined,
			]).then(([id, roles]) => {
				type ApplicationInviteBase = Omit<ApplicationInvite, 'invitee'>;
				type ApplicationInvitePostBody = ApplicationInviteBase & {
					invitee: string;
				};
				const body: PineSubmitBody<ApplicationInvitePostBody> = {
					invitee,
					is_invited_to__application: id,
					message,
				};
				if (roles) {
					const [{ id: roleId }] = roles;
					// Throw if the user provided a roleName, but we didn't find that role
					if (!roleId && roleName) {
						throw new errors.BalenaApplicationMembershipRoleNotFound(roleName);
					}
					body.application_membership_role = roleId;
				}
				return pine.post<ApplicationInviteBase>({
					resource: RESOURCE,
					body,
				});
			});
		},

		/**
		 * @summary Revoke an invite
		 * @name revoke
		 * @public
		 * @function
		 * @memberof balena.models.application.invite
		 *
		 * @param {Number} id - application invite id
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.revoke(123);
		 *
		 * @example
		 * balena.models.application.invite.revoke(123,function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		revoke(id: number): Promise<void> {
			return pine.delete({ resource: RESOURCE, id }).return();
		},

		/**
		 * @summary Accepts an invite
		 * @name accept
		 * @public
		 * @function
		 * @memberof balena.models.application.invite
		 *
		 * @description This method adds the calling user to the application.
		 *
		 * @param {String} invitationToken - invite token
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.accept("qwerty-invitation-token");
		 *
		 * @example
		 * balena.models.application.invite.accept("qwerty-invitation-token", function(error) {
		 * 	if (error) throw error;
		 * 	...
		 * });
		 */
		accept(invitationToken: string) {
			return Promise.try(() => {
				return request
					.send({
						method: 'POST',
						url: `/user/v1/invitation/${invitationToken}`,
						baseUrl: apiUrl,
					})
					.get('body')
					.catch(function (err: errors.BalenaRequestError) {
						if (err.statusCode === 401) {
							return new errors.BalenaNotLoggedIn();
						} else {
							return err;
						}
					});
			});
		},
	};
	return exports;
};

export default getApplicationInviteModel;
