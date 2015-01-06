(function() {
  var async, auth, connection, createFacadeFunction, method, progress, request, settings, urlResolve, _, _i, _len, _ref;

  _ = require('lodash');

  request = require('request');

  progress = require('request-progress');

  async = require('async');

  connection = require('./connection');

  settings = require('./settings');

  auth = require('./auth');

  urlResolve = require('url').resolve;

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
          return progress(request(options)).on('progress', onProgress).on('error', outerCallback).on('end', onProgress).pipe(options.pipe).on('error', outerCallback).on('close', outerCallback);
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
