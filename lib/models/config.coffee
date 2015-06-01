###*
# @module resin.models.config
###

Promise = require('bluebird')
request = Promise.promisifyAll(require('resin-request'))

###*
# getAll callback
# @callback module:resin.models.config~getAllCallback
# @param {(Error|null)} error - error
# @param {Object} config - the configuration
###

###*
# @summary Get all configuration
# @public
# @function
#
# @param {module:resin.models.config~getAllCallback} callback - callback
#
# @example
#	resin.models.config.getAll (error, config) ->
#		throw error if error?
#		console.log(config)
###
exports.getAll = (callback) ->
	request.requestAsync
		method: 'GET'
		url: '/config'
	.get(1)
	.nodeify(callback)

###*
# getPubNubKeys callback
# @callback module:resin.models.config~getPubNubKeys
# @param {(Error|null)} error - error
# @param {Object} pubnubKeys - pubnub keys
###

###*
# @summary Get PubNub keys
# @public
# @function
#
# @param {module:resin.models.config~getPubNubKeys} callback - callback
#
# @example
#	resin.models.config.getPubNubKeys (error, pubnubKeys) ->
#		throw error if error?
#		console.log(pubnubKeys.subscribe_key)
#		console.log(pubnubKeys.publish_key)
###
exports.getPubNubKeys = (callback) ->
	exports.getAll().get('pubnub').nodeify(callback)

###*
# getDeviceTypes callback
# @callback module:resin.models.config~getDeviceTypes
# @param {(Error|null)} error - error
# @param {Object[]} deviceTypes - the device types
###

###*
# @summary Get device types
# @public
# @function
#
# @param {module:resin.models.config~getDeviceTypes} callback - callback
#
# @example
#	resin.models.config.getDeviceTypes (error, deviceTypes) ->
#		throw error if error?
#		console.log(deviceTypes)
###
exports.getDeviceTypes = (callback) ->
	exports.getAll().get('deviceTypes').nodeify(callback)
