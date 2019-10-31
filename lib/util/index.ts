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
import BalenaSdk = require('../../typings/balena-sdk');
import { getOsUpdateHelper as updateHelper } from './device-actions/os-update';
import * as dt from './device-types';

export interface ErrorResponse {
	code: string;
	statusCode?: number;
	body?: string;
}

export const getOsUpdateHelper = updateHelper;
export const deviceTypes = dt;

export const notImplemented = () => {
	throw new Error('The method is not implemented.');
};

export const onlyIf = (condition: boolean) => (fn: () => void) => {
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

export const unauthorizedError: ErrorResponse = {
	code: 'BalenaRequestError',
	statusCode: 401,
};

export const notFoundResponse: ErrorResponse = {
	code: 'BalenaRequestError',
	statusCode: 404,
};

export const noDeviceForKeyResponse: ErrorResponse = {
	code: 'BalenaRequestError',
	statusCode: 500,
	body: 'No device found to associate with the api key',
};

export const noApplicationForKeyResponse: ErrorResponse = {
	code: 'BalenaRequestError',
	statusCode: 500,
	body: 'No application found to associate with the api key',
};

export const isUniqueKeyViolationResponse = ({ code, body }: ErrorResponse) =>
	code === 'BalenaRequestError' &&
	!!body &&
	// api translated response
	(body === 'Unique key constraint violated' ||
		// pine response (tested on pine 10)
		/^".*" must be unique\.$/.test(body));

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
export const mergePineOptions = <T = BalenaSdk.PineOptions>(
	defaults: T,
	extras: T,
): T => {
	if (!extras) {
		return defaults;
	}

	const result = cloneDeep(defaults);

	for (const option of Object.keys(extras || {})) {
		// @ts-ignore
		let value = extras[option];
		switch (option) {
			case '$select':
				if (value != null) {
					if (!isArray(value)) {
						value = [value];
					}
				}

				// @ts-ignore
				result[option] = value;
				break;

			case '$orderby':
			case '$top':
			case '$skip':
				// @ts-ignore
				result[option] = value;
				break;

			case '$filter':
				// @ts-ignore
				if (defaults.$filter) {
					// @ts-ignore
					result.$filter = { $and: [defaults.$filter, value] };
				} else {
					// @ts-ignore
					result.$filter = value;
				}
				break;

			case '$expand':
				// @ts-ignore
				result.$expand = mergeExpandOptions(defaults.$expand, value);
				break;

			default:
				throw new Error(`Unknown pine option: ${option}`);
		}
	}

	return result;
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
	unauthorizedError,
	notFoundResponse,
	noDeviceForKeyResponse,
	noApplicationForKeyResponse,
	isUniqueKeyViolationResponse,
	treatAsMissingApplication,
	treatAsMissingDevice,
	isDevelopmentVersion,
	mergePineOptions,
};

const mergeExpandOptions = (defaultExpand: any, extraExpand: any) => {
	if (defaultExpand == null) {
		return extraExpand;
	}

	defaultExpand = convertExpandToObject(defaultExpand);
	extraExpand = convertExpandToObject(extraExpand);

	for (const expandKey of Object.keys(extraExpand || {})) {
		const extraExpandOptions = extraExpand[expandKey];
		const expandOptions =
			defaultExpand[expandKey] || (defaultExpand[expandKey] = {});

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
const convertExpandToObject = (expandOption: any) => {
	if (expandOption == null) {
		return {};
	} else if (isString(expandOption)) {
		return { [expandOption]: {} };
	} else if (isArray(expandOption)) {
		// Reduce the array into a single object
		return expandOption.reduce(
			(result, option) =>
				assign(result, isString(option) ? { [option]: {} } : option),
			{},
		);
	} else {
		// Check the options in this object are the ones we know how to merge
		for (const expandKey of Object.keys(expandOption || {})) {
			const expandRelationshipOptions = expandOption[expandKey];
			const invalidKeys = Object.keys(expandRelationshipOptions).filter(
				key => key !== '$select' && key !== '$expand' && key !== '$filter',
			);
			if (invalidKeys.length > 0) {
				throw new Error(`Unknown pine expand options: ${invalidKeys}`);
			}
		}

		return cloneDeep(expandOption);
	}
};
