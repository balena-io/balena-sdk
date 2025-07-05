import type * as DeviceState from '../types/device-state';
import type { Device } from '../types/models';

export const isProvisioned = (
	device: Partial<
		Pick<Device['Read'], 'supervisor_version' | 'last_connectivity_event'>
	>,
) => {
	return (
		device.supervisor_version != null &&
		device.supervisor_version.length > 0 &&
		device.last_connectivity_event != null
	);
};

/**
 *
 * @param targetState
 * @returns array containing all images for all services for all releases for all apps for the device
 */
export const listImagesFromTargetState = (
	targetState: DeviceState.DeviceStateV3,
): string[] => {
	const images: string[] = [];
	// list apps keys
	for (const device of Object.values(targetState)) {
		for (const app of Object.values(device.apps)) {
			for (const release of Object.values(app.releases)) {
				for (const service of Object.values(release.services)) {
					images.push(service.image);
				}
			}
		}
	}

	return images;
};
