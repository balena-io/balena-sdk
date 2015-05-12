
/**
 * @module resin.models.key
 */

(function() {
  var _, auth, errors, pine, token;

  _ = require('lodash');

  errors = require('resin-errors');

  token = require('resin-token');

  pine = require('resin-pine');

  auth = require('../auth');


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
    return auth.getUserId(function(error, id) {
      if (error != null) {
        return callback(error);
      }
      return pine.get({
        resource: 'user__has__public_key',
        options: {
          filter: {
            user: {
              id: id
            }
          }
        }
      }).tap(function(keys) {
        if (_.isEmpty(keys)) {
          throw new errors.ResinNotAny('keys');
        }
      }).nodeify(callback);
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
    return auth.getUserId(function(error, userId) {
      if (error != null) {
        return callback(error);
      }
      return pine.get({
        resource: 'user__has__public_key',
        id: id,
        options: {
          filter: {
            user: {
              id: userId
            }
          }
        }
      }).tap(function(key) {
        if (_.isEmpty(key)) {
          throw new errors.ResinKeyNotFound(id);
        }
      }).nodeify(callback);
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
    return auth.getUserId(function(error, userId) {
      if (error != null) {
        return callback(error);
      }
      return pine["delete"]({
        resource: 'user__has__public_key',
        id: id,
        options: {
          filter: {
            user: {
              id: userId
            }
          }
        }
      }).nodeify(callback);
    });
  };


  /**
   * create callback
   * @callback module:resin.models.key~createCallback
   * @param {(Error|null)} error - error
   * @param {Number} id - id
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
   *	resin.models.key.create 'Main', 'ssh-rsa AAAAB....', (error, id) ->
   *		throw error if error?
   *		console.log(id)
   */

  exports.create = function(title, key, callback) {
    if (token.getUsername() == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    key = key.trim();
    return pine.post({
      resource: 'user__has__public_key',
      body: {
        title: title,
        key: key
      }
    }).get('id').nodeify(callback);
  };

}).call(this);
