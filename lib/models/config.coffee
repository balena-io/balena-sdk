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

###*
# @module resin.models.config
###

request = require('resin-request')

###*
# @summary Get all configuration
# @public
# @function
#
# @returns {Promise<Object>} configuration
#
# @example
# resin.models.config.getAll().then (config) ->
# 	console.log(config)
###
exports.getAll = (callback) ->
	request.send
		method: 'GET'
		url: '/config'
	.get('body')
	.nodeify(callback)

###*
# @summary Get PubNub keys
# @public
# @function
#
# @returns {Promise<Object>} pubnub keys
#
# @example
# resin.models.config.getPubNubKeys().then (pubnubKeys) ->
# 	console.log(pubnubKeys.subscribe_key)
# 	console.log(pubnubKeys.publish_key)
###
exports.getPubNubKeys = (callback) ->
	exports.getAll().get('pubnub').tap (keys) ->
		if not keys?
			throw new Error('No pubnub keys')
	.nodeify(callback)

###*
# @summary Get device types
# @public
# @function
#
# @returns {Promise<Object[]>} device types
#
# @example
# resin.models.config.getDeviceTypes().then (deviceTypes) ->
# 	console.log(deviceTypes)
###
exports.getDeviceTypes = (callback) ->
	exports.getAll().get('deviceTypes').tap (deviceTypes) ->
		if not deviceTypes?
			throw new Error('No device types')
	.nodeify(callback)
