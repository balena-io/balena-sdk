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
import * as Bluebird from 'bluebird';

import type * as BalenaSdk from '../..';
import { InjectedDependenciesParam } from '..';
import {
	isId,
	isNotFoundResponse,
	mergePineOptions,
	treatAsMissingOrganization,
} from '../util';

const getOrganizationModel = function (deps: InjectedDependenciesParam) {
	const { pine } = deps;

	const getId = (handleOrId: string | number) =>
		get(handleOrId, { $select: 'id' }).then(({ id }) => id);

	/**
	 * @summary Creates a new organization
	 * @name create
	 * @public
	 * @function
	 * @memberof balena.models.organization
	 *
	 * @description This method creates a new organization with the current user as an administrator.
	 *
	 * @param {Object} options - Organization parameters to use.
	 * @param {String} options.name - Required: the name of the organization that will be created.
	 * @param {String} [options.handle] - The handle of the organization that will be created.
	 *
	 * @fulfil {String} - Organization
	 * @returns {Bluebird}
	 *
	 * @example
	 * balena.models.organization.create({ name:'MyOrganization' }).then(function(organization) {
	 * 	console.log(organization);
	 * });
	 *
	 * @example
	 * balena.models.organization.create({ name:'MyOrganization' }, function(error, organization) {
	 * 	if (error) throw error;
	 * 	console.log(organization);
	 * });
	 */
	const create = function (
		organization: BalenaSdk.PineSubmitBody<BalenaSdk.Organization>,
	): Bluebird<BalenaSdk.Organization> {
		return pine.post<BalenaSdk.Organization>({
			resource: 'organization',
			body: organization,
		});
	};

	/**
	 * @summary Get all Organizations
	 * @name getAll
	 * @public
	 * @function
	 * @memberof balena.models.organization
	 *
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - organizations
	 * @returns {Bluebird}
	 *
	 * @example
	 * balena.models.organization.getAll().then(function(organizations) {
	 * 	console.log(organizations);
	 * });
	 *
	 * @example
	 * balena.models.organization.getAll(function(error, organizations) {
	 * 	if (error) throw error;
	 * 	console.log(organizations);
	 * });
	 */
	const getAll = function (
		options: BalenaSdk.PineOptions<BalenaSdk.Organization> = {},
	): Bluebird<BalenaSdk.Organization[]> {
		return pine.get<BalenaSdk.Organization>({
			resource: 'organization',
			options: mergePineOptions(
				{
					$orderby: 'name asc',
				},
				options,
			),
		});
	};

	/**
	 * @summary Get a single organization
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.organization
	 *
	 * @param {String|Number} handleOrId - organization handle (string) or id (number).
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - organization
	 * @returns {Bluebird}
	 *
	 * @example
	 * balena.models.organization.get('myorganization').then(function(organization) {
	 * 	console.log(organization);
	 * });
	 *
	 * @example
	 * balena.models.organization.get(123).then(function(organization) {
	 * 	console.log(organization);
	 * });
	 *
	 * @example
	 * balena.models.organization.get('myorganization', function(error, organization) {
	 * 	if (error) throw error;
	 * 	console.log(organization);
	 * });
	 */
	const get = function (
		handleOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Organization> = {},
	) {
		return Bluebird.try(() => {
			if (handleOrId == null) {
				throw new errors.BalenaInvalidParameterError('handleOrId', handleOrId);
			}
			if (isId(handleOrId)) {
				return pine
					.get<BalenaSdk.Organization>({
						resource: 'organization',
						id: handleOrId,
						options: mergePineOptions({}, options),
					})
					.then((organization) => {
						if (organization == null) {
							throw new errors.BalenaOrganizationNotFound(handleOrId);
						}
						return organization;
					});
			}

			return pine
				.get<BalenaSdk.Organization>({
					resource: 'organization',
					options: mergePineOptions(
						{
							$filter: {
								handle: handleOrId,
							},
						},
						options,
					),
				})
				.then((organizations) => {
					if (!organizations || organizations.length === 0) {
						throw new errors.BalenaOrganizationNotFound(handleOrId);
					}
					return organizations[0];
				});
		});
	};

	/**
	 * @summary Remove an Organization
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.organization
	 *
	 * @param {String|Number} handleOrId - organization handle (string) or id (number).
	 * @returns {Bluebird}
	 *
	 * @example
	 * balena.models.organization.remove(123);
	 *
	 * @example
	 * balena.models.organization.remove(123, function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	const remove = function (handleOrId: string | number): Bluebird<void> {
		return getId(handleOrId)
			.then((id) =>
				pine.delete<BalenaSdk.Organization>({
					resource: 'organization',
					id,
				}),
			)
			.return()
			.catch((err) => {
				if (isNotFoundResponse(err)) {
					treatAsMissingOrganization(handleOrId, err);
				}
				throw err;
			});
	};

	return {
		create,
		getAll,
		get,
		remove,
	};
};

export default getOrganizationModel;
