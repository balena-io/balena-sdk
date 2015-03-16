###*
# @module resin.progress-state
# @protected
###

_ = require('lodash')
errors = require('./errors')

###*
# Represent a progress state
# @name ProgressState
# @protected
# @class
# @param {Object} options - progress state options
#
# A ProgressState instance consists of the following fields:
#
# - total.
# - percentage.
# - eta.
# - received.
# - delta.
#
# @throws {Error} If the state options are invalid
###
class ProgressState

	constructor: (options) ->

		# Total option

		if options.total?

			if not _.isNumber(options.total) or options.total < 0
				throw new errors.ResinInvalidOption('total', options.total)

		# Percentage option

		if options.percentage?

			if not _.isNumber(options.percentage) or options.percentage < 0 or options.percentage > 100
				throw new errors.ResinInvalidOption('percentage', options.percentage)

		# ETA option

		if options.eta?

			if not _.isNumber(options.eta) or options.eta < 0
				throw new errors.ResinInvalidOption('eta', options.eta)

		# Received option

		if not options.received?
			throw new errors.ResinMissingOption('received')

		if not _.isNumber(options.received) or options.received < 0
			throw new errors.ResinInvalidOption('received', options.received)

		if options.total? and options.received > options.total
			throw new errors.ResinInvalidOption('received', options.received, "#{options.received} > #{options.total}")

		# Delta option

		if not options.delta?
			throw new errors.ResinMissingOption('delta')

		if not _.isNumber(options.delta) or options.delta < 0
			throw new errors.ResinInvalidOption('delta', options.delta)

		if options.total? and options.delta > options.total
			throw new errors.ResinInvalidOption('delta', options.delta, "#{options.delta} > #{options.total}")

		if options.delta > options.received
			throw new errors.ResinInvalidOption('delta', options.delta, "#{options.delta} > #{options.received}")

		_.extend(this, options)

getCurrentTime = ->
	return new Date().getTime()

###*
# createFromNodeRequestProgress callback
# @callback module:resin.auth~createFromNodeRequestProgressCallback
# @param {module:resin.progress-state~ProgressState} state - progress state
###

###*
# @summary Create a ProgressState listener from a node-request-progress state
# @protected
# @function
#
# @param {module:resin.auth~createFromNodeRequestProgressCallback} callback - callback
#
# @example
# request = require('request')
# progress = require('request-progress')
#
# onProgressCallback = (state) ->
#		console.log(state.percentage)
#
# progress(request(options))
#		.on('progress', ProgressState.createFromNodeRequestProgress(onProgressCallback))
#		.on('error', ...)
#		.on('close', ...)
###
ProgressState.createFromNodeRequestProgress = (callback) ->
	time = getCurrentTime()
	received = 0

	return (state) ->

		# TODO: Extract this logic and test it troughly

		# Return no state if the resource doesn't provides
		# us with enough information.
		return callback() if not state.total?

		newTime = getCurrentTime()
		timeDelta = newTime - time
		time = newTime

		remaining = state.total - state.received
		receivedDelta = state.received - received
		remainingTicks = remaining / receivedDelta
		eta = Math.floor(remainingTicks * timeDelta)

		progressState = new ProgressState
			percentage: state.percent
			received: state.received
			total: state.total
			eta: eta
			delta: receivedDelta

		return callback(progressState)

module.exports = ProgressState
