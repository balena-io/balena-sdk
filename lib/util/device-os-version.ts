import bSemver = require('balena-semver');
import type * as BalenaSdk from '../..';
import { isProvisioned } from './device';

export const normalizeDeviceOsVersion = (
	device: Partial<
		Pick<BalenaSdk.Device, 'os_version'> & Parameters<typeof isProvisioned>[0]
	>,
) => {
	if (
		device.os_version != null &&
		device.os_version.length === 0 &&
		isProvisioned(device)
	) {
		device.os_version = 'Resin OS 1.0.0-pre';
	}
};

export const getDeviceOsSemverWithVariant = ({
	os_version,
	os_variant,
}: Pick<BalenaSdk.Device, 'os_version' | 'os_variant'>): string | null => {
	if (!os_version) {
		return null;
	}

	const versionInfo = bSemver.parse(os_version);
	if (!versionInfo) {
		return null;
	}

	let { version } = versionInfo;
	const build = versionInfo.build.slice();
	if (
		os_variant &&
		![...build, ...versionInfo.prerelease].includes(os_variant)
	) {
		build.push(os_variant);
	}

	if (build.length > 0) {
		version = `${version}+${build.join('.')}`;
	}

	return version;
};
