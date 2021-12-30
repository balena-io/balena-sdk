import { expect } from 'chai';
import { timeSuite } from '../util';

import {
	balena,
	sdkOpts,
	credentials,
	givenLoggedInUser,
	givenLoggedInUserWithApiKey,
} from './setup';

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
				const promise = balena.auth.logout();
				await expect(promise).to.not.be.rejected;
			});
		});

		describe('balena.auth.authenticate()', function () {
			it('should not save the token given valid credentials', async () => {
				await balena.auth.authenticate(credentials);
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('should be rejected given invalid credentials', async function () {
				const promise = balena.auth.authenticate({
					email: credentials.username,
					password: 'NOT-THE-CORRECT-PASSWORD',
				});

				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaInvalidLoginCredentials',
				);
			});
		});

		describe('balena.auth.getToken()', async () => {
			it('should be rejected', async function () {
				const promise = balena.auth.getToken();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});

		describe('balena.auth.loginWithToken()', async function () {
			it('should be able to login with a session token', async () => {
				await balena.auth.loginWithToken(
					await balena.auth.authenticate(credentials),
				);
				expect(await balena.auth.getToken()).to.be.a('string');
			});

			it('should be able to login with an API Key', async () => {
				const token = await balena.auth.authenticate(credentials);
				await balena.auth.loginWithToken(token);
				const apiKey = await balena.models.apiKey.create('apiKey');
				await balena.auth.logout();
				await balena.auth.loginWithToken(apiKey);
				expect(await balena.auth.getToken()).to.be.a('string');
			});
		});

		describe('balena.auth.getEmail()', () => {
			it('should be rejected with an error', async function () {
				const promise = balena.auth.getEmail();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});

		describe('balena.auth.getUserId()', () => {
			it('should be rejected with an error', async function () {
				const promise = balena.auth.getUserId();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});

		describe('balena.auth.getUserActorId()', () => {
			it('should be rejected with an error', async function () {
				const promise = balena.auth.getUserActorId();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});

		describe.skip('balena.auth.register()', function () {
			beforeEach(async () => {
				await balena.auth.login({
					email: credentials.register.email,
					password: credentials.register.password,
				});
				const userId = await balena.auth.getUserId();
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
				const promise = balena.auth.register({
					email: 'foobarbaz',
					password: credentials.register.password,
				});

				await expect(promise).to.be.rejectedWith('Invalid email');
			});

			it('should be rejected if the email is taken', async function () {
				const promise = balena.auth.register({
					email: credentials.email,
					password: credentials.register.password,
				});

				await expect(promise).to.be.rejectedWith('This email is already taken');
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

		describe('balena.auth.getEmail()', () => {
			it('should be rejected with an error', async function () {
				const promise = balena.auth.getEmail();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});

		describe('balena.auth.getUserId()', () => {
			it('should be rejected with an error', async function () {
				const promise = balena.auth.getUserId();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});

		describe('balena.auth.getUserActorId()', () => {
			it('should be rejected with an error', async function () {
				const promise = balena.auth.getUserActorId();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
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
			it('should eventually be the username', async function () {
				expect(await balena.auth.whoami()).to.equal(credentials.username);
			});
		});

		describe('balena.auth.getEmail()', () => {
			it('should eventually be the email', async function () {
				expect(await balena.auth.getEmail()).to.equal(credentials.email);
			});
		});

		describe('balena.auth.getUserId()', () => {
			it('should eventually be a user id', async () => {
				const userId = await balena.auth.getUserId();
				expect(userId).to.be.a('number');
				expect(userId).to.be.greaterThan(0);
			});
		});

		describe('balena.auth.getUserActorId()', () => {
			it('should eventually be a user id', async () => {
				const userId = await balena.auth.getUserActorId();
				expect(userId).to.be.a('number');
				expect(userId).to.be.greaterThan(0);
			});
		});

		describe('balena.auth.logout()', () => {
			it('should logout the user', async () => {
				await balena.auth.logout();
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});
		});
	});

	describe('when logged in with API key', function () {
		givenLoggedInUserWithApiKey(before);

		describe('balena.auth.isLoggedIn()', () => {
			it('should eventually be true', async function () {
				expect(await balena.auth.isLoggedIn()).to.be.true;
			});
		});

		describe('balena.auth.whoami()', () => {
			it('should eventually be the username', async function () {
				expect(await balena.auth.whoami()).to.equal(credentials.username);
			});
		});

		describe('balena.auth.getEmail()', () => {
			it('should eventually be the email', async function () {
				expect(await balena.auth.getEmail()).to.equal(credentials.email);
			});
		});

		describe('balena.auth.getUserId()', () => {
			it('should eventually be a user id', async () => {
				const userId = await balena.auth.getUserId();
				expect(userId).to.be.a('number');
				expect(userId).to.be.greaterThan(0);
			});
		});

		describe('balena.auth.getUserActorId()', () => {
			it('should eventually be a user id', async () => {
				const userId = await balena.auth.getUserActorId();
				expect(userId).to.be.a('number');
				expect(userId).to.be.greaterThan(0);
			});
		});

		describe('balena.auth.logout()', function () {
			it('should logout the user', async () => {
				await balena.auth.logout();
				expect(await balena.auth.isLoggedIn()).to.be.false;
			});

			it('...should reset the token on logout', async () => {
				const promise = balena.auth.getToken();
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});
	});
});
