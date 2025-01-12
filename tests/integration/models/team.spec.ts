import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { timeSuite } from '../../util';
import {
	balena,
	givenInitialOrganization,
	givenLoggedInUser,
	TEST_TEAM_NAME,
} from '../setup';
import { getInitialOrganization } from '../utils';

describe('Team model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	const ctx: Partial<{
		newTeam1: any;
		newTeam2: any;
		initialOrganization: any;
	}> = {};

	before(async function () {
		ctx.initialOrganization = await getInitialOrganization();
	});

	describe('given an organization without teams', function () {
		describe('[read operations]', function () {
			describe('balena.models.team.getAllByOrganization()', function () {
				it('should return empty array of teams', async function () {
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
					);
					expect(teams).to.deep.equal([]);
				});
				it('should be rejected if the organization does not exist', function () {
					const promise = balena.models.team.getAllByOrganization(999999);
					expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaOrganizationNotFound',
					);
				});
			});
		});
		describe('[write operations]', function () {
			describe('balena.models.team.create()', function () {
				for (const [index, propName] of ['id', 'handle'].entries()) {
					it(`should be able to create a new team, using organization ${propName}`, async function () {
						const teamName = `${TEST_TEAM_NAME}_${Date.now()}_${propName}`;
						const team = await balena.models.team.create(
							ctx.initialOrganization[propName],
							teamName,
						);
						ctx[`newTeam${index + 1}`] = team;
						expect(team).to.have.property('name', teamName);
					});
				}
			});
			describe('balena.models.team.rename()', function () {
				it('should be rejected if the team does not exists', function () {
					const promise = balena.models.team.rename(
						999999,
						`${TEST_TEAM_NAME}_new_rename`,
					);
					expect(promise).to.be.rejectedWith(`Team not found: 999999`);
				});
			});
		});
	});
	describe('given an organization with teams', function () {
		describe('[read operations]', function () {
			parallel('balena.models.team.getAllByOrganization()', function () {
				it('should return an array containing 2 teams', async function () {
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
						{
							$select: 'id',
							$orderby: 'created_at asc',
						},
					);
					expect(teams.map((team) => team.id)).to.have.members([
						ctx.newTeam1.id,
						ctx.newTeam2.id,
					]);
				});
				it('should support arbitrary pinejs options', async function () {
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
						{ $expand: { belongs_to__organization: { $select: 'handle' } } },
					);
					expect(teams[0].belongs_to__organization[0].handle).to.equal(
						ctx.initialOrganization.handle,
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
						ctx.initialOrganization.handle,
					);
				});
			});
		});
		describe('[write operations]', function () {
			parallel('balena.models.team.rename()', function () {
				it('should be able to rename an existing team', async function () {
					const newName = `${TEST_TEAM_NAME}_new_rename`;
					await balena.models.team.rename(ctx.newTeam1.id, newName);
					const team = await balena.models.team.get(ctx.newTeam1.id);
					expect(team.name).to.equal(newName);
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
					await Promise.all(
						[ctx.newTeam1.id, ctx.newTeam2.id].map((item) =>
							balena.models.team.remove(item),
						),
					);
					const teams = await balena.models.team.getAllByOrganization(
						ctx.initialOrganization.id,
					);
					expect(teams).to.be.of.length(0);
				});
			});
		});
	});
});
