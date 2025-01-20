import { expect } from 'chai';
import { timeSuite } from '../../util';
import {
	balena,
	givenInitialOrganization,
	givenLoggedInUser,
	TEST_TEAM_NAME,
	TEST_APPLICATION_NAME_PREFIX,
	givenAnApplication,
} from '../setup';
import { getInitialOrganization } from '../utils';
import type { ApplicationMembershipRoles } from '../../..';

describe('Team Application Access Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);
	givenAnApplication(before);

	const ctx: Partial<{
		initialOrganization: any;
		team: any;
		application1: any;
		application2: any;
		teamApplicationAccessRead: any;
		teamApplicationAccessWrite: any;
	}> = {};

	before(async function () {
		ctx.initialOrganization = await getInitialOrganization();

		const teamName = `${TEST_TEAM_NAME}_${Date.now()}`;
		ctx.team = await balena.models.team.create(
			ctx.initialOrganization.id,
			teamName,
		);

		const appName = `${TEST_APPLICATION_NAME_PREFIX}_${Date.now()}_team_application_access`;
		ctx.application1 = this.application;
		ctx.application2 = await balena.models.application.create({
			name: appName,
			organization: ctx.initialOrganization.id,
			deviceType: 'raspberry-pi',
		});

		const roleName = 'observer';
		ctx.teamApplicationAccessRead =
			await balena.models.team.applicationAccess.add(
				ctx.team.id,
				ctx.application1.id,
				roleName,
			);
	});

	describe('[read operations]', function () {
		describe('balena.models.team.applicationAccess.get()', function () {
			it('should return a team application access', async function () {
				const accesses = await balena.models.team.applicationAccess.get(
					ctx.teamApplicationAccessRead.id,
				);
				expect(accesses).to.deep.equal(ctx.teamApplicationAccessRead);
			});
			it('should be rejected if the team application access does not exist', function () {
				const promise = balena.models.team.applicationAccess.get(999999);
				expect(promise).to.be.rejectedWith('Team application access not found');
			});
		});
		describe('balena.models.team.applicationAccess.getAllByTeam()', function () {
			it('should return an array with one team application access', async function () {
				const accesses =
					await balena.models.team.applicationAccess.getAllByTeam(ctx.team.id);
				expect(accesses).to.deep.equal([ctx.teamApplicationAccessRead]);
			});
			it('should return an empty array with one team application access', async function () {
				const accesses =
					await balena.models.team.applicationAccess.getAllByTeam(ctx.team.id);
				expect(accesses).to.deep.equal([ctx.teamApplicationAccessRead]);
			});
			it('should be rejected if the team does not exist', function () {
				const promise =
					balena.models.team.applicationAccess.getAllByTeam(999999);
				expect(promise).to.be.rejectedWith('Team not found: 999999');
			});
		});
	});

	describe('[write operations]', function () {
		describe('balena.models.team.applicationAccess.add()', function () {
			it('should add an application access to a team', async function () {
				const roleName = 'developer';
				ctx.teamApplicationAccessWrite =
					await balena.models.team.applicationAccess.add(
						ctx.team.id,
						ctx.application2.id,
						roleName,
					);

				expect(ctx.teamApplicationAccessWrite)
					.to.have.property('team')
					.that.deep.equals({
						__id: ctx.team.id,
					});
				expect(ctx.teamApplicationAccessWrite)
					.to.have.property('grants_access_to__application')
					.that.deep.equals({ __id: ctx.application2.id });
			});
			it('should be rejected if the application does not exist', function () {
				const roleName = 'developer';
				const promise = balena.models.team.applicationAccess.add(
					ctx.team.id,
					999999,
					roleName,
				);

				expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaApplicationNotFound',
				);
			});
			it('should be rejected if the role name does not exist', function () {
				const roleName = 'randomName';
				const promise = balena.models.team.applicationAccess.add(
					ctx.team.id,
					ctx.application2.id,
					// @ts-expect-error -- we are testing a failing case
					roleName,
				);

				expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaApplicationMembershipRoleNotFound',
				);
			});
		});

		describe('balena.models.team.applicationAccess.update()', function () {
			it('should update the role of a team application access', async function () {
				const newRoleName = 'observer';
				await balena.models.team.applicationAccess.update(
					ctx.teamApplicationAccessWrite.id,
					newRoleName,
				);

				const roleId = (
					await balena.pine.get({
						resource: 'application_membership_role',
						id: {
							name: newRoleName as ApplicationMembershipRoles,
						},
						options: {
							$select: 'id',
						},
					})
				)?.id;

				const updatedAccess = await balena.models.team.applicationAccess.get(
					ctx.teamApplicationAccessWrite.id,
				);
				expect(updatedAccess)
					.to.have.property('application_membership_role')
					.that.deep.equals({ __id: roleId });
			});
			it('should be rejected if the role name does not exist', function () {
				const roleName = 'randomName';
				const promise = balena.models.team.applicationAccess.update(
					ctx.teamApplicationAccessWrite.id,
					// @ts-expect-error -- we are testing a failing case
					roleName,
				);

				expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaApplicationMembershipRoleNotFound',
				);
			});
		});

		describe('balena.models.team.applicationAccess.remove()', function () {
			it('should remove a team application access', async function () {
				await Promise.all(
					[ctx.teamApplicationAccessRead, ctx.teamApplicationAccessWrite].map(
						(team) => balena.models.team.applicationAccess.remove(team.id),
					),
				);

				const promise = balena.models.team.applicationAccess.getAllByTeam(
					ctx.team.id,
				);
				expect(promise).to.become([]);
			});
		});
	});
});
