###
The MIT License

Copyright (c) 2015 Resin.io, Inc. https://resin.io.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
###

errors = require('resin-errors')
request = require('resin-request')
token = require('resin-token')

###*
# @namespace resin.auth.twoFactor
# @memberof resin.auth
###
exports.twoFactor = require('./2fa')

###*
# @summary Return current logged in username
# @name whoami
# @public
# @function
# @memberof resin.auth
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @fulfil {(String|undefined)} - username, if it exists
# @returns {Promise}
#
# @example
# resin.auth.whoami().then (username) ->
# 	if not username?
# 		console.log('I\'m not logged in!')
# 	else
# 		console.log("My username is: #{username}")
#
# @example
# resin.auth.whoami (error, username) ->
# 	throw error if error?
#
# 	if not username?
# 		console.log('I\'m not logged in!')
# 	else
# 		console.log("My username is: #{username}")
###
exports.whoami = (callback) ->
	token.getUsername().nodeify(callback)

###*
# @summary Authenticate with the server
# @name authenticate
# @protected
# @function
# @memberof resin.auth
#
# @description You should use {@link module:resin.auth.login} when possible,
# as it takes care of saving the token and email as well.
#
# Notice that if `credentials` contains extra keys, they'll be discarted
# by the server automatically.
#
# @param {Object} credentials - in the form of email, password
# @param {String} credentials.email - the email
# @param {String} credentials.password - the password
#
# @fulfil {String} - session token
# @returns {Promise}
#
# @example
# resin.auth.authenticate(credentials).then (token) ->
# 	console.log("My token is: #{token}")
#
# @example
# resin.auth.authenticate credentials, (error, token) ->
# 	throw error if error?
# 	console.log("My token is: #{token}")
###
exports.authenticate = (credentials, callback) ->
	request.send
		method: 'POST'
		url: '/login_'
		body:
			username: credentials.email
			password: credentials.password
		refreshToken: false
	.get('body')
	.nodeify(callback)

###*
# @summary Login to Resin.io
# @name login
# @public
# @function
# @memberof resin.auth
#
# @description If the login is successful, the token is persisted between sessions.
#
# @param {Object} credentials - in the form of email, password
# @param {String} credentials.email - the email
# @param {String} credentials.password - the password
#
# @returns {Promise}
#
# @example
# resin.auth.login(credentials)
#
# @example
# resin.auth.login credentials, (error) ->
# 	throw error if error?
###
exports.login = (credentials, callback) ->
	exports.authenticate(credentials)
		.then(token.set)
		.nodeify(callback)

###*
# @summary Login to Resin.io with a token
# @name loginWithToken
# @public
# @function
# @memberof resin.auth
#
# @description Login to resin with a session token instead of with credentials.
#
# @param {String} token - the auth token
# @returns {Promise}
#
# @example
# resin.auth.loginWithToken(token)
#
# @example
# resin.auth.loginWithToken token, (error) ->
# 	throw error if error?
###
exports.loginWithToken = (authToken, callback) ->
	token.set(authToken).nodeify(callback)

###*
# @summary Check if you're logged in
# @name isLoggedIn
# @public
# @function
# @memberof resin.auth
#
# @fulfil {Boolean} - is logged in
# @returns {Promise}
#
# @example
# resin.auth.isLoggedIn().then (isLoggedIn) ->
# 	if isLoggedIn
# 		console.log('I\'m in!')
# 	else
# 		console.log('Too bad!')
#
# @example
# resin.auth.isLoggedIn (error, isLoggedIn) ->
# 	throw error if error?
#
# 	if isLoggedIn
# 		console.log('I\'m in!')
# 	else
# 		console.log('Too bad!')
###
exports.isLoggedIn = (callback) ->
	request.send
		method: 'GET'
		url: '/whoami'
	.return(true)
	.catch ->
		return false
	.nodeify(callback)

###*
# @summary Get current logged in user's token
# @name getToken
# @public
# @function
# @memberof resin.auth
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @fulfil {String} - session token
# @returns {Promise}
#
# @example
# resin.auth.getToken().then (token) ->
# 	console.log(token)
#
# @example
# resin.auth.getToken (error, token) ->
# 	throw error if error?
# 	console.log(token)
###
exports.getToken = (callback) ->
	token.get().then (savedToken) ->
		throw new errors.ResinNotLoggedIn() if not savedToken?
		return savedToken
	.nodeify(callback)

###*
# @summary Get current logged in user's id
# @name getUserId
# @public
# @function
# @memberof resin.auth
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @fulfil {Number} - user id
# @returns {Promise}
#
# @example
# resin.auth.getUserId().then (userId) ->
# 	console.log(userId)
#
# @example
# resin.auth.getUserId (error, userId) ->
# 	throw error if error?
# 	console.log(userId)
###
exports.getUserId = (callback) ->
	token.getUserId().then (id) ->
		throw new errors.ResinNotLoggedIn() if not id?
		return id
	.nodeify(callback)

###*
# @summary Get current logged in user's email
# @name getEmail
# @public
# @function
# @memberof resin.auth
#
# @description This will only work if you used {@link module:resin.auth.login} to log in.
#
# @fulfil {String} - user email
# @returns {Promise}
#
# @example
# resin.auth.getEmail().then (email) ->
# 	console.log(email)
###
exports.getEmail = (callback) ->
	token.getEmail().then (email) ->
		throw new errors.ResinNotLoggedIn() if not email?
		return email
	.nodeify(callback)

###*
# @summary Logout from Resin.io
# @name logout
# @public
# @function
# @memberof resin.auth
#
# @returns {Promise}
#
# @example
# resin.auth.logout()
#
# @example
# resin.auth.logout (error) ->
# 	throw error if error?
###
exports.logout = (callback) ->
	token.remove().nodeify(callback)

###*
# @summary Register to Resin.io
# @name register
# @public
# @function
# @memberof resin.auth
#
# @param {Object} [credentials={}] - in the form of username, password and email
# @param {String} credentials.email - the email
# @param {String} credentials.password - the password
#
# @fulfil {String} - session token
# @returns {Promise}
#
# @example
# resin.auth.register
# 	email: 'johndoe@gmail.com'
# 	password: 'secret'
# .then (token) ->
# 	console.log(token)
#
# @example
# resin.auth.register
# 	email: 'johndoe@gmail.com'
# 	password: 'secret'
# , (error, token) ->
# 	throw error if error?
# 	console.log(token)
###
exports.register = (credentials = {}, callback) ->
	request.send
		method: 'POST'
		url: '/user/register'
		body: credentials
	.get('body')
	.nodeify(callback)
