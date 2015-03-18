
/**
 * @module resin.auth
 */

(function() {
  var errors, request, settings, token;

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

  settings = require('./settings');


  /**
   * authenticate callback
   * @callback module:resin.auth~authenticateCallback
   * @param {(Error|null)} error - error
   * @param {String} token - session token
   * @param {String} username - username
   */


  /**
   * @summary Authenticate with the server
   * @protected
   * @function
   *
   * @description You should use {@link module:resin.auth.login} when possible,
   * as it takes care of saving the token and username as well.
   *
   * Notice that if `credentials` contains extra keys, they'll be discarted
   * by the server automatically.
   *
   * @param {Object} credentials - in the form of username, password
   * @param {String} credentials.username - the username
   * @param {String} credentials.password - the password
   * @param {module:resin.auth~authenticateCallback} callback - callback
   *
   * @example
   *	resin.auth.authenticate credentials, (error, token, username) ->
   *		throw error if error?
   *		console.log("My username is: #{username}")
   *		console.log("My token is: #{token}")
   */

  exports.authenticate = function(credentials, callback) {
    return request.request({
      method: 'POST',
      url: '/login_',
      remoteUrl: settings.get('remoteUrl'),
      json: credentials,
      token: token.get()
    }, function(error, response) {
      var savedToken;
      if (error != null) {
        return callback(error);
      }
      savedToken = response != null ? response.body : void 0;
      return callback(null, savedToken, credentials.username);
    });
  };


  /**
   * login callback
   * @callback module:resin.auth~loginCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Login to Resin.io
   * @public
   * @function
   *
   * @description If the login is successful, the token is persisted between sessions.
   *
   * @param {Object} credentials - in the form of username, password
   * @param {String} credentials.username - the username
   * @param {String} credentials.password - the password
   * @param {module:resin.auth~loginCallback} callback - callback
   *
   * @example
   *	resin.auth.login credentials, (error) ->
   *		throw error if error?
   *		console.log('I\'m logged in!')
   */

  exports.login = function(credentials, callback) {
    return exports.authenticate(credentials, function(error, authToken, username) {
      if (error != null) {
        return callback(error);
      }
      token.set(authToken);
      return callback();
    });
  };


  /**
   * login callback
   * @callback module:resin.auth~loginWithTokenCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Login to Resin.io with a token
   * @public
   * @function
   *
   * @description Login to resin with a session token instead of with credentials.
   *
   * @param {String} token - the auth token
   * @param {module:resin.auth~loginWithTokenCallback} callback - callback
   *
   * @example
   *	resin.auth.loginWithToken token, (error) ->
   *		throw error if error?
   *		console.log('I\'m logged in!')
   */

  exports.loginWithToken = function(authToken, callback) {
    token.set(authToken);
    return callback();
  };


  /**
   * isLoggedIn callback
   * @callback module:resin.auth~isLoggedInCallback
   * @param {Boolean} isLoggedIn - is logged in
   */


  /**
   * @summary Check if you're logged in
   * @public
   * @function
   *
   * @param {module:resin.auth~isLoggedInCallback} callback - callback
   *
   * @example
   *	resin.auth.isLoggedIn (isLoggedIn) ->
   *		if isLoggedIn
   *			console.log('I\'m in!')
   *		else
   *			console.log('Too bad!')
   */

  exports.isLoggedIn = function(callback) {
    return callback(token.has());
  };


  /**
   * @summary Get current logged in user's token
   * @public
   * @function
   *
   * @description This will only work if you used {@link module:resin.auth.login} to log in.
   *
   * @example
   *	token = resin.auth.getToken()
   *	console.log(token)
   */

  exports.getToken = token.get;


  /**
   * logout callback
   * @callback module:resin.auth~logoutCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Logout from Resin.io
   * @public
   * @function
   *
   * @param {module:resin.auth~logoutCallback} [callback=_.noop] - callback
   *
   * @example
   *	resin.auth.logout (error) ->
   *		throw error if error?
   *		console.log('I\'m out!')
   *
   * @todo Maybe we should post to /logout or something to invalidate the token on the server?
   */

  exports.logout = function(callback) {
    token.remove();
    return typeof callback === "function" ? callback() : void 0;
  };


  /**
   * register callback
   * @callback module:resin.auth~registerCallback
   * @param {(Error|null)} error - error
   * @param {String} token - session token
   */


  /**
   * @summary Register to Resin.io
   * @public
   * @function
   *
   * @param {Object} [credentials={}] - in the form of username, password and email
   * @param {String} credentials.username - the username
   * @param {String} credentials.password - the password
   * @param {String} credentials.email - the email
   * @param {module:resin.auth~registerCallback} callback - callback
   *
   * @example
   *	resin.auth.register {
   *		username: 'johndoe'
   *		password: 'secret'
   *		email: 'johndoe@gmail.com'
   *	}, (error, token) ->
   *		throw error if error?
   *		console.log(token)
   */

  exports.register = function(credentials, callback) {
    if (credentials == null) {
      credentials = {};
    }
    if (credentials.email == null) {
      return callback(new errors.ResinMissingCredential('email'));
    }
    if (credentials.username == null) {
      return callback(new errors.ResinMissingCredential('username'));
    }
    if (credentials.password == null) {
      return callback(new errors.ResinMissingCredential('password'));
    }
    return request.request({
      method: 'POST',
      url: '/user/register',
      remoteUrl: settings.get('remoteUrl'),
      token: token.get(),
      json: credentials
    }, function(error, response, body) {
      if (error != null) {
        return callback(error);
      }
      return callback(null, body);
    });
  };

}).call(this);
