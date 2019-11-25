###
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
###

Promise = require('bluebird')
querystring = require('querystring')
errors = require('balena-errors')
{ EventEmitter } = require('events')
ndjson = require('ndjson')
{
	AbortController: AbortControllerPonyfill
} = require('abortcontroller-polyfill/dist/cjs-ponyfill')

{ findCallback } = require('./util')
{ globalEnv } = require('./util/global-env')

AbortController = globalEnv?.AbortController || AbortControllerPonyfill

getLogs = (deps, opts) ->
	{ request } = deps

	deviceModel = require('./models/device').default(deps, opts)

	exports = {}

	getLogsUrl = (device, options) ->
		query = querystring.stringify(options)
		return "/device/v2/#{device.uuid}/logs?#{query}"

	getLogsFromApi = (device, options = {}) ->
		request.send
			url: getLogsUrl(device, options)
			baseUrl: opts.apiUrl
		.get('body')

	subscribeToApiLogs = (device, options = {}) ->
		emitter = new EventEmitter()
		controller = new AbortController()
		parser = ndjson()

		request.stream
			url: getLogsUrl(device, Object.assign({}, options, { stream: 1 }))
			baseUrl: opts.apiUrl
			signal: controller.signal
		.then (stream) ->
			# Forward request errors to the parser
			stream.on 'error', (e) ->
				parser.emit('error', e)

			parser.on 'data', (log) ->
				if not controller.signal.aborted
					emitter.emit('line', log)

			parser.on 'error', (err) ->
				if not controller.signal.aborted
					emitter.emit('error', err)

			stream.pipe(parser)
		.catch (e) ->
			# Forward request setup errors
			if not controller.signal.aborted
				emitter.emit('error', e)

		emitter.unsubscribe = ->
			controller.abort()
			parser.destroy()

		return emitter

	###*
	# @typedef LogSubscription
	# @type {EventEmitter}
	# @memberof balena.logs
	#
	# @description
	# The log subscription emits events as log data arrives.
	# You can get a LogSubscription for a given device by calling `balena.logs.subscribe(deviceId)`
	###

	###*
	# @summary Unsubscribe from device logs
	# @name unsubscribe
	# @function
	# @public
	# @memberof balena.logs.LogSubscription
	#
	# @description
	# Disconnect from the logs feed and stop receiving any future events on this emitter.
	#
	# @example
	# logs.unsubscribe();
	###

	###*
	# @summary Event fired when a new line of log output is available
	# @event line
	# @memberof balena.logs.LogSubscription
	# @example
	# logs.on('line', function(line) {
	# 	console.log(line);
	# });
	###

	###*
	# @summary Event fired when an error has occured reading the device logs
	# @event error
	# @memberof balena.logs.LogSubscription
	# @example
	# logs.on('error', function(error) {
	# 	console.error(error);
	# });
	###

	###*
	# @summary Subscribe to device logs
	# @name subscribe
	# @function
	# @public
	# @memberof balena.logs
	#
	# @description
	# Connects to the stream of devices logs, returning a LogSubscription, which
	# can be used to listen for logs as they appear, line by line.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options] - options
	# @param {Number|'all'} [options.count=0] - number of historical messages to include (or 'all')
	# @fulfil {balena.logs.LogSubscription}
	# @returns {Promise}
	#
	# @example
	# balena.logs.subscribe('7cf02a6').then(function(logs) {
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# balena.logs.subscribe(123).then(function(logs) {
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# balena.logs.subscribe('7cf02a6', function(error, logs) {
	# 	if (error) throw error;
	#
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.subscribe = (uuidOrId, options, callback) ->
		# TODO: We should consider making this a readable stream.
		callback = findCallback(arguments)

		deviceModel.get(uuidOrId, $select: 'uuid')
			.then (device) ->
				subscribeToApiLogs(device, options)
			.asCallback(callback)

	###*
	# @summary Get device logs history
	# @name history
	# @function
	# @public
	# @memberof balena.logs
	#
	# @description
	# Get an array of the latest log messages for a given device.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)

	# @param {Object} [options] - options
	# @param {Number|'all'} [options.count=1000] - number of log messages to return (or 'all')
	# @fulfil {Object[]} - history lines
	# @returns {Promise}
	#
	# @example
	# balena.logs.history('7cf02a6').then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# balena.logs.history(123).then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# balena.logs.history('7cf02a6', { count: 20 }, function(error, lines) {
	# 	if (error) throw error;
	#
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.history = (uuidOrId, options, callback) ->
		callback = findCallback(arguments)

		deviceModel.get(uuidOrId, $select: 'uuid')
			.then (device) ->
				getLogsFromApi(device, options)
			.asCallback(callback)

	return exports

module.exports = getLogs
