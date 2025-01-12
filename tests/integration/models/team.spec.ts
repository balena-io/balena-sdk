import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { timeSuite } from '../../util';
import {
	balena,
	givenATeam,
	givenInitialOrganization,
	givenLoggedInUser,
	TEST_TEAM_NAME,
} from '../setup';

describe('Team model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	let ctx: Mocha.Context;

	before(function () {
		ctx = this;
	});

	describe('given an organization without teams', function () {
		describe('[read operations]', function () {
			parallel('balena.models.team.getAllByOrganization()', function () {
				it('should return empty array of teams', async function () {
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
					);
					expect(teams).to.deep.equal([]);
				});
			});
		});
		describe('[write operations]', function () {
			parallel('balena.models.team.create()', function () {
				it('should be able to create a new team, using organization id', async function () {
					const team = await balena.models.team.create(
						ctx.initialOrganization.id,
						`${TEST_TEAM_NAME}_${Date.now()}`,
					);
					expect(team).to.have.property('name', ctx.testTeam1Name);
					ctx.newTeam1 = team;
				});
				it('should be able to create a new team, using organization handle', async function () {
					const team = await balena.models.team.create(
						ctx.initialOrganization.handle,
						`${TEST_TEAM_NAME}_${Date.now()}_2`,
					);
					expect(team).to.have.property('name', ctx.testTeam1Name);
					ctx.newTeam2 = team;
				});
			});
			describe('balena.models.team.create()', function () {
				it('should be rejected if the team name already exists', function () {
					const promise = balena.models.team.create(
						ctx.initialOrganization.id,
						ctx.newTeam1.name,
					);
					return expect(promise).to.be.rejectedWith(
						`A team with this name already exists in the organization. Organization: ${ctx.initialOrganization.id}, Name: ${ctx.newTeam1.name}`,
					);
				});
			});
			describe('balena.models.team.rename()', function () {
				it('should be rejected if the team does not exists', function () {
					const promise = balena.models.team.rename(
						999999,
						`new_rename_${TEST_TEAM_NAME}`,
					);
					return expect(promise).to.be.rejectedWith(`Team not found: 999999`);
				});
			});
			describe('balena.models.team.remove()', function () {
				it('should be rejected if the team does not exists', function () {
					const promise = balena.models.team.remove(999999);
					return expect(promise).to.be.rejectedWith(`Team not found: 999999`);
				});
			});
		});
	});
	describe('given an organization with teams', function () {
		givenATeam(before);
		describe('[read operations]', function () {
			parallel('balena.models.team.getAllByOrganization()', function () {
				it('should return an array containing 3 teams', async function () {
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
					);
					expect(teams).to.equal([ctx.team, ctx.newTeam1, ctx.newTeam2]);
				});
				it('should support arbitrary pinejs options', async function () {
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
						{ $expand: { belongs_to__organization: { $select: 'handle' } } },
					);
					expect(teams[0].belongs_to__organization[0].handle).to.equal(
						ctx.organization.handle,
					);
				});
			});
			parallel('balena.models.team.get()', function () {
				it('should return a specific team', async function () {
					const team = await balena.models.team.get(ctx.newTeam1.id);
					expect(team.id).to.equal(ctx.newTeam1.id);
				});
				it('should support arbitrary pinejs options', async function () {
					const team = await balena.models.team.get(ctx.newTeam1.id, {
						$expand: { belongs_to__organization: { $select: 'handle' } },
					});
					expect(team.belongs_to__organization[0].handle).to.equal(
						ctx.organization.handle,
					);
				});
			});
		});
		describe('[write operations]', function () {
			parallel('balena.models.team.rename()', function () {
				it('should be able to rename an existing team', async function () {
					await balena.models.team.rename(
						ctx.newTeam1.id,
						`new_rename_${TEST_TEAM_NAME}`,
					);
					const team = await balena.models.team.get(ctx.newTeam1.id);
					expect(team.name).to.equal(ctx.newTeam1.id);
				});
				it('should reject if another team has the same name', function () {
					const promise = balena.models.team.rename(
						ctx.newTeam1.id,
						ctx.newTeam2.name,
					);
					expect(promise).to.be.rejectedWith(
						`A team with this name already exists in the organization. Organization: ${ctx.initialOrganization.id}, Name: ${ctx.newTeam2.name}`,
					);
				});
			});
			parallel('balena.models.team.remove()', function () {
				it('should be able to remove all existing teams', async function () {
					await Promise.all([
						balena.models.team.remove(ctx.newTeam1.id),
						balena.models.team.remove(ctx.newTeam2.id),
					]);
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
					);
					expect(teams).to.be.of.length(1);
				});
				it('should reject if team does not exist', function () {
					const promise = balena.models.team.remove(999999);
					expect(promise).to.be.rejectedWith('Team not found: 999999');
				});
			});
		});
	});
});
