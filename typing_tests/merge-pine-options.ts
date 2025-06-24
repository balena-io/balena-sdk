/* eslint-disable @typescript-eslint/no-empty-object-type */
import { type Equals, EqualsTrue } from 'utils';
import type * as BalenaSdk from '..';
import { mergePineOptions } from '../es2017/util';

const sdk: BalenaSdk.BalenaSDK = {} as any;

export let aAny: any;
export let aNumber: number;
export let anUndefined: undefined;
export let aNumberOrUndefined: number | undefined;
export let aStringOrNull: string | null;
export let aString: string;
export let anArray: any[];

// $select properties
await (async () => {
	const noProps = await sdk.models.apiKey.getAll();

	aNumber = noProps[0].id;
	aString = noProps[0].created_at;
	aStringOrNull = noProps[0].expiry_date;
	aStringOrNull = noProps[0].description;
	aStringOrNull = noProps[0].name;
	aNumber = noProps[0].is_of__actor.__id;

	const narrowDownSelectString = await sdk.models.apiKey.getAll({
		$select: 'id',
	});
	aNumber = narrowDownSelectString[0].id;
	// @ts-expect-error - test case
	aString = narrowDownSelectString[0].created_at;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectString[0].expiry_date;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectString[0].description;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectString[0].name;
	// @ts-expect-error - test case
	aNumber = narrowDownSelectString[0].is_of__actor.__id;

	const narrowDownSelectArraySingle = await sdk.models.apiKey.getAll({
		$select: ['id'],
	});
	aNumber = narrowDownSelectArraySingle[0].id;
	// @ts-expect-error - test case
	aString = narrowDownSelectArraySingle[0].created_at;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArraySingle[0].expiry_date;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArraySingle[0].description;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArraySingle[0].name;
	// @ts-expect-error - test case
	aNumber = narrowDownSelectArraySingle[0].is_of__actor.__id;

	const narrowDownSelectArrayMultiple = await sdk.models.apiKey.getAll({
		$select: ['id', 'description'],
	});
	aNumber = narrowDownSelectArrayMultiple[0].id;
	aStringOrNull = narrowDownSelectArrayMultiple[0].description;
	// @ts-expect-error - test case
	aString = narrowDownSelectArrayMultiple[0].created_at;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArrayMultiple[0].expiry_date;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArrayMultiple[0].name;
	// @ts-expect-error - test case
	aNumber = narrowDownSelectArrayMultiple[0].is_of__actor.__id;

	const narrowDownSelectArrayWithNavigation = await sdk.models.apiKey.getAll({
		$select: ['id', 'description', 'is_of__actor'],
	});
	aNumber = narrowDownSelectArrayWithNavigation[0].id;
	aStringOrNull = narrowDownSelectArrayWithNavigation[0].description;
	aNumber = narrowDownSelectArrayWithNavigation[0].is_of__actor.__id;
	// @ts-expect-error - test case
	aString = narrowDownSelectArrayWithNavigation[0].created_at;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArrayWithNavigation[0].expiry_date;
	// @ts-expect-error - test case
	aStringOrNull = narrowDownSelectArrayWithNavigation[0].name;
})();

// $expand properties
await (async () => {
	const noExpand = await sdk.models.application.getAll();
	aNumberOrUndefined = noExpand[0].is_for__device_type?.__id;
	aNumberOrUndefined = noExpand[0].should_be_running__release?.__id;
	anUndefined = noExpand[0].owns__device;
	anUndefined = noExpand[0].owns__release;

	const arrayExpand = await sdk.models.application.getAll({
		$expand: ['is_for__device_type', 'owns__device'],
	});

	aNumber = arrayExpand[0].is_for__device_type[0].id;
	aNumberOrUndefined = arrayExpand[0].should_be_running__release?.__id;
	aNumber = arrayExpand[0].owns__device[0].id;
	anUndefined = arrayExpand[0].owns__release;

	const objectExpand = await sdk.models.application.getAll({
		$expand: { is_for__device_type: {}, owns__device: {} },
	});

	aNumber = objectExpand[0].is_for__device_type[0].id;
	aNumberOrUndefined = objectExpand[0].should_be_running__release?.__id;
	aNumber = objectExpand[0].owns__device[0].id;
	anUndefined = objectExpand[0].owns__release;

	const objectExpandWithSelect = await sdk.models.application.getAll({
		$expand: {
			is_for__device_type: {
				$select: ['slug', 'name'],
			},
			owns__device: {},
		},
	});

	// @ts-expect-error - test case
	aNumber = objectExpandWithSelect[0].is_for__device_type[0].id;
	aString = objectExpandWithSelect[0].is_for__device_type[0].name;
	aString = objectExpandWithSelect[0].is_for__device_type[0].slug;

	aNumberOrUndefined =
		objectExpandWithSelect[0].should_be_running__release?.__id;
	aNumber = objectExpandWithSelect[0].owns__device[0].id;
	anUndefined = objectExpandWithSelect[0].owns__release;

	const objectExpandNestedArray = await sdk.models.application.getAll({
		$expand: {
			owns__device: {
				$expand: ['belongs_to__user'],
			},
		},
	});
	aNumber = objectExpandNestedArray[0].owns__device[0].belongs_to__user[0].id;

	const objectExpandNested = await sdk.models.application.getAll({
		$expand: {
			owns__device: {
				$expand: {
					belongs_to__user: {},
				},
			},
		},
	});
	aNumber = objectExpandNested[0].owns__device[0].belongs_to__user[0].id;

	const objectExpandNestedWithSelect = await sdk.models.application.getAll({
		$expand: {
			owns__device: {
				$expand: {
					belongs_to__user: {
						$select: ['username'],
					},
				},
			},
		},
	});
	aNumber =
		// @ts-expect-error - test case
		objectExpandNestedWithSelect[0].owns__device[0].belongs_to__user[0].id;
})();

