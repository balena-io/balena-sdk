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

import type { InjectedDependenciesParam, Team } from '..';
import * as errors from 'balena-errors';
import { isId, mergePineOptions } from '../util';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';

const getTeamModel = function (deps: InjectedDependenciesParam) {
	const { pine, sdkInstance } = deps;

	/* eslint-disable @typescript-eslint/no-require-imports */
	const applicationAccessModel = (
		require('./team-application-access') as typeof import('./team-application-access')
	).default(deps);

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
	) {
		const orgId = (
			await sdkInstance.models.organization.get(organizationSlugOrId, {
				$select: 'id',
			})
		).id;

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
	const getAllByOrganization = async function <
		T extends ODataOptionsWithoutCount<Team['Read']>,
	>(
		organizationSlugOrId: string | number,
		options?: T,
	): Promise<OptionsToResponse<Team['Read'], T, undefined>> {
		const organization = await sdkInstance.models.organization.get(
			organizationSlugOrId,
			{ $select: 'id' },
		);

		return (await pine.get({
			resource: 'team',
			options: mergePineOptions(
				{
					$filter: {
						belongs_to__organization: isId(organization.id)
							? organization.id
							: {
									$any: {
										$alias: 'bto',
										$expr: {
											bto: { handle: organization.id },
										},
									},
								},
					},
				},
				options,
			),
		})) as OptionsToResponse<Team['Read'], T, undefined>;
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
	const get = async function <T extends ODataOptionsWithoutCount<Team['Read']>>(
		teamId: number,
		options?: T,
	): Promise<OptionsToResponse<Team['Read'], T, undefined>[number]> {
		if (teamId == null) {
			throw new errors.BalenaInvalidParameterError('teamId', teamId);
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
		const teamOptions = {
			$select: 'id',
			$expand: {
				belongs_to__organization: {
					$select: 'id',
					$expand: {
						owns__team: {
							$top: 1,
							$select: 'name',
							$filter: {
								name: newTeamName,
							},
						},
					},
				},
			},
		} as const;
		const team = await get(teamId, teamOptions);
		const org = team.belongs_to__organization[0];

		if (org.id == null) {
			throw new Error(`Team does not belong to any organization: ${teamId}`);
		}

		if (org.owns__team.length > 0) {
			throw new Error(
				`A team with this name already exists in the organization. Organization: ${org.id}, Name: ${newTeamName}`,
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
		await pine.delete({
			resource: 'team',
			id: teamId,
		});
	};

	return {
		create,
		getAllByOrganization,
		get,
		rename,
		remove,
		/**
		 * @namespace balena.models.team.applicationAccess
		 * @memberof balena.models.team
		 */
		applicationAccess: applicationAccessModel,
	};
};

export default getTeamModel;
