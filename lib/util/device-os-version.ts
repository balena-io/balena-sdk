import bSemver = require('balena-semver');
import includes = require('lodash/includes');
import isEmpty = require('lodash/isEmpty');
import * as BalenaSdk from '../../typings/balena-sdk';
import { isProvisioned } from './device';

export const normalizeDeviceOsVersion = (device: BalenaSdk.Device) => {
	if (
		device.os_version != null &&
		isEmpty(device.os_version) &&
		isProvisioned(device)
	) {
		device.os_version = 'Resin OS 1.0.0-pre';
	}
};

export const getDeviceOsSemverWithVariant = ({
	os_version,
	os_variant,
}: Pick<BalenaSdk.Device, 'os_version' | 'os_variant'>) => {
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
		!includes([...build, ...versionInfo.prerelease], os_variant)
	) {
		build.push(os_variant);
	}

	if (!isEmpty(build)) {
		version = `${version}+${build.join('.')}`;
	}

	return version;
};
