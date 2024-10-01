import * as bSemver from 'balena-semver';
import type * as BalenaSdk from '..';

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

/**
 * @summary Ensure version compatibility using balena-semver
 * @name ensureVersionCompatibility
 * @private
 * @function
 *
 * @param {String} version - version under check
 * @param {String} minVersion - minimum accepted version
 * @throws {Error} Will reject if the given version is < than the given minimum version
 * @returns {void}
 *
 * @example
 * ensureVersionCompatibility(version, MIN_VERSION)
 * console.log('Is compatible');
 *
 */
export const ensureVersionCompatibility = function (
	version: string | null,
	minVersion: string,
	versionType: 'supervisor' | 'host OS',
): void {
	if (version && bSemver.lt(version, minVersion)) {
		throw new Error(
			`Incompatible ${versionType} version: ${version} - must be >= ${minVersion}`,
		);
	}
};
