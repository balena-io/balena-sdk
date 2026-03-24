// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import type { Dictionary } from '../../typings/utils';
import { balena } from './setup';

export const getInitialOrganization = async () => {
	const whoamiResult = await balena.auth.whoami();

	if (whoamiResult?.actorType === 'user') {
		const [org] = await balena.pine.get({
			resource: 'organization',
			options: {
				$select: ['id', 'handle'],
				$filter: {
					handle: whoamiResult.username,
				},
			},
		});

		return org;
	}

	throw new Error('Organization can only be filtered with user api key');
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

export const pickCurrentServicesByAppDetails = (
	device: Awaited<
		ReturnType<typeof balena.models.device.getWithServiceDetails>
	>,
	pickProps = [
		'id',
		'service_id',
		'image_id',
		'commit',
		'status',
		'download_progress',
	],
) => ({
	current_services_by_app: Object.fromEntries(
		Object.entries(device.current_services_by_app).map(
			([appSlug, detailsByService]) => [
				appSlug,
				Object.fromEntries(
					Object.entries(detailsByService).map(
						([serviceName, serviceInfos]) => [
							serviceName,
							serviceInfos.map((s) => _.pick(s, pickProps)),
						],
					),
				),
			],
		),
	),
});
