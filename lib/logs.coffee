###
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
###

Promise = require('bluebird')
logs = require('resin-device-logs')
errors = require('resin-errors')
configModel = require('./models/config')
deviceModel = require('./models/device')

###*
# @summary Subscribe to device logs
# @name subscribe
# @function
# @public
# @memberof resin.logs
#
# @description
# The `logs` object yielded by this function emits the following events:
#
# - `line`: when a log line is received.
# - `error`: when an error happens.
#
# @param {String} uuid - device uuid
# @fulfil {EventEmitter} - logs
# @returns {Promise}
#
# @todo
# We should consider making this a readable stream.
#
# @example
# resin.logs.subscribe('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then(function(logs) {
# 	logs.on('line', function(line) {
# 		console.log(line);
# 	});
# });
#
# @example
# resin.logs.subscribe('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', function(error, logs) {
# 	if (error) throw error;
#
# 	logs.on('line', function(line) {
# 		console.log(line);
# 	});
# });
###
exports.subscribe = (uuid, callback) ->
	Promise.props
		device: deviceModel.get(uuid)
		pubNubKeys: configModel.getPubNubKeys()
	.then (results) ->
		return logs.subscribe(results.pubNubKeys, results.device)
	.nodeify(callback)

###*
# @summary Get device logs history
# @name history
# @function
# @public
# @memberof resin.logs
#
# @param {String} uuid - device uuid
# @fulfil {String[]} - history lines
# @returns {Promise}
#
# @example
# resin.logs.history('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then(function(lines) {
# 	lines.forEach(function(line) {
# 		console.log(line);
# 	});
# });
#
# @example
# resin.logs.history('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', function(error, lines) {
# 	if (error) throw error;
#
# 	lines.forEach(function(line) {
# 		console.log(line);
# 	});
# });
###
exports.history = (uuid, callback) ->
	Promise.props
		device: deviceModel.get(uuid)
		pubNubKeys: configModel.getPubNubKeys()
	.then (results) ->
		return logs.history(results.pubNubKeys, results.device)
	.nodeify(callback)
