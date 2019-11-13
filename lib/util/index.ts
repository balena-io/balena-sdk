import * as errors from 'balena-errors';
import * as Pine from '../../typings/pinejs-client-core';

export const notImplemented = () => {
	throw new Error('The method is not implemented.');
};

export const onlyIf = <T extends (...args: any[]) => any>(
	condition: boolean,
) => (fn: T) => {
	if (condition) {
		return fn;
	} else {
		return notImplemented;
	}
};

export const isId = (v?: any): v is number => typeof v === 'number';

export const LOCKED_STATUS_CODE = 423;

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

export const treatAsMissingApplication = (nameOrId: string | number) => (
	err: Error,
) => {
	const replacementErr = new errors.BalenaApplicationNotFound(nameOrId);
	replacementErr.stack = err.stack || '';
	throw replacementErr;
};

export const treatAsMissingDevice = (uuidOrId: string | number) => (
	err: Error,
) => {
	const replacementErr = new errors.BalenaDeviceNotFound(uuidOrId);
	replacementErr.stack = err.stack || '';
	throw replacementErr;
};

// Merging two sets of pine options sensibly is more complicated than it sounds.
//
// The general rules are:
// * select, orderby, top and skip override (select this, instead of the default)
// * filters are combined (i.e. both filters must match)
// * expands are combined (include both expansions), and this recurses down.
//   * That means $expands within expands are combined
//   * And $selects within expands override
// * Any unknown 'extra' options throw an error. Unknown 'default' options are ignored.
export const mergePineOptions = <R extends {}>(
	defaults: Pine.ODataOptions<R>,
	extras: Pine.ODataOptions<R> | undefined,
): Pine.ODataOptions<R> => {
	if (!extras) {
		return defaults;
	}

	const result = { ...defaults };

	for (const option of Object.keys(extras) as Array<keyof typeof extras>) {
		switch (option) {
			case '$select':
				let extraSelect = extras.$select;
				if (extraSelect != null) {
					if (!Array.isArray(extraSelect) && extraSelect !== '*') {
						extraSelect = [extraSelect];
					}
				}

				result.$select = extraSelect;
				break;

			case '$orderby':
			case '$top':
			case '$skip':
				// @ts-ignore
				result[option] = extras[option];
				break;

			case '$filter':
				const extraFilter = extras.$filter;
				if (!extraFilter) {
					// the result already holds the defaults
					break;
				}
				const defaultFilter = defaults.$filter;
				if (!defaultFilter) {
					result.$filter = extraFilter;
				} else {
					result.$filter = {
						$and: [defaultFilter, extraFilter],
					};
				}
				break;

			case '$expand':
				result.$expand = mergeExpandOptions(defaults.$expand, extras.$expand);
				break;

			default:
				throw new Error(`Unknown pine option: ${option}`);
		}
	}

	return result;
};

const mergeExpandOptions = <T>(
	defaultExpand: Pine.Expand<T> | undefined,
	extraExpand: Pine.Expand<T> | undefined,
): Pine.Expand<T> | undefined => {
	if (defaultExpand == null) {
		return extraExpand;
	}

	// We only need to clone the defaultExpand as it's the only one we mutate
	defaultExpand = convertExpandToObject(defaultExpand, true);
	extraExpand = convertExpandToObject(extraExpand);

	for (const expandKey of Object.keys(extraExpand || {}) as Array<
		keyof typeof extraExpand
	>) {
		const extraExpandOptions = extraExpand[expandKey]! || {};
		defaultExpand[expandKey] = defaultExpand[expandKey] || {};
		const expandOptions = defaultExpand[expandKey]!;

		if (extraExpandOptions.$select) {
			expandOptions.$select = extraExpandOptions.$select;
		}

		if (extraExpandOptions.$filter) {
			if (expandOptions.$filter) {
				expandOptions.$filter = {
					$and: [expandOptions.$filter, extraExpandOptions.$filter],
				};
			} else {
				expandOptions.$filter = extraExpandOptions.$filter;
			}
		}

		if (extraExpandOptions.$expand) {
			expandOptions.$expand = mergeExpandOptions(
				expandOptions.$expand,
				extraExpandOptions.$expand,
			);
		}
	}

	return defaultExpand;
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

		const invalidKeys = Object.keys(expandRelationshipOptions! || {}).filter(
			(key) => key !== '$select' && key !== '$expand' && key !== '$filter',
		);
		if (invalidKeys.length > 0) {
			throw new Error(`Unknown pine expand options: ${invalidKeys}`);
		}
	}

	if (cloneIfNeeded) {
		return { ...(expandOption as Pine.ResourceExpand<T>) };
	}

	return expandOption;
};
