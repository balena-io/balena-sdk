// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import {
	balena,
	credentials,
	givenAnApplication,
	givenLoggedInUser,
} from '../setup';
import type * as BalenaSdk from '../../..';
const { expect } = m.chai;
import { assertDeepMatchAndLength, timeSuite } from '../../util';

describe('Application Membership Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenAnApplication(before);

	let ctx: Mocha.Context;
	before(async function () {
		ctx = this;
		const roles = await balena.pine.get({
			resource: 'application_membership_role',
			options: { $select: ['id', 'name'] },
		});
		this.applicationRoleMap = _.keyBy(roles, 'name');
		roles.forEach((role) => {
			expect(role).to.be.an('object');
			expect(role).to.have.property('id').that.is.a('number');
		});
		this.applicationDeveloperRole = this.applicationRoleMap['developer'];
		this.applicationOperatorRole = this.applicationRoleMap['operator'];
		this.applicationObserverRole = this.applicationRoleMap['observer'];
		[
			this.applicationDeveloperRole,
			this.applicationOperatorRole,
			this.applicationObserverRole,
		].forEach((role) => {
			expect(role).to.be.an('object');
		});
	});

	describe('balena.models.application.membership.create()', function () {
		before(function () {
			ctx = this;
		});

		parallel('[read operations]', function () {
			it(`should not be able to add a new member to the application using a wrong role name`, async function () {
				const promise = balena.models.application.membership.create({
					application: ctx.application.id,
					username: credentials.member.username,
					// @ts-expect-error
					roleName: 'unknown role',
				});
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaApplicationMembershipRoleNotFound',
				);
			});

			const randomOrdInfo = {
				id: Math.floor(Date.now() / 1000),
				app_name: `random_sdk_test_app_name_${Math.floor(Date.now() / 1000)}`,
				slug: `random_name/random_sdk_test_app_slug_${Math.floor(
					Date.now() / 1000,
				)}`,
			};

			['id', 'app_name', 'slug'].forEach((field) => {
				it(`should not be able to add a new member when using an not existing application ${field}`, async function () {
					const promise = balena.models.application.membership.create({
						application: randomOrdInfo[field],
						username: credentials.member.username,
						roleName: 'developer',
					});
					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaApplicationNotFound',
					);
				});
			});

			it(`should not be able to add a new member to a starter application with a given role operator`, async function () {
				const promise = balena.models.application.membership.create({
					application: ctx.application.id,
					username: credentials.member.username,
					roleName: 'operator',
				});

				await expect(promise).to.be.rejectedWith(
					'It is necessary that each user application membership that has an application membership role that has a name (Auth) that is not equal to "developer" and is not equal to "observer", has an application that has an application type that has a slug that is not equal to "microservices-starter"',
				);
			});
		});

		describe('[mutating operations]', function () {
			let membership: BalenaSdk.ApplicationMembership | undefined;
			afterEach(async function () {
				await balena.models.application.membership.remove(membership!.id);
			});
			['id', 'app_name', 'slug'].forEach(function (field) {
				it(`should be able to add a new member to the application by ${field}`, async function () {
					membership = await balena.models.application.membership.create({
						application: this.application[field],
						username: credentials.member.username,
					});

					expect(membership)
						.to.be.an('object')
						.that.has.nested.property('application_membership_role.__id')
						.that.equals(this.applicationDeveloperRole.id);
				});
			});

			it(`should be able to add a new member to the application without providing a role`, async function () {
				membership = await balena.models.application.membership.create({
					application: this.application.id,
					username: credentials.member.username,
				});

				expect(membership)
					.to.be.an('object')
					.that.has.nested.property('application_membership_role.__id')
					.that.equals(this.applicationDeveloperRole.id);
			});

			(['observer', 'developer'] as const).forEach(function (roleName) {
				it(`should be able to add a new member to the application with a given role [${roleName}]`, async function () {
					membership = await balena.models.application.membership.create({
						application: this.application.id,
						username: credentials.member.username,
						roleName,
					});

					expect(membership)
						.to.be.an('object')
						.that.has.nested.property('application_membership_role.__id')
						.that.equals(this.applicationRoleMap[roleName].id);
				});
			});
		});
	});

	describe('given a member application membership [contained scenario]', function () {
		let membership: BalenaSdk.ApplicationMembership | undefined;
		before(async function () {
			membership = await balena.models.application.membership.create({
				application: this.application.id,
				username: credentials.member.username,
			});
		});

		describe('balena.models.application.membership.remove()', function () {
			it(`should be able to remove a member`, async function () {
				await balena.models.application.membership.remove(membership!.id);

				const promise = balena.models.application.membership.get(
					membership!.id,
				);
				await expect(promise).to.be.rejectedWith(
					'Application Membership not found',
				);
			});
		});
	});

	describe('given a developer application membership [contained scenario]', function () {
		let membership: BalenaSdk.ApplicationMembership | undefined;
		before(async function () {
			membership = await balena.models.application.membership.create({
				application: this.application.id,
				username: credentials.member.username,
				roleName: 'developer',
			});
		});
		after(async function () {
			await balena.models.application.membership.remove(membership!.id);
		});

		describe('balena.models.application.membership.changeRole()', function () {
			it(`should not be able to change an application membership to an unknown role`, async function () {
				const promise = balena.models.application.membership.changeRole(
					membership!.id,
					'unknown role',
				);
				await expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaApplicationMembershipRoleNotFound',
				);
			});

			it(`should not be able to change an application membership to an operator role on a starter application `, async function () {
				const promise = balena.models.application.membership.changeRole(
					membership!.id,
					'operator',
				);

				await expect(promise).to.be.rejectedWith(
					'It is necessary that each user application membership that has an application membership role that has a name (Auth) that is not equal to "developer" and is not equal to "observer", has an application that has an application type that has a slug that is not equal to "microservices-starter"',
				);
			});

			const roleChangeTest = (
				rolenName: BalenaSdk.ApplicationMembershipRoles,
			) =>
				it(`should be able to change an application membership to "${rolenName}"`, async function () {
					await balena.models.application.membership.changeRole(
						membership!.id,
						rolenName,
					);

					membership = await balena.models.application.membership.get(
						membership!.id,
						{
							$select: 'id',
							$expand: {
								user: {
									$select: 'username',
								},
								application_membership_role: {
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
						'application_membership_role[0].name',
						rolenName,
					);
				});

			roleChangeTest('observer');
			roleChangeTest('developer');
		});

		describe('balena.models.application.membership.remove()', function () {
			it(`should be able to remove a developer`, async function () {
				await balena.models.application.membership.remove(membership!.id);

				const promise = balena.models.application.membership.get(
					membership!.id,
				);

				await expect(promise).to.be.rejectedWith(
					'Application Membership not found',
				);
			});
		});
	});

	describe('given a membership [read operations]', function () {
		let membership: BalenaSdk.ApplicationMembership | undefined;
		before(async function () {
			membership = await balena.models.application.membership.create({
				application: this.application.id,
				username: credentials.member.username,
			});
		});

		after(async function () {
			await balena.models.application.membership.remove(membership!.id);
		});

		parallel('balena.models.application.membership.getAll()', function () {
			it(`should return only the user's own memberships [Promise]`, async function () {
				const memberships = await balena.models.application.membership.getAll();

				assertDeepMatchAndLength(memberships, [
					{
						user: membership!.user,
						is_member_of__application: { __id: ctx.application.id },
						application_membership_role: {
							__id: ctx.applicationDeveloperRole.id,
						},
					},
				]);
			});

			it(`should return only the user's own membership [callback]`, function (done) {
				balena.models.application.membership.getAll(
					// @ts-expect-error
					(_err: Error, memberships: BalenaSdk.ApplicationMembership[]) => {
						try {
							assertDeepMatchAndLength(memberships, [
								{
									user: membership!.user,
									is_member_of__application: { __id: ctx.application.id },
									application_membership_role: {
										__id: ctx.applicationDeveloperRole.id,
									},
								},
							]);
							done();
						} catch (err) {
							done(err);
						}
					},
				);
			});
		});

		parallel(
			'balena.models.application.membership.getAllByApplication()',
			function () {
				it(`shoud return only the user's own membership`, async function () {
					const memberships = await balena.models.application.membership.getAllByApplication(
						ctx.application.id,
					);
					assertDeepMatchAndLength(memberships, [
						{
							user: membership!.user,
							is_member_of__application: { __id: ctx.application.id },
							application_membership_role: {
								__id: ctx.applicationDeveloperRole.id,
							},
						},
					]);
				});
			},
		);

		parallel('balena.models.application.membership.get()', function () {
			it(`should reject when the application membership is not found`, async function () {
				const promise = balena.models.application.membership.get(
					Math.floor(Date.now() / 1000),
				);

				await expect(promise).to.be.rejectedWith(
					'Application Membership not found',
				);
			});

			it(`should be able to retrieve a membership by id`, async function () {
				membership = await balena.models.application.membership.get(
					membership!.id,
					{
						$select: 'id',
						$expand: {
							user: {
								$select: 'username',
							},
							application_membership_role: {
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
					'application_membership_role[0].name',
					'developer',
				);
			});
		});
	});
});
