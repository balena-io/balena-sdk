###*
# @module resin.logs
###

_ = require('lodash-contrib')
PubNub = require('pubnub')
errors = require('resin-errors')
settings = require('./settings')
configModel = require('./models/config')

###*
# subscribe callback
# @callback module:resin.logs~subscribeCallback
# @param {(Error|null)} error - error
# @param {String|String[]} message - log message
###

###*
# @summary Subscribe to device logs by their UUID
# @public
# @function
#
# @param {String} uuid - the device uuid
# @param {Object} options - logs options (history=0, tail=false)
# @param {module:resin.logs~subscribeCallback} callback - callback
#
# @throws {Error} Will throw if `options.history` is not a number or parseable string.
#
# @todo Find a way to test this
#
# @example
# uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
# resin.logs.subscribe uuid, {
#		history: 20
# }, (error, message) ->
#		throw error if error?
#		console.log(message)
#
# @example
# uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
# resin.logs.subscribe uuid, {
#		tail: true
# }, (error, message) ->
#		throw error if error?
#		console.log(message)
###
exports.subscribe = (uuid, options = {}, callback) ->

	_.defaults options,
		history: 0
		tail: false

	if not _.isNumber(options.history)
		return callback(new errors.ResinInvalidOption('history', options.history))

	pubnubOptions = settings.get('pubnub')
	channel = _.template(settings.get('events.deviceLogs'), { uuid })

	configModel.getPubNubKeys (error, pubnubKeys) ->
		return callback(error) if error?

		_.extend(pubnubKeys, pubnubOptions)
		pubnub = PubNub.init(pubnubKeys)

		# TODO: PubNub doesn't close the connection if using only history().
		# Not even by using pubnub.unsubscribe(). The solution is to subscribe
		# to the channel and fetch history + unsubscribe right afterwards.
		# The following question might led to a response:
		# http://stackoverflow.com/questions/25806223/how-to-close-a-pubnub-connection

		return pubnub.subscribe
			channel: channel
			callback: (message) ->
				return if not options.tail
				callback(null, message)
			error: _.unary(callback)
			connect: ->
				pubnub.history
					count: options.history
					channel: channel
					error: _.unary(callback)
					callback: (message) ->
						if options.tail
							return callback(null, _.first(message))
						pubnub.unsubscribe { channel }, ->
							return callback(null, _.first(message))
