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

const getIdpModel = (deps: InjectedDependenciesParam) => {
	const { pine } = deps;

	const membershipModel =
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		(
			require('./identity-provider-membership') as typeof import('./identity-provider-membership')
		).default(deps);

	/**
	 * @summary Creates a new identity provider
	 * @name create
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider
	 *
	 * @description This method creates a new identity provider for a given organization.
	 * @param {Object} options - identity provider parameters to use.
	 * @param {Number} options.organization_id - Required: the org id to which the idp will be created.
	 * @param {String} options.company_name - Required: the (unique) company identifier for logging in.
	 * @param {String} options.entry_point - Required: the URL to which the SAML request will be sent.
	 * @param {String} options.issuer - Required: the (unique) URL of the identity provider.
	 * @param {String} options.certificate - Required: the public certificate of the identity provider.
	 * @param {Boolean} [options.requires_signed_authn_response] - Require that all incoming authentication response messages be signed at the top level, not just at the assertions.
	 *
	 * @fulfil {Object} - identity provider
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identity provider.create({
	 * 	organization_id: 123
	 * 	company_name: 'my idp',
	 * 	entry_point: 'http://idp.example.com/entry_point',
	 * 	issuer: 'http://idp.example.com/issuer',
	 * 	certificate: 'abcd...',
	 * 	requires_signed_authn_response: false,
	 * }).then(function(idp) {
	 * 	console.log(idp);
	 * });
	 *
	 */
	const create = (
		idp: BalenaSdk.PineSubmitBody<
			BalenaSdk.IdentityProvider & { organization_id: string }
		>,
	): Promise<BalenaSdk.PinePostResult<BalenaSdk.IdentityProvider>> => {
		return pine.post({
			resource: 'identity_provider',
			body: idp,
		});
	};

	/**
	 * @summary Get a single identity provider
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider
	 *
	 * @param {Number} id - identity provider id (number).
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - identity provider
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.get(123).then(function(identityProvider) {
	 * 	console.log(identityProvider);
	 * });
	 */
	const get = async (
		id: number,
		options: BalenaSdk.PineOptions<BalenaSdk.IdentityProvider> = {},
	): Promise<BalenaSdk.IdentityProvider> => {
		if (id == null || !isId(id)) {
			throw new errors.BalenaInvalidParameterError('id', id);
		}

		const idp = await pine.get({
			resource: 'identity_provider',
			id,
			options,
		});
		if (idp == null) {
			// TODO add to balena errors
			throw new Error('Identity Provider Not found');
		}
		return idp;
	};

	/**
	 * @summary Get all accessible identity providers
	 * @name getAll
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider
	 *
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - identity providers
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.getAll().then(function(identityProviders) {
	 * 	console.log(identityProviders);
	 * });
	 */
	const getAll = async (
		options: BalenaSdk.PineOptions<BalenaSdk.IdentityProvider> = {},
	): Promise<BalenaSdk.IdentityProvider[]> => {
		return pine.get({
			resource: 'identity_provider',
			options: mergePineOptions(
				{
					$orderby: 'created_at desc',
				},
				options,
			),
		});
	};

	/**
	 * @summary Updates an identity provider
	 * @name update
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider
	 *
	 * @param {Number} id - the identity provider id (number).
	 * @param {Object} options - identity provider parameters to use.
	 * @param {String} [options.company_name] - the (unique) company identifier for logging in.
	 * @param {String} [options.entry_point] - the URL to which the SAML request will be sent.
	 * @param {String} [options.issuer] - the (unique) URL of the identity provider.
	 * @param {String} [options.certificate] - the public certificate of the identity provider.
	 * @param {Boolean} [options.requires_signed_authn_response] - Require that all incoming authentication response messages be signed at the top level, not just at the assertions.
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identity provider.update(123, {
	 * 	company_name: 'my new name idp',
	 * 	certificate: 'bcda...',
	 * }).then(function(idp) {
	 * 	console.log(idp);
	 * });
	 *
	 */
	const update = async (
		id: number,
		idp: Partial<BalenaSdk.PineSubmitBody<BalenaSdk.IdentityProvider>>,
	): Promise<void> => {
		await get(id);
		await pine.patch({
			resource: 'identity_provider',
			id,
			body: idp,
		});
	};

	/**
	 * @summary Removes an identity provider
	 * @name remove
	 * @public
	 * @function
	 * @memberof balena.models.identityProvider
	 *
	 * @param {Number} id - identity provider id (number).
	 * @fulfil {Object} - identity provider
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.identityProvider.remove(123);
	 */
	const remove = async (id: number): Promise<void> => {
		await get(id);
		await pine.delete({
			resource: 'identity_provider',
			id,
		});
	};

	return {
		create,
		get,
		getAll,
		remove,
		update,
		/**
		 * @namespace balena.models.identityProvider.membership
		 * @memberof balena.models.identityProvider
		 */
		membership: membershipModel,
	};
};

export default getIdpModel;
