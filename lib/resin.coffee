###
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

assign = require('lodash/assign')
mapValues = require('lodash/mapValues')
defaults = require('lodash/defaults')
getRequest = require('resin-request')
ResinAuth = require('resin-auth')['default']
getPine = require('resin-pine')
errors = require('resin-errors')
{ notImplemented } = require('./util')

# These constants are used to create globals for sharing defualt options between
# multiple instances of the SDK.
# See the `setSharedOptions()` and `fromSharedOptions()` methods.
RESIN_SDK_SHARED_OPTIONS = 'RESIN_SDK_SHARED_OPTIONS'
RESIN_SDK_HAS_USED_SHARED_OPTIONS = 'RESIN_SDK_HAS_USED_SHARED_OPTIONS'
RESIN_SDK_HAS_SET_SHARED_OPTIONS = 'RESIN_SDK_HAS_SET_SHARED_OPTIONS'

# Use window (web)/self (web worker)/global (node) as appropriate
globalEnv = if typeof window != 'undefined'
	window
else if typeof self != 'undefined'
	self
else if typeof global != 'undefined'
	global
else null # If we can't guarantee global state, don't fake it: fail instead.

###*
# @namespace resin
# @description
# Welcome to the Resin SDK documentation.
#
# This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.
#
# If you feel something is missing, not clear or could be improved, please don't hesitate to open an [issue in GitHub](https://github.com/resin-io/resin-sdk/issues/new), we'll be happy to help.
###
sdkTemplate =

	###*
	# @namespace models
	# @memberof resin
	###
	models: require('./models')

	###*
	# @namespace auth
	# @memberof resin
	###
	auth: require('./auth')

	###*
	# @namespace logs
	# @memberof resin
	###
	logs: require('./logs')

	###*
	# @namespace settings
	# @memberof resin
	###
	settings: require('./settings')

getSdk = (opts = {}) ->
	defaults opts,
		apiUrl: 'https://api.resin.io/'
		imageMakerUrl: 'https://img.resin.io/'
		isBrowser: window?

	# You cannot externally set the API version (as SDK implementation depends on it)
	opts.apiVersion = 'v4'

	if opts.isBrowser
		settings =
			get: notImplemented
			getAll: notImplemented
	else
		settings = require('resin-settings-client')
		defaults opts,
			dataDirectory: settings.get('dataDirectory')

	auth = new ResinAuth(opts)
	request = getRequest(assign({}, opts, { auth }))
	pine = getPine(assign({}, opts, { auth, request }))

	deps = {
		settings
		request
		auth
		pine
	}

	sdk = mapValues(sdkTemplate, (moduleFactory) -> moduleFactory(deps, opts))

	###*
	# @typedef Interceptor
	# @type {object}
	# @memberof resin.interceptors
	#
	# @description
	# An interceptor implements some set of the four interception hook callbacks.
	# To continue processing, each function should return a value or a promise that
	# successfully resolves to a value.
	#
	# To halt processing, each function should throw an error or return a promise that
	# rejects with an error.
	#
	# @property {function} [request] - Callback invoked before requests are made. Called with
	# the request options, should return (or resolve to) new request options, or throw/reject.
	#
	# @property {function} [response] - Callback invoked before responses are returned. Called with
	# the response, should return (or resolve to) a new response, or throw/reject.
	#
	# @property {function} [requestError] - Callback invoked if an error happens before a request.
	# Called with the error itself, caused by a preceeding request interceptor rejecting/throwing
	# an error for the request, or a failing in preflight token validation. Should return (or resolve
	# to) new request options, or throw/reject.
	#
	# @property {function} [responseError] - Callback invoked if an error happens in the response.
	# Called with the error itself, caused by a preceeding response interceptor rejecting/throwing
	# an error for the request, a network error, or an error response from the server. Should return
	# (or resolve to) a new response, or throw/reject.
	###


	###*
	# @summary Array of interceptors
	# @member {Interceptor[]} interceptors
	# @public
	# @memberof resin
	#
	# @description
	# The current array of interceptors to use. Interceptors intercept requests made
	# internally and are executed in the order they appear in this array for requests,
	# and in the reverse order for responses.
	#
	# @example
	# resin.interceptors.push({
	#	responseError: function (error) {
	#		console.log(error);
	#		throw error;
	#	})
	# });
	###
	Object.defineProperty sdk, 'interceptors',
		get: -> request.interceptors,
		set: (interceptors) -> request.interceptors = interceptors

	###*
	# @summary Resin request instance
	# @member {Object} request
	# @public
	# @memberof resin
	#
	# @description
	# The resin-request instance used internally. This should not be necessary
	# in normal usage, but can be useful if you want to make an API request directly,
	# using the same token and hooks as the SDK.
	#
	# @example
	# resin.request.send({ url: 'http://api.resin.io/ping' });
	###
	sdk.request = request

	###*
	# @summary Resin pine instance
	# @member {Object} pine
	# @public
	# @memberof resin
	#
	# @description
	# The resin-pine instance used internally. This should not be necessary
	# in normal usage, but can be useful if you want to directly make pine
	# queries to the api for some resource that isn't directly supported
	# in the SDK.
	#
	# @example
	# resin.pine.get({
	#	resource: 'release/$count',
	#	options: {
	#		filter: { belongs_to__application: applicationId }
	#	}
	# });
	###
	sdk.pine = pine

	###*
	# @summary Resin errors module
	# @member {Object} errors
	# @public
	# @memberof resin
	#
	# @description
	# The resin-errors module used internally. This is provided primarily for
	# convenience, and to avoid the necessity for separate resin-errors
	# dependencies. You'll want to use this if you need to match on the specific
	# type of error thrown by the SDK.
	#
	# @example
	# resin.models.device.get(123).catch(function (error) {
	#   if (error.code === resin.errors.ResinDeviceNotFound.code) {
	#     ...
	#   } else if (error.code === resin.errors.ResinRequestError.code) {
	#     ...
	#   }
	# });
	###
	sdk.errors = errors

	return sdk

