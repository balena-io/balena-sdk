
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
  var _, cachedSettings, evaluateSettings, settings;

  _ = require('lodash');


  /**
   * @summary Default settings
   * @namespace settings
   * @private
   */

  settings = {

    /**
    	 * @property {Number} tokenRefreshInterval - token refresh interval
    	 * @memberof settings
     */
    tokenRefreshInterval: 1 * 1000 * 60 * 60,

    /**
    	 * @property {String} resinUrl - Resin.io url
    	 * @memberof settings
     */
    resinUrl: 'resin.io',

    /**
    	 * @property {Function} apiUrl - Resin.io API url
    	 * @memberof settings
     */
    apiUrl: function() {
      return "https://api." + this.resinUrl;
    },

    /**
    	 * @property {Function} vpnUrl - Resin.io VPN url
    	 * @memberof settings
     */
    vpnUrl: function() {
      return "vpn." + this.resinUrl;
    },

    /**
    	 * @property {Function} registryUrl - Resin.io Registry url
    	 * @memberof settings
     */
    registryUrl: function() {
      return "registry." + this.resinUrl;
    },

    /**
    	 * @property {Function} imageMakerUrl - Resin.io Image Maker url
    	 * @memberof settings
     */
    imageMakerUrl: function() {
      return "https://img." + this.resinUrl;
    },

    /**
    	 * @property {Function} deltaUrl - Resin.io Delta url
    	 * @memberof settings
     */
    deltaUrl: function() {
      return "https://delta." + this.resinUrl;
    },

    /**
    	 * @property {Function} dashboardUrl - Resin.io dashboard url
    	 * @memberof settings
     */
    dashboardUrl: function() {
      return "https://dashboard." + this.resinUrl;
    }
  };

  evaluateSettings = function() {
    return _.chain(settings).mapValues(function(value, key) {
      value = _.get(settings, key);
      if (_.isFunction(value)) {
        value = value.call(settings);
      }
      return value;
    }).omit(function(value) {
      return _.isUndefined(value) || _.isNull(value);
    }).value();
  };

  cachedSettings = evaluateSettings();


  /**
   * @summary Set settings
   * @name set
   * @function
   * @public
   * @memberof resin.settings
   *
   * @param {(String|Object)} [key] - setting key
   * @param {*} [value] - setting value
   *
   * @example
   * resin.settings.set('resinUrl', 'resin.io');
   *
   * @example
   * resin.settings.set({
   *   resinUrl: 'resin.io',
   *   apiUrl: 'https://api.resin.io'
   * });
   */

  exports.set = function(key, value) {
    if (_.isPlainObject(key) && (value == null)) {
      _.assign(settings, key);
    } else {
      _.set(settings, key, value);
    }
    return cachedSettings = evaluateSettings();
  };


  /**
   * @summary Get a single setting
   * @name get
   * @function
   * @public
   * @memberof resin.settings
   *
   * @param {String} [key] - setting key
   * @returns {*} - setting value
   *
   * @example
   * var apiUrl = resin.settings.get('apiUrl');
   */

  exports.get = function(key) {
    return _.get(cachedSettings, key);
  };


  /**
   * @summary Get all settings
   * @name getAll
   * @function
   * @public
   * @memberof resin.settings
   *
   * @returns {Object} - settings
   *
   * @example
   * var settings = resin.settings.getAll();
   */

  exports.getAll = function() {
    return _.clone(cachedSettings);
  };

}).call(this);
