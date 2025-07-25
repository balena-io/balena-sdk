import { optionalVar, requiredVar } from '@balena/env-parsing';
import * as chai from 'chai';
import { expect } from 'chai';
import chaiSamsam from 'chai-samsam';
import memoizee from 'memoizee';
import type * as BalenaSdk from '../../';
import { getInitialOrganization } from './utils';
chai.use(chaiSamsam);

export const IS_BROWSER = typeof window !== 'undefined' && window !== null;
export const apiVersion = 'v7';

export let balenaSdkExports: typeof BalenaSdk;
export const sdkOpts: BalenaSdk.SdkOptions = {
	isBrowser: IS_BROWSER,
	requestBatchingChunkSize: 5,
	// Retry ratelimited requests only if the ratelimiting is for less than 60s
	// Since in some cases ratelimiting can last for hours, which would make the sdk tests look like they are
	// stalled w/o any clear reason, this surfaces such cases right sooner and make clear what the issue is.
	retryRateLimitedRequests: (retryAfterMs) => {
		console.log(
			`Request ratelimited for ${retryAfterMs / 1000}s, until ${new Date(Date.now() + retryAfterMs).toISOString()}`,
		);
		return retryAfterMs < 60_000;
	},
};
if (IS_BROWSER) {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	require('js-polyfills/es6');
	balenaSdkExports = window.balenaSdk;

	sdkOpts.apiUrl = optionalVar('TEST_API_URL', 'https://api.balena-cloud.com');
} else {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	balenaSdkExports = require('../..');
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const settings = require('balena-settings-client');

	sdkOpts.apiUrl = optionalVar('TEST_API_URL', settings.get('apiUrl'));
	sdkOpts.dataDirectory = settings.get('dataDirectory');
}

if (sdkOpts.apiUrl == null) {
	throw new Error(`sdkOpts.apiUrl was not defined: ${sdkOpts.apiUrl}`);
}

sdkOpts.builderUrl = optionalVar(
	'TEST_BUILDER_URL',
	sdkOpts.apiUrl.replace('api.', 'builder.'),
);

console.log(`Running SDK tests against: ${sdkOpts.apiUrl}`);
console.log(`TEST_USERNAME: ${optionalVar('TEST_USERNAME')}`);

const buildCredentials = function () {
	const creds = {
		email: requiredVar('TEST_EMAIL'),
		password: requiredVar('TEST_PASSWORD'),
		username: requiredVar('TEST_USERNAME'),
		member: {
			email: requiredVar('TEST_MEMBER_EMAIL'),
			password: requiredVar('TEST_MEMBER_PASSWORD'),
			username: requiredVar('TEST_MEMBER_USERNAME'),
		},
		// require either none or all to be set
		paid:
			optionalVar(['TEST_PAID_EMAIL', 'TEST_PAID_PASSWORD']) != null
				? {
						email: requiredVar('TEST_PAID_EMAIL'),
						password: requiredVar('TEST_PAID_PASSWORD'),
					}
				: null,
		register: {
			email: requiredVar('TEST_REGISTER_EMAIL'),
			password: requiredVar('TEST_REGISTER_PASSWORD'),
			username: requiredVar('TEST_REGISTER_USERNAME'),
		},
		twoFactor:
			// require either none or all to be set
			optionalVar(['TEST_2FA_EMAIL', 'TEST_2FA_PASSWORD', 'TEST_2FA_SECRET']) !=
			null
				? {
						email: requiredVar('TEST_2FA_EMAIL'),
						password: requiredVar('TEST_2FA_PASSWORD'),
						secret: requiredVar('TEST_2FA_SECRET'),
					}
				: null,
	};
	if (
		// TODO: this should include the paid account eventually as well
		![creds.email, creds.register.email].every((email) =>
			email.includes('+testsdk'),
		)
	) {
		throw new Error(
			'Missing environment credentials, all emails must include `+testsdk` to avoid accidental deletion',
		);
	}

	return creds;
};

export const getSdk = balenaSdkExports.getSdk;
export const balena = getSdk(sdkOpts);

export async function resetUser() {
	const isLoggedIn = await balena.auth.isLoggedIn();
	if (!isLoggedIn) {
		return;
	}
	return Promise.all([
		balena.pine.delete({
			resource: 'application',
			options: {
				$filter: {
					app_name: { $startswith: TEST_APPLICATION_NAME_PREFIX },
				},
			},
		}),

		balena.pine.delete({
			resource: 'user__has__public_key',
			options: {
				$filter: {
					title: {
						$startswith: TEST_KEY_NAME_PREFIX,
					},
				},
			},
		}),

		balena.pine.delete<BalenaSdk.ApiKey>({
			resource: 'api_key',
			// only delete named user api keys
			options: {
				$filter: {
					is_of__actor: await balena.auth.getActorId(),
					name: {
						$startswith: TEST_KEY_NAME_PREFIX,
					},
				},
			},
		}),

		resetInitialOrganization(),

		resetTestOrgs(),
	]);
}

