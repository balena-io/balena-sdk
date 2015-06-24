###*
# @module resin.logs
###

Promise = require('bluebird')
logs = require('resin-device-logs')
configModel = require('./models/config')
deviceModel = require('./models/device')

###*
# @summary Subscribe to device logs
# @function
# @public
#
# @description
# The `logs` object yielded by this function emits the following events:
#
# - `line`: when a log line is received.
# - `error`: when an error happens.
#
# @param {String} deviceName - device name
# @returns {Promise<EventEmitter>} logs
#
# @todo
# We should consider making this a readable stream.
#
# @example
# resin.logs.subscribe('MyDevice').then (logs) ->
# 	logs.on 'line', (line) ->
# 		console.log(line)
###
exports.subscribe = (deviceName, callback) ->
	Promise.props
		uuid: deviceModel.get(deviceName).get('uuid')
		pubNubKeys: configModel.getPubNubKeys()
	.then (results) ->
		return logs.subscribe(results.pubNubKeys, results.uuid)
	.nodeify(callback)

###*
# @summary Get device logs history
# @function
# @public
#
# @param {String} deviceName - device name
# @returns {Promise<String[]>} history lines
#
# @example
# resin.logs.history('MyDevice').then (lines) ->
# 	for line in lines
# 		console.log(line)
###
exports.history = (deviceName, callback) ->
	Promise.props
		uuid: deviceModel.get(deviceName).get('uuid')
		pubNubKeys: configModel.getPubNubKeys()
	.then (results) ->
		return logs.history(results.pubNubKeys, results.uuid)
	.nodeify(callback)
