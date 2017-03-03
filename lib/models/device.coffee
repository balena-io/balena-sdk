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
isEmpty = require('lodash/isEmpty')
once = require('lodash/once')
without = require('lodash/without')
find = require('lodash/find')
some = require('lodash/some')
includes = require('lodash/includes')
map = require('lodash/map')
semver = require('semver')
errors = require('resin-errors')
deviceStatus = require('resin-device-status')

{ onlyIf, isId, notFoundResponse, treatAsMissingDevice } = require('../util')

# The min version where /apps API endpoints are implemented is 1.8.0 but we'll
# be accepting >= 1.8.0-alpha.0 instead. This is a workaround for a published 1.8.0-p1
# prerelase supervisor version, which precedes 1.8.0 but comes after 1.8.0-alpha.0
# according to semver.
MIN_SUPERVISOR_APPS_API = '1.8.0-alpha.0'

# Degraded network, slow devices, compressed docker binaries and any combination of these factors
# can cause proxied device requests to surpass the default timeout (currently 30s). This was
# noticed during tests and the endpoints that resulted in container management actions were
# affected in particular.
CONTAINER_ACTION_ENDPOINT_TIMEOUT = 50000

getDeviceModel = (deps, opts) ->
	{ pine, request } = deps
	{ apiUrl } = opts

	registerDevice = require('resin-register-device')({ request })
	configModel = once -> require('./config')(deps, opts)
	applicationModel = once -> require('./application')(deps, opts)
	auth = require('../auth')(deps, opts)

	exports = {}

	# Internal method for uuid/id disambiguation
	# Note that this throws an exception for missing uuids, but not missing ids
	getId = (uuidOrId) ->
		Promise.try ->
			if isId(uuidOrId)
				return uuidOrId
			else
				exports.get(uuidOrId).get('id')

	###*
	# @summary Ensure supervisor version compatibility using semver
	# @name ensureSupervisorCompatibility
	# @private
	# @function
	# @memberof resin.models.device
	#
	# @param {String} version - version under check
	# @param {String} minVersion - minimum accepted version
	# @fulfil {} - is compatible
	# @reject {Error} Will reject if the given version is < than the given minimum version
	# @returns {Promise}
	#
	# @example
	# resin.models.device.ensureSupervisorCompatibility(version, MIN_VERSION).then(function() {
	# 	console.log('Is compatible');
	# });
	#
	# @example
	# resin.models.device.ensureSupervisorCompatibility(version, MIN_VERSION, function(error) {
	# 	if (error) throw error;
	# 	console.log('Is compatible');
	# });
	###
	exports.ensureSupervisorCompatibility = ensureSupervisorCompatibility = Promise.method (version, minVersion) ->
		if semver.lt(version, minVersion)
			throw new Error("Incompatible supervisor version: #{version} - must be >= #{minVersion}")

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
			resource: 'device'
			options:
				expand: 'application'
				orderby: 'name asc'

		.map (device) ->
			device.application_name = device.application[0].app_name
			return device
		.asCallback(callback)

	###*
	# @summary Get all devices by application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Object[]} - devices
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getAllByApplication('MyApp').then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# resin.models.device.getAllByApplication(123).then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# resin.models.device.getAllByApplication('MyApp', function(error, devices) {
	# 	if (error) throw error;
	# 	console.log(devices);
	# });
	###
	exports.getAllByApplication = (nameOrId, callback) ->
		applicationModel().get(nameOrId).then (application) ->
			return pine.get
				resource: 'device'
				options:
					filter:
						application: application.id
					expand: 'application'
					orderby: 'name asc'

		# TODO: Move to server
		.map (device) ->
			device.application_name = device.application[0].app_name
			return device
		.asCallback(callback)

	###*
	# @summary Get a single device
	# @name get
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Object} - device
	# @returns {Promise}
	#
	# @example
	# resin.models.device.get('7cf02a6').then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# resin.models.device.get(123).then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# resin.models.device.get('7cf02a6', function(error, device) {
	# 	if (error) throw error;
	# 	console.log(device);
	# });
	###
	exports.get = (uuidOrId, callback) ->
		Promise.try ->
			if not uuidOrId?
				throw new errors.ResinDeviceNotFound(uuidOrId)
			else if isId(uuidOrId)
				pine.get
					resource: 'device'
					id: uuidOrId
					options:
						expand: 'application'
				.tap (device) ->
					if not device?
						throw new errors.ResinDeviceNotFound(uuidOrId)
			else
				pine.get
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
									uuidOrId.length
								]
								uuidOrId
							]
				.tap (devices) ->
					if isEmpty(devices)
						throw new errors.ResinDeviceNotFound(uuidOrId)

					if devices.length > 1
						throw new errors.ResinAmbiguousDevice(uuidOrId)
				.get(0)
		.tap (device) ->
			device.application_name = device.application[0].app_name
		.asCallback(callback)

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
			resource: 'device'
			options:
				expand: 'application'
				filter:
					name: name

		.tap (devices) ->
			if isEmpty(devices)
				throw new errors.ResinDeviceNotFound(name)
		.map (device) ->
			device.application_name = device.application[0].app_name
			return device
		.asCallback(callback)

	###*
	# @summary Get the name of a device
	# @name getName
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - device name
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getName('7cf02a6').then(function(deviceName) {
	# 	console.log(deviceName);
	# });
	#
	# @example
	# resin.models.device.getName(123).then(function(deviceName) {
	# 	console.log(deviceName);
	# });
	#
	# @example
	# resin.models.device.getName('7cf02a6', function(error, deviceName) {
	# 	if (error) throw error;
	# 	console.log(deviceName);
	# });
	###
	exports.getName = (uuidOrId, callback) ->
		exports.get(uuidOrId).get('name').asCallback(callback)

	###*
	# @summary Get application name
	# @name getApplicationName
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - application name
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
	# 	console.log(applicationName);
	# });
	#
	# @example
	# resin.models.device.getApplicationName(123).then(function(applicationName) {
	# 	console.log(applicationName);
	# });
	#
	# @example
	# resin.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
	# 	if (error) throw error;
	# 	console.log(applicationName);
	# });
	###
	exports.getApplicationName = (uuidOrId, callback) ->
		exports.get(uuidOrId).get('application_name').asCallback(callback)

	###*
	# @summary Get application container information
	# @name getApplicationInfo
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Object} - application info
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
	# 	console.log(appInfo);
	# });
	#
	# @example
	# resin.models.device.getApplicationInfo(123).then(function(appInfo) {
	# 	console.log(appInfo);
	# });
	#
	# @example
	# resin.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
	# 	if (error) throw error;
	# 	console.log(appInfo);
	# });
	###
	exports.getApplicationInfo = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then ->
				appId = device.application[0].id
				return request.send
					method: 'POST'
					url: "/supervisor/v1/apps/#{appId}"
					baseUrl: apiUrl
					body:
						deviceId: device.id
						appId: appId
						method: 'GET'
			.get('body')
			.asCallback(callback)

	###*
	# @summary Check if a device exists
	# @name has
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - has device
	# @returns {Promise}
	#
	# @example
	# resin.models.device.has('7cf02a6').then(function(hasDevice) {
	# 	console.log(hasDevice);
	# });
	#
	# @example
	# resin.models.device.has(123).then(function(hasDevice) {
	# 	console.log(hasDevice);
	# });
	#
	# @example
	# resin.models.device.has('7cf02a6', function(error, hasDevice) {
	# 	if (error) throw error;
	# 	console.log(hasDevice);
	# });
	###
	exports.has = (uuidOrId, callback) ->
		exports.get(uuidOrId).return(true)
		.catch errors.ResinDeviceNotFound, ->
			return false
		.asCallback(callback)

	###*
	# @summary Check if a device is online
	# @name isOnline
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - is device online
	# @returns {Promise}
	#
	# @example
	# resin.models.device.isOnline('7cf02a6').then(function(isOnline) {
	# 	console.log('Is device online?', isOnline);
	# });
	#
	# @example
	# resin.models.device.isOnline(123).then(function(isOnline) {
	# 	console.log('Is device online?', isOnline);
	# });
	#
	# @example
	# resin.models.device.isOnline('7cf02a6', function(error, isOnline) {
	# 	if (error) throw error;
	# 	console.log('Is device online?', isOnline);
	# });
	###
	exports.isOnline = (uuidOrId, callback) ->
		exports.get(uuidOrId).get('is_online').asCallback(callback)

	###*
	# @summary Get the local IP addresses of a device
	# @name getLocalIPAddresses
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
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
	# resin.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
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
	exports.getLocalIPAddresses = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			if not device.is_online
				throw new Error("The device is offline: #{uuidOrId}")

			ips = device.ip_address.split(' ')
			return without(ips, device.vpn_address)
		.asCallback(callback)

	###*
	# @summary Remove device
	# @name remove
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.remove('7cf02a6');
	#
	# @example
	# resin.models.device.remove(123);
	#
	# @example
	# resin.models.device.remove('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.remove = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return pine.delete
				resource: 'device'
				options:
					filter:
						uuid: device.uuid
		.asCallback(callback)

	###*
	# @summary Identify device
	# @name identify
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.identify('7cf02a6');
	#
	# @example
	# resin.models.device.identify(123);
	#
	# @example
	# resin.models.device.identify('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.identify = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return request.send
				method: 'POST'
				url: '/blink'
				baseUrl: apiUrl
				body:
					uuid: device.uuid
		.return(undefined)
		.asCallback(callback)

	###*
	# @summary Rename device
	# @name rename
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String} newName - the device new name
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.device.rename('7cf02a6', 'NewName');
	#
	# @example
	# resin.models.device.rename(123, 'NewName');
	#
	# @example
	# resin.models.device.rename('7cf02a6', 'NewName', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.rename = (uuidOrId, newName, callback) ->
		exports.get(uuidOrId).then (device) ->
			return pine.patch
				resource: 'device'
				body:
					name: newName
				options:
					filter:
						uuid: device.uuid
		.asCallback(callback)

	###*
	# @summary Note a device
	# @name note
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String} note - the note
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.device.note('7cf02a6', 'My useful note');
	#
	# @example
	# resin.models.device.note(123, 'My useful note');
	#
	# @example
	# resin.models.device.note('7cf02a6', 'My useful note', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.note = (uuidOrId, note, callback) ->
		exports.get(uuidOrId).then (device) ->
			return pine.patch
				resource: 'device'
				body:
					note: note
				options:
					filter:
						uuid: device.uuid

		.asCallback(callback)

	###*
	# @summary Move a device to another application
	# @name move
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String|Number} applicationNameOrId - application name (string) or id (number)
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.device.move('7cf02a6', 'MyApp');
	#
	# @example
	# resin.models.device.move(123, 'MyApp');
	#
	# @example
	# resin.models.device.move(123, 456);
	#
	# @example
	# resin.models.device.move('7cf02a6', 'MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.move = (uuidOrId, applicationNameOrId, callback) ->
		Promise.props
			device: exports.get(uuidOrId)
			application: applicationModel().get(applicationNameOrId)
		.then (results) ->

			if results.device.device_type isnt results.application.device_type
				throw new Error("Incompatible application: #{applicationNameOrId}")

			return pine.patch
				resource: 'device'
				body:
					application: results.application.id
				options:
					filter:
						uuid: results.device.uuid

		.asCallback(callback)

	###*
	# @summary Start application on device
	# @name startApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - application container id
	# @returns {Promise}
	#
	# @example
	# resin.models.device.startApplication('7cf02a6').then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# resin.models.device.startApplication(123).then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# resin.models.device.startApplication('7cf02a6', function(error, containerId) {
	# 	if (error) throw error;
	# 	console.log(containerId);
	# });
	###
	exports.startApplication = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then ->
				appId = device.application[0].id
				return request.send
					method: 'POST'
					url: "/supervisor/v1/apps/#{appId}/start"
					baseUrl: apiUrl
					body:
						deviceId: device.id
						appId: appId
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
		.get('body')
		.get('containerId')
		.asCallback(callback)

	###*
	# @summary Stop application on device
	# @name stopApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - application container id
	# @returns {Promise}
	#
	# @example
	# resin.models.device.stopApplication('7cf02a6').then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# resin.models.device.stopApplication(123).then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# resin.models.device.stopApplication('7cf02a6', function(error, containerId) {
	# 	if (error) throw error;
	# 	console.log(containerId);
	# });
	###
	exports.stopApplication = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then ->
				appId = device.application[0].id
				return request.send
					method: 'POST'
					url: "/supervisor/v1/apps/#{appId}/stop"
					baseUrl: apiUrl
					body:
						deviceId: device.id
						appId: appId
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
		.get('body')
		.get('containerId')
		.asCallback(callback)

	###*
	# @summary Restart application on device
	# @name restartApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# This function restarts the Docker container running
	# the application on the device, but doesn't reboot
	# the device itself.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.restartApplication('7cf02a6');
	#
	# @example
	# resin.models.device.restartApplication(123);
	#
	# @example
	# resin.models.device.restartApplication('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.restartApplication = (uuidOrId, callback) ->
		getId(uuidOrId).then (deviceId) ->
			return request.send
				method: 'POST'
				url: "/device/#{deviceId}/restart"
				baseUrl: apiUrl
				timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
		.get('body')
		.catch(notFoundResponse, treatAsMissingDevice(uuidOrId))
		.asCallback(callback)

	###*
	# @summary Reboot device
	# @name reboot
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# resin.models.device.reboot('7cf02a6');
	#
	# @example
	# resin.models.device.reboot(123);
	#
	# @example
	# resin.models.device.reboot('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.reboot = (uuidOrId, options = {}, callback) ->
		if _.isFunction(options)
			callback = options
			options = {}
		getId(uuidOrId).then (deviceId) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/reboot'
				baseUrl: apiUrl
				body:
					deviceId: deviceId
					data:
						force: Boolean(options.force)
		.get('body')
		.catch(notFoundResponse, treatAsMissingDevice(uuidOrId))
		.asCallback(callback)

	###*
	# @summary Shutdown device
	# @name shutdown
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# resin.models.device.shutdown('7cf02a6');
	#
	# @example
	# resin.models.device.shutdown(123);
	#
	# @example
	# resin.models.device.shutdown('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.shutdown = (uuidOrId, options = {}, callback) ->
		if _.isFunction(options)
			callback = options
			options = {}
		exports.get(uuidOrId).then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/shutdown'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.application[0].id
					data:
						force: Boolean(options.force)
		.asCallback(callback)

	###*
	# @summary Purge device
	# @name purge
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# This function clears the user application's `/data` directory.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.purge('7cf02a6');
	#
	# @example
	# resin.models.device.purge(123);
	#
	# @example
	# resin.models.device.purge('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.purge = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/purge'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.application[0].id
					data:
						appId: device.application[0].id
		.asCallback(callback)

	###*
	# @summary Trigger an update check on the supervisor
	# @name update
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} options - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# resin.models.device.update('7cf02a6', {
	# 	force: true
	# });
	#
	# @example
	# resin.models.device.update(123, {
	# 	force: true
	# });
	#
	# @example
	# resin.models.device.update('7cf02a6', {
	# 	force: true
	# }, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.update = (uuidOrid, options, callback) ->
		exports.get(uuidOrid).then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/update'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.application[0].id
					data:
						force: Boolean(options.force)
		.asCallback(callback)

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
		.asCallback(callback)

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
		.asCallback(callback)

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
		configModel().getDeviceTypes().then (deviceTypes) ->
			return map(deviceTypes, 'name')
		.asCallback(callback)

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
		return configModel().getDeviceTypes().then (deviceTypes) ->
			return find deviceTypes, (deviceType) ->
				return some [
					deviceType.name is slug
					deviceType.slug is slug
					includes(deviceType.aliases, slug)
				]
		.then (deviceManifest) ->
			if not deviceManifest?
				throw new errors.ResinInvalidDeviceType(slug)

			return deviceManifest
		.asCallback(callback)

	###*
	# @summary Get a device manifest by application name
	# @name getManifestByApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Object} - device manifest
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getManifestByApplication('MyApp').then(function(manifest) {
	# 	console.log(manifest);
	# });
	#
	# @example
	# resin.models.device.getManifestByApplication(123).then(function(manifest) {
	# 	console.log(manifest);
	# });
	#
	# @example
	# resin.models.device.getManifestByApplication('MyApp', function(error, manifest) {
	# 	if (error) throw error;
	# 	console.log(manifest);
	# });
	###
	exports.getManifestByApplication = (nameOrId, callback) ->
		applicationModel().get(nameOrId).get('device_type').then (deviceType) ->
			return exports.getManifestBySlug(deviceType)
		.asCallback(callback)

	###*
	# @summary Generate a random key, useful for both uuid and api key.
	# @name generateUniqueKey
	# @function
	# @public
	# @memberof resin.models.device
	#
	# @returns {String} A generated key
	#
	# @example
	# randomKey = resin.models.device.generateUniqueKey();
	# // randomKey is a randomly generated key that can be used as either a uuid or an api key
	# console.log(randomKey);
	###
	exports.generateUniqueKey = registerDevice.generateUniqueKey

	###*
	# @summary Register a new device with a Resin.io application.
	# @name register
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} applicationNameOrId - application name (string) or id (number)
	# @param {String} uuid - device uuid
	#
	# @fulfil {Object} Device registration info ({ id: "...", uuid: "...", api_key: "..." })
	# @returns {Promise}
	#
	# @example
	# var uuid = resin.models.device.generateUniqueKey();
	# resin.models.device.register('MyApp', uuid).then(function(registrationInfo) {
	# 	console.log(registrationInfo);
	# });
	#
	# @example
	# var uuid = resin.models.device.generateUniqueKey();
	# resin.models.device.register(123, uuid).then(function(registrationInfo) {
	# 	console.log(registrationInfo);
	# });
	#
	# @example
	# var uuid = resin.models.device.generateUniqueKey();
	# resin.models.device.register('MyApp', uuid, function(error, registrationInfo) {
	# 	if (error) throw error;
	# 	console.log(registrationInfo);
	# });
	###
	exports.register = (applicationNameOrId, uuid, callback) ->
		Promise.props
			userId: auth.getUserId()
			apiKey: applicationModel().getApiKey(applicationNameOrId)
			application: applicationModel().get(applicationNameOrId)
		.then (results) ->

			return registerDevice.register
				userId: results.userId
				applicationId: results.application.id
				uuid: uuid
				deviceType: results.application.device_type
				provisioningApiKey: results.apiKey
				apiEndpoint: apiUrl

		.asCallback(callback)

	###*
	# @summary Check if a device is web accessible with device utls
	# @name hasDeviceUrl
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - has device url
	# @returns {Promise}
	#
	# @example
	# resin.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
	# 	if (hasDeviceUrl) {
	# 		console.log('The device has device URL enabled');
	# 	}
	# });
	#
	# @example
	# resin.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
	# 	if (hasDeviceUrl) {
	# 		console.log('The device has device URL enabled');
	# 	}
	# });
	#
	# @example
	# resin.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
	# 	if (error) throw error;
	#
	# 	if (hasDeviceUrl) {
	# 		console.log('The device has device URL enabled');
	# 	}
	# });
	###
	exports.hasDeviceUrl = (uuidOrId, callback) ->
		exports.get(uuidOrId).get('is_web_accessible').asCallback(callback)

	###*
	# @summary Get a device url
	# @name getDeviceUrl
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - device url
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getDeviceUrl('7cf02a6').then(function(url) {
	# 	console.log(url);
	# });
	#
	# @example
	# resin.models.device.getDeviceUrl(123).then(function(url) {
	# 	console.log(url);
	# });
	#
	# @example
	# resin.models.device.getDeviceUrl('7cf02a6', function(error, url) {
	# 	if (error) throw error;
	# 	console.log(url);
	# });
	###
	exports.getDeviceUrl = (uuidOrId, callback) ->
		exports.hasDeviceUrl(uuidOrId).then (hasDeviceUrl) ->
			if not hasDeviceUrl
				throw new Error("Device is not web accessible: #{uuidOrId}")

			configModel().getAll().get('deviceUrlsBase').then (deviceUrlsBase) ->
				exports.get(uuidOrId).get('uuid').then (uuid) ->
					return "https://#{uuid}.#{deviceUrlsBase}"
		.asCallback(callback)

	###*
	# @summary Enable device url for a device
	# @name enableDeviceUrl
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.enableDeviceUrl('7cf02a6');
	#
	# @example
	# resin.models.device.enableDeviceUrl(123);
	#
	# @example
	# resin.models.device.enableDeviceUrl('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.enableDeviceUrl = (uuidOrid, callback) ->
		exports.get(uuidOrid).then (device) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: true
				options:
					filter:
						uuid: device.uuid
		.asCallback(callback)

	###*
	# @summary Disable device url for a device
	# @name disableDeviceUrl
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.disableDeviceUrl('7cf02a6');
	#
	# @example
	# resin.models.device.disableDeviceUrl(123);
	#
	# @example
	# resin.models.device.disableDeviceUrl('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.disableDeviceUrl = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: false
				options:
					filter:
						uuid: device.uuid
		.asCallback(callback)

	###*
	# @summary Enable TCP ping for a device
	# @name enableTcpPing
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# When the device's connection to the Resin VPN is down, by default
	# the device performs a TCP ping heartbeat to check for connectivity.
	# This is enabled by default.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.enableTcpPing('7cf02a6');
	#
	# @example
	# resin.models.device.enableTcpPing(123);
	#
	# @example
	# resin.models.device.enableTcpPing('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.enableTcpPing = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/tcp-ping'
				baseUrl: apiUrl
				data:
					deviceId: device.id
					appId: device.application[0].id
		.get('body')
		.asCallback(callback)

	###*
	# @summary Disable TCP ping for a device
	# @name disableTcpPing
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# When the device's connection to the Resin VPN is down, by default
	# the device performs a TCP ping heartbeat to check for connectivity.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.disableTcpPing('7cf02a6');
	#
	# @example
	# resin.models.device.disableTcpPing(123);
	#
	# @example
	# resin.models.device.disableTcpPing('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.disableTcpPing = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return request.send
				method: 'DELETE'
				url: '/supervisor/v1/tcp-ping'
				baseUrl: apiUrl
				data:
					deviceId: device.id
					appId: device.application[0].id
		.get('body')
		.asCallback(callback)

	###*
	# @summary Ping a device
	# @name ping
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# This is useful to signal that the supervisor is alive and responding.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.ping('7cf02a6');
	#
	# @example
	# resin.models.device.ping(123);
	#
	# @example
	# resin.models.device.ping('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.ping = (uuidOrId, callback) ->
		exports.get(uuidOrId).then (device) ->
			return request.send
				method: 'GET'
				url: '/supervisor/ping'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.application[0].id
		.asCallback(callback)

	###*
	# @summary Get the status of a device
	# @name getStatus
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {Object} device - A device object
	# @fulfil {String} - device status
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getStatus(device).then(function(status) {
	# 	console.log(status);
	# });
	#
	# @example
	# resin.models.device.getStatus(device, function(error, status) {
	# 	if (error) throw error;
	# 	console.log(status);
	# });
	###
	exports.getStatus = (device, callback) ->
		Promise.try ->
			return deviceStatus.getStatus(device).key
		.asCallback(callback)

	return exports

module.exports = getDeviceModel