export const credentials = buildCredentials();

export function givenLoggedInUserWithApiKey(beforeFn: Mocha.HookFunction) {
	beforeFn(async () => {
		await balena.auth.login({
			email: credentials.email,
			password: credentials.password,
		});
		const { body } = await balena.request.send({
			method: 'POST',
			url: '/api-key/user/full',
			baseUrl: sdkOpts.apiUrl,
			body: {
				name: `${TEST_KEY_NAME_PREFIX}_apiKey`,
			},
		});
		await balena.auth.logout();
		await balena.auth.loginWithToken(body);
		await resetUser();
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(() => resetUser());
}

export function givenLoggedInUser(
	beforeFn: Mocha.HookFunction,
	forceRelogin = false,
) {
	beforeFn(async () => {
		await balena.auth.login({
			email: credentials.email,
			password: credentials.password,
		});
		await resetUser();
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(async () => {
		if (forceRelogin) {
			await balena.auth.logout();
			await balena.auth.login({
				email: credentials.email,
				password: credentials.password,
			});
		}
		return resetUser();
	});
}

export async function loginUserWith2FA() {
	if (credentials.twoFactor == null) {
		throw new Error('Missing TEST_2FA credentials');
	}
	return balena.auth.login({
		email: credentials.twoFactor.email,
		password: credentials.twoFactor.password,
	});
}

export async function loginPaidUser() {
	if (credentials.paid == null) {
		throw new Error('Missing TEST_PAID credentials');
	}
	return balena.auth.login({
		email: credentials.paid.email,
		password: credentials.paid.password,
	});
}

async function resetInitialOrganization() {
	const initialOrg = await getInitialOrganization();
	await balena.pine.delete({
		resource: 'organization_membership',
		options: {
			$filter: {
				$not: {
					user: {
						$any: {
							$alias: 'u',
							$expr: {
								u: {
									username: {
										$in: [credentials.username, credentials.member.username],
									},
								},
							},
						},
					},
				},
				is_member_of__organization: initialOrg.id,
			},
		},
	});
	await balena.pine.delete({
		resource: 'team',
		options: {
			$filter: {
				belongs_to__organization: initialOrg.id,
			},
		},
	});
}

export function givenInitialOrganization(beforeFn: Mocha.HookFunction) {
	beforeFn(async function () {
		this.initialOrg = await getInitialOrganization();
	});
}

const getDeviceType = memoizee(
	(deviceTypeId: number) =>
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

export const TEST_APPLICATION_NAME_PREFIX =
	'balena_sdk_created_test_application_that_will_be_deleted';
export const TEST_ORGANIZATION_NAME =
	'balena-sdk created test organization that will be deleted';
export const TEST_TEAM_NAME =
	'balena-sdk created test team that will be deleted';
export const TEST_KEY_NAME_PREFIX = 'balena_sdk_test_key_autodelete';

async function resetTestOrgs() {
	const orgs = await balena.pine.get({
		resource: 'organization',
		options: {
			$select: 'id',
			$filter: {
				name: { $startswith: TEST_ORGANIZATION_NAME },
			},
		},
	});

	await Promise.all(
		orgs.map(({ id }) =>
			balena.pine.delete({
				resource: 'organization',
				id,
			}),
		),
	);
}

export function givenAnOrganization(beforeFn: Mocha.HookFunction) {
	let orgId;
	beforeFn(async function () {
		// make sure we start with a clean state
		const orgs = await balena.models.organization.getAll({
			$select: ['id', 'name'],
			$filter: {
				name: TEST_ORGANIZATION_NAME,
			},
		});
		// just make sure we didn't accidentaly fetched more than intended
		orgs.forEach(({ name }) => expect(name).to.equal(TEST_ORGANIZATION_NAME));
		await Promise.all(
			orgs.map(({ id }) => balena.models.organization.remove(id)),
		);

		const organization = await balena.models.organization.create({
			name: TEST_ORGANIZATION_NAME,
		});
		this.organization = organization;
		orgId = organization.id;
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(async () => {
		await balena.pine.delete({
			resource: 'organization',
			id: orgId,
		});
	});
}

export function givenAnApplication(beforeFn: Mocha.HookFunction) {
	givenInitialOrganization(beforeFn);

	beforeFn(async function () {
		const application = await balena.models.application.create({
			name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
			deviceType: 'raspberry-pi',
			organization: this.initialOrg.id,
		});
		expect(application)
			.to.be.an('object')
			.that.has.property('id')
			.that.is.a('number');
		this.application = application;

		expect(application.is_for__device_type)
			.to.be.an('object')
			.that.has.property('__id')
			.that.is.a('number');
		this.applicationDeviceType = await getDeviceType(
			this.application.is_for__device_type.__id,
		);
		expect(this.applicationDeviceType)
			.to.be.an('object')
			.that.has.property('slug')
			.that.is.a('string');
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(async () => {
		await balena.pine.delete({
			resource: 'application',
			options: {
				$filter: {
					app_name: { $startswith: TEST_APPLICATION_NAME_PREFIX },
				},
			},
		});
	});
}

export const testDeviceOsInfo = {
	os_variant: 'prod',
	os_version: 'balenaOS 2.48.0+rev1',
	supervisor_version: '10.8.0',
};

export function givenLoggedInWithAnApplicationApiKey(
	beforeFn: Mocha.HookFunction,
) {
	givenLoggedInUser(beforeFn, true);
	givenAnApplication(beforeFn);

	beforeFn(async function () {
		const key = await balena.models.application.generateProvisioningKey({
			slugOrUuidOrId: this.application.slug,
			keyExpiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
		});
		await balena.auth.logout();
		await balena.auth.loginWithToken(key);
	});
}

export function givenLoggedInWithADeviceApiKey(beforeFn: Mocha.HookFunction) {
	givenLoggedInUser(beforeFn, true);
	givenAnApplication(beforeFn);
	givenADevice(beforeFn);

	beforeFn(async function () {
		const key = await balena.models.device.generateDeviceKey(this.device.id);
		await balena.auth.logout();
		await balena.auth.loginWithToken(key);
	});
}

export function givenADevice(
	beforeFn: Mocha.HookFunction,
	{
		api_heartbeat_state,
		...extraDeviceProps
	}: BalenaSdk.PineSubmitBody<BalenaSdk.Device> = {},
) {
	beforeFn(async function () {
		const uuid = balena.models.device.generateUniqueKey();
		const deviceInfo = await balena.models.device.register(
			this.application.slug,
			uuid,
		);

		if (this.currentRelease?.commit) {
			await balena.pine.patch<BalenaSdk.Device>({
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
		}
		if (Object.keys(extraDeviceProps).length > 0) {
			await balena.pine.patch<BalenaSdk.Device>({
				resource: 'device',
				body: extraDeviceProps,
				options: {
					$filter: {
						uuid: deviceInfo.uuid,
					},
				},
			});
		}
		if (api_heartbeat_state != null) {
			if (api_heartbeat_state !== 'online') {
				throw new Error(
					`Mocking the device's api_heartbeat_state only supports using the 'online' state`,
				);
			}
			await balena.request.send({
				url: `/device/v3/${deviceInfo.uuid}/state`,
				baseUrl: sdkOpts.apiUrl,
				apiKey: deviceInfo.api_key,
			});
		}

		const device = await balena.models.device.get(deviceInfo.uuid);
		this.device = device;
		this.deviceApiKey = deviceInfo.api_key;

		if (!this.currentRelease?.commit) {
			return;
		}

		const [oldWebInstall, newWebInstall, , newDbInstall] = await Promise.all([
			// Create image installs for the images on the device
			balena.pine.post<BalenaSdk.ImageInstall>({
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
			balena.pine.post<BalenaSdk.ImageInstall>({
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
			balena.pine.post<BalenaSdk.ImageInstall>({
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
			balena.pine.post<BalenaSdk.ImageInstall>({
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
		]);
		this.oldWebInstall = oldWebInstall;
		this.newWebInstall = newWebInstall;
		this.newDbInstall = newDbInstall;
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(async function () {
		await balena.pine.delete({
			resource: 'device',
			id: this.device.id,
		});
	});
}

export function givenMulticontainerApplicationWithADevice(
	beforeFn: Mocha.HookFunction,
) {
	givenMulticontainerApplication(beforeFn);
	givenADevice(beforeFn);
}

export function givenMulticontainerApplication(beforeFn: Mocha.HookFunction) {
	givenAnApplication(beforeFn);

	beforeFn(async function () {
		const { id: userId } = await balena.auth.getUserInfo();
		const oldDate = new Date('2017-01-01').toISOString();
		const now = new Date().toISOString();
		const [webService, dbService, [oldRelease, newRelease]] = await Promise.all(
			[
				// Register web & DB services
				balena.pine.post<BalenaSdk.Service>({
					resource: 'service',
					body: {
						application: this.application.id,
						service_name: 'web',
					},
				}),
				balena.pine.post<BalenaSdk.Service>({
					resource: 'service',
					body: {
						application: this.application.id,
						service_name: 'db',
					},
				}),
				// Register an old & new release of this application
				(async () => {
					return [
						await balena.pine.post<BalenaSdk.Release>({
							resource: 'release',
							body: {
								belongs_to__application: this.application.id,
								is_created_by__user: userId,
								commit: 'old-release-commit',
								semver: '0.0.0',
								status: 'success' as const,
								source: 'cloud',
								composition: {},
								start_timestamp: oldDate,
							},
						}),
						await balena.pine
							.post<BalenaSdk.Release>({
								resource: 'release',
								body: {
									belongs_to__application: this.application.id,
									is_created_by__user: userId,
									commit: 'new-release-commit',
									semver: '1.0.0',
									status: 'success' as const,
									source: 'cloud',
									composition: {},
									start_timestamp: now,
								},
							})
							.then(({ id }) =>
								balena.models.release.get(id, {
									$select: [
										'id',
										'commit',
										'raw_version',
										'belongs_to__application',
									],
								}),
							),
					];
				})(),
			],
		);
		this.webService = webService;
		this.dbService = dbService;
		this.oldRelease = oldRelease;
		this.currentRelease = newRelease;

		const [oldWebImage, newWebImage, oldDbImage, newDbImage] =
			await Promise.all([
				// Register an old & new web image build from the old and new
				// releases, a db build in the new release only
				balena.pine.post<BalenaSdk.Image>({
					resource: 'image',
					body: {
						is_a_build_of__service: webService.id,
						project_type: 'dockerfile',
						content_hash:
							'sha256:abc0000000000000000000000000000000000000000000000000000000000000',
						build_log: 'old web log',
						start_timestamp: oldDate,
						push_timestamp: oldDate,
						status: 'success',
					},
				}),
				balena.pine.post<BalenaSdk.Image>({
					resource: 'image',
					body: {
						is_a_build_of__service: webService.id,
						project_type: 'dockerfile',
						content_hash:
							'sha256:def0000000000000000000000000000000000000000000000000000000000000',
						build_log: 'new web log',
						start_timestamp: now,
						push_timestamp: now,
						status: 'success',
					},
				}),
				balena.pine.post<BalenaSdk.Image>({
					resource: 'image',
					body: {
						is_a_build_of__service: dbService.id,
						project_type: 'dockerfile',
						content_hash:
							'sha256:jkl0000000000000000000000000000000000000000000000000000000000000',
						build_log: 'old db log',
						start_timestamp: oldDate,
						push_timestamp: oldDate,
						status: 'success',
					},
				}),
				balena.pine.post<BalenaSdk.Image>({
					resource: 'image',
					body: {
						is_a_build_of__service: dbService.id,
						project_type: 'dockerfile',
						content_hash:
							'sha256:ghi0000000000000000000000000000000000000000000000000000000000000',
						build_log: 'new db log',
						start_timestamp: now,
						push_timestamp: now,
						status: 'success',
					},
				}),
			]);
		this.oldWebImage = oldWebImage;
		this.newWebImage = newWebImage;
		this.oldDbImage = oldDbImage;
		this.newDbImage = newDbImage;
		await Promise.all([
			// Tie the images to their corresponding releases
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: oldWebImage.id,
					is_part_of__release: oldRelease.id,
				},
			}),
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: oldDbImage.id,
					is_part_of__release: oldRelease.id,
				},
			}),
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: newWebImage.id,
					is_part_of__release: newRelease.id,
				},
			}),
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: newDbImage.id,
					is_part_of__release: newRelease.id,
				},
			}),
		]);
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(function () {
		return (this.currentRelease = null);
	});
}

export function givenASupervisorRelease(
	beforeFn: Mocha.HookFunction,
	version = '11.12.4',
) {
	beforeFn(async function () {
		const dt = await balena.models.deviceType.get(
			this.application.is_for__device_type.__id,
			{
				$select: 'id',
				$expand: {
					is_of__cpu_architecture: {
						$select: 'slug',
					},
				},
			},
		);
		const [supervisorRelease] =
			await balena.models.os.getSupervisorReleasesForCpuArchitecture(
				dt.is_of__cpu_architecture[0].slug,
				{
					$select: ['id', 'raw_version'],
					$filter: {
						raw_version: version,
					},
				},
			);
		this.supervisorRelease = supervisorRelease;
	});
}

export const organizationRetrievalFields = ['id', 'handle'] satisfies Array<
	keyof BalenaSdk.Organization
>;
export const applicationRetrievalFields = [
	'id',
	'slug',
	'uuid',
] satisfies Array<keyof BalenaSdk.Application>;
export const deviceUniqueFields = ['id', 'uuid'] satisfies Array<
	keyof BalenaSdk.Device
>;
