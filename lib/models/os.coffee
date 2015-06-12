###*
# @module resin.models.os
###

_ = require('lodash')
Promise = require('bluebird')
url = require('url')
fs = require('fs')
request = Promise.promisifyAll(require('resin-request'))
token = require('resin-token')
errors = require('resin-errors')
OSParams = require('./os-params')

###*
# download callback
# @callback module:resin.models.os~downloadCallback
# @param {(Error|null)} error - error
# @param {Object} response - response
# @param {*} body - body
###

###*
# @summary Download an OS image
# @public
# @function
#
# @param {Object} parameters - os parameters
# @param {String} parameters.network - network type
# @param {Number} parameters.appId - application id
# @param {String} [parameters.wifiSsid] - wifi ssid, if network is wifi
# @param {String} [parameters.wifiKey] - wifi key, if network is wifi
# @param {Function} [parameters.onProgress] - on progress callback
# @param {String} destination - destination path
# @param {module:resin.models.os~downloadCallback} callback - callback
#
# @throws {Error} If parameters is not an instance of {@link module:resin/connection.OSParams}
#
# @todo Find a way to test this
#
# @example
# parameters =
#		network: 'ethernet'
#		appId: 91
#		onProgress: (state) ->
#			return if not state?
#			console.log "Total: #{state.total}"
#			console.log "Received: #{state.received}"
#
# resin.models.os.download parameters, '/opt/os.zip', (error) ->
#		throw error if error?
###
exports.download = (options, destination, callback) ->
	Promise.try ->
		if not token.getUsername()?
			throw new errors.ResinNotLoggedIn()

		osParams = _.omit(options, 'onProgress')
		query = url.format(query: new OSParams(osParams))

		return request.requestAsync
			method: 'GET'
			url: url.resolve('/download', query)
			pipe: fs.createWriteStream(destination)
			onProgress: options.onProgress

	.return(destination)
	.nodeify(callback)
