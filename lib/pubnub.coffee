###*
# @module resin.pubnub
###

_ = require('lodash')
PubNub = require('pubnub')
configModel = require('./models/config')

###*
# getInstance callback
# @callback module:resin.logs~getInstanceCallback
# @param {(Error|null)} error - error
# @param {Object} instance - PubNub instance
###

###*
# @summary Get a PubNub Resin.io instance
# @private
# @function
#
# @param {module:resin.logs~getInstanceCallback} callback - callback
#
# @example
# PubNub.getInstance (error, pubnub) ->
#		throw error if error?
###
exports.getInstance = (callback) ->
	configModel.getPubNubKeys (error, pubnubKeys) ->
		return callback(error) if error?

		pubnubKeys.ssl = true
		pubnub = PubNub.init(pubnubKeys)
		return callback(null, pubnub)

###*
# @summary Get a device channel
# @private
# @function
#
# @param {String} uuid - device uuid
# @returns {String} device channel
#
# @example
# uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
# channel = PubNub.getDeviceChannel(uuid)
###
exports.getDeviceChannel = (uuid) ->
	return "device-#{uuid}-logs"

###*
# getChannelHistoryCallback callback
# @callback module:resin.pubnub~getChannelHistoryCallback
# @param {(Error|null)} error - error
# @param {Array} messages - messages
###

###*
# @summary Get a channel's history
# @private
# @function
#
# @param {Object} instance - PubNub instance
# @param {String} channel - channel
# @param {Object} options - options
# @param {module:resin.pubnub~getChannelHistoryCallback} callback - callback
#
# @example
# PubNub.getChannelHistory pubnub, 'my-channel',
#		count: 300
#	, (error, messages) ->
#		throw error if error?
#
#		for message in messages
#			console.log(message)
###
exports.getChannelHistory = (instance, channel, options, callback) ->
	instance.history
		count: options.history
		channel: channel
		error: callback
		callback: (data) ->
			messages = _.map _.first(data), (contents) ->
				return contents.message
			return callback(null, messages)

###*
# subscribeCallback callback
# @callback module:resin.pubnub~subscribeCallback
# @param {(Error|null)} error - error
###

###*
# @summary Subscribe to a channel
# @private
# @function
#
# @param {Object} instance - PubNub instance
# @param {String} channel - channel
# @param {Object} options - options
# @param {module:resin.pubnub~subscribeCallback} callback - callback
#
# @example
# PubNub.subscribe pubnub, 'my-channel',
#		message: (message) ->
#			console.log(message)
#	, (error) ->
#		throw error if error?
###
exports.subscribe = (instance, channel, options, callback) ->
	instance.subscribe
		channel: channel
		message: (data) ->
			return options.message(data.message)
		error: callback
		connect: ->
			return callback()

###*
# unsubscribeCallback callback
# @callback module:resin.pubnub~unsubscribeCallback
# @param {(Error|null)} error - error
###

###*
# @summary Unsubscribe from a channel
# @private
# @function
#
# @param {Object} instance - PubNub instance
# @param {String} channel - channel
# @param {module:resin.pubnub~unsubscribeCallback} callback - callback
#
# @example
# PubNub.unsubscribe pubnub, 'my-channel', (error) ->
#		throw error if error?
###
exports.unsubscribe = (instance, channel, callback) ->
	instance.unsubscribe({ channel })
	return callback()
