###*
# @module resin.auth
###

async = require('async')
_ = require('lodash-contrib')

token = require('./token')
server = require('./server')
data = require('./data')
errors = require('./errors')
settings = require('./settings')

###*
# whoami callback
# @callback module:resin.auth~whoamiCallback
# @param {Error} error - error
# @param {String} username - username
###

###*
# @summary Return current logged in username
# @public
# @function
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @param {module:resin.auth~whoamiCallback} callback - callback
#
# @example
#	resin.auth.whoami (error, username) ->
#		throw error if error?
#
#		if not username?
#			console.log('I\'m not logged in!')
#		else
#			console.log("My username is: #{username}")
###
exports.whoami = (callback) ->
	usernameKey = settings.get('keys.username')
	data.getText(usernameKey, callback)

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
# @option credentials {String} username - the username
# @option credentials {String} password - user password
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
# @option credentials {String} username - the username
# @option credentials {String} password - user password
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

		(callback) ->
			usernameKey = settings.get('keys.username')
			data.setText(usernameKey, credentials.username, callback)

	], callback)

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
	async.parallel([

		(callback) ->
			token.clearToken(callback)

		(callback) ->
			usernameKey = settings.get('keys.username')
			data.remove(usernameKey, callback)

	], _.unary(callback))

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
# @option credentials {String} username - the username
# @option credentials {String} password - user password
# @option credentials {String} email - the user email
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
