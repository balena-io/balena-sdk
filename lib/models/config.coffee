###
Copyright 2016 Balena

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

once = require('lodash/once')
union = require('lodash/union')
map = require('lodash/map')

getConfigModel = (deps, opts) ->
	{ request } = deps
	{ apiUrl } = opts

	deviceModel = once -> require('./device').default(deps, opts)

	exports = {}

	normalizeDeviceTypes = (deviceTypes) ->
		# Patch device types to be marked as ALPHA and BETA instead
		# of PREVIEW and EXPERIMENTAL, respectively.
		# This logic is literally copy and pasted from balena UI, but
		# there are plans to move this to `resin-device-types` so it
		# should be a matter of time for this to be removed.
		return map deviceTypes, (deviceType) ->
			if deviceType.state is 'DISCONTINUED'
				deviceType.name = deviceType.name.replace(/(\(PREVIEW|EXPERIMENTAL\))/, '(DISCONTINUED)')
			if deviceType.state is 'PREVIEW'
				deviceType.state = 'ALPHA'
				deviceType.name = deviceType.name.replace('(PREVIEW)', '(ALPHA)')
			if deviceType.state is 'EXPERIMENTAL'
				# Keep 'BETA' as the state until the next major, just in case someone is using this
				# TODO: In the next major change it to 'NEW'
				deviceType.state = 'BETA'
				deviceType.name = deviceType.name.replace('(EXPERIMENTAL)', '(NEW)')
			return deviceType

	###*
	# @summary Get all configuration
	# @name getAll
	# @public
	# @function
	# @memberof balena.models.config
	#
	# @fulfil {Object} - configuration
	# @returns {Promise}
	#
	# @example
	# balena.models.config.getAll().then(function(config) {
	# 	console.log(config);
	# });
	#
	# @example
	# balena.models.config.getAll(function(error, config) {
	# 	if (error) throw error;
	# 	console.log(config);
	# });
	###
	exports.getAll = (callback) ->
		request.send
			method: 'GET'
			url: '/config'
			baseUrl: apiUrl
			sendToken: false
		.get('body')
		.then (body) ->
			body.deviceTypes = normalizeDeviceTypes(body.deviceTypes)
			return body
		.asCallback(callback)

	###*
	# @summary Get device types
	# @name getDeviceTypes
	# @public
	# @function
	# @memberof balena.models.config
	#
	# @fulfil {Object[]} - device types
	# @returns {Promise}
	#
	# @example
	# balena.models.config.getDeviceTypes().then(function(deviceTypes) {
	# 	console.log(deviceTypes);
	# });
	#
	# @example
	# balena.models.config.getDeviceTypes(function(error, deviceTypes) {
	# 	if (error) throw error;
	# 	console.log(deviceTypes);
	# })
	###
	exports.getDeviceTypes = (callback) ->
		request.send
			method: 'GET'
			url: '/device-types/v1'
			baseUrl: apiUrl
			# optionaly authenticated, so we send the token in all cases
		.get('body')
		.tap (deviceTypes) ->
			if not deviceTypes?
				throw new Error('No device types')
		.then normalizeDeviceTypes
		.asCallback(callback)

	###*
	# @summary Get configuration/initialization options for a device type
	# @name getDeviceOptions
	# @public
	# @function
	# @memberof balena.models.config
	#
	# @param {String} deviceType - device type slug
	# @fulfil {Object[]} - configuration options
	# @returns {Promise}
	#
	# @example
	# balena.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
	# 	console.log(options);
	# });
	#
	# @example
	# balena.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
	# 	if (error) throw error;
	# 	console.log(options);
	# });
	###
	exports.getDeviceOptions = (deviceType, callback) ->
		deviceModel().getManifestBySlug(deviceType).then (manifest) ->
			manifest.initialization ?= {}
			return union(manifest.options, manifest.initialization.options)
		.asCallback(callback)

	return exports

module.exports =
	default: getConfigModel
