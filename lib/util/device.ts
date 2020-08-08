import type * as BalenaSdk from '../..';

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
