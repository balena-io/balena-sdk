import * as m from 'mochainon';
import { describeExpandAssertions } from '../util_ts';
import {
	balena,
	BalenaSdk,
	givenAnApplication,
	givenLoggedInUser,
} from './setup';
const { expect } = m.chai;

describe('arbitrary pine requests', function () {
	givenLoggedInUser(before);
	givenAnApplication(before);

	describeExpandAssertions<BalenaSdk.Application>({
		resource: 'application',
		options: {
			$expand: {
				organization: {},
				// includes__user: {},
				user__is_member_of__application: {},
				// is_accessible_by__team: {},
				team_application_access: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.ApplicationMembership>({
		resource: 'user__is_member_of__application',
		options: {
			$expand: {
				user: {},
				// application: {},
				is_member_of__application: {},
				application_membership_role: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.User>({
		resource: 'user',
		options: {
			$expand: {
				// includes__organization_membership: {},
				organization_membership: {},
				// is_member_of__application: {},
				// user_application_membership: {},
				user__is_member_of__application: {},
				// is_member_of__team: {},
				team_membership: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.Organization>({
		resource: 'organization',
		options: {
			$expand: {
				application: {},
				organization_membership: {},
				// includes__organization_membership: {},
				owns__team: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.OrganizationMembership>({
		resource: 'organization_membership',
		options: {
			$expand: {
				user: {},
				// organization: {},
				is_member_of__organization: {},
				organization_membership_role: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.TeamMembership>({
		resource: 'team_membership',
		options: {
			$expand: {
				user: {},
				// team: {},
				is_member_of__team: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.Team>({
		resource: 'team',
		options: {
			$expand: {
				belongs_to__organization: {},
				// includes__user: {},
				team_membership: {},
				// grants_access_to__application: {},
				team_application_access: {},
			},
		},
	});

	describeExpandAssertions<BalenaSdk.TeamApplicationAccess>({
		resource: 'team_application_access',
		options: {
			$expand: {
				team: {},
				// application: {},
				grants_access_to__application: {},
				application_membership_role: {},
			},
		},
	});
});
