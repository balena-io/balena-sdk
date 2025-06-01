/*
Copyright 2016 Balena

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import type {
	BalenaRequest,
	BalenaRequestOptions,
	Interceptor,
} from 'balena-request';
import { globalEnv } from './util/global-env';

export * from './types/jwt';
export * from './types/contract';
export * from './types/user-invite';
export * from './types/auth';

export type { Interceptor };


export type { ApplicationMembershipCreationOptions } from './models/application-membership';
export type { ApplicationInviteOptions } from './models/application-invite';
export type {
	BankAccountBillingInfo,
	BillingAccountAddressInfo,
	BillingAccountInfo,
	BillingAddonPlanInfo,
	BillingInfo,
	BillingInfoType,
	BillingPlanBillingInfo,
	BillingPlanInfo,
	CardBillingInfo,
	InvoiceInfo,
	PlanChangeOptions,
	TokenBillingSubmitInfo,
} from './models/billing';
export type {
	GaConfig,
	Config,
	ConfigVarDefinition,
	DeviceTypeJson,
} from './models/config';
export type {
	DeviceState,
	DeviceMetrics,
	OverallStatus,
	SupervisorStatus,
} from './models/device';
export type { ReleaseWithImageDetails } from './models/release';
export type { OrganizationMembershipCreationOptions } from './models/organization-membership';
export type { OrganizationInviteOptions } from './models/organization-invite';
export type {
	ImgConfigOptions,
	OsDownloadOptions,
	OsLines,
	OsTypes,
	OsUpdateVersions,
	OsVersion,
} from './models/os';
export type { OsUpdateActionResult } from './util/device-actions/os-update';
export type { BuilderUrlDeployOptions } from './util/builder';
export type {
	CurrentService,
	CurrentServiceWithCommit,
	DeviceWithServiceDetails,
} from './util/device-service-details';
export type {
	BaseLog,
	ServiceLog,
	SystemLog,
	LogMessage,
	LogsSubscription,
	LogsOptions,
} from './logs';
import type { PinejsClient } from './pine';

export interface InjectedDependenciesParam {
	// Do not destructure sub-modules, to allow lazy loading only when needed.
	sdkInstance: BalenaSDK;
	settings: {
		get(key: string): string;
		getAll(): { [key: string]: string };
	};
	request: BalenaRequest;
	auth: import('balena-auth').default;
	pine: PinejsClient;
	pubsub: import('./util/pubsub').PubSub;
}

export interface SdkOptions {
	apiUrl?: string;
	builderUrl?: string;
	dashboardUrl?: string;
	dataDirectory?: string | false;
	isBrowser?: boolean;
	debug?: boolean;
	deviceUrlsBase?: string;
	requestLimit?: number;
	requestLimitInterval?: number;
	retryRateLimitedRequests?: boolean;
	requestBatchingChunkSize?:
		| number
		| {
				numericId: number;
				stringId: number;
		  };
}

export interface InjectedOptionsParam extends SdkOptions {
	apiUrl: string;
	apiVersion: string;
}

// These constants are used to create globals for sharing defualt options between
// multiple instances of the SDK.
// See the `setSharedOptions()` and `fromSharedOptions()` methods.
const BALENA_SDK_SHARED_OPTIONS = 'BALENA_SDK_SHARED_OPTIONS';
const BALENA_SDK_HAS_USED_SHARED_OPTIONS = 'BALENA_SDK_HAS_USED_SHARED_OPTIONS';
const BALENA_SDK_HAS_SET_SHARED_OPTIONS = 'BALENA_SDK_HAS_SET_SHARED_OPTIONS';

const sdkTemplate = {
	/* eslint-disable @typescript-eslint/no-require-imports */
	auth() {
		return (require('./auth') as typeof import('./auth')).default;
	},
	models() {
		// don't try to add callbacks for this, since it's just a namespace
		// and it would otherwise break lazy loading since it would enumerate
		// all properties
		return require('./models') as typeof import('./models');
	},
	logs() {
		return (require('./logs') as typeof import('./logs')).default;
	},
	settings() {
		return (require('./settings') as typeof import('./settings')).default;
	},
	/* eslint-enable @typescript-eslint/no-require-imports */
};

