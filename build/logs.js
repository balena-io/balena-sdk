
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
  var Promise, configModel, deviceModel, errors, logs;

  Promise = require('bluebird');

  logs = require('resin-device-logs');

  errors = require('resin-errors');

  configModel = require('./models/config');

  deviceModel = require('./models/device');


  /**
   * @summary Subscribe to device logs
   * @name subscribe
   * @function
   * @public
   * @memberof resin.logs
   *
   * @description
   * The `logs` object yielded by this function emits the following events:
   *
   * - `line`: when a log line is received.
   * - `error`: when an error happens.
   *
   * @param {String} uuid - device uuid
   * @returns {Promise<EventEmitter>} logs
   *
   * @todo
   * We should consider making this a readable stream.
   *
   * @example
   * resin.logs.subscribe('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (logs) ->
   * 	logs.on 'line', (line) ->
   * 		console.log(line)
   *
   * @example
   * resin.logs.subscribe '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, logs) ->
   * 	throw error if error?
   * 	logs.on 'line', (line) ->
   * 		console.log(line)
   */

  exports.subscribe = function(uuid, callback) {
    return deviceModel.has(uuid).then(function(hasDevice) {
      if (!hasDevice) {
        throw new errors.ResinDeviceNotFound(uuid);
      }
    }).then(configModel.getPubNubKeys).then(function(pubNubKeys) {
      return logs.subscribe(pubNubKeys, uuid);
    }).nodeify(callback);
  };


  /**
   * @summary Get device logs history
   * @name history
   * @function
   * @public
   * @memberof resin.logs
   *
   * @param {String} uuid - device uuid
   * @returns {Promise<String[]>} history lines
   *
   * @example
   * resin.logs.history('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (lines) ->
   * 	for line in lines
   * 		console.log(line)
   *
   * @example
   * resin.logs.history '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, lines) ->
   * 	throw error if error?
   * 	for line in lines
   * 		console.log(line)
   */

  exports.history = function(uuid, callback) {
    return deviceModel.has(uuid).then(function(hasDevice) {
      if (!hasDevice) {
        throw new errors.ResinDeviceNotFound(uuid);
      }
    }).then(configModel.getPubNubKeys).then(function(pubNubKeys) {
      return logs.history(pubNubKeys, uuid);
    }).nodeify(callback);
  };

}).call(this);
