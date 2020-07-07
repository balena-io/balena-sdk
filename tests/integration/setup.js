import * as Bluebird from 'bluebird';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import { chai } from 'mochainon';
import * as memoize from 'memoizee';
chai.use(require('chai-samsam'));

export const IS_BROWSER = typeof window !== 'undefined' && window !== null;

const { getInitialOrganization } = require('./utils');

let apiUrl;
let env;
/** @type {import('../..')} */
let getSdk;
let opts;
if (IS_BROWSER) {
	require('js-polyfills/es6');
	// @ts-expect-error
	getSdk = window.balenaSdk;
	// @ts-expect-error
	env = window.__env__;

	apiUrl = env.TEST_API_URL || 'https://api.balena-cloud.com';
	opts = {
		apiUrl,
		builderUrl: env.TEST_BUILDER_URL || apiUrl.replace('api.', 'builder.'),
	};
} else {
	getSdk = require('../..');
	const settings = require('balena-settings-client');
	({ env } = process);

	apiUrl = env.TEST_API_URL || settings.get('apiUrl');
	opts = {
		apiUrl,
		builderUrl: env.TEST_BUILDER_URL || apiUrl.replace('api.', 'builder.'),
		dataDirectory: settings.get('dataDirectory'),
	};
}

_.assign(opts, {
	isBrowser: IS_BROWSER,
	retries: 3,
});

console.log(`Running SDK tests against: ${opts.apiUrl}`);
console.log(`TEST_USERNAME: ${env?.TEST_USERNAME}`);

const buildCredentials = function () {
	if (!env) {
		throw new Error('Missing environment object?!');
	}

	const credentials = {
		email: env.TEST_EMAIL,
		password: env.TEST_PASSWORD,
		username: env.TEST_USERNAME,
		paid: {
			email: env.TEST_PAID_EMAIL,
			password: env.TEST_PAID_PASSWORD,
		},
		register: {
			email: env.TEST_REGISTER_EMAIL,
			password: env.TEST_REGISTER_PASSWORD,
			username: env.TEST_REGISTER_USERNAME,
		},
	};

	if (
		!_.every([
			credentials.email != null,
			credentials.password != null,
			credentials.username != null,
			credentials.register.email != null,
			credentials.register.password != null,
			credentials.register.username != null,
		])
	) {
		throw new Error('Missing environment credentials');
	}

	return credentials;
};

export { getSdk };
export { opts as sdkOpts };
export const balena = getSdk(opts);

export function resetUser() {
	return balena.auth.isLoggedIn().then(function (isLoggedIn) {
		if (!isLoggedIn) {
			return;
		}

		return Bluebird.all([
			balena.pine.delete({
				resource: 'application',
				options: {
					$filter: { 1: 1 },
				},
			}),

			balena.pine.delete({
				resource: 'user__has__public_key',
				options: {
					$filter: { 1: 1 },
				},
			}),

			balena.pine
				.delete({
					resource: 'api_key',
					// only delete named user api keys
					options: { $filter: { name: { $ne: null } } },
				})
				.catch(_.noop),
		]);
	});
}

let _credentials = buildCredentials();
export { _credentials as credentials };

export function givenLoggedInUserWithApiKey(beforeFn) {
	beforeFn(() =>
		balena.auth
			.login({
				email: exports.credentials.email,
				password: exports.credentials.password,
			})
			.then(() =>
				balena.request.send({
					method: 'POST',
					url: '/api-key/user/full',
					baseUrl: opts.apiUrl,
					body: {
						name: 'apiKey',
					},
				}),
			)
			.get('body')
			.tap(balena.auth.logout)
			.then(balena.auth.loginWithToken)
			.then(exports.resetUser),
	);

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	return afterFn(() => exports.resetUser());
}

export function givenLoggedInUser(beforeFn) {
	beforeFn(() =>
		balena.auth
			.login({
				email: exports.credentials.email,
				password: exports.credentials.password,
			})
			.then(exports.resetUser),
	);

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	return afterFn(() => exports.resetUser());
}

export function loginPaidUser() {
	return balena.auth.login({
		email: exports.credentials.paid.email,
		password: exports.credentials.paid.password,
	});
}

