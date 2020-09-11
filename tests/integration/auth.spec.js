import * as m from 'mochainon';

const { expect } = m.chai;

import {
	balena,
	sdkOpts,
	credentials,
	givenLoggedInUser,
	givenLoggedInUserWithApiKey,
} from './setup';

describe('SDK authentication', function () {
	describe('when not logged in', function () {
		beforeEach(() => balena.auth.logout());

		describe('balena.auth.isLoggedIn()', () =>
			it('should eventually be false', function () {
				const promise = balena.auth.isLoggedIn();
				return expect(promise).to.eventually.be.false;
			}));

		describe('balena.auth.whoami()', () =>
			it('should eventually be undefined', function () {
				const promise = balena.auth.whoami();
				return expect(promise).to.eventually.be.undefined;
			}));

		describe('balena.auth.logout()', () =>
			it('should not be rejected', function () {
				const promise = balena.auth.logout();
				return expect(promise).to.not.be.rejected;
			}));

		describe('balena.auth.authenticate()', function () {
			it('should not save the token given valid credentials', () =>
				balena.auth.authenticate(credentials).then(function () {
					const promise = balena.auth.isLoggedIn();
					return expect(promise).to.eventually.be.false;
				}));

			it('should be rejected given invalid credentials', function () {
				const promise = balena.auth.authenticate({
					email: credentials.username,
					password: 'NOT-THE-CORRECT-PASSWORD',
				});

				return expect(promise).to.be.rejectedWith('Unauthorized');
			});
		});

		describe('balena.auth.getToken()', () =>
			it('should be rejected', function () {
				const promise = balena.auth.getToken();
				return m.chai
					.expect(promise)
					.to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaNotLoggedIn',
					);
			}));

		describe('balena.auth.loginWithToken()', function () {
			it('should be able to login with a session token', () =>
				balena.auth
					.authenticate(credentials)
					.then(balena.auth.loginWithToken)
					.then(balena.auth.getToken)
					.then((key) => expect(key).to.be.a('string')));

			it('should be able to login with an API Key', async () => {
				const token = await balena.auth.authenticate(credentials);
				await balena.auth.loginWithToken(token);
				const apiKey = await balena.models.apiKey.create('apiKey');
				await balena.auth.logout();
				await balena.auth.loginWithToken(apiKey);
				const key = await balena.auth.getToken();
				expect(key).to.be.a('string');
			});
		});

		describe('balena.auth.getEmail()', () =>
			it('should be rejected with an error', function () {
				const promise = balena.auth.getEmail();
				return m.chai
					.expect(promise)
					.to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaNotLoggedIn',
					);
			}));

		describe('balena.auth.getUserId()', () =>
			it('should be rejected with an error', function () {
				const promise = balena.auth.getUserId();
				return m.chai
					.expect(promise)
					.to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaNotLoggedIn',
					);
			}));

		describe.skip('balena.auth.register()', function () {
			beforeEach(() =>
				balena.auth
					.login({
						email: credentials.register.email,
						password: credentials.register.password,
					})
					.then(balena.auth.getUserId)
					.then((userId) =>
						balena.request
							.send({
								method: 'DELETE',
								url: `/v2/user(${userId})`,
								baseUrl: sdkOpts.apiUrl,
							})
							.then(balena.auth.logout),
					)
					.catch(function (err) {
						if (err.message === 'Request error: Unauthorized') {
							return;
						}
						throw err;
					}),
			);

			it('should be able to register an account', () =>
				balena.auth
					.register({
						email: credentials.register.email,
						password: credentials.register.password,
					})
					.then(balena.auth.loginWithToken)
					.then(balena.auth.isLoggedIn)
					.then((isLoggedIn) => expect(isLoggedIn).to.be.true));

			it('should not save the token automatically', () =>
				balena.auth
					.register({
						email: credentials.register.email,
						password: credentials.register.password,
					})
					.then(balena.auth.isLoggedIn)
					.then((isLoggedIn) => expect(isLoggedIn).to.be.false));

			it('should be rejected if the email is invalid', function () {
				const promise = balena.auth.register({
					email: 'foobarbaz',
					password: credentials.register.password,
				});

				return expect(promise).to.be.rejectedWith('Invalid email');
			});

			it('should be rejected if the email is taken', function () {
				const promise = balena.auth.register({
					email: credentials.email,
					password: credentials.register.password,
				});

				return m.chai
					.expect(promise)
					.to.be.rejectedWith('This email is already taken');
			});
		});

		describe('given an invalid token', () =>
			describe('balena.auth.loginWithToken()', () =>
				it('should be not rejected', () =>
					balena.auth
						.authenticate(credentials)
						.then((token) =>
							balena.auth.loginWithToken(`${token}malformingsuffix`),
						)
						.then(balena.auth.getToken)
						.then((key) => expect(key).to.be.a('string')))));
	});

	describe('when logged in with an invalid token', function () {
		before(() =>
			balena.auth
				.logout()
				.then(() => balena.auth.authenticate(credentials))
				.then((token) =>
					balena.auth.loginWithToken(`${token}malformingsuffix`),
				),
		);

		describe('balena.auth.isLoggedIn()', () =>
			it('should eventually be false', function () {
				const promise = balena.auth.isLoggedIn();
				return expect(promise).to.eventually.be.false;
			}));

		describe('balena.auth.whoami()', () =>
			it('should eventually be undefined', function () {
				const promise = balena.auth.whoami();
				return expect(promise).to.eventually.be.undefined;
			}));

		describe('balena.auth.getEmail()', () =>
			it('should be rejected with an error', function () {
				const promise = balena.auth.getEmail();
				return m.chai
					.expect(promise)
					.to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaNotLoggedIn',
					);
			}));

		describe('balena.auth.getUserId()', () =>
			it('should be rejected with an error', function () {
				const promise = balena.auth.getUserId();
				return m.chai
					.expect(promise)
					.to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaNotLoggedIn',
					);
			}));
	});

	describe('when logged in with credentials', function () {
		givenLoggedInUser(before);

		describe('balena.auth.isLoggedIn()', () =>
			it('should eventually be true', function () {
				const promise = balena.auth.isLoggedIn();
				return expect(promise).to.eventually.be.true;
			}));

		describe('balena.auth.whoami()', () =>
			it('should eventually be the username', function () {
				const promise = balena.auth.whoami();
				return expect(promise).to.eventually.equal(credentials.username);
			}));

		describe('balena.auth.getEmail()', () =>
			it('should eventually be the email', function () {
				const promise = balena.auth.getEmail();
				return expect(promise).to.eventually.equal(credentials.email);
			}));

		describe('balena.auth.getUserId()', () =>
			it('should eventually be a user id', () =>
				balena.auth.getUserId().then(function (userId) {
					expect(userId).to.be.a('number');
					return expect(userId).to.be.greaterThan(0);
				})));

		describe('balena.auth.logout()', () =>
			it('should logout the user', () =>
				balena.auth.logout().then(function () {
					const promise = balena.auth.isLoggedIn();
					return expect(promise).to.eventually.be.false;
				})));
	});

	describe('when logged in with API key', function () {
		givenLoggedInUserWithApiKey(before);

		describe('balena.auth.isLoggedIn()', () =>
			it('should eventually be true', function () {
				const promise = balena.auth.isLoggedIn();
				return expect(promise).to.eventually.be.true;
			}));

		describe('balena.auth.whoami()', () =>
			it('should eventually be the username', function () {
				const promise = balena.auth.whoami();
				return expect(promise).to.eventually.equal(credentials.username);
			}));

		describe('balena.auth.getEmail()', () =>
			it('should eventually be the email', function () {
				const promise = balena.auth.getEmail();
				return expect(promise).to.eventually.equal(credentials.email);
			}));

		describe('balena.auth.getUserId()', () =>
			it('should eventually be a user id', () =>
				balena.auth.getUserId().then(function (userId) {
					expect(userId).to.be.a('number');
					return expect(userId).to.be.greaterThan(0);
				})));

		describe('balena.auth.logout()', function () {
			it('should logout the user', () =>
				balena.auth.logout().then(function () {
					const promise = balena.auth.isLoggedIn();
					return expect(promise).to.eventually.be.false;
				}));

			it('...should reset the token on logout', () => {
				const promise = balena.auth.getToken();
				return m.chai
					.expect(promise)
					.to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaNotLoggedIn',
					);
			});
		});
	});
});
