// copied from the @resin-io/device-types
// because that has the run-time dependency on coffee-script

const find = <T>(array: T[], predicate: (el: T) => boolean) => {
	for (const el of array) {
		if (predicate(el)) {
			return el;
		}
	}
};

const includes = <T>(array: T[], el: T) => array && array.indexOf(el) >= 0;

const dtPredicate = (slug: string) => (deviceType: DeviceType) =>
	deviceType.slug === slug || includes(deviceType.aliases, slug);

export const findBySlug = (deviceTypes: DeviceType[], slug: string) =>
	find(deviceTypes, dtPredicate(slug));

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
