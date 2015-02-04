###*
# @module resin/progress-state
# @protected
###

_ = require('lodash')

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
				throw new Error("Invalid total option: #{options.total}")

		# Percentage option

		if options.percentage?

			if not _.isNumber(options.percentage) or options.percentage < 0 or options.percentage > 100
				throw new Error("Invalid percentage option: #{options.percentage}")

		# ETA option

		if options.eta?

			if not _.isNumber(options.eta) or options.eta < 0
				throw new Error("Invalid eta option: #{options.eta}")

		# Received option

		if not options.received?
			throw new Error('Missing received option')

		if not _.isNumber(options.received) or options.received < 0
			throw new Error("Invalid received option: #{options.received}")

		if options.total? and options.received > options.total
			throw new Error("Received option can't be higher than total: #{options.received} > #{options.total}")

		# Delta option

		if not options.delta?
			throw new Error('Missing delta option')

		if not _.isNumber(options.delta) or options.delta < 0
			throw new Error("Invalid delta option: #{options.delta}")

		if options.total? and options.delta > options.total
			throw new Error("Delta option can't be higher than total: #{options.delta} > #{options.total}")

		if options.delta > options.received
			throw new Error("Delta option can't be higher than received: #{options.delta} > #{options.received}")

		_.extend(this, options)

getCurrentTime = ->
	return new Date().getTime()

ProgressState.createFromNodeRequestProgress = (callback) ->
	time = getCurrentTime()
	received = 0

	return (state) ->
		newTime = getCurrentTime()

		# TODO: Extract this logic and test it troughly

		remaining = state.total - state.received
		receivedDelta = state.received - received
		remainingTicks = remaining / receivedDelta

		timeDelta = newTime - time
		eta = Math.floor(remainingTicks * timeDelta)

		time = newTime

		progressState = new ProgressState
			percentage: state.percent
			received: state.received
			total: state.total
			eta: eta
			delta: receivedDelta

		return callback(progressState)

module.exports = ProgressState
