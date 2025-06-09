import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	givenAnApplication,
	givenADevice,
	givenLoggedInUser,
	TEST_KEY_NAME_PREFIX,
} from '../setup';
import { assertDeepMatchAndLength, expectError, timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';

describe('API Key model', function () {
	timeSuite(before);

	describe('balena.models.apiKey.create()', function () {
		givenLoggedInUser(before);

		parallel('', function () {
			it('should be able to create a new api key', async function () {
				const tomorrowDate = new Date(
					Date.now() + 1000 * 60 * 60 * 24,
				).toISOString();
				const key = await balena.models.apiKey.create({
					name: `${TEST_KEY_NAME_PREFIX}_apiKey`,
					expiryDate: tomorrowDate,
				});
				expect(key).to.be.a('string');
				const userKeys = await balena.models.apiKey.getAllNamedUserApiKeys();

				expect(userKeys).to.be.an('array');
				const userKeyWithExpiry = userKeys.filter(
					(elem) => elem.name === `${TEST_KEY_NAME_PREFIX}_apiKey`,
				);
				expect(userKeyWithExpiry).to.not.be.empty;
				expect(userKeyWithExpiry[0])
					.to.have.property('expiry_date')
					.to.be.equal(tomorrowDate);
			});

			it('should be able to create a new api key with description', async function () {
				const key = await balena.models.apiKey.create({
					name: `${TEST_KEY_NAME_PREFIX}_apiKey2`,
					expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
					description: 'apiKeyDescription',
				});
				expect(key).to.be.a('string');
			});
		});
	});

	describe('balena.models.apiKey.getAll()', function () {
		givenLoggedInUser(before);

		describe('given no named api keys', () => {
			it('should retrieve an empty array', async function () {
				const apiKeys = await balena.models.apiKey.getAll({
					$filter: {
						is_of__actor: await balena.auth.getActorId(),
						name: { $ne: null },
					},
				});
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(0);
			});
		});

		describe('given two named api keys', function () {
			before(() =>
				Promise.all([
					balena.models.apiKey.create({
						name: `${TEST_KEY_NAME_PREFIX}_apiKey1`,
						expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
					}),
					balena.models.apiKey.create({
						name: `${TEST_KEY_NAME_PREFIX}_apiKey2`,
						expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
						description: 'apiKey2Description',
					}),
				]),
			);

			it('should be able to retrieve all api keys created', async function () {
				const apiKeys = await balena.models.apiKey.getAll({
					$filter: {
						is_of__actor: await balena.auth.getActorId(),
						name: { $ne: null },
					},
				});
				expect(apiKeys).to.be.an('array');
				assertDeepMatchAndLength(apiKeys, [
					{
						name: `${TEST_KEY_NAME_PREFIX}_apiKey1`,
						description: null,
					},
					{
						name: `${TEST_KEY_NAME_PREFIX}_apiKey2`,
						description: 'apiKey2Description',
					},
				]);
				apiKeys.forEach(function (apiKey) {
					expect(apiKey).to.have.property('id').that.is.a('number');
					expect(apiKey).to.have.property('created_at').that.is.a('string');
				});
			});
		});
	});

	describe('balena.models.apiKey.getAllNamedUserApiKeys()', function () {
		givenLoggedInUser(before);

		describe('given no named api keys', () => {
			it('should retrieve an empty array', async function () {
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(0);
			});
		});

		describe('given two named api keys', function () {
			before(() =>
				Promise.all([
					balena.models.apiKey.create({
						name: `${TEST_KEY_NAME_PREFIX}_apiKey1`,
						expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
					}),
					balena.models.apiKey.create({
						name: `${TEST_KEY_NAME_PREFIX}_apiKey2`,
						expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
						description: 'apiKey2Description',
					}),
				]),
			);

			it('should be able to retrieve all api keys created', async function () {
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				assertDeepMatchAndLength(apiKeys, [
					{
						name: `${TEST_KEY_NAME_PREFIX}_apiKey1`,
						description: null,
					},
					{
						name: `${TEST_KEY_NAME_PREFIX}_apiKey2`,
						description: 'apiKey2Description',
					},
				]);
				apiKeys.forEach(function (apiKey) {
					expect(apiKey).to.have.property('id').that.is.a('number');
					expect(apiKey).to.have.property('created_at').that.is.a('string');
				});
			});
		});
	});

	describe('given a named user api key, a provisioning api key and a device api key [contained scenario]', function () {
		givenLoggedInUser(before);
		givenAnApplication(before);
		givenADevice(before);

		const testSet = [
			['named user', 'namedUserApiKey'],
			['provisioning', 'provisioningApiKey'],
			['device', 'deviceApiKey'],
		] as const;

		const ctx: Partial<Record<(typeof testSet)[number][1], BalenaSdk.ApiKey['Read']>> =
			{};

		before(async function () {
			await balena.models.apiKey.create({
				name: `${TEST_KEY_NAME_PREFIX}_toUpdate`,
				expiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
				description: 'apiKeyDescriptionToBeUpdated',
			});
			const [apiKey] = await balena.models.apiKey.getAll({
				$filter: { name: `${TEST_KEY_NAME_PREFIX}_toUpdate` },
			});
			ctx.namedUserApiKey = apiKey;

			await balena.models.application.generateProvisioningKey({
				slugOrUuidOrId: this.application.id,
				keyExpiryDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
			});

			await balena.models.device.generateDeviceKey(this.device.id);
		});

		describe('balena.models.apiKey.getProvisioningApiKeysByApplication', function () {
			it('should fail when the application does not exist', async function () {
				await expectError(
					async () => {
						await balena.models.apiKey.getProvisioningApiKeysByApplication(
							'nonExistentOrganization/nonExistentApp',
						);
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaApplicationNotFound');
					},
				);
			});

			it('should be able to retrieve the provisioning api keys of an application', async function () {
				const apiKeys =
					await balena.models.apiKey.getProvisioningApiKeysByApplication(
						this.application.id,
						{ $orderby: { created_at: 'desc' } },
					);
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(2);
				expect(apiKeys[0].name).to.equal(null);
				ctx.provisioningApiKey = apiKeys[0];
			});
		});

		describe('balena.models.apiKey.getDeviceApiKeysByDevice', function () {
			it('should fail when the device does not exist', async function () {
				await expectError(
					async () => {
						await balena.models.apiKey.getDeviceApiKeysByDevice(
							'nonexistentuuid',
						);
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaDeviceNotFound');
					},
				);
			});

			it('should be able to retrieve the api keys of a device', async function () {
				const apiKeys = await balena.models.apiKey.getDeviceApiKeysByDevice(
					this.device.id,
				);
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(2);
				expect(apiKeys[0].name).to.equal(null);
				ctx.deviceApiKey = apiKeys[0];
			});
		});

		describe('balena.models.apiKey.update()', () => {
			it('should not be able to update the name of an api key to null', async function () {
				await expectError(async () => {
					await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
						name: null as any,
					});
				});
			});

			it('should not be able to update the name of an api key to an empty string', async function () {
				await expectError(async () => {
					await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
						name: '',
					});
				});
			});

			const updatedApiKeyName = `${TEST_KEY_NAME_PREFIX}_updatedName`;

			it('should be able to update the name of an api key', async function () {
				await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
					name: updatedApiKeyName,
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: ctx.namedUserApiKey!.id },
				});
				expect(apiKey).to.deep.match({
					name: updatedApiKeyName,
					description: 'apiKeyDescriptionToBeUpdated',
				});
			});

			it('should be able to update the description of an api key to a non empty string', async function () {
				await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
					description: 'updatedApiKeyDescription',
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: ctx.namedUserApiKey!.id },
				});
				expect(apiKey).to.deep.match({
					name: updatedApiKeyName,
					description: 'updatedApiKeyDescription',
				});
			});

			it('should be able to update the description of an api key to an empty string', async function () {
				await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
					description: '',
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: ctx.namedUserApiKey!.id },
				});
				expect(apiKey).to.deep.match({
					name: updatedApiKeyName,
					description: '',
				});
			});

			it('should be able to update the description of an api key to null', async function () {
				await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
					description: null,
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: ctx.namedUserApiKey!.id },
				});
				expect(apiKey).to.deep.match({
					name: updatedApiKeyName,
					description: null,
				});
			});

			it('should not be able to update the expiryDate of an api key to a in-valid date string', async function () {
				await expectError(async () => {
					await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
						expiryDate: 'in-valid date',
					});
				});
			});

			it('should be able to update the expiryDate of an api key to a valid date string', async function () {
				const validDate = new Date().toISOString();
				await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
					expiryDate: validDate,
				});

				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: ctx.namedUserApiKey!.id },
				});
				expect(apiKey).to.deep.match({
					name: updatedApiKeyName,
					expiry_date: validDate,
				});
			});

			it('should be able to update the expiryDate of an api key to null', async function () {
				await balena.models.apiKey.update(ctx.namedUserApiKey!.id, {
					expiryDate: null,
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: ctx.namedUserApiKey!.id },
				});
				expect(apiKey).to.deep.match({
					name: updatedApiKeyName,
					expiry_date: null,
				});
			});

			testSet.forEach(([title, ctxPropName], i) => {
				const newllyUpdatedApiKeyName = `${TEST_KEY_NAME_PREFIX}_updated_${i}`;
				it(`should be able to update the name & description of a(n) ${title} api key`, async function () {
					await balena.models.apiKey.update(ctx[ctxPropName]!.id, {
						name: newllyUpdatedApiKeyName,
						description: 'newllyUpdatedApiKeyDescription' + title,
					});
					const apiKey = await balena.pine.get({
						resource: 'api_key',
						id: ctx[ctxPropName]!.id,
					});
					expect(apiKey).to.be.an('object');
					expect(apiKey).to.deep.match({
						name: newllyUpdatedApiKeyName,
						description: 'newllyUpdatedApiKeyDescription' + title,
					});
				});
			});
		});

		describe('balena.models.apiKey.revoke()', () => {
			testSet.forEach(([title, ctxPropName]) => {
				it(`should be able to revoke an exising ${title} api key`, async function () {
					await balena.models.apiKey.revoke(ctx[ctxPropName]!.id);
					const apiKey = await balena.pine.get({
						resource: 'api_key',
						id: ctx[ctxPropName]!.id,
					});
					expect(apiKey).to.be.undefined;
				});
			});
		});
	});
});
