import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	givenInitialOrganization,
	givenLoggedInUser,
	credentials,
	organizationRetrievalFields,
} from '../setup';
import { timeSuite, assertDeepMatchAndLength, expectError } from '../../util';
import type * as BalenaSdk from '../../..';
import { keyBy } from 'es-toolkit';
const TEST_EMAIL = 'user.test@example.org';
const TEST_MESSAGE = 'Hey!, Join my org on balenaCloud';
const TEST_ROLE = 'member';
const UNKNOWN_ROLE = 'undefined_role';

const resetOrganizationInvites = async (orgId: number) => {
	await balena.pine.delete({
		resource: 'invitee__is_invited_to__organization',
		options: {
			$filter: {
				is_invited_to__organization: orgId,
			},
		},
	});
};

describe('Organization Invite Model', function () {
	timeSuite(before);
	describe('When user is logged out', function () {
		before(() => balena.auth.logout());
		describe('balena.models.organization.invite.getAllByOrganization()', function () {
			it('should be rejected with an unauthorized error', async () => {
				await expectError(
					async () => {
						await balena.models.organization.invite.getAllByOrganization(1);
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaNotLoggedIn');
					},
				);
			});
		});
	});

	describe('When user is logged in', function () {
		givenLoggedInUser(before);

		describe('given an organization', function () {
			givenInitialOrganization(before);
			before(async function () {
				this.organization = this.initialOrg;
				await resetOrganizationInvites(this.organization.id);
			});

			describe('given no organization invite [contained scenario]', function () {
				let ctx: Mocha.Context;
				before(function () {
					ctx = this;
				});

				after(async function () {
					await resetOrganizationInvites(this.organization.id);
				});

				describe('balena.models.organization.invite.getAllByOrganization()', function () {
					it('should return an empty Array', async function () {
						const result =
							await balena.models.organization.invite.getAllByOrganization(
								ctx.organization.id,
							);
						expect(result).to.deep.equal([]);
					});
				});

				describe('balena.models.organization.invite.create()', function () {
					it('should create and return an organization invite', async function () {
						const response = await balena.models.organization.invite.create(
							this.organization.id,
							{
								invitee: TEST_EMAIL,
								roleName: TEST_ROLE,
								message: TEST_MESSAGE,
							},
						);
						expect(response).to.have.property('id');
						const invites =
							await balena.models.organization.invite.getAllByOrganization(
								this.organization.id,
								{
									$expand: {
										is_invited_to__organization: { $select: ['id'] },
										invitee: { $select: ['email'] },
										organization_membership_role: { $select: ['name'] },
									},
									$select: ['message'],
								},
							);
						assertDeepMatchAndLength(invites, [
							{
								message: TEST_MESSAGE,
								organization_membership_role: [{ name: TEST_ROLE }],
								is_invited_to__organization: [{ id: this.organization.id }],
							},
						]);
					});

					it('should throw an error when role is not found', async function () {
						await expectError(
							async () => {
								await balena.models.organization.invite.create(
									this.organization.id,
									{
										invitee: TEST_EMAIL,
										roleName: UNKNOWN_ROLE,
									},
								);
							},
							(error) => {
								expect(error).to.have.property(
									'code',
									'BalenaOrganizationMembershipRoleNotFound',
								);
								expect(error)
									.to.have.property('message')
									.that.contains(
										`Organization membership role not found: ${UNKNOWN_ROLE}`,
									);
							},
						);
					});
				});

				parallel('[read operations]', function () {
					const randomOrdInfo = {
						id: Math.floor(Date.now() / 1000),
						handle: `random_sdk_test_org_handle_${Math.floor(Date.now() / 1000)}`,
					};

					for (const field of organizationRetrievalFields) {
						it(`should not be able to invite a new member when using an not existing organization ${field}`, async function () {
							await expectError(
								async () => {
									await balena.models.organization.invite.create(
										randomOrdInfo[field],
										{
											invitee: credentials.member.email,
											roleName: 'member',
										},
									);
								},
								(error) => {
									expect(error).to.have.property(
										'code',
										'BalenaOrganizationNotFound',
									);
								},
							);
						});
					}
				});

				describe('[mutating operations]', function () {
					let membership:
						| BalenaSdk.InviteeIsInvitedToOrganization['Read']
						| undefined;
					before(async function () {
						const roles = await balena.pine.get({
							resource: 'organization_membership_role',
							options: { $select: ['id', 'name'] },
						});
						this.orgRoleMap = keyBy(roles, (r) => r.name);
						roles.forEach((role) => {
							expect(role).to.be.an('object');
							expect(role).to.have.property('id').that.is.a('number');
						});
						this.orgMemberRole = this.orgRoleMap['member'];
					});
					afterEach(async function () {
						await balena.models.organization.invite.revoke(membership!.id);
					});
					for (const field of organizationRetrievalFields) {
						it(`should be able to invite a new member to the organization by ${field}`, async function () {
							membership = await balena.models.organization.invite.create(
								this.organization[field],
								{
									invitee: credentials.member.email,
								},
							);

							expect(membership)
								.to.be.an('object')
								.that.has.nested.property('organization_membership_role.__id')
								.that.equals(this.orgMemberRole.id);
						});
					}

					it(`should be able to invite a new member to the organization without providing a role`, async function () {
						membership = await balena.models.organization.invite.create(
							this.organization.id,
							{
								invitee: credentials.member.email,
							},
						);

						expect(membership)
							.to.be.an('object')
							.that.has.nested.property('organization_membership_role.__id')
							.that.equals(this.orgMemberRole.id);
					});

					(['member', 'administrator'] as const).forEach(function (roleName) {
						it(`should be able to invite a new member to the organization with a given role [${roleName}]`, async function () {
							membership = await balena.models.organization.invite.create(
								this.organization.id,
								{
									invitee: credentials.member.email,
									roleName,
								},
							);

							expect(membership)
								.to.be.an('object')
								.that.has.nested.property('organization_membership_role.__id')
								.that.equals(this.orgRoleMap[roleName].id);
						});
					});
				});
			});

			describe('given a single organization invite [contained scenario]', function () {
				let ctx: Mocha.Context;
				before(async function () {
					ctx = this;

					this.organizationInvite =
						await balena.models.organization.invite.create(
							this.organization.id,
							{
								invitee: TEST_EMAIL,
								roleName: TEST_ROLE,
								message: TEST_MESSAGE,
							},
						);
				});

				parallel(
					'balena.models.organization.invite.getAllByOrganization()',
					() => {
						it('should become the list of organization invites', async function () {
							const organizationInvites =
								await balena.models.organization.invite.getAllByOrganization(
									ctx.organization.id,
								);
							expect(organizationInvites).to.have.length(1);
						});

						it('should support arbitrary pinejs options', async function () {
							const organizationInvites =
								await balena.models.organization.invite.getAllByOrganization(
									ctx.organization.id,
									{
										$expand: { invitee: { $select: ['email'] } },
									},
								);
							assertDeepMatchAndLength(organizationInvites, [
								{ invitee: [{ email: TEST_EMAIL }] },
							]);
						});

						it('should be rejected if the organization is inaccessible', async function () {
							await expectError(
								async () => {
									await balena.models.organization.invite.getAllByOrganization(
										9999,
									);
								},
								(error) => {
									expect(error).to.have.property(
										'code',
										'BalenaOrganizationNotFound',
									);
									expect(error)
										.to.have.property('message')
										.that.contains('Organization not found: 9999');
								},
							);
						});
					},
				);

				describe('balena.models.organization.invite.revoke()', function () {
					it('should be able to revoke the organizationInvite', async function () {
						await balena.models.organization.invite.revoke(
							this.organizationInvite.id,
						);
						expect(
							await balena.models.organization.invite.getAllByOrganization(
								this.organization.id,
							),
						).to.deep.equal([]);
					});
				});

				describe('balena.models.organization.invite.create()', function () {
					it('should create an organization invite with default role when rolename is not provided', async function () {
						const response = await balena.models.organization.invite.create(
							this.organization.id,
							{
								invitee: TEST_EMAIL,
							},
						);
						expect(response).to.have.property('id');
						const invites =
							await balena.models.organization.invite.getAllByOrganization(
								this.organization.id,
								{
									$expand: {
										is_invited_to__organization: { $select: ['id'] },
										invitee: { $select: ['email'] },
										organization_membership_role: { $select: ['name'] },
									},
									$select: ['message'],
								},
							);
						assertDeepMatchAndLength(invites, [
							{
								message: null,
								organization_membership_role: [{ name: 'member' }],
								is_invited_to__organization: [{ id: this.organization.id }],
							},
						]);
					});
				});
			});
		});
	});
});
