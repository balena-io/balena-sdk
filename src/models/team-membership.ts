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
import type { InjectedDependenciesParam, TeamMembership } from '..';
import { mergePineOptions } from '../util';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';

const getTeamMembershipModel = function (deps: InjectedDependenciesParam) {
	const { pine } = deps;

	const exports = {
		/**
		 * @summary Get a single team membership
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.team.membership
		 *
		 * @description
		 * This method returns a single team membership.
		 *
		 * @param {Number} membershipId - the team membership id
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - team membership
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.team.membership.get(5).then(function(membership) {
		 * 	console.log(membership);
		 * });
		 */
		async get<T extends ODataOptionsWithoutCount<TeamMembership['Read']>>(
			membershipId: number,
			options?: T,
		): Promise<
			OptionsToResponse<TeamMembership['Read'], T, undefined>[number]
		> {
			if (typeof membershipId !== 'number') {
				throw new errors.BalenaInvalidParameterError(
					'membershipId',
					membershipId,
				);
			}

			const result = await pine.get({
				resource: 'team_membership',
				id: membershipId,
				options,
			});
			if (result == null) {
				throw new errors.BalenaError(
					`Team Membership not found: ${membershipId}`,
				);
			}
			return result;
		},

		/**
		 * @summary Get all memberships by team
		 * @name getAllByTeam
		 * @public
		 * @function
		 * @memberof balena.models.team.membership
		 *
		 * @description
		 * This method returns all team memberships for a specific team.
		 *
		 * @param {Number} teamId - the team id
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - team memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.team.membership.getAllByTeam(123).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async getAllByTeam<
			T extends ODataOptionsWithoutCount<TeamMembership['Read']>,
		>(
			teamId: number,
			options?: T,
		): Promise<OptionsToResponse<TeamMembership['Read'], T, undefined>> {
			return (await pine.get({
				resource: 'team_membership',
				options: mergePineOptions(
					{ $filter: { is_member_of__team: teamId } },
					options,
				),
			})) as OptionsToResponse<TeamMembership['Read'], T, undefined>;
		},

		/**
		 * @summary Get all memberships by user
		 * @name getAllByUser
		 * @public
		 * @function
		 * @memberof balena.models.team.membership
		 *
		 * @description
		 * This method returns all team memberships for a specific user.
		 *
		 * @param {String|Number} usernameOrId - the user's username (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - team memberships
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.team.membership.getAllByUser('balena_os').then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 *
		 * @example
		 * balena.models.team.membership.getAllByUser(123).then(function(memberships) {
		 * 	console.log(memberships);
		 * });
		 */
		async getAllByUser<
			T extends ODataOptionsWithoutCount<TeamMembership['Read']>,
		>(
			usernameOrId: number | string,
			options?: T,
		): Promise<OptionsToResponse<TeamMembership['Read'], T, undefined>> {
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
				resource: 'team_membership',
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
			})) as OptionsToResponse<TeamMembership['Read'], T, undefined>;
		},

		/**
		 * @summary Creates a new membership for a team
		 * @name create
		 * @public
		 * @function
		 * @memberof balena.models.team.membership
		 *
		 * @description This method adds a user to a team by their username.
		 *
		 * @param {Object} options - membership creation parameters
		 * @param {Number} options.team - team id
		 * @param {String} options.username - the username of the balena user that will become a member
		 *
		 * @fulfil {Object} - team membership
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.team.membership.create({ team: 123, username: "user123" }).then(function(membership) {
		 * 	console.log(membership);
		 * });
		 */
		async create({
			team,
			username,
		}: {
			team: number;
			username: string;
		}): Promise<TeamMembership['Read']> {
			return await pine.post({
				resource: 'team_membership',
				body: {
					username,
					is_member_of__team: team,
				} as Partial<TeamMembership['Write']>,
			});
		},

		/**
		 * @summary Remove a team membership
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.team.membership
		 *
		 * @param {Number|Number[]} idOrIds - team membership id or array of team membership ids
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.team.membership.remove(123);
		 *
		 * @example
		 * balena.models.team.membership.remove([123, 456]);
		 */
		async remove(idOrIds: number | number[]): Promise<void> {
			const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
			await pine.delete({
				resource: 'team_membership',
				options: {
					$filter: {
						id: { $in: ids },
					},
				},
			});
		},
	};
	return exports;
};

export default getTeamMembershipModel;
