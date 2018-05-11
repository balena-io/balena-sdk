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

url = require('url')
Promise = require('bluebird')
isEmpty = require('lodash/isEmpty')
isFinite = require('lodash/isFinite')
once = require('lodash/once')
without = require('lodash/without')
find = require('lodash/find')
some = require('lodash/some')
includes = require('lodash/includes')
map = require('lodash/map')
semver = require('semver')
errors = require('resin-errors')
deviceStatus = require('resin-device-status')

{
	onlyIf,
	isId,
	findCallback,
	getCurrentServiceDetailsPineOptions,
	generateCurrentServiceDetails,
	mergePineOptions,
	notFoundResponse,
	noDeviceForKeyResponse,
	treatAsMissingDevice,
	LOCKED_STATUS_CODE,
	timeSince
} = require('../util')
{ normalizeDeviceOsVersion } = require('../util/device-os-version')

# The min version where /apps API endpoints are implemented is 1.8.0 but we'll
# be accepting >= 1.8.0-alpha.0 instead. This is a workaround for a published 1.8.0-p1
# prerelase supervisor version, which precedes 1.8.0 but comes after 1.8.0-alpha.0
# according to semver.
MIN_SUPERVISOR_APPS_API = '1.8.0-alpha.0'

MIN_SUPERVISOR_MC_API = '7.0.0'

# Degraded network, slow devices, compressed docker binaries and any combination of these factors
# can cause proxied device requests to surpass the default timeout (currently 30s). This was
# noticed during tests and the endpoints that resulted in container management actions were
# affected in particular.
CONTAINER_ACTION_ENDPOINT_TIMEOUT = 50000

