/// <reference types="node" />
import type * as BalenaSdk from '..';
import type { AnyObject } from '../typings/utils';
import type { Compute, Equals } from './utils';
import { EqualsTrue } from './utils';

const sdk: BalenaSdk.BalenaSDK = {} as any;

const strictPine = sdk.pine as BalenaSdk.PineStrict;

export let aAny: any;
export let aNumber: number;
export let aNumberOrUndefined: number | undefined;
export let aString: string;

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

// AnyObject pine queries

await (async () => {
	const result = await sdk.pine.get<AnyObject>({
		resource: 'device',
		options: {
			$select: ['device_name', 'uuid'],
			$expand: {
				belongs_to__application: {},
				device_tag: {},
			},
		},
	});
	const test: Equals<typeof result, AnyObject[]> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const result = await sdk.pine.get<AnyObject>({
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
	const test: Equals<typeof result, AnyObject | undefined> = EqualsTrue;
	console.log(result, test);
})();

// Object level typed result

await (async () => {
	const result = await sdk.pine.get<BalenaSdk.Device>({
		resource: 'device',
		options: {
			$select: ['device_name', 'uuid'],
			$expand: {
				belongs_to__application: {},
				device_tag: {},
			},
		},
	});
	const test: Equals<typeof result, BalenaSdk.Device[]> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const result = await sdk.pine.get<BalenaSdk.Device>({
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
	const test: Equals<typeof result, BalenaSdk.Device | undefined> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const fleetSlug = 'fleetSlug';
	const maybeRelease: string | null = '1.2.3';
	const maybeService: string | null = 'main';
	const result = await sdk.pine.get<BalenaSdk.Image>({
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
	const test: Equals<typeof result, BalenaSdk.Image[]> = EqualsTrue;
	console.log(result, test);
})();

// Explicitly providing the result type

await (async () => {
	const result = await sdk.pine.get<BalenaSdk.Device, number>({
		resource: 'device/$count',
		options: {
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
	const test: Equals<typeof result, number> = EqualsTrue;
	console.log(result, test);
})();

await (async () => {
	const result = await sdk.pine.get<BalenaSdk.Device, number>({
		resource: 'device/$count',
		id: 1,
		options: {
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
	const test: Equals<typeof result, number> = EqualsTrue;
	console.log(result, test);
})();

// Fully Typed - auto-inferring result

await (async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
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
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		id: 1,
		options: {
			$select: ['id', 'device_name'],
		},
	} as const);

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
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				is_pinned_on__release: {},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
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
			$select: ['id', 'device_name', 'belongs_to__application'],
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
	aNumber = result.belongs_to__application.__id;
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
			$select: ['id', 'device_name', 'belongs_to__application'],
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
	aNumber = result.belongs_to__application.__id;
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
		// @ts-expect-error test case
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
			// @ts-expect-error test case
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
			$select: ['id', 'device_name', 'belongs_to__application', 'asdf'],
		},
	});
	const test: Equals<
		Compute<(typeof result)[number]>,
		{
			id: any;
			device_name: any;
			belongs_to__application: any;
			asdf: any;
		}
	> = EqualsTrue;
	// @ts-expect-error - TODO: This should either be never[] or even better the pine.get should error
	const testTodo: Equals<typeof result, never[]> = EqualsTrue;
	console.log(test, result, testTodo);
})();

await (async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				// @ts-expect-error test case
				is_pinned_on__release: {},
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
	});
	const test: Equals<
		Compute<(typeof result)[number]>,
		{
			is_stored_at__image_location: string;
		}
	> = EqualsTrue;
	console.log(result, test);
})();

// strictPine
await (async () => {
	const result = await strictPine.get({
		resource: 'device',
		options: {
			// @ts-expect-error test case
			$select: ['id', 'device_name', 'belongs_to__application', 'asdf'],
		},
	});
	console.log(result);
})();

await (async () => {
	const result = await strictPine.get({
		resource: 'device',
		options: {
			// @ts-expect-error b/c the expand doesn't have a $select, bad placing though.
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				is_pinned_on__release: {},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	console.log(result);
})();

await (async () => {
	const result = await strictPine.get({
		resource: 'device',
		options: {
			// @ts-expect-error b/c asdf is not an expandable prop, bad placing though.
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				is_pinned_on__release: {
					$select: 'id',
				},
				asdf: {
					$select: 'id',
				},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	console.log(result);
})();

await (async () => {
	const [result] = await strictPine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				is_pinned_on__release: {
					$select: 'id',
				},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aNumber = result.device_tag;

	// @ts-expect-error test case
	aString = result.os_version;
	// @ts-expect-error test case
	aNumber = result.is_on__release.__id;
})();

await (async () => {
	const result = await strictPine.get({
		resource: 'device',
		id: 5,
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				is_pinned_on__release: {
					$select: 'id',
				},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	const checkUndefined: typeof result = undefined;
	console.log(checkUndefined);
	if (result === undefined) {
		throw new Error('Can be undefined');
	}

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aNumber = result.device_tag;

	// @ts-expect-error test case
	aString = result.os_version;
	// @ts-expect-error test case
	aNumber = result.is_on__release.__id;
})();

await (async () => {
	const result = await strictPine.get({
		resource: 'device',
		id: 5,
		options: {
			$count: {
				$filter: {
					// TODO: This should error
					asdf: 4,
					belongs_to__application: {
						organization: 1,
						application_type: 2,
						depends_on__application: null,
					},
				},
			},
		},
	});

	aNumber = result;
})();

await (async () => {
	const result = await strictPine.get({
		resource: 'device',
		id: 5,
		options: {
			$count: {
				$filter: {
					belongs_to__application: {
						organization: 1,
						application_type: 2,
						depends_on__application: null,
					},
				},
			},
		},
	});

	aNumber = result;
})();

// pine.post
await (async () => {
	await sdk.pine.post<BalenaSdk.Application>({
		resource: 'application',
		body: {
			organization: 3,
			// @ts-expect-error test case
			asdf: 4,
		},
	});
})();

await (async () => {
	const result = await sdk.pine.post<BalenaSdk.Application>({
		resource: 'application',
		body: {
			organization: 3,
		},
	});

	aNumber = result.id;
	aString = result.app_name;
	aNumber = result.organization.__id;
	aNumberOrUndefined = result.should_be_running__release?.__id;

	// @ts-expect-error test case
	aAny = result.owns__device;
})();

await (async () => {
	// @ts-expect-error test case
	await sdk.pine.post<BalenaSdk.Application>({
		resource: 'application',
	});
	// @ts-expect-error test case
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

	// @ts-expect-error test case
	aAny = result.owns__device;
})();

await (async () => {
	const result = await sdk.pine.post({
		resource: 'application',
		body: {
			organization: 3,
			// TODO: This should error
			asdf: 4,
		},
	});
	aNumber = result.id;
	// @ts-expect-error TODO: This should not fail
	aString = result.app_name;
	// @ts-expect-error TODO: This should not fail
	aNumber = result.organization.__id;
	// @ts-expect-error TODO: This should not fail
	aNumberOrUndefined = result.should_be_running__release?.__id;
	// TODO: This should error
	aNumberOrUndefined = result.asdf;

	// @ts-expect-error test case
	aAny = result.owns__device;
})();
