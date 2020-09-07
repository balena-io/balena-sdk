/// <reference types="node" />
import * as BalenaSdk from '../typings/balena-sdk';
import { AnyObject } from '../typings/utils';
import { Compute, Equals, EqualsTrue } from './utils';

const sdk: BalenaSdk.BalenaSDK = {} as any;

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

// Fully Typed result

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
		throw 'Can be undefined';
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
		throw 'Can be undefined';
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
		}
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
					$count: {}
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
					$count: {}
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
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application', 'asdf'],
		},
	});
	const test: Equals<Compute<typeof result[number]>, {
		id: any;
		device_name: any;
		belongs_to__application: any;
		asdf: any;
	}> = EqualsTrue;
	// @ts-expect-error - TODO: This should either be never[] or even better the pine.get should error
	const testTodo: Equals<typeof result, never[]> = EqualsTrue;
})();

(async () => {
	const result = await sdk.pine.get({
		resource: 'device',
		options: {
			$select: ['id', 'device_name', 'belongs_to__application'],
			$expand: {
				should_be_running__release: {},
				asdf: {},
				device_tag: {
					$count: {}
				},
			},
		},
	});
	const test: Equals<typeof result, never[]> = EqualsTrue;
})();
