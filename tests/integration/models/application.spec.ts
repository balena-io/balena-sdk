// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import type * as BalenaSdk from '../../..';
import { expectError, timeSuite } from '../../util';
import type * as tagsHelper from './tags';

import {
	balena,
	credentials,
	givenADevice,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplicationWithADevice,
	givenInitialOrganization,
	sdkOpts,
	applicationRetrievalFields,
	organizationRetrievalFields,
	TEST_APPLICATION_NAME_PREFIX,
} from '../setup';

import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';

describe('Application Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	describe('given no applications', function () {
		describe('[read operations]', function () {
			let ctx: Mocha.Context;

			before(function () {
				ctx = this;
			});

			parallel('balena.models.application.getAll()', function () {
				it('should include public apps', async function () {
					const applications = await balena.models.application.getAll();
					const publicApps = applications.filter((app) => app.is_public);
					expect(publicApps).to.have.length.that.is.greaterThan(0);
				});

				it('should eventually become an empty array of accessible apps', async function () {
					const apps = await balena.models.application.getAll(
						{},
						'directly_accessible',
					);
					expect(apps).to.deep.equal([]);
				});
			});

			parallel(
				'balena.models.application.getAllDirectlyAccessible()',
				function () {
					it('should eventually become an empty array of accessible apps', async function () {
						const apps =
							await balena.models.application.getAllDirectlyAccessible();
						expect(apps).to.deep.equal([]);
					});
				},
			);

			parallel('balena.models.application.getAllByOrganization()', function () {
				it('should eventually become an empty array of accessible apps', async function () {
					const apps = await balena.models.application.getAllByOrganization(
						ctx.initialOrg.handle,
					);
					expect(apps).to.deep.equal([]);
				});
			});

			parallel('balena.models.application.getAppByName()', function () {
				it('should eventually reject', async function () {
					await expectError(
						async () => {
							await balena.models.application.getAppByName('testapp');
						},
						(error) => {
							expect(error).to.have.property(
								'code',
								'BalenaApplicationNotFound',
							);
						},
					);
				});
			});

			describe('balena.models.application.hasAny()', function () {
				it('should eventually be false', async function () {
					expect(await balena.models.application.hasAny()).to.be.false;
				});
			});
		});

		describe('balena.models.application.create()', function () {
			let ctx: Mocha.Context;

			before(function () {
				ctx = this;
			});

			parallel('[read operations]', function () {
				it('should be rejected if the device type is invalid', async function () {
					await expectError(async () => {
						await balena.models.application.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
							deviceType: 'foobarbaz',
							organization: ctx.initialOrg.id,
						});
					}, 'Invalid device type: foobarbaz');
				});

				it('should be rejected if the name has less than four characters', async function () {
					await expectError(
						async () => {
							await balena.models.application.create({
								name: 'Foo',
								deviceType: 'raspberry-pi',
								organization: ctx.initialOrg.id,
							});
						},
						(error) => {
							expect(error).to.have.property('code', 'BalenaRequestError');
							expect(error).to.have.property('statusCode', 400);
							expect(error)
								.to.have.property('message')
								.that.contains(
									'It is necessary that each application has an app name that has a Length (Type) that is greater than or equal to 4 and is less than or equal to 100',
								);
						},
					);
				});

				it('should be rejected if the user did not provide an organization parameter', async () => {
					await expectError(async () => {
						// @ts-expect-error missing parameter
						await balena.models.application.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
							deviceType: 'raspberry-pi',
						});
					}, "undefined is not a valid value for parameter 'organization'");
				});

				it('should be rejected if the user does not have access to find the organization by handle', async function () {
					await expectError(async () => {
						await balena.models.application.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
							deviceType: 'raspberry-pi',
							// add some extra invalid characters to the organization's handle just to be sure
							organization: 'balena-test-non-existing-organization-handle-!@#',
						});
					}, 'Organization not found: balena-test-non-existing-organization-handle-!@#');
				});

				it('should be rejected if the user does not have access to find the organization by id', async function () {
					await expectError(async () => {
						await balena.models.application.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
							deviceType: 'raspberry-pi',
							// This test will fail if org 1 adds the SDK's test user as a member...
							organization: 1,
						});
					}, 'Organization not found: 1');
				});
			});

			describe('[mutating operations]', function () {
				let appCount = 0;
				beforeEach(() => {
					appCount++;
				});

				after(() =>
					balena.pine.delete({
						resource: 'application',
						options: {
							$filter: {
								app_name: { $startswith: TEST_APPLICATION_NAME_PREFIX },
							},
						},
					}),
				);

				organizationRetrievalFields.forEach((prop) => {
					it(`should be able to create an application using the user's initial organization ${prop}`, async function () {
						await balena.models.application.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBarByOrg${_.startCase(prop)}`,
							deviceType: 'raspberrypi',
							organization: this.initialOrg[prop],
						});

						const apps = await balena.models.application.getAll(
							{
								$select: 'id',
								$expand: { organization: { $select: 'id' } },
							},
							'directly_accessible',
						);
						expect(apps).to.have.length(appCount);
						expect(apps[0]).to.have.nested.property(
							'organization[0].id',
							this.initialOrg.id,
						);
					});
				});

				it('...should be able to create an application w/o providing an application type', function () {
					return balena.models.application
						.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBarNoAppType`,
							deviceType: 'raspberry-pi',
							organization: this.initialOrg.id,
						})
						.then(async function () {
							expect(
								await balena.models.application.getAll(
									{},
									'directly_accessible',
								),
							).to.have.length(appCount);
						});
				});

				it('...should be able to create an application and specify a custom uuid', async function () {
					const uuid = balena.models.device.generateUniqueKey();
					const app = await balena.models.application.create({
						name: `${TEST_APPLICATION_NAME_PREFIX}_FooBarCustomUuid`,
						uuid,
						deviceType: 'raspberry-pi',
						organization: this.initialOrg.id,
					});
					expect(app).to.have.property('uuid', uuid);
					const apps = await balena.models.application.getAll(
						{},
						'directly_accessible',
					);
					expect(apps).to.have.length(appCount);
				});

				it('...should be able to create an application with a specific application type', function () {
					return balena.models.application
						.create({
							name: `${TEST_APPLICATION_NAME_PREFIX}_FooBarWithAppType`,
							deviceType: 'raspberry-pi',
							organization: this.initialOrg.id,
						})
						.then(function (app) {
							expect(app).to.have.property('id').that.is.a('number');
							expect(app.is_for__device_type)
								.to.be.an('object')
								.that.has.property('__id')
								.that.is.a('number');

							return balena.models.application
								.getAll(
									{
										$expand: { is_for__device_type: { $select: 'slug' } },
										$orderby: { id: 'desc' },
									},
									'directly_accessible',
								)
								.then(function (apps) {
									expect(apps).to.have.length(appCount);
									expect(apps[0]).to.have.property('id', app.id);
									expect(apps[0])
										.to.have.property('is_for__device_type')
										.that.is.an('array');
									expect(apps[0].is_for__device_type).to.have.length(1);
									return expect(
										apps[0].is_for__device_type[0],
									).to.have.property('slug', 'raspberry-pi');
								});
						});
				});

				it('...should be able to create an application using a device type alias', async function () {
					await balena.models.application.create({
						name: `${TEST_APPLICATION_NAME_PREFIX}_FooBarDeviceTypeAlias`,
						deviceType: 'raspberrypi',
						organization: this.initialOrg.id,
					});

					expect(
						await balena.models.application.getAll({}, 'directly_accessible'),
					).to.have.length(appCount);
				});

				it('should succeed even if the device type is discontinued', async function () {
					await balena.models.application.create({
						name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
						deviceType: 'edge',
						organization: ctx.initialOrg.id,
					});
				});
			});
		});
	});

	describe('given a single application', function () {
		describe('balena.models.application.remove()', function () {
			it('should be rejected if the application slug does not exist', async function () {
				await expectError(async () => {
					await balena.models.application.remove(
						`${this.initialOrg.handle}/${TEST_APPLICATION_NAME_PREFIX}_helloworldapp`,
					);
				}, `Application not found: ${this.initialOrg.handle}/${TEST_APPLICATION_NAME_PREFIX}_helloworldapp`);
			});

			it('should be rejected if the application id does not exist', async function () {
				await expectError(async () => {
					await balena.models.application.remove(999999);
				}, 'Application not found: 999999');
			});

			describe('[mutating operations]', function () {
				givenAnApplication(beforeEach);
				it('should be rejected when an empty string is provided', async function () {
					await expectError(async () => {
						await balena.models.application.remove('');
					}, `Application not found: `);
				});
				applicationRetrievalFields.forEach((prop) => {
					it(`should be able to remove an existing application by ${prop}`, async function () {
						await balena.models.application.remove(this.application[prop]);

						expect(
							await balena.models.application.getAll({}, 'directly_accessible'),
						).to.deep.equal([]);
					});
				});
			});
		});

		describe('[contained scenario]', function () {
			givenAnApplication(before);

			describe('[read operations]', function () {
				let ctx: Mocha.Context;

				before(function () {
					ctx = this;
				});

				describe('balena.models.application.hasAny()', function () {
					it('should eventually be true', async function () {
						expect(await balena.models.application.hasAny()).to.be.true;
					});
				});

				describe('balena.models.application.create()', function () {
					it('should reject if trying to create an app with the same name', async function () {
						await expectError(
							async () => {
								await balena.models.application.create({
									name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
									deviceType: 'beaglebone-black',
									organization: this.initialOrg.id,
								});
							},
							(error) => {
								expect(error).to.have.property('code', 'BalenaRequestError');
								expect(error).to.have.property('statusCode', 409);
								expect(error)
									.to.have.property('message')
									.that.matches(/\bunique\b/i);
							},
						);
					});
				});
				// TODO: re-enable once the API regression gets fixed
				// expect(error).to.have.property('message').that.contains('Application name must be unique')

				describe('balena.models.application.hasAny()', function () {
					it('should eventually be true', async function () {
						expect(await balena.models.application.hasAny()).to.be.true;
					});
				});

				describe('balena.models.application.getAppByName()', function () {
					it('should find the created application', async function () {
						const app = await balena.models.application.getAppByName(
							`${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
						);
						expect(app.id).to.equal(ctx.application.id);
					});

					it('should find the created application [directly_accessible]', async function () {
						const app = await balena.models.application.getAppByName(
							`${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
							{},
							'directly_accessible',
						);
						expect(app.id).to.equal(ctx.application.id);
					});
				});

				parallel('balena.models.application.getAll()', function () {
					it('should eventually become an array containing the application', async function () {
						const applications = await balena.models.application.getAll(
							{},
							'directly_accessible',
						);
						expect(applications).to.have.length(1);
						expect(applications[0].id).to.equal(ctx.application.id);
					});

					it('should support arbitrary pinejs options', async function () {
						const applications = await balena.models.application.getAll(
							{ $expand: { organization: { $select: 'handle' } } },
							'directly_accessible',
						);
						expect(applications[0].organization[0].handle).to.equal(
							credentials.username,
						);
					});
				});

				parallel(
					'balena.models.application.getAllDirectlyAccessible()',
					function () {
						it('should eventually become an array containing the application', async function () {
							const applications =
								await balena.models.application.getAllDirectlyAccessible();
							expect(applications).to.have.length(1);
							expect(applications[0].id).to.equal(ctx.application.id);
						});

						it('should support arbitrary pinejs options', async function () {
							const applications =
								await balena.models.application.getAllDirectlyAccessible({
									$expand: { organization: { $select: 'handle' } },
								});
							expect(applications[0].organization[0].handle).to.equal(
								credentials.username,
							);
						});
					},
				);

				organizationRetrievalFields.forEach((prop) => {
					it('should eventually become an array containing the application', async function () {
						const applications =
							await balena.models.application.getAllByOrganization(
								ctx.initialOrg[prop],
							);
						expect(applications).to.have.length(1);
						expect(applications[0].id).to.equal(ctx.application.id);
					});
				});

				parallel('balena.models.application.get()', function () {
					applicationRetrievalFields.forEach((prop) => {
						it(`should be able to get an application by ${prop}`, async function () {
							expect(
								await balena.models.application.get(ctx.application[prop]),
							).to.deep.equal(ctx.application);
						});
					});

					it('should be able to get an application by slug regardless of casing', async function () {
						if (
							ctx.application.app_name === ctx.application.slug.toUpperCase()
						) {
							throw new Error(
								'This tests expects the application name to not be fully upper case',
							);
						}

						expect(
							await balena.models.application.get(
								ctx.application.slug.toUpperCase(),
							),
						).to.deep.equal(ctx.application);
					});

					it('should be rejected if the application slug does not exist', async function () {
						await expectError(async () => {
							await balena.models.application.get(
								`${ctx.initialOrg.handle}/helloworldapp`,
							);
						}, `Application not found: ${ctx.initialOrg.handle}/helloworldapp`);
					});

					it('should be rejected if the application id does not exist', async function () {
						await expectError(async () => {
							await balena.models.application.get(999999);
						}, 'Application not found: 999999');
					});

					it('should support arbitrary pinejs options', function () {
						return balena.models.application
							.get(ctx.application.id, {
								$expand: { organization: { $select: 'handle' } },
							})
							.then((application) =>
								expect(application.organization[0].handle).to.equal(
									credentials.username,
								),
							);
					});
				});

				parallel(
					'balena.models.application.getDirectlyAccessible()',
					function () {
						applicationRetrievalFields.forEach((prop) => {
							it(`should be able to get an application by ${prop}`, async function () {
								expect(
									await balena.models.application.getDirectlyAccessible(
										ctx.application[prop],
									),
								).to.deep.equal(ctx.application);
							});
						});
					},
				);

				parallel('balena.models.application.has()', function () {
					applicationRetrievalFields.forEach((prop) => {
						it(`should eventually be true if the application ${prop} exists`, async function () {
							expect(await balena.models.application.has(ctx.application[prop]))
								.to.be.true;
						});
					});

					it('should return false if the application id is undefined', async function () {
						// @ts-expect-error invalid value
						expect(await balena.models.application.has(undefined)).to.be.false;
					});

					it('should eventually be false if the application slug does not exist', async function () {
						expect(
							await balena.models.application.has(
								`${ctx.initialOrg.handle}/helloworldapp`,
							),
						).to.be.false;
					});

					it('should eventually be false if the application id does not exist', async function () {
						expect(await balena.models.application.has(999999)).to.be.false;
					});
				});
			});

			describe('balena.models.application.rename()', function () {
				it('should be rejected if the application slug does not exist', async function () {
					await expectError(async () => {
						await balena.models.application.rename(
							`${this.initialOrg.handle}/helloworldapp`,
							`${TEST_APPLICATION_NAME_PREFIX}_newAppName`,
						);
					}, `Application not found: ${this.initialOrg.handle}/helloworldapp`);
				});

				describe('[mutating operations]', function () {
					let originalAppName;
					before(function () {
						originalAppName = this.application.app_name;
					});
					afterEach(function () {
						return balena.models.application.rename(
							this.application.id,
							originalAppName,
						);
					});
					applicationRetrievalFields.forEach((prop) => {
						it(`should be able to rename an existing application by ${prop}`, async function () {
							const newApplicationName = `${TEST_APPLICATION_NAME_PREFIX}_newApplicationName_${prop}`;
							await balena.models.application.rename(
								this.application[prop],
								newApplicationName,
							);
							const app = await balena.models.application.get(
								this.application.id,
								{
									$select: 'app_name',
								},
							);
							expect(app).to.have.property('app_name', newApplicationName);
						});
					});
				});
			});

			describe('balena.models.application.generateProvisioningKey()', function () {
				const getProvisioningKeys = async function (appNameOrSlug, options?) {
					const provisioningKeys =
						await balena.models.apiKey.getProvisioningApiKeysByApplication(
							appNameOrSlug,
							options,
						);

					expect(provisioningKeys).to.be.an('array');

					return provisioningKeys;
				};

				applicationRetrievalFields.forEach((prop) => {
					it(`should be able to generate a provisioning key by ${prop}`, function () {
						return balena.models.application
							.generateProvisioningKey({
								slugOrUuidOrId: this.application[prop],
								keyExpiryDate: new Date(
									Date.now() + 1000 * 60 * 60,
								).toISOString(),
							})
							.then(function (key) {
								expect(_.isString(key)).to.be.true;
								return expect(key).to.have.length(32);
							});
					});
				});

				applicationRetrievalFields.forEach((prop) => {
					it(`should be able to generate a provisioning key by ${prop} with key name as key_${prop}`, async function () {
						const provisioningKeys = await getProvisioningKeys(
							this.application[prop],
						);

						const key = await balena.models.application.generateProvisioningKey(
							{
								slugOrUuidOrId: this.application[prop],
								keyExpiryDate: new Date(
									Date.now() + 1000 * 60 * 60,
								).toISOString(),
								keyName: `key_${prop}`,
							},
						);

						expect(key).to.be.a('string');
						expect(key).to.have.length(32);
						const updatedProvisioningKeys = await getProvisioningKeys(
							this.application[prop],
						);

						const provisionKeys = _.differenceWith(
							updatedProvisioningKeys,
							provisioningKeys,
							_.isEqual,
						);

						expect(provisionKeys).to.have.lengthOf(1);
						expect(provisionKeys[0]).to.have.property('name');
						expect(provisionKeys[0])
							.to.have.property('name')
							.to.be.equal(`key_${prop}`);
					});

					it(`should be able to generate a provisioning key by ${prop} with description as 'Provisioning key generated with name key_${prop}'`, async function () {
						const provisioningKeys = await getProvisioningKeys(
							this.application[prop],
						);

						const key = await balena.models.application.generateProvisioningKey(
							{
								slugOrUuidOrId: this.application[prop],
								keyExpiryDate: new Date(
									Date.now() + 1000 * 60 * 60,
								).toISOString(),
								keyName: `key_${prop}`,
								keyDescription: `Provisioning key generated with name key_${prop}`,
							},
						);

						expect(key).to.be.a('string');
						expect(key).to.have.length(32);
						const updatedProvisioningKeys = await getProvisioningKeys(
							this.application[prop],
						);

						const provisionKeys = _.differenceWith(
							updatedProvisioningKeys,
							provisioningKeys,
							_.isEqual,
						);

						expect(provisionKeys).to.have.lengthOf(1);
						expect(provisionKeys[0]).to.have.property('name');
						expect(provisionKeys[0])
							.to.have.property('description')
							.to.be.equal(`Provisioning key generated with name key_${prop}`);
					});

					it(`should be able to generate a provisioning key by ${prop} with expiry-date`, async function () {
						const provisioningKeys = await getProvisioningKeys(
							this.application[prop],
						);

						const oneHourDate = new Date(
							Date.now() + 1000 * 60 * 60,
						).toISOString();
						const key = await balena.models.application.generateProvisioningKey(
							{
								slugOrUuidOrId: this.application[prop],
								keyExpiryDate: oneHourDate,
								keyName: `key_${prop}`,
								keyDescription: `Provisioning key generated with name key_${prop}`,
							},
						);

						expect(key).to.be.a('string');
						expect(key).to.have.length(32);
						const updatedProvisioningKeys = await getProvisioningKeys(
							this.application[prop],
						);

						const provisionKeys = _.differenceWith(
							updatedProvisioningKeys,
							provisioningKeys,
							_.isEqual,
						);

						expect(provisionKeys).to.have.lengthOf(1);
						expect(provisionKeys[0]).to.have.property('expiry_date');
						expect(provisionKeys[0])
							.to.have.property('expiry_date')
							.to.be.equal(oneHourDate);
					});
				});

				it('should be rejected if the application slug does not exist', async function () {
					await expectError(async () => {
						await balena.models.application.generateProvisioningKey({
							slugOrUuidOrId: `${this.initialOrg.handle}/helloworldapp`,
							keyExpiryDate: new Date(
								Date.now() + 1000 * 60 * 60,
							).toISOString(),
						});
					}, `Application not found: ${this.initialOrg.handle}/helloworldapp`);
				});

				it('should be rejected if the application id does not exist', async function () {
					await expectError(async () => {
						await balena.models.application.generateProvisioningKey({
							slugOrUuidOrId: 999999,
							keyExpiryDate: new Date(
								Date.now() + 1000 * 60 * 60,
							).toISOString(),
						});
					}, 'Application not found: 999999');
				});
			});

			describe('balena.models.application.grantSupportAccess()', function () {
				it('should throw an error if the expiry time stamp is in the past', async function () {
					const expiryTimestamp = Date.now() - 3600 * 1000;

					await expectError(async () => {
						await balena.models.application.grantSupportAccess(
							this.application.id,
							expiryTimestamp,
						);
					});
				});

				it('should throw an error if the expiry time stamp is undefined', async function () {
					await expectError(async () => {
						// @ts-expect-error missing parameter
						await balena.models.application.grantSupportAccess(
							this.application.id,
						);
					});
				});

				it('should grant support access until the specified time', async function () {
					const expiryTime = Date.now() + 3600 * 1000;
					await balena.models.application.grantSupportAccess(
						this.application.id,
						expiryTime,
					);

					const app = await balena.models.application.get(this.application.id, {
						$select: 'is_accessible_by_support_until__date',
					});
					expect(Date.parse(app.is_accessible_by_support_until__date)).to.equal(
						expiryTime,
					);
				});
			});

			describe('balena.models.application.revokeSupportAccess()', () => {
				it('...should revoke support access', async function () {
					const {
						is_accessible_by_support_until__date: originalSupportExpiry,
					} = await balena.models.application.get(this.application.id, {
						$select: 'is_accessible_by_support_until__date',
					});
					expect(originalSupportExpiry).to.not.equal(null);

					await balena.models.application.revokeSupportAccess(
						this.application.id,
					);
					const { is_accessible_by_support_until__date: supportExpiry } =
						await balena.models.application.get(this.application.id, {
							$select: 'is_accessible_by_support_until__date',
						});
					expect(supportExpiry).to.equal(null);
				});
			});

			describe('balena.models.application.tags', function () {
				const tagTestOptions: tagsHelper.Options = {
					model: balena.models.application.tags,
					modelNamespace: 'balena.models.application.tags',
					resourceName: 'application',
					uniquePropertyNames: applicationRetrievalFields,
				};

				before(function () {
					tagTestOptions.resourceProvider = () => this.application;
				});

				itShouldSetGetAndRemoveTags(tagTestOptions);

				describe('balena.models.application.tags.getAllByApplication()', function () {
					itShouldGetAllTagsByResource(tagTestOptions);
				});
			});

			describe('balena.models.application.configVar', function () {
				const configVarModel = balena.models.application.configVar;

				applicationRetrievalFields.forEach(function (appParam) {
					const appParamUpper = appParam.toUpperCase();

					it(`can create a variable by ${appParam}`, async function () {
						await configVarModel.set(
							this.application[appParam],
							`BALENA_EDITOR_${appParamUpper}`,
							'vim',
						);
					});

					it(`...can retrieve a created variable by ${appParam}`, function () {
						return configVarModel
							.get(this.application[appParam], `BALENA_EDITOR_${appParamUpper}`)
							.then((result) => expect(result).to.equal('vim'));
					});

					it(`...can update and retrieve a variable by ${appParam}`, function () {
						return configVarModel
							.set(
								this.application[appParam],
								`BALENA_EDITOR_${appParamUpper}`,
								'emacs',
							)
							.then(() => {
								return configVarModel.get(
									this.application[appParam],
									`BALENA_EDITOR_${appParamUpper}`,
								);
							})
							.then((result) => expect(result).to.equal('emacs'));
					});

					it(`...can delete and then fail to retrieve a variable by ${appParam}`, function () {
						return configVarModel
							.remove(
								this.application[appParam],
								`BALENA_EDITOR_${appParamUpper}`,
							)
							.then(() => {
								return configVarModel.get(
									this.application[appParam],
									`BALENA_EDITOR_${appParamUpper}`,
								);
							})
							.then((result) => expect(result).to.equal(undefined));
					});

					it(`can create and then retrieve multiple variables by ${appParam}`, function () {
						return Promise.all([
							configVarModel.set(
								this.application[appParam],
								`BALENA_A_${appParamUpper}`,
								'a',
							),
							configVarModel.set(
								this.application[appParam],
								`BALENA_B_${appParamUpper}`,
								'b',
							),
						])
							.then(() => {
								return configVarModel.getAllByApplication(
									this.application[appParam],
								);
							})
							.then(function (result) {
								expect(_.find(result, { name: `BALENA_A_${appParamUpper}` }))
									.to.be.an('object')
									.that.has.property('value', 'a');
								return expect(
									_.find(result, { name: `BALENA_B_${appParamUpper}` }),
								)
									.to.be.an('object')
									.that.has.property('value', 'b');
							})
							.then(() =>
								Promise.all([
									configVarModel.remove(
										this.application[appParam],
										`BALENA_A_${appParamUpper}`,
									),
									configVarModel.remove(
										this.application[appParam],
										`BALENA_B_${appParamUpper}`,
									),
								]),
							);
					});
				});
			});

			describe('balena.models.application.envVar', function () {
				const envVarModel = balena.models.application.envVar;

				applicationRetrievalFields.forEach(function (appParam) {
					it(`can create a variable by ${appParam}`, async function () {
						await envVarModel.set(
							this.application[appParam],
							`EDITOR_BY_${appParam}`,
							'vim',
						);
					});

					it(`...can retrieve a created variable by ${appParam}`, function () {
						return envVarModel
							.get(this.application[appParam], `EDITOR_BY_${appParam}`)
							.then((result) => expect(result).to.equal('vim'));
					});

					it(`...can update and retrieve a variable by ${appParam}`, function () {
						return envVarModel
							.set(this.application[appParam], `EDITOR_BY_${appParam}`, 'emacs')
							.then(() => {
								return envVarModel.get(
									this.application[appParam],
									`EDITOR_BY_${appParam}`,
								);
							})
							.then((result) => expect(result).to.equal('emacs'));
					});

					it(`...can delete and then fail to retrieve a variable by ${appParam}`, function () {
						return envVarModel
							.remove(this.application[appParam], `EDITOR_BY_${appParam}`)
							.then(() => {
								return envVarModel.get(
									this.application[appParam],
									`EDITOR_BY_${appParam}`,
								);
							})
							.then((result) => expect(result).to.equal(undefined));
					});

					it(`can create and then retrieve multiple variables by ${appParam}`, function () {
						return Promise.all([
							envVarModel.set(
								this.application[appParam],
								`A_BY_${appParam}`,
								'a',
							),
							envVarModel.set(
								this.application[appParam],
								`B_BY_${appParam}`,
								'b',
							),
						])
							.then(() => {
								return envVarModel.getAllByApplication(
									this.application[appParam],
								);
							})
							.then(function (result) {
								expect(_.find(result, { name: `A_BY_${appParam}` }))
									.to.be.an('object')
									.that.has.property('value', 'a');
								return expect(_.find(result, { name: `B_BY_${appParam}` }))
									.to.be.an('object')
									.that.has.property('value', 'b');
							})
							.then(() =>
								Promise.all([
									envVarModel.remove(
										this.application[appParam],
										`A_BY_${appParam}`,
									),
									envVarModel.remove(
										this.application[appParam],
										`B_BY_${appParam}`,
									),
								]),
							);
					});
				});
			});

			describe('balena.models.application.buildEnvVar', function () {
				const envVarModel = balena.models.application.buildVar;

				applicationRetrievalFields.forEach(function (appParam) {
					it(`can create a variable by ${appParam}`, async function () {
						await envVarModel.set(
							this.application[appParam],
							`EDITOR_BY_${appParam}`,
							'vim',
						);
					});

					it(`...can retrieve a created variable by ${appParam}`, function () {
						return envVarModel
							.get(this.application[appParam], `EDITOR_BY_${appParam}`)
							.then((result) => expect(result).to.equal('vim'));
					});

					it(`...can update and retrieve a variable by ${appParam}`, function () {
						return envVarModel
							.set(this.application[appParam], `EDITOR_BY_${appParam}`, 'emacs')
							.then(() => {
								return envVarModel.get(
									this.application[appParam],
									`EDITOR_BY_${appParam}`,
								);
							})
							.then((result) => expect(result).to.equal('emacs'));
					});

					it(`...can delete and then fail to retrieve a variable by ${appParam}`, function () {
						return envVarModel
							.remove(this.application[appParam], `EDITOR_BY_${appParam}`)
							.then(() => {
								return envVarModel.get(
									this.application[appParam],
									`EDITOR_BY_${appParam}`,
								);
							})
							.then((result) => expect(result).to.equal(undefined));
					});

					it(`can create and then retrieve multiple variables by ${appParam}`, function () {
						return Promise.all([
							envVarModel.set(
								this.application[appParam],
								`A_BY_${appParam}`,
								'a',
							),
							envVarModel.set(
								this.application[appParam],
								`B_BY_${appParam}`,
								'b',
							),
						])
							.then(() => {
								return envVarModel.getAllByApplication(
									this.application[appParam],
								);
							})
							.then(function (result) {
								expect(_.find(result, { name: `A_BY_${appParam}` }))
									.to.be.an('object')
									.that.has.property('value', 'a');
								return expect(_.find(result, { name: `B_BY_${appParam}` }))
									.to.be.an('object')
									.that.has.property('value', 'b');
							})
							.then(() =>
								Promise.all([
									envVarModel.remove(
										this.application[appParam],
										`A_BY_${appParam}`,
									),
									envVarModel.remove(
										this.application[appParam],
										`B_BY_${appParam}`,
									),
								]),
							);
					});
				});
			});

			describe('with a registered device', function () {
				givenADevice(before);

				describe('balena.models.application.enableDeviceUrls()', () => {
					it("should enable the device url for the application's devices", async function () {
						await balena.models.application.enableDeviceUrls(
							this.application.id,
						);
						expect(await balena.models.device.hasDeviceUrl(this.device.uuid)).to
							.be.true;
					});
				});

				describe('balena.models.application.disableDeviceUrls()', () => {
					it("...should disable the device url for the application's devices", async function () {
						await balena.models.device.enableDeviceUrl(this.device.uuid);
						await balena.models.application.disableDeviceUrls(
							this.application.id,
						);
						expect(await balena.models.device.hasDeviceUrl(this.device.uuid)).to
							.be.false;
					});
				});

				describe('given two releases', function () {
					before(async function () {
						const { id: userId } = await balena.auth.getUserInfo();
						this.oldRelease = await balena.pine.post({
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
						});

						this.newRelease = await balena.pine.post({
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
						});
					});

					describe('balena.models.application.willTrackNewReleases()', function () {
						it('should be configured to track new releases by default', async function () {
							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.true;
						});

						it('...should be false when should_track_latest_release is false', async function () {
							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_track_latest_release: false },
							});

							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.false;

							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_track_latest_release: true },
							});

							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.true;
						});

						it('...should be true regardless of the current commit', async function () {
							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_be_running__release: this.oldRelease.id },
							});

							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.true;

							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_be_running__release: this.newRelease.id },
							});

							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.true;
						});
					});

					describe('balena.models.application.isTrackingLatestRelease()', function () {
						it('should be tracking the latest release by default', async function () {
							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.true;
						});

						it('...should be false when should_track_latest_release is false', async function () {
							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_track_latest_release: false },
							});

							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.false;

							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_track_latest_release: true },
							});

							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.true;
						});

						it('...should be false when the current commit is not of the latest release', async function () {
							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_be_running__release: this.oldRelease.id },
							});

							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.false;

							await balena.pine.patch({
								resource: 'application',
								id: this.application.id,
								body: { should_be_running__release: this.newRelease.id },
							});

							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.true;
						});
					});

					describe('balena.models.application.getTargetReleaseHash()', () => {
						it('should retrieve the commit hash of the current release', async function () {
							expect(
								await balena.models.application.getTargetReleaseHash(
									this.application.id,
								),
							).to.equal('new-release-commit');
						});
					});

					describe('balena.models.application.pinToRelease()', () => {
						it('should set the application to specific release & disable latest release tracking', async function () {
							await balena.models.application.pinToRelease(
								this.application.id,
								'old-release-commit',
							);
							expect(
								await balena.models.application.getTargetReleaseHash(
									this.application.id,
								),
							).to.equal('old-release-commit');
							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.false;
							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.false;
						});
					});

					describe('balena.models.application.trackLatestRelease()', () => {
						it('...should re-enable latest release tracking', async function () {
							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.false;

							await balena.models.application.trackLatestRelease(
								this.application.id,
							);

							expect(
								await balena.models.application.getTargetReleaseHash(
									this.application.id,
								),
							).to.equal('new-release-commit');

							expect(
								await balena.models.application.willTrackNewReleases(
									this.application.id,
								),
							).to.be.true;

							expect(
								await balena.models.application.isTrackingLatestRelease(
									this.application.id,
								),
							).to.be.true;
						});
					});

					(
						[
							[
								'draft',
								async function () {
									const { id: userId } = await balena.auth.getUserInfo();
									this.testNonLatestRelease = await balena.pine.post({
										resource: 'release',
										body: {
											belongs_to__application: this.application.id,
											is_created_by__user: userId,
											commit: 'draft-release-commit',
											status: 'success',
											source: 'cloud',
											is_final: false,
											composition: {},
											start_timestamp: Date.now(),
										},
									});
								},
							],
							[
								'invalidated',
								async function () {
									const { id } = await balena.auth.getUserInfo();
									this.testNonLatestRelease = await balena.pine.post({
										resource: 'release',
										body: {
											belongs_to__application: this.application.id,
											is_created_by__user: id,
											commit: 'invalidated-release-commit',
											status: 'success',
											source: 'cloud',
											is_invalidated: true,
											composition: {},
											start_timestamp: Date.now(),
										},
									});
								},
							],
						] as const
					).forEach(([releaseType, prepareFn]) => {
						describe(`given a new ${releaseType} release`, function () {
							before(prepareFn);

							describe('balena.models.application.isTrackingLatestRelease()', function () {
								it(`should not account newer ${releaseType} releases as the default`, async function () {
									expect(
										await balena.models.application.getTargetReleaseHash(
											this.application.id,
										),
									).to.equal('new-release-commit');

									expect(
										await balena.models.application.isTrackingLatestRelease(
											this.application.id,
										),
									).to.be.true;
								});
							});

							describe('balena.models.application.trackLatestRelease()', () => {
								it(`should not use a ${releaseType} releases as the latest`, async function () {
									await balena.models.application.pinToRelease(
										this.application.id,
										'old-release-commit',
									);
									expect(
										await balena.models.application.isTrackingLatestRelease(
											this.application.id,
										),
									).to.be.false;

									await balena.models.application.trackLatestRelease(
										this.application.id,
									);

									expect(
										await balena.models.application.getTargetReleaseHash(
											this.application.id,
										),
									).to.equal('new-release-commit');

									expect(
										await balena.models.application.willTrackNewReleases(
											this.application.id,
										),
									).to.be.true;

									expect(
										await balena.models.application.isTrackingLatestRelease(
											this.application.id,
										),
									).to.be.true;
								});
							});
						});
					});
				});
			});
		});
	});

	describe('given a multicontainer application with a single offline device', function () {
		givenMulticontainerApplicationWithADevice(before);

		const itShouldBeAnApplicationWithDeviceServiceDetails = function (
			application,
			expectCommit = false,
		) {
			// Commit is empty on newly created application, so ignoring it
			const omittedFields = ['owns__device', 'should_be_running__release'];

			expect(_.omit(application, omittedFields)).to.deep.equal(
				_.omit(this.application, omittedFields),
			);

			// Check the app's target release after the release got created
			expect(application.should_be_running__release).to.have.property(
				'__id',
				this.currentRelease.id,
			);

			const deviceExpectation = {
				device_name: this.device.device_name,
				uuid: this.device.uuid,
				is_running__release: {
					__id: this.currentRelease.id,
				},
				current_services: {
					web: [
						{
							id: this.newWebInstall.id,
							service_id: this.webService.id,
							image_id: this.newWebImage.id,
							...(expectCommit && { commit: 'new-release-commit' }),
							status: 'Downloading',
							download_progress: 50,
						},
						{
							id: this.oldWebInstall.id,
							service_id: this.webService.id,
							image_id: this.oldWebImage.id,
							...(expectCommit && { commit: 'old-release-commit' }),
							status: 'Running',
							download_progress: null,
						},
					],
					db: [
						{
							id: this.newDbInstall.id,
							service_id: this.dbService.id,
							image_id: this.newDbImage.id,
							...(expectCommit && { commit: 'new-release-commit' }),
							status: 'Running',
							download_progress: null,
						},
					],
				},
			};

			expect(application.owns__device).to.have.lengthOf(1);
			const [deviceDetails] = application.owns__device;
			expect(deviceDetails).to.deep.match(deviceExpectation);

			// Should include the Device model properties
			expect(deviceDetails.image_install).to.have.lengthOf(3);

			deviceDetails.image_install.forEach((imageInstall) => {
				expect(imageInstall)
					.to.have.property('id')
					.that.is.oneOf([
						this.oldWebInstall.id,
						this.newWebInstall.id,
						this.newDbInstall.id,
					]);
				expect(imageInstall)
					.to.have.property('download_progress')
					.that.is.oneOf([50, null]);
				if (expectCommit) {
					expect(imageInstall)
						.to.have.property('is_provided_by__release')
						.that.has.length(1);
				} else {
					expect(imageInstall).to.not.have.property('is_provided_by__release');
				}
				expect(imageInstall)
					.to.have.property('install_date')
					.that.is.a('string');
				expect(imageInstall).to.have.property('status').that.is.a('string');
				expect(imageInstall).to.not.have.property('service_id');
				expect(imageInstall).to.not.have.property('image_id');
				expect(imageInstall).to.not.have.property('commit');
			});

			// Augmented properties
			// Should filter out deleted image installs
			expect(deviceDetails.current_services.db).to.have.lengthOf(1);
		};

		describe('balena.models.application.getWithDeviceServiceDetails()', function () {
			it("should retrieve the application and it's devices along with service details", function () {
				return balena.models.application
					.getWithDeviceServiceDetails(this.application.id)
					.then((applicationDetails) => {
						itShouldBeAnApplicationWithDeviceServiceDetails.call(
							this,
							applicationDetails,
							true,
						);
					});
			});
		});

		describe('when expanding the release of the image installs', function () {
			const extraServiceDetailOptions = {
				$expand: {
					owns__device: {
						$expand: {
							image_install: {
								$expand: {
									is_provided_by__release: {
										$select: ['id', 'commit'],
									},
								},
							},
						},
					},
				},
			} satisfies BalenaSdk.PineOptions<BalenaSdk.Application>;

			describe('balena.models.application.getWithDeviceServiceDetails()', () => {
				it("should retrieve the application and it's devices along with service details including their commit", function () {
					return balena.models.application
						.getWithDeviceServiceDetails(
							this.application.id,
							extraServiceDetailOptions,
						)
						.then((applicationDetails) => {
							itShouldBeAnApplicationWithDeviceServiceDetails.call(
								this,
								applicationDetails,
								true,
							);
						});
				});
			});
		});
	});

	describe('helpers', () => {
		describe('balena.models.application.getDashboardUrl()', function () {
			it('should return the respective DashboardUrl when an application id is provided', function () {
				const dashboardUrl = sdkOpts.apiUrl!.replace(/api/, 'dashboard');
				return expect(balena.models.application.getDashboardUrl(1)).to.equal(
					`${dashboardUrl}/apps/1`,
				);
			});

			it('should throw when an application id is not a number', () => {
				expect(() =>
					// @ts-expect-error invalid parameter
					balena.models.application.getDashboardUrl('my-app'),
				).to.throw();
			});

			it('should throw when an application id is not provided', () => {
				expect(() =>
					// @ts-expect-error invalid parameter
					balena.models.application.getDashboardUrl(),
				).to.throw();
			});
		});
	});

	describe('given public apps', function () {
		let publicApp: Pick<BalenaSdk.Application, 'id' | 'app_name' | 'slug'>;

		before(async function () {
			const [app] = await balena.models.application.getAll({
				$top: 1,
				$select: ['id', 'app_name', 'slug', 'uuid', 'is_public'],
				$filter: { is_public: true },
			});
			expect(app).to.have.property('is_public', true);
			publicApp = app;
		});

		const $it = function (description, fn) {
			it(description, function () {
				if (!publicApp) {
					this.skip();
					return;
				}
				return fn.call(this);
			});
		};

		describe('when logged in', function () {
			parallel('balena.models.application.get()', function () {
				applicationRetrievalFields.forEach((prop) => {
					$it(
						`should be able to get the public application by ${prop}`,
						async function () {
							const app = await balena.models.application.get(publicApp[prop]);
							expect(app.id).to.equal(publicApp.id);
						},
					);
				});
			});

			parallel(
				'balena.models.application.get() [directly_accessible]',
				function () {
					applicationRetrievalFields.forEach((prop) => {
						$it(
							`should not return the public application by ${prop}`,
							async function () {
								await expectError(async () => {
									await balena.models.application.get(
										publicApp[prop],
										{},
										'directly_accessible',
									);
								}, `Application not found: ${publicApp[prop]}`);
							},
						);
					});
				},
			);

			parallel(
				'balena.models.application.getDirectlyAccessible()',
				function () {
					applicationRetrievalFields.forEach((prop) => {
						$it(
							`should not return the public application by ${prop}`,
							async function () {
								await expectError(async () => {
									await balena.models.application.getDirectlyAccessible(
										publicApp[prop],
									);
								}, `Application not found: ${publicApp[prop]}`);
							},
						);
					});
				},
			);

			describe('balena.models.application.getAppByName()', function () {
				$it(`should be able to get the public application`, async function () {
					const app = await balena.models.application.getAppByName(
						publicApp.app_name,
					);
					expect(app.id).to.equal(publicApp.id);
				});
			});

			describe('balena.models.application.getAppByName() [directly_accessible]', function () {
				$it(`should not return the public application`, async function () {
					await expectError(async () => {
						await balena.models.application.getAppByName(
							publicApp.app_name,
							{},
							'directly_accessible',
						);
					}, `Application not found: ${publicApp.app_name}`);
				});
			});

			describe('balena.models.application.getAll()', function () {
				$it('should be able to get the public application', async function () {
					const apps = await balena.models.application.getAll({
						$filter: { id: publicApp.id },
					});
					expect(apps).to.have.length(1);
					expect(apps[0].id).to.equal(publicApp.id);
				});
			});

			describe('balena.models.application.getAll() [directly_accessible]', function () {
				$it('should be able to get the public application', async function () {
					const apps = await balena.models.application.getAll(
						{ $filter: { id: publicApp.id } },
						'directly_accessible',
					);
					expect(apps).to.have.length(0);
				});
			});

			describe('balena.models.application.getAllDirectlyAccessible()', function () {
				$it(
					'should not be able to get the public application',
					async function () {
						const apps =
							await balena.models.application.getAllDirectlyAccessible({
								$filter: { id: publicApp.id },
							});
						expect(apps).to.have.length(0);
					},
				);
			});
		});

		describe('when not being logged in', function () {
			before(() => balena.auth.logout());

			describe('arbitrary pinejs queries', () => {
				$it(
					'should be able to retrieve the available public apps',
					function () {
						return balena.pine
							.get({
								resource: 'application',
								options: {
									$select: ['id', 'app_name', 'slug', 'uuid', 'is_public'],
								},
							})
							.then(function (apps) {
								expect(apps.length).to.be.gte(1);

								const appIds = apps.map((app) => app.id);
								expect(appIds.includes(publicApp.id)).to.be.true;

								apps.forEach(function (app) {
									expect(app).to.have.property('id').that.is.a('number');
									expect(app).to.have.property('app_name').that.is.a('string');
									expect(app).to.have.property('slug').that.is.a('string');
									expect(app).to.have.property('uuid').that.is.a('string');
									expect(app).to.have.property('is_public', true);
								});
							});
					},
				);
			});

			parallel('balena.models.application.get()', function () {
				applicationRetrievalFields.forEach((prop) => {
					$it(
						`should be able to get a public application by ${prop}`,
						function () {
							return balena.models.application
								.get(publicApp[prop])
								.then(function (app) {
									expect(app).to.have.property('id').that.is.a('number');
									expect(app).to.have.property('app_name').that.is.a('string');
									expect(app).to.have.property('slug').that.is.a('string');
									expect(app).to.have.property('uuid').that.is.a('string');
									expect(app).to.have.property('is_public', true);
								});
						},
					);
				});
			});
		});
	});
});
