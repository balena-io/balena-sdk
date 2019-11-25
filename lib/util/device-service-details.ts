import {
	CurrentGatewayDownload,
	CurrentService,
	Device,
	DeviceWithImageInstalls,
	DeviceWithServiceDetails,
	GatewayDownload,
	Image,
	ImageInstall,
	PineExpand,
	Release,
	Service,
} from '../../typings/balena-sdk';

// Pine expand options necessary for getting raw service data for a device
export const getCurrentServiceDetailsPineExpand = (expandRelease: boolean) => {
	const pineExpand: PineExpand<DeviceWithImageInstalls> = {
		image_install: {
			$select: ['id', 'download_progress', 'status', 'install_date'],
			$filter: {
				status: {
					$ne: 'deleted',
				},
			},
			$expand: {
				image: {
					$select: ['id'],
					$expand: {
						is_a_build_of__service: {
							$select: ['id', 'service_name'],
						},
					},
				},
				...(expandRelease && {
					is_provided_by__release: {
						$select: ['commit'],
					},
				}),
			},
		},
		gateway_download: {
			$select: ['id', 'download_progress', 'status'],
			$filter: {
				status: {
					$ne: 'deleted',
				},
			},
			$expand: {
				image: {
					$select: ['id'],
					$expand: {
						is_a_build_of__service: {
							$select: ['id', 'service_name'],
						},
					},
				},
			},
		},
	};

	return pineExpand;
};

interface WithServiceName {
	service_name: string;
}

function getSingleInstallSummary(
	rawData: ImageInstall,
): CurrentService & WithServiceName;
function getSingleInstallSummary(
	rawData: GatewayDownload,
): CurrentGatewayDownload & WithServiceName;
function getSingleInstallSummary(
	rawData: ImageInstall | GatewayDownload,
): (CurrentService | CurrentGatewayDownload) & WithServiceName {
	const image = (rawData.image as Image[])[0];
	const service = (image.is_a_build_of__service as Service[])[0];

	let releaseInfo: { commit?: string } = {};
	if (
		'is_provided_by__release' in rawData &&
		rawData.is_provided_by__release != null
	) {
		const release = (rawData.is_provided_by__release as Release[])[0];
		releaseInfo = {
			commit: release != null ? release.commit : undefined,
		};
	}

	// prefer over omit for performance reasons
	delete rawData.image;
	if ('is_provided_by__release' in rawData) {
		delete rawData.is_provided_by__release;
	}

	return Object.assign(
		rawData,
		{
			service_id: service.id,
			// add this extra property to make grouping the services easier
			service_name: service.service_name,
			image_id: image.id,
		},
		releaseInfo,
	);
}

export const generateCurrentServiceDetails = (
	rawDevice: DeviceWithImageInstalls,
): DeviceWithServiceDetails => {
	const installs = rawDevice.image_install!.map(ii =>
		getSingleInstallSummary(ii),
	);

	const downloads = rawDevice.gateway_download!.map(gd =>
		getSingleInstallSummary(gd),
	);

	// prefer over omit for performance reasons
	delete rawDevice.image_install;
	delete rawDevice.gateway_download;

	const device = (rawDevice as Device) as DeviceWithServiceDetails;

	// Essentially a groupBy(installs, 'service_name')
	// but try making it a bit faster for the sake of large fleets.
	// Uses Object.create(null) so that there are no inherited properties
	// which could match service names
	const currentServicesGroupedByName: Record<
		string,
		CurrentService[]
	> = Object.create(null);
	for (const container of installs) {
		const { service_name } = container;
		let serviceContainerGroup: CurrentService[];
		if (currentServicesGroupedByName[service_name] == null) {
			serviceContainerGroup = [];
			currentServicesGroupedByName[service_name] = serviceContainerGroup;
		} else {
			serviceContainerGroup = currentServicesGroupedByName[service_name];
		}

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

	device.current_services = currentServicesGroupedByName;
	device.current_gateway_downloads = downloads;
	return device;
};
