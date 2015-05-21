###*
# @module resin.auth
###

errors = require('resin-errors')
request = require('resin-request')
token = require('resin-token')

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
# resin.auth.whoami (error, username) ->
#		throw error if error?
#
#		if not username?
#			console.log('I\'m not logged in!')
#		else
#			console.log("My username is: #{username}")
###
exports.whoami = (callback) ->
	try
		username = token.getUsername()
	catch error
		return callback(error)

	return callback(null, username)

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
	request.request
		method: 'POST'
		url: '/login_'
		json: credentials
	, (error, response) ->
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
	exports.authenticate credentials, (error, authToken, username) ->
		return callback(error) if error?
		token.set(authToken)
		return callback()

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
# @description Login to resin with a session token instead of with credentials.
#
# @param {String} token - the auth token
# @param {module:resin.auth~loginWithTokenCallback} callback - callback
#
# @example
#	resin.auth.loginWithToken token, (error) ->
#		throw error if error?
#		console.log('I\'m logged in!')
###
exports.loginWithToken = (authToken, callback) ->
	token.set(authToken)
	return callback()

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
	return callback(token.has())

###*
# getTokenCallback callback
# @callback module:resin.auth~getTokenCallback
# @param {(Error|null)} error - error
# @param {String} token - token
###

###*
# @summary Get current logged in user's token
# @public
# @function
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @param {module:resin.auth~getTokenCallback} callback - callback
#
# @example
#	resin.auth.getToken (error, token) ->
#		throw error if error?
#		console.log(token)
###
exports.getToken = (callback) ->
	savedToken = token.get()

	if not savedToken?
		return callback(new errors.ResinNotLoggedIn())

	return callback(null, savedToken)

###*
# get user id callback
# @callback module:resin.auth~getUserIdCallback
# @param {(Error|null)} error - error
# @param {Number} id - user id
###

###*
# @summary Get current logged in user's id
# @public
# @function
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @param {module:resin.auth~getUserIdCallback} callback - callback
#
# @example
#	resin.auth.getUserId (error, id) ->
#		throw error if error?
#		console.log(id)
###
exports.getUserId = (callback) ->
	try
		id = token.getUserId()
	catch error
		return callback(error)

	if not id?
		return callback(new errors.ResinNotLoggedIn())

	return callback(null, id)

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
exports.logout = (callback) ->
	token.remove()
	return callback?()

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

	if not credentials.email?
		return callback(new errors.ResinMissingCredential('email'))

	if not credentials.username?
		return callback(new errors.ResinMissingCredential('username'))

	if not credentials.password?
		return callback(new errors.ResinMissingCredential('password'))

	request.request
		method: 'POST'
		url: '/user/register'
		json: credentials
	, (error, response, body) ->
		return callback(error) if error?
		return callback(null, body)
