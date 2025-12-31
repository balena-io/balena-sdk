import * as bSemver from 'balena-semver';
import type { Device } from '..';
import type { AtLeast } from '../../typings/utils';
import { isProvisioned } from './device';

const LOCAL_MODE_MIN_OS_VER = '2.0.0';
const LOCAL_MODE_MIN_SUPERVISOR_VER = '4.0.0';

export const LOCAL_MODE_ENV_VAR = 'RESIN_SUPERVISOR_LOCAL_MODE';

export const LOCAL_MODE_SUPPORT_PROPERTIES = [
	'os_version',
	'os_variant',
	'supervisor_version',
	'last_vpn_event',
] as const;

export const checkLocalModeSupported = (
	device: Pick<Device['Read'], (typeof LOCAL_MODE_SUPPORT_PROPERTIES)[number]>,
): void => {
	if (!isProvisioned(device)) {
		throw new Error('Device is not yet fully provisioned');
	}

	if (!bSemver.gte(device.os_version, LOCAL_MODE_MIN_OS_VER)) {
		throw new Error('Device OS version does not support local mode');
	}

	if (!bSemver.gte(device.supervisor_version, LOCAL_MODE_MIN_SUPERVISOR_VER)) {
		throw new Error('Device supervisor version does not support local mode');
	}

	if (device.os_variant !== 'dev') {
		throw new Error('Local mode is only supported on development OS versions');
	}
};

export const getLocalModeSupport = (
	device: AtLeast<
		Device['Read'],
		(typeof LOCAL_MODE_SUPPORT_PROPERTIES)[number]
	>,
): {
	supported: boolean;
	message: string;
} => {
	try {
		checkLocalModeSupported(device);
		return {
			supported: true,
			message: 'Supported',
		};
	} catch (err) {
		return {
			supported: false,
			message: err.message,
		};
	}
};
