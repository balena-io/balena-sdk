import BalenaAuth from 'balena-auth';
import { getRequest } from 'balena-request';
import * as mockttp from 'mockttp';
import { expect } from 'chai';
import { IS_BROWSER, apiVersion } from './integration/setup';
import tokens from './data/tokens';
import { createPinejsClient } from '../src/pine';

const mockServer = mockttp.getLocal();

let dataDirectory;
if (!IS_BROWSER) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const temp = require('temp').track();
	dataDirectory = temp.mkdirSync();
}

const auth = new BalenaAuth({ dataDirectory });
const request = getRequest({ auth });

const buildPineInstance = (apiUrl: string, extraOpts?: object) =>
	createPinejsClient(
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
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/public_resource',
								});
								await expect(promise).to.become({ hello: 'public world' });
							});

							it('should be successful, if sent anonymously', async function () {
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/public_resource',
									anonymous: true,
								});
								await expect(promise).to.become({ hello: 'public world' });
							});
						});

						describe('given there is an api key', () => {
							it('should make the request successfully', async function () {
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/public_resource',
								});
								await expect(promise).to.become({ hello: 'public world' });
							});
						});
					});

					describe('given a non-public resource', function () {
						describe('given there is no api key', function () {
							beforeEach(function () {
								this.pine = buildPineInstance(mockServer.url, { apiKey: '' });
							});

							it('should be rejected with an authentication error message', async function () {
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/foo',
								});
								await expect(promise).to.be.rejectedWith('You have to log in');
							});

							it('should be rejected with an unauthorized error, if sent anonymously', async function () {
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/foo',
									anonymous: true,
								});
								await expect(promise)
									.to.be.rejectedWith('Unauthorized')
									.then((res) => expect(res.statusCode).to.equal(401));
							});
						});

						describe('given there is an api key', function () {
							beforeEach(function () {
								this.pine = buildPineInstance(mockServer.url, {
									apiKey: tokens.johndoe.token,
								});
							});

							it('should make the request successfully', async function () {
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/foo',
								});
								await expect(promise).to.become({ hello: 'world' });
							});

							it('should make the request successfully, if sent anonymously', async function () {
								const promise = this.pine._request({
									baseUrl: this.pine.API_URL,
									method: 'GET',
									url: '/foo',
									anonymous: true,
								});
								await expect(promise).to.become({ hello: 'world' });
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
							const promise = this.pine._request({
								baseUrl: this.pine.API_URL,
								method: 'GET',
								url: '/public_resource',
							});
							await expect(promise).to.become({ hello: 'public world' });
						});

						it('should be successful, if sent anonymously', async function () {
							const promise = this.pine._request({
								baseUrl: this.pine.API_URL,
								method: 'GET',
								url: '/public_resource',
								anonymous: true,
							});
							await expect(promise).to.become({ hello: 'public world' });
						});
					});

					describe('given a non-public resource', function () {
						beforeEach(function () {
							this.pine = buildPineInstance(mockServer.url);
						});

						it('should eventually become the response body', async function () {
							const promise = this.pine._request({
								baseUrl: this.pine.API_URL,
								method: 'GET',
								url: '/foo',
							});
							await expect(promise).to.eventually.become({ hello: 'world' });
						});

						it('should not send the auth token, if using an anonymous flag', async function () {
							const promise = this.pine._request({
								baseUrl: this.pine.API_URL,
								method: 'GET',
								url: '/foo',
								anonymous: true,
							});
							await expect(promise).to.be.rejectedWith(
								'Request error: Unauthorized',
							);
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
						const promise = this.pine._request({
							baseUrl: this.pine.API_URL,
							method: 'POST',
							url: '/foo',
							body: {
								foo: 'bar',
							},
						});
						await expect(promise).to.eventually.become({ foo: 'bar' });
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
							const promise = this.pine.get({
								resource: 'application',
								options: {
									$orderby: 'app_name asc',
								},
							});
							await expect(promise).to.eventually.become(this.applications.d);
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
							const promise = this.pine.get({
								resource: 'application',
							});

							await expect(promise).to.be.rejectedWith('Internal Server Error');
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
							const promise = this.pine.post({
								resource: 'application',
								body: {
									app_name: 'App1',
									device_type: 'raspberry-pi',
								},
							});

							await expect(promise).to.eventually.become({
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
							const promise = this.pine.post({
								resource: 'application',
								body: {
									app_name: 'App1',
								},
							});

							await expect(promise).to.be.rejectedWith(
								'Unsupported device type',
							);
						});
					});
				});
			});
		});
	});
});
