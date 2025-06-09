import * as errors from 'balena-errors';
import type {
	Expand,
	ODataOptions,
	ODataOptionsWithoutCount,
	Resource,
	ResourceExpand,
} from 'pinejs-client-core';

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
export const isFullUuid = (v?: unknown): v is string | { length: 32 | 62 } =>
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
// * select, orderby, top and skip override (select this, instead of the default)
// * filters are combined (i.e. both filters must match)
// * expands are combined (include both expansions), and this recurses down.
//   * That means $expands within expands are combined
//   * And $selects within expands override
// * Any unknown 'extra' options throw an error. Unknown 'default' options are ignored.
export function mergePineOptions<
	R extends Resource['Read'],
	TDefault extends ODataOptions<R>,
>(defaults: TDefault, extras?: undefined): TDefault;

export function mergePineOptions<R extends Resource['Read']>(
	defaults: ODataOptionsWithoutCount<R>,
	extras: ODataOptionsWithoutCount<R>,
): ODataOptionsWithoutCount<R>;

export function mergePineOptions<R extends Resource['Read']>(
	defaults: ODataOptions<R>,
	extras: ODataOptionsWithoutCount<R>,
): ODataOptions<R>;

export function mergePineOptions<R extends Resource['Read']>(
	defaults: ODataOptions<R>,
	extras: ODataOptionsWithoutCount<R> | undefined,
): ODataOptions<R> | ODataOptionsWithoutCount<R> {
	if (extras == null) {
		return defaults;
	}

	const result = { ...defaults };

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

	return result;
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

	for (const expandKey of Object.keys($extraExpand || {}) as Array<
		keyof typeof extraExpand
	>) {
		$defaultExpand[expandKey] = mergePineOptions(
			$defaultExpand[expandKey] ?? {},
			$extraExpand[expandKey],
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
