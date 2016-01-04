
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
  var Promise, settings;

  Promise = require('bluebird');

  settings = require('resin-settings-client');


  /**
   * @summary Get a single setting
   * @name get
   * @function
   * @public
   * @memberof resin.settings
   *
   * @param {String} [key] - setting key
   * @fulfil {*} - setting value
   * @returns {Promise}
   *
   * @example
   * resin.settings.get('apiUrl').then(function(apiUrl) {
   * 	console.log(apiUrl);
   * });
   *
   * @example
   * resin.settings.get('apiUrl', function(error, apiUrl) {
   * 	if (error) throw error;
   * 	console.log(apiUrl);
   * });
   */

  exports.get = function(key, callback) {
    return Promise["try"](function() {
      return settings.get(key);
    }).nodeify(callback);
  };


  /**
   * @summary Get all settings
   * @name getAll
   * @function
   * @public
   * @memberof resin.settings
   *
   * @fulfil {Object} - settings
   * @returns {Promise}
   *
   * @example
   * resin.settings.getAll().then(function(settings) {
   * 	console.log(settings);
   * });
   *
   * @example
   * resin.settings.getAll(function(error, settings) {
   * 	if (error) throw error;
   * 	console.log(settings);
   * });
   */

  exports.getAll = function(callback) {
    return Promise["try"](function() {
      return settings.getAll();
    }).nodeify(callback);
  };

}).call(this);
