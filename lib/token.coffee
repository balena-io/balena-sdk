###*
# @module resin/data/token
# @private
###

data = require('./data')

# TODO: Move to settings

###*
# @ignore
###
TOKEN_KEY = 'token'

###*
# saveToken callback
# @callback module:resin/data/token~saveTokenCallback
# @param {(Error|null)} error - error
###

###*
# @summary Save token
# @private
# @function
#
# @description The token is saved to $(dataPrefix)/token, which usually equals to $HOME/.resin/token
# The token is saved as plain text.
#
# @param {String} newToken - the token
# @param {resin/data/token~saveToken} callback - callback
#
# @todo We should make the token more secure
#
# @example
#	resin.token.saveToken myToken, (error) ->
#		throw error if error?
###
exports.saveToken = (newToken, callback) ->
	data.setText(TOKEN_KEY, newToken, callback)

###*
# hasToken callback
# @callback module:resin/data/token~hasTokenCallback
# @param {Boolean} hasToken - has token
###

###*
# @summary Check if we have any token saved
# @private
# @function
#
# @param {module:resin/data/token~hasTokenCallback} callback - callback
#
# @example
#	resin.token.hasToken (hasToken) ->
#		if hasToken
#			console.log('It\'s there!')
#		else
#			console.log('It\'s not there!')
###
exports.hasToken = (callback) ->
	data.has(TOKEN_KEY, callback)

###*
# getToken callback
# @callback module:resin/data/token~getTokenCallback
# @param {(Error|null)} error - error
# @param {String} token - session token
###

###*
# @summary Get saved token value
# @private
# @function
#
# @description If the key doesn't exist, undefined and no error is returned
#
# @param {module:resin/data/token~getTokenCallback} callback - callback
#
# @example
#	resin.token.getToken (error, token) ->
#		throw error if error?
#		if token?
#			console.log("My token is: #{token}")
###
exports.getToken = (callback) ->
	data.getText(TOKEN_KEY, callback)

###*
# clearToken callback
# @callback module:resin/data/token~clearTokenCallback
# @param {(Error|null)} error - error
###

###*
# @summary Remove token from the filesystem
# @private
# @function
#
# @description If the token doesn't exist, no action is performed
#
# @param {module:resin/data/token~clearTokenCallback} callback - callback
#
# @example
#	resin.token.clearToken (error) ->
#		throw error if error?
###
exports.clearToken = (callback) ->
	data.has TOKEN_KEY, (hasToken) ->
		if hasToken
			return data.remove(TOKEN_KEY, callback)
		else
			return callback?(null)
