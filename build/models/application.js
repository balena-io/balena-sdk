
/**
 * @module resin.models.application
 */

(function() {
  var _, async, auth, deviceModel, errors, network, pine, request, token;

  async = require('async');

  _ = require('lodash-contrib');

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

  pine = require('resin-pine');

  network = require('resin-network-config');

  deviceModel = require('./device');

  auth = require('../auth');


  /**
   * A Resin API application
   * @typedef {Object} Application
   */


  /**
   * getAll callback
   * @callback module:resin.models.application~getAllCallback
   * @param {(Error|null)} error - error
   * @param {Application[]} applications - applications
   */


  /**
   * @summary Get all applications
   * @public
   * @function
   *
   * @param {module:resin.models.application~getAllCallback} callback - callback
   *
   * @example
   *	resin.models.application.getAll (error, applications) ->
   *		throw error if error?
   *		console.log(applications)
   */

  exports.getAll = function(callback) {
    var username;
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    username = token.getUsername();
    if (username == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    return pine.get({
      resource: 'application',
      options: {
        orderby: 'app_name asc',
        expand: 'device',
        filter: {
          user: {
            username: username
          }
        }
      }
    }).then(function(applications) {
      if (_.isEmpty(applications)) {
        throw new errors.ResinNotAny('applications');
      }
      return applications;
    }).map(function(application) {
      var ref;
      application.online_devices = _.where(application.device, {
        is_online: true
      }).length;
      application.devices_length = ((ref = application.device) != null ? ref.length : void 0) || 0;
      return application;
    }).nodeify(callback);
  };


  /**
   * get callback
   * @callback module:resin.models.application~getCallback
   * @param {(Error|null)} error - error
   * @param {Application} application - application
   */


  /**
   * @summary Get a single application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {module:resin.models.application~getCallback} callback - callback
   *
   * @example
   *	resin.models.application.get 'MyApp', (error, application) ->
   *		throw error if error?
   *		console.log(application)
   */

  exports.get = function(name, callback) {
    var username;
    if (name == null) {
      throw new errors.ResinMissingParameter('name');
    }
    if (!_.isString(name)) {
      throw new errors.ResinInvalidParameter('name', name, 'not a string');
    }
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    username = token.getUsername();
    if (username == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    return pine.get({
      resource: 'application',
      options: {
        filter: {
          app_name: name,
          user: {
            username: username
          }
        }
      }
    }).then(function(application) {
      if (_.isEmpty(application)) {
        throw new errors.ResinApplicationNotFound(name);
      }
      return _.first(application);
    }).nodeify(callback);
  };


  /**
   * has callback
   * @callback module:resin.models.application~hasCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} has - has application
   */


  /**
   * @summary Check if an application exist
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {module:resin.models.application~hasCallback} callback - callback
   *
   * @example
   *	resin.models.application.has 'MyApp', (error, hasApp) ->
   *		throw error if error?
   *		console.log(hasApp)
   */

  exports.has = function(name, callback) {
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    return exports.get(name, function(error) {
      if (error instanceof errors.ResinApplicationNotFound) {
        return callback(null, false);
      }
      if (error != null) {
        return callback(error);
      }
      return callback(null, true);
    });
  };


  /**
   * hasAny callback
   * @callback module:resin.models.application~hasAnyCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} hasAny - has any application
   */


  /**
   * @summary Check if the user has any applications
   * @public
   * @function
   *
   * @param {module:resin.models.application~hasAnyCallback} callback - callback
   *
   * @example
   *	resin.models.application.hasAny (error, hasAny) ->
   *		throw error if error?
   *		console.log("Has any? #{hasAny}")
   */

  exports.hasAny = function(callback) {
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    return exports.getAll(function(error) {
      if (error == null) {
        return callback(null, true);
      }
      if (error instanceof errors.ResinNotAny) {
        return callback(null, false);
      }
      return callback(error);
    });
  };


  /**
   * getById callback
   * @callback module:resin.models.application~getByIdCallback
   * @param {(Error|null)} error - error
   * @param {Application} application - application
   */


  /**
   * @summary Get a single application by id
   * @public
   * @function
   *
   * @param {(Number|String)} id - application id
   * @param {module:resin.models.application~getByIdCallback} callback - callback
   *
   * @example
   *	resin.models.application.getById 89, (error, application) ->
   *		throw error if error?
   *		console.log(application)
   */

  exports.getById = function(id, callback) {
    if (id == null) {
      throw new errors.ResinMissingParameter('id');
    }
    if (!_.isString(id) && !_.isNumber(id)) {
      throw new errors.ResinInvalidParameter('id', id, 'not a string not number');
    }
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    if (token.getUsername() == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    return pine.get({
      resource: 'application',
      id: id
    }).then(function(application) {
      if (application == null) {
        throw new errors.ResinApplicationNotFound(id);
      }
      return application;
    }).nodeify(callback);
  };


  /**
   * create callback
   * @callback module:resin.models.application~createCallback
   * @param {(Error|null)} error - error
   * @param {Number} id - application id
   */


  /**
   * @summary Create an application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {String} deviceType - device type (slug form)
   * @param {module:resin.models.application~createCallback} callback - callback
   *
   * @throw {NotFound} Will throw if the request doesn't returns an id
   *
   * @example
   *	resin.models.application.create 'My App', 'raspberry-pi', (error, id) ->
   *		throw error if error?
   *		console.log(id)
   */

  exports.create = function(name, deviceType, callback) {
    if (name == null) {
      throw new errors.ResinMissingParameter('name');
    }
    if (!_.isString(name)) {
      throw new errors.ResinInvalidParameter('name', name, 'not a string');
    }
    if (deviceType == null) {
      throw new errors.ResinMissingParameter('deviceType');
    }
    if (!_.isString(deviceType)) {
      throw new errors.ResinInvalidParameter('deviceType', deviceType, 'not a string');
    }
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    if (token.getUsername() == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    return deviceModel.getDeviceSlug(deviceType, function(error, deviceSlug) {
      if (error != null) {
        return callback(error);
      }
      if (deviceSlug == null) {
        return callback(new errors.ResinInvalidDeviceType(deviceType));
      }
      return pine.post({
        resource: 'application',
        body: {
          app_name: name,
          device_type: deviceSlug
        }
      }).get('id').nodeify(callback);
    });
  };


  /**
   * remove callback
   * @callback module:resin.models.application~removeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Remove application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {module:resin.models.application~removeCallback} callback - callback
   *
   * @example
   *	resin.models.application.remove 'MyApp', (error) ->
   *		throw error if error?
   */

  exports.remove = function(name, callback) {
    var username;
    if (name == null) {
      throw new errors.ResinMissingParameter('name');
    }
    if (!_.isString(name)) {
      throw new errors.ResinInvalidParameter('name', name, 'not a string');
    }
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    username = token.getUsername();
    if (username == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    return pine["delete"]({
      resource: 'application',
      options: {
        filter: {
          app_name: name,
          user: {
            username: username
          }
        }
      }
    }).nodeify(callback);
  };


  /**
   * restart callback
   * @callback module:resin.models.application~restartCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Restart application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {module:resin.models.application~restartCallback} callback - callback
   *
   * @example
   *	resin.models.application.restart 'MyApp', (error) ->
   *		throw error if error?
   */

  exports.restart = function(name, callback) {
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    return exports.get(name, function(error, application) {
      if (error != null) {
        return callback(error);
      }
      return request.request({
        method: 'POST',
        url: "/application/" + application.id + "/restart"
      }, _.unary(callback));
    });
  };


  /**
   * getApiKey callback
   * @callback module:resin.models.application~getApiKeyCallback
   * @param {(Error|null)} error - error
   * @param {String} apiKey - the api key
   */


  /**
   * @summary Get the API key for a specific application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {module:resin.models.application~getApiKeyCallback} callback - callback
   *
   * @example
   *	resin.models.application.getApiKey 'MyApp', (error, apiKey) ->
   *		throw error if error?
   *		console.log(apiKey)
   */

  exports.getApiKey = function(name, callback) {
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    return exports.get(name, function(error, application) {
      if (error != null) {
        return callback(error);
      }
      return request.request({
        method: 'POST',
        url: "/application/" + application.id + "/generate-api-key"
      }, function(error, response, body) {
        if (error != null) {
          return callback(error);
        }
        return callback(null, body);
      });
    });
  };


  /**
   * getConfiguration callback
   * @callback module:resin.models.application~getConfigurationCallback
   * @param {(Error|null)} error - error
   * @param {Object} configuration - application configuration
   */


  /**
   * @summary Get an application device configuration
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {Object} [options={}] - options
   * @param {String} [options.wifiSsid] - wifi ssid
   * @param {String} [options.wifiKey] - wifi key
   * @param {module:resin.models.application~getConfigurationCallback} callback - callback
   *
   * @example
   *	resin.models.application.getConfiguration 'MyApp',
   *		wifiSsid: 'foobar'
   *		wifiKey: 'hello'
   *	, (error, configuration) ->
   *		throw error if error?
   *		console.log(configuration)
   */

  exports.getConfiguration = function(name, options, callback) {
    if (options == null) {
      options = {};
    }
    return async.parallel({
      application: function(callback) {
        return exports.get(name, callback);
      },
      apiKey: function(callback) {
        return exports.getApiKey(name, callback);
      },
      userId: function(callback) {
        return auth.getUserId(callback);
      },
      username: function(callback) {
        return auth.whoami(callback);
      }
    }, function(error, results) {
      var configuration;
      if (error != null) {
        return callback(error);
      }
      if (results.username == null) {
        return callback(new errors.ResinNotLoggedIn());
      }
      configuration = {
        applicationId: String(results.application.id),
        apiKey: results.apiKey,
        deviceType: results.application.device_type,
        userId: String(results.userId),
        username: results.username,
        wifiSsid: options.wifiSsid,
        wifiKey: options.wifiKey,
        files: network.getFiles(options)
      };
      return callback(null, configuration);
    });
  };

}).call(this);
