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

import { globalEnv } from './util/global-env';

// These constants are used to create globals for sharing defualt options between
// multiple instances of the SDK.
// See the `setSharedOptions()` and `fromSharedOptions()` methods.
const BALENA_SDK_SHARED_OPTIONS = 'BALENA_SDK_SHARED_OPTIONS';
const BALENA_SDK_HAS_USED_SHARED_OPTIONS = 'BALENA_SDK_HAS_USED_SHARED_OPTIONS';
const BALENA_SDK_HAS_SET_SHARED_OPTIONS = 'BALENA_SDK_HAS_SET_SHARED_OPTIONS';

/**
 * @namespace balena
 */

/**
 * @module balena-sdk
 */

/**
 * @alias module:balena-sdk
 * @summary Creates a new SDK instance using the default or the provided options.
 *
 * @description
 * The module exports a single factory function.
 *
 * @example
 * const getSdk = require('balena-sdk');
 * const balena = getSdk({
 * 	apiUrl: "https://api.balena-cloud.com/",
 * 	dataDirectory: "/opt/local/balena"
 * });
 */
const getSdk = function (opts) {
	let settings;
	if (opts == null) {
		opts = {};
	}
	const version = require('./util/sdk-version').default;
	const getRequest = require('balena-request');
	const BalenaAuth = require('balena-auth')['default'];
	const getPine = require('balena-pine');
	const errors = require('balena-errors');
	const { PubSub } = require('./util/pubsub');

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
	const sdkTemplate = {
		auth() {
			const { addCallbackSupportToModuleFactory } = require('./util/callbacks');
			return addCallbackSupportToModuleFactory(require('./auth').default);
		},
		models() {
			// don't try to add callbacks for this, since it's just a namespace
			// and it would otherwise break lazy loading since it would enumerate
			// all properties
			return require('./models');
		},
		logs() {
			const { addCallbackSupportToModuleFactory } = require('./util/callbacks');
			return addCallbackSupportToModuleFactory(require('./logs').default);
		},
		settings() {
			const { addCallbackSupportToModuleFactory } = require('./util/callbacks');
			return addCallbackSupportToModuleFactory(require('./settings').default);
		},
	};

	opts = Object.assign(
		{
			apiUrl: 'https://api.balena-cloud.com/',
			builderUrl: 'https://builder.balena-cloud.com/',
			isBrowser: typeof window !== 'undefined' && window !== null,
			// API version is configurable but only do so if you know what you're doing,
			// as the SDK is directly tied to a specific version.
			apiVersion: 'v6',
		},
		opts,
	);

	if (opts.isBrowser) {
		const { notImplemented } = require('./util');
		settings = {
			get: notImplemented,
			getAll: notImplemented,
		};
	} else {
		settings = require('balena-settings-client');
		if (opts.dataDirectory == null) {
			opts.dataDirectory = settings.get('dataDirectory');
		}
	}

	if ('apiKey' in opts) {
		// to prevent exposing it to balena-request directly
		// which would add it as a query sting option
		opts.apiKey = null;
	}

	const auth = new BalenaAuth(opts);
	const request = getRequest(Object.assign({}, opts, { auth }));
	const pine = getPine(Object.assign({}, opts, { auth, request }));
	const pubsub = new PubSub();

	const sdk = {};
	const deps = {
		settings,
		request,
		auth,
		pine,
		pubsub,
		sdkInstance: sdk,
	};

	Object.keys(sdkTemplate).forEach(function (moduleName) {
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
	});

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
		/** @private @returns Interceptor[] */
		get() {
			return request.interceptors;
		},
		set(/** @type Interceptor[] */ interceptors) {
			return (request.interceptors = interceptors);
		},
	});

	const versionHeaderInterceptor = {
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
	};

	sdk.interceptors.push(versionHeaderInterceptor);

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
	 * The balena-pine instance used internally. This should not be necessary
	 * in normal usage, but can be useful if you want to directly make pine
	 * queries to the api for some resource that isn't directly supported
	 * in the SDK.
	 *
	 * @example
	 * balena.pine.get({
	 * 	resource: 'release/$count',
	 * 	options: {
	 * 		$filter: { belongs_to__application: applicationId }
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
	 *   if (error.code === balena.errors.BalenaDeviceNotFound.code) {
	 *     ...
	 *   } else if (error.code === balena.errors.BalenaRequestError.code) {
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
 * @name setSharedOptions
 * @public
 * @function
 *
 * @description
 * Set options that are used by calls to `getSdk.fromSharedOptions()`.
 * The options accepted are the same as those used in the main SDK factory function.
 * If you use this method, it should be called as soon as possible during app
 * startup and before any calls to `fromSharedOptions()` are made.
 *
 * @param {Object} options - The shared default options
 * @param {String} [options.apiUrl='https://api.balena-cloud.com/'] - the balena API url to use.
 * @param {String} [options.builderUrl='https://builder.balena-cloud.com/'] - the balena builder url to use.
 * @param {String} [options.deviceUrlsBase='balena-devices.com'] - the base balena device API url to use.
 * @param {String} [options.dataDirectory='$HOME/.balena'] - *ignored in the browser*, the directory where the user settings are stored, normally retrieved like `require('balena-settings-client').get('dataDirectory')`.
 * @param {Boolean} [options.isBrowser] - the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value.
 * @param {Boolean} [options.debug] - when set will print some extra debug information.
 *
 * @example
 * const getSdk = require('balena-sdk');
 * getSdk.setSharedOptions({
 * 	apiUrl: 'https://api.balena-cloud.com/',
 * 	builderUrl: 'https://builder.balena-cloud.com/',
 * 	isBrowser: true,
 * });
 */
getSdk.setSharedOptions = function (options) {
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
 * @name fromSharedOptions
 * @public
 * @function
 *
 * @description
 * Create an SDK instance using shared default options set using the `setSharedOptions()` method.
 * If options have not been set using this method, then this method will use the
 * same defaults as the main SDK factory function.
 *
 * @example
 * const getSdk = require('balena-sdk');
 * const sdk = getSdk.fromSharedOptions();
 */
getSdk.fromSharedOptions = function () {
	const sharedOpts = globalEnv[BALENA_SDK_SHARED_OPTIONS];

	globalEnv[BALENA_SDK_HAS_USED_SHARED_OPTIONS] = true;

	return getSdk(sharedOpts);
};

module.exports = getSdk;
