
/**
 * @module resin.models.application
 */

(function() {
  var deviceModel, errors, pine, request, token, _;

  _ = require('lodash-contrib');

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

  pine = require('resin-pine');

  deviceModel = require('./device');


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
      var _ref;
      application.online_devices = _.where(application.device, {
        is_online: 1
      }).length;
      application.devices_length = ((_ref = application.device) != null ? _ref.length : void 0) || 0;
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

}).call(this);
