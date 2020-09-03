// tslint:disable-next-line:import-blacklist
import * as m from 'mochainon';
import { balena, givenInitialOrganization, givenLoggedInUser } from '../setup';
import type * as BalenaSdk from '../../..';
const { expect } = m.chai;
import { assertDeepMatchAndLength } from '../../util';
import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';
import type * as tagsHelper from './tags';

describe('Organization Membership Model', function () {
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	before(async function () {
		this.userId = await balena.auth.getUserId();
		this.orgAdminRole = await balena.pine.get<
			BalenaSdk.OrganizationMembershipRole
		>({
			resource: 'organization_membership_role',
			id: { name: 'administrator' },
			options: { $select: 'id' },
		});
		expect(this.orgAdminRole).to.be.an('object');
		expect(this.orgAdminRole).to.have.property('id').that.is.a('number');
	});

	describe('balena.models.organization.membership.getAll()', function () {
		it(`shoud return only the user's own membership [Promise]`, async function () {
			const memberships = await balena.models.organization.membership.getAll();

			assertDeepMatchAndLength(memberships, [
				{
					user: { __id: this.userId },
					is_member_of__organization: { __id: this.initialOrg.id },
					organization_membership_role: { __id: this.orgAdminRole.id },
				},
			]);
		});

		it(`shoud return only the user's own membership [callback]`, function (done) {
			balena.models.organization.membership.getAll(
				// @ts-expect-error
				(_err: Error, memberships: BalenaSdk.OrganizationMembership[]) => {
					try {
						assertDeepMatchAndLength(memberships, [
							{
								user: { __id: this.userId },
								is_member_of__organization: { __id: this.initialOrg.id },
								organization_membership_role: { __id: this.orgAdminRole.id },
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

	describe('balena.models.organization.membership.getAllByOrganization()', function () {
		it(`shoud return only the user's own membership`, async function () {
			const memberships = await balena.models.organization.membership.getAllByOrganization(
				this.initialOrg.id,
			);
			assertDeepMatchAndLength(memberships, [
				{
					user: { __id: this.userId },
					is_member_of__organization: { __id: this.initialOrg.id },
					organization_membership_role: { __id: this.orgAdminRole.id },
				},
			]);
		});
	});

	describe('balena.models.organization.membership.tags', function () {
		describe('[contained scenario]', function () {
			const orgTagTestOptions: tagsHelper.Options<BalenaSdk.OrganizationMembershipTag> = {
				model: balena.models.organization.membership
					.tags as tagsHelper.TagModelBase<BalenaSdk.OrganizationMembershipTag>,
				modelNamespace: 'balena.models.organization.membership.tags',
				resourceName: 'organization',
				uniquePropertyNames: ['handle'],
			};

			const orgMembershipTagTestOptions: tagsHelper.Options<BalenaSdk.OrganizationMembershipTag> = {
				model: balena.models.organization.membership
					.tags as tagsHelper.TagModelBase<BalenaSdk.OrganizationMembershipTag>,
				modelNamespace: 'balena.models.organization.membership.tags',
				resourceName: 'organization_membership',
				uniquePropertyNames: [],
			};

			before(async function () {
				const [
					membership,
				] = await balena.models.organization.membership.getAllByOrganization(
					this.initialOrg.id,
					{
						$filter: { user: this.userId },
					},
				);

				expect(membership).to.be.an('object');
				expect(membership).to.have.property('id').that.is.a('number');
				orgTagTestOptions.resourceProvider = () => this.initialOrg;
				// used for tag creation during the
				// device.tags.getAllByOrganization() test
				orgTagTestOptions.setTagResourceProvider = () => membership;
				orgMembershipTagTestOptions.resourceProvider = () => membership;

				// Clear all tags, since this is not a fresh organization
				await balena.pine.delete({
					resource: 'organization_membership_tag',
					options: {
						$filter: { 1: 1 },
					},
				});
			});

			itShouldSetGetAndRemoveTags(orgMembershipTagTestOptions);

			describe('balena.models.organization.membership.tags.getAllByOrganization()', () =>
				itShouldGetAllTagsByResource(orgTagTestOptions));

			describe('balena.models.organization.membership.tags.getAllByOrganizationMembership()', () =>
				itShouldGetAllTagsByResource(orgMembershipTagTestOptions));
		});
	});
});
