
/**
 * @module resin.models.key
 */

(function() {
  var errors, request, settings, token, _;

  _ = require('lodash-contrib');

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

  settings = require('../../settings');


  /**
   * A Resin API key
   * @typedef {Object} Key
   */


  /**
   * getAll callback
   * @callback module:resin.models.key~getAllCallback
   * @param {(Error|null)} error - error
   * @param {Key[]} keys - ssh keys
   */


  /**
   * @summary Get all ssh keys
   * @public
   * @function
   *
   * @param {module:resin.models.key~getAllCallback} callback - callback
   *
   * @example
   *	resin.models.key.getAll (error, keys) ->
   *		throw error if error?
   *		console.log(keys)
   */

  exports.getAll = function(callback) {
    return request.request({
      method: 'GET',
      url: '/user/keys',
      remoteUrl: settings.get('remoteUrl'),
      token: token.get()
    }, function(error, response, keys) {
      if (error != null) {
        return callback(error);
      }
      if (_.isEmpty(keys)) {
        return callback(new errors.ResinNotAny('keys'));
      }
      return callback(null, keys);
    });
  };


  /**
   * get callback
   * @callback module:resin.models.key~getCallback
   * @param {(Error|null)} error - error
   * @param {Key} key - ssh key
   */


  /**
   * @summary Get a single ssh key
   * @public
   * @function
   *
   * @param {(String|Number)} id - key id
   * @param {module:resin.models.key~getCallback} callback - callback
   *
   * @example
   *	resin.models.key.get 51, (error, key) ->
   *		throw error if error?
   *		console.log(key)
   */

  exports.get = function(id, callback) {
    return exports.getAll(function(error, keys) {
      var key;
      if (error != null) {
        return callback(error);
      }
      key = _.findWhere(keys, {
        id: id
      });
      if (key == null) {
        return callback(new errors.ResinKeyNotFound(id));
      }
      return callback(null, key);
    });
  };


  /**
   * remove callback
   * @callback module:resin.models.key~removeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Remove ssh key
   * @public
   * @function
   *
   * @param {(String|Number)} id - key id
   * @param {module:resin.models.key~removeCallback} callback - callback
   *
   * @example
   *	resin.models.key.remove 51, (error) ->
   *		throw error if error?
   */

  exports.remove = function(id, callback) {
    return request.request({
      method: 'DELETE',
      url: "/user/keys/" + id,
      remoteUrl: settings.get('remoteUrl'),
      token: token.get()
    }, _.unary(callback));
  };


  /**
   * create callback
   * @callback module:resin.models.key~createCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Create a ssh key
   * @public
   * @function
   *
   * @param {String} title - key title
   * @param {String} key - the public ssh key
   * @param {module:resin.models.key~createCallback} callback - callback
   *
   * @todo We should return an id for consistency with the other models
   *
   * @example
   *	resin.models.key.create 'Main', 'ssh-rsa AAAAB....', (error) ->
   *		throw error if error?
   */

  exports.create = function(title, key, callback) {
    key = key.trim();
    return request.request({
      method: 'POST',
      url: '/user/keys',
      remoteUrl: settings.get('remoteUrl'),
      token: token.get(),
      json: {
        title: title,
        key: key
      }
    }, _.unary(callback));
  };

}).call(this);
