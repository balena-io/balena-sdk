import { mapValues, pick, keyBy } from 'es-toolkit';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	credentials,
	givenInitialOrganization,
	givenLoggedInUser,
} from '../setup';
import type * as BalenaSdk from '../../..';
import {
	assertDeepMatchAndLength,
	assertExists,
	expectError,
	timeSuite,
} from '../../util';
import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';
import type * as tagsHelper from './tags';
import type { PickDeferred } from '@balena/abstract-sql-to-typescript';

const keyAlternatives = [
	[
		'id',
		(member: Pick<BalenaSdk.OrganizationMembership['Read'], 'id'>) => member.id,
	],
	[
		'alternate key',
		(
			member: Pick<
				BalenaSdk.OrganizationMembership['Read'],
				'user' | 'is_member_of__organization'
			>,
		) =>
			mapValues(
				pick(member, ['user', 'is_member_of__organization']),
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
		this.orgRoleMap = keyBy(roles, (role) => role.name);
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
		it(`should return the members of the organization`, async function () {
			const opts = {
				$expand: {
					user: {
						$select: 'username',
					},
				},
			} as const;
			const memberships =
				await balena.models.organization.membership.getAllByOrganization(
					this.initialOrg.id,
					opts,
				);
			assertDeepMatchAndLength(
				memberships.map((m) => m.user[0].username).sort(),
				[credentials.username, credentials.member.username].sort(),
			);
		});
	});

	describe('given a membership [read operations]', function () {
		let membership: BalenaSdk.OrganizationMembership['Read'] | undefined;
		before(async function () {
			membership = (
				await balena.models.organization.membership.getAllByOrganization(
					this.initialOrg.id,
					{
						$filter: {
							user: {
								$any: {
									$alias: 'u',
									$expr: { u: { username: credentials.username } },
								},
							},
						},
					},
				)
			)[0];
		});

		parallel('balena.models.organization.membership.get()', function () {
			it(`should reject when the organization membership is not found`, async function () {
				await expectError(async () => {
					await balena.models.organization.membership.get(
						Math.floor(Date.now() / 1000),
					);
				}, 'Organization Membership not found');
			});

			keyAlternatives.forEach(([title, keyGetter]) => {
				it(`should be able to retrieve a membership by ${title}`, async function () {
					assertExists(membership);
					const key = keyGetter(membership);
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
						$not: {
							user: {
								$any: {
									$alias: 'u',
									$expr: {
										u: {
											username: {
												$in: [
													credentials.username,
													credentials.member.username,
												],
											},
										},
									},
								},
							},
						},
						is_member_of__organization: this.organization.id,
					},
				},
			});
		});

		// TODO: re-add this test in the future, we need a way to accept email invites in order to add and remove a user during testing
		describe.skip('given a member organization membership [contained scenario]', function () {
			let membership:
				| PickDeferred<BalenaSdk.OrganizationMembership['Read']>
				| undefined;

			describe('balena.models.organization.membership.remove()', function () {
				keyAlternatives.forEach(([title, keyGetter]) => {
					it(`should be able to remove a member by ${title}`, async function () {
						assertExists(membership);
						const key = keyGetter(membership);
						await balena.models.organization.membership.remove(key);

						await expectError(async () => {
							await balena.models.organization.membership.get(membership.id);
						}, 'Organization Membership not found');
					});
				});
			});
		});

		describe('given an organization with two organization memberships [contained scenario]', function () {
			let memberMembership:
				| BalenaSdk.OrganizationMembership['Read']
				| undefined;

			before(async function () {
				memberMembership = (
					await balena.models.organization.membership.getAllByOrganization(
						this.initialOrg.id,
						{
							$filter: {
								user: {
									$any: {
										$alias: 'u',
										$expr: { u: { username: credentials.member.username } },
									},
								},
							},
						},
					)
				)[0];
			});

			describe('balena.models.organization.membership.changeRole()', function () {
				it(`should not be able to change an organization membership to an unknown role`, async function () {
					await expectError(
						async () => {
							await balena.models.organization.membership.changeRole(
								memberMembership!.id,
								'unknown role',
							);
						},
						(error) => {
							expect(error).to.have.property(
								'code',
								'BalenaOrganizationMembershipRoleNotFound',
							);
						},
					);
				});

				const roleChangeTest = (
					rolenName: string,
					[title, keyGetter]: (typeof keyAlternatives)[number],
				) => {
					it(`should be able to change an organization membership to "${rolenName}" by ${title}`, async function () {
						assertExists(memberMembership);
						const key = keyGetter(memberMembership);
						await balena.models.organization.membership.changeRole(
							key,
							rolenName,
						);

						memberMembership = (await balena.models.organization.membership.get(
							memberMembership.id,
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
						)) as BalenaSdk.OrganizationMembership['Read'];
						expect(memberMembership).to.have.nested.property(
							'user[0].username',
							credentials.member.username,
						);
						expect(memberMembership).to.have.nested.property(
							'is_member_of__organization[0].id',
							this.initialOrg.id,
						);
						expect(memberMembership).to.have.nested.property(
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
				// TODO: re-add this test in the future, we need a way to accept email invites in order to add and remove a user during testing
				it.skip(`should be able to remove an administrator`, async function () {
					await balena.models.organization.membership.remove(
						memberMembership!.id,
					);

					await expectError(async () => {
						await balena.models.organization.membership.get(
							memberMembership!.id,
						);
					}, 'Organization Membership not found');
				});

				describe('given an organization with a single administrator organization membership [contained scenario]', function () {
					before(async function () {
						// Make sure that there is only 1 administrator.
						// That's in the before(), so that if it fails, the organization.membership.remove() is not called
						await balena.models.organization.membership.changeRole(
							memberMembership!.id,
							'member',
						);
						const administratorMemberships =
							await balena.models.organization.membership.getAllByOrganization(
								this.initialOrg.id,
								{
									$select: 'id',
									$expand: {
										user: {
											$select: 'username',
										},
									},
									$filter: {
										organization_membership_role: {
											$any: {
												$alias: 'omr',
												$expr: {
													omr: {
														name: 'administrator',
													},
												},
											},
										},
									},
								},
							);
						assertDeepMatchAndLength(
							administratorMemberships.map((m) => m.user[0].username),
							[credentials.username],
						);
					});

					it(`should not be able to remove the last administrator of the organization`, async function () {
						const [lastAdminMembership] =
							await balena.models.organization.membership.getAllByOrganization(
								this.initialOrg.id,
								{
									$select: 'id',
									$filter: { user: this.userId },
								},
							);

						expect(lastAdminMembership).to.be.an('object');
						expect(lastAdminMembership)
							.to.have.property('id')
							.that.is.a('number');

						await expectError(async () => {
							await balena.models.organization.membership.remove(
								lastAdminMembership.id,
							);
						}, `It is necessary that each organization that is active, includes at least one organization membership that has an organization membership role that has a name (Auth) that is equal to "administrator"`);
					});
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
