import BalenaAuth from 'balena-auth';
import { getRequest } from 'balena-request';
import * as mockttp from 'mockttp';
import { expect } from 'chai';
import { IS_BROWSER, apiVersion } from './integration/setup';
import tokens from './data/tokens';
import { PinejsClient } from '../src/pine';
import { expectError } from './util';

const mockServer = mockttp.getLocal();

let dataDirectory;
if (!IS_BROWSER) {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const temp = require('temp').track();
	dataDirectory = temp.mkdirSync();
}

const auth = new BalenaAuth({ dataDirectory });
const request = getRequest({ auth });

const buildPineInstance = (apiUrl: string, extraOpts?: object) =>
	new PinejsClient(
		{},
		{
			apiUrl,
			apiVersion,
			request,
			auth,
			...extraOpts,
		},
	);

describe('Pine', function () {
	beforeEach(() => mockServer.start());

	afterEach(() => mockServer.stop());

	describe('.apiPrefix', () => {
		it(`should equal /${apiVersion}/`, function () {
			const pine = buildPineInstance(mockServer.url);
			expect(pine.apiPrefix).that.is.a('string');
		});
	});

	// The intention of this spec is to quickly double check
	// the internal _request() method works as expected.
	// The nitty grits of request are tested in balena-request.
	describe('given a /user/v1/refresh-token endpoint', function () {
		beforeEach(async function () {
			this.pine = buildPineInstance(mockServer.url);
			await mockServer
				.forGet('/user/v1/refresh-token')
				.thenReply(200, tokens.johndoe.token);
			await mockServer
				.forGet('/foo')
				.withHeaders({
					Authorization: `Bearer ${tokens.johndoe.token}`,
				})
				.thenJson(200, { hello: 'world' });
			await mockServer.forGet('/foo').thenCallback(function (req) {
				if (req.url.endsWith(`?apikey=${tokens.johndoe.token}`)) {
					return {
						status: 200,
						json: { hello: 'world' },
					};
				}

				return {
					status: 401,
					body: 'Unauthorized',
				};
			});
		});

		describe('._request()', function () {
			describe('given there is no auth', function () {
				beforeEach(() => auth.removeKey());

				describe('given a simple GET endpoint', function () {
					describe('given a public resource', function () {
						beforeEach(async function () {
							this.pine = buildPineInstance(mockServer.url);
							await mockServer
								.forGet('/public_resource')
								.thenJson(200, { hello: 'public world' });
						});

						describe('given there is no api key', function () {
							it('should be successful', async function () {
								expect(
									await this.pine._request({
										baseUrl: this.pine.API_URL,
										method: 'GET',
										url: '/public_resource',
									}),
								).to.deep.equal({ hello: 'public world' });
							});

							it('should be successful, if sent anonymously', async function () {
								expect(
									await this.pine._request({
										baseUrl: this.pine.API_URL,
										method: 'GET',
										url: '/public_resource',
										anonymous: true,
									}),
								).to.deep.equal({ hello: 'public world' });
							});
						});

						describe('given there is an api key', () => {
							it('should make the request successfully', async function () {
								expect(
									await this.pine._request({
										baseUrl: this.pine.API_URL,
										method: 'GET',
										url: '/public_resource',
									}),
								).to.deep.equal({ hello: 'public world' });
							});
						});
					});

					describe('given a non-public resource', function () {
						describe('given there is no api key', function () {
							beforeEach(function () {
								this.pine = buildPineInstance(mockServer.url, { apiKey: '' });
							});

							it('should be rejected with an authentication error message', async function () {
								await expectError(async () => {
									await this.pine._request({
										baseUrl: this.pine.API_URL,
										method: 'GET',
										url: '/foo',
									});
								}, 'You have to log in');
							});

							it('should be rejected with an unauthorized error, if sent anonymously', async function () {
								await expectError(
									async () => {
										await this.pine._request({
											baseUrl: this.pine.API_URL,
											method: 'GET',
											url: '/foo',
											anonymous: true,
										});
									},
									(error) => {
										expect(error).to.have.property(
											'message',
											'Request error: Unauthorized',
										);
										expect(error).to.have.property('statusCode', 401);
									},
								);
							});
						});

						describe('given there is an api key', function () {
							beforeEach(function () {
								this.pine = buildPineInstance(mockServer.url, {
									apiKey: tokens.johndoe.token,
								});
							});

							it('should make the request successfully', async function () {
								expect(
									await this.pine._request({
										baseUrl: this.pine.API_URL,
										method: 'GET',
										url: '/foo',
									}),
								).to.deep.equal({ hello: 'world' });
							});

							it('should make the request successfully, if sent anonymously', async function () {
								expect(
									await this.pine._request({
										baseUrl: this.pine.API_URL,
										method: 'GET',
										url: '/foo',
										anonymous: true,
									}),
								).to.deep.equal({ hello: 'world' });
							});
						});
					});
				});
			});

			describe('given there is an auth', function () {
				beforeEach(async () => {
					await auth.setKey(tokens.johndoe.token);
				});

				describe('given a simple GET endpoint', function () {
					describe('given a public resource', function () {
						beforeEach(async function () {
							this.pine = buildPineInstance(mockServer.url);
							await mockServer
								.forGet('/public_resource')
								.thenJson(200, { hello: 'public world' });
						});

						it('should be successful', async function () {
							expect(
								await this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/public_resource',
								}),
							).to.deep.equal({ hello: 'public world' });
						});

						it('should be successful, if sent anonymously', async function () {
							expect(
								await this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/public_resource',
									anonymous: true,
								}),
							).to.deep.equal({ hello: 'public world' });
						});
					});

					describe('given a non-public resource', function () {
						beforeEach(function () {
							this.pine = buildPineInstance(mockServer.url);
						});

						it('should eventually become the response body', async function () {
							expect(
								await this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/foo',
								}),
							).to.deep.equal({ hello: 'world' });
						});

						it('should not send the auth token, if using an anonymous flag', async function () {
							await expectError(async () => {
								await this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/foo',
									anonymous: true,
								});
							}, 'Request error: Unauthorized');
						});
					});
				});

				describe('given a POST endpoint that mirrors the request body', function () {
					beforeEach(async function () {
						this.pine = buildPineInstance(mockServer.url);
						await mockServer.forPost('/foo').thenCallback(async (req) => ({
							status: 200,
							json: await req.body.getJson(),
						}));
					});

					it('should eventually become the body', async function () {
						expect(
							await this.pine._request({
								baseUrl: this.pine.API_URL,
								method: 'POST',
								url: '/foo',
								body: {
									foo: 'bar',
								},
							}),
						).to.deep.equal({ foo: 'bar' });
					});
				});

				describe('.get()', function () {
					describe('given a working pine endpoint', function () {
						beforeEach(async function () {
							this.pine = buildPineInstance(mockServer.url);

							this.applications = {
								d: [
									{ id: 1, app_name: 'Bar' },
									{ id: 2, app_name: 'Foo' },
								],
							};

							await mockServer
								.forGet(`/${apiVersion}/application`)
								.withQuery({ $orderby: 'app_name asc' })
								.thenJson(200, this.applications);
						});

						it('should make the correct request', async function () {
							expect(
								await this.pine.get({
									resource: 'application',
									options: {
										$orderby: { app_name: 'asc' },
									},
								}),
							).to.deep.equal(this.applications.d);
						});
					});

					describe('given an endpoint that returns an error', function () {
						beforeEach(async function () {
							this.pine = buildPineInstance(mockServer.url);
							await mockServer
								.forGet(`/${apiVersion}/application`)
								.thenReply(500, 'Internal Server Error');
						});

						it('should reject the promise with an error message', async function () {
							await expectError(async () => {
								await this.pine.get({
									resource: 'application',
								});
							}, 'Internal Server Error');
						});
					});
				});

				describe('.post()', function () {
					describe('given a working pine endpoint that gives back the request body', function () {
						beforeEach(async function () {
							this.pine = buildPineInstance(mockServer.url);

							await mockServer
								.forPost(`/${apiVersion}/application`)
								.thenCallback(async (req) => ({
									status: 201,
									json: await req.body.getJson(),
								}));
						});

						it('should get back the body', async function () {
							expect(
								await this.pine.post({
									resource: 'application',
									body: {
										app_name: 'App1',
										device_type: 'raspberry-pi',
									},
								}),
							).to.deep.equal({
								app_name: 'App1',
								device_type: 'raspberry-pi',
							});
						});
					});

					describe('given pine endpoint that returns an error', function () {
						beforeEach(async function () {
							this.pine = buildPineInstance(mockServer.url);
							await mockServer
								.forGet(`/${apiVersion}/application`)
								.thenReply(404, 'Unsupported device type');
						});

						it('should reject the promise with an error message', async function () {
							await expectError(async () => {
								await this.pine.post({
									resource: 'application',
									body: {
										app_name: 'App1',
									},
								});
							}, 'Unsupported device type');
						});
					});
				});
			});
		});
	});
});
