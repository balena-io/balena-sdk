
/**
 * @module resin.models.device
 */

(function() {
  var _, configModel, errors, pine, server, settings;

  pine = require('../pine');

  _ = require('lodash-contrib');

  errors = require('../errors');

  server = require('../server');

  settings = require('../settings');

  configModel = require('./config');


  /**
   * A Resin API device
   * @typedef {Object} Device
   */


  /**
   * getAll callback
   * @callback module:resin.models.device~getAllCallback
   * @param {(Error|null)} error - error
   * @param {Device[]} devices - devices
   */


  /**
   * @summary Get all devices
   * @public
   * @function
  #
   * @param {module:resin.models.device~getAllCallback} callback - callback(error, devices)
  #
   * @example
  #	resin.models.devices.getAll (error, devices) ->
  #		throw error if error?
  #		console.log(devices)
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        orderby: 'name asc'
      }
    }).then(function(devices) {
      if (_.isEmpty(devices)) {
        throw new errors.ResinNotAny('devices');
      }
      return devices;
    }).nodeify(callback);
  };


  /**
   * getAllByApplication callback
   * @callback module:resin.models.device~getAllByApplicationCallback
   * @param {(Error|null)} error - error
   * @param {Device[]} devices - devices
   */


  /**
   * @summary Get all devices by application
   * @public
   * @function
  #
   * @param {(String|Number)} applicationId - application id
   * @param {module:resin.models.device~getAllByApplicationCallback} callback - callback
  #
   * @example
  #	resin.models.devices.getAllByApplication (error, devices) ->
  #		throw error if error?
  #		console.log(devices)
   */

  exports.getAllByApplication = function(applicationId, callback) {
    return pine.get({
      resource: 'device',
      options: {
        filter: {
          application: applicationId
        },
        expand: 'application',
        orderby: 'name asc'
      }
    }).then(function(devices) {
      if (_.isEmpty(devices)) {
        throw new errors.ResinNotAny('devices');
      }
      return devices;
    }).map(function(device) {
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * get callback
   * @callback module:resin.models.device~getCallback
   * @param {(Error|null)} error - error
   * @param {Device} device - device
   */


  /**
   * @summary Get a single device
   * @public
   * @function
  #
   * @param {(String|Number)} id - device id
   * @param {module:resin.models.device~getCallback} callback - callback
  #
   * @example
  #	resin.models.device.get 51, (error, device) ->
  #		throw error if error?
  #		console.log(device)
   */

  exports.get = function(deviceId, callback) {
    return pine.get({
      resource: 'device',
      id: deviceId,
      options: {
        expand: 'application'
      }
    }).then(function(device) {
      if (device == null) {
        throw new errors.ResinDeviceNotFound(deviceId);
      }
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * remove callback
   * @callback module:resin.models.device~removeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Remove device
   * @public
   * @function
  #
   * @param {(String|Number)} id - device id
   * @param {module:resin.models.device~removeCallback} callback - callback
  #
   * @example
  #	resin.models.device.remove 51, (error) ->
  #		throw error if error?
   */

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'device',
      id: id
    }).nodeify(callback);
  };


  /**
   * identify callback
   * @callback module:resin.models.device~identifyCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Identify device
   * @public
   * @function
  #
   * @param {String} uuid - device uuid
   * @param {module:resin.models.device~identifyCallback} callback - callback
  #
   * @example
  #	resin.models.device.identify '23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a21369ac0f00db828', (error) ->
  #		throw error if error?
   */

  exports.identify = function(uuid, callback) {
    return server.post(settings.get('urls.identify'), {
      uuid: uuid
    }, _.unary(callback));
  };


  /**
   * rename callback
   * @callback module:resin.models.device~renameCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Rename device
   * @public
   * @function
  #
   * @param {(String|Number)} id - device id
   * @param {String} name - the device new name
   * @param {module:resin.models.device~renameCallback} callback - callback
  #
   * @todo This action doesn't return any error
   * if trying to rename a device that does not
   * exists. This should be fixed server side.
  #
   * @example
  #	resin.models.device.rename 317, 'NewName', (error) ->
  #		throw error if error?
  #		console.log("Device has been renamed!")
   */

  exports.rename = function(id, name, callback) {
    return pine.patch({
      resource: 'device',
      id: id,
      body: {
        name: name
      }
    }).nodeify(callback);
  };


  /**
   * note callback
   * @callback module:resin.models.device~noteCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Note a device
   * @public
   * @function
  #
   * @param {(String|Number)} id - device id
   * @param {String} note - the note
   * @param {module:resin.models.device~noteCallback} callback - callback
  #
   * @example
  #	resin.models.device.note 317, 'My useful note', (error) ->
  #		throw error if error?
  #		console.log("Device has been noted!")
   */

  exports.note = function(id, note, callback) {
    return pine.patch({
      resource: 'device',
      id: id,
      body: {
        note: note
      }
    }).nodeify(callback);
  };


  /**
   * isValidUUID callback
   * @callback module:resin.models.device~isValidUUIDCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} isValid - whether is valid or not
   */


  /**
   * @summary Checks if a UUID is valid
   * @public
   * @function
  #
   * @param {String} uuid - the device uuid
   * @param {module:resin.models.device~isValidUUIDCallback} callback - callback
  #
   * @todo We should get better server side support for this operation
   * to avoid having to get all devices list and check manually.
  #
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.models.device.isValidUUID uuid, (error, valid) ->
  #		throw error if error?
  #
  #		if valid
  #			console.log('This is a valid UUID')
   */

  exports.isValidUUID = function(uuid, callback) {
    if (callback == null) {
      callback = _.noop;
    }
    return exports.getAll(function(error, devices) {
      var uuidExists;
      if (error != null) {
        return callback(error);
      }
      uuidExists = _.findWhere(devices, {
        uuid: uuid
      }) != null;
      return callback(null, uuidExists);
    });
  };


  /**
   * getDisplayName callback
   * @callback module:resin.models.device~getDisplayName
   * @param {(Error|null)} error - error
   * @param {String|Undefined} deviceTypeName - the device type display name or undefined
   */


  /**
   * @summary Get display name for a device
   * @public
   * @function
  #
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
  #
   * @param {String} deviceTypeSlug - device type slug
   * @param {module:resin.models.device~getDisplayName} callback - callback
  #
   * @example
   * resin.models.device.getDisplayName 'raspberry-pi', (error, deviceTypeName) ->
  #		throw error if error?
  #		console.log(deviceTypeName)
  #		# Raspberry Pi
   */

  exports.getDisplayName = function(deviceTypeSlug, callback) {
    return configModel.getDeviceTypes(function(error, deviceTypes) {
      var deviceTypeFound;
      if (error != null) {
        return callback(error);
      }
      deviceTypeFound = _.findWhere(deviceTypes, {
        slug: deviceTypeSlug
      });
      return callback(null, deviceTypeFound != null ? deviceTypeFound.name : void 0);
    });
  };


  /**
   * getDeviceSlug callback
   * @callback module:resin.models.device~getDeviceSlug
   * @param {(Error|null)} error - error
   * @param {String|Undefined} deviceTypeSlug - the device type slug or undefined
   */


  /**
   * @summary Get device slug
   * @public
   * @function
  #
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
  #
   * @param {String} deviceTypeName - device type name
   * @param {module:resin.models.device~getDeviceSlug} callback - callback
  #
   * @example
   * resin.models.device.getDeviceSlug 'Raspberry Pi', (error, deviceTypeSlug) ->
  #		throw error if error?
  #		console.log(deviceTypeSlug)
  #		# raspberry-pi
   */

  exports.getDeviceSlug = function(deviceTypeName, callback) {
    return configModel.getDeviceTypes(function(error, deviceTypes) {
      var deviceFound;
      if (error != null) {
        return callback(error);
      }
      deviceFound = _.findWhere(deviceTypes, {
        name: deviceTypeName
      });
      return callback(null, deviceFound != null ? deviceFound.slug : void 0);
    });
  };


  /**
   * getSupportedDeviceTypes callback
   * @callback module:resin.models.device~getSupportedDeviceTypes
   * @param {(Error|null)} error - error
   * @param {String[]} supportedDeviceTypes - a list of supported device types by name
   */


  /**
   * @summary Get supported device types
   * @public
   * @function
  #
   * @param {module:resin.models.device~getSupportedDeviceTypes} callback - callback
  #
   * @example
   * resin.models.device.getSupportedDeviceTypes (error, supportedDeviceTypes) ->
  #		throw error if error?
  #
  #		for supportedDeviceType in supportedDeviceTypes
  #			console.log("Resin supports: #{supportedDeviceType}")
   */

  exports.getSupportedDeviceTypes = function(callback) {
    return configModel.getDeviceTypes(function(error, deviceTypes) {
      if (error != null) {
        return callback(error);
      }
      return callback(null, _.pluck(deviceTypes, 'name'));
    });
  };

}).call(this);
