/// <reference types="node" />
import type * as BalenaSdk from '..';
import type { AnyObject } from '../typings/utils';
import { Compute, Equals, EqualsTrue } from './utils';

const sdk: BalenaSdk.BalenaSDK = {} as any;

const strictPine = sdk.pine as BalenaSdk.PineStrict;

let aAny: any;
let aNumber: number;
let aNumberOrUndefined: number | undefined;
let aString: string;

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

// AnyObject pine queries

(async () => {
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
})();

(async () => {
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
})();

// Object level typed result

(async () => {
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
})();

(async () => {
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
})();

(async () => {
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
})();

// Explicitly providing the result type

(async () => {
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
})();

(async () => {
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
})();

// Fully Typed - auto-inferring result

(async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.should_be_running__release?.__id;

	// @ts-expect-error
	aNumber = result.should_be_running__release.__id;
	// @ts-expect-error
	aAny = result.device_tag;
})();

(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		id: 1,
	});

	const checkUndefined: typeof result = undefined;
	if (result === undefined) {
		throw new Error('Can be undefined');
	}

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.should_be_running__release?.__id;

	// @ts-expect-error
	aNumber = result.should_be_running__release.__id;
	// @ts-expect-error
	aAny = result.device_tag;
})();

(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		id: 1,
		options: {
			$select: ['id', 'device_name'],
		},
	});

	const checkUndefined: typeof result = undefined;
	if (result === undefined) {
		throw new Error('Can be undefined');
	}

	aNumber = result.id;
	aString = result.device_name;

	// @ts-expect-error
	aString = result.os_version;
	// @ts-expect-error
	aAny = result.belongs_to__application;
	// @ts-expect-error
	aAny = result.device_tag;
})();

(async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.should_be_running__release[0]?.id;

	// @ts-expect-error
	aString = result.os_version;
	// @ts-expect-error
	aNumber = result.should_be_running__release.__id;
	// @ts-expect-error
	aAny = result.device_tag;
})();

// $count

(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$count: {},
		},
	});
	aNumber = result;
})();

(async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {
					$count: {},
				},
				device_tag: {},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumber = result.should_be_running__release;
	aNumber = result.device_tag[0]?.id;

	// @ts-expect-error
	aString = result.os_version;
	// @ts-expect-error
	aNumber = result.is_on__release.__id;
})();

(async () => {
	const [result] = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.should_be_running__release[0]?.id;
	aNumber = result.device_tag;

	// @ts-expect-error
	aString = result.os_version;
	// @ts-expect-error
	aNumber = result.is_on__release.__id;
})();

// Exceeding properties
(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		// @ts-expect-error
		missplaced$filter: {},
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
		},
	});
})();

(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			// @ts-expect-error
			$asdf: {},
		},
	});
})();

// Incorrect properties
(async () => {
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
})();

(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				// @ts-expect-error
				should_be_running__release: {},
				asdf: {},
				device_tag: {
					$count: {},
				},
			},
		},
	});
})();

(async () => {
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
})();

(async () => {
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
})();

(async () => {
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
})();

(async () => {
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
})();

// strictPine
(async () => {
	const result = await strictPine.get({
		resource: 'device',
		options: {
			// @ts-expect-error
			$select: ['id', 'device_name', 'belongs_to__application', 'asdf'],
		},
	});
})();

(async () => {
	const result = await strictPine.get({
		resource: 'device',
		options: {
			// @ts-expect-error b/c the expand doesn't have a $select, bad placing though.
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {},
				device_tag: {
					$count: {},
				},
			},
		},
	});
})();

(async () => {
	const result = await strictPine.get({
		resource: 'device',
		options: {
			// @ts-expect-error b/c asdf is not an expandable prop, bad placing though.
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {
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
})();

(async () => {
	const [result] = await strictPine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {
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
	aNumberOrUndefined = result.should_be_running__release[0]?.id;
	aNumber = result.device_tag;

	// @ts-expect-error
	aString = result.os_version;
	// @ts-expect-error
	aNumber = result.is_on__release.__id;
})();

(async () => {
	const result = await strictPine.get({
		resource: 'device',
		id: 5,
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {
					$select: 'id',
				},
				device_tag: {
					$count: {},
				},
			},
		},
	});
	const checkUndefined: typeof result = undefined;
	if (result === undefined) {
		throw new Error('Can be undefined');
	}

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.should_be_running__release[0]?.id;
	aNumber = result.device_tag;

	// @ts-expect-error
	aString = result.os_version;
	// @ts-expect-error
	aNumber = result.is_on__release.__id;
})();

(async () => {
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

(async () => {
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
(async () => {
	await sdk.pine.post<BalenaSdk.Application>({
		resource: 'application',
		body: {
			organization: 3,
			// @ts-expect-error
			asdf: 4,
		},
	});
})();

(async () => {
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

	// @ts-expect-error
	aAny = result.owns__device;
})();

(async () => {
	// @ts-expect-error
	await sdk.pine.post<BalenaSdk.Application>({
		resource: 'application',
	});
	// @ts-expect-error
	await sdk.pine.post({
		resource: 'application',
	});
})();

(async () => {
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

	// @ts-expect-error
	aAny = result.owns__device;
})();

(async () => {
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

	// @ts-expect-error
	aAny = result.owns__device;
})();
