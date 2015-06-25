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
settings = require('resin-settings-client')

###*
# @summary Get a single setting
# @function
# @public
#
# @param {String} [key] - setting key
# @returns {Promise<*>} setting value
#
# @example
# resin.settings.get('remoteUrl').then (remoteUrl) ->
# 	console.log(remoteUrl)
###
exports.get = (key, callback) ->
	Promise.try ->
		return settings.get(key)
	.nodeify(callback)

###*
# @summary Get all settings
# @function
# @public
#
# @returns {Promise<Object>} settings
#
# @example
# resin.settings.getAll().then (settings) ->
# 	console.log(settings)
###
exports.getAll = (callback) ->
	return exports.get(null).nodeify(callback)
