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
	InjectedDependenciesParam,
	InjectedOptionsParam,
	Application,
	BalenaModel,
} from '..';
import { mergePineOptions } from '../util';
import type { ODataOptionsWithoutCount } from 'pinejs-client-core';

export interface ApplicationInviteOptions {
	invitee: string;
	roleName?: string;
	message?: string;
}

const RESOURCE = 'invitee__is_invited_to__application';
type ApplicationInvite = BalenaModel[typeof RESOURCE];

const getApplicationInviteModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
	getApplication: (
		slugOrUuidOrId: string | number,
		options?: ODataOptionsWithoutCount<Application['Read']>,
	) => Promise<Application['Read']>,
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
		 */
		getAll<T extends ODataOptionsWithoutCount<ApplicationInvite['Read']>>(
			options?: T,
		) {
			return pine.get({
				resource: RESOURCE,
				options: options,
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
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - invites
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.getAllByApplication('myorganization/myapp').then(function(invites) {
		 * 	console.log(invites);
		 * });
		 *
		 * @example
		 * balena.models.application.invite.getAllByApplication(123).then(function(invites) {
		 * 	console.log(invites);
		 * });
		 */
		async getAllByApplication<
			T extends ODataOptionsWithoutCount<ApplicationInvite['Read']>,
		>(slugOrUuidOrId: number | string, options?: T) {
			const { id } = await getApplication(slugOrUuidOrId, {
				$select: 'id',
			});
			return await exports.getAll(
				mergePineOptions(
					{ $filter: { is_invited_to__application: id } },
					options,
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
		 * @description This method invites a user by their email to an application.
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} options - invite creation parameters
		 * @param {String} options.invitee - the email of the invitee
		 * @param {String} [options.roleName="developer"] - the role name to be granted to the invitee
		 * @param {String} [message=null] - the message to send along with the invite
		 *
		 * @fulfil {String} - application invite
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.application.invite.create('myorganization/myapp', { invitee: "invitee@example.org", roleName: "developer", message: "join my app" }).then(function(invite) {
		 * 	console.log(invite);
		 * });
		 */
		async create(
			slugOrUuidOrId: string | number,
			{ invitee, roleName, message }: ApplicationInviteOptions,
		) {
			const [{ id }, roles] = await Promise.all([
				getApplication(slugOrUuidOrId, { $select: 'id' }),
				// eslint-disable-next-line @typescript-eslint/await-thenable -- Remove this once typescript-eslint re-allows Promise unions w/ non-Promises https://github.com/typescript-eslint/typescript-eslint/issues/11609
				roleName
					? pine.get({
							resource: 'application_membership_role',
							options: {
								$top: 1,
								$select: 'id',
								$filter: {
									name: roleName,
								},
							},
						})
					: undefined,
			]);

			const body: Partial<ApplicationInvite['Write']> = {
				is_invited_to__application: id,
				// @ts-expect-error this doesn't actually exist in the model and is a hooks thing :(
				invitee,
				message,
			};
			if (roles) {
				const roleId = roles[0]?.id;
				// Throw if the user provided a roleName, but we didn't find that role
				if (!roleId && roleName) {
					throw new errors.BalenaApplicationMembershipRoleNotFound(roleName);
				}
				body.application_membership_role = roleId;
			}
			return await pine.post({
				resource: RESOURCE,
				body,
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
		 */
		async revoke(id: number): Promise<void> {
			await pine.delete({ resource: RESOURCE, id });
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
		 */
		async accept(invitationToken: string): Promise<void> {
			try {
				await request.send({
					method: 'POST',
					url: `/user/v1/invitation/${invitationToken}`,
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

export default getApplicationInviteModel;
