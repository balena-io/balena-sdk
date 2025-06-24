import type { OptionsToResponse } from 'pinejs-client-core';
import type { Device, ImageInstall } from '..';
import type { Mutable } from '../../typings/utils';

export interface CurrentService {
	commit: string;
	raw_version: string;
	release_id: number;
	id: number;
	image_id: number;
	service_id: number;
	download_progress: number | null;
	status: string;
	install_date: string;
}

// Pine expand options necessary for getting raw service data for a device
export const getCurrentServiceDetailsPineExpand = {
	image_install: {
		$select: ['id', 'download_progress', 'status', 'install_date'],
		$filter: {
			status: {
				$ne: 'deleted',
			},
		},
		$expand: {
			installs__image: {
				$select: ['id'],
				$expand: {
					is_a_build_of__service: {
						$select: ['id', 'service_name'],
					},
				},
			},
			is_provided_by__release: {
				$select: ['id', 'commit', 'raw_version'],
			},
		},
	},
} as const;

export type DeviceWithServiceDetails = OptionsToResponse<
	Device['Read'],
	{ $expand: typeof getCurrentServiceDetailsPineExpand },
	undefined
>[number] & {
	current_services: {
		[serviceName: string]: CurrentService[];
	};
};

interface WithServiceName {
	service_name: string;
}

function getSingleInstallSummary(
	rawData: OptionsToResponse<
		ImageInstall['Read'],
		typeof getCurrentServiceDetailsPineExpand.image_install,
		undefined
	>[number],
): CurrentService & WithServiceName {
	const image = rawData.installs__image[0];
	const service = image.is_a_build_of__service[0];

	const release = rawData.is_provided_by__release[0];
	const releaseInfo = {
		commit: release?.commit,
		raw_version: release?.raw_version,
		release_id: release?.id,
	};

	const result: CurrentService &
		Partial<
			Mutable<
				Pick<typeof rawData, 'installs__image' | 'is_provided_by__release'>
			>
		> &
		WithServiceName = {
		...rawData,
		service_id: service.id,
		// add this extra property to make grouping the services easier
		service_name: service.service_name,
		image_id: image.id,
		...releaseInfo,
	};

	if ('installs__image' in result) {
		delete result.installs__image;
	}
	if ('is_provided_by__release' in result) {
		delete result.is_provided_by__release;
	}

	return result;
}

export const generateCurrentServiceDetails = (
	rawDevice: OptionsToResponse<
		Device['Read'],
		{ $expand: typeof getCurrentServiceDetailsPineExpand },
		undefined
	>[number],
): DeviceWithServiceDetails => {
	const installs = rawDevice.image_install.map(getSingleInstallSummary);

	// Essentially a groupBy(installs, 'service_name')
	// but try making it a bit faster for the sake of large fleets.
	// Uses Object.create(null) so that there are no inherited properties
	// which could match service names
	const currentServicesGroupedByName: Record<string, CurrentService[]> =
		Object.create(null);
	for (const containerWithServiceName of installs) {
		const { service_name } = containerWithServiceName;
		let serviceContainerGroup: CurrentService[];
		if (currentServicesGroupedByName[service_name] == null) {
			serviceContainerGroup = [];
			currentServicesGroupedByName[service_name] = serviceContainerGroup;
		} else {
			serviceContainerGroup = currentServicesGroupedByName[service_name];
		}

		const container: CurrentService & Partial<WithServiceName> =
			containerWithServiceName;

		// remove the extra property that we added for the grouping
		delete container.service_name;
		serviceContainerGroup.push(container);
	}

	for (const serviceName in currentServicesGroupedByName) {
		if (currentServicesGroupedByName[serviceName]) {
			currentServicesGroupedByName[serviceName].sort((a, b) => {
				return b.install_date.localeCompare(a.install_date);
			});
		}
	}

	const device = rawDevice as DeviceWithServiceDetails;
	device.current_services = currentServicesGroupedByName;
	return device;
};
