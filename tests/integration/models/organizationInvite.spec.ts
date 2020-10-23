// tslint:disable-next-line:import-blacklist
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena, givenAnOrganization, givenLoggedInUser } from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../../typings/balena-sdk';
const { expect } = m.chai;
import { assertDeepMatchAndLength } from '../../util';
const TEST_EMAIL = 'user.test@example.org';
const TEST_MESSAGE = 'Hey!, Join my org on balenaCloud';
const TEST_ROLE = 'member';
const UNKNOWN_ROLE = 'undefined_role';

describe('Organization Invite Model', function () {
	timeSuite(before);
	describe('When user is logged out', function () {
		describe('balena.models.organization.invite.getAllByOrganization()', function () {
			const promise = balena.models.organization.invite.getAllByOrganization(1);
			return expect(promise).to.be.rejectedWith('UnAuthorized');
		});
	});

	describe('When user is logged in', function () {
		givenLoggedInUser(before);

		describe('given an organization', function () {
			givenAnOrganization(before);

			describe('given no organization invite [contained scenario]', function () {
				let ctx: Mocha.Context;
				before(function () {
					ctx = this;
				});

				after(async function () {
					await balena.pine.delete({
						resource: 'invitee__is_invited_to__organization',
						options: {
							$filter: {
								is_invited_to__organization: this.organization.id,
							},
						},
					});
				});

				parallel(
					'balena.models.organization.invite.getAllByOrganization()',
					function () {
						it('should return an empty Array', function () {
							const promise = balena.models.organization.invite.getAllByOrganization(
								ctx.organization.id,
							);
							return expect(promise).to.become([]);
						});

						it('should support a callback with no options', function (done) {
							(balena.models.organization.invite.getAllByOrganization as (
								...args: any[]
							) => any)(ctx.organization.id, function (
								_err: Error,
								organizationInvite: BalenaSdk.OrganizationInvite[],
							) {
								try {
									expect(organizationInvite).to.deep.equal([]);
									done();
								} catch (err) {
									done(err);
								}
							});
						});
					},
				);

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
						const invites = await balena.models.organization.invite.getAllByOrganization(
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
						const promise = balena.models.organization.invite.create(
							this.organization.id,
							{
								invitee: TEST_EMAIL,
								// @ts-expect-error
								roleName: UNKNOWN_ROLE,
							},
						);
						expect(promise).to.be.rejected.then((error) => {
							expect(error).to.have.property('code', 'BalenaRequestError');
							expect(error).to.have.property('statusCode', 404);
							expect(error)
								.to.have.property('message')
								.that.contains(
									`Organization membership role not found: ${UNKNOWN_ROLE}`,
								);
						});
					});
				});
			});

			describe('given a single organization invite [contained scenario]', function () {
				let ctx: Mocha.Context;
				before(async function () {
					ctx = this;

					this.organizationInvite = await balena.models.organization.invite.create(
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
							const organizationInvites = await balena.models.organization.invite.getAllByOrganization(
								ctx.organization.id,
							);
							expect(organizationInvites).to.have.length(1);
						});

						it('should support arbitrary pinejs options', async function () {
							const organizationInvites = await balena.models.organization.invite.getAllByOrganization(
								ctx.organization.id,
								{
									$expand: { invitee: { $select: ['email'] } },
								},
							);
							assertDeepMatchAndLength(organizationInvites, [
								{ invitee: [{ email: TEST_EMAIL }] },
							]);
						});

						it('should be rejected if the organization is inaccessible', function () {
							const promise = balena.models.organization.invite.getAllByOrganization(
								9999,
							);
							return expect(promise).to.be.rejected.then((error) => {
								expect(error).to.have.property(
									'code',
									'BalenaOrganizationNotFound',
								);
								expect(error)
									.to.have.property('message')
									.that.contains('Organization not found: 9999');
							});
						});
					},
				);

				describe('balena.models.organization.invite.revoke()', function () {
					it('should be able to revoke the organizationInvite', async function () {
						await balena.models.organization.invite.revoke(
							this.organizationInvite.id,
						);
						const promise = balena.models.organization.invite.getAllByOrganization(
							this.organization.id,
						);
						return expect(promise).to.eventually.have.length(0);
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
						const invites = await balena.models.organization.invite.getAllByOrganization(
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
