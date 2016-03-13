###
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
###

_ = require('lodash')
request = require('resin-request')
settings = require('../settings')
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
# resin.models.config.getAll().then(function(config) {
# 	console.log(config);
# });
#
# @example
# resin.models.config.getAll(function(error, config) {
# 	if (error) throw error;
# 	console.log(config);
# });
###
exports.getAll = (callback) ->
	request.send
		method: 'GET'
		baseUrl: settings.get('apiUrl')
		url: '/config'
	.get('body')
	.then (body) ->

		# Patch device types to be marked as ALPHA and BETA instead
		# of PREVIEW and EXPERIMENTAL, respectively.
		# This logic is literally copy and pasted from Resin UI, but
		# there are plans to move this to `resin-device-types` so it
		# should be a matter of time for this to be removed.
		body.deviceTypes = _.map body.deviceTypes, (deviceType) ->
			if deviceType.state is 'PREVIEW'
				deviceType.state = 'ALPHA'
				deviceType.name = deviceType.name.replace('(PREVIEW)', '(ALPHA)')
			if deviceType.state is 'EXPERIMENTAL'
				deviceType.state = 'BETA'
				deviceType.name = deviceType.name.replace('(EXPERIMENTAL)', '(BETA)')
			return deviceType

		return body
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
# resin.models.config.getPubNubKeys().then(function(pubnubKeys) {
# 	console.log(pubnubKeys.subscribe_key);
# 	console.log(pubnubKeys.publish_key);
# });
#
# @example
# resin.models.config.getPubNubKeys(function(error, pubnubKeys) {
# 	if (error) throw error;
# 	console.log(pubnubKeys.subscribe_key);
# 	console.log(pubnubKeys.publish_key);
# });
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
# resin.models.config.getMixpanelToken().then(function(mixpanelToken) {
# 	console.log(mixpanelToken);
# });
#
# @example
# resin.models.config.getMixpanelToken(function(error, mixpanelToken) {
# 	if (error) throw error;
# 	console.log(mixpanelToken);
# });
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
# resin.models.config.getDeviceTypes().then(function(deviceTypes) {
# 	console.log(deviceTypes);
# });
#
# @example
# resin.models.config.getDeviceTypes(function(error, deviceTypes) {
# 	if (error) throw error;
# 	console.log(deviceTypes);
# })
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
# resin.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
# 	console.log(options);
# });
#
# @example
# resin.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
# 	if (error) throw error;
# 	console.log(options);
# });
###
exports.getDeviceOptions = (deviceType, callback) ->
	deviceModel.getManifestBySlug(deviceType).then (manifest) ->
		manifest.initialization ?= {}
		return _.union(manifest.options, manifest.initialization.options)
	.nodeify(callback)
