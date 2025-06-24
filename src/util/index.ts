import * as errors from 'balena-errors';
import type {
	Expand,
	Filter,
	ODataOptions,
	ODataOptionsWithoutCount,
	Resource,
	ResourceExpand,
} from 'pinejs-client-core';
import type { StringKeyof } from '../../typings/utils';

export interface BalenaUtils {
	mergePineOptions: typeof mergePineOptions;
}

export const notImplemented = () => {
	throw new Error('The method is not implemented.');
};

export const onlyIf =
	(condition: boolean) =>
	<T extends (...args: any[]) => any>(fn: T) => {
		if (condition) {
			return fn;
		} else {
			return notImplemented;
		}
	};

export const isId = (v?: unknown): v is number => typeof v === 'number';
export const isFullUuid = (v?: unknown): v is string =>
	typeof v === 'string' && (v.length === 32 || v.length === 62);

const SUPERVISOR_LOCKED_STATUS_CODE = 423;

export const withSupervisorLockedError = async <T>(fn: () => Promise<T>) => {
	try {
		return await fn();
	} catch (err) {
		if (err.statusCode === SUPERVISOR_LOCKED_STATUS_CODE) {
			throw new errors.BalenaSupervisorLockedError();
		}
		throw err;
	}
};

const isBalenaRequestErrorResponseWithCode = (
	error: Partial<errors.BalenaRequestError>,
	statusCode: number,
): error is errors.BalenaRequestError =>
	error.code === 'BalenaRequestError' && error.statusCode === statusCode;

export const isUnauthorizedResponse = (err: Error) =>
	isBalenaRequestErrorResponseWithCode(err, 401);

export const isNotFoundResponse = (err: Error) =>
	isBalenaRequestErrorResponseWithCode(err, 404);

const passthroughPineOptionKeys = ['$top', '$skip', '$orderby'] as const;

// Merging two sets of pine options sensibly is more complicated than it sounds.
//
// The general rules are:
// * orderby, top and skip override (select this, instead of the default)
// * selects are combined (i.e. everything selected by both clients will be combined)
// * filters are combined (i.e. both filters must match)
// * expands are combined (include both expansions), and this recurses down.
//   * That means $expands within expands are combined
//   * And $selects within expands override
// * Any unknown 'extra' options throw an error. Unknown 'default' options are ignored.

export type AsArray<T> = T extends string
	? [T]
	: T extends readonly string[]
		? T
		: [];
export type Concat<
	A extends readonly unknown[],
	B extends readonly unknown[],
> = [...A, ...B];
export type OverrideProp<D, E, K> = K extends keyof E
	? E[K]
	: K extends keyof D
		? D[K]
		: undefined;

export type ExtraKeys =
	| '$select'
	| '$orderby'
	| '$skip'
	| '$top'
	| '$filter'
	| '$expand';
export type MergeSelect<
	R extends Resource['Read'],
	TDefault extends Readonly<ODataOptions<R>>,
	TExtra extends Readonly<ODataOptionsWithoutCount<R>>,
> = TExtra extends { $select: infer ESelect }
	? ESelect extends StringKeyof<R> | ReadonlyArray<StringKeyof<R>>
		? TDefault extends { $select: infer DSelect }
			? DSelect extends StringKeyof<R> | ReadonlyArray<StringKeyof<R>>
				? Concat<AsArray<DSelect>, AsArray<ESelect>>
				: AsArray<ESelect>
			: AsArray<ESelect>
		: never
	: TDefault extends { $select: infer DSelect }
		? DSelect extends StringKeyof<R> | ReadonlyArray<StringKeyof<R>>
			? AsArray<DSelect>
			: undefined
		: undefined;

export type MergeFilter<
	R extends Resource['Read'],
	TDefault extends Readonly<ODataOptions<R>>,
	TExtra extends Readonly<ODataOptionsWithoutCount<R>>,
> = TExtra extends { $filter: infer EFilter }
	? EFilter extends Filter<R>
		? TDefault extends { $filter: infer DFilter }
			? DFilter extends Filter<R>
				? { $and: [DFilter, EFilter] }
				: EFilter
			: EFilter
		: never
	: TDefault extends { $filter: infer DFilter }
		? DFilter extends Filter<R>
			? DFilter
			: undefined
		: undefined;

