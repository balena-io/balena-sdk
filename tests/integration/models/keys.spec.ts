import { expect } from 'chai';
import parallel from 'mocha.parallel';
import PUBLIC_KEY from '../../data/public-key';
import { TEST_KEY_NAME_PREFIX, balena, givenLoggedInUser } from '../setup';
import { expectError, timeSuite } from '../../util';

describe('Key Model', function () {
	timeSuite(before);
	describe('given no keys', function () {
		describe('balena.models.key.getAll()', function () {
			givenLoggedInUser(before);

			it('should become an empty array', async function () {
				const result = await balena.models.key.getAll();
				expect(result).to.deep.equal([]);
			});
		});

		describe('balena.models.key.create()', function () {
			givenLoggedInUser(beforeEach);

			it('should be able to create a key', function () {
				const key = PUBLIC_KEY;
				return balena.models.key
					.create(`${TEST_KEY_NAME_PREFIX} MyKey`, key)
					.then(() => balena.models.key.getAll())
					.then(function (keys) {
						expect(keys).to.have.length(1);
						expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''));
						expect(keys[0].title).to.equal(`${TEST_KEY_NAME_PREFIX} MyKey`);
					});
			});

			it('should be able to create a key from a non trimmed string', async function () {
				const key = PUBLIC_KEY;
				await balena.models.key.create(
					`${TEST_KEY_NAME_PREFIX} MyOtherKey`,
					`    ${key}    `,
				);
				const keys = await balena.models.key.getAll();
				expect(keys).to.have.length(1);
				expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''));
				expect(keys[0].title).to.equal(`${TEST_KEY_NAME_PREFIX} MyOtherKey`);
			});
		});
	});

	describe('given a single key', function () {
		givenLoggedInUser(before);

		let ctx: Mocha.Context;
		before(async function () {
			ctx = this;
			this.key = await balena.models.key.create(
				`${TEST_KEY_NAME_PREFIX} MyKey`,
				PUBLIC_KEY,
			);
		});

		parallel('balena.models.key.getAll()', () => {
			it('should become the list of keys', function () {
				return balena.models.key.getAll().then((keys) => {
					expect(keys).to.have.length(1);
					expect(keys[0].public_key).to.equal(
						ctx.key.public_key.replace(/\n/g, ''),
					);
					expect(keys[0].title).to.equal(`${TEST_KEY_NAME_PREFIX} MyKey`);
				});
			});

			it('should support arbitrary pinejs options', async function () {
				const [key] = await balena.models.key.getAll({
					$select: ['public_key'],
				});
				expect(key.public_key).to.equal(PUBLIC_KEY);
				// @ts-expect-error - test case
				expect(key.title).to.be.undefined;
			});
		});

		parallel('balena.models.key.get()', function () {
			it('should be able to get a key', function () {
				return balena.models.key.get(ctx.key.id).then((key) => {
					expect(key.public_key).to.equal(
						ctx.key.public_key.replace(/\n/g, ''),
					);
					expect(key.title).to.equal(`${TEST_KEY_NAME_PREFIX} MyKey`);
				});
			});

			it('should be rejected if the key id is invalid', async function () {
				await expectError(async () => {
					await balena.models.key.get(99999999999);
				}, 'Request error');
			});
		});

		describe('balena.models.key.remove()', () => {
			it('should be able to remove the key', async function () {
				await balena.models.key.remove(this.key.id);
				expect(await balena.models.key.getAll()).to.deep.equal([]);
			});
		});
	});
});