###*
# @summary Set shared default options
# @name setSharedOptions
# @public
# @function
# @memberof resin
#
# @description
# Set options that are used by calls to `resin.fromSharedOptions()`.
# The options accepted are the same as those used in the main SDK factory function.
# If you use this method, it should be called as soon as possible during app
# startup and before any calls to `fromSharedOptions()` are made.
#
# @params {Object} opts - The shared default options
#
# @example
# resin.setSharedOptions({
# 	apiUrl: 'https://api.resin.io/',
# 	imageMakerUrl: 'https://img.resin.io/',
# 	isBrowser: true,
# });
###
getSdk.setSharedOptions = (opts) ->
	if globalEnv[RESIN_SDK_HAS_USED_SHARED_OPTIONS]
		console.error('Shared SDK options have already been used. You may have a race condition in your code.')

	if globalEnv[RESIN_SDK_HAS_SET_SHARED_OPTIONS]
		console.error('Shared SDK options have already been set. You may have a race condition in your code.')

	globalEnv[RESIN_SDK_SHARED_OPTIONS] = opts
	globalEnv[RESIN_SDK_HAS_SET_SHARED_OPTIONS] = true

###*
# @summary Create an SDK instance using shared default options
# @name fromSharedOptions
# @public
# @function
# @memberof resin
#
# @description
# Create an SDK instance using shared default options set using the `setSharedOptions()` method.
# If options have not been set using this method, then this method will use the
# same defaults as the main SDK factory function.
#
# @params {Object} opts - The shared default options
#
# @example
# const sdk = resin.fromSharedOptions();
###
getSdk.fromSharedOptions = ->
	sharedOpts = globalEnv[RESIN_SDK_SHARED_OPTIONS]

	globalEnv[RESIN_SDK_HAS_USED_SHARED_OPTIONS] = true

	getSdk(sharedOpts)

module.exports = getSdk
