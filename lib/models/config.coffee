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

_ = require('lodash')
request = require('resin-request')
deviceModel = require('./device')

###*
# @summary Get all configuration
# @name getAll
# @public
# @function
# @memberof resin.models.config
#
# @fulfil {Object} - configuration
# @returns {Promise}
#
# @example
# resin.models.config.getAll().then (config) ->
# 	console.log(config)
#
# @example
# resin.models.config.getAll (error, config) ->
# 	throw error if error?
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
# @name getPubNubKeys
# @private
# @function
# @memberof resin.models.config
#
# @fulfil {Object} - pubnub keys
# @returns {Promise}
#
# @example
# resin.models.config.getPubNubKeys().then (pubnubKeys) ->
# 	console.log(pubnubKeys.subscribe_key)
# 	console.log(pubnubKeys.publish_key)
#
# @example
# resin.models.config.getPubNubKeys (error, pubnubKeys) ->
# 	throw error if error?
# 	console.log(pubnubKeys.subscribe_key)
# 	console.log(pubnubKeys.publish_key)
###
exports.getPubNubKeys = (callback) ->
	exports.getAll().get('pubnub').tap (keys) ->
		if not keys?
			throw new Error('No pubnub keys')
	.nodeify(callback)

###*
# @summary Get Mixpanel token
# @name getMixpanelToken
# @private
# @function
# @memberof resin.models.config
#
# @fulfil {String} - Mixpanel token
# @returns {Promise}
#
# @example
# resin.models.config.getMixpanelToken().then (mixpanelToken) ->
# 	console.log(mixpanelToken)
#
# @example
# resin.models.config.getMixpanelToken (error, mixpanelToken) ->
# 	throw error if error?
# 	console.log(mixpanelToken)
###
exports.getMixpanelToken = (callback) ->
	exports.getAll().get('mixpanelToken').tap (mixpanelToken) ->
		if not mixpanelToken?
			throw new Error('No mixpanel token')
	.nodeify(callback)

###*
# @summary Get device types
# @name getDeviceTypes
# @public
# @function
# @memberof resin.models.config
#
# @fulfil {Object[]} - device types
# @returns {Promise}
#
# @example
# resin.models.config.getDeviceTypes().then (deviceTypes) ->
# 	console.log(deviceTypes)
#
# @example
# resin.models.config.getDeviceTypes (error, deviceTypes) ->
# 	throw error if error?
# 	console.log(deviceTypes)
###
exports.getDeviceTypes = (callback) ->
	exports.getAll().get('deviceTypes').tap (deviceTypes) ->
		if not deviceTypes?
			throw new Error('No device types')
	.nodeify(callback)

###*
# @summary Get configuration/initialization options for a device type
# @name getDeviceOptions
# @public
# @function
# @memberof resin.models.config
#
# @param {String} deviceType - device type slug
# @fulfil {Object[]} - configuration options
# @returns {Promise}
#
# @example
# resin.models.config.getDeviceOptions('raspberry-pi').then (options) ->
# 	console.log(options)
#
# @example
# resin.models.config.getDeviceOptions 'raspberry-pi', (error, options) ->
# 	throw error if error?
# 	console.log(options)
###
exports.getDeviceOptions = (deviceType, callback) ->
	deviceModel.getManifestBySlug(deviceType).then (manifest) ->
		manifest.initialization ?= {}
		return _.union(manifest.options, manifest.initialization.options)
	.nodeify(callback)
