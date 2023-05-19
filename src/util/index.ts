import * as errors from 'balena-errors';
import type * as Pine from '../../typings/pinejs-client-core';

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

export const isNoDeviceForKeyResponse = (err: Error) =>
	isBalenaRequestErrorResponseWithCode(err, 500) &&
	err.body === 'No device found to associate with the api key';

export const isNoApplicationForKeyResponse = (err: Error) =>
	isBalenaRequestErrorResponseWithCode(err, 500) &&
	err.body === 'No application found to associate with the api key';

export const treatAsMissingOrganization = (
	handleOrId: string | number,
	err: Error,
) => {
	const replacementErr = new errors.BalenaOrganizationNotFound(handleOrId);
	replacementErr.stack = err.stack || '';
	throw replacementErr;
};

export const treatAsMissingApplication = (
	slugOrUuidOrId: string | number,
	err: Error,
) => {
	const replacementErr = new errors.BalenaApplicationNotFound(slugOrUuidOrId);
	replacementErr.stack = err.stack || '';
	throw replacementErr;
};

export const treatAsMissingDevice = (uuidOrId: string | number, err: Error) => {
	const replacementErr = new errors.BalenaDeviceNotFound(uuidOrId);
	replacementErr.stack = err.stack || '';
	throw replacementErr;
};

// TODO: Make it so that it also infers the extras param
export function mergePineOptionsTyped<
	R extends {},
	P extends Pine.ODataOptionsStrict<R>,
>(defaults: P, extras: Pine.ODataOptions<R> | undefined): P {
	return mergePineOptions(defaults, extras) as P;
}

const knownPineOptionKeys = new Set([
	'$top',
	'$skip',
	'$select',
	'$expand',
	'$filter',
	'$orderby',
]);

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
	R extends {},
	TDefault extends Pine.ODataOptions<R>,
>(
	defaults: TDefault,
	extras: Pine.ODataOptions<R> | undefined,
	replace$selects?: boolean,
): TDefault;
export function mergePineOptions<R extends {}>(
	defaults: Pine.ODataOptions<R>,
	extras: Pine.ODataOptions<R> | undefined,
	replace$selects?: boolean,
): Pine.ODataOptions<R>;
export function mergePineOptions<R extends {}>(
	defaults: Pine.ODataOptions<R>,
	extras: Pine.ODataOptions<R> | undefined,
	replace$selects?: boolean,
): Pine.ODataOptions<R> {
	if (!extras) {
		return defaults;
	}

	// TOOD: Consider dropping in the next major
	const unknownPineOption = Object.keys(extras).find(
		(key) => !knownPineOptionKeys.has(key),
	);
	if (unknownPineOption != null) {
		throw new Error(`Unknown pine option: ${unknownPineOption}`);
	}

	const result = { ...defaults };

	if (extras.$select != null) {
		const extraSelect =
			extras.$select == null ||
			Array.isArray(extras.$select) ||
			extras.$select === '*'
				? // TS should be able to infer this
				  (extras.$select as Array<Pine.SelectableProps<R>> | '*' | undefined)
				: [extras.$select];

		if (replace$selects) {
			result.$select = extraSelect;
		} else if (extraSelect === '*') {
			result.$select = '*';
		} else {
			result.$select = [
				...(typeof result.$select === 'string'
					? [result.$select as Pine.SelectableProps<R>]
					: Array.isArray(result.$select)
					? result.$select
					: []),
				...(extraSelect ?? []),
			];
		}
	}

	for (const key of passthroughPineOptionKeys) {
		if (key in extras) {
			// @ts-expect-error
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
		result.$expand = mergeExpandOptions(
			defaults.$expand,
			extras.$expand,
			replace$selects,
		);
	}

	return result;
}

const mergeExpandOptions = <T>(
	defaultExpand: Pine.Expand<T> | undefined,
	extraExpand: Pine.Expand<T> | undefined,
	replace$selects?: boolean,
): Pine.Expand<T> | undefined => {
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
			replace$selects,
		);
	}

	return $defaultExpand;
};

// Converts a valid expand object in any format into a new object
// containing (at most) $expand, $filter and $select keys
const convertExpandToObject = <T extends {}>(
	expandOption: Pine.Expand<T> | undefined,
	cloneIfNeeded = false,
): Pine.ResourceExpand<T> => {
	if (expandOption == null) {
		return {};
	}

	if (typeof expandOption === 'string') {
		return {
			[expandOption]: {},
		} as Pine.ResourceExpand<T>;
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

	// Check the options in this object are the ones we know how to merge
	for (const expandKey of Object.keys(expandOption) as Array<
		keyof typeof expandOption
	>) {
		const expandRelationshipOptions = expandOption[expandKey];

		// TOOD: Consider dropping in the next major
		const unknownPineOption = Object.keys(expandRelationshipOptions || {}).find(
			(key) => !knownPineOptionKeys.has(key),
		);
		if (unknownPineOption != null) {
			throw new Error(`Unknown pine expand options: ${unknownPineOption}`);
		}
	}

	if (cloneIfNeeded) {
		return { ...(expandOption as Pine.ResourceExpand<T>) };
	}

	return expandOption;
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
