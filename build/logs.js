
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
 * @module resin.logs
 */

(function() {
  var Promise, configModel, deviceModel, logs;

  Promise = require('bluebird');

  logs = require('resin-device-logs');

  configModel = require('./models/config');

  deviceModel = require('./models/device');


  /**
   * @summary Subscribe to device logs
   * @function
   * @public
   *
   * @description
   * The `logs` object yielded by this function emits the following events:
   *
   * - `line`: when a log line is received.
   * - `error`: when an error happens.
   *
   * @param {String} deviceName - device name
   * @returns {Promise<EventEmitter>} logs
   *
   * @todo
   * We should consider making this a readable stream.
   *
   * @example
   * resin.logs.subscribe('MyDevice').then (logs) ->
   * 	logs.on 'line', (line) ->
   * 		console.log(line)
   */

  exports.subscribe = function(deviceName, callback) {
    return Promise.props({
      uuid: deviceModel.get(deviceName).get('uuid'),
      pubNubKeys: configModel.getPubNubKeys()
    }).then(function(results) {
      return logs.subscribe(results.pubNubKeys, results.uuid);
    }).nodeify(callback);
  };


  /**
   * @summary Get device logs history
   * @function
   * @public
   *
   * @param {String} deviceName - device name
   * @returns {Promise<String[]>} history lines
   *
   * @example
   * resin.logs.history('MyDevice').then (lines) ->
   * 	for line in lines
   * 		console.log(line)
   */

  exports.history = function(deviceName, callback) {
    return Promise.props({
      uuid: deviceModel.get(deviceName).get('uuid'),
      pubNubKeys: configModel.getPubNubKeys()
    }).then(function(results) {
      return logs.history(results.pubNubKeys, results.uuid);
    }).nodeify(callback);
  };

}).call(this);
