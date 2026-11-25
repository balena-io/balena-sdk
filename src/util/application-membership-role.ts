import * as errors from 'balena-errors';
import type { InjectedDependenciesParam } from '..';

// Names are unique among default roles and, separately, per org among custom ones, so a custom
// role can share a name with a default one: in that case the default role wins.
export const getApplicationMembershipRoleId = async (
	{ pine }: Pick<InjectedDependenciesParam, 'pine'>,
	roleName: string,
	organizationId: number,
) => {
	const roles = await pine.get({
		resource: 'application_membership_role',
		options: {
			$select: ['id', 'belongs_to__organization'],
			$filter: {
				name: roleName,
				$or: [
					{ belongs_to__organization: null },
					{ belongs_to__organization: organizationId },
				],
			},
		},
	});
	const role =
		roles.find((r) => r.belongs_to__organization == null) ?? roles[0];
	if (!role) {
		throw new errors.BalenaApplicationMembershipRoleNotFound(roleName);
	}
	return role.id;
};
