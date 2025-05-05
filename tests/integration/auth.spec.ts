import { expect } from 'chai';
import { assertExists, expectError, timeSuite } from '../util';
import { authenticator } from 'otplib';

import {
	balena,
	sdkOpts,
	credentials,
	givenLoggedInUser,
	givenLoggedInUserWithApiKey,
	loginUserWith2FA,
	givenLoggedInWithADeviceApiKey,
	givenLoggedInWithAnApplicationApiKey,
	TEST_KEY_NAME_PREFIX,
} from './setup';
import type {
	WhoamiResult,
	UserKeyWhoAmIResponse,
	DeviceKeyWhoAmIResponse,
	ApplicationKeyWhoAmIResponse,
} from '../../src';

function assertWhoAmIType(
	whoamiResult: WhoamiResult | undefined,
	type: 'user',
): asserts whoamiResult is UserKeyWhoAmIResponse;
function assertWhoAmIType(
	whoamiResult: WhoamiResult | undefined,
	type: 'application',
): asserts whoamiResult is ApplicationKeyWhoAmIResponse;
function assertWhoAmIType(
	whoamiResult: WhoamiResult | undefined,
	type: 'device',
): asserts whoamiResult is DeviceKeyWhoAmIResponse;
function assertWhoAmIType(
	whoamiResult: WhoamiResult | undefined,
	type: WhoamiResult['actorType'],
) {
	assertExists(whoamiResult);
	expect(whoamiResult.actorType).to.equal(type);
}

