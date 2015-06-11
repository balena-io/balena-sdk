
/**
 * @module resin.models.application
 */

(function() {
  var Promise, _, async, auth, deviceModel, errors, network, pine, request, token;

  Promise = require('bluebird');

  async = require('async');

  _ = require('lodash-contrib');

  errors = require('resin-errors');

  request = Promise.promisifyAll(require('resin-request'));

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
    return Promise["try"](function() {
      var username;
      username = token.getUsername();
      if (username == null) {
        throw new errors.ResinNotLoggedIn();
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
      });
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
    return Promise["try"](function() {
      var username;
      username = token.getUsername();
      if (username == null) {
        throw new errors.ResinNotLoggedIn();
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
      });
    }).tap(function(application) {
      if (_.isEmpty(application)) {
        throw new errors.ResinApplicationNotFound(name);
      }
    }).get(0).nodeify(callback);
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
    return exports.get(name)["return"](true)["catch"](errors.ResinApplicationNotFound, function() {
      return false;
    }).nodeify(callback);
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
    return exports.getAll().then(function(applications) {
      return !_.isEmpty(applications);
    }).nodeify(callback);
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
    return Promise["try"](function() {
      if (token.getUsername() == null) {
        throw new errors.ResinNotLoggedIn();
      }
      return pine.get({
        resource: 'application',
        id: id
      });
    }).tap(function(application) {
      if (application == null) {
        throw new errors.ResinApplicationNotFound(id);
      }
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
    return Promise["try"](function() {
      if (token.getUsername() == null) {
        throw new errors.ResinNotLoggedIn();
      }
      return deviceModel.getDeviceSlug(deviceType);
    }).tap(function(deviceSlug) {
      if (deviceSlug == null) {
        throw new errors.ResinInvalidDeviceType(deviceType);
      }
    }).then(function(deviceSlug) {
      return pine.post({
        resource: 'application',
        body: {
          app_name: name,
          device_type: deviceSlug
        }
      });
    }).nodeify(callback);
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
    return Promise["try"](function() {
      var username;
      username = token.getUsername();
      if (username == null) {
        throw new errors.ResinNotLoggedIn();
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
      });
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
    return exports.get(name).then(function(application) {
      return request.requestAsync({
        method: 'POST',
        url: "/application/" + application.id + "/restart"
      });
    }).nodeify(_.unary(callback));
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
    return exports.get(name).then(function(application) {
      return request.requestAsync({
        method: 'POST',
        url: "/application/" + application.id + "/generate-api-key"
      });
    }).get('body').nodeify(callback);
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
    return Promise.all([exports.gek(name), exports.getApiKey(name), auth.getUserId(), auth.whoami()]).spread(function(application, apiKey, userId, username) {
      if (username == null) {
        throw new errors.ResinNotLoggedIn();
      }
      return {
        applicationId: String(application.id),
        apiKey: apiKey,
        deviceType: application.device_type,
        userId: String(userId),
        username: username,
        wifiSsid: options.wifiSsid,
        wifiKey: options.wifiKey,
        files: network.getFiles(options)
      };
    }).nodeify(callback);
  };

}).call(this);