// @ application.getWithDeviceServiceDetails
await (async () => {
	const app = await sdk.models.application.getWithDeviceServiceDetails(123);
	const service = app.owns__device[0].current_services;
	const test: Equals<
		typeof service,
		Record<string, BalenaSdk.CurrentServiceWithCommit[]>
	> = EqualsTrue;

	const appWithExpand =
		await sdk.models.application.getWithDeviceServiceDetails(123, {
			$select: 'app_name',
		});
	// @ts-expect-error - test case
	aNumber = appWithExpand.id;

	const appWithNestedExpand =
		await sdk.models.application.getWithDeviceServiceDetails(123, {
			$select: 'app_name',
			$expand: {
				owns__device: {
					$expand: {
						image_install: {
							$expand: {
								installs__image: {
									$select: 'is_stored_at__image_location',
								},
							},
						},
					},
				},
				owns__release: {
					$select: 'id',
				},
				application_type: {},
			},
		} as const);

	aString =
		appWithNestedExpand.owns__device[0].image_install[0].installs__image[0]
			.is_stored_at__image_location;
	aNumber = appWithNestedExpand.owns__release[0].id;
	aNumber = appWithNestedExpand.application_type[0].id;
	aString = appWithNestedExpand.application_type[0].slug;
	console.log(service, test);
})();

// @ device.getWithDeviceServiceDetails
await (async () => {
	const device = await sdk.models.device.getWithServiceDetails(123);
	const service = device.current_services;
	const test: Equals<
		typeof service,
		Record<string, BalenaSdk.CurrentService[]>
	> = EqualsTrue;

	const deviceWithExpand = await sdk.models.device.getWithServiceDetails(123, {
		$select: 'cpu_id',
	});
	// @ts-expect-error - test case
	aNumber = deviceWithExpand.id;

	const appWithNestedExpand = await sdk.models.device.getWithServiceDetails(
		123,
		{
			$select: 'cpu_id',
			$expand: {
				image_install: {
					$expand: {
						installs__image: {
							$select: 'is_stored_at__image_location',
						},
					},
				},
			},
		} as const,
	);

	aString =
		appWithNestedExpand.image_install[0].installs__image[0]
			.is_stored_at__image_location;
	console.log(service, test);
})();

// mergePineOptions typing
(() => {
	const emptyProperty = mergePineOptions({}, {});
	// @ts-expect-error - test case
	const test = emptyProperty.$select;

	console.log(test);
})();

// $select
(() => {
	const mergedSelect = mergePineOptions({ $select: 'id' });
	const test: Equals<typeof mergedSelect.$select, ['id']> = EqualsTrue;
	console.log(test, mergedSelect);
})();

(() => {
	const mergedSelect = mergePineOptions({ $select: 'id' }, {});
	const test: Equals<typeof mergedSelect.$select, ['id']> = EqualsTrue;
	console.log(test, mergedSelect);
})();

(() => {
	const mergedSelect = mergePineOptions({ $select: ['id', 'name'] } as const);
	const test: Equals<typeof mergedSelect.$select, readonly ['id', 'name']> =
		EqualsTrue;
	console.log(test, mergedSelect);
})();

(() => {
	const mergedSelect = mergePineOptions(
		{ $select: ['id', 'name'] } as const,
		{},
	);
	const test: Equals<typeof mergedSelect.$select, readonly ['id', 'name']> =
		EqualsTrue;
	console.log(test, mergedSelect);
})();

(() => {
	const mergedSelect = mergePineOptions({ $select: 'id' }, { $select: 'name' });
	const test: Equals<typeof mergedSelect.$select, ['id', 'name']> = EqualsTrue;
	console.log(test, mergedSelect);
})();

(() => {
	const mergedSelect = mergePineOptions({ $select: ['id', 'name'] } as const, {
		$select: 'test',
	});
	const test: Equals<typeof mergedSelect.$select, ['id', 'name', 'test']> =
		EqualsTrue;
	console.log(test, mergedSelect);
})();

(() => {
	const mergedSelect = mergePineOptions(
		{ $select: ['id', 'name'] } as const,
		{ $select: ['test', 'test2'] } as const,
	);
	const test: Equals<
		typeof mergedSelect.$select,
		['id', 'name', 'test', 'test2']
	> = EqualsTrue;
	console.log(test, mergedSelect);
})();

