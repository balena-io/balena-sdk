import type { Expand } from 'pinejs-client-core';
import type { Device, Image, ImageInstall, Release, Service } from '..';

export interface CurrentService {
	id: number;
	image_id: number;
	service_id: number;
	download_progress: number | null;
	status: string;
	install_date: string;
}

export interface CurrentServiceWithCommit extends CurrentService {
	commit: string;
	raw_version: string;
	release_id: number;
}

export type DeviceWithServiceDetails<
	TCurrentService extends CurrentService = CurrentService,
> = Device['Read'] & {
	current_services: {
		[serviceName: string]: TCurrentService[];
	};
};

// Pine expand options necessary for getting raw service data for a device
export const getCurrentServiceDetailsPineExpand = (
	expandRelease: boolean,
): Readonly<Expand<Device['Read']>> => {
	return {
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
				...(expandRelease && {
					is_provided_by__release: {
						$select: ['id', 'commit', 'raw_version'],
					},
				}),
			},
		},
	};
};

interface WithServiceName {
	service_name: string;
}

function getSingleInstallSummary(
	rawData: ImageInstall['Read'],
): CurrentService & WithServiceName {
	const image = (rawData.installs__image as Array<Image['Read']>)[0];
	const service = (image.is_a_build_of__service as Array<Service['Read']>)[0];

	let releaseInfo: {
		commit?: string;
		raw_version?: string;
		release_id?: number;
	} = {};
	if (
		'is_provided_by__release' in rawData &&
		rawData.is_provided_by__release != null
	) {
		const release = (
			rawData.is_provided_by__release as Array<Release['Read']>
		)[0];
		releaseInfo = {
			commit: release?.commit,
			raw_version: release?.raw_version,
			release_id: release?.id,
		};
	}

	const result: CurrentService &
		Partial<
			Pick<ImageInstall['Read'], 'installs__image' | 'is_provided_by__release'>
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

export const generateCurrentServiceDetails = <
	TCurrentService extends CurrentService = CurrentService,
>(
	rawDevice: Device['Read'],
): DeviceWithServiceDetails<TCurrentService> => {
	const installs = rawDevice.image_install!.map((ii) =>
		getSingleInstallSummary(ii),
	) as Array<TCurrentService & WithServiceName>;

	// Essentially a groupBy(installs, 'service_name')
	// but try making it a bit faster for the sake of large fleets.
	// Uses Object.create(null) so that there are no inherited properties
	// which could match service names
	const currentServicesGroupedByName: Record<string, TCurrentService[]> =
		Object.create(null);
	for (const containerWithServiceName of installs) {
		const { service_name } = containerWithServiceName;
		let serviceContainerGroup: TCurrentService[];
		if (currentServicesGroupedByName[service_name] == null) {
			serviceContainerGroup = [];
			currentServicesGroupedByName[service_name] = serviceContainerGroup;
		} else {
			serviceContainerGroup = currentServicesGroupedByName[service_name];
		}

		const container: TCurrentService & Partial<WithServiceName> =
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

	const device = rawDevice as DeviceWithServiceDetails<TCurrentService>;
	device.current_services = currentServicesGroupedByName;
	return device;
};
