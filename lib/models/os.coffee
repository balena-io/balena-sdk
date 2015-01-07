###*
# @module resin/models/os
###

url = require('url')
fs = require('fs')
server = require('../server')
settings = require('../settings')

###*
# download callback
# @callback module:resin/models/os~downloadCallback
# @param {(Error|null)} error - error
# @param {Object} response - response
# @param {*} body - body
###

###*
# @summary Download an OS image
# @function
#
# @param {Object} parameters - os parameters
# @param {String} destination - destination path
# @param {module:resin/models/os~downloadCallback} callback - callback
# @param {Function} onProgress - on progress callback
#
# @todo We should formalise the definition of parameters object.
#
# @example
# resin.models.os.download {
#		network: 'ethernet'
#		appId: 91
# }, '/opt/os.zip', (error) ->
#		throw error if error?
#	, (state) ->
#		console.log "Total: #{state.total}"
#		console.log "Received: #{state.received}"
###
exports.download = (parameters, destination, callback, onProgress) ->
	query = url.format(query: parameters)
	downloadUrl = url.resolve(settings.get('urls.download'), query)

	server.request
		method: 'GET'
		url: downloadUrl
		pipe: fs.createWriteStream(destination)
	, callback
	, onProgress
