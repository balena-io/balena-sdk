
/**
 * @module resin/models/application
 */

(function() {
  var deviceModel, errors, pine, server, settings, _;

  _ = require('lodash-contrib');

  pine = require('../pine');

  deviceModel = require('./device');

  errors = require('../errors');

  server = require('../server');

  settings = require('../settings');


  /**
   * A Resin API application
   * @typedef {Object} Application
   */


  /**
   * getAll callback
   * @callback module:resin/models/application~getAllCallback
   * @param {(Error|null)} error - error
   * @param {Application[]} applications - applications
   */


  /**
   * @summary Get all applications
   * @public
   * @function
   *
   * @param {module:resin/models/application~getAllCallback} callback - callback
   *
   * @example
   *	resin.models.application.getAll (error, applications) ->
   *		throw error if error?
   *		console.log(applications)
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'application',
      options: {
        orderby: 'app_name asc',
        expand: 'device'
      }
    }).then(function(applications) {
      if (_.isEmpty(applications)) {
        return callback(new errors.NotAny('applications'));
      }
      applications = _.map(applications, function(application) {
        var _ref;
        application.device_display_name = deviceModel.getDisplayName(application.device_type);
        application.online_devices = _.where(application.device, {
          is_online: 1
        }).length;
        application.devices_length = ((_ref = application.device) != null ? _ref.length : void 0) || 0;
        return application;
      });
      return callback(null, applications);
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * get callback
   * @callback module:resin/models/application~getCallback
   * @param {(Error|null)} error - error
   * @param {Application} application - application
   */


  /**
   * @summary Get a single application
   * @public
   * @function
   *
   * @param {(String|Number)} id - application id
   * @param {module:resin/models/application~getCallback} callback - callback
   *
   * @example
   *	resin.models.application.get 51, (error, application) ->
   *		throw error if error?
   *		console.log(application)
   */

  exports.get = function(id, callback) {
    return pine.get({
      resource: 'application',
      id: id
    }).then(function(application) {
      if (application == null) {
        return callback(new errors.NotFound("application " + id));
      }
      application.device_display_name = deviceModel.getDisplayName(application.device_type);
      return callback(null, application);
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * create callback
   * @callback module:resin/models/application~createCallback
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
   * @param {module:resin/models/application~createCallback} callback - callback
   *
   * @throw {NotFound} Will throw if the request doesn't returns an id
   *
   * @example
   *	resin.models.application.create 'My App', 'raspberry-pi', (error, id) ->
   *		throw error if error?
   *		console.log(id)
   */

  exports.create = function(name, deviceType, callback) {
    return pine.post({
      resource: 'application',
      data: {
        app_name: name,
        device_type: deviceType
      }
    }).then(function(res) {
      var id;
      id = res != null ? res.id : void 0;
      if (id == null) {
        return callback(new errors.NotFound('created application id'));
      }
      return callback(null, id);
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * remove callback
   * @callback module:resin/models/application~removeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Remove application
   * @public
   * @function
   *
   * @param {(String|Number)} id - application id
   * @param {module:resin/models/application~removeCallback} callback - callback
   *
   * @example
   *	resin.models.application.remove 51, (error) ->
   *		throw error if error?
   */

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'application',
      id: id
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };


  /**
   * restart callback
   * @callback module:resin/models/application~restartCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Restart application
   * @public
   * @function
   *
   * @param {(String|Number)} id - application id
   * @param {module:resin/models/application~restartCallback} callback - callback
   *
   * @example
   *	resin.models.application.restart 51, (error) ->
   *		throw error if error?
   */

  exports.restart = function(id, callback) {
    var url;
    url = _.template(settings.get('urls.applicationRestart'), {
      id: id
    });
    return server.post(url, _.unary(callback));
  };

}).call(this);
