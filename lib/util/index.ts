import * as errors from 'balena-errors';
import assign = require('lodash/assign');
import cloneDeep = require('lodash/cloneDeep');
import isArray = require('lodash/isArray');
import isFunction = require('lodash/isFunction');
import isNumber = require('lodash/isNumber');
import isString = require('lodash/isString');
import throttle = require('lodash/throttle');
import * as memoizee from 'memoizee';
import * as moment from 'moment';
import * as Pine from '../../typings/pinejs-client-core';
import { getOsUpdateHelper as updateHelper } from './device-actions/os-update';
import * as dt from './device-types';

export const getOsUpdateHelper = updateHelper;
export const deviceTypes = dt;

export const notImplemented = () => {
	throw new Error('The method is not implemented.');
};

// tslint:disable-next-line:ban-types
export const onlyIf = <T extends Function>(condition: boolean) => (fn: T) => {
	if (condition) {
		return fn;
	} else {
		return notImplemented;
	}
};

export const now = throttle(() => moment(), 1000, { leading: true });

export const dateToMoment = memoizee((date: Date) => moment(date), {
	max: 1000,
	primitive: true,
});

export const timeSince = (input: Date, suffix = true) => {
	const date = dateToMoment(input);

	// We do this to avoid out-of-sync times causing this to return
	// e.g. 'in a few seconds'.
	// if the date is in the future .min will make it at maximum, the time since now
	// which results in 'a few seconds ago'.
	const time = now();
	return moment.min(time, date).from(time, !suffix);
};

export const isId = isNumber;

export const LOCKED_STATUS_CODE = 423;

// Use with: `findCallback(arguments)`.
export const findCallback = (args: IArguments) => {
	const lastArg = args[args.length - 1];
	if (isFunction(lastArg)) {
		return lastArg;
	}

	return;
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

export const treatAsMissingOrganization = (handleOrId: string | number) => (
	err: Error,
) => {
	const replacementErr = new errors.BalenaOrganizationNotFound(handleOrId);
	replacementErr.stack = err.stack || '';
	throw replacementErr;
};

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

export const isDevelopmentVersion = (version: string) =>
	/(\.|\+|-)dev/.test(version);

// Merging two sets of pine options sensibly is more complicated than it sounds.
//
// The general rules are:
// * select, orderby, top and skip override (select this, instead of the default)
// * filters are combined (i.e. both filters must match)
// * expands are combined (include both expansions), and this recurses down.
//   * That means $expands within expands are combined
//   * And $selects within expands override
// * Any unknown 'extra' options throw an error. Unknown 'default' options are ignored.
export function mergePineOptions<R extends {}>(
	defaults: Pine.ODataOptionsWithSelect<R>,
	extras: Pine.ODataOptions<R>,
): Pine.ODataOptionsWithSelect<R>;
export function mergePineOptions<R extends {}>(
	defaults: Pine.ODataOptions<R>,
	extras: Pine.ODataOptions<R>,
): Pine.ODataOptions<R>;
export function mergePineOptions<R extends {}>(
	defaults: Pine.ODataOptions<R>,
	extras: Pine.ODataOptions<R>,
): Pine.ODataOptions<R> {
	if (!extras) {
		return defaults;
	}

	const result = cloneDeep(defaults);

	for (const option of Object.keys(extras) as Array<keyof typeof extras>) {
		switch (option) {
			case '$select':
				let extraSelect = extras.$select;
				if (extraSelect != null) {
					if (!isArray(extraSelect) && extraSelect !== '*') {
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
}

const mergeExpandOptions = <T>(
	defaultExpand: Pine.Expand<T> | undefined,
	extraExpand: Pine.Expand<T> | undefined,
): Pine.Expand<T> | undefined => {
	if (defaultExpand == null) {
		return extraExpand;
	}

	defaultExpand = convertExpandToObject(defaultExpand);
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
): Pine.ResourceExpand<T> => {
	if (expandOption == null) {
		return {};
	} else if (isString(expandOption)) {
		return {
			[expandOption]: {},
		} as Pine.ResourceExpand<T>;
	} else if (isArray(expandOption)) {
		// Reduce the array into a single object
		return expandOption.reduce(
			(result, option) =>
				assign(result, isString(option) ? { [option]: {} } : option),
			{},
		);
	} else {
		// Check the options in this object are the ones we know how to merge
		for (const expandKey of Object.keys(expandOption) as Array<
			keyof Pine.ResourceExpand<T>
		>) {
			const expandRelationshipOptions = expandOption[expandKey];

			const invalidKeys = Object.keys(expandRelationshipOptions! || {}).filter(
				key => key !== '$select' && key !== '$expand' && key !== '$filter',
			);
			if (invalidKeys.length > 0) {
				throw new Error(`Unknown pine expand options: ${invalidKeys}`);
			}
		}

		return cloneDeep(expandOption);
	}
};

// In order not to introduce a breaking change, we export each element independently and all together as a default export.
export default {
	getOsUpdateHelper,
	deviceTypes,
	notImplemented,
	onlyIf,
	now,
	dateToMoment,
	timeSince,
	isId,
	LOCKED_STATUS_CODE,
	findCallback,
	isUnauthorizedResponse,
	isNotFoundResponse,
	isNoDeviceForKeyResponse,
	isNoApplicationForKeyResponse,
	treatAsMissingApplication,
	treatAsMissingDevice,
	isDevelopmentVersion,
	mergePineOptions,
};
