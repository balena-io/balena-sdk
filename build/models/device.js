
/*
The MIT License

Copyright (c) 2015 Resin.io, Inc. https://resin.io.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */


/**
 * @module resin.models.device
 */

(function() {
  var _, applicationModel, configModel, crypto, errors, pine, request, token;

  crypto = require('crypto');

  _ = require('lodash');

  pine = require('resin-pine');

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

  configModel = require('./config');

  applicationModel = require('./application');


  /**
   * @summary Get all devices
   * @public
   * @function
   *
   * @returns {Promise<Object[]>} devices
   *
   * @example
   * resin.models.devices.getAll().then (devices) ->
   * 	console.log(devices)
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        orderby: 'name asc'
      }
    }).map(function(device) {
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * @summary Get all devices by application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @returns {Promise<Object[]>} devices
   *
   * @example
   * resin.models.devices.getAllByApplication('MyApp').then (devices) ->
   * 	console.log(devices)
   */

  exports.getAllByApplication = function(name, callback) {
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
    }).map(function(device) {
      device.application_name = device.application[0].app_name;
      return device;
    }).nodeify(callback);
  };


  /**
   * @summary Get a single device
   * @public
   * @function
   *
   * @param {String} name - device name
   * @returns {Promise<Object>} device
   *
   * @example
   * resin.models.device.get('MyDevice').then (device) ->
   * 	console.log(device)
   */

  exports.get = function(name, callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        filter: {
          name: name
        }
      }
    }).tap(function(device) {
      if (_.isEmpty(device)) {
        throw new errors.ResinDeviceNotFound(name);
      }
    }).get(0).tap(function(device) {
      return device.application_name = device.application[0].app_name;
    }).nodeify(callback);
  };


  /**
   * @summary Get a single device by UUID
   * @public
   * @function
   *
   * @param {String} uuid - device UUID
   * @returns {Promise<Object>} device
   *
   * @example
   * resin.models.device.get('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (device) ->
   * 	console.log(device)
   */

  exports.getByUUID = function(uuid, callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        filter: {
          uuid: uuid
        }
      }
    }).tap(function(device) {
      if (_.isEmpty(device)) {
        throw new errors.ResinDeviceNotFound(uuid);
      }
    }).get(0).tap(function(device) {
      return device.application_name = device.application[0].app_name;
    }).nodeify(callback);
  };


  /**
   * @summary Check if a device exists
   * @public
   * @function
   *
   * @param {String} name - device name
   * @returns {Promise<Boolean>} has device
   *
   * @example
   * resin.models.device.has('MyDevice').then (hasDevice) ->
   * 	console.log(hasDevice)
   */

  exports.has = function(name, callback) {
    return exports.get(name)["return"](true)["catch"](errors.ResinDeviceNotFound, function() {
      return false;
    }).nodeify(callback);
  };


  /**
   * @summary Check if a device is online
   * @public
   * @function
   *
   * @param {String} name - device name
   * @returns {Promise<Boolean>} is device online
   *
   * @example
   * resin.models.device.isOnline('MyDevice').then (isOnline) ->
   * 	console.log("Is device online? #{isOnline}")
   */

  exports.isOnline = function(name, callback) {
    return exports.get(name).get('is_online').nodeify(callback);
  };


  /**
   * @summary Remove device
   * @public
   * @function
   *
   * @param {String} name - device name
   * @returns {Promise}
   *
   * @example
   * resin.models.device.remove('DeviceName')
   */

  exports.remove = function(name, callback) {
    return pine["delete"]({
      resource: 'device',
      options: {
        filter: {
          name: name
        }
      }
    }).nodeify(callback);
  };


  /**
   * @summary Identify device
   * @public
   * @function
   *
   * @param {String} name - device name
   * @returns {Promise}
   *
   * @example
   * resin.models.device.identify('MyDevice')
   */

  exports.identify = function(name, callback) {
    return exports.get(name).then(function(device) {
      return request.send({
        method: 'POST',
        url: '/blink',
        body: {
          uuid: device.uuid
        }
      });
    })["return"](void 0).nodeify(callback);
  };


  /**
   * @summary Rename device
   * @public
   * @function
   *
   * @param {String} name - device name
   * @param {String} newName - the device new name
   *
   * @returns {Promise}
   *
   * @example
   * resin.models.device.rename('MyDevice', 'NewName')
   */

  exports.rename = function(name, newName, callback) {
    return exports.get(name).then(function() {
      return pine.patch({
        resource: 'device',
        body: {
          name: newName
        },
        options: {
          filter: {
            name: name
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Note a device
   * @public
   * @function
   *
   * @param {String} name - device name
   * @param {String} note - the note
   *
   * @returns {Promise}
   *
   * @example
   * resin.models.device.note('MyDevice', 'My useful note')
   */

  exports.note = function(name, note, callback) {
    return exports.has(name).then(function(hasDevice) {
      if (!hasDevice) {
        throw new errors.ResinDeviceNotFound(name);
      }
      return pine.patch({
        resource: 'device',
        body: {
          note: note
        },
        options: {
          filter: {
            name: name
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Register a device with Resin.io
   * @function
   * @public
   *
   * @param {String} applicationName - application name
   * @param {Object} [options={}] - options
   * @param {String} [options.wifiSsid] - wifi ssid
   * @param {String} [options.wifiKey] - wifi key
   *
   * @returns {Promise<Object>} device
   *
   * @example
   * resin.models.device.register 'MyApp',
   * 	wifiSsid: 'foobar'
   * 	wifiKey: 'hello'
   * .then (device) ->
   * 	console.log(device)
   */

  exports.register = function(applicationName, options, callback) {
    if (options == null) {
      options = {};
    }
    return applicationModel.getConfiguration(applicationName, options).then(function(config) {
      return pine.post({
        resource: 'device',
        body: {
          user: config.userId,
          application: config.applicationId,
          uuid: exports.generateUUID(),
          device_type: config.deviceType
        },
        customOptions: {
          apikey: config.apiKey
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Checks if a UUID is valid
   * @public
   * @function
   *
   * @param {String} uuid - the device uuid
   * @param {module:resin.models.device~isValidUUIDCallback} callback - callback
   *
   * @returns {Promise<Boolean>} is uuid valid
   *
   * @todo We should get better server side support for this operation
   * to avoid having to get all devices list and check manually.
   *
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.models.device.isValidUUID(uuid).then (valid) ->
   * 	if valid
   * 		console.log('This is a valid UUID')
   */

  exports.isValidUUID = function(uuid, callback) {
    return exports.getAll().then(function(devices) {
      return _.findWhere(devices, {
        uuid: uuid
      }) != null;
    }).nodeify(callback);
  };


  /**
   * @summary Get display name for a device
   * @public
   * @function
   *
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
   *
   * @param {String} deviceTypeSlug - device type slug
   * @returns {Promise<String>} device display name
   *
   * @example
   * resin.models.device.getDisplayName('raspberry-pi').then (deviceTypeName) ->
   * 	console.log(deviceTypeName)
   * 	# Raspberry Pi
   */

  exports.getDisplayName = function(deviceTypeSlug, callback) {
    return configModel.getDeviceTypes().then(function(deviceTypes) {
      var deviceTypeFound;
      deviceTypeFound = _.findWhere(deviceTypes, {
        slug: deviceTypeSlug
      });
      return deviceTypeFound != null ? deviceTypeFound.name : void 0;
    }).nodeify(callback);
  };


  /**
   * @summary Get device slug
   * @public
   * @function
   *
   * @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
   *
   * @param {String} deviceTypeName - device type name
   * @returns {Promise<String>} device slug name
   *
   * @example
   * resin.models.device.getDeviceSlug('Raspberry Pi').then (deviceTypeSlug) ->
   * 	console.log(deviceTypeSlug)
   * 	# raspberry-pi
   */

  exports.getDeviceSlug = function(deviceTypeName, callback) {
    return configModel.getDeviceTypes().then(function(deviceTypes) {
      var deviceTypeFound;
      deviceTypeFound = _.findWhere(deviceTypes, {
        name: deviceTypeName
      });
      return deviceTypeFound != null ? deviceTypeFound.slug : void 0;
    }).nodeify(callback);
  };


  /**
   * @summary Get supported device types
   * @public
   * @function
   *
   * @returns {Promise<String[]>} supported device types
   *
   * @example
   * resin.models.device.getSupportedDeviceTypes().then (supportedDeviceTypes) ->
   * 	for supportedDeviceType in supportedDeviceTypes
   * 		console.log("Resin supports: #{supportedDeviceType}")
   */

  exports.getSupportedDeviceTypes = function(callback) {
    return configModel.getDeviceTypes().then(function(deviceTypes) {
      return _.pluck(deviceTypes, 'name');
    }).nodeify(callback);
  };


  /**
   * @summary Get a device manifest by slug
   * @public
   * @function
   *
   * @param {String} slug - device slug
   * @returns {Promise<Object>} device manifest
   *
   * @example
   * resin.models.device.getManifestBySlug('raspberry-pi').then (manifest) ->
   * 	console.log(manifest)
   */

  exports.getManifestBySlug = function(slug, callback) {
    return configModel.getDeviceTypes().then(function(deviceTypes) {
      var deviceManifest;
      deviceManifest = _.find(deviceTypes, {
        slug: slug
      });
      if (deviceManifest == null) {
        throw new Error("Unsupported device: " + slug);
      }
      return deviceManifest;
    }).nodeify(callback);
  };


  /**
   * @summary Generate a random device UUID
   * @function
   * @public
   *
   * @returns {String} A generated UUID
   *
   * @example
   * uuid = resin.models.device.generateUUID()
   */

  exports.generateUUID = function() {
    return crypto.pseudoRandomBytes(31).toString('hex');
  };

}).call(this);
