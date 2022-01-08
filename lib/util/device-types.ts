import type { Dictionary } from '../../typings/utils';

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
): boolean => {
	const compatibleArches = archCompatibilityMap[osArchitecture];
	return (
		osArchitecture === applicationArchitecture ||
		(Array.isArray(compatibleArches) &&
			compatibleArches.includes(applicationArchitecture))
	);
};
