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

import type * as BalenaSdk from '..';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import { isId, mergePineOptions } from '../util';

const getOrganizationModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine, sdkInstance } = deps;

	/* eslint-disable @typescript-eslint/no-require-imports */
	const membershipModel = (
		require('./organization-membership') as typeof import('./organization-membership')
	).default(deps, (...args: Parameters<typeof get>) => get(...args));

	const inviteModel = (
		require('./organization-invite') as typeof import('./organization-invite')
	).default(deps, opts, (...args: Parameters<typeof get>) => get(...args));
	/* eslint-enable @typescript-eslint/no-require-imports */

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
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.organization.create({ name:'MyOrganization' }).then(function(organization) {
	 * 	console.log(organization);
	 * });
	 *
	 * @example
	 * balena.models.organization.create({
	 *   name:'MyOrganization',
	 *   // Only in case File API is avaialable (most browsers and Node 20+)
	 *   logo_image: new File(
	 *     imageContent,
	 *     'img.jpeg'
	 *   );
	 * })
	 * .then(function(organization) {
	 *   console.log(organization);
	 * });
	 */
	const create = function (
		organization: BalenaSdk.PineSubmitBody<BalenaSdk.Organization>,
	): Promise<BalenaSdk.PinePostResult<BalenaSdk.Organization>> {
		return pine.post({
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
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.organization.getAll().then(function(organizations) {
	 * 	console.log(organizations);
	 * });
	 */
	const getAll = function (
		options: BalenaSdk.PineOptions<BalenaSdk.Organization> = {},
	): Promise<BalenaSdk.Organization[]> {
		return pine.get({
			resource: 'organization',
			options: mergePineOptions(
				{
					$orderby: { name: 'asc' },
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
	 * @returns {Promise}
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
	 */
	const get = async function (
		handleOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Organization> = {},
	): Promise<BalenaSdk.Organization> {
		if (handleOrId == null) {
			throw new errors.BalenaInvalidParameterError('handleOrId', handleOrId);
		}

		const organization = await pine.get({
			resource: 'organization',
			id: isId(handleOrId) ? handleOrId : { handle: handleOrId },
			options,
		});
		if (organization == null) {
			throw new errors.BalenaOrganizationNotFound(handleOrId);
		}
		return organization;
	};

	/**
	 * @summary Remove an Organization
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.organization
	 *
	 * @param {String|Number} handleOrId - organization handle (string) or id (number).
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.organization.remove(123);
	 */
	const remove = async function (handleOrId: string | number): Promise<void> {
		const id = (
			await sdkInstance.models.organization.get(handleOrId, { $select: 'id' })
		).id;
		await pine.delete<BalenaSdk.Organization>({
			resource: 'organization',
			id,
		});
	};

	return {
		create,
		getAll,
		get,
		remove,
		/**
		 * @namespace balena.models.organization.membership
		 * @memberof balena.models.organization
		 */
		membership: membershipModel,
		/**
		 * @namespace balena.models.organization.invite
		 * @memberof balena.models.organization
		 */
		invite: inviteModel,
	};
};

export default getOrganizationModel;
