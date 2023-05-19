// tslint:disable-next-line:import-blacklist
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena, givenAnApplication, givenLoggedInUser } from '../setup';
import { timeSuite } from '../../util';
import { assertDeepMatchAndLength } from '../../util';
const TEST_EMAIL = 'user.test@example.org';
const TEST_MESSAGE = 'Hey!, Join my app on balenaCloud';
const TEST_ROLE = 'developer';
const UNKNOWN_ROLE = 'undefined_role';

describe('Application Invite Model', function () {
	timeSuite(before);
	describe('When user is logged out', function () {
		before(() => balena.auth.logout());
		describe('balena.models.application.invite.getAllByApplication()', function () {
			it('should be rejected with an unauthorized error', async () => {
				// Use a public app to confirm to make sure the app invite request
				// is rejecting with a 401
				const [publicApp] = await balena.models.application.getAll({
					$top: 1,
					$select: 'id',
					$filter: {
						is_public: true,
					},
				});

				const promise = balena.models.application.invite.getAllByApplication(
					publicApp?.id ?? 1,
				);
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					publicApp ? 'BalenaNotLoggedIn' : 'BalenaApplicationNotFound',
				);
			});
		});
	});

	describe('When user is logged in', function () {
		givenLoggedInUser(before);

		describe('given an application', function () {
			givenAnApplication(before);

			describe('given no application invite [contained scenario]', function () {
				let ctx: Mocha.Context;
				before(function () {
					ctx = this;
				});

				after(async function () {
					await balena.pine.delete({
						resource: 'invitee__is_invited_to__application',
						options: {
							$filter: {
								is_invited_to__application: this.application.id,
							},
						},
					});
				});

				describe('balena.models.application.invite.getAllByApplication()', function () {
					it('shoud return an empty Array', function () {
						const promise =
							balena.models.application.invite.getAllByApplication(
								ctx.application.id,
							);
						return expect(promise).to.become([]);
					});
				});

				describe('balena.models.application.invite.create()', function () {
					it('should create and return an application invite', async function () {
						const response = await balena.models.application.invite.create(
							this.application.id,
							{
								invitee: TEST_EMAIL,
								roleName: TEST_ROLE,
								message: TEST_MESSAGE,
							},
						);
						expect(response).to.have.property('id');
						const invites =
							await balena.models.application.invite.getAllByApplication(
								this.application.id,
								{
									$expand: {
										is_invited_to__application: { $select: ['id'] },
										invitee: { $select: ['email'] },
										application_membership_role: { $select: ['name'] },
									},
									$select: ['message'],
								},
							);
						assertDeepMatchAndLength(invites, [
							{
								message: TEST_MESSAGE,
								application_membership_role: [{ name: TEST_ROLE }],
								is_invited_to__application: [{ id: this.application.id }],
							},
						]);
					});

					it('should throw an error when role is not found', async function () {
						const promise = balena.models.application.invite.create(
							this.application.id,
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
									`Application membership role not found: ${UNKNOWN_ROLE}`,
								);
						});
					});
				});
			});

			describe('given a single application invite [contained scenario]', function () {
				let ctx: Mocha.Context;
				before(async function () {
					ctx = this;

					this.applicationInvite =
						await balena.models.application.invite.create(this.application.id, {
							invitee: TEST_EMAIL,
							roleName: TEST_ROLE,
							message: TEST_MESSAGE,
						});
				});

				parallel('balena.models.application.invite.getAllApplication()', () => {
					it('should become the list of application invites', async function () {
						const applicationInvites =
							await balena.models.application.invite.getAllByApplication(
								ctx.application.id,
							);
						expect(applicationInvites).to.have.length(1);
					});

					it('should support arbitrary pinejs options', async function () {
						const applicationInvites =
							await balena.models.application.invite.getAllByApplication(
								ctx.application.id,
								{
									$expand: { invitee: { $select: ['email'] } },
								},
							);
						assertDeepMatchAndLength(applicationInvites, [
							{ invitee: [{ email: TEST_EMAIL }] },
						]);
					});

					it('should be rejected if the application is inaccessible', function () {
						const promise =
							balena.models.application.invite.getAllByApplication(9999);
						return expect(promise).to.be.rejected.then((error) => {
							expect(error).to.have.property(
								'code',
								'BalenaApplicationNotFound',
							);
							expect(error)
								.to.have.property('message')
								.that.contains('Application not found: 9999');
						});
					});
				});

				describe('balena.models.application.invite.revoke()', function () {
					it('should be able to revoke the applicationInvite', async function () {
						await balena.models.application.invite.revoke(
							this.applicationInvite.id,
						);
						const promise =
							balena.models.application.invite.getAllByApplication(
								this.application.id,
							);
						return expect(promise).to.eventually.have.length(0);
					});
				});

				describe('balena.models.application.invite.create()', function () {
					it('should create an application invite with default role when rolename is not provided', async function () {
						const response = await balena.models.application.invite.create(
							this.application.id,
							{
								invitee: TEST_EMAIL,
							},
						);
						expect(response).to.have.property('id');
						const invites =
							await balena.models.application.invite.getAllByApplication(
								this.application.id,
								{
									$expand: {
										is_invited_to__application: { $select: ['id'] },
										invitee: { $select: ['email'] },
										application_membership_role: { $select: ['name'] },
									},
									$select: ['message'],
								},
							);
						assertDeepMatchAndLength(invites, [
							{
								message: null,
								application_membership_role: [{ name: 'developer' }],
								is_invited_to__application: [{ id: this.application.id }],
							},
						]);
					});
				});
			});
		});
	});
});
