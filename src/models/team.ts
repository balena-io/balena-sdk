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
import type { InjectedDependenciesParam, PinePostResult, Team } from '..';
import * as errors from 'balena-errors';
import { isId, isNotFoundResponse, mergePineOptions } from '../util';

const getTeamModel = function (deps: InjectedDependenciesParam) {
	const { pine, sdkInstance } = deps;

	/**
	 * @summary Creates a new Team
	 * @name create
	 * @public
	 * @function
	 * @memberof balena.models.team
	 *
	 * @description This method creates a new team.
	 *
	 * @param {Number} organizationSlugOrId - Required: the organization slug or id the team will be part of.
	 * @param {String} name - Required: the name of the team that will be created.
	 *
	 * @fulfil {Object} - Team
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.create(1239948, 'MyTeam').then(function(team) {
	 * 	console.log(team);
	 * });
	 *
	 * @example
	 * balena.models.team.create('myOrgHandle', 'MyTeam')
	 * .then(function(team) {
	 *   console.log(team);
	 * });
	 */
	const create = async function (
		organizationSlugOrId: string | number,
		name: string,
	): Promise<PinePostResult<Team>> {
		const orgId = isId(organizationSlugOrId)
			? organizationSlugOrId
			: (await sdkInstance.models.organization.get(organizationSlugOrId))?.id;

		if (orgId == null) {
			throw new errors.BalenaOrganizationNotFound(organizationSlugOrId);
		}

		const teams = await sdkInstance.models.team.getAllByOrganization(orgId);

		if (teams.some((t) => t.name === name)) {
			throw new Error(
				`A team with this name already exists in the organization. Organization: ${orgId}, Name: ${name}`,
			);
		}

		return pine.post({
			resource: 'team',
			body: {
				name,
				belongs_to__organization: orgId,
			},
		});
	};

	/**
	 * @summary Get all Teams of a specific Organization
	 * @name getAllByOrganization
	 * @public
	 * @function
	 * @memberof balena.models.team
	 *
	 * @param {Number} organizationSlugOrId - Required: the organization slug or id the team is part of.
	 * @param {Object} [options={}] - extra pine options to use
	 *
	 * @fulfil {Object[]} - Teams
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.getAllByOrganization(123).then(function(teams) {
	 * 	console.log(teams);
	 * });
	 *
	 * @example
	 * balena.models.team.getAllByOrganization('MyOrganizationHandle').then(function(teams) {
	 * 	console.log(teams);
	 * });
	 */
	const getAllByOrganization = function (
		organizationSlugOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Team> = {},
	): Promise<BalenaSdk.Team[]> {
		return pine.get({
			resource: 'team',
			options: mergePineOptions(
				{
					$filter: {
						belongs_to__organization: isId(organizationSlugOrId)
							? organizationSlugOrId
							: { handle: organizationSlugOrId },
					},
				},
				options,
			),
		});
	};

	/**
	 * @summary Get a single Team
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.team
	 *
	 * @param {Number} teamId - team id (number).
	 * @param {Object} [options={}] - extra pine options to use
	 *
	 * @fulfil {Object} - Team
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.get(123).then(function(team) {
	 * 	console.log(team);
	 * });
	 */
	const get = async function (
		teamId: number,
		options: BalenaSdk.PineOptions<BalenaSdk.Team> = {},
	): Promise<BalenaSdk.Team> {
		if (teamId == null) {
			throw new errors.BalenaInvalidParameterError('id', teamId);
		}

		const team = await pine.get({
			resource: 'team',
			id: teamId,
			options,
		});
		if (team == null) {
			throw new Error(`Team not found: ${teamId}`);
		}
		return team;
	};

	/**
	 * @summary Rename Team
	 * @name rename
	 * @public
	 * @function
	 * @memberof balena.models.team
	 *
	 * @param {Number} teamId - team id (number)
	 * @param {String} newName - new team name (string)
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.rename(123, 'MyNewTeamName');
	 */
	const rename = async function (
		teamId: number,
		newTeamName: string,
	): Promise<void> {
		const team = await get(teamId, {
			$select: 'id',
			$expand: { belongs_to__organization: { $select: 'id' } },
		});
		console.log(team);
		if (team == null) {
			throw new Error(`Team not found: ${teamId}`);
		}

		const orgId =
			Array.isArray(team.belongs_to__organization) &&
			team.belongs_to__organization[0] &&
			'id' in team.belongs_to__organization[0]
				? team.belongs_to__organization[0].id
				: undefined;

		if (orgId == null) {
			throw new Error(`Team does not belong to any organization: ${teamId}`);
		}
		const teams = await getAllByOrganization(orgId);

		if (teams.some((t) => t.name === newTeamName)) {
			throw new Error(
				`A team with this name already exists in the organization. Organization: ${orgId}, Name: ${newTeamName}`,
			);
		}

		await pine.patch({
			resource: 'team',
			id: teamId,
			body: {
				name: newTeamName,
			},
		});
	};

	/**
	 * @summary Remove a Team
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.team
	 *
	 * @param {Number} teamId - team id (number).
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.team.remove(123);
	 */
	const remove = async function (teamId: number): Promise<void> {
		try {
			await pine.delete<BalenaSdk.Organization>({
				resource: 'team',
				id: teamId,
			});
		} catch (err) {
			if (isNotFoundResponse(err)) {
				throw new Error(`Team not found: ${teamId}`);
			}
			throw err;
		}
	};

	return {
		create,
		getAllByOrganization,
		get,
		rename,
		remove,
	};
};

export default getTeamModel;