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

crypto = require('crypto')
_ = require('lodash')
pine = require('resin-pine')
errors = require('resin-errors')
request = require('resin-request')
token = require('resin-token')
configModel = require('./config')
applicationModel = require('./application')

###*
# @summary Get all devices
# @name getAll
# @public
# @function
# @memberof resin.models.device
#
# @returns {Promise<Object[]>} devices
#
# @example
# resin.models.devices.getAll().then (devices) ->
# 	console.log(devices)
###
exports.getAll = (callback) ->
	return pine.get
		resource: 'device'
		options:
			expand: 'application'
			orderby: 'name asc'

	.map (device) ->
		device.application_name = device.application[0].app_name
		return device
	.nodeify(callback)

###*
# @summary Get all devices by application
# @name getAllByApplication
# @public
# @function
# @memberof resin.models.device
#
# @param {String} name - application name
# @returns {Promise<Object[]>} devices
#
# @example
# resin.models.devices.getAllByApplication('MyApp').then (devices) ->
# 	console.log(devices)
###
exports.getAllByApplication = (name, callback) ->
	return pine.get
		resource: 'device'
		options:
			filter:
				application:
					app_name: name
			expand: 'application'
			orderby: 'name asc'

	# TODO: Move to server
	.map (device) ->
		device.application_name = device.application[0].app_name
		return device
	.nodeify(callback)

###*
# @summary Get a single device
# @name get
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise<Object>} device
#
# @example
# resin.models.device.get('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (device) ->
# 	console.log(device)
###
exports.get = (uuid, callback) ->
	return pine.get
		resource: 'device'
		options:
			expand: 'application'
			filter:
				uuid: uuid

	.tap (device) ->
		if _.isEmpty(device)
			throw new errors.ResinDeviceNotFound(uuid)
	.get(0)
	.tap (device) ->
		device.application_name = device.application[0].app_name
	.nodeify(callback)

###*
# @summary Get devices by name
# @name getByName
# @public
# @function
# @memberof resin.models.device
#
# @param {String} name - device name
# @returns {Promise<Object[]>} devices
#
# @example
# resin.models.device.getByName('MyDevice').then (devices) ->
# 	console.log(devices)
###
exports.getByName = (name, callback) ->
	return pine.get
		resource: 'device'
		options:
			expand: 'application'
			filter:
				name: name

	.tap (devices) ->
		if _.isEmpty(devices)
			throw new errors.ResinDeviceNotFound(name)
	.map (device) ->
		device.application_name = device.application[0].app_name
		return device
	.nodeify(callback)

###*
# @summary Get the name of a device
# @name getName
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise<String>} device name
#
# @example
# resin.models.device.getName('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (deviceName) ->
# 	console.log(deviceName)
###
exports.getName = (uuid, callback) ->
	exports.get(uuid).get('name').nodeify(callback)

###*
# @summary Check if a device exists
# @name has
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise<Boolean>} has device
#
# @example
# resin.models.device.has('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (hasDevice) ->
# 	console.log(hasDevice)
###
exports.has = (uuid, callback) ->
	exports.get(uuid).then ->
		return true
	.catch errors.ResinDeviceNotFound, ->
		return false
	.nodeify(callback)

###*
# @summary Check if a device is online
# @name isOnline
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise<Boolean>} is device online
#
# @example
# resin.models.device.isOnline('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (isOnline) ->
# 	console.log("Is device online? #{isOnline}")
###
exports.isOnline = (uuid, callback) ->
	exports.get(uuid).get('is_online').nodeify(callback)

###*
# @summary Remove device
# @name remove
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise}
#
# @example
# resin.models.device.remove('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
###
exports.remove = (uuid, callback) ->
	return pine.delete
		resource: 'device'
		options:
			filter:
				uuid: uuid
	.nodeify(callback)

