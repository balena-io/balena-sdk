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

Promise = require('bluebird')
errors = require('resin-errors')
{ EventEmitter } = require('events')
ndjson = require('ndjson')

{ findCallback } = require('./util')

getLogs = (deps, opts) ->
	{ request } = deps

	deviceModel = require('./models/device')(deps, opts)

	exports = {}

	getLogsPath = (device) ->
		"/device/v2/#{device.uuid}/logs"

	getLogsFromApi = (device, { count } = {}) ->
		request.send
			url: getLogsPath(device) + (if count then '?count=' + count else '')
			baseUrl: opts.apiUrl
		.get('body')

	subscribeToApiLogs = (device) ->
		emitter = new EventEmitter()
		request.stream
			url: getLogsPath(device) + '?stream=1'
			baseUrl: opts.apiUrl
		.then (stream) ->
			parser = ndjson()
			parser.on 'data', (log) ->
				emitter.emit('line', log)
			parser.on 'error', (err) ->
				emitter.emit('error', err)
			stream.pipe(parser)

		emitter.unsubscribe = ->
			# TODO: Close the connection

		return emitter

	###*
	# @typedef LogSubscription
	# @type {EventEmitter}
	# @memberof resin.logs
	#
	# @description
	# The log subscription emits events as log data arrives.
	# You can get a LogSubscription for a given device by calling `resin.logs.subscribe(deviceId)`
	###

	###*
	# @summary Unsubscribe from device logs
	# @name unsubscribe
	# @function
	# @public
	# @memberof resin.logs.LogSubscription
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
	# @memberof resin.logs.LogSubscription
	# @example
	# logs.on('line', function(line) {
	# 	console.log(line);
	# });
	###

	###*
	# @summary Event fired when an error has occured reading the device logs
	# @event error
	# @memberof resin.logs.LogSubscription
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
	# @memberof resin.logs
	#
	# @description
	# Connects to the stream of devices logs, returning a LogSubscription, which
	# can be used to listen for logs as they appear, line by line.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {resin.logs.LogSubscription}
	# @returns {Promise}
	#
	# @todo
	# We should consider making this a readable stream.
	#
	# @example
	# resin.logs.subscribe('7cf02a6').then(function(logs) {
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.subscribe(123).then(function(logs) {
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.subscribe('7cf02a6', function(error, logs) {
	# 	if (error) throw error;
	#
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.subscribe = (uuidOrId, callback) ->
		deviceModel.get(uuidOrId, select: 'uuid')
			.then (device) ->
				subscribeToApiLogs(device)
			.asCallback(callback)

	###*
	# @summary Get device logs history
	# @name history
	# @function
	# @public
	# @memberof resin.logs
	#
	# @description
	# Get an array of the latest log messages for a given device.
	#
	# **Note**: the default number of logs retrieved is 100.
	# To get a different number pass the `{ count: N }` to the options param.
	# Also note that the actual number of log lines can be bigger as the
	# Resin.io supervisor can combine lines sent in a short time interval
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)

	# @param {Object} [options] - options
	# @param {Number} [options.count=100] - Number of requests to return
	# @fulfil {Object[]} - history lines
	# @returns {Promise}
	#
	# @example
	# resin.logs.history('7cf02a6').then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.history(123).then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.history('7cf02a6', { count: 20 }, function(error, lines) {
	# 	if (error) throw error;
	#
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.history = (uuidOrId, options, callback) ->
		callback = findCallback(arguments)

		deviceModel.get(uuidOrId, select: 'uuid')
			.then (device) ->
				getLogsFromApi(device, options)
			.asCallback(callback)

	return exports

module.exports = getLogs
