// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import PUBLIC_KEY from '../../data/public-key';
import { balena, givenLoggedInUser } from '../setup';
import { timeSuite } from '../../util';

describe('Key Model', function () {
	timeSuite(before);
	describe('given no keys', function () {
		describe('balena.models.key.getAll()', function () {
			givenLoggedInUser(before);

			it('should become an empty array', function () {
				const promise = balena.models.key.getAll();
				return expect(promise).to.become([]);
			});
		});

		describe('balena.models.key.create()', function () {
			givenLoggedInUser(beforeEach);

			it('should be able to create a key', function () {
				const key = PUBLIC_KEY;
				return balena.models.key
					.create('MyKey', key)
					.then(() => balena.models.key.getAll())
					.then(function (keys) {
						expect(keys).to.have.length(1);
						expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''));
						expect(keys[0].title).to.equal('MyKey');
					});
			});

			it('should be able to create a key from a non trimmed string', function () {
				const key = PUBLIC_KEY;
				return balena.models.key
					.create('MyOtherKey', `    ${key}    `)
					.then(() => balena.models.key.getAll())
					.then(function (keys) {
						expect(keys).to.have.length(1);
						expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''));
						expect(keys[0].title).to.equal('MyOtherKey');
					});
			});
		});
	});

	describe('given a single key', function () {
		givenLoggedInUser(before);

		let ctx: Mocha.Context;
		before(async function () {
			ctx = this;
			this.key = await balena.models.key.create('MyKey', PUBLIC_KEY);
		});

		parallel('balena.models.key.getAll()', () => {
			it('should become the list of keys', function () {
				return balena.models.key.getAll().then((keys) => {
					expect(keys).to.have.length(1);
					expect(keys[0].public_key).to.equal(
						ctx.key.public_key.replace(/\n/g, ''),
					);
					expect(keys[0].title).to.equal('MyKey');
				});
			});

			it('should support arbitrary pinejs options', async function () {
				const [key] = await balena.models.key.getAll({
					$select: ['public_key'],
				});
				expect(key.public_key).to.equal(PUBLIC_KEY);
				expect(key.title).to.be.undefined;
			});
		});

		parallel('balena.models.key.get()', function () {
			it('should be able to get a key', function () {
				return balena.models.key.get(ctx.key.id).then((key) => {
					expect(key.public_key).to.equal(
						ctx.key.public_key.replace(/\n/g, ''),
					);
					expect(key.title).to.equal('MyKey');
				});
			});

			it('should be rejected if the key id is invalid', function () {
				const promise = balena.models.key.get(99999999999);
				return expect(promise).to.be.rejectedWith('Request error');
			});
		});

		describe('balena.models.key.remove()', () => {
			it('should be able to remove the key', function () {
				return balena.models.key.remove(this.key.id).then(function () {
					const promise = balena.models.key.getAll();
					return expect(promise).to.eventually.have.length(0);
				});
			});
		});
	});
});
