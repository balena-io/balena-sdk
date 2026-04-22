import { expect } from 'chai';
import { expectError, timeSuite } from '../../util';
import {
	balena,
	credentials,
	givenInitialOrganization,
	givenLoggedInUser,
} from '../setup';
import type * as BalenaSdk from '../../../';

describe('Team Membership Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	let testTeam: BalenaSdk.Team['Read'];

	before(async function () {
		const userInfoResult = await balena.auth.getUserInfo();
		this.userId = userInfoResult.id;
		this.username = userInfoResult.username;

		testTeam = await balena.models.team.create(
			this.initialOrg.id,
			`TestTeam_${Date.now()}`,
		);
		this.teamId = testTeam.id;
	});

	after(async function () {
		await balena.models.team.remove(testTeam.id);
	});

	describe('balena.models.team.membership.getAllByTeam()', function () {
		it('should return empty array for a team with no members', async function () {
			const memberships = await balena.models.team.membership.getAllByTeam(
				this.teamId,
			);
			expect(memberships).to.deep.equal([]);
		});
	});

	describe('given a team with a member', function () {
		let membership: BalenaSdk.TeamMembership['Read'];

		before(async function () {
			membership = await balena.models.team.membership.create({
				team: this.teamId,
				username: credentials.username,
			});
			this.membershipId = membership.id;
		});

		after(async function () {
			await balena.models.team.membership.remove(membership.id);
		});

		describe('balena.models.team.membership.get()', function () {
			it('should return the team membership', async function () {
				const result = await balena.models.team.membership.get(
					this.membershipId,
					{
						$select: ['id', 'user', 'is_member_of__team'],
					},
				);
				expect(result).to.deep.equal({
					id: this.membershipId,
					user: { __id: this.userId },
					is_member_of__team: { __id: this.teamId },
				});
			});

			it('should reject when the team membership is not found', async function () {
				await expectError(async () => {
					await balena.models.team.membership.get(
						Math.floor(Date.now() / 1000),
					);
				}, 'Team Membership not found');
			});
		});

		describe('balena.models.team.membership.getAllByTeam()', function () {
			it('should return the team memberships', async function () {
				const memberships = await balena.models.team.membership.getAllByTeam(
					this.teamId,
					{
						$select: ['id', 'user'],
					},
				);
				expect(memberships).to.deep.equal([
					{
						id: this.membershipId,
						user: { __id: this.userId },
					},
				]);
			});

			it('should support arbitrary pinejs options', async function () {
				const memberships = await balena.models.team.membership.getAllByTeam(
					this.teamId,
					{
						$select: 'id',
						$expand: {
							user: {
								$select: 'username',
							},
						},
					},
				);
				expect(memberships).to.deep.equal([
					{
						id: this.membershipId,
						user: [{ username: this.username }],
					},
				]);
			});
		});

		describe('balena.models.team.membership.getAllByUser()', function () {
			for (const prop of ['userId', 'username'] as const) {
				it(`should return only the user's team memberships by ${prop}`, async function () {
					const memberships = await balena.models.team.membership.getAllByUser(
						this[prop],
						{
							$select: ['user', 'is_member_of__team'],
						},
					);
					expect(memberships).to.deep.equal([
						{
							user: { __id: this.userId },
							is_member_of__team: { __id: this.teamId },
						},
					]);
				});
			}

			it('should return empty array for a user that is not a member', async function () {
				const memberships =
					await balena.models.team.membership.getAllByUser('nonexistent_user');
				expect(memberships).to.deep.equal([]);
			});
		});

		describe('balena.models.team.membership.remove()', function () {
			it('should be able to remove a team membership', async function () {
				await balena.models.team.membership.remove(this.membershipId);

				await expectError(async () => {
					await balena.models.team.membership.get(this.membershipId);
				}, 'Team Membership not found');
			});

			it('should be able to remove multiple team memberships', async function () {
				const membership1 = await balena.models.team.membership.create({
					team: this.teamId,
					username: credentials.username,
				});
				// Create another team for the second membership
				const testTeam2 = await balena.models.team.create(
					this.initialOrg.id,
					`TestTeam2_${Date.now()}`,
				);
				const membership2 = await balena.models.team.membership.create({
					team: testTeam2.id,
					username: credentials.username,
				});

				await balena.models.team.membership.remove([
					membership1.id,
					membership2.id,
				]);

				await expectError(async () => {
					await balena.models.team.membership.get(membership1.id);
				}, 'Team Membership not found');

				await expectError(async () => {
					await balena.models.team.membership.get(membership2.id);
				}, 'Team Membership not found');

				// Clean up the second team
				await balena.models.team.remove(testTeam2.id);
			});
		});
	});

	describe('balena.models.team.membership.create()', function () {
		it('should be able to add a user to a team', async function () {
			const membership = await balena.models.team.membership.create({
				team: this.teamId,
				username: credentials.username,
			});

			expect(membership).to.be.an('object');
			expect(membership).to.have.property('id').that.is.a('number');
			expect(membership).to.have.nested.property(
				'is_member_of__team.__id',
				this.teamId,
			);

			await balena.models.team.membership.remove(membership.id);
		});
	});
});
