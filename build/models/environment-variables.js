
/**
 * @module resin.models.environment-variables
 */

(function() {
  var _, deviceModel, errors, pine;

  _ = require('lodash');

  errors = require('resin-errors');

  pine = require('resin-pine');

  deviceModel = require('./device');


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
        throw new errors.ResinNotAny('environment variables');
      }
      return environmentVariables;
    }).nodeify(callback);
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
      body: {
        name: name,
        value: value,
        application: applicationId
      }
    }).nodeify(callback);
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
      body: {
        value: value
      }
    }).nodeify(callback);
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
    }).nodeify(callback);
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

  exports.device = {};


  /**
   * device.getAll callback
   * @callback module:resin.models.environment-variables.device~getAllCallback
   * @param {(Error|null)} error - error
   * @param {EnvironmentVariable[]} environmentVariables - environment variables
   */


  /**
   * @summary Get all device environment variables
   * @public
   * @function
   *
   * @param {String} deviceName - device name
   * @param {module:resin.models.environment-variables.device~getAllCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.device.getAll 'MyDevice', (error, environmentVariables) ->
   *		throw error if error?
   *		console.log(environmentVariables)
   */

  exports.device.getAll = function(deviceName, callback) {
    return deviceModel.get(deviceName).then(function(device) {
      return pine.get({
        resource: 'device_environment_variable',
        options: {
          filter: {
            device: device.id
          },
          expand: 'device',
          orderby: 'env_var_name asc'
        }
      });
    }).tap(function(environmentVariables) {
      if (_.isEmpty(environmentVariables)) {
        throw new errors.ResinNotAny('device environment variables');
      }
    }).map(function(environmentVariable) {
      environmentVariable.name = environmentVariable.env_var_name;
      return environmentVariable;
    }).nodeify(callback);
  };


  /**
   * device.create callback
   * @callback module:resin.models.environment-variables.device~createCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Create a device environment variable
   * @public
   * @function
   *
   * @param {String} deviceName - device name
   * @param {String} name - environment variable name
   * @param {String} value - environment variable value
   * @param {module:resin.models.environment-variables.device~createCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.device.create 'MyDevice', 'EDITOR', 'vim', (error) ->
   *		throw error if error?
   */

  exports.device.create = function(deviceName, name, value, callback) {
    return deviceModel.get(deviceName).then(function(device) {
      return pine.post({
        resource: 'device_environment_variable',
        body: {
          device: device.id,
          env_var_name: name,
          value: value
        }
      });
    }).nodeify(callback);
  };


  /**
   * device.update callback
   * @callback module:resin.models.environment-variables.device~updateCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Update a device environment variable
   * @public
   * @function
   *
   * @param {(String|Number)} id - environment variable id
   * @param {String} value - environment variable value
   * @param {module:resin.models.environment-variables.device~updateCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.device.update 2, 'emacs', (error) ->
   *		throw error if error?
   */

  exports.device.update = function(id, value, callback) {
    return pine.patch({
      resource: 'device_environment_variable',
      id: id,
      body: {
        value: value
      }
    }).nodeify(callback);
  };


  /**
   * device.remove callback
   * @callback module:resin.models.environment-variables.device~removeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Remove a device environment variable
   * @public
   * @function
   *
   * @param {(String|Number)} id - environment variable id
   * @param {module:resin.models.environment-variables.device~removeCallback} callback - callback
   *
   * @example
   *	resin.models.environmentVariables.device.remove 2, (error) ->
   *		throw error if error?
   */

  exports.device.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'device_environment_variable',
      id: id
    }).nodeify(callback);
  };

}).call(this);