export type BalenaSDK = {
	[key in keyof typeof sdkTemplate]: ReturnType<
		ReturnType<(typeof sdkTemplate)[key]>
	>;
} & {
	interceptors: Interceptor[];
	request: BalenaRequest;
	pine: PinejsClient;
	utils: import('./util').BalenaUtils;
	errors: typeof import('balena-errors');
	version: string;
};

/**
 * @namespace balena
 */

/**
 * @module balena-sdk
 */

/**
 * @summary Creates a new SDK instance using the default or the provided options.
 *
 * @description
 * The module exports a single factory function.
 *
 * @example
 * // with es6 imports
 * import { getSdk } from 'balena-sdk';
 * // or with node require
 * const { getSdk } = require('balena-sdk');
 *
 * const balena = getSdk({
 * 	apiUrl: "https://api.balena-cloud.com/",
 * 	dataDirectory: "/opt/local/balena"
 * });
 */
export const getSdk = function ($opts?: SdkOptions) {
	const opts: InjectedOptionsParam = {
		apiUrl: 'https://api.balena-cloud.com/',
		builderUrl: 'https://builder.balena-cloud.com/',
		isBrowser: typeof window !== 'undefined' && window !== null,
		// API version is configurable but only do so if you know what you're doing,
		// as the SDK is directly tied to a specific version.
		apiVersion: 'v7',
		...$opts,
	};

	/* eslint-disable @typescript-eslint/no-require-imports */
	const version = (
		require('./util/sdk-version') as typeof import('./util/sdk-version')
	).default;
	const { getRequest } = require('balena-request') as {
		getRequest: (
			opts: SdkOptions & { auth: InjectedDependenciesParam['auth'] },
		) => BalenaRequest;
	};
	const BalenaAuth = (require('balena-auth') as typeof import('balena-auth'))
		.default;
	const { createPinejsClient } = require('./pine') as typeof import('./pine');
	const errors = require('balena-errors') as typeof import('balena-errors');
	const { PubSub } = require('./util/pubsub') as typeof import('./util/pubsub');

	/**
	 * @namespace models
	 * @memberof balena
	 */

	/**
	 * @namespace auth
	 * @memberof balena
	 */

	/**
	 * @namespace logs
	 * @memberof balena
	 */

	/**
	 * @namespace settings
	 * @memberof balena
	 */

	/**
	 * @namespace utils
	 * @memberof balena
	 */

	const settings = (
		require('./util/settings-client') as typeof import('./util/settings-client')
	).loadSettingsClient(opts);
	if (!opts.isBrowser && opts.dataDirectory == null) {
		opts.dataDirectory = settings.get('dataDirectory');
	}

	if ('apiKey' in opts) {
		// to prevent exposing it to balena-request directly
		// which would add it as a query sting option
		delete opts.apiKey;
	}

	const auth = new BalenaAuth(opts);
	const request = getRequest({ ...opts, auth });
	if (opts.requestLimit != null && opts.requestLimit > 0) {
		const pThrottle = require('p-throttle') as typeof import('p-throttle');
		request.send = pThrottle({
			limit: opts.requestLimit,
			interval: opts.requestLimitInterval ?? 60 * 1000,
			strict: true,
		})(request.send);
	}
	const pine = createPinejsClient({}, { ...opts, auth, request });
	const pubsub = new PubSub();

	const sdk = {} as BalenaSDK;
	const deps: InjectedDependenciesParam = {
		settings,
		request,
		auth,
		pine,
		pubsub,
		sdkInstance: sdk,
	};

	(Object.keys(sdkTemplate) as Array<keyof typeof sdkTemplate>).forEach(
		function (moduleName) {
			Object.defineProperty(sdk, moduleName, {
				enumerable: true,
				configurable: true,
				get() {
					const moduleFactory = sdkTemplate[moduleName]();
					// We need the delete first as the current property is read-only
					// and the delete removes that restriction
					delete this[moduleName];
					return (this[moduleName] = moduleFactory(deps, opts));
				},
			});
		},
	);

	/**
	 * @typedef Interceptor
	 * @type {object}
	 * @memberof balena.interceptors
	 *
	 * @description
	 * An interceptor implements some set of the four interception hook callbacks.
	 * To continue processing, each function should return a value or a promise that
	 * successfully resolves to a value.
	 *
	 * To halt processing, each function should throw an error or return a promise that
	 * rejects with an error.
	 *
	 * @property {function} [request] - Callback invoked before requests are made. Called with
	 * the request options, should return (or resolve to) new request options, or throw/reject.
	 *
	 * @property {function} [response] - Callback invoked before responses are returned. Called with
	 * the response, should return (or resolve to) a new response, or throw/reject.
	 *
	 * @property {function} [requestError] - Callback invoked if an error happens before a request.
	 * Called with the error itself, caused by a preceeding request interceptor rejecting/throwing
	 * an error for the request, or a failing in preflight token validation. Should return (or resolve
	 * to) new request options, or throw/reject.
	 *
	 * @property {function} [responseError] - Callback invoked if an error happens in the response.
	 * Called with the error itself, caused by a preceeding response interceptor rejecting/throwing
	 * an error for the request, a network error, or an error response from the server. Should return
	 * (or resolve to) a new response, or throw/reject.
	 */

	/**
	 * @summary Array of interceptors
	 * @member {Interceptor[]} interceptors
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The current array of interceptors to use. Interceptors intercept requests made
	 * internally and are executed in the order they appear in this array for requests,
	 * and in the reverse order for responses.
	 *
	 * @example
	 * balena.interceptors.push({
	 * 	responseError: function (error) {
	 * 		console.log(error);
	 * 		throw error;
	 * 	})
	 * });
	 */
	Object.defineProperty(sdk, 'interceptors', {
		get(): Interceptor[] {
			return request.interceptors;
		},
		set(interceptors: Interceptor[]) {
			return (request.interceptors = interceptors);
		},
	});

	/**
	 * @summary Balena utils instance
	 * @member {Object} utils
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The utils instance offers some convenient features for clients.
	 *
	 * @example
	 * balena.utils.mergePineOptions(
	 *  { $expand: { device: { $select: ['id'] } } },
	 *  { $expand: { device: { $select: ['name'] } } },
	 * );
	 *
	 * @example
	 * // Creating a new WebResourceFile in case 'File' API is not available.
	 * new balena.utils.BalenaWebResourceFile(
	 *   [fs.readFileSync('./file.tgz')],
	 *   'file.tgz'
	 * );
	 */
	Object.defineProperty(sdk, 'utils', {
		enumerable: true,
		configurable: true,
		get() {
			const { mergePineOptions, BalenaWebResourceFile } =
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				require('./util') as typeof import('./util');
			return { mergePineOptions, BalenaWebResourceFile };
		},
	});

	// versionHeaderInterceptor
	sdk.interceptors.push({
		request($request) {
			let { url } = $request;

			if (typeof url !== 'string') {
				return $request;
			}

			if (typeof $request.baseUrl === 'string') {
				url = $request.baseUrl + url;
			}

			if (url.indexOf(opts.apiUrl) === 0) {
				$request.headers['X-Balena-Client'] = `balena-sdk/${version}`;
			}

			return $request;
		},
	});

	if (opts.retryRateLimitedRequests) {
		// retryAfter429ErrorsInterceptor
		sdk.interceptors.push({
			async responseError(error) {
				if (
					!(error instanceof sdk.errors.BalenaRequestError) ||
					error.statusCode !== 429
				) {
					throw error;
				}
				const requestOptions = error.requestOptions as BalenaRequestOptions & {
					doNotRetry?: boolean;
				};
				if (requestOptions.doNotRetry) {
					throw error;
				}
				const retryAfterStr = error.responseHeaders?.get('Retry-After');
				const retryAfter =
					retryAfterStr != null ? parseInt(retryAfterStr, 10) : undefined;
				if (
					retryAfter == null ||
					!Number.isInteger(retryAfter) ||
					retryAfter < 0
				) {
					throw error;
				}

				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const { delay } = require('./util') as typeof import('./util');
				await delay(retryAfter * 1000);

				return await sdk.request.send(requestOptions);
			},
		});
	}

	/**
	 * @summary Balena request instance
	 * @member {Object} request
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The balena-request instance used internally. This should not be necessary
	 * in normal usage, but can be useful if you want to make an API request directly,
	 * using the same token and hooks as the SDK.
	 *
	 * @example
	 * balena.request.send({ url: 'http://api.balena-cloud.com/ping' });
	 */
	sdk.request = request;

	/**
	 * @summary Balena pine instance
	 * @member {Object} pine
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The pinejs-client instance used internally. This should not be necessary
	 * in normal usage, but can be useful if you want to directly make pine
	 * queries to the api for some resource that isn't directly supported
	 * in the SDK.
	 *
	 * @example
	 * balena.pine.get({
	 * 	resource: 'release',
	 * 	options: {
	 * 		$count: {
	 * 			$filter: { belongs_to__application: applicationId }
	 * 		}
	 * 	}
	 * });
	 */
	sdk.pine = pine;

	/**
	 * @summary Balena errors module
	 * @member {Object} errors
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The balena-errors module used internally. This is provided primarily for
	 * convenience, and to avoid the necessity for separate balena-errors
	 * dependencies. You'll want to use this if you need to match on the specific
	 * type of error thrown by the SDK.
	 *
	 * @example
	 * balena.models.device.get(123).catch(function (error) {
	 *   if (error.code === balena.errors.BalenaDeviceNotFound.prototype.code) {
	 *     ...
	 *   } else if (error.code === balena.errors.BalenaRequestError.prototype.code) {
	 *     ...
	 *   }
	 * });
	 */
	sdk.errors = errors;

	sdk.version = version;

	return sdk;
};