getDeviceModel = (deps, opts) ->
	{ pine, request } = deps
	{ apiUrl, dashboardUrl } = opts

	registerDevice = require('resin-register-device')({ request })
	configModel = once -> require('./config')(deps, opts)
	applicationModel = once -> require('./application')(deps, opts)
	auth = require('../auth')(deps, opts)

	{ buildDependentResource } = require('../util/dependent-resource')

	tagsModel = buildDependentResource { pine }, {
		resourceName: 'device_tag'
		resourceKeyField: 'tag_key'
		parentResourceName: 'device',
		getResourceId: (uuidOrId) -> exports.get(uuidOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.ResinDeviceNotFound
	}

	configVarModel = buildDependentResource { pine }, {
		resourceName: 'device_config_variable'
		resourceKeyField: 'name'
		parentResourceName: 'device',
		getResourceId: (uuidOrId) -> exports.get(uuidOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.ResinDeviceNotFound
	}

	exports = {}

	# Infer dashboardUrl from apiUrl if former is undefined
	if not dashboardUrl?
		dashboardUrl = apiUrl.replace(/api/, 'dashboard')

	# Internal method for uuid/id disambiguation
	# Note that this throws an exception for missing uuids, but not missing ids
	getId = (uuidOrId) ->
		Promise.try ->
			if isId(uuidOrId)
				return uuidOrId
			else
				exports.get(uuidOrId, $select: 'id').get('id')

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
	ensureSupervisorCompatibility = Promise.method (version, minVersion) ->
		if semver.lt(version, minVersion)
			throw new Error("Incompatible supervisor version: #{version} - must be >= #{minVersion}")

	###*
	# @summary Get Dashboard URL for a specific device
	# @function getDashboardUrl
	# @memberof resin.models.device
	#
	# @param {String} uuid - Device uuid
	#
	# @returns {String} - Dashboard URL for the specific device
	# @throws Exception if the uuid is empty
	#
	# @example
	# dashboardDeviceUrl = resin.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
	###
	exports.getDashboardUrl = getDashboardUrl = (uuid) ->
		if typeof uuid != 'string' || isEmpty(uuid)
			throw new Error('The uuid option should be a non empty string')

		return url.resolve(dashboardUrl, "/devices/#{uuid}/summary")

	addExtraInfo = (device) ->
		normalizeDeviceOsVersion(device)
		return device

	###*
	# @summary Get all devices
	# @name getAll
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {Object} [options={}] - extra pine options to use
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
	exports.getAll = (options = {}, callback) ->
		callback = findCallback(arguments)

		return pine.get
			resource: 'device'
			options:
				mergePineOptions
					$orderby: 'device_name asc'
				, options

		.map(addExtraInfo)
		.asCallback(callback)

	###*
	# @summary Get all devices by application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
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
	exports.getAllByApplication = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		applicationModel().get(nameOrId, $select: 'id').then ({ id }) ->
			exports.getAll(mergePineOptions(
				$filter: belongs_to__application: id
				options
			), callback)

	###*
	# @summary Get all devices by parent device
	# @name getAllByParentDevice
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} parentUuidOrId - parent device uuid (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - devices
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# resin.models.device.getAllByParentDevice(123).then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# resin.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
	# 	if (error) throw error;
	# 	console.log(devices);
	# });
	###
	exports.getAllByParentDevice = (parentUuidOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		exports.get(parentUuidOrId, $select: 'id').then ({ id }) ->
			exports.getAll(mergePineOptions(
				$filter: is_managed_by__device: id
				options
			), callback)

	###*
	# @summary Get a single device
	# @name get
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
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
	exports.get = (uuidOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		Promise.try ->
			if not uuidOrId?
				throw new errors.ResinDeviceNotFound(uuidOrId)

			if isId(uuidOrId)
				pine.get
					resource: 'device'
					id: uuidOrId
					options: options
				.tap (device) ->
					if not device?
						throw new errors.ResinDeviceNotFound(uuidOrId)
			else
				pine.get
					resource: 'device'
					options:
						mergePineOptions
							$filter:
								uuid: $startswith: uuidOrId
						, options
				.tap (devices) ->
					if isEmpty(devices)
						throw new errors.ResinDeviceNotFound(uuidOrId)

					if devices.length > 1
						throw new errors.ResinAmbiguousDevice(uuidOrId)
				.get(0)
		.then(addExtraInfo)
		.asCallback(callback)

	###*
	# @summary Get a single device along with its associated services' essential details
	# @name getWithServiceDetails
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# This method does not map exactly to the underlying model: it runs a
	# larger prebuilt query, and reformats it into an easy to use and
	# understand format. If you want more control, or to see the raw model
	# directly, use `device.get(uuidOrId, options)` instead.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - device with service details
	# @returns {Promise}
	#
	# @example
	# resin.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# resin.models.device.getWithServiceDetails(123).then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# resin.models.device.getWithServiceDetails('7cf02a6', function(error, device) {
	# 	if (error) throw error;
	# 	console.log(device);
	# });
	###
	exports.getWithServiceDetails = (uuidOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		exports.get uuidOrId,
			mergePineOptions(getCurrentServiceDetailsPineOptions(), options)
		.then(generateCurrentServiceDetails)
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
	exports.getByName = (name, options = {}, callback) ->
		callback = findCallback(arguments)

		return exports.getAll(mergePineOptions(
			$filter: device_name: name
			options
		)).tap (devices) ->
			if isEmpty(devices)
				throw new errors.ResinDeviceNotFound(name)
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
		exports.get(uuidOrId, $select: 'device_name')
		.get('device_name')
		.asCallback(callback)

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
		exports.get uuidOrId,
			$select: 'id'
			$expand: belongs_to__application: $select: 'app_name'
		.then (device) ->
			device.belongs_to__application[0].app_name
		.asCallback(callback)

	###*
	# @summary Get application container information
	# @name getApplicationInfo
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @deprecated
	# This is not supported on multicontainer devices, and will
	# be removed in a future major release
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
		exports.get uuidOrId,
			$select: ['id', 'supervisor_version']
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then ->
				appId = device.belongs_to__application[0].id
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
		exports.get(uuidOrId, $select: ['id']).return(true)
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
		exports.get(uuidOrId, $select: 'is_online').get('is_online').asCallback(callback)

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
		exports.get(uuidOrId, $select: ['is_online', 'ip_address', 'vpn_address'])
		.then ({ is_online, ip_address, vpn_address }) ->
			if not is_online
				throw new Error("The device is offline: #{uuidOrId}")

			ips = ip_address.split(' ')
			return without(ips, vpn_address)
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
		exports.get(uuidOrId, $select: 'uuid').then ({ uuid }) ->
			return pine.delete
				resource: 'device'
				options:
					$filter:
						uuid: uuid
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
		exports.get(uuidOrId, $select: 'uuid').then ({ uuid }) ->
			return pine.patch
				resource: 'device'
				body:
					device_name: newName
				options:
					$filter:
						uuid: uuid
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
		exports.get(uuidOrId, $select: 'uuid').then ({ uuid }) ->
			return pine.patch
				resource: 'device'
				body:
					note: note
				options:
					$filter:
						uuid: uuid

		.asCallback(callback)

	###*
	# @summary Set a custom location for a device
	# @name setCustomLocation
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} location - the location ({ latitude: 123, longitude: 456 })
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
	#
	# @example
	# resin.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
	#
	# @example
	# resin.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.setCustomLocation = (uuidOrId, location, callback) ->
		exports.get(uuidOrId, $select: 'uuid').then ({ uuid }) ->
			return pine.patch
				resource: 'device'
				body:
					custom_latitude: String(location.latitude),
					custom_longitude: String(location.longitude)
				options:
					$filter:
						uuid: uuid

		.asCallback(callback)


	###*
	# @summary Clear the custom location of a device
	# @name unsetCustomLocation
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.device.unsetCustomLocation('7cf02a6');
	#
	# @example
	# resin.models.device.unsetCustomLocation(123);
	#
	# @example
	# resin.models.device.unsetLocation('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.unsetCustomLocation = (uuidOrId, callback) ->
		exports.setCustomLocation uuidOrId,
			latitude: ''
			longitude: ''
		, callback

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
			device: exports.get(uuidOrId, $select: [ 'uuid', 'device_type' ])
			deviceTypes: configModel().getDeviceTypes()
			application: applicationModel().get(applicationNameOrId, $select: [ 'id', 'device_type' ])
		.then ({ application, device, deviceTypes }) ->
			deviceDeviceType = find(deviceTypes, { slug: device.device_type })
			appDeviceType = find(deviceTypes, { slug: application.device_type })
			isCompatibleMove = deviceDeviceType.arch is appDeviceType.arch and
				(!!deviceDeviceType.isDependent is !!appDeviceType.isDependent)
			if not isCompatibleMove
				throw new errors.ResinInvalidDeviceType("Incompatible application: #{applicationNameOrId}")

			return pine.patch
				resource: 'device'
				body:
					belongs_to__application: application.id
				options:
					$filter:
						uuid: device.uuid

		.asCallback(callback)

	###*
	# @summary Start application on device
	# @name startApplication
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @deprecated
	# This is not supported on multicontainer devices, and will
	# be removed in a future major release
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
		exports.get uuidOrId,
			$select: ['id', 'supervisor_version']
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then ->
				appId = device.belongs_to__application[0].id
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
	# @deprecated
	# This is not supported on multicontainer devices, and will
	# be removed in a future major release
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
		exports.get uuidOrId,
			$select: ['id', 'supervisor_version']
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			ensureSupervisorCompatibility(device.supervisor_version, MIN_SUPERVISOR_APPS_API).then ->
				appId = device.belongs_to__application[0].id
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
	# @summary Start a service on a device
	# @name startService
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} imageId - id of the image to start
	# @returns {Promise}
	#
	# @example
	# resin.models.device.startService('7cf02a6', 123).then(function() {
	# 	...
	# });
	#
	# @example
	# resin.models.device.startService(1, 123).then(function() {
	# 	...
	# });
	#
	# @example
	# resin.models.device.startService('7cf02a6', 123, function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.startService = (uuidOrId, imageId, callback) ->
		exports.get uuidOrId,
			$select: ['id', 'supervisor_version']
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API
			).then ->
				appId = device.belongs_to__application[0].id
				return request.send
					method: 'POST'
					url: "/supervisor/v2/applications/#{appId}/start-service"
					baseUrl: apiUrl
					body:
						deviceId: device.id
						appId: appId
						data: {
							appId
							imageId
						}
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
		.asCallback(callback)

	###*
	# @summary Stop a service on a device
	# @name stopService
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} imageId - id of the image to stop
	# @returns {Promise}
	#
	# @example
	# resin.models.device.stopService('7cf02a6', 123).then(function() {
	# 	...
	# });
	#
	# @example
	# resin.models.device.stopService(1, 123).then(function() {
	# 	...
	# });
	#
	# @example
	# resin.models.device.stopService('7cf02a6', 123, function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.stopService = (uuidOrId, imageId, callback) ->
		exports.get uuidOrId,
			$select: ['id', 'supervisor_version']
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API
			).then ->
				appId = device.belongs_to__application[0].id
				return request.send
					method: 'POST'
					url: "/supervisor/v2/applications/#{appId}/stop-service"
					baseUrl: apiUrl
					body:
						deviceId: device.id
						appId: appId
						data: {
							appId
							imageId
						}
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
		.asCallback(callback)

	###*
	# @summary Restart a service on a device
	# @name restartService
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} imageId - id of the image to restart
	# @returns {Promise}
	#
	# @example
	# resin.models.device.restartService('7cf02a6', 123).then(function() {
	# 	...
	# });
	#
	# @example
	# resin.models.device.restartService(1, 123).then(function() {
	# 	...
	# });
	#
	# @example
	# resin.models.device.restartService('7cf02a6', 123, function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.restartService = (uuidOrId, imageId, callback) ->
		exports.get uuidOrId,
			$select: ['id', 'supervisor_version']
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			ensureSupervisorCompatibility(
				device.supervisor_version,
				MIN_SUPERVISOR_MC_API
			).then ->
				appId = device.belongs_to__application[0].id
				return request.send
					method: 'POST'
					url: "/supervisor/v2/applications/#{appId}/restart-service"
					baseUrl: apiUrl
					body:
						deviceId: device.id
						appId: appId
						data: {
							appId
							imageId
						}
					timeout: CONTAINER_ACTION_ENDPOINT_TIMEOUT
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
		callback = findCallback(arguments)

		getId(uuidOrId).then (deviceId) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/reboot'
				baseUrl: apiUrl
				body:
					deviceId: deviceId
					data:
						force: Boolean(options.force)
			.catch (err) ->
				if err.statusCode == LOCKED_STATUS_CODE
					throw new errors.ResinSupervisorLockedError()

				throw err
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
		callback = findCallback(arguments)

		exports.get uuidOrId,
			$select: 'id'
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/shutdown'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.belongs_to__application[0].id
					data:
						force: Boolean(options.force)
			.catch (err) ->
				if err.statusCode == LOCKED_STATUS_CODE
					throw new errors.ResinSupervisorLockedError()

				throw err
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
		exports.get uuidOrId,
			$select: 'id'
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/purge'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.belongs_to__application[0].id
					data:
						appId: device.belongs_to__application[0].id
			.catch (err) ->
				if err.statusCode == LOCKED_STATUS_CODE
					throw new errors.ResinSupervisorLockedError()

				throw err
		.asCallback(callback)

	###*
	# @summary Trigger an update check on the supervisor
	# @name update
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
	exports.update = (uuidOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		exports.get uuidOrId,
			$select: 'id'
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/v1/update'
				baseUrl: apiUrl
				body:
					deviceId: device.id
					appId: device.belongs_to__application[0].id
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
		applicationModel().get(nameOrId, $select: 'device_type')
		.get('device_type')
		.then(exports.getManifestBySlug)
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
	# @param {String} [uuid] - device uuid
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
		callback = findCallback(arguments)

		Promise.props
			userId: auth.getUserId()
			apiKey: applicationModel().generateProvisioningKey(applicationNameOrId)
			application: applicationModel().get(applicationNameOrId, $select: ['id', 'device_type'])
		.then ({ userId, apiKey, application }) ->

			return registerDevice.register
				userId: userId
				applicationId: application.id
				uuid: uuid
				deviceType: application.device_type
				provisioningApiKey: apiKey
				apiEndpoint: apiUrl

		.asCallback(callback)

	###*
	# @summary Generate a device key
	# @name generateDeviceKey
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
	# 	console.log(deviceApiKey);
	# });
	#
	# @example
	# resin.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	# 	console.log(deviceApiKey);
	# });
	#
	# @example
	# resin.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
	# 	if (error) throw error;
	# 	console.log(deviceApiKey);
	# });
	###
	exports.generateDeviceKey = (uuidOrId, callback) ->
		getId(uuidOrId).then (deviceId) ->
			return request.send
				method: 'POST'
				url: "/api-key/device/#{deviceId}/device-key"
				baseUrl: apiUrl
		.get('body')
		.catch(noDeviceForKeyResponse, treatAsMissingDevice(uuidOrId))
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
		exports.get(uuidOrId, $select: 'is_web_accessible')
		.get('is_web_accessible').asCallback(callback)

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
				exports.get(uuidOrId, $select: 'uuid').get('uuid').then (uuid) ->
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
	exports.enableDeviceUrl = (uuidOrId, callback) ->
		exports.get(uuidOrId, $select: 'uuid').then ({ uuid }) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: true
				options:
					$filter:
						uuid: uuid
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
		exports.get(uuidOrId, $select: 'uuid').then ({ uuid }) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: false
				options:
					$filter:
						uuid: uuid
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
		exports.get uuidOrId,
			$select: 'id'
			$expand: belongs_to__application: $select: 'id'
		.then (device) ->
			return request.send
				method: 'POST'
				url: '/supervisor/ping'
				baseUrl: apiUrl
				body:
					method: 'GET'
					deviceId: device.id
					appId: device.belongs_to__application[0].id
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

	###*
	# @summary Grant support access to a device until a specified time
	# @name grantSupportAccess
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
	# @returns {Promise}
	#
	# @example
	# resin.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
	#
	# @example
	# resin.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
	#
	# @example
	# resin.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.grantSupportAccess = (uuidOrId, expiryTimestamp, callback) ->
		if not expiryTimestamp? or expiryTimestamp <= Date.now()
			throw new errors.ResinInvalidParameterError('expiryTimestamp', expiryTimestamp)

		exports.get(uuidOrId, $select: 'id').then ({ id }) ->
			return pine.patch
				resource: 'device'
				id: id
				body: is_accessible_by_support_until__date: expiryTimestamp
		.asCallback(callback)

	###*
	# @summary Revoke support access to a device
	# @name revokeSupportAccess
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.device.revokeSupportAccess('7cf02a6');
	#
	# @example
	# resin.models.device.revokeSupportAccess(123);
	#
	# @example
	# resin.models.device.revokeSupportAccess('7cf02a6', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.revokeSupportAccess = (uuidOrId, callback) ->
		exports.get(uuidOrId, $select: 'id').then ({ id }) ->
			return pine.patch
				resource: 'device'
				id: id
				body: is_accessible_by_support_until__date: null
		.asCallback(callback)

	###*
	# @summary Get a string showing when a device was last set as online
	# @name lastOnline
	# @public
	# @function
	# @memberof resin.models.device
	#
	# @description
	# If the device has never been online this method returns the string `Connecting...`.
	#
	# @param {Object} device - A device object
	# @returns {String}
	#
	# @example
	# resin.models.device.get('7cf02a6').then(function(device) {
	# 	resin.models.device.lastOnline(device);
	# })
	###
	exports.lastOnline = (device) ->
		lce = device.last_connectivity_event

		if not lce
			return 'Connecting...'

		if device.is_online
			return "Currently online (for #{timeSince(lce, false)})"

		return timeSince(lce)

	###*
	# @namespace resin.models.device.tags
	# @memberof resin.models.device
	###
	exports.tags = {
		###*
		# @summary Get all device tags for an application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof resin.models.device.tags
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device tags
		# @returns {Promise}
		#
		# @example
		# resin.models.device.tags.getAllByApplication('MyApp').then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# resin.models.device.tags.getAllByApplication(999999).then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# resin.models.device.tags.getAllByApplication('MyApp', function(error, tags) {
		# 	if (error) throw error;
		# 	console.log(tags)
		# });
		###
		getAllByApplication: (nameOrId, options = {}, callback) ->
			applicationModel().get(nameOrId, $select: 'id').get('id').then (id) ->
				tagsModel.getAll(
					mergePineOptions
						$filter:
							device:
								$any:
									$alias: 'd',
									$expr: d: belongs_to__application: id
					, options
				)
			.asCallback(callback)

		###*
		# @summary Get all device tags for a device
		# @name getAllByDevice
		# @public
		# @function
		# @memberof resin.models.device.tags
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device tags
		# @returns {Promise}
		#
		# @example
		# resin.models.device.tags.getAllByDevice('7cf02a6').then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# resin.models.device.tags.getAllByDevice(123).then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# resin.models.device.tags.getAllByDevice('7cf02a6', function(error, tags) {
		# 	if (error) throw error;
		# 	console.log(tags)
		# });
		###
		getAllByDevice: tagsModel.getAllByParent

		###*
		# @summary Get all device tags
		# @name getAll
		# @public
		# @function
		# @memberof resin.models.device.tags
		#
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device tags
		# @returns {Promise}
		#
		# @example
		# resin.models.device.tags.getAll().then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# resin.models.device.tags.getAll(function(error, tags) {
		# 	if (error) throw error;
		# 	console.log(tags)
		# });
		###
		getAll: tagsModel.getAll

		###*
		# @summary Set a device tag
		# @name set
		# @public
		# @function
		# @memberof resin.models.device.tags
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} tagKey - tag key
		# @param {String|undefined} value - tag value
		#
		# @returns {Promise}
		#
		# @example
		# resin.models.device.tags.set('7cf02a6', 'EDITOR', 'vim');
		#
		# @example
		# resin.models.device.tags.set(123, 'EDITOR', 'vim');
		#
		# @example
		# resin.models.device.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
		# 	if (error) throw error;
		# });
		###
		set: tagsModel.set

		###*
		# @summary Remove a device tag
		# @name remove
		# @public
		# @function
		# @memberof resin.models.device.tags
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} tagKey - tag key
		# @returns {Promise}
		#
		# @example
		# resin.models.device.tags.remove('7cf02a6', 'EDITOR');
		#
		# @example
		# resin.models.device.tags.remove('7cf02a6', 'EDITOR', function(error) {
		# 	if (error) throw error;
		# });
		###
		remove: tagsModel.remove
	}

	exports.configVar = {
		###*
		# @summary Get all config variables for a device
		# @name getAllByDevice
		# @public
		# @function
		# @memberof resin.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device config variables
		# @returns {Promise}
		#
		# @example
		# resin.models.device.configVar.getAllByDevice('abc123').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# resin.models.device.configVar.getAllByDevice(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# resin.models.device.configVar.getAllByDevice('abc123', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByDevice: configVarModel.getAllByParent

		###*
		# @summary Get the value of a specific config variable
		# @name get
		# @public
		# @function
		# @memberof resin.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - config variable name
		# @fulfil {String|undefined} - the config variable value (or undefined)
		# @returns {Promise}
		#
		# @example
		# resin.models.device.configVar.get('7cf02a6', 'RESIN_VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# resin.models.device.configVar.get(999999, 'RESIN_VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# resin.models.device.configVar.get('7cf02a6', 'RESIN_VAR', function(error, value) {
		# 	if (error) throw error;
		# 	console.log(value)
		# });
		###
		get: configVarModel.get

		###*
		# @summary Set the value of a specific config variable
		# @name set
		# @public
		# @function
		# @memberof resin.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - config variable name
		# @param {String} value - config variable value
		# @returns {Promise}
		#
		# @example
		# resin.models.device.configVar.set('7cf02a6', 'RESIN_VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# resin.models.device.configVar.set(999999, 'RESIN_VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# resin.models.device.configVar.set('7cf02a6', 'RESIN_VAR', 'newvalue', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		set: configVarModel.set

		###*
		# @summary Clear the value of a specific config variable
		# @name remove
		# @public
		# @function
		# @memberof resin.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - config variable name
		# @returns {Promise}
		#
		# @example
		# resin.models.device.configVar.remove('7cf02a6', 'RESIN_VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# resin.models.device.configVar.remove(999999, 'RESIN_VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# resin.models.device.configVar.remove('7cf02a6', 'RESIN_VAR', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		remove: configVarModel.remove
	}

	return exports

module.exports = getDeviceModel
