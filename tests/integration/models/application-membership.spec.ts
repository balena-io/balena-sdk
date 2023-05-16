// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	credentials,
	givenAnApplication,
	givenLoggedInUser,
	applicationRetrievalFields,
} from '../setup';
import type * as BalenaSdk from '../../..';
import { assertDeepMatchAndLength, timeSuite } from '../../util';

const keyAlternatives = [
	['id', (member: BalenaSdk.ApplicationMembership) => member.id],
	[
		'alternate key',
		(member: BalenaSdk.ApplicationMembership) =>
			_.mapValues(
				_.pick(member, ['user', 'is_member_of__application']),
				(obj: BalenaSdk.PineDeferred | [{ id: number }]): number =>
					'__id' in obj ? obj.__id : obj[0].id,
			),
	],
] as const;

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

			applicationRetrievalFields.forEach((field) => {
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
		});

		describe('[mutating operations]', function () {
			let membership: BalenaSdk.ApplicationMembership | undefined;
			afterEach(async function () {
				await balena.models.application.membership.remove(membership!.id);
			});
			applicationRetrievalFields.forEach(function (field) {
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
		beforeEach(async function () {
			membership = await balena.models.application.membership.create({
				application: this.application.id,
				username: credentials.member.username,
			});
		});

		describe('balena.models.application.membership.remove()', function () {
			keyAlternatives.forEach(([title, keyGetter]) => {
				it(`should be able to remove a member by ${title}`, async function () {
					const key = keyGetter(membership!);
					await balena.models.application.membership.remove(key);

					const promise = balena.models.application.membership.get(
						membership!.id,
					);
					await expect(promise).to.be.rejectedWith(
						'Application Membership not found',
					);
				});
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

			const roleChangeTest = (
				rolenName: BalenaSdk.ApplicationMembershipRoles,
				[title, keyGetter]: (typeof keyAlternatives)[number],
			) => {
				it(`should be able to change an application membership to "${rolenName}" by ${title}`, async function () {
					const key = keyGetter(membership!);
					await balena.models.application.membership.changeRole(key, rolenName);

					membership = await balena.models.application.membership.get(
						membership!.id,
						{
							$select: 'id',
							$expand: {
								user: {
									$select: ['id', 'username'],
								},
								is_member_of__application: {
									$select: ['id'],
								},
								application_membership_role: {
									$select: 'name',
								},
							},
						},
					);
					expect(membership).to.have.nested.property('user[0].id');
					expect(membership).to.have.nested.property(
						'user[0].username',
						credentials.member.username,
					);
					expect(membership).to.have.nested.property(
						'is_member_of__application[0].id',
						this.application.id,
					);
					expect(membership).to.have.nested.property(
						'application_membership_role[0].name',
						rolenName,
					);
				});
			};

			keyAlternatives.forEach((keyAlternative) => {
				roleChangeTest('observer', keyAlternative);
				roleChangeTest('developer', keyAlternative);
			});
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
			it(`should return only the user's own memberships`, async function () {
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
		});

		parallel(
			'balena.models.application.membership.getAllByApplication()',
			function () {
				it(`should return only the user's own membership`, async function () {
					const memberships =
						await balena.models.application.membership.getAllByApplication(
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

			keyAlternatives.forEach(([title, keyGetter]) => {
				it(`should be able to retrieve a membership by ${title}`, async function () {
					const key = keyGetter(membership!);
					const result = await balena.models.application.membership.get(key, {
						$select: 'id',
						$expand: {
							user: {
								$select: 'username',
							},
							application_membership_role: {
								$select: 'name',
							},
						},
					});
					expect(result).to.have.nested.property(
						'user[0].username',
						credentials.member.username,
					);
					expect(result).to.have.nested.property(
						'application_membership_role[0].name',
						'developer',
					);
				});
			});
		});
	});
});
