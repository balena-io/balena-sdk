import * as Bluebird from 'bluebird';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import { AnyObject } from '../../../typings/utils';
import { balena, credentials, givenLoggedInUser } from '../setup';
const { expect } = m.chai;

describe('Organization model', function() {
	givenLoggedInUser(before);

	const ctx: Partial<{
		newOrg1: any;
		newOrg2: any;
		testOrg1Name: any;
		testOrgName: any;
		userInitialOrg: any;
	}> = {};

	describe('given no non-user organizations', function() {
		describe('balena.models.organization.getAll()', function() {
			it('should retrieve only the default org of the user', async function() {
				const orgs = await balena.models.organization.getAll();
				expect(orgs).to.be.an('array');
				expect(orgs).to.have.lengthOf(1);
				expect(orgs[0]).to.have.property('handle', credentials.username);
				ctx.userInitialOrg = orgs[0];
			});
		});

		describe('balena.models.organization.get()', function() {
			it('should be rejected if the organization handle does not exist', function() {
				const randomTestOrgHandle = `testOrgRandom_${Date.now()}`;
				const promise = balena.models.organization.get(randomTestOrgHandle);
				return expect(promise).to.be.rejectedWith(
					`Organization not found: ${randomTestOrgHandle}`,
				);
			});

			it('should be rejected if the organization id does not exist', function() {
				const promise = balena.models.organization.get(999999);
				return expect(promise).to.be.rejectedWith(
					`Organization not found: 999999`,
				);
			});

			it(`should retrieve the initial organization of the user's username`, async function() {
				const orgs = await balena.models.organization.get(credentials.username);
				expect(orgs).to.deep.match(ctx.userInitialOrg);
			});

			it(`should retrieve the initial organization of the user by organization id`, async function() {
				const orgs = await balena.models.organization.get(
					ctx.userInitialOrg.id,
				);
				expect(orgs).to.deep.match(ctx.userInitialOrg);
			});
		});

		describe('balena.models.organization.remove()', function() {
			it('should be rejected if the organization handle does not exist', function() {
				const randomTestOrgHandle = `testOrgRandom_${Date.now()}`;
				const promise = balena.models.organization.get(randomTestOrgHandle);
				return expect(promise).to.be.rejectedWith(
					`Organization not found: ${randomTestOrgHandle}`,
				);
			});

			it('should be rejected if the organization id does not exist', function() {
				const promise = balena.models.organization.get(999999);
				return expect(promise).to.be.rejectedWith(
					`Organization not found: 999999`,
				);
			});
		});

		describe('balena.models.organization.create()', function() {
			it('should be able to create a new organization', async function() {
				ctx.testOrg1Name = `testOrg1_${Date.now()}`;
				const org = await balena.models.organization.create({
					name: ctx.testOrg1Name,
				});
				expect(org).to.have.property('name', ctx.testOrg1Name);
				expect(org)
					.to.have.property('handle')
					.that.is.a('string');
				ctx.newOrg1 = org;
			});

			it('should be able to create a new organization with the same name', async function() {
				const org = await balena.models.organization.create({
					name: ctx.testOrg1Name,
				});
				expect(org).to.have.property('name', ctx.testOrg1Name);
				expect(org)
					.to.have.property('handle')
					.that.is.not.equal(ctx.newOrg1.handle);
				ctx.newOrg2 = org;
			});
		});
	});

	describe('given two extra non-user organization', function() {
		describe('balena.models.organization.getAll()', function() {
			it('should retrieve all organizations', async function() {
				const orgs = await balena.models.organization.getAll({
					$orderby: 'id asc',
				});
				expect(orgs).to.be.an('array');
				expect(orgs).to.have.lengthOf(3);
				const [org1, org2, org3] = orgs;
				expect(org1).to.deep.match(ctx.userInitialOrg);
				expect(org2).to.deep.match(ctx.newOrg1);
				expect(org3).to.deep.match(ctx.newOrg2);
			});
		});

		describe('balena.models.organization.get()', function() {
			['id', 'handle'].forEach(prop => {
				it(`should retrieve an organization by ${prop}`, async function() {
					const orgs = await balena.models.organization.get(ctx.newOrg1[prop]);
					expect(orgs).to.deep.match(ctx.newOrg1);
				});
			});
		});

		describe('balena.models.organization.remove()', function() {
			[
				{ prop: 'id', getOrg: () => ctx.newOrg1 },
				{ prop: 'handle', getOrg: () => ctx.newOrg2 },
			].forEach(({ prop, getOrg }) => {
				it(`should remove an organization by ${prop}`, async function() {
					const org = getOrg();
					await balena.models.organization.remove(org[prop]);
					const promise = balena.models.organization.remove(org[prop]);
					return expect(promise).to.be.rejectedWith(
						`Organization not found: ${org[prop]}`,
					);
				});
			});
		});
	});
});
