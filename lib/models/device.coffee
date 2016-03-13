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

Promise = require('bluebird')
crypto = require('crypto')
_ = require('lodash')
pine = require('resin-pine')
errors = require('resin-errors')
request = require('resin-request')
registerDevice = require('resin-register-device')
deviceStatus = require('resin-device-status')
settings = require('../settings')
configModel = require('./config')
applicationModel = require('./application')
auth = require('../auth')

###*
# @summary Get all devices
# @name getAll
# @public
# @function
# @memberof resin.models.device
#
# @fulfil {Object[]} - devices
# @returns {Promise}
#
# @example
# resin.models.device.getAll().then(function(devices) {
# 	console.log(devices);
# });
#
# @example
# resin.models.device.getAll(function(error, devices) {
# 	if (error) throw error;
# 	console.log(devices);
# });
###
exports.getAll = (callback) ->
	return pine.get
		apiPrefix: settings.get('pineUrl')
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
# @fulfil {Object[]} - devices
# @returns {Promise}
#
# @example
# resin.models.device.getAllByApplication('MyApp').then(function(devices) {
# 	console.log(devices);
# });
#
# @example
# resin.models.device.getAllByApplication('MyApp', function(error, devices) {
# 	if (error) throw error;
# 	console.log(devices);
# });
###
exports.getAllByApplication = (name, callback) ->
	applicationModel.has(name).then (hasApplication) ->

		if not hasApplication
			throw new errors.ResinApplicationNotFound(name)

		return pine.get
			apiPrefix: settings.get('pineUrl')
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
# @fulfil {Object} - device
# @returns {Promise}
#
# @example
# resin.models.device.get('7cf02a6').then(function(device) {
# 	console.log(device);
# })
#
# @example
# resin.models.device.get('7cf02a6', function(error, device) {
# 	if (error) throw error;
# 	console.log(device);
# });
###
exports.get = (uuid, callback) ->

	# Make sure uuid is a string
	uuid = String(uuid)

	return pine.get
		apiPrefix: settings.get('pineUrl')
		resource: 'device'
		options:
			expand: 'application'
			filter:

				# Handle shorter uuids by asserting
				# that it is a substring of the device
				# uuid starting at index zero.
				$eq: [
					$substring: [
							$: 'uuid'
							0
							uuid.length
					]
					uuid
				]

	.tap (device) ->
		if _.isEmpty(device)
			throw new errors.ResinDeviceNotFound(uuid)

		if device.length > 1
			throw new errors.ResinAmbiguousDevice(uuid)

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
# @fulfil {Object[]} - devices
# @returns {Promise}
#
# @example
# resin.models.device.getByName('MyDevice').then(function(devices) {
# 	console.log(devices);
# });
#
# @example
# resin.models.device.getByName('MyDevice', function(error, devices) {
# 	if (error) throw error;
# 	console.log(devices);
# });
###
exports.getByName = (name, callback) ->
	return pine.get
		apiPrefix: settings.get('pineUrl')
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
# @fulfil {String} - device name
# @returns {Promise}
#
# @example
# resin.models.device.getName('7cf02a6').then(function(deviceName) {
# 	console.log(deviceName);
# });
#
# @example
# resin.models.device.getName('7cf02a6', function(error, deviceName) {
# 	if (error) throw error;
# 	console.log(deviceName);
# });
###
exports.getName = (uuid, callback) ->
	exports.get(uuid).get('name').nodeify(callback)

###*
# @summary Get application name
# @name getApplicationName
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @fulfil {String} - application name
# @returns {Promise}
#
# @example
# resin.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
# 	console.log(applicationName);
# });
#
# @example
# resin.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
# 	if (error) throw error;
# 	console.log(applicationName);
# });
###
exports.getApplicationName = (uuid, callback) ->
	exports.get(uuid).get('application_name').nodeify(callback)

