_ = require('lodash')
errors = require('resin-errors')

NETWORK_WIFI = 'wifi'
NETWORK_ETHERNET = 'ethernet'

NETWORK_TYPES = [
	NETWORK_WIFI
	NETWORK_ETHERNET
]

VALID_OPTIONS = [
	'network'
	'appId'
	'wifiSsid'
	'wifiKey'
]

###*
# Create a set of connection parameters
# @name OSParams
# @private
# @class
# @param {Object} options - connection parameter options
#
# @throws {Error} If no appId option
# @throws {Error} If invalid appId option (not a number or parseable string)
# @throws {Error} If no network option
# @throws {Error} If network is not wifi or ethernet
# @throws {Error} If network is wifi and wifiSsid is missing
# @throws {Error} If network is wifi and wifiKey is missing
# @throws {Error} If a non supported option is passed
###
module.exports = class OSParams

	constructor: (options) ->
		if not options.appId?
			throw new errors.ResinMissingOption('appId')

		options.appId = _.parseInt(options.appId)

		if _.isNaN(options.appId)
			throw new errors.ResinInvalidOption('appId', options.appId)

		if not options.network?
			throw new errors.ResinMissingOption('network')

		if _.indexOf(NETWORK_TYPES, options.network) is -1
			throw new errors.ResinInvalidOption('network', options.network)

		if options.network == NETWORK_WIFI

			if not options.wifiSsid?
				throw new errors.ResinMissingOption('wifiSsid')

			if not options.wifiKey?
				throw new errors.ResinMissingOption('wifiKey')

		invalidOptions = _.difference(_.keys(options), VALID_OPTIONS)

		if not _.isEmpty(invalidOptions)
			throw new errors.ResinNonAllowedOption(_.first(invalidOptions))

		_.extend(this, options)
