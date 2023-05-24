import type * as BalenaSdk from '..';
import type * as DeviceState from '../types/device-state';

export const isProvisioned = (
	device: Partial<
		Pick<BalenaSdk.Device, 'supervisor_version' | 'last_connectivity_event'>
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
	for (const device of Object.keys(targetState)) {
		for (const app of Object.keys(targetState[device].apps)) {
			for (const release of Object.keys(
				targetState[device].apps[app].releases,
			)) {
				for (const service of Object.keys(
					targetState[device].apps[app].releases[release].services,
				)) {
					images.push(
						targetState[device].apps[app].releases[release].services[service]
							.image,
					);
				}
			}
		}
	}

	return images;
};
