import type { Expanded } from '@balena/abstract-sql-to-typescript';
import * as errors from 'balena-errors';
import type { WebResourceFile } from 'balena-request';
import * as mime from 'mime';
import type { Expand, ODataOptions, Resource, ResourceExpand, AnyResourceObject, ODataOptionsWithoutCount, ExpandableStringKeyOf } from 'pinejs-client-core';

export interface BalenaUtils {
	mergePineOptions: typeof mergePineOptions;
	BalenaWebResourceFile: typeof BalenaWebResourceFile;
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

type MergeFilter<DFilter, EFilter> = DFilter extends undefined
	? EFilter
	: EFilter extends undefined
	? DFilter
	: {
		$and: [DFilter, EFilter];
	};

// Override logic: $select from extras wins, else fallback to default
type OverrideProp<D, E> = E extends undefined ? D : E;
type SafeKeyOf<T, K> = K extends keyof T ? T[K] : undefined;

// Merge two OData option sets, key-by-key
export type MergedInnerOptions<
	TResource extends Resource['Read'],
	D extends Readonly<ODataOptions<NoInfer<TResource>>>,
	E extends Readonly<NonNullable<ExtraOptions<TResource>>>,
	AllKeys extends keyof D | keyof E = keyof D | keyof E,
> = {
		[K in AllKeys]: K extends '$select' | '$orderby' | '$skip' | '$top' // * select, orderby, top and skip override (select this, instead of the default)
		? OverrideProp<SafeKeyOf<D, K>, SafeKeyOf<E, K>>
		: K extends '$filter'
		? // * filters are combined (i.e. both filters must match)
		MergeFilter<SafeKeyOf<D, K>, SafeKeyOf<E, K>>
		: K extends '$expand'
		? // * expands are combined (include both expansions), and this recurses down.
		//   * That means $expands within expands are combined
		MergeExpand<TResource, SafeKeyOf<D, K>, NonNullable<E[K]>>
		: undefined;
	};

export type MergedOptions<
	TResource extends Resource['Read'],
	D extends Readonly<ODataOptions<NoInfer<TResource>>>,
	E extends Readonly<ExtraOptions<TResource>>,
> = E extends undefined
	? Readonly<D>
	: Omit<D, ExtraKeys> & Pick<MergedInnerOptions<TResource, D, NonNullable<E>>, ExtraKeys>;

export type ExtraKeys = '$select' | '$orderby' | '$skip' | '$top' | '$filter' | '$expand';
export type ExtraOptions<T extends Resource['Read'] = AnyResourceObject> = Readonly<Pick<ODataOptionsWithoutCount<T>, ExtraKeys>> | undefined;



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
	TResource extends Resource['Read'],
	D extends Readonly<ODataOptions<NoInfer<TResource>>>,
	E extends Readonly<ExtraOptions<TResource>> = undefined,
>(defaults: D, extras?: E): MergedOptions<TResource, D, E> {
	if (!extras) {
		return defaults as MergedOptions<TResource, D, E>;
	}

	const result = { ...defaults } as ODataOptions<TResource>;

	if (extras.$select != null) {
		const extraSelect =
			extras.$select == null ||
				Array.isArray(extras.$select) ||
				// @ts-expect-error - '*' is not recognized by pinejs-client-core
				extras.$select === '*'
				? // TS should be able to infer this
				// @ts-expect-error -'*' is not recognized by pinejs-client-core
				(extras.$select as '*')
				: [extras.$select];

		if (extraSelect === '*') {
			// @ts-expect-error - '*' is not recognized by pinejs-client-core
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

	return result as MergedOptions<TResource, D, E>;
}

type EnsureODataOptions<T> = T extends Readonly<ODataOptions> ? T : never;
type EnsureExtraOptions<T> = T extends Readonly<ExtraOptions> ? T : never;

type MergeExpandObjects<
	TResource extends Resource['Read'],
	DExpand extends ResourceExpand<NoInfer<TResource>>,
	EExpand extends ResourceExpand<TResource>,
	AllKeys extends keyof DExpand | keyof EExpand = keyof DExpand | keyof EExpand,
> = {
		[K in AllKeys]:
		K extends ExpandableStringKeyOf<TResource> ?
		K extends keyof DExpand
		? K extends keyof EExpand
		? // If the key exists in both, merge the options
		MergedOptions<
			Expanded<TResource[K]>[number],
			EnsureODataOptions<DExpand[K]>,
			EnsureExtraOptions<EExpand[K]>
		>
		: DExpand[K]
		: K extends keyof EExpand
		? EExpand[K]
		: // We can infer never here because the case where either or both of the expands were
		// undefined are resolved in MergeExpand
		never
		: never;
	};

// For now this works so I am commenting the comment for disable-next-line
// but we might need to fallback to {}
// // eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = Record<string, never>;

export type MergeExpand<
	TResource extends Resource['Read'],
	DExpand extends Expand<NoInfer<TResource>> | undefined,
	EExpand extends Expand<TResource>,
> = DExpand extends undefined
	? EExpand
	: MergeExpandObjects<TResource, ToResourceExpand<TResource, DExpand>, ToResourceExpand<TResource, EExpand>>;

function mergeExpandOptions<
	TResource extends Resource['Read'],
	DExpand extends Expand<NoInfer<TResource>> | undefined,
	EExpand extends Expand<TResource>,
>(defaultExpand: DExpand, extraExpand: EExpand): MergeExpand<TResource, DExpand, EExpand> {
	if (defaultExpand == null) {
		return extraExpand as MergeExpand<TResource, DExpand, EExpand>;
	}

	// We only need to clone the defaultExpand as it's the only one we mutate
	const $defaultExpand = convertExpandToObject(defaultExpand, true) as Record<
		string,
		EmptyObject | ODataOptions | undefined
	>;
	const $extraExpand = convertExpandToObject(extraExpand) as Record<
		string,
		EmptyObject | ODataOptions | undefined
	>;

	for (const expandKey of Object.keys($extraExpand || {})) {
		$defaultExpand[expandKey] = mergePineOptions(
			$defaultExpand[expandKey] ?? {},
			$extraExpand[expandKey],
		);
	}

	return $defaultExpand as unknown as MergeExpand<TResource, DExpand, EExpand>;
}

type ToResourceExpand<
	TResource extends Resource['Read'],
	T extends Expand<TResource> | undefined
> = T extends ResourceExpand<TResource>
	? T
	: T extends undefined
	? EmptyObject
	: T extends ExpandableStringKeyOf<TResource>
	? { T: EmptyObject }
	: T extends Array<ExpandableStringKeyOf<TResource>>
	? { [K in T]: EmptyObject }
	// TODO: missing array with object of expands... but really?
	: never;

// Converts a valid expand object in any format into a new object
// containing (at most) $expand, $filter and $select keys
function convertExpandToObject<TResource extends Resource['Read'], E extends Expand<TResource>>(
	expandOption: E | undefined,
	cloneIfNeeded = false,
): ToResourceExpand<TResource, E> {
	if (expandOption == null) {
		return {} as ToResourceExpand<TResource, E>;
	}

	if (typeof expandOption === 'string') {
		return {
			[expandOption]: {},
		} as ToResourceExpand<TResource, E>;
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
		return { ...expandOption } as unknown as ToResourceExpand<TResource, E>;
	}

	return expandOption as ToResourceExpand<TResource, E>;
}

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

export class BalenaWebResourceFile extends Blob implements WebResourceFile {
	public name: string;
	constructor(blobParts: BlobPart[], name: string, options?: BlobPropertyBag) {
		const opts = {
			...options,
			type: options?.type ?? mime.getType(name) ?? undefined,
		};
		super(blobParts, opts);
		this.name = name;
	}
}
