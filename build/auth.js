
/*
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
 */

(function() {
  var errors, request, token;

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');


  /**
   * @namespace resin.auth.twoFactor
   * @memberof resin.auth
   */

  exports.twoFactor = require('./2fa');


  /**
   * @summary Return current logged in username
   * @name whoami
   * @public
   * @function
   * @memberof resin.auth
   *
   * @description This will only work if you used {@link module:resin.auth.login} to log in.
   *
   * @fulfil {(String|undefined)} - username, if it exists
   * @returns {Promise}
   *
   * @example
   * resin.auth.whoami().then(function(username) {
   * 	if (!username) {
   * 		console.log('I\'m not logged in!');
   * 	} else {
   * 		console.log('My username is:', username);
   * 	}
   * });
   *
   * @example
   * resin.auth.whoami(function(error, username) {
   * 	if (error) throw error;
   *
   * 	if (!username) {
   * 		console.log('I\'m not logged in!');
   * 	} else {
   * 		console.log('My username is:', username);
   * 	}
   * });
   */

  exports.whoami = function(callback) {
    return token.getUsername().nodeify(callback);
  };


  /**
   * @summary Authenticate with the server
   * @name authenticate
   * @protected
   * @function
   * @memberof resin.auth
   *
   * @description You should use {@link module:resin.auth.login} when possible,
   * as it takes care of saving the token and email as well.
   *
   * Notice that if `credentials` contains extra keys, they'll be discarted
   * by the server automatically.
   *
   * @param {Object} credentials - in the form of email, password
   * @param {String} credentials.email - the email
   * @param {String} credentials.password - the password
   *
   * @fulfil {String} - session token
   * @returns {Promise}
   *
   * @example
   * resin.auth.authenticate(credentials).then(function(token) {
   * 	console.log('My token is:', token);
   * });
   *
   * @example
   * resin.auth.authenticate(credentials, function(error, token) {
   * 	if (error) throw error;
   * 	console.log('My token is:', token);
   * });
   */

  exports.authenticate = function(credentials, callback) {
    return request.send({
      method: 'POST',
      url: '/login_',
      body: {
        username: credentials.email,
        password: credentials.password
      },
      refreshToken: false
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Login to Resin.io
   * @name login
   * @public
   * @function
   * @memberof resin.auth
   *
   * @description If the login is successful, the token is persisted between sessions.
   *
   * @param {Object} credentials - in the form of email, password
   * @param {String} credentials.email - the email
   * @param {String} credentials.password - the password
   *
   * @returns {Promise}
   *
   * @example
   * resin.auth.login(credentials);
   *
   * @example
   * resin.auth.login(credentials, function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.login = function(credentials, callback) {
    return exports.authenticate(credentials).then(token.set).nodeify(callback);
  };


  /**
   * @summary Login to Resin.io with a token
   * @name loginWithToken
   * @public
   * @function
   * @memberof resin.auth
   *
   * @description Login to resin with a session token instead of with credentials.
   *
   * @param {String} token - the auth token
   * @returns {Promise}
   *
   * @example
   * resin.auth.loginWithToken(token);
   *
   * @example
   * resin.auth.loginWithToken(token, function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.loginWithToken = function(authToken, callback) {
    return token.set(authToken).nodeify(callback);
  };


  /**
   * @summary Check if you're logged in
   * @name isLoggedIn
   * @public
   * @function
   * @memberof resin.auth
   *
   * @fulfil {Boolean} - is logged in
   * @returns {Promise}
   *
   * @example
   * resin.auth.isLoggedIn().then(function(isLoggedIn) {
   * 	if (isLoggedIn) {
   * 		console.log('I\'m in!');
   * 	} else {
   * 		console.log('Too bad!');
   * 	}
   * });
   *
   * @example
   * resin.auth.isLoggedIn(function(error, isLoggedIn) {
   * 	if (error) throw error;
   *
   * 	if (isLoggedIn) {
   * 		console.log('I\'m in!');
   * 	} else {
   * 		console.log('Too bad!');
   * 	}
   * });
   */

  exports.isLoggedIn = function(callback) {
    return request.send({
      method: 'GET',
      url: '/whoami'
    })["return"](true)["catch"](function() {
      return false;
    }).nodeify(callback);
  };


  /**
   * @summary Get current logged in user's token
   * @name getToken
   * @public
   * @function
   * @memberof resin.auth
   *
   * @description This will only work if you used {@link module:resin.auth.login} to log in.
   *
   * @fulfil {String} - session token
   * @returns {Promise}
   *
   * @example
   * resin.auth.getToken().then(function(token) {
   * 	console.log(token);
   * });
   *
   * @example
   * resin.auth.getToken(function(error, token) {
   * 	if (error) throw error;
   * 	console.log(token);
   * });
   */

  exports.getToken = function(callback) {
    return token.get().then(function(savedToken) {
      if (savedToken == null) {
        throw new errors.ResinNotLoggedIn();
      }
      return savedToken;
    }).nodeify(callback);
  };


  /**
   * @summary Get current logged in user's id
   * @name getUserId
   * @public
   * @function
   * @memberof resin.auth
   *
   * @description This will only work if you used {@link module:resin.auth.login} to log in.
   *
   * @fulfil {Number} - user id
   * @returns {Promise}
   *
   * @example
   * resin.auth.getUserId().then(function(userId) {
   * 	console.log(userId);
   * });
   *
   * @example
   * resin.auth.getUserId(function(error, userId) {
   * 	if (error) throw error;
   * 	console.log(userId);
   * });
   */

  exports.getUserId = function(callback) {
    return token.getUserId().then(function(id) {
      if (id == null) {
        throw new errors.ResinNotLoggedIn();
      }
      return id;
    }).nodeify(callback);
  };


  /**
   * @summary Get current logged in user's email
   * @name getEmail
   * @public
   * @function
   * @memberof resin.auth
   *
   * @description This will only work if you used {@link module:resin.auth.login} to log in.
   *
   * @fulfil {String} - user email
   * @returns {Promise}
   *
   * @example
   * resin.auth.getEmail().then(function(email) {
   * 	console.log(email);
   * });
   *
   * @example
   * resin.auth.getEmail(function(error, email) {
   * 	if (error) throw error;
   * 	console.log(email);
   * });
   */

  exports.getEmail = function(callback) {
    return token.getEmail().then(function(email) {
      if (email == null) {
        throw new errors.ResinNotLoggedIn();
      }
      return email;
    }).nodeify(callback);
  };


  /**
   * @summary Logout from Resin.io
   * @name logout
   * @public
   * @function
   * @memberof resin.auth
   *
   * @returns {Promise}
   *
   * @example
   * resin.auth.logout();
   *
   * @example
   * resin.auth.logout(function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.logout = function(callback) {
    return token.remove().nodeify(callback);
  };


  /**
   * @summary Register to Resin.io
   * @name register
   * @public
   * @function
   * @memberof resin.auth
   *
   * @param {Object} [credentials={}] - in the form of username, password and email
   * @param {String} credentials.email - the email
   * @param {String} credentials.password - the password
   *
   * @fulfil {String} - session token
   * @returns {Promise}
   *
   * @example
   * resin.auth.register({
   * 	email: 'johndoe@gmail.com',
   * 	password: 'secret'
   * }).then(function(token) {
   * 	console.log(token);
   * });
   *
   * @example
   * resin.auth.register({
   * 	email: 'johndoe@gmail.com',
   * 	password: 'secret'
   * }, function(error, token) {
   * 	if (error) throw error;
   * 	console.log(token);
   * });
   */

  exports.register = function(credentials, callback) {
    if (credentials == null) {
      credentials = {};
    }
    return request.send({
      method: 'POST',
      url: '/user/register',
      body: credentials
    }).get('body').nodeify(callback);
  };

}).call(this);
