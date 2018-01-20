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
find = require('lodash/find')
flatMap = require('lodash/flatMap')
max = require('lodash/max')
pubnubLogs = require('resin-device-logs')
rSemver = require('resin-semver')
errors = require('resin-errors')
moment = require('moment')
{ EventEmitter } = require('events')

{ findCallback } = require('./util')

API_LOGS_SUPERVISOR_VERSION_RANGE = '>=7.0.0'
LOGGING_OVERRIDE_VAR = 'RESIN_SUPERVISOR_NATIVE_LOGGER'

API_POLL_INTERVAL = 1000

getLogs = (deps, opts) ->
	{ pine } = deps
	configModel = require('./models/config')(deps, opts)
	deviceModel = require('./models/device')(deps, opts)

	exports = {}

	getContext = (uuidOrId) ->
		return Promise.props
			device: deviceModel.get uuidOrId,
				expand:
					# Get only the most recent device log
					owns__device_log:
						$top: '1'
						$select: 'device_timestamp'
						$orderby: 'device_timestamp desc'
					image_install:
						$select: 'id'
						$expand:
							# Get only the most recent image install log
							owns__image_install_log:
								$top: '1'
								$select: 'device_timestamp'
								$orderby: 'device_timestamp desc'
					device_config_variable: {}
					belongs_to__application:
						$select: 'id'
						$expand:
							application_config_variable: {}

			pubNubKeys: configModel.getPubNubKeys()

	usesApiLogs = (device) ->
		# If don't know the supervisor, assume it's a new one to start with
		hasNewSupervisor = !device.supervisor_version or rSemver.satisfies(
			device.supervisor_version,
			API_LOGS_SUPERVISOR_VERSION_RANGE
		)

		if !hasNewSupervisor
			return false

		deviceVar = find(device.device_config_variable, { name: LOGGING_OVERRIDE_VAR })
		appVar = find(device.belongs_to__application[0].application_config_variable, { name: LOGGING_OVERRIDE_VAR })

		if deviceVar
			return deviceVar.value != 'false'
		else if appVar
			return appVar.value != 'false'
		else
			return true

	getLogsFromApi = Promise.method (device, { fromTime, count } = {}) ->
		logOptions = Object.assign {
			$orderby: 'device_timestamp desc'
		},
		if fromTime? then {
			$filter:
				$gt: [
					$: 'device_timestamp'
					moment(fromTime).toISOString()
				]
		} else {},
		if count? then {
			$top: String(count)
		}

		return deviceModel.get device.id,
			select: 'id'
			expand:
				owns__device_log: logOptions
				image_install:
					$select: 'id'
					$expand:
						owns__image_install_log: logOptions
						image:
							$select: 'id'
							$expand:
								is_a_build_of__service:
									$select: 'id'

		.then (device) ->
			# Have to order desc and reverse so we can use $top
			# (there is no $bottom, sadly)
			deviceLogs = device.owns__device_log.reverse()
			imageInstallLogs = flatMap(device.image_install, (install) ->
				serviceId = install.image[0].is_a_build_of__service[0].id

				install.owns__image_install_log.reverse().map (logMessage) ->
					message: logMessage.message
					isSystem: logMessage.is_system
					timestamp: moment(logMessage.device_timestamp).valueOf()
					serviceId: serviceId
			)

			return deviceLogs.map (logMessage) ->
				message: logMessage.message
				isSystem: logMessage.is_system
				timestamp: moment(logMessage.device_timestamp).valueOf()
				serviceId: null
			.concat(imageInstallLogs)
			.sort (a, b) ->
				a.timestamp - b.timestamp

	subscribeToApiLogs = Promise.method (device) ->
		emitter = new EventEmitter()

		latestLogTime = max device.owns__device_log.concat(
			flatMap device.image_install,
				(install) -> install.owns__image_install_log
		).map (log) ->
			moment(log.device_timestamp).valueOf()

		intervalId = setInterval ->
			getLogsFromApi(device, { fromTime: latestLogTime || null })
			.then (logs) ->
				if !intervalId?
					# This means we unsubscribed while waiting for the API
					return

				logs.forEach (log) ->
					emitter.emit('line', log)
			.catch (e) ->
				emitter.emit('error', e)
		, API_POLL_INTERVAL

		emitter.unsubscribe = ->
			clearInterval(intervalId)
			intervalId = null

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
		getContext(uuidOrId)
		.then ({ pubNubKeys, device }) ->
			if usesApiLogs(device)
				subscribeToApiLogs(device)
			else
				pubnubLogs.subscribe(pubNubKeys, device)
		.asCallback(callback)

	###*
	# @summary Get device logs history
	# @name history
	# @function
	# @public
	# @memberof resin.logs
	#
	# @description
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
	exports.history = (uuidOrId, { count } = {}, callback) ->
		callback = findCallback(arguments)

		getContext(uuidOrId)
		.then ({ pubNubKeys, device }) ->
			if usesApiLogs(device)
				getLogsFromApi(device, { count })
			else
				pubnubLogs.history(pubNubKeys, device, { count })
		.asCallback(callback)

	return exports

module.exports = getLogs