/**
 * @summary Set shared default options
 * @public
 * @function
 *
 * @description
 * Set options that are used by calls to `fromSharedOptions()`.
 * The options accepted are the same as those used in the main SDK factory function.
 * If you use this method, it should be called as soon as possible during app
 * startup and before any calls to `fromSharedOptions()` are made.
 *
 * @param {Object} options - The shared default options
 * @param {String} [options.apiUrl='https://api.balena-cloud.com/'] - the balena API url to use.
 * @param {String} [options.builderUrl='https://builder.balena-cloud.com/'] - the balena builder url to use.
 * @param {String} [options.deviceUrlsBase='balena-devices.com'] - the base balena device API url to use.
 * @param {Number} [options.requestLimit] - the number of requests per requestLimitInterval that the SDK should respect.
 * @param {Number} [options.requestLimitInterval = 60000] - the timespan that the requestLimit should apply to in milliseconds, defaults to 60000 (1 minute).
 * @param {Boolean} [options.retryRateLimitedRequests = false] - when enabled the sdk will retry requests that are failing with a 429 Too Many Requests status code and that include a numeric Retry-After response header.
 * @param {String|False} [options.dataDirectory='$HOME/.balena'] - *ignored in the browser unless false*, the directory where the user settings are stored, normally retrieved like `require('balena-settings-client').get('dataDirectory')`. Providing `false` creates an isolated in-memory instance.
 * @param {Boolean} [options.isBrowser] - the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value.
 * @param {Boolean} [options.debug] - when set will print some extra debug information.
 *
 * @example
 * import { setSharedOptions } from 'balena-sdk';
 * setSharedOptions({
 * 	apiUrl: 'https://api.balena-cloud.com/',
 * 	builderUrl: 'https://builder.balena-cloud.com/',
 * 	isBrowser: true,
 * });
 */
