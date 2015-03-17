
/**
 * @module resin.models.key
 */

(function() {
  var errors, server, settings, _;

  _ = require('lodash-contrib');

  errors = require('resin-errors');

  server = require('../server');

  settings = require('../settings');


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
    var url;
    url = settings.get('urls.keys');
    return server.get(url, function(error, response, keys) {
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
    var url;
    url = settings.get('urls.keys');
    return server.get(url, function(error, response, keys) {
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
    var url;
    url = settings.get('urls.sshKey');
    url = _.template(url, {
      id: id
    });
    return server["delete"](url, _.unary(callback));
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
    var data, url;
    key = key.trim();
    url = settings.get('urls.keys');
    data = {
      title: title,
      key: key
    };
    return server.post(url, data, _.unary(callback));
  };

}).call(this);
