
/**
 * @module resin.models.environment-variables
 */

(function() {
  var errors, pine, _;

  _ = require('lodash');

  pine = require('../pine');

  errors = require('../errors');


  /**
   * A Resin API environment variable
   * @typedef {Object} EnvironmentVariable
   */


  /**
   * getAllByApplication callback
   * @callback module:resin.models.environment-variables~getAllByApplicationCallback
   * @param {(Error|null)} error - error
   * @param {EnvironmentVariable[]} environmentVariables - environment variables
   */


  /**
   * @summary Get all environment variables by application
   * @public
   * @function
   *
   * @param {(String|Number)} applicationId - application id
   * @param {module:resin.models.environment-variables~getAllByApplicationCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.getAll (error, environmentVariables) ->
   *		throw error if error?
   *		console.log(environmentVariables)
   */

  exports.getAllByApplication = function(applicationId, callback) {
    return pine.get({
      resource: 'environment_variable',
      options: {
        filter: {
          application: applicationId
        },
        orderby: 'name asc'
      }
    }).then(function(environmentVariables) {
      if (_.isEmpty(environmentVariables)) {
        return callback(new errors.ResinNotAny('environment variables'));
      }
      return callback(null, environmentVariables);
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * create callback
   * @callback module:resin.models.environment-variables~createCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Create an environment variable for an application
   * @public
   * @function
   *
   * @param {(String|Number)} applicationId - application id
   * @param {String} name - environment variable name
   * @param {String} value - environment variable value
   * @param {module:resin.models.environment-variables~createCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.create 91, 'EDITOR', 'vim', (error) ->
   *		throw error if error?
   */

  exports.create = function(applicationId, name, value, callback) {
    return pine.post({
      resource: 'environment_variable',
      data: {
        name: name,
        value: value,
        application: applicationId
      }
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * update callback
   * @callback module:resin.models.environment-variables~updateCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Update an environment variable value from an application
   * @public
   * @function
   *
   * @param {(String|Number)} applicationId - application id
   * @param {String} value - environment variable value
   * @param {module:resin.models.environment-variables~updateCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.update 317, 'vim', (error) ->
   *		throw error if error?
   */

  exports.update = function(id, value, callback) {
    return pine.patch({
      resource: 'environment_variable',
      id: id,
      data: {
        value: value
      }
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * remove callback
   * @callback module:resin.models.environment-variables~removeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Remove environment variable
   * @public
   * @function
   *
   * @param {(String|Number)} id - environment variable id
   * @param {module:resin.models.environment-variables~removeCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.remove 51, (error) ->
   *		throw error if error?
   */

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'environment_variable',
      id: id
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * @summary Check is a variable is system specific
   * @public
   * @function
   *
   * @param {EnvironmentVariable} variable - environment variable
   * @returns {Boolean} Whether a variable is system specific or not
   *
   * @example
   * resin.models.environmentVariables.isSystemVariable('RESIN_SUPERVISOR')
   * > true
   *
   * @example
   * resin.models.environmentVariables.isSystemVariable('EDITOR')
   * > false
   */

  exports.isSystemVariable = function(variable) {
    return /^RESIN_/.test(variable.name);
  };

}).call(this);
