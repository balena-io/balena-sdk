###*
# @module resin.auth
###

async = require('async')
_ = require('lodash-contrib')
errors = require('resin-errors')

token = require('./token')
server = require('./server')
data = require('./data')
settings = require('./settings')

###*
# authenticate callback
# @callback module:resin.auth~authenticateCallback
# @param {(Error|null)} error - error
# @param {String} token - session token
# @param {String} username - username
###

###*
# @summary Authenticate with the server
# @protected
# @function
#
# @description You should use {@link module:resin.auth.login} when possible,
# as it takes care of saving the token and username as well.
#
# Notice that if `credentials` contains extra keys, they'll be discarted
# by the server automatically.
#
# @param {Object} credentials - in the form of username, password
# @param {String} credentials.username - the username
# @param {String} credentials.password - the password
# @param {module:resin.auth~authenticateCallback} callback - callback
#
# @example
#	resin.auth.authenticate credentials, (error, token, username) ->
#		throw error if error?
#		console.log("My username is: #{username}")
#		console.log("My token is: #{token}")
###
exports.authenticate = (credentials, callback) ->
	server.post settings.get('urls.authenticate'), credentials, (error, response) ->
		return callback(error) if error?
		savedToken = response?.body
		return callback(null, savedToken, credentials.username)

###*
# login callback
# @callback module:resin.auth~loginCallback
# @param {(Error|null)} error - error
###

###*
# @summary Login to Resin.io
# @public
# @function
#
# @description If the login is successful, the token is persisted between sessions.
# This function saves the token to the directory configured in dataPrefix
#
# @param {Object} credentials - in the form of username, password
# @param {String} credentials.username - the username
# @param {String} credentials.password - the password
# @param {module:resin.auth~loginCallback} callback - callback
#
# @example
#	resin.auth.login credentials, (error) ->
#		throw error if error?
#		console.log('I\'m logged in!')
###
exports.login = (credentials, callback) ->
	async.waterfall([

		(callback) ->
			exports.authenticate(credentials, callback)

		(authToken, username, callback) ->
			token.saveToken(authToken, callback)

	], callback)

###*
# login callback
# @callback module:resin.auth~loginWithTokenCallback
# @param {(Error|null)} error - error
###

###*
# @summary Login to Resin.io with a token
# @public
# @function
#
# @description
#
# This function saves the token to the directory configured in dataPrefix
#
# @param {String} token - the auth token
# @param {module:resin.auth~loginWithTokenCallback} callback - callback
#
# @example
#	resin.auth.loginWithToken token, (error) ->
#		throw error if error?
#		console.log('I\'m logged in!')
###
exports.loginWithToken = token.saveToken

###*
# isLoggedIn callback
# @callback module:resin.auth~isLoggedInCallback
# @param {Boolean} isLoggedIn - is logged in
###

###*
# @summary Check if you're logged in
# @public
# @function
#
# @param {module:resin.auth~isLoggedInCallback} callback - callback
#
# @example
#	resin.auth.isLoggedIn (isLoggedIn) ->
#		if isLoggedIn
#			console.log('I\'m in!')
#		else
#			console.log('Too bad!')
###
exports.isLoggedIn = (callback) ->
	token.hasToken(callback)

###*
# getToken callback
# @callback module:resin.auth~getTokenCallback
# @param {(Error|null)} error - error
# @param {String} token - session token
###

###*
# @summary Get current logged in user's token
# @public
# @function
# @borrows module:resin.data.token.getToken as getToken
#
# @param {module:resin.auth~getTokenCallback} callback - callback
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @example
#	resin.auth.getToken (error, token) ->
#		throw error if error?
#		console.log(token)
###
exports.getToken = token.getToken

###*
# logout callback
# @callback module:resin.auth~logoutCallback
# @param {(Error|null)} error - error
###

###*
# @summary Logout from Resin.io
# @public
# @function
#
# @param {module:resin.auth~logoutCallback} [callback=_.noop] - callback
#
# @example
#	resin.auth.logout (error) ->
#		throw error if error?
#		console.log('I\'m out!')
#
# @todo Maybe we should post to /logout or something to invalidate the token on the server?
###
exports.logout = (callback = _.noop) ->
	token.clearToken(callback)

###*
# register callback
# @callback module:resin.auth~registerCallback
# @param {(Error|null)} error - error
# @param {String} token - session token
###

###*
# @summary Register to Resin.io
# @public
# @function
#
# @param {Object} [credentials={}] - in the form of username, password and email
# @param {String} credentials.username - the username
# @param {String} credentials.password - the password
# @param {String} credentials.email - the email
# @param {module:resin.auth~registerCallback} callback - callback
#
# @example
#	resin.auth.register {
#		username: 'johndoe'
#		password: 'secret'
#		email: 'johndoe@gmail.com'
#	}, (error, token) ->
#		throw error if error?
#		console.log(token)
###
exports.register = (credentials = {}, callback) ->
	if not credentials.username?
		return callback(new errors.ResinMissingCredential('username'))

	if not credentials.password?
		return callback(new errors.ResinMissingCredential('password'))

	if not credentials.email?
		return callback(new errors.ResinMissingCredential('email'))

	async.waterfall([

		(callback) ->
			url = settings.get('urls.register')
			server.post(url, credentials, callback)

		(response, body, callback) ->
			return callback(null, body)

	], callback)