export type ToResourceExpand<R extends Resource['Read'], E extends Expand<R>> =
	E extends ResourceExpand<R>
		? E
		: E extends Array<StringKeyof<R>> | ReadonlyArray<StringKeyof<R>>
			? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
				{ [K in E[number]]: {} }
			: E extends Array<ResourceExpand<R>>
				? E[number]
				: never;

export type EnsureODataOptions<T> =
	T extends Readonly<ODataOptions> ? T : never;
export type EnsureODataOptionsWithoutCount<T> =
	T extends Readonly<ODataOptionsWithoutCount> ? T : never;

export type ExtractNavigationResource<R, K extends keyof R> =
	R[K] extends Array<infer U>
		? U extends Resource['Read']
			? U
			: never
		: never;

export type MergeExpandedOptions<
	R extends Resource['Read'],
	_DExpand extends Expand<R>,
	_EExpand extends Expand<R>,
	DExpand extends ToResourceExpand<R, _DExpand> = ToResourceExpand<R, _DExpand>,
	EExpand extends ToResourceExpand<R, _EExpand> = ToResourceExpand<R, _EExpand>,
	AllKeys extends StringKeyof<DExpand> | StringKeyof<EExpand> =
		| StringKeyof<DExpand>
		| StringKeyof<EExpand>,
> = {
	[K in AllKeys]: K extends StringKeyof<DExpand>
		? K extends StringKeyof<EExpand>
			? MergePineOptions<
					ExtractNavigationResource<R, K>,
					// @ts-expect-error - we know the expand will be a valid odata options
					EnsureODataOptions<DExpand[K]>,
					EnsureODataOptionsWithoutCount<EExpand[K]>
				>
			: DExpand[K]
		: K extends StringKeyof<EExpand>
			? EExpand[K]
			: undefined;
};

export type MergeExpand<
	R extends Resource['Read'],
	TDefault extends Readonly<ODataOptions<R>>,
	TExtra extends Readonly<ODataOptionsWithoutCount<R>>,
> = TExtra extends { $expand: infer EExpand }
	? EExpand extends Expand<R>
		? TDefault extends { $expand: infer DExpand }
			? DExpand extends Expand<R>
				? MergeExpandedOptions<R, DExpand, EExpand>
				: EExpand
			: EExpand
		: never
	: TDefault extends { $expand: infer DExpand }
		? DExpand extends Expand<R>
			? DExpand
			: undefined
		: undefined;

export type AliasResourceRead = { [key: string]: any };

export type AllPineOptionKeys<
	TDefault extends Readonly<ODataOptions>,
	TExtra extends Readonly<ODataOptionsWithoutCount>,
> = keyof TDefault | keyof TExtra;

export type MergePineOptions<
	R extends AliasResourceRead,
	TDefault extends Readonly<ODataOptions<NoInfer<R>>>,
	TExtra extends Readonly<ODataOptionsWithoutCount<NoInfer<R>>>,
> = {
	[K in Exclude<keyof TDefault, ExtraKeys>]: TDefault[K];
} & {
	[K in Extract<keyof (TDefault & TExtra), ExtraKeys>]: K extends '$select'
		? MergeSelect<R, TDefault, TExtra>
		: K extends '$top' | '$skip' | '$orderby'
			? OverrideProp<TDefault, TExtra, K>
			: K extends '$filter'
				? MergeFilter<R, TDefault, TExtra>
				: K extends '$expand'
					? MergeExpand<R, TDefault, TExtra>
					: never;
};

export function mergePineOptions<
	R extends AliasResourceRead,
	TDefault extends Readonly<ODataOptions<NoInfer<R>>>,
	TExtra extends Readonly<ODataOptionsWithoutCount<NoInfer<R>>>,
