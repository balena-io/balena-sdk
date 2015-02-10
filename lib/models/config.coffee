###*
# @module resin.models.config
###

server = require('../server')
settings = require('../settings')

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
	url = settings.get('urls.config')
	server.get url, (error, response, config) ->
		return callback(error) if error?
		return callback(null, config)

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
	exports.getAll (error, config) ->
		return callback(error) if error?
		return callback(null, config.pubnub)
