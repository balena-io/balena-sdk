import * as errors from 'balena-errors';
import { DeviceTypeJson } from '../../typings/balena-sdk';
import { Dictionary } from '../../typings/utils';

type DeviceType = DeviceTypeJson.DeviceType;

// copied from the @resin-io/device-types
// because that has the run-time dependency on coffee-script

const find = <T>(array: T[], predicate: (el: T) => boolean) => {
	for (const el of array) {
		if (predicate(el)) {
			return el;
		}
	}
};

const includes = <T>(array: T[] | undefined, el: T) =>
	array != null && array.indexOf(el) >= 0;

const dtPredicate = (slug: string) => (deviceType: DeviceType) =>
	deviceType.slug === slug || includes(deviceType.aliases, slug);

export const findBySlug = (deviceTypes: DeviceType[], slug: string) =>
	find(deviceTypes, dtPredicate(slug));

export const getBySlug = (deviceTypes: DeviceType[], slug: string) => {
	const deviceType = findBySlug(deviceTypes, slug);
	if (!deviceType) {
		throw new errors.BalenaInvalidDeviceType('No such device type');
	}

	return deviceType;
};

export const normalizeDeviceType = (
	deviceTypes: DeviceType[],
	slug: string,
) => {
	// returns `undefined` in case of invalid slug
	const deviceType = findBySlug(deviceTypes, slug);
	if (deviceType) {
		return deviceType.slug;
	}
};

/**
 * device/os architectures that show in the keys are also able to
 * run app containers compiled for the architectures in the values
 * @private
 */
const archCompatibilityMap: Partial<Dictionary<string[]>> = {
	aarch64: ['armv7hf', 'rpi'],
	armv7hf: ['rpi'],
};

export const isOsArchitectureCompatibleWith = (
	osArchitecture: string,
	applicationArchitecture: string,
) =>
	osArchitecture === applicationArchitecture ||
	includes(archCompatibilityMap[osArchitecture], applicationArchitecture);

export const isDeviceTypeCompatibleWith = (
	osDeviceType: DeviceType,
	targetAppDeviceType: DeviceType,
) =>
	isOsArchitectureCompatibleWith(osDeviceType.arch, targetAppDeviceType.arch) &&
	!!osDeviceType.isDependent === !!targetAppDeviceType.isDependent;
