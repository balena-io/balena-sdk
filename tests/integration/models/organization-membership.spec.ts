// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	credentials,
	givenInitialOrganization,
	givenLoggedInUser,
	organizationRetrievalFields,
	TEST_ORGANIZATION_NAME,
} from '../setup';
import type * as BalenaSdk from '../../..';
import { assertDeepMatchAndLength, timeSuite } from '../../util';
import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';
import type * as tagsHelper from './tags';

const keyAlternatives = [
	['id', (member: Pick<BalenaSdk.OrganizationMembership, 'id'>) => member.id],
	[
		'alternate key',
		(
			member: Pick<
				BalenaSdk.OrganizationMembership,
				'user' | 'is_member_of__organization'
			>,
		) =>
			_.mapValues(
				_.pick(member, ['user', 'is_member_of__organization']),
				(obj: BalenaSdk.PineDeferred | [{ id: number }]): number =>
					'__id' in obj ? obj.__id : obj[0].id,
			),
	],
] as const;

describe('Organization Membership Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	let ctx: Mocha.Context;
	before(async function () {
		ctx = this;
		const userInfoResult = await balena.auth.getUserInfo();
		this.username = userInfoResult.username;
		this.userId = userInfoResult.id;

		const roles = await balena.pine.get({
			resource: 'organization_membership_role',
			options: { $select: ['id', 'name'] },
		});
		this.orgRoleMap = _.keyBy(roles, 'name');
		roles.forEach((role) => {
			expect(role).to.be.an('object');
			expect(role).to.have.property('id').that.is.a('number');
		});
		this.orgAdminRole = this.orgRoleMap['administrator'];
		this.orgMemberRole = this.orgRoleMap['member'];
		[this.orgAdminRole, this.orgMemberRole].forEach((role) => {
			expect(role).to.be.an('object');
		});
	});

	describe('balena.models.organization.membership.getAllByOrganization()', function () {
		it(`should return only the user's own membership`, async function () {
			const memberships =
				await balena.models.organization.membership.getAllByOrganization(
					this.initialOrg.id,
				);
			assertDeepMatchAndLength(memberships, [
				{
					user: { __id: this.userId },
					is_member_of__organization: { __id: this.initialOrg.id },
					organization_membership_role: { __id: this.orgAdminRole.id },
				},
			]);
		});
	});

	describe('given a membership [read operations]', function () {
		let membership: BalenaSdk.OrganizationMembership | undefined;
		before(async function () {
			membership = (
				await balena.models.organization.membership.getAllByOrganization(
					this.initialOrg.id,
				)
			)[0];
		});

		parallel('balena.models.organization.membership.get()', function () {
			it(`should reject when the organization membership is not found`, async function () {
				const promise = balena.models.organization.membership.get(
					Math.floor(Date.now() / 1000),
				);

				await expect(promise).to.be.rejectedWith(
					'Organization Membership not found',
				);
			});

			keyAlternatives.forEach(([title, keyGetter]) => {
				it(`should be able to retrieve a membership by ${title}`, async function () {
					const key = keyGetter(membership!);
					const result = await balena.models.organization.membership.get(key, {
						$select: 'id',
						$expand: {
							user: {
								$select: 'username',
							},
							organization_membership_role: {
								$select: 'name',
							},
						},
					});
					expect(result).to.have.nested.property(
						'user[0].username',
						credentials.username,
					);
					expect(result).to.have.nested.property(
						'organization_membership_role[0].name',
						'administrator',
					);
				});
			});
		});

		describe('balena.models.organization.membership.getAllByOrganization()', function () {
			it(`should return only the user's own membership`, async function () {
				const memberships =
					await balena.models.organization.membership.getAllByOrganization(
						this.initialOrg.id,
					);
				assertDeepMatchAndLength(memberships, [
					{
						user: { __id: this.userId },
						is_member_of__organization: { __id: this.initialOrg.id },
						organization_membership_role: { __id: this.orgAdminRole.id },
					},
				]);
			});
		});

		parallel(
			'balena.models.organization.membership.getAllByUser()',
			function () {
				(['userId', 'username'] as const).forEach((prop) => {
					it(`shoud return only the user's own membership by ${prop}`, async function () {
						const memberships =
							await balena.models.organization.membership.getAllByUser(
								ctx[prop],
							);
						assertDeepMatchAndLength(memberships, [
							{
								user: { __id: ctx.userId },
								is_member_of__organization: { __id: ctx.initialOrg.id },
								organization_membership_role: { __id: ctx.orgAdminRole.id },
							},
						]);
					});
				});
			},
		);
	});

	describe('given a new organization', function () {
		givenInitialOrganization(before);
		before(async function () {
			this.organization = this.initialOrg;
			await balena.pine.delete({
				resource: 'organization_membership',
				options: {
					$filter: {
						user: { $ne: this.userId },
						is_member_of__organization: this.organization.id,
					},
				},
			});
		});

		describe('balena.models.organization.membership.create()', function () {
			before(function () {
				ctx = this;
			});

			parallel('[read operations]', function () {
				it(`should not be able to add a new member to the organization usign a wrong role name`, async function () {
					const promise = balena.models.organization.membership.create({
						organization: ctx.organization.id,
						username: credentials.member.username,
						// @ts-expect-error invalid value
						roleName: 'unknown role',
					});
					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaOrganizationMembershipRoleNotFound',
					);
				});

				const randomOrdInfo = {
					id: Math.floor(Date.now() / 1000),
					handle: `random_sdk_test_org_handle_${Math.floor(Date.now() / 1000)}`,
				};

				organizationRetrievalFields.forEach((field) => {
					it(`should not be able to add a new member when using an not existing organization ${field}`, async function () {
						const promise = balena.models.organization.membership.create({
							organization: randomOrdInfo[field],
							username: credentials.member.username,
							roleName: 'member',
						});
						await expect(promise).to.be.rejected.and.eventually.have.property(
							'code',
							'BalenaOrganizationNotFound',
						);
					});
				});
			});

			describe('[mutating operations]', function () {
				let membership:
					| BalenaSdk.PinePostResult<BalenaSdk.OrganizationMembership>
					| undefined;
				afterEach(async function () {
					await balena.models.organization.membership.remove(membership!.id);
				});
				organizationRetrievalFields.forEach(function (field) {
					it(`should be able to add a new member to the organization by ${field}`, async function () {
						membership = await balena.models.organization.membership.create({
							organization: this.organization[field],
							username: credentials.member.username,
						});

						expect(membership)
							.to.be.an('object')
							.that.has.nested.property('organization_membership_role.__id')
							.that.equals(this.orgMemberRole.id);
					});
				});

				it(`should be able to add a new member to the organization without providing a role`, async function () {
					membership = await balena.models.organization.membership.create({
						organization: this.organization.id,
						username: credentials.member.username,
					});

					expect(membership)
						.to.be.an('object')
						.that.has.nested.property('organization_membership_role.__id')
						.that.equals(this.orgMemberRole.id);
				});

				(['member', 'administrator'] as const).forEach(function (roleName) {
					it(`should be able to add a new member to the organization with a given role [${roleName}]`, async function () {
						membership = await balena.models.organization.membership.create({
							organization: this.organization.id,
							username: credentials.member.username,
							roleName,
						});

						expect(membership)
							.to.be.an('object')
							.that.has.nested.property('organization_membership_role.__id')
							.that.equals(this.orgRoleMap[roleName].id);
					});
				});
			});
		});

		describe('given a member organization membership [contained scenario]', function () {
			let membership:
				| BalenaSdk.PinePostResult<BalenaSdk.OrganizationMembership>
				| undefined;
			beforeEach(async function () {
				membership = await balena.models.organization.membership.create({
					organization: this.organization.id,
					username: credentials.member.username,
				});
			});

			describe('balena.models.organization.membership.remove()', function () {
				keyAlternatives.forEach(([title, keyGetter]) => {
					it(`should be able to remove a member by ${title}`, async function () {
						const key = keyGetter(membership!);
						await balena.models.organization.membership.remove(key);

						const promise = balena.models.organization.membership.get(
							membership!.id,
						);
						await expect(promise).to.be.rejectedWith(
							'Organization Membership not found',
						);
					});
				});
			});
		});

		describe('given an organization with an administrator organization membership [contained scenario]', function () {
			const testOrg1Name = `${TEST_ORGANIZATION_NAME}_org_member_tests_${Date.now()}`;
			let testOrg: BalenaSdk.PinePostResult<BalenaSdk.Organization> | undefined;
			let membership:
				| BalenaSdk.OrganizationMembership
				| BalenaSdk.PinePostResult<BalenaSdk.OrganizationMembership>
				| undefined;
			before(async function () {
				testOrg = await balena.models.organization.create({
					name: testOrg1Name,
				});
				membership = await balena.models.organization.membership.create({
					organization: testOrg.id,
					username: credentials.member.username,
					roleName: 'administrator',
				});
			});

			after(async function () {
				await balena.models.organization.remove(testOrg!.id);
			});

			describe('balena.models.organization.membership.changeRole()', function () {
				it(`should not be able to change an organization membership to an unknown role`, async function () {
					const promise = balena.models.organization.membership.changeRole(
						membership!.id,
						'unknown role',
					);
					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaOrganizationMembershipRoleNotFound',
					);
				});

				const roleChangeTest = (
					rolenName: BalenaSdk.OrganizationMembershipRoles,
					[title, keyGetter]: (typeof keyAlternatives)[number],
				) => {
					it(`should be able to change an organization membership to "${rolenName}" by ${title}`, async function () {
						const key = keyGetter(membership!);
						await balena.models.organization.membership.changeRole(
							key,
							rolenName,
						);

						membership = await balena.models.organization.membership.get(
							membership!.id,
							{
								$select: 'id',
								$expand: {
									user: {
										$select: ['id', 'username'],
									},
									is_member_of__organization: {
										$select: ['id'],
									},
									organization_membership_role: {
										$select: 'name',
									},
								},
							},
						);
						expect(membership).to.have.nested.property(
							'user[0].username',
							credentials.member.username,
						);
						expect(membership).to.have.nested.property(
							'is_member_of__organization[0].id',
							testOrg!.id,
						);
						expect(membership).to.have.nested.property(
							'organization_membership_role[0].name',
							rolenName,
						);
					});
				};

				keyAlternatives.forEach((keyAlternative) => {
					roleChangeTest('member', keyAlternative);
					roleChangeTest('administrator', keyAlternative);
				});
			});

			describe('balena.models.organization.membership.remove()', function () {
				it(`should be able to remove an administrator`, async function () {
					await balena.models.organization.membership.remove(membership!.id);

					const promise = balena.models.organization.membership.get(
						membership!.id,
					);

					await expect(promise).to.be.rejectedWith(
						'Organization Membership not found',
					);
				});

				it(`should not be able to remove the last membership of the organization`, async function () {
					const [lastAdminMembership] =
						await balena.models.organization.membership.getAllByOrganization(
							testOrg!.id,
							{
								$select: 'id',
								$filter: { user: this.userId },
							},
						);

					expect(lastAdminMembership).to.be.an('object');
					expect(lastAdminMembership)
						.to.have.property('id')
						.that.is.a('number');

					const promise = balena.models.organization.membership.remove(
						lastAdminMembership.id,
					);
					await expect(promise).to.be.rejectedWith(
						`It is necessary that each organization that is active, includes at least one organization membership that has an organization membership role that has a name (Auth) that is equal to "administrator"`,
					);
				});
			});
		});

		describe('balena.models.organization.membership.tags', function () {
			describe('[contained scenario]', function () {
				const orgTagTestOptions: tagsHelper.Options = {
					model: balena.models.organization.membership.tags,
					modelNamespace: 'balena.models.organization.membership.tags',
					resourceName: 'organization',
					uniquePropertyNames: ['id', 'handle'],
				};

				const orgMembershipTagTestOptions: tagsHelper.Options = {
					model: balena.models.organization.membership.tags,
					modelNamespace: 'balena.models.organization.membership.tags',
					resourceName: 'organization_membership',
					uniquePropertyNames: ['id'],
				};

				before(async function () {
					const [membership] =
						await balena.models.organization.membership.getAllByOrganization(
							this.organization.id,
							{
								$filter: { user: this.userId },
							},
						);

					expect(membership).to.be.an('object');
					expect(membership).to.have.property('id').that.is.a('number');
					orgTagTestOptions.resourceProvider = () => this.organization;
					// used for tag creation during the
					// device.tags.getAllByOrganization() test
					orgTagTestOptions.setTagResourceProvider = () => membership;
					orgMembershipTagTestOptions.resourceProvider = () => membership;

					// Clear all tags, since this is not a fresh organization
					await balena.pine.delete({
						resource: 'organization_membership_tag',
						options: {
							$filter: {
								organization_membership: this.organization.id,
							},
						},
					});
				});

				itShouldSetGetAndRemoveTags(orgMembershipTagTestOptions);

				describe('balena.models.organization.membership.tags.getAllByOrganization()', function () {
					itShouldGetAllTagsByResource(orgTagTestOptions);
				});

				describe('balena.models.organization.membership.tags.getAllByOrganizationMembership()', function () {
					itShouldGetAllTagsByResource(orgMembershipTagTestOptions);
				});
			});
		});
	});
});