describe('SDK authentication', function () {
	timeSuite(before);
	describe('when not logged in', function () {
		beforeEach(() => balena.auth.logout());

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be false', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be undefined', async function () {
				expect(await balena.auth.whoami()).to.be.undefined;
			});
		});

		describe('balena.auth.logout()', () => {
			it('should not be rejected', async function () {
				await balena.auth.logout();
			});
		});

		describe('balena.auth.authenticate()', function () {
			it('should not save the token given valid credentials', async () => {
				await balena.auth.authenticate(credentials);
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('should be rejected given invalid credentials', async function () {
				await expectError(
					async () => {
						await balena.auth.authenticate({
							email: credentials.username,
							password: 'NOT-THE-CORRECT-PASSWORD',
						});
					},
					(error) => {
						expect(error).to.have.property(
							'code',
							'BalenaInvalidLoginCredentials',
						);
					},
				);
			});
		});

		describe('balena.auth.getToken()', () => {
			it('should be rejected', async function () {
				await expectError(
					async () => {
						await balena.auth.getToken();
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});

		describe('balena.auth.loginWithToken()', function () {
			it('should be able to login with a session token', async () => {
				await balena.auth.loginWithToken(
					await balena.auth.authenticate(credentials),
				);
				expect(await balena.auth.getToken()).to.be.a('string');
			});

			it('should be able to login with an API Key', async () => {
				const token = await balena.auth.authenticate(credentials);
				await balena.auth.loginWithToken(token);
				const apiKey = await balena.models.apiKey.create({
					name: `${TEST_KEY_NAME_PREFIX}_apiKey`,
					expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
				});
				await balena.auth.logout();
				await balena.auth.loginWithToken(apiKey);
				expect(await balena.auth.getToken()).to.be.a('string');
			});
		});

		describe('balena.auth.getUserInfo()', () => {
			it('should be rejected with an error', async function () {
				await expectError(
					async () => {
						await balena.auth.getUserInfo();
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});

		describe('balena.auth.getActorId()', () => {
			it('should be rejected with an error', async function () {
				await expectError(
					async () => {
						await balena.auth.getActorId();
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});

		describe.skip('balena.auth.register()', function () {
			beforeEach(async () => {
				await balena.auth.login({
					email: credentials.register.email,
					password: credentials.register.password,
				});
				const { id: userId } = await balena.auth.getUserInfo();
				await balena.request.send({
					method: 'DELETE',
					url: `/v2/user(${userId})`,
					baseUrl: sdkOpts.apiUrl,
				});
				await balena.auth.logout().catch(function (err) {
					if (err.message === 'Request error: Unauthorized') {
						return;
					}
					throw err;
				});
			});

			it('should be able to register an account', async () => {
				const token = await balena.auth.register({
					email: credentials.register.email,
					password: credentials.register.password,
				});
				await balena.auth.loginWithToken(token);
				expect(await balena.auth.isLoggedIn()).to.be.true;
			});

			it('should not save the token automatically', async () => {
				await balena.auth.register({
					email: credentials.register.email,
					password: credentials.register.password,
				});
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('should be rejected if the email is invalid', async function () {
				await expectError(async () => {
					await balena.auth.register({
						email: 'foobarbaz',
						password: credentials.register.password,
					});
				}, 'Invalid email');
			});

			it('should be rejected if the email is taken', async function () {
				await expectError(async () => {
					await balena.auth.register({
						email: credentials.email,
						password: credentials.register.password,
					});
				}, 'This email is already taken');
			});
		});

		describe('given an invalid token', () => {
			describe('balena.auth.loginWithToken()', () => {
				it('should be not rejected', async () => {
					const token = await balena.auth.authenticate(credentials);
					await balena.auth.loginWithToken(`${token}malformingsuffix`);
					expect(await balena.auth.getToken()).to.be.a('string');
				});
			});
		});
	});

	describe('when logged in with an invalid token', function () {
		before(async () => {
			await balena.auth.logout();
			const token = await balena.auth.authenticate(credentials);
			await balena.auth.loginWithToken(`${token}malformingsuffix`);
		});

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be false', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be undefined', async function () {
				expect(await balena.auth.whoami()).to.be.undefined;
			});
		});

		describe('balena.auth.getUserInfo()', () => {
			it('should be rejected with an error', async function () {
				await expectError(
					async () => {
						await balena.auth.getUserInfo();
					},
					(error) => {
						expect(error).to.be.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});

		describe('balena.auth.getActorId()', () => {
			it('should be rejected with an error', async function () {
				await expectError(
					async () => {
						await balena.auth.getActorId();
					},
					(error) => {
						expect(error).to.be.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});
	});

	describe('when logged in with credentials', function () {
		givenLoggedInUser(before);

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be true', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.true;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be the user whoami response', async function () {
				const whoamiResult = await balena.auth.whoami();
				assertWhoAmIType(whoamiResult, 'user');
				expect(whoamiResult.username).to.equal(credentials.username);
				expect(whoamiResult.email).to.equal(credentials.email);
				expect(whoamiResult).to.have.property('id').that.is.a('number');
				expect(whoamiResult)
					.to.have.property('actorTypeId')
					.that.is.a('number');
			});
		});

		describe('balena.auth.getUserInfo()', () => {
			it('should be rejected with an error', async function () {
				const userInfo = await balena.auth.getUserInfo();
				expect(userInfo.email).to.equal(credentials.email);
				expect(userInfo.username).to.equal(credentials.username);
				const whoamiResult = await balena.auth.whoami();
				assertWhoAmIType(whoamiResult, 'user');

				expect(userInfo).to.have.property('id', whoamiResult.actorTypeId);
				expect(userInfo).to.have.property('actor', whoamiResult.id);
			});
		});

		describe('balena.auth.getActorId()', () => {
			it('should eventually be an actor id', async () => {
				const actorId = await balena.auth.getActorId();
				expect(actorId).to.be.a('number');
				expect(actorId).to.equal((await balena.auth.whoami())?.id);
			});
		});

		describe('balena.auth.logout()', () => {
			it('should logout the user', async () => {
				await balena.auth.logout();
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});
		});
	});

	describe('when logged in with a device API Key', function () {
		givenLoggedInWithADeviceApiKey(before);

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be true', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.true;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be the device whoami response', async function () {
				const whoamiResult = await balena.auth.whoami();
				assertWhoAmIType(whoamiResult, 'device');

				expect(whoamiResult).to.have.property('uuid').that.is.a('string');
				expect(whoamiResult).to.have.property('id').that.is.a('number');
				expect(whoamiResult)
					.to.have.property('actorTypeId')
					.that.is.a('number');
			});
		});

		describe('balena.auth.getUserInfo()', () => {
			it('should be rejected with an error', async function () {
				await expectError(
					async () => {
						await balena.auth.getUserInfo();
					},
					(error) => {
						expect(error).to.have.property(
							'message',
							'The authentication credentials in use are not of a user',
						);
					},
				);
			});
		});

		describe('balena.auth.getActorId()', () => {
			it('should eventually be an actor id', async () => {
				const actorId = await balena.auth.getActorId();
				expect(actorId).to.be.a('number');
				expect(actorId).to.equal((await balena.auth.whoami())?.id);
			});
		});

		describe('balena.auth.logout()', function () {
			it('should logout the user', async () => {
				await balena.auth.logout();
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('...should reset the token on logout', async () => {
				await expectError(
					async () => {
						await balena.auth.getToken();
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});
	});

	describe('when logged in with an application API Key', function () {
		givenLoggedInWithAnApplicationApiKey(before);

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be true', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.true;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be the application whoami response', async function () {
				const whoamiResult = await balena.auth.whoami();
				assertWhoAmIType(whoamiResult, 'application');
				expect(whoamiResult).to.have.property('slug').that.is.a('string');
				expect(whoamiResult).to.have.property('id').that.is.a('number');
				expect(whoamiResult)
					.to.have.property('actorTypeId')
					.that.is.a('number');
			});
		});

		describe('balena.auth.getUserInfo()', () => {
			it('should be rejected with an error', async function () {
				await expectError(
					async () => {
						await balena.auth.getUserInfo();
					},
					(error) => {
						expect(error).to.have.property(
							'message',
							'The authentication credentials in use are not of a user',
						);
					},
				);
			});
		});

		describe('balena.auth.getActorId()', () => {
			it('should eventually be an actor id', async () => {
				const actorId = await balena.auth.getActorId();
				expect(actorId).to.be.a('number');
				expect(actorId).to.equal((await balena.auth.whoami())?.id);
			});
		});

		describe('balena.auth.logout()', function () {
			it('should logout the user', async () => {
				await balena.auth.logout();
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('...should reset the token on logout', async () => {
				await expectError(
					async () => {
						await balena.auth.getToken();
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});
	});
	describe('when logged in with an user API key', function () {
		givenLoggedInUserWithApiKey(before);

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be true', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.true;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be the user whoami response', async function () {
				const whoamiResult = await balena.auth.whoami();
				assertWhoAmIType(whoamiResult, 'user');
				expect(whoamiResult.username).to.equal(credentials.username);
				expect(whoamiResult.email).to.equal(credentials.email);
				expect(whoamiResult).to.have.property('id').that.is.a('number');
				expect(whoamiResult)
					.to.have.property('actorTypeId')
					.that.is.a('number');
			});
		});

		describe('balena.auth.getUserInfo()', () => {
			it('should be rejected with an error', async function () {
				const userInfo = await balena.auth.getUserInfo();
				expect(userInfo.email).to.equal(credentials.email);
				expect(userInfo.username).to.equal(credentials.username);
				const whoamiResult = await balena.auth.whoami();
				assertWhoAmIType(whoamiResult, 'user');
				expect(userInfo).to.have.property('id', whoamiResult.actorTypeId);
				expect(userInfo).to.have.property('actor', whoamiResult.id);
			});
		});

		describe('balena.auth.getActorId()', () => {
			it('should eventually be an actor id', async () => {
				const actorId = await balena.auth.getActorId();
				expect(actorId).to.be.a('number');
				expect(actorId).to.equal((await balena.auth.whoami())?.id);
			});
		});

		describe('balena.auth.logout()', function () {
			it('should logout the user', async () => {
				await balena.auth.logout();
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('...should reset the token on logout', async () => {
				await expectError(
					async () => {
						await balena.auth.getToken();
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});
	});

	describe('given a user without 2FA', function () {
		givenLoggedInUser(before);

		describe('balena.auth.twoFactor.isEnabled()', function () {
			it('should not be enabled', async () => {
				expect(await balena.auth.twoFactor.isEnabled()).to.be.false;
			});
		});

		describe('balena.auth.twoFactor.isPassed()', function () {
			it('should be true', async () => {
				expect(await balena.auth.twoFactor.isPassed()).to.be.true;
			});
		});
	});

	describe('given a user with 2FA', function () {
		const has2FAAccount = credentials.twoFactor != null;

		const given2FAUserIt = (description, testFn) => {
			const $it = has2FAAccount ? it : it.skip;
			$it(description, testFn);
		};

		before(async () => {
			if (!has2FAAccount) {
				return;
			}
			await loginUserWith2FA();
		});

		describe('balena.auth.twoFactor.isEnabled()', function () {
			given2FAUserIt('should be true', async () => {
				expect(await balena.auth.twoFactor.isEnabled()).to.be.true;
			});
		});
		describe('balena.auth.twoFactor.isPassed()', function () {
			given2FAUserIt('should false when 2FA is not passed', async () => {
				expect(await balena.auth.twoFactor.isPassed()).to.be.false;
			});
			given2FAUserIt('should be true when 2FA is passed', async () => {
				if (credentials.twoFactor == null) {
					throw new Error('Missing TEST_2FA credentials');
				}
				const code = authenticator.generate(credentials.twoFactor.secret);
				await balena.auth.twoFactor.challenge(code);
				expect(await balena.auth.twoFactor.isPassed()).to.be.true;
			});
		});
	});
});
