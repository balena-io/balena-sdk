import { expect } from 'chai';
import * as sinon from 'sinon';
import * as packageJSON from '../../package.json';
import {
	balena,
	balenaSdkExports,
	getSdk,
	sdkOpts,
	givenLoggedInUser,
	credentials,
	givenAnApplication,
	TEST_KEY_NAME_PREFIX,
	apiVersion,
} from './setup';
import { timeSuite } from '../util';

const DIFFERENT_TEST_SERVER_URL = 'https://www.non-balena-api-domain.com/';

describe('Balena SDK', function () {
	timeSuite(before);

	const validKeys = ['auth', 'models', 'logs', 'settings', 'version'];

	describe('factory function', function () {
		describe('given no opts', () => {
			it('should return an object with valid keys', function () {
				const mockBalena = getSdk();
				expect(mockBalena).to.include.keys(validKeys);
			});
		});

		describe('given empty opts', () => {
			it('should return an object with valid keys', function () {
				const mockBalena = getSdk({});
				expect(mockBalena).to.include.keys(validKeys);
			});
		});

		describe('given opts', () => {
			it('should return an object with valid keys', function () {
				const mockBalena = getSdk(sdkOpts);
				expect(mockBalena).to.include.keys(validKeys);
			});
		});

		describe('version', () => {
			it('should match the package.json version', function () {
				const mockBalena = getSdk();
				expect(mockBalena).to.have.property('version', packageJSON.version);
			});
		});
	});

	it('should expose a pinejs client instance', () => {
		expect(balena.pine).to.exist;
	});

	it('should expose an balena-errors instance', () => {
		expect(balena.errors).to.exist;
	});

	describe('interception Hooks', function () {
		let originalInterceptors: typeof balena.interceptors;

		before(function () {
			originalInterceptors = balena.interceptors.slice();
			return (balena.interceptors = originalInterceptors.slice());
		});

		afterEach(
			() =>
				// register this afterEach first, so that we
				// are able to clear the mock interceptor, before
				// all other requests that might happen in afterEach
				(balena.interceptors = originalInterceptors.slice()),
		);

		givenLoggedInUser(before);

		const ignoreWhoamiCalls = (fn) =>
			function (arg) {
				if (/\/user\/v1\/whoami/.test(arg.url)) {
					return arg;
				}
				return fn(arg);
			};

		it("should update if the array is set directly (not only if it's mutated)", function () {
			const interceptor = sinon.mock().returnsArg(0);
			balena.interceptors = [{ request: ignoreWhoamiCalls(interceptor) }];
			return balena.models.application
				.getAll({ $top: 1 })
				.then(() =>
					expect(interceptor.called).to.equal(
						true,
						'Interceptor set directly should have its request hook called',
					),
				);
		});

		describe('for request', () => {
			it('should be able to intercept requests', function () {
				const requestInterceptor = sinon.mock().returnsArg(0);
				balena.interceptors.push({ request: requestInterceptor });

				const promise = balena.models.application.getAll({ $top: 1 });

				return promise.then(() =>
					expect(requestInterceptor.called).to.equal(
						true,
						'Interceptor request hook should be called',
					),
				);
			});
		});

		describe('for requestError', () => {
			it('should intercept request errors from other interceptors', function () {
				const requestInterceptor = sinon.mock().throws(new Error('rejected'));
				const requestErrorInterceptor = sinon
					.mock()
					.throws(new Error('replacement error'));

				balena.interceptors.push({ request: requestInterceptor });
				balena.interceptors.push({ requestError: requestErrorInterceptor });

				const promise = balena.models.application.getAll({ $top: 1 });

				return expect(promise)
					.to.be.rejectedWith('replacement error')
					.then(() =>
						expect(requestErrorInterceptor.called).to.equal(
							true,
							'Interceptor requestError hook should be called',
						),
					);
			});
		});

		describe('for response', () => {
			it('should be able to intercept responses', function () {
				const responseInterceptor = sinon.mock().returnsArg(0);
				balena.interceptors.push({ response: responseInterceptor });
				const promise = balena.models.application.getAll({ $top: 1 });

				return promise.then(() =>
					expect(responseInterceptor.called).to.equal(
						true,
						'Interceptor response hook should be called',
					),
				);
			});
		});

		describe('for responseError', () => {
			it('should be able to intercept error responses', function () {
				let called = false;
				balena.interceptors.push({
					responseError(err) {
						called = true;
						throw err;
					},
				});

				const promise = balena.models.device.reboot(999999);

				return expect(promise).to.be.rejected.then(() =>
					expect(called).to.equal(
						true,
						'responseError should be called when request fails',
					),
				);
			});
		});

		describe('version header', function () {
			const getVersionHeaderResponseInterceptor = function () {
				const responseInterceptor = function (response) {
					responseInterceptor.callCount++;
					expect(response.request.headers).to.have.property(
						'X-Balena-Client',
						`${packageJSON.name}/${packageJSON.version}`,
					);
					return response;
				};

				responseInterceptor.callCount = 0;

				return responseInterceptor;
			};

			const getVersionHeaderResponseErrorInterceptor = function () {
				const responseInterceptor = function (err) {
					responseInterceptor.callCount++;
					expect(err.requestOptions.headers).to.not.have.property(
						'X-Balena-Client',
					);
					throw err;
				};

				responseInterceptor.callCount = 0;

				return responseInterceptor;
			};

			describe('model requests', () => {
				it('should include the version header', function () {
					const responseInterceptor = getVersionHeaderResponseInterceptor();
					balena.interceptors.push({ response: responseInterceptor });

					const promise = balena.models.application.getAll({ $top: 1 });

					return promise.then(() =>
						expect(responseInterceptor.callCount).to.equal(
							1,
							'Interceptor response hook should be called',
						),
					);
				});
			});

			describe('pine requests', () => {
				it('should include the version header', function () {
					const responseInterceptor = getVersionHeaderResponseInterceptor();
					balena.interceptors.push({ response: responseInterceptor });

					const promise = balena.pine.get({
						resource: 'application',
					});

					return promise.then(() =>
						expect(responseInterceptor.callCount).to.equal(
							1,
							'Interceptor response hook should be called',
						),
					);
				});
			});

			describe('plain requests', function () {
				describe('with a relative url & without a baseUrl', () => {
					it('should not include the version header', function () {
						const responseInterceptor =
							getVersionHeaderResponseErrorInterceptor();
						balena.interceptors.push({ responseError: responseInterceptor });

						const promise = balena.request.send({
							method: 'GET',
							url: `/${apiVersion}/application`,
						});

						return expect(promise).to.be.rejected.then(() =>
							expect(responseInterceptor.callCount).to.equal(
								1,
								'Interceptor response hook should be called',
							),
						);
					});
				});

				describe('with a baseUrl option', function () {
					describe('to the API', () => {
						it('should include the version header', function () {
							const responseInterceptor = getVersionHeaderResponseInterceptor();
							balena.interceptors.push({ response: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: `/${apiVersion}/application`,
								baseUrl: sdkOpts.apiUrl,
							});

							return promise.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						});
					});

					describe('to a different server', () => {
						it('should not include the version header', function () {
							const responseInterceptor =
								getVersionHeaderResponseErrorInterceptor();
							balena.interceptors.push({ responseError: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: `/${apiVersion}/application`,
								baseUrl: DIFFERENT_TEST_SERVER_URL,
							});

							return expect(promise).to.be.rejected.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						});
					});
				});

				describe('with a complete url option', function () {
					describe('to the API', () => {
						it('should include the version header', function () {
							const responseInterceptor = getVersionHeaderResponseInterceptor();
							balena.interceptors.push({ response: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: `${sdkOpts.apiUrl}/${apiVersion}/application`,
							});

							return promise.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						});
					});

					describe('to a different server', () => {
						it('should not include the version header', function () {
							const responseInterceptor =
								getVersionHeaderResponseErrorInterceptor();
							balena.interceptors.push({ responseError: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: `${DIFFERENT_TEST_SERVER_URL}/${apiVersion}/application`,
							});

							return expect(promise).to.be.rejected.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						});
					});
				});
			});
		});
	});

	describe('setSharedOptions()', () => {
		it('should set a global containing shared options', function () {
			const root =
				typeof window !== 'undefined' && window !== null ? window : global;
			const opts = { foo: 'bar' };

			// @ts-expect-error we are passing an unknown property
			balenaSdkExports.setSharedOptions(opts);

			expect(root['BALENA_SDK_SHARED_OPTIONS']).to.equal(opts);
		});
	});

	describe('fromSharedOptions()', () => {
		it('should return an object with valid keys', function () {
			const mockBalena = balenaSdkExports.fromSharedOptions();
			return expect(mockBalena).to.include.keys(validKeys);
		});
	});

	describe('constructor options', () => {
		describe('When initializing an SDK instance with an `apiKey` in the options', function () {
			givenLoggedInUser(before);

			before(async function () {
				const testApiKey = await balena.models.apiKey.create({
					name: `${TEST_KEY_NAME_PREFIX}_apiKey`,
					expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
					description: 'apiKeyDescription',
				});
				this.testApiKey = testApiKey;
				expect(this.testApiKey).to.be.a('string');
				await balena.auth.logout();
			});

			it('should not be used in API requests', async function () {
				expect(this.testApiKey).to.be.a('string');
				const testSdkOpts = {
					...sdkOpts,
					apiKey: this.testApiKey,
				};
				const testSdk = getSdk(testSdkOpts);
				const promise = testSdk.models.apiKey.getAll({ $top: 1 });
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		});
	});

	describe('storage isolation', function () {
		describe('given a logged in instance', function () {
			givenLoggedInUser(before);
			givenAnApplication(before);

			describe('creating an SDK instance with the same options', function () {
				let testSdk: balenaSdk.BalenaSDK;
				before(function () {
					testSdk = getSdk(sdkOpts);
				});

				describe('pine queries', () => {
					it('should be able to retrieve the user (using the key from the first instance)', async function () {
						const [user] = await testSdk.pine.get({
							resource: 'user',
							options: {
								$select: 'username',
								$filter: {
									username: credentials.username,
								},
							},
						});
						expect(user)
							.to.be.an('object')
							.and.have.property('username', credentials.username);
					});

					it('should be able to retrieve the application created by the first instance', async function () {
						const apps = await testSdk.pine.get({
							resource: 'application',
							options: {
								$select: 'id',
								$filter: {
									id: this.application.id,
								},
							},
						});
						expect(apps).to.have.lengthOf(1);
					});
				});

				describe('models.application.get', () => {
					it('should be able to retrieve the application created by the first instance', async function () {
						const app = await testSdk.models.application.get(
							this.application.id,
							{
								$select: 'id',
							},
						);
						expect(app)
							.to.be.an('object')
							.and.have.property('id', this.application.id);
					});
				});

				describe('balena.auth.isLoggedIn()', () => {
					it('should return true', async function () {
						expect(await testSdk.auth.isLoggedIn()).to.equal(true);
					});
				});

				describe('balena.auth.getToken()', () => {
					it('should return the same key as the first instance', async function () {
						expect(await testSdk.auth.getToken()).to.equal(
							await balena.auth.getToken(),
						);
					});
				});
			});

			describe('creating an SDK instance using dataDirectory: false', function () {
				let testSdk: balenaSdk.BalenaSDK;
				before(function () {
					testSdk = getSdk({
						...sdkOpts,
						dataDirectory: false,
					});
				});

				describe('pine queries', () => {
					it('should be unauthenticated and not be able to retrieve any user', async function () {
						await expect(
							testSdk.pine.get({
								resource: 'user',
								options: {
									$select: 'username',
									$filter: {
										username: credentials.username,
									},
								},
							}),
						).to.be.rejected.and.eventually.have.property(
							'code',
							'BalenaNotLoggedIn',
						);
					});

					it('should be unauthenticated and not be able to retrieve the application created by the first instance', async function () {
						const apps = await testSdk.pine.get({
							resource: 'application',
							options: {
								$select: 'id',
								$filter: {
									id: this.application.id,
								},
							},
						});
						expect(apps).to.have.lengthOf(0);
					});
				});

				describe('models.application.get', () => {
					it('should be able to retrieve the application created by the first instance', async function () {
						await expect(
							testSdk.models.application.get(this.application.id, {
								$select: 'id',
							}),
						).to.be.rejected.and.eventually.have.property(
							'code',
							'BalenaApplicationNotFound',
						);
					});
				});

				describe('balena.auth.isLoggedIn()', () => {
					it('should return false', async function () {
						expect(await testSdk.auth.isLoggedIn()).to.equal(false);
					});
				});

				describe('balena.auth.getToken()', () => {
					it('should return no key', async function () {
						await expect(
							testSdk.auth.getToken(),
						).to.be.rejected.and.eventually.have.property(
							'code',
							'BalenaNotLoggedIn',
						);
					});
				});
			});
		});
	});
});
