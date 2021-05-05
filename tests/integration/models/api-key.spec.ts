// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena, givenLoggedInUser } from '../setup';
import { timeSuite } from '../../util';
const { expect } = m.chai;

describe('API Key model', function () {
	timeSuite(before);

	describe('balena.models.apiKey.create()', function () {
		givenLoggedInUser(before);

		parallel('', function () {
			it('should be able to create a new api key', function () {
				balena.models.apiKey
					.create('apiKey')
					.then((key) => expect(key).to.be.a('string'));
			});

			it('should be able to create a new api key with description', function () {
				balena.models.apiKey
					.create('apiKey2', 'apiKeyDescription')
					.then(function (key) {
						expect(key).to.be.a('string');
						return balena.models.apiKey.getAll();
					})
					.then(function (apiKeys) {
						expect(apiKeys).to.be.an('array');
						expect(apiKeys).to.have.lengthOf(1);
						expect(apiKeys).to.deep.match([
							{
								name: 'apiKey2',
								description: 'apiKeyDescription',
							},
						]);
					});
			});
		});
	});

	describe('balena.models.apiKey.getAll()', function () {
		givenLoggedInUser(before);

		describe('given no named api keys', () => {
			it('should retrieve an empty array', () => {
				return balena.models.apiKey.getAll().then(function (apiKeys) {
					expect(apiKeys).to.be.an('array');
					expect(apiKeys).to.have.lengthOf(0);
				});
			});
		});

		describe('given two named api keys', function () {
			before(() =>
				Promise.all([
					balena.models.apiKey.create('apiKey1'),
					balena.models.apiKey.create('apiKey2', 'apiKey2Description'),
				]),
			);

			it('should be able to retrieve all api keys created', () => {
				return balena.models.apiKey.getAll().then(function (apiKeys) {
					expect(apiKeys).to.be.an('array');
					expect(apiKeys).to.have.lengthOf(2);
					expect(apiKeys).to.deep.match([
						{
							name: 'apiKey1',
							description: null,
						},
						{
							name: 'apiKey2',
							description: 'apiKey2Description',
						},
					]);
					_.forEach(apiKeys, function (apiKey) {
						expect(apiKey).to.have.property('id').that.is.a('number');
						expect(apiKey).to.have.property('created_at').that.is.a('string');
					});
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
					balena.models.apiKey.create('apiKey1'),
					balena.models.apiKey.create('apiKey2', 'apiKey2Description'),
				]),
			);

			it('should be able to retrieve all api keys created', async function () {
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(2);
				expect(apiKeys).to.deep.match([
					{
						name: 'apiKey1',
						description: null,
					},
					{
						name: 'apiKey2',
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

	describe('given a named user api key [contained scenario]', function () {
		givenLoggedInUser(before);

		before(function () {
			return balena.models.apiKey
				.create('apiKeyToBeUpdated', 'apiKeyDescriptionToBeUpdated')
				.then(() =>
					balena.models.apiKey.getAll({
						$filter: { name: 'apiKeyToBeUpdated' },
					}),
				)
				.then(([apiKey]) => {
					this.apiKey = apiKey;
				});
		});

		describe('balena.models.apiKey.update()', () => {
			it('should not be able to update the name of an api key to null', function () {
				return expect(
					balena.models.apiKey.update(this.apiKey.id, { name: null as any }),
				).to.be.rejected;
			});

			it('should not be able to update the name of an api key to an empty string', function () {
				return expect(balena.models.apiKey.update(this.apiKey.id, { name: '' }))
					.to.be.rejected;
			});

			it('should be able to update the name of an api key', function () {
				return balena.models.apiKey
					.update(this.apiKey.id, { name: 'updatedApiKeyName' })
					.then(() => {
						return balena.models.apiKey.getAll({
							$filter: { id: this.apiKey.id },
						});
					})
					.then(function ([apiKey]) {
						expect(apiKey).to.deep.match({
							name: 'updatedApiKeyName',
							description: 'apiKeyDescriptionToBeUpdated',
						});
					});
			});

			it('should be able to update the description of an api key to a non empty string', function () {
				return balena.models.apiKey
					.update(this.apiKey.id, { description: 'updatedApiKeyDescription' })
					.then(() => {
						return balena.models.apiKey.getAll({
							$filter: { id: this.apiKey.id },
						});
					})
					.then(function ([apiKey]) {
						expect(apiKey).to.deep.match({
							name: 'updatedApiKeyName',
							description: 'updatedApiKeyDescription',
						});
					});
			});

			it('should be able to update the description of an api key to an empty string', function () {
				return balena.models.apiKey
					.update(this.apiKey.id, { description: '' })
					.then(() => {
						return balena.models.apiKey.getAll({
							$filter: { id: this.apiKey.id },
						});
					})
					.then(function ([apiKey]) {
						expect(apiKey).to.deep.match({
							name: 'updatedApiKeyName',
							description: '',
						});
					});
			});

			it('should be able to update the description of an api key to null', function () {
				return balena.models.apiKey
					.update(this.apiKey.id, { description: null })
					.then(() => {
						return balena.models.apiKey.getAll({
							$filter: { id: this.apiKey.id },
						});
					})
					.then(function ([apiKey]) {
						expect(apiKey).to.deep.match({
							name: 'updatedApiKeyName',
							description: null,
						});
					});
			});

			it('should be able to update the name & description of an api key', function () {
				return balena.models.apiKey
					.update(this.apiKey.id, {
						name: 'newllyUpdatedApiKeyName',
						description: 'newllyUpdatedApiKeyDescription',
					})
					.then(() => {
						return balena.models.apiKey.getAll({
							$filter: { id: this.apiKey.id },
						});
					})
					.then(function ([apiKey]) {
						expect(apiKey).to.deep.match({
							name: 'newllyUpdatedApiKeyName',
							description: 'newllyUpdatedApiKeyDescription',
						});
					});
			});
		});

		describe('balena.models.apiKey.revoke()', () => {
			it('should be able to revoke an exising api key', async function () {
				await expect(balena.models.apiKey.revoke(this.apiKey.id)).to.not.be
					.rejected;
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(0);
			});
		});
	});
});