// $top | $skip | $orderby
(() => {
	const mergedOptions = mergePineOptions({ $top: 10 } as const, {});
	const test: Equals<typeof mergedOptions.$top, 10> = EqualsTrue;
	console.log(test, mergedOptions);
})();

(() => {
	const mergedOptions = mergePineOptions(
		{ $top: 10 } as const,
		{ $top: 20 } as const,
	);
	const test: Equals<typeof mergedOptions.$top, 20> = EqualsTrue;
	console.log(test, mergedOptions);
})();

(() => {
	const mergedOptions = mergePineOptions({ $skip: 5 } as const, {});
	const test: Equals<typeof mergedOptions.$skip, 5> = EqualsTrue;
	console.log(test, mergedOptions);
})();

(() => {
	const mergedOptions = mergePineOptions(
		{ $skip: 5 } as const,
		{ $skip: 15 } as const,
	);
	const test: Equals<typeof mergedOptions.$skip, 15> = EqualsTrue;
	console.log(test, mergedOptions);
})();

(() => {
	const mergedOptions = mergePineOptions({ $orderby: 'id asc' }, {});
	const test: Equals<typeof mergedOptions.$orderby, 'id asc'> = EqualsTrue;
	console.log(test, mergedOptions);
})();

(() => {
	const mergedOptions = mergePineOptions(
		{ $orderby: 'id asc' },
		{ $orderby: 'name desc' },
	);
	const test: Equals<typeof mergedOptions.$orderby, 'name desc'> = EqualsTrue;
	console.log(test, mergedOptions);
})();

(() => {
	const mergedOptions = mergePineOptions(
		{ $orderby: 'id asc' },
		{ $orderby: { name: 'desc' } },
	);
	const test: Equals<typeof mergedOptions.$orderby, { name: 'desc' }> =
		EqualsTrue;
	console.log(test, mergedOptions);
})();

// $filter
(() => {
	const mergedFilter = mergePineOptions({ $filter: { id: 1 } } as const);
	const test: Equals<typeof mergedFilter.$filter, { readonly id: 1 }> =
		EqualsTrue;
	console.log(test, mergedFilter);
})();

(() => {
	const mergedFilter = mergePineOptions({ $filter: { id: 1 } } as const, {});
	const test: Equals<typeof mergedFilter.$filter, { readonly id: 1 }> =
		EqualsTrue;
	console.log(test, mergedFilter);
})();

(() => {
	const mergedFilter = mergePineOptions(
		{ $filter: { id: 1 } } as const,
		{ $filter: { name: 'test' } } as const,
	);
	const test: Equals<
		typeof mergedFilter.$filter,
		{ $and: [{ readonly id: 1 }, { readonly name: 'test' }] }
	> = EqualsTrue;
	console.log(test, mergedFilter);
})();

(() => {
	const mergedFilter = mergePineOptions(
		{ $filter: { $or: [{ id: 1 }, { id: 2 }] } } as const,
		{ $filter: { name: 'test' } } as const,
	);
	const test: Equals<
		typeof mergedFilter.$filter,
		{
			$and: [
				{ readonly $or: readonly [{ readonly id: 1 }, { readonly id: 2 }] },
				{ readonly name: 'test' },
			];
		}
	> = EqualsTrue;
	console.log(test, mergedFilter);
})();

// $expand (without much recursion)
(() => {
	const mergedExpand = mergePineOptions({
		$expand: ['is_for__device_type'],
	} as const);
	const test: Equals<
		typeof mergedExpand.$expand,
		readonly ['is_for__device_type']
	> = EqualsTrue;
	console.log(test, mergedExpand);
})();

(() => {
	const mergedExpand = mergePineOptions({
		$expand: { is_for__device_type: {} },
	});
	const test: Equals<typeof mergedExpand.$expand, { is_for__device_type: {} }> =
		EqualsTrue;
	console.log(test, mergedExpand);
})();

// $expand with $select combinations
(() => {
	const mergedExpandSelect = mergePineOptions({
		$expand: {
			is_for__device_type: { $select: ['slug'] },
		},
	} as const);
	const test: Equals<
		typeof mergedExpandSelect.$expand,
		{ readonly is_for__device_type: { readonly $select: readonly ['slug'] } }
	> = EqualsTrue;
	console.log(test, mergedExpandSelect);
})();

// $expand with string form
(() => {
	const mergedExpandString = mergePineOptions(
		{
			$expand: ['a'],
		} as const,
		{
			$expand: ['b'],
		} as const,
	);

	const test: Equals<typeof mergedExpandString.$expand, { a: {}; b: {} }> =
		EqualsTrue;
	console.log(test, mergedExpandString);
})();

// $expand with mixed string and object form
(() => {
	const mergedExpandString = mergePineOptions(
		{
			$expand: ['a'],
		} as const,
		{
			$expand: {
				b: {
					$select: ['id'],
				},
			},
		} as const,
	) satisfies {
		$expand: {
			a: {};
			readonly b: {
				readonly $select: readonly ['id'];
			};
		};
	};

	console.log(mergedExpandString);
})();