###*
# @summary Identify device
# @name identify
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise}
#
# @example
# resin.models.device.identify('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
###
exports.identify = (uuid, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return request.send
			method: 'POST'
			url: '/blink'
			body:
				uuid: uuid
	.return(undefined)
	.nodeify(callback)

###*
# @summary Rename device
# @name rename
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @param {String} newName - the device new name
#
# @returns {Promise}
#
# @example
# resin.models.device.rename('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'NewName')
###
exports.rename = (uuid, newName, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return pine.patch
			resource: 'device'
			body:
				name: newName
			options:
				filter:
					uuid: uuid
	.nodeify(callback)

###*
# @summary Note a device
# @name note
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @param {String} note - the note
#
# @returns {Promise}
#
# @example
# resin.models.device.note('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'My useful note')
###
exports.note = (uuid, note, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return pine.patch
			resource: 'device'
			body:
				note: note
			options:
				filter:
					uuid: uuid

	.nodeify(callback)

###*
# @summary Register a device with Resin.io
# @name register
# @function
# @public
# @memberof resin.models.device
#
# @param {String} applicationName - application name
# @param {Object} [options={}] - options
# @param {String} [options.wifiSsid] - wifi ssid
# @param {String} [options.wifiKey] - wifi key
#
# @returns {Promise<Object>} device
#
# @example
# resin.models.device.register 'MyApp',
# 	wifiSsid: 'foobar'
# 	wifiKey: 'hello'
# .then (device) ->
# 	console.log(device)
###
exports.register = (applicationName, options = {}, callback) ->
	return applicationModel.getConfiguration(applicationName, options).then (config) ->
		return pine.post
			resource: 'device'
			body:
				user: config.userId
				application: config.applicationId
				uuid: exports.generateUUID()
				device_type: config.deviceType
			customOptions:
				apikey: config.apiKey

	# Allow promise based and callback based styles
	.nodeify(callback)

###*
# @summary Get display name for a device
# @name getDisplayName
# @public
# @function
# @memberof resin.models.device
#
# @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
#
# @param {String} deviceTypeSlug - device type slug
# @returns {Promise<String>} device display name
#
# @example
# resin.models.device.getDisplayName('raspberry-pi').then (deviceTypeName) ->
# 	console.log(deviceTypeName)
# 	# Raspberry Pi
###
exports.getDisplayName = (deviceTypeSlug, callback) ->
	configModel.getDeviceTypes().then (deviceTypes) ->
		deviceTypeFound = _.findWhere(deviceTypes, slug: deviceTypeSlug)
		return deviceTypeFound?.name
	.nodeify(callback)

###*
# @summary Get device slug
# @name getDeviceSlug
# @public
# @function
# @memberof resin.models.device
#
# @see {@link module:resin.models.device.getSupportedDeviceTypes} for a list of supported devices
#
# @param {String} deviceTypeName - device type name
# @returns {Promise<String>} device slug name
#
# @example
# resin.models.device.getDeviceSlug('Raspberry Pi').then (deviceTypeSlug) ->
# 	console.log(deviceTypeSlug)
# 	# raspberry-pi
###
exports.getDeviceSlug = (deviceTypeName, callback) ->
	configModel.getDeviceTypes().then (deviceTypes) ->
		deviceTypeFound = _.findWhere(deviceTypes, name: deviceTypeName)
		return deviceTypeFound?.slug
	.nodeify(callback)

###*
# @summary Get supported device types
# @name getSupportedDeviceTypes
# @public
# @function
# @memberof resin.models.device
#
# @returns {Promise<String[]>} supported device types
#
# @example
# resin.models.device.getSupportedDeviceTypes().then (supportedDeviceTypes) ->
# 	for supportedDeviceType in supportedDeviceTypes
# 		console.log("Resin supports: #{supportedDeviceType}")
###
exports.getSupportedDeviceTypes = (callback) ->
	configModel.getDeviceTypes().then (deviceTypes) ->
		return _.pluck(deviceTypes, 'name')
	.nodeify(callback)

###*
# @summary Get a device manifest by slug
# @name getManifestBySlug
# @public
# @function
# @memberof resin.models.device
#
# @param {String} slug - device slug
# @returns {Promise<Object>} device manifest
#
# @example
# resin.models.device.getManifestBySlug('raspberry-pi').then (manifest) ->
# 	console.log(manifest)
###
exports.getManifestBySlug = (slug, callback) ->
	configModel.getDeviceTypes().then (deviceTypes) ->
		deviceManifest = _.find(deviceTypes, { slug })

		if not deviceManifest?
			throw new Error("Unsupported device: #{slug}")

		return deviceManifest
	.nodeify(callback)

###*
# @summary Generate a random device UUID
# @name generateUUID
# @function
# @public
# @memberof resin.models.device
#
# @returns {String} A generated UUID
#
# @example
# uuid = resin.models.device.generateUUID()
###
exports.generateUUID = ->

	# I'd be nice if the UUID matched the output of a SHA-256 function,
	# but although the length limit of the CN attribute in a X.509
	# certificate is 64 chars, a 32 byte UUID (64 chars in hex) doesn't
	# pass the certificate validation in OpenVPN This either means that
	# the RFC counts a final NULL byte as part of the CN or that the
	# OpenVPN/OpenSSL implementation has a bug.
	return crypto.pseudoRandomBytes(31).toString('hex')
