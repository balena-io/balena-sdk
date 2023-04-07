import { Dictionary } from '../../typings/utils';
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

export const getFieldLabel = (field: string | { [key: string]: string }) =>
	typeof field === 'string'
		? field
		: `unique pair ${Object.keys(field).join(' & ')}`;

export const getParam = <T>(
	field: string | { [key: string]: string },
	resource: T,
) => {
	if (typeof field === 'object') {
		const param = {};
		const propertyEntries = Object.entries(field);
		for (const propertyEntry of propertyEntries) {
			param[propertyEntry[1]] = resource[propertyEntry[0]];
			if (typeof param[propertyEntry[1]] === 'object') {
				param[propertyEntry[1]] = param[propertyEntry[1]].__id;
			}
		}
		return param as Dictionary<unknown>;
	}

	return resource[field];
};