export const setSharedOptions = function (options: SdkOptions) {
	if (globalEnv[BALENA_SDK_HAS_USED_SHARED_OPTIONS]) {
		console.error(
			'Shared SDK options have already been used. You may have a race condition in your code.',
		);
	}

	if (globalEnv[BALENA_SDK_HAS_SET_SHARED_OPTIONS]) {
		console.error(
			'Shared SDK options have already been set. You may have a race condition in your code.',
		);
	}

	globalEnv[BALENA_SDK_SHARED_OPTIONS] = options;
	globalEnv[BALENA_SDK_HAS_SET_SHARED_OPTIONS] = true;
};

/**
 * @summary Create an SDK instance using shared default options
 * @public
 * @function
 *
 * @description
 * Create an SDK instance using shared default options set using the `setSharedOptions()` method.
 * If options have not been set using this method, then this method will use the
 * same defaults as the main SDK factory function.
 *
 * @example
 * import { fromSharedOptions } from 'balena-sdk';
 * const sdk = fromSharedOptions();
 */
export const fromSharedOptions = function () {
	const sharedOpts = globalEnv[BALENA_SDK_SHARED_OPTIONS];

	globalEnv[BALENA_SDK_HAS_USED_SHARED_OPTIONS] = true;

	return getSdk(sharedOpts);
};
