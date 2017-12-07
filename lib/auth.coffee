###
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

errors = require('resin-errors')
Promise = require('bluebird')

getAuth = (deps, opts) ->
	{ auth, request} = deps
	{ apiUrl } = opts
	twoFactor = require('./2fa')(deps, opts)

	exports = {}

	###*
	# @namespace resin.auth.twoFactor
	# @memberof resin.auth
	###
	exports.twoFactor = twoFactor

	userDetails = null
	exports.getUserDetails = ->
		return new Promise (resolve, reject) ->
			if(userDetails)
				resolve userDetails
			else
				request.send
					method: 'GET'
					url: '/user/v1/whoami'
					baseUrl: apiUrl
				.get('body')
				.then (body) ->
					console.log(body)
					userDetails = body
					resolve userDetails
				.catch ->
					reject undefined

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
	# resin.auth.whoami().then(function(username) {
	# 	if (!username) {
	# 		console.log('I\'m not logged in!');
	# 	} else {
	# 		console.log('My username is:', username);
	# 	}
	# });
	#
	# @example
	# resin.auth.whoami(function(error, username) {
	# 	if (error) throw error;
	#
	# 	if (!username) {
	# 		console.log('I\'m not logged in!');
	# 	} else {
	# 		console.log('My username is:', username);
	# 	}
	# });
	###
	exports.whoami = (callback) ->
		exports.getUserDetails()
			.then (body) ->
				return body.username || undefined
			.catch ->
				return undefined
			.asCallback(callback)

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
	# resin.auth.authenticate(credentials).then(function(token) {
	# 	console.log('My token is:', token);
	# });
	#
	# @example
	# resin.auth.authenticate(credentials, function(error, token) {
	# 	if (error) throw error;
	# 	console.log('My token is:', token);
	# });
	###
	exports.authenticate = (credentials, callback) ->
		request.send
			method: 'POST'
			baseUrl: apiUrl
			url: '/login_'
			body:
				username: credentials.email
				password: String(credentials.password)
			sendToken: false
		.get('body')
		.asCallback(callback)

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
	# resin.auth.login(credentials);
	#
	# @example
	# resin.auth.login(credentials, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.login = (credentials, callback) ->
		exports.authenticate(credentials)
			.then(auth.setKey)
			.asCallback(callback)

	###*
	# @summary Login to Resin.io with a token or api key
	# @name loginWithToken
	# @public
	# @function
	# @memberof resin.auth
	#
	# @description Login to resin with a session token or api key instead of with credentials.
	#
	# @param {String} authToken - the auth token
	# @returns {Promise}
	#
	# @example
	# resin.auth.loginWithToken(authToken);
	#
	# @example
	# resin.auth.loginWithToken(authToken, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.loginWithToken = (authToken, callback) ->
		auth.setKey(authToken).asCallback(callback)

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
	# resin.auth.isLoggedIn().then(function(isLoggedIn) {
	# 	if (isLoggedIn) {
	# 		console.log('I\'m in!');
	# 	} else {
	# 		console.log('Too bad!');
	# 	}
	# });
	#
	# @example
	# resin.auth.isLoggedIn(function(error, isLoggedIn) {
	# 	if (error) throw error;
	#
	# 	if (isLoggedIn) {
	# 		console.log('I\'m in!');
	# 	} else {
	# 		console.log('Too bad!');
	# 	}
	# });
	###
	exports.isLoggedIn = (callback) ->
		exports.getUserDetails()
			.then ->
				return true
			.catch ->
				return false
			.asCallback(callback)

	###*
	# @summary Get current logged in user's raw API key or session token
	# @name getKey
	# @public
	# @function
	# @memberof resin.auth
	#
	# @description This will only work if you used {@link module:resin.auth.login} to log in.
	#
	# @fulfil {String} - raw API key or session token
	# @returns {Promise}
	#
	# @example
	# resin.auth.getKey().then(function(token) {
	# 	console.log(token);
	# });
	#
	# @example
	# resin.auth.getKey(function(error, token) {
	# 	if (error) throw error;
	# 	console.log(token);
	# });
	###
	exports.getKey = (callback) ->
		auth.getKey().then (savedToken) ->
			throw new errors.ResinNotLoggedIn() if not savedToken?
			return savedToken
		.asCallback(callback)

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
	# resin.auth.getUserId().then(function(userId) {
	# 	console.log(userId);
	# });
	#
	# @example
	# resin.auth.getUserId(function(error, userId) {
	# 	if (error) throw error;
	# 	console.log(userId);
	# });
	###
	exports.getUserId = (callback) ->
		exports.getUserDetails()
			.then (body) ->
				return body.id
			.catch ->
				throw new errors.ResinNotLoggedIn()
			.asCallback(callback)

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
	# resin.auth.getEmail().then(function(email) {
	# 	console.log(email);
	# });
	#
	# @example
	# resin.auth.getEmail(function(error, email) {
	# 	if (error) throw error;
	# 	console.log(email);
	# });
	###
	exports.getEmail = (callback) ->
		exports.getUserDetails()
			.then (body) ->
				return body.email
			.catch ->
				throw new errors.ResinNotLoggedIn()
			.asCallback(callback)

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
	# resin.auth.logout();
	#
	# @example
	# resin.auth.logout(function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.logout = (callback) ->
		userDetails = null
		auth.removeKey().asCallback(callback)

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
	# resin.auth.register({
	# 	email: 'johndoe@gmail.com',
	# 	password: 'secret'
	# }).then(function(token) {
	# 	console.log(token);
	# });
	#
	# @example
	# resin.auth.register({
	# 	email: 'johndoe@gmail.com',
	# 	password: 'secret'
	# }, function(error, token) {
	# 	if (error) throw error;
	# 	console.log(token);
	# });
	###
	exports.register = (credentials = {}, callback) ->
		request.send
			method: 'POST'
			url: '/user/register'
			baseUrl: apiUrl
			body: credentials
			sendToken: false
		.get('body')
		.asCallback(callback)

	return exports

module.exports = getAuth