>(
	defaults: TDefault,
	extras?: TExtra,
): MergePineOptions<NoInfer<R>, TDefault, TExtra> {
	if (extras == null || Object.keys(extras).length === 0) {
		// @ts-expect-error - we own the merged response and know what it is gonna be
		return defaults as MergePineOptions<NoInfer<R>, TDefault, TExtNoInfer<R>>;
	}

	const result = { ...defaults } as ODataOptions<NoInfer<R>>;

	if (extras.$select != null) {
		const extraSelect =
			extras.$select == null ||
			Array.isArray(extras.$select) ||
			extras.$select === '*'
				? // TS should be able to infer this
					(extras.$select as '*')
				: [extras.$select];

		if (extraSelect === '*') {
			result.$select = '*';
		} else {
			result.$select = [
				...(typeof result.$select === 'string'
					? [result.$select]
					: Array.isArray(result.$select)
						? result.$select
						: []),
				...(extraSelect ?? []),
			];
		}
	}

	for (const key of passthroughPineOptionKeys) {
		if (key in extras) {
			// @ts-expect-error TS doesn't realize that for the same key the values are compatible
			result[key] = extras[key];
		}
	}

	if (extras.$filter != null) {
		result.$filter =
			defaults.$filter != null
				? {
						$and: [defaults.$filter, extras.$filter],
					}
				: extras.$filter;
	}

	if (extras.$expand != null) {
		result.$expand = mergeExpandOptions(defaults.$expand, extras.$expand);
	}

	return result as MergePineOptions<NoInfer<R>, TDefault, TExtra>;
}

const mergeExpandOptions = <T extends Resource['Read']>(
	defaultExpand: Expand<T> | undefined,
	extraExpand: Expand<T> | undefined,
): Expand<T> | undefined => {
	if (defaultExpand == null) {
		return extraExpand;
	}

	// We only need to clone the defaultExpand as it's the only one we mutate
	const $defaultExpand = convertExpandToObject(defaultExpand, true);
	const $extraExpand = convertExpandToObject(extraExpand);

	for (const expandKey of Object.keys($extraExpand ?? {}) as Array<
		keyof ResourceExpand<T>
	>) {
		$defaultExpand[expandKey] = mergePineOptions(
			$defaultExpand[expandKey] ?? {},
			$extraExpand?.[expandKey] ?? {},
		);
	}

	return $defaultExpand;
};

// Converts a valid expand object in any format into a new object
// containing (at most) $expand, $filter and $select keys
const convertExpandToObject = <T extends Resource['Read']>(
	expandOption: Expand<T> | undefined,
	cloneIfNeeded = false,
): ResourceExpand<T> => {
	if (expandOption == null) {
		return {};
	}

	if (typeof expandOption === 'string') {
		return {
			[expandOption]: {},
		} as ResourceExpand<T>;
	}

	if (Array.isArray(expandOption)) {
		// Reduce the array into a single object
		return expandOption.reduce(
			(result, option) =>
				Object.assign(
					result,
					typeof option === 'string' ? { [option]: {} } : option,
				),
			{},
		);
	}

	if (cloneIfNeeded) {
		return { ...expandOption } as ResourceExpand<T>;
	}

	return expandOption as ResourceExpand<T>;
};

/**
 * Useful when you want to avoid having to manually parse the key
 * or when need order guarantees while iterating the keys.
 * @private
 */
export const groupByMap = <K, V>(entries: V[], iteratee: (item: V) => K) => {
	const result = new Map<K, V[]>();
	for (const entry of entries) {
		const key = iteratee(entry);
		let keyGroup = result.get(key);
		if (keyGroup == null) {
			keyGroup = [];
			result.set(key, keyGroup);
		}
		keyGroup.push(entry);
	}
	return result;
};

export const delay = (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

const DEFAULT_CONCURRENCY_LIMIT = 50;

export const limitedMap = <T, U>(
	arr: T[],
	fn: (currentValue: T, index: number, array: T[]) => Promise<U>,
	{
		concurrency = DEFAULT_CONCURRENCY_LIMIT,
	}: {
		concurrency?: number;
	} = {},
): Promise<U[]> => {
	if (concurrency >= arr.length) {
		return Promise.all(arr.map(fn));
	}
	return new Promise<U[]>((resolve, reject) => {
		const result: U[] = new Array(arr.length);
		let inFlight = 0;
		let idx = 0;
		const runNext = async () => {
			// Store the idx to use for this call before incrementing the main counter
			const i = idx;
			idx++;
			if (i >= arr.length) {
				return;
			}
			try {
				inFlight++;
				result[i] = await fn(arr[i], i, arr);

				void runNext();
			} catch (err) {
				// Stop any further iterations
				idx = arr.length;
				// Clear the results so far for gc
				result.length = 0;
				reject(err as Error);
			} finally {
				inFlight--;
				if (inFlight === 0) {
					resolve(result);
				}
			}
		};
		while (inFlight < concurrency) {
			void runNext();
		}
	});
};
