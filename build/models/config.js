
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

(function() {
  var _, deviceModel, request;

  _ = require('lodash');

  request = require('resin-request');

  deviceModel = require('./device');


  /**
   * @summary Get all configuration
   * @name getAll
   * @public
   * @function
   * @memberof resin.models.config
   *
   * @fulfil {Object} - configuration
   * @returns {Promise}
   *
   * @example
   * resin.models.config.getAll().then(function(config) {
   * 	console.log(config);
   * });
   *
   * @example
   * resin.models.config.getAll(function(error, config) {
   * 	if (error) throw error;
   * 	console.log(config);
   * });
   */

  exports.getAll = function(callback) {
    return request.send({
      method: 'GET',
      url: '/config'
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Get PubNub keys
   * @name getPubNubKeys
   * @private
   * @function
   * @memberof resin.models.config
   *
   * @fulfil {Object} - pubnub keys
   * @returns {Promise}
   *
   * @example
   * resin.models.config.getPubNubKeys().then(function(pubnubKeys) {
   * 	console.log(pubnubKeys.subscribe_key);
   * 	console.log(pubnubKeys.publish_key);
   * });
   *
   * @example
   * resin.models.config.getPubNubKeys(function(error, pubnubKeys) {
   * 	if (error) throw error;
   * 	console.log(pubnubKeys.subscribe_key);
   * 	console.log(pubnubKeys.publish_key);
   * });
   */

  exports.getPubNubKeys = function(callback) {
    return exports.getAll().get('pubnub').tap(function(keys) {
      if (keys == null) {
        throw new Error('No pubnub keys');
      }
    }).nodeify(callback);
  };


  /**
   * @summary Get Mixpanel token
   * @name getMixpanelToken
   * @private
   * @function
   * @memberof resin.models.config
   *
   * @fulfil {String} - Mixpanel token
   * @returns {Promise}
   *
   * @example
   * resin.models.config.getMixpanelToken().then(function(mixpanelToken) {
   * 	console.log(mixpanelToken);
   * });
   *
   * @example
   * resin.models.config.getMixpanelToken(function(error, mixpanelToken) {
   * 	if (error) throw error;
   * 	console.log(mixpanelToken);
   * });
   */

  exports.getMixpanelToken = function(callback) {
    return exports.getAll().get('mixpanelToken').tap(function(mixpanelToken) {
      if (mixpanelToken == null) {
        throw new Error('No mixpanel token');
      }
    }).nodeify(callback);
  };


  /**
   * @summary Get device types
   * @name getDeviceTypes
   * @public
   * @function
   * @memberof resin.models.config
   *
   * @fulfil {Object[]} - device types
   * @returns {Promise}
   *
   * @example
   * resin.models.config.getDeviceTypes().then(function(deviceTypes) {
   * 	console.log(deviceTypes);
   * });
   *
   * @example
   * resin.models.config.getDeviceTypes(function(error, deviceTypes) {
   * 	if (error) throw error;
   * 	console.log(deviceTypes);
   * })
   */

  exports.getDeviceTypes = function(callback) {
    return exports.getAll().get('deviceTypes').tap(function(deviceTypes) {
      if (deviceTypes == null) {
        throw new Error('No device types');
      }
    }).nodeify(callback);
  };


  /**
   * @summary Get configuration/initialization options for a device type
   * @name getDeviceOptions
   * @public
   * @function
   * @memberof resin.models.config
   *
   * @param {String} deviceType - device type slug
   * @fulfil {Object[]} - configuration options
   * @returns {Promise}
   *
   * @example
   * resin.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
   * 	console.log(options);
   * });
   *
   * @example
   * resin.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
   * 	if (error) throw error;
   * 	console.log(options);
   * });
   */

  exports.getDeviceOptions = function(deviceType, callback) {
    return deviceModel.getManifestBySlug(deviceType).then(function(manifest) {
      if (manifest.initialization == null) {
        manifest.initialization = {};
      }
      return _.union(manifest.options, manifest.initialization.options);
    }).nodeify(callback);
  };

}).call(this);
