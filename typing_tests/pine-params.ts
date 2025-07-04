/// <reference types="node" />
import type { PickDeferred } from '@balena/abstract-sql-to-typescript';
import type * as BalenaSdk from '..';
import type { Compute, Equals } from './utils';
import { EqualsTrue } from './utils';

const sdk: BalenaSdk.BalenaSDK = {} as any;

export let aAny: any;
export let aNumber: number;
export let aNumberOrUndefined: number | undefined;
export let aString: string;
export let anArray: any[];
export let anUndefined: undefined;

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

// Object level typed result

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['device_name', 'uuid'],
			$expand: {
				belongs_to__application: {},
				device_tag: {},
			},
		},
	});

	const test: Equals<
		typeof result,
		Array<
			PickDeferred<BalenaSdk.Device['Read'], 'device_name' | 'uuid'> & {
				belongs_to__application: Array<
					PickDeferred<BalenaSdk.Application['Read']>
				>;
				device_tag: Array<PickDeferred<BalenaSdk.DeviceTag['Read']>>;
			}
		>
	> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		id: 1,
		options: {
			$select: ['device_name', 'uuid'],
			$expand: {
				belongs_to__application: {},
				device_tag: {},
			},
		},
	});
	const test: Equals<
		typeof result,
		| (PickDeferred<BalenaSdk.Device['Read'], 'device_name' | 'uuid'> & {
				belongs_to__application: Array<
					PickDeferred<BalenaSdk.Application['Read']>
				>;
				device_tag: Array<PickDeferred<BalenaSdk.DeviceTag['Read']>>;
		  })
		| undefined
	> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const fleetSlug = 'fleetSlug';
	const maybeRelease: string | null = '1.2.3';
	const maybeService: string | null = 'main';
	const result = await sdk.pine.get({
		resource: 'image',
		options: {
			$top: 1,
			$select: 'is_stored_at__image_location',
			$filter: {
				status: 'success',
				release_image: {
					$any: {
						$alias: 'ri',
						$expr: {
							ri: {
								is_part_of__release: {
									$any: {
										$alias: 'ipor',
										$expr: {
											ipor: {
												status: 'success' as const,
												belongs_to__application: {
													$any: {
														$alias: 'bta',
														$expr: {
															bta: {
																slug: fleetSlug,
															},
														},
													},
												},
												...(maybeRelease == null && {
													should_be_running_on__application: {
														$any: {
															$alias: 'sbroa',
															$expr: {
																sbroa: {
																	slug: fleetSlug,
																},
															},
														},
													},
												}),
											},
											$or: [
												{ ipor: { commit: maybeRelease } },
												{ ipor: { semver: maybeRelease, is_final: true } },
												{
													ipor: { raw_version: maybeRelease, is_final: false },
												},
											],
										},
									},
								},
							},
						},
					},
				},
				...(maybeService != null && {
					is_a_build_of__service: {
						$any: {
							$alias: 'iabos',
							$expr: {
								iabos: {
									service_name: maybeService,
								},
							},
						},
					},
				}),
			},
		},
	});
	const test: Equals<
		typeof result,
		Array<PickDeferred<BalenaSdk.Image['Read'], 'is_stored_at__image_location'>>
	> = EqualsTrue;
	console.log(result, test);
})();

// Fully Typed - auto-inferring result

await (async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.device_tag;
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		id: 1,
	});

	const checkUndefined: typeof result = undefined;
	console.log(checkUndefined);
	if (result === undefined) {
		throw new Error('Can be undefined');
	}

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.device_tag;
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		id: 1,
		options: {
			$select: ['id', 'device_name'],
		},
	});

	const checkUndefined: typeof result = undefined;
	console.log(checkUndefined);
	if (result === undefined) {
		throw new Error('Can be undefined');
	}

	aNumber = result.id;
	aString = result.device_name;

	// @ts-expect-error test case
	aString = result.os_version;
	// @ts-expect-error test case
	aAny = result.belongs_to__application;
	// @ts-expect-error test case
	aAny = result.device_tag;
})();

await (async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'is_of__device_type'],
			$expand: {
				is_pinned_on__release: {},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;

	// @ts-expect-error test case
	aString = result.os_version;
	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
})();

// $count

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$count: {},
		},
	});
	aNumber = result;
})();

await (async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'is_of__device_type'],
			$expand: {
				is_pinned_on__release: {
					$count: {},
				},
				device_tag: {},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumber = result.is_pinned_on__release;
	aNumber = result.device_tag[0]?.id;

	// @ts-expect-error test case
	aString = result.os_version;
	// @ts-expect-error test case
	aNumber = result.is_on__release.__id;
})();

await (async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'is_of__device_type'],
			$expand: {
				is_pinned_on__release: {},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aNumber = result.device_tag;

	// @ts-expect-error test case
	aString = result.os_version;
	// @ts-expect-error test case
	aNumber = result.is_on__release.__id;
})();

// Exceeding properties
await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		// TODO: this should error
		missplaced$filter: {},
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
		},
	});
	console.log(result);
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			// TODO: this should error
			$asdf: {},
		},
	});
	console.log(result);
})();

