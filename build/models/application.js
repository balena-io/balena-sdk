
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
 * @module resin.models.application
 */

(function() {
  var Promise, _, auth, deviceModel, errors, network, pine, request;

  Promise = require('bluebird');

  _ = require('lodash');

  errors = require('resin-errors');

  request = require('resin-request');

  pine = require('resin-pine');

  network = require('resin-network-config');

  deviceModel = require('./device');

  auth = require('../auth');


  /**
   * @summary Get all applications
   * @public
   * @function
   *
   * @returns {Promise<Object[]>} applications
   *
   * @example
   * resin.models.application.getAll().then (applications) ->
   * 	console.log(applications)
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'application',
      options: {
        orderby: 'app_name asc',
        expand: 'device'
      }
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
   * @summary Get a single application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @returns {Promise<Object>} application
   *
   * @example
   * resin.models.application.get('MyApp').then (application) ->
   * 	console.log(application)
   */

  exports.get = function(name, callback) {
    return pine.get({
      resource: 'application',
      options: {
        filter: {
          app_name: name
        }
      }
    }).tap(function(application) {
      if (_.isEmpty(application)) {
        throw new errors.ResinApplicationNotFound(name);
      }
    }).get(0).nodeify(callback);
  };


  /**
   * @summary Check if an application exist
   * @public
   * @function
   *
   * @param {String} name - application name
   * @returns {Promise<Boolean>} has application
   *
   * @example
   * resin.models.application.has('MyApp').then (hasApp) ->
   * 	console.log(hasApp)
   */

  exports.has = function(name, callback) {
    return exports.get(name)["return"](true)["catch"](errors.ResinApplicationNotFound, function() {
      return false;
    }).nodeify(callback);
  };


  /**
   * @summary Check if the user has any applications
   * @public
   * @function
   *
   * @returns {Promise<Boolean>} has any applications
   *
   * @example
   *	resin.models.application.hasAny().then (hasAny) ->
   *		console.log("Has any? #{hasAny}")
   */

  exports.hasAny = function(callback) {
    return exports.getAll().then(function(applications) {
      return !_.isEmpty(applications);
    }).nodeify(callback);
  };


  /**
   * @summary Get a single application by id
   * @public
   * @function
   *
   * @param {(Number|String)} id - application id
   * @returns {Promise<Object>} application
   *
   * @example
   * resin.models.application.getById(89).then (application) ->
   * 	console.log(application)
   */

  exports.getById = function(id, callback) {
    return pine.get({
      resource: 'application',
      id: id
    }).tap(function(application) {
      if (application == null) {
        throw new errors.ResinApplicationNotFound(id);
      }
    }).nodeify(callback);
  };


  /**
   * @summary Create an application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {String} deviceType - device type (slug form)
   *
   * @returns {Promise<Number>} application id
   *
   * @example
   * resin.models.application.create('My App', 'raspberry-pi').then (id) ->
   * 	console.log(id)
   */

  exports.create = function(name, deviceType, callback) {
    return deviceModel.getDeviceSlug(deviceType).tap(function(deviceSlug) {
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
   * @summary Remove application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @returns {Promise}
   *
   * @example
   * resin.models.application.remove('MyApp')
   */

  exports.remove = function(name, callback) {
    return pine["delete"]({
      resource: 'application',
      options: {
        filter: {
          app_name: name
        }
      }
    }).nodeify(callback);
  };


  /**
   * @summary Restart application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @returns {Promise}
   *
   * @example
   * resin.models.application.restart('MyApp')
   */

  exports.restart = function(name, callback) {
    return exports.get(name).then(function(application) {
      return request.send({
        method: 'POST',
        url: "/application/" + application.id + "/restart"
      });
    })["return"](void 0).nodeify(callback);
  };


  /**
   * @summary Get the API key for a specific application
   * @public
   * @function
   *
   * @param {String} name - application name
   * @returns {Promise<String>} the api key
   *
   * @example
   * resin.models.application.getApiKey('MyApp').then (apiKey) ->
   * 	console.log(apiKey)
   */

  exports.getApiKey = function(name, callback) {
    return exports.get(name).then(function(application) {
      return request.send({
        method: 'POST',
        url: "/application/" + application.id + "/generate-api-key"
      });
    }).get('body').nodeify(callback);
  };


  /**
   * @summary Get an application device configuration
   * @public
   * @function
   *
   * @param {String} name - application name
   * @param {Object} [options={}] - options
   * @param {String} [options.wifiSsid] - wifi ssid
   * @param {String} [options.wifiKey] - wifi key
   *
   * @returns {Promise<Object>} application configuration
   *
   * @example
   * resin.models.application.getConfiguration 'MyApp',
   * 	wifiSsid: 'foobar'
   * 	wifiKey: 'hello'
   * .then (configuration) ->
   * 	console.log(configuration)
   */

  exports.getConfiguration = function(name, options, callback) {
    if (options == null) {
      options = {};
    }
    return Promise.all([exports.get(name), exports.getApiKey(name), auth.getUserId(), auth.whoami()]).spread(function(application, apiKey, userId, username) {
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
