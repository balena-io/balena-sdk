import { balena } from './setup';
import BalenaSdk = require('../..');

export const getInitialOrganization = async () => {
	const [org] = await balena.pine.get<BalenaSdk.Organization>({
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
