import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	TEST_ORGANIZATION_NAME,
	balena,
	credentials,
	givenLoggedInUser,
	organizationRetrievalFields,
} from '../setup';
import { expectError, timeSuite } from '../../util';

describe('Organization model', function () {
	timeSuite(before);
	givenLoggedInUser(before);

	const ctx: Partial<{
		newOrg1: any;
		newOrg2: any;
		testOrg1Name: any;
		testOrgName: any;
		userInitialOrg: any;
	}> & { allOrgs: Array<{ handle: string }> } = {
		allOrgs: [],
	};

	describe('given no non-user organizations', function () {
		describe('balena.models.organization.getAll()', function () {
			it('should retrieve only the default org of the user', async function () {
				const orgs = await balena.models.organization.getAll();
				expect(orgs).to.be.an('array');
				expect(orgs).to.have.lengthOf(1);
				expect(orgs[0]).to.have.property('handle', credentials.username);
				ctx.userInitialOrg = orgs[0];
				ctx.allOrgs.push(ctx.userInitialOrg);
			});
		});

		parallel('balena.models.organization.get()', function () {
			it('should be rejected if the organization handle does not exist', async function () {
				const randomTestOrgHandle = `testOrgRandom_${Date.now()}`;
				await expectError(async () => {
					await balena.models.organization.get(randomTestOrgHandle);
				}, `Organization not found: ${randomTestOrgHandle}`);
			});

			it('should be rejected if the organization id does not exist', async function () {
				await expectError(async () => {
					await balena.models.organization.get(999999);
				}, `Organization not found: 999999`);
			});

			it(`should retrieve the initial organization of the user's username`, async function () {
				const orgs = await balena.models.organization.get(credentials.username);
				expect(orgs).to.deep.match(ctx.userInitialOrg);
			});

			it(`should retrieve the initial organization of the user by organization id`, async function () {
				const orgs = await balena.models.organization.get(
					ctx.userInitialOrg.id,
				);
				expect(orgs).to.deep.match(ctx.userInitialOrg);
			});
		});

		describe('balena.models.organization.remove()', function () {
			it('should be rejected if the organization handle does not exist', async function () {
				const randomTestOrgHandle = `testOrgRandom_${Date.now()}`;
				await expectError(async () => {
					await balena.models.organization.get(randomTestOrgHandle);
				}, `Organization not found: ${randomTestOrgHandle}`);
			});

			it('should be rejected if the organization id does not exist', async function () {
				await expectError(async () => {
					await balena.models.organization.get(999999);
				}, `Organization not found: 999999`);
			});
		});

		describe('balena.models.organization.create()', function () {
			it('should be able to create a new organization', async function () {
				ctx.testOrg1Name = `${TEST_ORGANIZATION_NAME}_${Date.now()}`;
				const org = await balena.models.organization.create({
					name: ctx.testOrg1Name,
				});
				expect(org).to.have.property('name', ctx.testOrg1Name);
				expect(org).to.have.property('handle').that.is.a('string');
				ctx.newOrg1 = org;
				ctx.allOrgs.push(ctx.newOrg1);
			});

			it('should be able to create a new organization with the same name', async function () {
				const org = await balena.models.organization.create({
					name: ctx.testOrg1Name,
				});
				expect(org).to.have.property('name', ctx.testOrg1Name);
				expect(org)
					.to.have.property('handle')
					.that.is.not.equal(ctx.newOrg1.handle);
				ctx.newOrg2 = org;
				ctx.allOrgs.push(ctx.newOrg2);
			});

			it.skip('should be able to create an organization with a logo', async function () {
				const org = await balena.models.organization.create({
					name: `${TEST_ORGANIZATION_NAME} with logo`,
					logo_image: new balena.utils.BalenaWebResourceFile(
						[Buffer.from('this is a test\n')],
						'orglogo.png',
					),
				});
				ctx.allOrgs.push(org);

				const fetchedOrg = await balena.models.organization.get(org.id, {
					$select: ['id', 'logo_image'],
				});
				expect(fetchedOrg)
					.to.have.nested.property('logo_image.href')
					.that.is.a('string');

				const res = await balena.request.send({
					url: fetchedOrg.logo_image.href,
					sendToken: false,
					refreshToken: false,
				});
				expect(res.status).to.equal(200);
				expect(res.headers.get('content-length')).to.equal('15');
			});
		});
	});

	describe('given two extra non-user organization', function () {
		describe('balena.models.organization.getAll()', function () {
			it('should retrieve all organizations', async function () {
				const orgs = await balena.models.organization.getAll({
					$orderby: 'id asc',
				});
				expect(orgs).to.be.an('array');
				expect(orgs.map((o) => o.handle)).to.deep.equal(
					ctx.allOrgs.map((o) => o.handle),
				);
				expect(ctx.allOrgs).to.have.length.greaterThan(0);
			});
		});

		parallel('balena.models.organization.get()', function () {
			organizationRetrievalFields.forEach((prop) => {
				it(`should retrieve an organization by ${prop}`, async function () {
					const org = await balena.models.organization.get(ctx.newOrg1[prop]);
					expect(org).to.deep.match(ctx.newOrg1);
				});
			});
		});

		describe('balena.models.organization.remove()', function () {
			[
				{ prop: 'id', getOrg: () => ctx.newOrg1 },
				{ prop: 'handle', getOrg: () => ctx.newOrg2 },
			].forEach(({ prop, getOrg }) => {
				it(`should remove an organization by ${prop}`, async function () {
					const org = getOrg();
					await balena.models.organization.remove(org[prop]);
					await expectError(async () => {
						await balena.models.organization.remove(org[prop]);
					}, `Organization not found: ${org[prop]}`);
				});
			});
		});
	});
});