###*
# @summary Check if a device exists
# @name has
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @fulfil {Boolean} - has device
# @returns {Promise}
#
# @example
# resin.models.device.has('7cf02a6').then(function(hasDevice) {
# 	console.log(hasDevice);
# });
#
# @example
# resin.models.device.has('7cf02a6', function(error, hasDevice) {
# 	if (error) throw error;
# 	console.log(hasDevice);
# });
###
exports.has = (uuid, callback) ->
	exports.get(uuid).return(true)
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
# @fulfil {Boolean} - is device online
# @returns {Promise}
#
# @example
# resin.models.device.isOnline('7cf02a6').then(function(isOnline) {
# 	console.log('Is device online?', isOnline);
# });
#
# @example
# resin.models.device.isOnline('7cf02a6', function(error, isOnline) {
# 	if (error) throw error;
# 	console.log('Is device online?', isOnline);
# });
###
exports.isOnline = (uuid, callback) ->
	exports.get(uuid).get('is_online').nodeify(callback)

###*
# @summary Get the local IP addresses of a device
# @name getLocalIPAddresses
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @fulfil {String[]} - local ip addresses
# @reject {Error} Will reject if the device is offline
# @returns {Promise}
#
# @example
# resin.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
# 	localIPAddresses.forEach(function(localIP) {
# 		console.log(localIP);
# 	});
# });
#
# @example
# resin.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
# 	if (error) throw error;
#
# 	localIPAddresses.forEach(function(localIP) {
# 		console.log(localIP);
# 	});
# });
###
exports.getLocalIPAddresses = (uuid, callback) ->
	exports.get(uuid).then (device) ->
		if not device.is_online
			throw new Error("The device is offline: #{uuid}")

		ips = device.ip_address.split(' ')
		return _.without(ips, device.vpn_address)
	.nodeify(callback)

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
# resin.models.device.remove('7cf02a6');
#
# @example
# resin.models.device.remove('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.remove = (uuid, callback) ->
	exports.get(uuid).then ->
		return pine.delete
			apiPrefix: settings.get('pineUrl')
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
# resin.models.device.identify('7cf02a6');
#
# @example
# resin.models.device.identify('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.identify = (uuid, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return request.send
			method: 'POST'
			baseUrl: settings.get('apiUrl')
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
# resin.models.device.rename('7cf02a6', 'NewName');
#
# @example
# resin.models.device.rename('7cf02a6', 'NewName', function(error) {
# 	if (error) throw error;
# });
###
exports.rename = (uuid, newName, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return pine.patch
			apiPrefix: settings.get('pineUrl')
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
# resin.models.device.note('7cf02a6', 'My useful note');
#
# @example
# resin.models.device.note('7cf02a6', 'My useful note', function(error) {
# 	if (error) throw error;
# });
###
exports.note = (uuid, note, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return pine.patch
			apiPrefix: settings.get('pineUrl')
			resource: 'device'
			body:
				note: note
			options:
				filter:
					uuid: uuid

	.nodeify(callback)

###*
# @summary Move a device to another application
# @name move
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @param {String} application - application name
#
# @returns {Promise}
#
# @example
# resin.models.device.move('7cf02a6', 'MyApp');
#
# @example
# resin.models.device.move('7cf02a6', 'MyApp', function(error) {
# 	if (error) throw error;
# });
###
exports.move = (uuid, application, callback) ->
	Promise.props
		device: exports.get(uuid)
		application: applicationModel.get(application)
	.then (results) ->

		if results.device.device_type isnt results.application.device_type
			throw new Error("Incompatible application: #{application}")

		return pine.patch
			apiPrefix: settings.get('pineUrl')
			resource: 'device'
			body:
				application: results.application.id
			options:
				filter:
					uuid: uuid

	.nodeify(callback)

###*
# @summary Restart application on device
# @name restart
# @public
# @function
# @memberof resin.models.device
#
# @description
# This function restarts the Docker container running
# the application on the device, but doesn't reboot
# the device itself.
#
# @param {String} uuid - device uuid
# @returns {Promise}
#
# @example
# resin.models.device.restart('7cf02a6');
#
# @example
# resin.models.device.restart('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.restart = (uuid, callback) ->
	exports.get(uuid).then (device) ->
		return request.send
			method: 'POST'
			baseUrl: settings.get('apiUrl')
			url: "/device/#{device.id}/restart"
	.get('body')
	.nodeify(callback)

###*
# @summary Reboot device
# @name reboot
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise}
#
# @example
# resin.models.device.reboot('7cf02a6');
#
# @example
# resin.models.device.reboot('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.reboot = (uuid, callback) ->
	exports.get(uuid).then (device) ->
		return request.send
			method: 'POST'
			url: '/supervisor/v1/reboot'
			body:
				deviceId: device.id
	.get('body')
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
# @fulfil {String} - device display name
# @returns {Promise}
#
# @example
# resin.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
# 	console.log(deviceTypeName);
# 	// Raspberry Pi
# });
#
# @example
# resin.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
# 	if (error) throw error;
# 	console.log(deviceTypeName);
# 	// Raspberry Pi
# });
###
exports.getDisplayName = (deviceTypeSlug, callback) ->
	exports.getManifestBySlug(deviceTypeSlug)
		.get('name')
		.catch (error) ->
			if error instanceof errors.ResinInvalidDeviceType
				return

			throw error
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
# @fulfil {String} - device slug name
# @returns {Promise}
#
# @example
# resin.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
# 	console.log(deviceTypeSlug);
# 	// raspberry-pi
# });
#
# @example
# resin.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
# 	if (error) throw error;
# 	console.log(deviceTypeSlug);
# 	// raspberry-pi
# });
###
exports.getDeviceSlug = (deviceTypeName, callback) ->
	exports.getManifestBySlug(deviceTypeName)
		.get('slug')
		.catch (error) ->
			if error instanceof errors.ResinInvalidDeviceType
				return

			throw error
	.nodeify(callback)

###*
# @summary Get supported device types
# @name getSupportedDeviceTypes
# @public
# @function
# @memberof resin.models.device
#
# @fulfil {String[]} - supported device types
# @returns {Promise}
#
# @example
# resin.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
# 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
# 		console.log('Resin supports:', supportedDeviceType);
# 	});
# });
#
# @example
# resin.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
# 	if (error) throw error;
#
# 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
# 		console.log('Resin supports:', supportedDeviceType);
# 	});
# });
###
exports.getSupportedDeviceTypes = (callback) ->
	configModel.getDeviceTypes().then (deviceTypes) ->
		return _.map(deviceTypes, 'name')
	.nodeify(callback)

###*
# @summary Get a device manifest by slug
# @name getManifestBySlug
# @public
# @function
# @memberof resin.models.device
#
# @param {String} slug - device slug
# @fulfil {Object} - device manifest
# @returns {Promise}
#
# @example
# resin.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
# 	console.log(manifest);
# });
#
# @example
# resin.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
# 	if (error) throw error;
# 	console.log(manifest);
# });
###
exports.getManifestBySlug = (slug, callback) ->
	return configModel.getDeviceTypes().then (deviceTypes) ->
		return _.find deviceTypes, (deviceType) ->
			return _.some [
				deviceType.name is slug
				deviceType.slug is slug
				_.includes(deviceType.aliases, slug)
			]
	.then (deviceManifest) ->
		if not deviceManifest?
			throw new errors.ResinInvalidDeviceType(slug)

		return deviceManifest
	.nodeify(callback)

###*
# @summary Get a device manifest by application name
# @name getManifestByApplication
# @public
# @function
# @memberof resin.models.device
#
# @param {String} applicationName - application name
# @fulfil {Object} - device manifest
# @returns {Promise}
#
# @example
# resin.models.device.getManifestByApplication('MyApp').then(function(manifest) {
# 	console.log(manifest);
# });
#
# @example
# resin.models.device.getManifestByApplication('MyApp', function(error, manifest) {
# 	if (error) throw error;
# 	console.log(manifest);
# });
###
exports.getManifestByApplication = (applicationName, callback) ->
	applicationModel.get(applicationName).get('device_type').then (deviceType) ->
		return exports.getManifestBySlug(deviceType)
	.nodeify(callback)

###*
# @summary Generate a random device UUID
# @name generateUUID
# @function
# @public
# @memberof resin.models.device
#
# @fulfil {String} - a generated UUID
# @returns {Promise}
#
# @example
# resin.models.device.generateUUID().then(function(uuid) {
# 	console.log(uuid);
# });
#
# @example
# resin.models.device.generateUUID(function(error, uuid) {
# 	if (error) throw error;
# 	console.log(uuid);
# });
###
exports.generateUUID = registerDevice.generateUUID

###*
# @summary Register a new device with a Resin.io application
# @name register
# @public
# @function
# @memberof resin.models.device
#
# @param {String} applicationName - application name
# @param {String} uuid - device uuid
#
# @fulfil {Object} - device
# @returns {Promise}
#
# @example
# resin.models.device.generateUUID().then(function(uuid) {
# 	resin.models.device.register('MyApp', uuid).then(function(device) {
# 		console.log(device);
# 	});
# });
#
# @example
# resin.models.device.generateUUID(function(error, uuid) {
# 	if (error) throw error;
#
# 	resin.models.device.register('MyApp', uuid, function(error, device) {
# 		if (error) throw error;
#
# 		console.log(device);
# 	});
# });
###
exports.register = (applicationName, uuid, callback) ->
	Promise.props
		userId: auth.getUserId()
		apiKey: applicationModel.getApiKey(applicationName)
		application: applicationModel.get(applicationName)
	.then (results) ->

		return registerDevice.register pine,
			apiPrefix: settings.get('pineUrl')
			userId: results.userId
			applicationId: results.application.id
			deviceType: results.application.device_type
			uuid: uuid
			apiKey: results.apiKey

	.nodeify(callback)

###*
# @summary Check if a device is web accessible with device utls
# @name hasDeviceUrl
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @fulfil {Boolean} - has device url
# @returns {Promise}
#
# @example
# resin.models.device.hasDeviceUrl('7cf02a6');
#
# @example
# resin.models.device.hasDeviceUrl('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.hasDeviceUrl = (uuid, callback) ->
	exports.get(uuid).get('is_web_accessible').nodeify(callback)

###*
# @summary Get a device url
# @name getDeviceUrl
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @fulfil {String} - device url
# @returns {Promise}
#
# @example
# resin.models.device.getDeviceUrl('7cf02a6').then(function(url) {
# 	console.log(url);
# });
#
# @example
# resin.models.device.getDeviceUrl('7cf02a6', function(error, url) {
# 	if (error) throw error;
# 	console.log(url);
# });
###
exports.getDeviceUrl = (uuid, callback) ->
	exports.hasDeviceUrl(uuid).then (hasDeviceUrl) ->
		if not hasDeviceUrl
			throw new Error("Device is not web accessible: #{uuid}")

		return configModel.getAll().get('deviceUrlsBase')
	.then (deviceUrlsBase) ->
		return "https://#{uuid}.#{deviceUrlsBase}"
	.nodeify(callback)

###*
# @summary Enable device url for a device
# @name enableDeviceUrl
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise}
#
# @example
# resin.models.device.enableDeviceUrl('7cf02a6');
#
# @example
# resin.models.device.enableDeviceUrl('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.enableDeviceUrl = (uuid, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return pine.patch
			apiPrefix: settings.get('pineUrl')
			resource: 'device'
			body:
				is_web_accessible: true
			options:
				filter:
					uuid: uuid
	.nodeify(callback)

