/*
Copyright 2024 Balena

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
import { isId, mergePineOptions } from '../util';

const getIdpMembershipModel = (deps: InjectedDependenciesParam) => {
	const { pine } = deps;

	/**
	 * @summary Creates a new identity provider membership
	 * @name create
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider.membership
	 *
	 * @description This method creates a new identity provider membership.
	 * @param {Object} options - identity provider memberships parameters.
	 * @param {Number} options.is_authorized_by__identity_provider - Required: the IdP id.
	 * @param {Number} options.authorizes__organization - Required: the organization id.
	 * @param {Number} [options.grants_access_to__team] - Team id users will be granted access to.
	 *
	 * @fulfil {Object} - identity provider membership
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identity provider.membership.create({
	 * 	authorizes__organization: 123
	 * 	is_authorized_by__identity_provider: 456,
	 * 	grants_access_to__team: 789,
	 * }).then(function(idpm) {
	 * 	console.log(idpm);
	 * });
	 *
	 */
	const create = (
		idpm: BalenaSdk.PineSubmitBody<BalenaSdk.IdentityProviderMembership>,
	): Promise<
		BalenaSdk.PinePostResult<BalenaSdk.IdentityProviderMembership>
	> => {
		return pine.post({
			resource: 'identity_provider_membership',
			body: idpm,
		});
	};

	/**
	 * @summary Get a single identity provider membership
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider.membership
	 *
	 * @param {Number} membershipId - identity provider membership id (number).
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - identity provider membership
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.membership.get(123).then(function(identityProviderMembership) {
	 * 	console.log(identityProviderMembership);
	 * });
	 */
	const get = async (
		membershipId: number,
		options: BalenaSdk.PineOptions<BalenaSdk.IdentityProviderMembership> = {},
	): Promise<BalenaSdk.IdentityProviderMembership> => {
		if (membershipId == null || !isId(membershipId)) {
			throw new errors.BalenaInvalidParameterError('id', membershipId);
		}

		const idp = await pine.get({
			resource: 'identity_provider_membership',
			id: membershipId,
			options,
		});
		if (idp == null) {
			// TODO add to balena errors
			throw new Error('Identity Provider Membership Not found');
		}
		return idp;
	};

	/**
	 * @summary Get all accessible memberships for a given IdP
	 * @name getAllByIdp
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider.membership
	 *
	 * @param {Number} idpId - identity provider id (number).
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - identity provider memberships
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.getAll().then(function(identityProviderMemberships) {
	 * 	console.log(identityProviderMemberships);
	 * });
	 */
	const getAllByIdp = async (
		idpId: number,
		options: BalenaSdk.PineOptions<BalenaSdk.IdentityProviderMembership> = {},
	): Promise<BalenaSdk.IdentityProviderMembership[]> => {
		return pine.get({
			resource: 'identity_provider_membership',
			options: mergePineOptions(
				{
					$filter: { is_authorized_by__identity_provider: idpId },
					$orderby: 'created_at desc',
				},
				options,
			),
		});
	};

	/**
	 * @summary Removes an identity provider membership
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider.membership
	 *
	 * @param {Number} id - identity provider membership id (number).
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.membership.remove(123);
	 */
	const remove = async (id: number): Promise<void> => {
		await get(id);
		await pine.delete({
			resource: 'identity_provider_membership',
			id,
		});
	};

	/**
	 * @summary Changes the default team of an identity provider membership
	 * @name setDefaultTeam
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider.membership
	 *
	 * @param {Number} membershipId - identity provider membership id (number).
	 * @param {Number} teamId - team id (number).
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.membership.setDefaultTeam(123, 456);
	 */
	const setDefaultTeam = async (
		membershipId: number,
		teamId: number | null,
	): Promise<void> => {
		await pine.patch({
			resource: 'identity_provider_membership',
			id: membershipId,
			body: {
				grants_access_to__team: teamId,
			},
		});
	};

	return {
		create,
		get,
		getAllByIdp,
		remove,
		setDefaultTeam,
	};
};

export default getIdpMembershipModel;