// Incorrect properties
await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			// @ts-expect-error - test case
			$select: ['id', 'device_name', 'belongs_to__application', 'asdf'],
		},
	});
	console.log(result);
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				is_pinned_on__release: {},
				// TODO: this should error
				asdf: {},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	console.log(result);
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: 'device_name',
			$filter: {
				device_tag: {
					$any: {
						$alias: 'dt',
						$expr: {
							dt: { tag_key: 'test' },
						},
					},
				},
			},
		},
	});
	const test: Equals<
		Compute<(typeof result)[number]>,
		{
			device_name: string;
		}
	> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: 'device_name',
			$filter: {
				device_tag: {
					$any: {
						$alias: 'dt',
						$expr: {
							1: 1,
						},
					},
				},
			},
		},
	});
	const test: Equals<
		Compute<(typeof result)[number]>,
		{
			device_name: string;
		}
	> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const fleetSlug = 'fleetSlug';
	const maybeRelease: string | null = '1.2.3';
	const result = await sdk.pine.get({
		resource: 'image',
		options: {
			$top: 1,
			$select: 'is_stored_at__image_location',
			$filter: {
				status: 'success',
				release_image: {
					$any: {
						$alias: 'ri',
						$expr: {
							ri: {
								is_part_of__release: {
									$any: {
										$alias: 'ipor',
										$expr: {
											ipor: {
												status: 'success' as const,
												belongs_to__application: {
													$any: {
														$alias: 'bta',
														$expr: {
															bta: {
																slug: fleetSlug,
															},
														},
													},
												},
												...(maybeRelease == null && {
													should_be_running_on__application: {
														$any: {
															$alias: 'sbroa',
															$expr: {
																sbroa: {
																	slug: fleetSlug,
																},
															},
														},
													},
												}),
											},
											$or: [
												{ ipor: { commit: maybeRelease } },
												{ ipor: { semver: maybeRelease, is_final: true } },
												{
													ipor: { raw_version: maybeRelease, is_final: false },
												},
											],
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});
	const test: Equals<
		Compute<(typeof result)[number]>,
		{
			is_stored_at__image_location: string;
		}
	> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const fleetSlug = 'string';
	const maybeRelease: string | null = '1.2.3';
	const maybeService: string | null = 'main';
	const result = await sdk.pine.get({
		resource: 'image',
		options: {
			$top: 1,
			$select: 'is_stored_at__image_location',
			$filter: {
				status: 'success',
				release_image: {
					$any: {
						$alias: 'ri',
						$expr: {
							ri: {
								is_part_of__release: {
									$any: {
										$alias: 'ipor',
										$expr: {
											ipor: {
												status: 'success' as const,
												belongs_to__application: {
													$any: {
														$alias: 'bta',
														$expr: {
															bta: {
																slug: fleetSlug,
															},
														},
													},
												},
												...(maybeRelease == null && {
													should_be_running_on__application: {
														$any: {
															$alias: 'sbroa',
															$expr: {
																sbroa: {
																	slug: fleetSlug,
																},
															},
														},
													},
												}),
											},
											...(maybeRelease != null && {
												$or: [
													{ ipor: { commit: maybeRelease } },
													{ ipor: { semver: maybeRelease, is_final: true } },
													{
														ipor: {
															raw_version: maybeRelease,
															is_final: false,
														},
													},
												],
											}),
										},
									},
								},
							},
						},
					},
				},
				...(maybeService != null && {
					is_a_build_of__service: {
						$any: {
							$alias: 'iabos',
							$expr: {
								iabos: {
									service_name: maybeService,
								},
							},
						},
					},
				}),
			},
		},
	});
	const test: Equals<
		Compute<(typeof result)[number]>,
		{
			is_stored_at__image_location: string;
		}
	> = EqualsTrue;
	console.log(result, test);
})();

// pine.post
await (async () => {
	// @ts-expect-error test case
	await sdk.pine.post({
		resource: 'application',
		body: {
			organization: 3,
			asdf: 4,
		},
	});
})();

await (async () => {
	const result = await sdk.pine.post({
		resource: 'application',
		body: {
			organization: 3,
		},
	});

	aNumber = result.id;
	aString = result.app_name;
	aNumber = result.organization.__id;
	aNumberOrUndefined = result.should_be_running__release?.__id;

	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.owns__device;
})();

await (async () => {
	// TODO: this should error
	await sdk.pine.post({
		resource: 'application',
	});
})();

await (async () => {
	const result = await sdk.pine.post({
		resource: 'application',
		body: {
			organization: 3,
		},
	});
	aNumber = result.id;
	aString = result.app_name;
	aNumber = result.organization.__id;
	aNumberOrUndefined = result.should_be_running__release?.__id;

	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.owns__device;
})();

await (async () => {
	// @ts-expect-error - test case
	const result = await sdk.pine.post({
		resource: 'application',
		body: {
			organization: 3,
			asdf: 4,
		},
	});
	const test: Equals<typeof result, unknown> = EqualsTrue;
	console.log(result, test);
})();
