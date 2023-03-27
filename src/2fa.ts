/*
Copyright 2016 Balena

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

import { InjectedDependenciesParam, InjectedOptionsParam } from '.';

const get2fa = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { auth, request } = deps;
	const { apiUrl } = opts;

	/**
	 * @summary Check if two factor authentication is enabled
	 * @name isEnabled
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @fulfil {Boolean} - whether 2fa is enabled
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.twoFactor.isEnabled().then(function(isEnabled) {
	 * 	if (isEnabled) {
	 * 		console.log('2FA is enabled for this account');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.auth.twoFactor.isEnabled(function(error, isEnabled) {
	 * 	if (error) throw error;
	 *
	 * 	if (isEnabled) {
	 * 		console.log('2FA is enabled for this account');
	 * 	}
	 * });
	 */
	async function isEnabled(): Promise<boolean> {
		const twoFactorRequired = await auth.needs2FA();
		return twoFactorRequired != null;
	}

	/**
	 * @summary Check if two factor authentication challenge was passed
	 * @name isPassed
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @fulfil {Boolean} - whether 2fa challenge was passed
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.twoFactor.isPassed().then(function(isPassed) {
	 * 	if (isPassed) {
	 * 		console.log('2FA challenge passed');
	 * 	}
	 * });
	 *
	 * @example
	 * balena.auth.twoFactor.isPassed(function(error, isPassed) {
	 * 	if (error) throw error;
	 *
	 * 	if (isPassed) {
	 * 		console.log('2FA challenge passed');
	 * 	}
	 * });
	 */
	async function isPassed(): Promise<boolean> {
		const twoFactorRequired = await auth.needs2FA();
		return !twoFactorRequired;
	}

	/**
	 * @summary Verify two factor authentication
	 * @name verify
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @description Verifies two factor authentication.
	 * Note that this method not update the token automatically.
	 * You should use {@link balena.auth.twoFactor.challenge} when possible,
	 * as it takes care of that as well.
	 *
	 * @param {String} code - code
	 * @fulfil {String} - session token
	 * @returns {Promise}
	 *
	 * @example
	 * const token = balena.auth.twoFactor.verify('1234');
	 * balena.auth.loginWithToken(token);
	 *
	 * @example
	 * balena.auth.twoFactor.verify('1234', function(error, token) {
	 * 	if (error) throw error;
	 * 	console.log(token);
	 * });
	 */
	async function verify(code: string): Promise<string> {
		const { body: token } = await request.send<string>({
			method: 'POST',
			url: '/auth/totp/verify',
			baseUrl: apiUrl,
			body: { code },
		});
		return token;
	}

	/**
	 * @summary Get two factor authentication setup key
	 * @name getSetupKey
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @description Retrieves a setup key for enabling two factor authentication.
	 *
	 * @fulfil {String} - setup key
	 * @returns {Promise}
	 *
	 * @example
	 * const setupKey = balena.auth.twoFactor.getSetupKey();
	 * console.log(setupKey);
	 *
	 * @example
	 * balena.auth.twoFactor.getSetupKey(function(error, setupKey) {
	 * 	if (error) throw error;
	 * 	console.log(setupKey);
	 * });
	 */
	async function getSetupKey(): Promise<string> {
		const { body: setupKey } = await request.send<string>({
			method: 'GET',
			url: '/auth/totp/setup',
			baseUrl: apiUrl,
		});
		return setupKey;
	}

	/**
	 * @summary Enable two factor authentication
	 * @name enable
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @description Enables two factor authentication.
	 *
	 * @param {String} code - code
	 * @fulfil {String} - session token
	 * @returns {Promise}
	 *
	 * @example
	 * const token = balena.auth.twoFactor.enable('1234');
	 * balena.auth.loginWithToken(token);
	 *
	 * @example
	 * balena.auth.twoFactor.enable('1234', function(error, token) {
	 * 	if (error) throw error;
	 * 	console.log(token);
	 * });
	 */
	const enable = async (code: string): Promise<string> => {
		const token = await verify(code);
		await auth.setKey(token);
		return token;
	};

	/**
	 * @summary Challenge two factor authentication and complete login
	 * @name challenge
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @description You should use {@link balena.auth.login} when possible,
	 * as it takes care of saving the token and email as well.
	 *
	 * @param {String} code - code
	 * @returns {Promise}
	 *
	 * @example
	 * balena.auth.twoFactor.challenge('1234');
	 *
	 * @example
	 * balena.auth.twoFactor.challenge('1234', function(error) {
	 * 	if (error) throw error;
	 * });
	 */
	async function challenge(code: string): Promise<void> {
		const token = await verify(code);
		await auth.setKey(token);
	}

	/**
	 * @summary Disable two factor authentication
	 * @name disable
	 * @public
	 * @function
	 * @memberof balena.auth.twoFactor
	 *
	 * @description Disables two factor authentication.
	 *
	 * @param {String} password - password
	 * @fulfil {String} - session token
	 * @returns {Promise}
	 *
	 * @example
	 * const token = balena.auth.twoFactor.disable('1234');
	 * balena.auth.loginWithToken(token);
	 *
	 * @example
	 * balena.auth.twoFactor.disable('1234', function(error, token) {
	 * 	if (error) throw error;
	 * 	console.log(token);
	 * });
	 */
	async function disable(password: string): Promise<string> {
		const { body: token } = await request.send<string>({
			method: 'POST',
			url: '/auth/totp/disable',
			baseUrl: apiUrl,
			body: { password },
		});
		await auth.setKey(token);
		return token;
	}

	return {
		isEnabled,
		isPassed,
		getSetupKey,
		enable,
		verify,
		challenge,
		disable,
	};
};

export default get2fa;
