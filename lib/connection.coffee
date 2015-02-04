###*
# @module resin/connection
# @private
###

isOnline = require('is-online')
request = require('request')

###*
# isOnline callback
# @callback module:resin/connection~isOnlineCallback
# @param {(Error|null)} error - error
# @param {Boolean} isOnline - is online
###

###*
# @summary Check network status
# @protected
# @function
# @protected
#
# @description A wrapper around isOnline in order to be able to stub it with Sinon
#
# @param {module:resin/connection~isOnlineCallback} callback - callback
#
# @example
# connection.isOnline (error, isOnline) ->
#		throw error if error?
#		console.log "Online? #{isOnline}"
###
exports.isOnline = isOnline
#
###*
# request callback
# @callback module:resin/connection~requestCallback
# @param {(Error|null)} error - error
# @param {Object} response - request response
###

###*
# @summary Send an HTTP request
# @protected
# @function
# @protected
#
# @description A wrapper around request in order to be able to stub it with Sinon
#
# @param {module:resin/connection~requestCallback} callback - callback
###
exports.request = request