###*
# @summary Disable device url for a device
# @name disableDeviceUrl
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @returns {Promise}
#
# @example
# resin.models.device.disableDeviceUrl('7cf02a6');
#
# @example
# resin.models.device.disableDeviceUrl('7cf02a6', function(error) {
# 	if (error) throw error;
# });
###
exports.disableDeviceUrl = (uuid, callback) ->
	exports.has(uuid).then (hasDevice) ->

		if not hasDevice
			throw new errors.ResinDeviceNotFound(uuid)

		return pine.patch
			apiPrefix: settings.get('pineUrl')
			resource: 'device'
			body:
				is_web_accessible: false
			options:
				filter:
					uuid: uuid
	.nodeify(callback)

###*
# @summary Get the status of a device
# @name getStatus
# @public
# @function
# @memberof resin.models.device
#
# @param {String} uuid - device uuid
# @fulfil {String} - device statud
# @returns {Promise}
#
# @example
# resin.models.device.getStatus('7cf02a6').then(function(status) {
# 	console.log(status);
# });
#
# @example
# resin.models.device.getStatus('7cf02a6', function(error, status) {
# 	if (error) throw error;
# 	console.log(status);
# });
###
exports.getStatus = (uuid, callback) ->
	Promise.try ->
		return deviceStatus.getStatus(uuid).key
	.nodeify(callback)
