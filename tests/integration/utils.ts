import { balena } from './setup';

export const getInitialOrganization = async () => {
	const [org] = await balena.pine.get({
		resource: 'organization',
		options: {
			$select: ['id', 'handle'],
			$filter: {
				handle: await balena.auth.whoami(),
			},
		},
	});

	return org;
};
