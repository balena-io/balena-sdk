import groupBy = require('lodash/groupBy');
import mapValues = require('lodash/mapValues');
import omit = require('lodash/omit');
import {
	CurrentGatewayDownload,
	CurrentService,
	DeviceWithImageInstalls,
	DeviceWithServiceDetails,
	GatewayDownload,
	Image,
	ImageInstall,
	PineOptionsFor,
	Release,
	Service,
} from '../../typings/balena-sdk';

// Pine options necessary for getting raw service data for a device
export const getCurrentServiceDetailsPineOptions = (expandRelease: boolean) => {
	const pineOptions: PineOptionsFor<DeviceWithImageInstalls> = {
		$expand: {
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
							$select: ['id', 'commit'],
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
		},
	};

	return pineOptions;
};

function getSingleInstallSummary(rawData: ImageInstall): CurrentService;
function getSingleInstallSummary(
	rawData: GatewayDownload,
): CurrentGatewayDownload;
function getSingleInstallSummary(
	rawData: ImageInstall | GatewayDownload,
): CurrentService | CurrentGatewayDownload {
	const image = (rawData.image as Image[])[0];
	const service = (image.is_a_build_of__service as Service[])[0];

	let releaseInfo: { commit?: string } = {};
	if (
		'is_provided_by__release' in rawData &&
		rawData.is_provided_by__release != null
	) {
		const release = (rawData.is_provided_by__release as Release[])[0];
		releaseInfo = {
			commit: release != null ? release.commit : void 0,
		};
	}

	return Object.assign(
		omit(rawData, ['image', 'is_provided_by__release']) as
			| CurrentService
			| CurrentGatewayDownload,
		{
			service_id: service.id,
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

	const device = omit(rawDevice, [
		'image_install',
		'gateway_download',
	]) as DeviceWithServiceDetails;

	device.current_services = mapValues(
		groupBy(installs, 'service_name'),
		serviceContainers => {
			return serviceContainers
				.map(container => {
					return omit(container, 'service_name') as Omit<
						typeof container,
						'service_name'
					>;
				})
				.sort((a, b) => {
					return b.install_date.localeCompare(a.install_date);
				});
		},
	);
	device.current_gateway_downloads = downloads;
	return device;
};
