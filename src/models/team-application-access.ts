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

import type * as BalenaSdk from '..';
import type { InjectedDependenciesParam } from '..';
import * as errors from 'balena-errors';
import { mergePineOptions } from '../util';

const getTeamApplicationAccessModel = function (
	deps: InjectedDependenciesParam,
) {
	const { pine, sdkInstance } = deps;

	const getRoleId = async (roleName: BalenaSdk.ApplicationMembershipRoles) => {
		const role = await pine.get({
			resource: 'application_membership_role',
			id: {
				name: roleName,
			},
			options: {
				$select: 'id',
			},
		});
		if (!role) {
			throw new errors.BalenaApplicationMembershipRoleNotFound(roleName);
		}
		return role.id;
	};

	/**
	 * @summary Get all team applications access
	 * @name getAllByTeam
	 * @public
	 * @function
	 * @memberof balena.models.team.applicationAccess
	 *
	 * @description This method get all team application access.
	 *
	 * @param {Number} teamId - Required: the team id.
	 * @param {Object} [options={}] - extra pine options to use
	 *
	 * @fulfil {Object[]} - team application access
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.applicationAccess.getAllByTeam(1239948).then(function(teamApplicationAccesses) {
	 * 	console.log(teamApplicationAccesses);
	 * });
	 */
	const getAllByTeam = async function (
		teamId: number,
		options: BalenaSdk.PineOptions<BalenaSdk.TeamApplicationAccess> = {},
	): Promise<BalenaSdk.TeamApplicationAccess[]> {
		const team = await sdkInstance.models.team.get(teamId, { $select: 'id' });

		return sdkInstance.pine.get({
			resource: 'team_application_access',
			options: mergePineOptions(
				{
					$filter: {
						team: team.id,
					},
				},
				options,
			),
		});
	};

	/**
	 * @summary Get team applications access
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.team.applicationAccess
	 *
	 * @description This method get specific team application access.
	 *
	 * @param {Number} teamApplicationAccessId - Required: the team application access id.
	 * @param {Object} [options={}] - extra pine options to use
	 *
	 * @fulfil {Object} - TeamApplicationAccess
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.applicationAccess.get(1239948).then(function(teamApplicationAccess) {
	 * 	console.log(teamApplicationAccess);
	 * });
	 */
	const get = async function (
		teamApplicationAccessId: number,
		options: BalenaSdk.PineOptions<BalenaSdk.TeamApplicationAccess> = {},
	): Promise<BalenaSdk.TeamApplicationAccess | undefined> {
		const teamApplicationAccess = await sdkInstance.pine.get({
			resource: 'team_application_access',
			id: teamApplicationAccessId,
			options,
		});
		if (teamApplicationAccess == null) {
			throw new Error('Team application access not found');
		}
		return teamApplicationAccess;
	};

	/**
	 * @summary Add applications access to team
	 * @name add
	 * @public
	 * @function
	 * @memberof balena.models.team.applicationAccess.add
	 *
	 * @description This method add application access to team.
	 *
	 * @param {Number} teamId - Required: the team id the application access will be granted for.
	 * @param {Number|String} applicationIdOrSlug - Required: application id or slug
	 * @param {String} RoleName - Required: application membership role name (ApplicationMembershipRoles)
	 *
	 * @fulfil {Object} - TeamApplicationAccess
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.applicationAccess.add(1239948, 'MyAppSlug', 'developer').then(function(teamApplicationAccess) {
	 * 	console.log(teamApplicationAccess);
	 * });
	 *
	 * @example
	 * balena.models.team.applicationAccess.add(1239948, 456789, 'observer').then(function(teamApplicationAccess) {
	 * 	console.log(teamApplicationAccess);
	 * });
	 */
	const add = async function (
		teamId: number,
		applicationIdOrSlug: number | string,
		roleName: BalenaSdk.ApplicationMembershipRoles,
	): Promise<BalenaSdk.TeamApplicationAccess> {
		const appId = (
			await sdkInstance.models.application.get(applicationIdOrSlug, {
				$select: 'id',
			})
		)?.id;

		if (appId == null) {
			throw new errors.BalenaApplicationNotFound(applicationIdOrSlug);
		}
		const roleId = await getRoleId(roleName);

		return sdkInstance.pine.post({
			resource: 'team_application_access',
			body: {
				team: teamId,
				grants_access_to__application: appId,
				application_membership_role: roleId,
			},
		});
	};

	/**
	 * @summary Update team application access
	 * @name update
	 * @public
	 * @function
	 * @memberof balena.models.team.applicationAccess
	 *
	 * @description This method update a team application access role.
	 *
	 * @param {Number} teamApplicationAccessId - Required: the team application access id.
	 * @param {String} roleName - Required: The new role to assing (ApplicationMembershipRoles).
	 *
	 * @fulfil {Object} - TeamApplicationAccess
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.update(123, 'developer').then(function(teamApplicationAccess) {
	 * 	console.log(teamApplicationAccess);
	 * });
	 */
	const update = async function (
		teamApplicationAccessId: number,
		roleName: BalenaSdk.ApplicationMembershipRoles,
	): Promise<void> {
		const roleId = await getRoleId(roleName);

		await pine.patch({
			resource: 'team_application_access',
			id: teamApplicationAccessId,
			body: {
				application_membership_role: roleId,
			},
		});
	};

	/**
	 * @summary Remove team application access
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.team.applicationAccess
	 *
	 * @description This remove a team application access.
	 *
	 * @param {Number} teamApplicationAccessId - Required: the team application access id.
	 *
	 * @fulfil {void}
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.remove(123).then(function(teams) {
	 * 	console.log(teams);
	 * });
	 */
	const remove = async function (
		teamApplicationAccessId: number,
	): Promise<void> {
		await pine.delete({
			resource: 'team_application_access',
			id: teamApplicationAccessId,
		});
	};

	return {
		getAllByTeam,
		get,
		add,
		update,
		remove,
	};
};

export default getTeamApplicationAccessModel;
