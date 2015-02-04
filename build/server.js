
/**
 * @module resin/server
 * @private
 */

(function() {
  var async, auth, connection, createFacadeFunction, method, progress, request, settings, urlResolve, _, _i, _len, _ref;

  _ = require('lodash');

  request = require('request');

  progress = require('request-progress');

  async = require('async');

  connection = require('./connection');

  settings = require('./settings');

  auth = require('./auth');


  /**
   * @ignore
   */

  urlResolve = require('url').resolve;


  /**
   * request callback
   * @callback module:resin/server~requestCallback
   * @param {(Error|null)} error - error
   * @param {Object} response - response
   * @param {Object} body - body
   */


  /**
   * @summary Send an HTTP request to resin.io
   * @private
   * @function
   *
   * @description If the user is logged in, the token gets automatically added to Authorization header
   * If the response is JSON, it will attempt to parse it
   *
   * @param {Object} options -  request options
   * @option options {String} url - relative url
   * @option options {String} json - request body
   * @option options {String} method - http method
   * @option options {Object} headers - custom http headers
   * @option options {Function} pipe - define this function if you want to stream the response
   *
   * @param {module:resin/server~requestCallback} callback - callback
   * @param {Function} [onProgress] - on progress callback
   *
   * @throws {Error} Will throw if no URL
   *
   * @todo This big function should be splitted to be better unit tested.
   *
   * @example
   *	resin.server.request {
   *		method: 'GET'
   *		url: '/foobar'
   *	}, (error, response, body) ->
   *		throw error if error?
   *		console.log(body)
   *
   *	@example
   *	resin.server.request {
   *		method: 'POST'
   *		url: '/foobar'
   *		json:
   *			name: 'My FooBar'
   *	}, (error, response, body) ->
   *		throw error if error?
   *		assert(response.statusCode is 201)
   *
   *	@example
   *	resin.server.request {
   *		method: 'GET'
   *		url: '/download'
   *		pipe: fs.createWriteStream('/tmp/download')
   *	}, (error) ->
   *		throw error if error?
   *	, (state) ->
   *		console.log("Received: #{state.received}")
   *		console.log("Total: #{state.total}")
   *		console.log("Is Complete? #{state.complete}")
   */

  exports.request = function(options, outerCallback, onProgress) {
    if (options == null) {
      options = {};
    }
    if (onProgress == null) {
      onProgress = _.noop;
    }
    if (options.url == null) {
      throw new Error('Missing URL');
    }
    return async.waterfall([
      function(callback) {
        return connection.isOnline(callback);
      }, function(isOnline, callback) {
        if (!isOnline) {
          return callback(new Error('You need internet connection to perform this task'));
        }
        return auth.getToken(callback);
      }, function(savedToken, callback) {
        options.url = urlResolve(settings.get('remoteUrl'), options.url);
        if (options.method != null) {
          options.method = options.method.toUpperCase();
        }
        _.defaults(options, {
          method: 'GET',
          gzip: true
        });
        if (savedToken != null) {
          if (options.headers == null) {
            options.headers = {};
          }
          _.extend(options.headers, {
            'Authorization': "Bearer " + savedToken
          });
        }
        if (options.pipe != null) {
          return progress(request(options)).on('progress', onProgress).on('error', outerCallback).pipe(options.pipe).on('error', outerCallback).on('close', outerCallback);
        } else {
          return request(options, callback);
        }
      }, function(response, body, callback) {
        var error;
        try {
          response.body = JSON.parse(response.body);
        } catch (_error) {}
        if ((response != null ? response.statusCode : void 0) >= 400) {
          error = new Error(response.body);
        }
        return callback(error, response, response.body);
      }
    ], outerCallback);
  };

  createFacadeFunction = function(method) {
    var lowerCaseMethod;
    lowerCaseMethod = method.toLowerCase();
    return exports[lowerCaseMethod] = function(url, body, callback, onProgress) {
      var options;
      options = {
        method: method,
        url: url
      };
      if (_.isFunction(body)) {
        onProgress = callback;
        callback = body;
      } else {
        options.json = body;
      }
      return exports.request(options, callback, onProgress);
    };
  };

  _ref = ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    method = _ref[_i];
    createFacadeFunction(method);
  }

}).call(this);