const resetApplications = () =>
	balena.pine.delete({
		resource: 'application',
		options: {
			$filter: { 1: 1 },
		},
	});

export function givenInitialOrganization(beforeFn) {
	return beforeFn(function () {
		return getInitialOrganization().then((initialOrg) => {
			return (this.initialOrg = initialOrg);
		});
	});
}

const getDeviceType = memoize(
	(deviceTypeId) =>
		balena.pine.get({
			resource: 'device_type',
			id: deviceTypeId,
			options: {
				$select: 'slug',
			},
		}),
	{
		promise: true,
		primitive: true,
	},
);

export function givenAnApplication(beforeFn) {
	exports.givenInitialOrganization(beforeFn);

	beforeFn(function () {
		return balena.models.application
			.create({
				name: 'FooBar',
				applicationType: 'microservices-starter',
				deviceType: 'raspberry-pi',
				organization: this.initialOrg.id,
			})
			.then((application) => {
				this.application = application;
				chai
					.expect(application.is_for__device_type)
					.to.be.an('object')
					.that.has.property('__id')
					.that.is.a('number');

				return getDeviceType(this.application.is_for__device_type.__id);
			})
			.then((applicationDeviceType) => {
				this.applicationDeviceType = applicationDeviceType;
				return chai
					.expect(this.applicationDeviceType)
					.to.be.an('object')
					.that.has.property('slug')
					.that.is.a('string');
			});
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	return afterFn(resetApplications);
}

const resetDevices = () =>
	balena.pine.delete({
		resource: 'device',
		options: {
			$filter: { 1: 1 },
		},
	});

export function givenADevice(beforeFn, extraDeviceProps) {
	beforeFn(function () {
		const uuid = balena.models.device.generateUniqueKey();
		return balena.models.device
			.register(this.application.app_name, uuid)
			.tap((deviceInfo) => {
				if (!this.currentRelease || !this.currentRelease.commit) {
					return;
				}

				return balena.pine.patch({
					resource: 'device',
					body: {
						is_running__release: this.currentRelease.id,
					},
					options: {
						$filter: {
							uuid: deviceInfo.uuid,
						},
					},
				});
			})
			.tap(function (deviceInfo) {
				if (!extraDeviceProps) {
					return;
				}

				return balena.pine.patch({
					resource: 'device',
					body: extraDeviceProps,
					options: {
						$filter: {
							uuid: deviceInfo.uuid,
						},
					},
				});
			})
			.then((deviceInfo) => balena.models.device.get(deviceInfo.uuid))
			.then((device) => {
				return (this.device = device);
			})
			.tap((device) => {
				if (!this.currentRelease || !this.currentRelease.commit) {
					return;
				}

				return Bluebird.all([
					// Create image installs for the images on the device
					balena.pine.post({
						resource: 'image_install',
						body: {
							installs__image: this.oldWebImage.id,
							is_provided_by__release: this.oldRelease.id,
							device: device.id,
							download_progress: null,
							status: 'Running',
							install_date: '2017-10-01',
						},
					}),
					balena.pine.post({
						resource: 'image_install',
						body: {
							installs__image: this.newWebImage.id,
							is_provided_by__release: this.currentRelease.id,
							device: device.id,
							download_progress: 50,
							status: 'Downloading',
							install_date: '2017-10-30',
						},
					}),
					balena.pine.post({
						resource: 'image_install',
						body: {
							installs__image: this.oldDbImage.id,
							is_provided_by__release: this.oldRelease.id,
							device: device.id,
							download_progress: 100,
							status: 'deleted',
							install_date: '2017-09-30',
						},
					}),
					balena.pine.post({
						resource: 'image_install',
						body: {
							installs__image: this.newDbImage.id,
							is_provided_by__release: this.currentRelease.id,
							device: device.id,
							download_progress: null,
							status: 'Running',
							install_date: '2017-10-30',
						},
					}),
				]).spread(
					(oldWebInstall, newWebInstall, _oldDbInstall, newDbInstall) => {
						this.oldWebInstall = oldWebInstall;
						this.newWebInstall = newWebInstall;
						this.newDbInstall = newDbInstall;
					},
				);
			});
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	return afterFn(resetDevices);
}

export function givenAnApplicationWithADevice(beforeFn) {
	exports.givenAnApplication(beforeFn);
	return exports.givenADevice(beforeFn);
}

export function givenMulticontainerApplicationWithADevice(beforeFn) {
	exports.givenMulticontainerApplication(beforeFn);
	return exports.givenADevice(beforeFn);
}

export function givenMulticontainerApplication(beforeFn) {
	exports.givenAnApplication(beforeFn);

	beforeFn(function () {
		return balena.auth
			.getUserId()
			.then((userId) => {
				return Bluebird.all([
					// Register web & DB services
					balena.pine.post({
						resource: 'service',
						body: {
							application: this.application.id,
							service_name: 'web',
						},
					}),
					balena.pine.post({
						resource: 'service',
						body: {
							application: this.application.id,
							service_name: 'db',
						},
					}),
					// Register an old & new release of this application
					Bluebird.mapSeries(
						[
							{
								resource: 'release',
								body: {
									belongs_to__application: this.application.id,
									is_created_by__user: userId,
									commit: 'old-release-commit',
									status: 'success',
									source: 'cloud',
									composition: {},
									start_timestamp: 1234,
								},
							},
							{
								resource: 'release',
								body: {
									belongs_to__application: this.application.id,
									is_created_by__user: userId,
									commit: 'new-release-commit',
									status: 'success',
									source: 'cloud',
									composition: {},
									start_timestamp: 54321,
								},
							},
						],
						(pineParams) => balena.pine.post(pineParams),
					),
				]);
			})
			.then(([webService, dbService, [oldRelease, newRelease]]) => {
				this.webService = webService;
				this.dbService = dbService;
				this.oldRelease = oldRelease;
				this.currentRelease = newRelease;

				return Bluebird.all([
					// Register an old & new web image build from the old and new
					// releases, a db build in the new release only
					balena.pine.post({
						resource: 'image',
						body: {
							is_a_build_of__service: webService.id,
							project_type: 'dockerfile',
							content_hash: 'abc',
							build_log: 'old web log',
							start_timestamp: 1234,
							push_timestamp: 1234,
							status: 'success',
						},
					}),
					balena.pine.post({
						resource: 'image',
						body: {
							is_a_build_of__service: webService.id,
							project_type: 'dockerfile',
							content_hash: 'def',
							build_log: 'new web log',
							start_timestamp: 54321,
							push_timestamp: 54321,
							status: 'success',
						},
					}),
					balena.pine.post({
						resource: 'image',
						body: {
							is_a_build_of__service: dbService.id,
							project_type: 'dockerfile',
							content_hash: 'jkl',
							build_log: 'old db log',
							start_timestamp: 123,
							push_timestamp: 123,
							status: 'success',
						},
					}),
					balena.pine.post({
						resource: 'image',
						body: {
							is_a_build_of__service: dbService.id,
							project_type: 'dockerfile',
							content_hash: 'ghi',
							build_log: 'new db log',
							start_timestamp: 54321,
							push_timestamp: 54321,
							status: 'success',
						},
					}),
				]).spread((oldWebImage, newWebImage, oldDbImage, newDbImage) => {
					this.oldWebImage = oldWebImage;
					this.newWebImage = newWebImage;
					this.oldDbImage = oldDbImage;
					this.newDbImage = newDbImage;

					return Bluebird.all([
						// Tie the images to their corresponding releases
						balena.pine.post({
							resource: 'image__is_part_of__release',
							body: {
								image: oldWebImage.id,
								is_part_of__release: oldRelease.id,
							},
						}),
						balena.pine.post({
							resource: 'image__is_part_of__release',
							body: {
								image: oldDbImage.id,
								is_part_of__release: oldRelease.id,
							},
						}),
						balena.pine.post({
							resource: 'image__is_part_of__release',
							body: {
								image: newWebImage.id,
								is_part_of__release: newRelease.id,
							},
						}),
						balena.pine.post({
							resource: 'image__is_part_of__release',
							body: {
								image: newDbImage.id,
								is_part_of__release: newRelease.id,
							},
						}),
					]);
				});
			});
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	return afterFn(function () {
		return (this.currentRelease = null);
	});
}
