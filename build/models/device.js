
/**
 * @module resin.models.device
 */

(function() {
  var configModel, errors, pine, request, token, _;

  _ = require('lodash-contrib');

  pine = require('resin-pine');

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

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
   *
   * @param {module:resin.models.device~getAllCallback} callback - callback(error, devices)
   *
   * @example
   *	resin.models.devices.getAll (error, devices) ->
   *		throw error if error?
   *		console.log(devices)
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
      resource: 'device',
      options: {
        expand: 'application',
        orderby: 'name asc',
        filter: {
          user: {
            username: username
          }
        }
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
   * getAllByApplication callback
   * @callback module:resin.models.device~getAllByApplicationCallback
   * @param {(Error|null)} error - error
   * @param {Device[]} devices - devices
   */


  /**
   * @summary Get all devices by application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {module:resin.models.device~getAllByApplicationCallback} callback - callback
   *
   * @example
   *	resin.models.devices.getAllByApplication 'MyApp', (error, devices) ->
   *		throw error if error?
   *		console.log(devices)
   */

  exports.getAllByApplication = function(name, callback) {
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
    if (token.getUsername() == null) {
      return callback(new errors.ResinNotLoggedIn());
    }
    return pine.get({
      resource: 'device',
      options: {
        filter: {
          application: {
            app_name: name
          }
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
   *
   * @param {String} name - device name
   * @param {module:resin.models.device~getCallback} callback - callback
   *
   * @example
   *	resin.models.device.get 'MyDevice', (error, device) ->
   *		throw error if error?
   *		console.log(device)
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
      resource: 'device',
      options: {
        expand: 'application',
        filter: {
          name: name,
          user: {
            username: username
          }
        }
      }
    }).then(function(device) {
      if (_.isEmpty(device)) {
        throw new errors.ResinDeviceNotFound(name);
      }
      device = _.first(device);
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * getByUUID callback
   * @callback module:resin.models.device~getByUUIDCallback
   * @param {(Error|null)} error - error
   * @param {Device} device - device
   */


  /**
   * @summary Get a single device by UUID
   * @public
   * @function
   *
   * @param {String} uuid - device UUID
   * @param {module:resin.models.device~getByUUIDCallback} callback - callback
   *
   * @example
   *	resin.models.device.get '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, device) ->
   *		throw error if error?
   *		console.log(device)
   */

  exports.getByUUID = function(uuid, callback) {
    var username;
    if (uuid == null) {
      throw new errors.ResinMissingParameter('uuid');
    }
    if (!_.isString(uuid)) {
      throw new errors.ResinInvalidParameter('uuid', uuid, 'not a string');
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
      resource: 'device',
      options: {
        expand: 'application',
        filter: {
          uuid: uuid,
          user: {
            username: username
          }
        }
      }
    }).then(function(device) {
      if (_.isEmpty(device)) {
        throw new errors.ResinDeviceNotFound(uuid);
      }
      device = _.first(device);
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * has callback
   * @callback module:resin.models.device~hasCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} has - has device
   */


  /**
   * @summary Check if a device exists
   * @public
   * @function
   *
   * @param {String} name - device name
   * @param {module:resin.models.device~hasCallback} callback - callback
   *
   * @example
   *	resin.models.device.has 'MyDevice', (error, hasDevice) ->
   *		throw error if error?
   *		console.log(hasDevice)
   */

  exports.has = function(name, callback) {
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    return exports.get(name, function(error) {
      if (error instanceof errors.ResinDeviceNotFound) {
        return callback(null, false);
      }
      if (error != null) {
        return callback(error);
      }
      return callback(null, true);
    });
  };


  /**
   * isOnline callback
   * @callback module:resin.models.device~isOnlineCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} isOnline - is online
   */


  /**
   * @summary Check if a device is online
   * @public
   * @function
   *
   * @param {String} name - device name
   * @param {module:resin.models.device~isOnlineCallback} callback - callback
   *
   * @example
   *	resin.models.device.isOnline 'MyDevice', (error, isOnline) ->
   *		throw error if error?
   *		console.log("Is device online? #{isOnline}")
   */

  exports.isOnline = function(name, callback) {
    if (callback == null) {
      throw new errors.ResinMissingParameter('callback');
    }
    if (!_.isFunction(callback)) {
      throw new errors.ResinInvalidParameter('callback', callback, 'not a function');
    }
    return exports.get(name, function(error, device) {
      if (error != null) {
        return callback(error);
      }
      return callback(null, !!device.is_online);
    });
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
   *
   * @param {String} name - device name
   * @param {module:resin.models.device~removeCallback} callback - callback
   *
   * @example
   *	resin.models.device.remove 'DeviceName', (error) ->
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
      resource: 'device',
      options: {
        filter: {
          name: name,
          user: {
            username: username
          }
        }
      }
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
   *
   * @param {String} uuid - device uuid
   * @param {module:resin.models.device~identifyCallback} callback - callback
   *
   * @example
   *	resin.models.device.identify '23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a21369ac0f00db828', (error) ->
   *		throw error if error?
   */

  exports.identify = function(uuid, callback) {
    if (uuid == null) {
      throw new errors.ResinMissingParameter('uuid');
    }
    if (!_.isString(uuid)) {
      throw new errors.ResinInvalidParameter('uuid', uuid, 'not a string');
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
    return request.request({
      method: 'POST',
      url: '/blink',
      json: {
        uuid: uuid
      }
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
   *
   * @param {String} name - device name
   * @param {String} newName - the device new name
   * @param {module:resin.models.device~renameCallback} callback - callback
   *
   * @todo This action doesn't return any error
   * if trying to rename a device that does not
   * exists. This should be fixed server side.
   *
   * @example
   *	resin.models.device.rename 317, 'NewName', (error) ->
   *		throw error if error?
   *		console.log("Device has been renamed!")
   */

  exports.rename = function(name, newName, callback) {
    var username;
    if (name == null) {
      throw new errors.ResinMissingParameter('name');
    }
    if (!_.isString(name)) {
      throw new errors.ResinInvalidParameter('name', name, 'not a string');
    }
    if (newName == null) {
      throw new errors.ResinMissingParameter('newName');
    }
    if (!_.isString(newName)) {
      throw new errors.ResinInvalidParameter('newName', newName, 'not a string');
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
    return pine.patch({
      resource: 'device',
      body: {
        name: newName
      },
      options: {
        filter: {
          name: name,
          user: {
            username: username
          }
        }
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
   *
   * @param {String} name - device name
   * @param {String} note - the note
   * @param {module:resin.models.device~noteCallback} callback - callback
   *
   * @example
   *	resin.models.device.note 'MyDevice', 'My useful note', (error) ->
   *		throw error if error?
   *		console.log("Device has been noted!")
   */

  exports.note = function(name, note, callback) {
    var username;
    if (name == null) {
      throw new errors.ResinMissingParameter('name');
    }
    if (!_.isString(name)) {
      throw new errors.ResinInvalidParameter('name', name, 'not a string');
    }
    if (note == null) {
      throw new errors.ResinMissingParameter('note');
    }
    if (!_.isString(note)) {
      throw new errors.ResinInvalidParameter('note', note, 'not a string');
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
    return exports.has(name, function(error, hasDevice) {
      if (error != null) {
        return callback(error);
      }
      if (!hasDevice) {
        return callback(new errors.ResinDeviceNotFound(name));
      }
      return pine.patch({
        resource: 'device',
        body: {
          note: note
        },
        options: {
          filter: {
            name: name,
            user: {
              username: username
            }
          }
        }
      }).nodeify(callback);
    });
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
   *
   * @param {String} uuid - the device uuid
   * @param {module:resin.models.device~isValidUUIDCallback} callback - callback
   *
   * @todo We should get better server side support for this operation
   * to avoid having to get all devices list and check manually.
   *
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.models.device.isValidUUID uuid, (error, valid) ->
   *		throw error if error?
   *
   *		if valid
   *			console.log('This is a valid UUID')
   */

  exports.isValidUUID = function(uuid, callback) {
    if (uuid == null) {
      throw new errors.ResinMissingParameter('uuid');
    }
    if (!_.isString(uuid)) {
      throw new errors.ResinInvalidParameter('uuid', uuid, 'not a string');
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
   *
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
   *
   * @param {String} deviceTypeSlug - device type slug
   * @param {module:resin.models.device~getDisplayName} callback - callback
   *
   * @todo Test this.
   *
   * @example
   * resin.models.device.getDisplayName 'raspberry-pi', (error, deviceTypeName) ->
   *		throw error if error?
   *		console.log(deviceTypeName)
   *		# Raspberry Pi
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
   *
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
   *
   * @param {String} deviceTypeName - device type name
   * @param {module:resin.models.device~getDeviceSlug} callback - callback
   *
   * @todo Test this.
   *
   * @example
   * resin.models.device.getDeviceSlug 'Raspberry Pi', (error, deviceTypeSlug) ->
   *		throw error if error?
   *		console.log(deviceTypeSlug)
   *		# raspberry-pi
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
   *
   * @param {module:resin.models.device~getSupportedDeviceTypes} callback - callback
   *
   * @todo Test this.
   *
   * @example
   * resin.models.device.getSupportedDeviceTypes (error, supportedDeviceTypes) ->
   *		throw error if error?
   *
   *		for supportedDeviceType in supportedDeviceTypes
   *			console.log("Resin supports: #{supportedDeviceType}")
   */

  exports.getSupportedDeviceTypes = function(callback) {
    return configModel.getDeviceTypes(function(error, deviceTypes) {
      if (error != null) {
        return callback(error);
      }
      return callback(null, _.pluck(deviceTypes, 'name'));
    });
  };


  /**
   * getManifestBySlug callback
   * @callback module:resin.models.device~getManifestBySlug
   * @param {(Error|null)} error - error
   * @param {Object} manifest - the device manifest
   */


  /**
   * @summary Get a device manifest by slug
   * @public
   * @function
   *
   * @param {String} slug - device slug
   * @param {module:resin.models.device~getManifestBySlug} callback - callback
   *
   * @todo Test this.
   *
   * @example
   * resin.models.device.getManifestBySlug 'raspberry-pi' (error, manifest) ->
   *		throw error if error?
   *		console.log(manifest)
   */

  exports.getManifestBySlug = function(slug, callback) {
    return configModel.getDeviceTypes(function(error, deviceTypes) {
      var deviceManifest;
      if (error != null) {
        return callback(error);
      }
      deviceManifest = _.find(deviceTypes, {
        slug: slug
      });
      if (deviceManifest == null) {
        return callback(new Error("Unsupported device: " + slug));
      }
      return callback(null, deviceManifest);
    });
  };

}).call(this);
