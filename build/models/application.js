
/*
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function() {
  var _, deviceModel, errors, pine, request, token;

  _ = require('lodash');

  errors = require('resin-errors');

  request = require('resin-request');

  token = require('resin-token');

  pine = require('resin-pine');

  deviceModel = require('./device');


  /**
   * @summary Get all applications
   * @name getAll
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @fulfil {Object[]} - applications
   * @returns {Promise}
   *
   * @example
   * resin.models.application.getAll().then(function(applications) {
   * 	console.log(applications);
   * });
   *
   * @example
   * resin.models.application.getAll(function(error, applications) {
   * 	if (error) throw error;
   * 	console.log(applications);
   * });
   */

  exports.getAll = function(callback) {
    return token.getUserId().then(function(userId) {
      return pine.get({
        resource: 'application',
        options: {
          orderby: 'app_name asc',
          expand: 'device',
          filter: {
            user: userId
          }
        }
      });
    }).map(function(application) {
      var ref;
      application.online_devices = _.filter(application.device, {
        is_online: true
      }).length;
      application.devices_length = ((ref = application.device) != null ? ref.length : void 0) || 0;
      return application;
    }).nodeify(callback);
  };


  /**
   * @summary Get a single application
   * @name get
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {String} name - application name
   * @fulfil {Object} - application
   * @returns {Promise}
   *
   * @example
   * resin.models.application.get('MyApp').then(function(application) {
   * 	console.log(application);
   * });
   *
   * @example
   * resin.models.application.get('MyApp', function(error, application) {
   * 	if (error) throw error;
   * 	console.log(application);
   * });
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
   * @name has
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {String} name - application name
   * @fulfil {Boolean} - has application
   * @returns {Promise}
   *
   * @example
   * resin.models.application.has('MyApp').then(function(hasApp) {
   * 	console.log(hasApp);
   * });
   *
   * @example
   * resin.models.application.has('MyApp', function(error, hasApp) {
   * 	if (error) throw error;
   * 	console.log(hasApp);
   * });
   */

  exports.has = function(name, callback) {
    return exports.get(name)["return"](true)["catch"](errors.ResinApplicationNotFound, function() {
      return false;
    }).nodeify(callback);
  };


  /**
   * @summary Check if the user has any applications
   * @name hasAny
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @fulfil {Boolean} - has any applications
   * @returns {Promise}
   *
   * @example
   * resin.models.application.hasAny().then(function(hasAny) {
   * 	console.log('Has any?', hasAny);
   * });
   *
   * @example
   * resin.models.application.hasAny(function(error, hasAny) {
   * 	if (error) throw error;
   * 	console.log('Has any?', hasAny);
   * });
   */

  exports.hasAny = function(callback) {
    return exports.getAll().then(function(applications) {
      return !_.isEmpty(applications);
    }).nodeify(callback);
  };


  /**
   * @summary Get a single application by id
   * @name getById
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {(Number|String)} id - application id
   * @fulfil {Object} - application
   * @returns {Promise}
   *
   * @example
   * resin.models.application.getById(89).then(function(application) {
   * 	console.log(application);
   * });
   *
   * @example
   * resin.models.application.getById(89, function(error, application) {
   * 	if (error) throw error;
   * 	console.log(application);
   * });
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
   * @name create
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {String} name - application name
   * @param {String} deviceType - device type slug
   *
   * @fulfil {Object} - application
   * @returns {Promise}
   *
   * @example
   * resin.models.application.create('My App', 'raspberry-pi').then(function(application) {
   * 	console.log(application);
   * });
   *
   * @example
   * resin.models.application.create('My App', 'raspberry-pi', function(error, application) {
   * 	if (error) throw error;
   * 	console.log(application);
   * });
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
   * @name remove
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {String} name - application name
   * @returns {Promise}
   *
   * @example
   * resin.models.application.remove('MyApp');
   *
   * @example
   * resin.models.application.remove('MyApp', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.remove = function(name, callback) {
    return exports.get(name).then(function() {
      return pine["delete"]({
        resource: 'application',
        options: {
          filter: {
            app_name: name
          }
        }
      });
    }).nodeify(callback);
  };


  /**
   * @summary Restart application
   * @name restart
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {String} name - application name
   * @returns {Promise}
   *
   * @example
   * resin.models.application.restart('MyApp');
   *
   * @example
   * resin.models.application.restart('MyApp', function(error) {
   * 	if (error) throw error;
   * });
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
   * @name getApiKey
   * @public
   * @function
   * @memberof resin.models.application
   *
   * @param {String} name - application name
   * @fulfil {String} - api key
   * @returns {Promise}
   *
   * @example
   * resin.models.application.getApiKey('MyApp').then(function(apiKey) {
   * 	console.log(apiKey);
   * });
   *
   * @example
   * resin.models.application.getApiKey('MyApp', function(error, apiKey) {
   * 	if (error) throw error;
   * 	console.log(apiKey);
   * });
   */

  exports.getApiKey = function(name, callback) {
    return exports.get(name).then(function(application) {
      return request.send({
        method: 'POST',
        url: "/application/" + application.id + "/generate-api-key"
      });
    }).get('body').nodeify(callback);
  };

}).call(this);
