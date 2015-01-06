(function() {
  var async, data, errors, server, settings, token, _;

  async = require('async');

  _ = require('lodash-contrib');

  token = require('./token');

  server = require('./server');

  data = require('./data');

  errors = require('./errors');

  settings = require('./settings');


  /**
   * Return current logged in username
   *
   * @param {Function} callback callback (error, username)
   *
   * @note This will only work if you used login() to log in.
   *
   * @example Who am I?
   *		resin.auth.whoami (error, username) ->
   *			throw error if error?
   *
   *			if not username?
   *				console.log('I\'m not logged in!')
   *			else
   *				console.log("My username is: #{username}")
   */

  exports.whoami = function(callback) {
    var usernameKey;
    usernameKey = settings.get('keys.username');
    return data.getText(usernameKey, callback);
  };


  /**
   * Authenticate with the server
   *
   * @private
   *
   * @param {Object} credentials in the form of username, password
   * @option credentials {String} username the username
   * @option credentials {String} password user password
   * @param {Function} callback callback (error, token, username)
   *
   * @note You should use login() when possible, as it takes care of saving the token and username as well.
   *
   * @example Authenticate
   *		resin.auth.authenticate credentials, (error, token, username) ->
   *			throw error if error?
   *			console.log("My username is: #{username}")
   *			console.log("My token is: #{token}")
   */

  exports.authenticate = function(credentials, callback) {
    return server.post(settings.get('urls.authenticate'), credentials, function(error, response) {
      var savedToken;
      if (error != null) {
        return callback(error);
      }
      savedToken = response != null ? response.body : void 0;
      return callback(null, savedToken, credentials.username);
    });
  };


  /**
   * Login to Resin.io
   *
   * Is the login is successful, the token is persisted between sessions.
   *
   * @param {Object} credentials in the form of username, password
   * @option credentials {String} username the username
   * @option credentials {String} password user password
   * @param {Function} callback callback (error)
   *
   * @note This function saves the token to the directory configured in dataPrefix
   *
   * @example Login to Resin.io
   *		resin.auth.login credentials, (error) ->
   *			throw error if error?
   *			console.log('I\'m logged in!')
   */

  exports.login = function(credentials, callback) {
    return async.waterfall([
      function(callback) {
        return exports.authenticate(credentials, callback);
      }, function(authToken, username, callback) {
        return token.saveToken(authToken, callback);
      }, function(callback) {
        var usernameKey;
        usernameKey = settings.get('keys.username');
        return data.setText(usernameKey, credentials.username, callback);
      }
    ], callback);
  };


  /**
   * Check if you're logged in
   *
   * @param {Function} callback callback (isLoggedIn)
   *
   * @example Check if logged in
   *		resin.auth.isLoggedIn (isLoggedIn) ->
   *			if isLoggedIn
   *				console.log('I\'m in!')
   *			else
   *				console.log('Too bad!')
   */

  exports.isLoggedIn = function(callback) {
    return token.hasToken(callback);
  };


  /**
   * Get current logged in user's token
   *
   * @param {Function} callback callback (error, isLoggedIn)
   *
   * @note This function simply delegates to resin.token.getToken() for convenience.
   * @note This will only work if you used login() to log in.
   *
   * @example Get curren token
   *		resin.auth.getToken (error, token) ->
   *			throw error if error?
   *			console.log(token)
   */

  exports.getToken = function(callback) {
    return token.getToken(callback);
  };


  /**
   * Logout from Resin.io
   *
   * @param {Function} callback callback (error)
   *
   * @example Logout from Resin.io
   *		resin.auth.logout (error) ->
   *			throw error if error?
   *			console.log('I\'m out!')
   *
   * @todo Maybe we should post to /logout or something to invalidate the token on the server?
   */

  exports.logout = function(callback) {
    if (callback == null) {
      callback = _.noop;
    }
    return async.parallel([
      function(callback) {
        return token.clearToken(callback);
      }, function(callback) {
        var usernameKey;
        usernameKey = settings.get('keys.username');
        return data.remove(usernameKey, callback);
      }
    ], _.unary(callback));
  };


  /**
   * Register to Resin.io
   *
   * @param {Object} credentials in the form of username, password and email
   * @option credentials {String} username the username
   * @option credentials {String} password user password
   * @option credentials {String} email the user email
   * @param {Function} callback callback (error, token)
   *
   * @example Register to Resin.io
   *		resin.auth.register {
   *			username: 'johndoe'
   *			password: 'secret'
   *			email: 'johndoe@gmail.com'
   *		}, (error, token) ->
   *			throw error if error?
   *			console.log(token)
   */

  exports.register = function(credentials, callback) {
    if (credentials == null) {
      credentials = {};
    }
    if (credentials.username == null) {
      return callback(new Error('Missing username'));
    }
    if (credentials.password == null) {
      return callback(new Error('Missing password'));
    }
    if (credentials.email == null) {
      return callback(new Error('Missing email'));
    }
    return async.waterfall([
      function(callback) {
        var url;
        url = settings.get('urls.register');
        return server.post(url, credentials, callback);
      }, function(response, body, callback) {
        return callback(null, body);
      }
    ], callback);
  };

}).call(this);
