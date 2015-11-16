
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
