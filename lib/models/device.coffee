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
errors = require('balena-errors')
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
	timeSince,
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
	upsert = require('../util/upsert').getUpsertHelper(deps)

	{ buildDependentResource } = require('../util/dependent-resource')

	tagsModel = buildDependentResource { pine }, {
		resourceName: 'device_tag'
		resourceKeyField: 'tag_key'
		parentResourceName: 'device',
		getResourceId: (uuidOrId) -> exports.get(uuidOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaDeviceNotFound
	}

	configVarModel = buildDependentResource { pine }, {
		resourceName: 'device_config_variable'
		resourceKeyField: 'name'
		parentResourceName: 'device',
		getResourceId: (uuidOrId) -> exports.get(uuidOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaDeviceNotFound
	}

	envVarModel = buildDependentResource { pine }, {
		resourceName: 'device_environment_variable'
		resourceKeyField: 'name'
		parentResourceName: 'device',
		getResourceId: (uuidOrId) -> exports.get(uuidOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaDeviceNotFound
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
	# @memberof balena.models.device
	#
	# @param {String} version - version under check
	# @param {String} minVersion - minimum accepted version
	# @fulfil {} - is compatible
	# @reject {Error} Will reject if the given version is < than the given minimum version
	# @returns {Promise}
	#
	# @example
	# balena.models.device.ensureSupervisorCompatibility(version, MIN_VERSION).then(function() {
	# 	console.log('Is compatible');
	# });
	#
	# @example
	# balena.models.device.ensureSupervisorCompatibility(version, MIN_VERSION, function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String} uuid - Device uuid
	#
	# @returns {String} - Dashboard URL for the specific device
	# @throws Exception if the uuid is empty
	#
	# @example
	# dashboardDeviceUrl = balena.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
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
	# @memberof balena.models.device
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - devices
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getAll().then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# balena.models.device.getAll(function(error, devices) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - devices
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getAllByApplication('MyApp').then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# balena.models.device.getAllByApplication(123).then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# balena.models.device.getAllByApplication('MyApp', function(error, devices) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} parentUuidOrId - parent device uuid (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - devices
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# balena.models.device.getAllByParentDevice(123).then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# balena.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - device
	# @returns {Promise}
	#
	# @example
	# balena.models.device.get('7cf02a6').then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# balena.models.device.get(123).then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# balena.models.device.get('7cf02a6', function(error, device) {
	# 	if (error) throw error;
	# 	console.log(device);
	# });
	###
	exports.get = (uuidOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		Promise.try ->
			if not uuidOrId?
				throw new errors.BalenaDeviceNotFound(uuidOrId)

			if isId(uuidOrId)
				pine.get
					resource: 'device'
					id: uuidOrId
					options: options
				.tap (device) ->
					if not device?
						throw new errors.BalenaDeviceNotFound(uuidOrId)
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
						throw new errors.BalenaDeviceNotFound(uuidOrId)

					if devices.length > 1
						throw new errors.BalenaAmbiguousDevice(uuidOrId)
				.get(0)
		.then(addExtraInfo)
		.asCallback(callback)

	###*
	# @summary Get a single device along with its associated services' essential details
	# @name getWithServiceDetails
	# @public
	# @function
	# @memberof balena.models.device
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
	# balena.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# balena.models.device.getWithServiceDetails(123).then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# balena.models.device.getWithServiceDetails('7cf02a6', function(error, device) {
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
	# @memberof balena.models.device
	#
	# @param {String} name - device name
	# @fulfil {Object[]} - devices
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getByName('MyDevice').then(function(devices) {
	# 	console.log(devices);
	# });
	#
	# @example
	# balena.models.device.getByName('MyDevice', function(error, devices) {
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
				throw new errors.BalenaDeviceNotFound(name)
		.asCallback(callback)

	###*
	# @summary Get the name of a device
	# @name getName
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - device name
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getName('7cf02a6').then(function(deviceName) {
	# 	console.log(deviceName);
	# });
	#
	# @example
	# balena.models.device.getName(123).then(function(deviceName) {
	# 	console.log(deviceName);
	# });
	#
	# @example
	# balena.models.device.getName('7cf02a6', function(error, deviceName) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - application name
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
	# 	console.log(applicationName);
	# });
	#
	# @example
	# balena.models.device.getApplicationName(123).then(function(applicationName) {
	# 	console.log(applicationName);
	# });
	#
	# @example
	# balena.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
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
	# @memberof balena.models.device
	#
	# @deprecated
	# @description
	# This is not supported on multicontainer devices, and will be removed in a future major release
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Object} - application info
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
	# 	console.log(appInfo);
	# });
	#
	# @example
	# balena.models.device.getApplicationInfo(123).then(function(appInfo) {
	# 	console.log(appInfo);
	# });
	#
	# @example
	# balena.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - has device
	# @returns {Promise}
	#
	# @example
	# balena.models.device.has('7cf02a6').then(function(hasDevice) {
	# 	console.log(hasDevice);
	# });
	#
	# @example
	# balena.models.device.has(123).then(function(hasDevice) {
	# 	console.log(hasDevice);
	# });
	#
	# @example
	# balena.models.device.has('7cf02a6', function(error, hasDevice) {
	# 	if (error) throw error;
	# 	console.log(hasDevice);
	# });
	###
	exports.has = (uuidOrId, callback) ->
		exports.get(uuidOrId, $select: ['id']).return(true)
		.catch errors.BalenaDeviceNotFound, ->
			return false
		.asCallback(callback)

	###*
	# @summary Check if a device is online
	# @name isOnline
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - is device online
	# @returns {Promise}
	#
	# @example
	# balena.models.device.isOnline('7cf02a6').then(function(isOnline) {
	# 	console.log('Is device online?', isOnline);
	# });
	#
	# @example
	# balena.models.device.isOnline(123).then(function(isOnline) {
	# 	console.log('Is device online?', isOnline);
	# });
	#
	# @example
	# balena.models.device.isOnline('7cf02a6', function(error, isOnline) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String[]} - local ip addresses
	# @reject {Error} Will reject if the device is offline
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
	# 	localIPAddresses.forEach(function(localIP) {
	# 		console.log(localIP);
	# 	});
	# });
	#
	# @example
	# balena.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
	# 	localIPAddresses.forEach(function(localIP) {
	# 		console.log(localIP);
	# 	});
	# });
	#
	# @example
	# balena.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.remove('7cf02a6');
	#
	# @example
	# balena.models.device.remove(123);
	#
	# @example
	# balena.models.device.remove('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.identify('7cf02a6');
	#
	# @example
	# balena.models.device.identify(123);
	#
	# @example
	# balena.models.device.identify('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String} newName - the device new name
	#
	# @returns {Promise}
	#
	# @example
	# balena.models.device.rename('7cf02a6', 'NewName');
	#
	# @example
	# balena.models.device.rename(123, 'NewName');
	#
	# @example
	# balena.models.device.rename('7cf02a6', 'NewName', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String} note - the note
	#
	# @returns {Promise}
	#
	# @example
	# balena.models.device.note('7cf02a6', 'My useful note');
	#
	# @example
	# balena.models.device.note(123, 'My useful note');
	#
	# @example
	# balena.models.device.note('7cf02a6', 'My useful note', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} location - the location ({ latitude: 123, longitude: 456 })
	#
	# @returns {Promise}
	#
	# @example
	# balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
	#
	# @example
	# balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
	#
	# @example
	# balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	#
	# @returns {Promise}
	#
	# @example
	# balena.models.device.unsetCustomLocation('7cf02a6');
	#
	# @example
	# balena.models.device.unsetCustomLocation(123);
	#
	# @example
	# balena.models.device.unsetLocation('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String|Number} applicationNameOrId - application name (string) or id (number)
	#
	# @returns {Promise}
	#
	# @example
	# balena.models.device.move('7cf02a6', 'MyApp');
	#
	# @example
	# balena.models.device.move(123, 'MyApp');
	#
	# @example
	# balena.models.device.move(123, 456);
	#
	# @example
	# balena.models.device.move('7cf02a6', 'MyApp', function(error) {
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
				throw new errors.BalenaInvalidDeviceType("Incompatible application: #{applicationNameOrId}")

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
	# @memberof balena.models.device
	#
	# @deprecated
	# @description
	# This is not supported on multicontainer devices, and will be removed in a future major release
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - application container id
	# @returns {Promise}
	#
	# @example
	# balena.models.device.startApplication('7cf02a6').then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# balena.models.device.startApplication(123).then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# balena.models.device.startApplication('7cf02a6', function(error, containerId) {
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
	# @memberof balena.models.device
	#
	# @deprecated
	# @description
	# This is not supported on multicontainer devices, and will be removed in a future major release
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - application container id
	# @returns {Promise}
	#
	# @example
	# balena.models.device.stopApplication('7cf02a6').then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# balena.models.device.stopApplication(123).then(function(containerId) {
	# 	console.log(containerId);
	# });
	#
	# @example
	# balena.models.device.stopApplication('7cf02a6', function(error, containerId) {
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
	# @memberof balena.models.device
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
	# balena.models.device.restartApplication('7cf02a6');
	#
	# @example
	# balena.models.device.restartApplication(123);
	#
	# @example
	# balena.models.device.restartApplication('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} imageId - id of the image to start
	# @returns {Promise}
	#
	# @example
	# balena.models.device.startService('7cf02a6', 123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.startService(1, 123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.startService('7cf02a6', 123, function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} imageId - id of the image to stop
	# @returns {Promise}
	#
	# @example
	# balena.models.device.stopService('7cf02a6', 123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.stopService(1, 123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.stopService('7cf02a6', 123, function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} imageId - id of the image to restart
	# @returns {Promise}
	#
	# @example
	# balena.models.device.restartService('7cf02a6', 123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.restartService(1, 123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.restartService('7cf02a6', 123, function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# balena.models.device.reboot('7cf02a6');
	#
	# @example
	# balena.models.device.reboot(123);
	#
	# @example
	# balena.models.device.reboot('7cf02a6', function(error) {
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
					throw new errors.BalenaSupervisorLockedError()

				throw err
		.get('body')
		.catch(notFoundResponse, treatAsMissingDevice(uuidOrId))
		.asCallback(callback)

	###*
	# @summary Shutdown device
	# @name shutdown
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# balena.models.device.shutdown('7cf02a6');
	#
	# @example
	# balena.models.device.shutdown(123);
	#
	# @example
	# balena.models.device.shutdown('7cf02a6', function(error) {
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
					throw new errors.BalenaSupervisorLockedError()

				throw err
		.asCallback(callback)

	###*
	# @summary Purge device
	# @name purge
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @description
	# This function clears the user application's `/data` directory.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.purge('7cf02a6');
	#
	# @example
	# balena.models.device.purge(123);
	#
	# @example
	# balena.models.device.purge('7cf02a6', function(error) {
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
					throw new errors.BalenaSupervisorLockedError()

				throw err
		.asCallback(callback)

	###*
	# @summary Trigger an update check on the supervisor
	# @name update
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# balena.models.device.update('7cf02a6', {
	# 	force: true
	# });
	#
	# @example
	# balena.models.device.update(123, {
	# 	force: true
	# });
	#
	# @example
	# balena.models.device.update('7cf02a6', {
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
	# @memberof balena.models.device
	#
	# @see {@link module:balena.models.device.getSupportedDeviceTypes} for a list of supported devices
	#
	# @param {String} deviceTypeSlug - device type slug
	# @fulfil {String} - device display name
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
	# 	console.log(deviceTypeName);
	# 	// Raspberry Pi
	# });
	#
	# @example
	# balena.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
	# 	if (error) throw error;
	# 	console.log(deviceTypeName);
	# 	// Raspberry Pi
	# });
	###
	exports.getDisplayName = (deviceTypeSlug, callback) ->
		exports.getManifestBySlug(deviceTypeSlug)
			.get('name')
			.catch (error) ->
				if error instanceof errors.BalenaInvalidDeviceType
					return

				throw error
		.asCallback(callback)

	###*
	# @summary Get device slug
	# @name getDeviceSlug
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @see {@link module:balena.models.device.getSupportedDeviceTypes} for a list of supported devices
	#
	# @param {String} deviceTypeName - device type name
	# @fulfil {String} - device slug name
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
	# 	console.log(deviceTypeSlug);
	# 	// raspberry-pi
	# });
	#
	# @example
	# balena.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
	# 	if (error) throw error;
	# 	console.log(deviceTypeSlug);
	# 	// raspberry-pi
	# });
	###
	exports.getDeviceSlug = (deviceTypeName, callback) ->
		exports.getManifestBySlug(deviceTypeName)
			.get('slug')
			.catch (error) ->
				if error instanceof errors.BalenaInvalidDeviceType
					return

				throw error
		.asCallback(callback)

	###*
	# @summary Get supported device types
	# @name getSupportedDeviceTypes
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @fulfil {String[]} - supported device types
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
	# 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
	# 		console.log('Balena supports:', supportedDeviceType);
	# 	});
	# });
	#
	# @example
	# balena.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
	# 	if (error) throw error;
	#
	# 	supportedDeviceTypes.forEach(function(supportedDeviceType) {
	# 		console.log('Balena supports:', supportedDeviceType);
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
	# @memberof balena.models.device
	#
	# @param {String} slug - device slug
	# @fulfil {Object} - device manifest
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
	# 	console.log(manifest);
	# });
	#
	# @example
	# balena.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
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
				throw new errors.BalenaInvalidDeviceType(slug)

			return deviceManifest
		.asCallback(callback)

	###*
	# @summary Get a device manifest by application name
	# @name getManifestByApplication
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Object} - device manifest
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getManifestByApplication('MyApp').then(function(manifest) {
	# 	console.log(manifest);
	# });
	#
	# @example
	# balena.models.device.getManifestByApplication(123).then(function(manifest) {
	# 	console.log(manifest);
	# });
	#
	# @example
	# balena.models.device.getManifestByApplication('MyApp', function(error, manifest) {
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
	# @memberof balena.models.device
	#
	# @returns {String} A generated key
	#
	# @example
	# randomKey = balena.models.device.generateUniqueKey();
	# // randomKey is a randomly generated key that can be used as either a uuid or an api key
	# console.log(randomKey);
	###
	exports.generateUniqueKey = registerDevice.generateUniqueKey

	###*
	# @summary Register a new device with a Balena application.
	# @name register
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} applicationNameOrId - application name (string) or id (number)
	# @param {String} [uuid] - device uuid
	#
	# @fulfil {Object} Device registration info ({ id: "...", uuid: "...", api_key: "..." })
	# @returns {Promise}
	#
	# @example
	# var uuid = balena.models.device.generateUniqueKey();
	# balena.models.device.register('MyApp', uuid).then(function(registrationInfo) {
	# 	console.log(registrationInfo);
	# });
	#
	# @example
	# var uuid = balena.models.device.generateUniqueKey();
	# balena.models.device.register(123, uuid).then(function(registrationInfo) {
	# 	console.log(registrationInfo);
	# });
	#
	# @example
	# var uuid = balena.models.device.generateUniqueKey();
	# balena.models.device.register('MyApp', uuid, function(error, registrationInfo) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
	# 	console.log(deviceApiKey);
	# });
	#
	# @example
	# balena.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	# 	console.log(deviceApiKey);
	# });
	#
	# @example
	# balena.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - has device url
	# @returns {Promise}
	#
	# @example
	# balena.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
	# 	if (hasDeviceUrl) {
	# 		console.log('The device has device URL enabled');
	# 	}
	# });
	#
	# @example
	# balena.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
	# 	if (hasDeviceUrl) {
	# 		console.log('The device has device URL enabled');
	# 	}
	# });
	#
	# @example
	# balena.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - device url
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getDeviceUrl('7cf02a6').then(function(url) {
	# 	console.log(url);
	# });
	#
	# @example
	# balena.models.device.getDeviceUrl(123).then(function(url) {
	# 	console.log(url);
	# });
	#
	# @example
	# balena.models.device.getDeviceUrl('7cf02a6', function(error, url) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.enableDeviceUrl('7cf02a6');
	#
	# @example
	# balena.models.device.enableDeviceUrl(123);
	#
	# @example
	# balena.models.device.enableDeviceUrl('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.disableDeviceUrl('7cf02a6');
	#
	# @example
	# balena.models.device.disableDeviceUrl(123);
	#
	# @example
	# balena.models.device.disableDeviceUrl('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @description
	# This is useful to signal that the supervisor is alive and responding.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.ping('7cf02a6');
	#
	# @example
	# balena.models.device.ping(123);
	#
	# @example
	# balena.models.device.ping('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @param {Object} device - A device object
	# @fulfil {String} - device status
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getStatus(device).then(function(status) {
	# 	console.log(status);
	# });
	#
	# @example
	# balena.models.device.getStatus(device, function(error, status) {
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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
	# @returns {Promise}
	#
	# @example
	# balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
	#
	# @example
	# balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
	#
	# @example
	# balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.grantSupportAccess = (uuidOrId, expiryTimestamp, callback) ->
		if not expiryTimestamp? or expiryTimestamp <= Date.now()
			throw new errors.BalenaInvalidParameterError('expiryTimestamp', expiryTimestamp)

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
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.revokeSupportAccess('7cf02a6');
	#
	# @example
	# balena.models.device.revokeSupportAccess(123);
	#
	# @example
	# balena.models.device.revokeSupportAccess('7cf02a6', function(error) {
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
	# @memberof balena.models.device
	#
	# @description
	# If the device has never been online this method returns the string `Connecting...`.
	#
	# @param {Object} device - A device object
	# @returns {String}
	#
	# @example
	# balena.models.device.get('7cf02a6').then(function(device) {
	# 	balena.models.device.lastOnline(device);
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
	# @summary Get whether the device is configured to track the current application release
	# @name isTrackingApplicationRelease
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Boolean} - is tracking the current application release
	# @returns {Promise}
	#
	# @example
	# balena.models.device.isTrackingApplicationRelease('7cf02a6').then(function(isEnabled) {
	# 	console.log(isEnabled);
	# });
	#
	# @example
	# balena.models.device.isTrackingApplicationRelease('7cf02a6', function(error, isEnabled) {
	# 	console.log(isEnabled);
	# });
	###
	exports.isTrackingApplicationRelease = (uuidOrId, callback) ->
		exports.get(uuidOrId, $select: 'should_be_running__release')
		.then ({ should_be_running__release }) ->
			return not should_be_running__release
		.asCallback(callback)

	###*
	# @summary Get the hash of the currently tracked release for a specific device
	# @name getTargetReleaseHash
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String} - The release hash of the currently tracked release
	# @returns {Promise}
	#
	# @example
	# balena.models.device.getTargetReleaseHash('7cf02a6').then(function(release) {
	# 	console.log(release);
	# });
	#
	# @example
	# balena.models.device.getTargetReleaseHash('7cf02a6', function(release) {
	# 	console.log(release);
	# });
	###
	exports.getTargetReleaseHash = (uuidOrId, callback) ->
		exports.get(uuidOrId,
			$select: 'id'
			$expand:
				should_be_running__release:
					$select: 'commit'
				belongs_to__application:
					$select: 'commit'
		)
		.then ({ should_be_running__release, belongs_to__application }) ->
			if not isEmpty(should_be_running__release)
				return should_be_running__release[0].commit
			belongs_to__application[0].commit
		.asCallback(callback)

	###*
	# @summary Set a specific device to run a particular release
	# @name pinToRelease
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @description Configures the device to run a particular release
	# and not get updated when the current application release changes.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String|Number} fullReleaseHashOrId - the hash of a successful release (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.pinToRelease = (uuidOrId, fullReleaseHashOrId, callback) ->
		Promise.try ->
			if isId(uuidOrId) and isId(fullReleaseHashOrId)
				return {
					deviceId: uuidOrId
					releaseId: fullReleaseHashOrId
				}

			releaseFilterProperty = if isId(fullReleaseHashOrId) then 'id' else 'commit'
			exports.get(uuidOrId,
				$select: 'id'
				$expand:
					belongs_to__application:
						$select: 'id'
						$expand:
							owns__release:
								$top: 1
								$select: 'id'
								$filter:
									"#{releaseFilterProperty}": fullReleaseHashOrId
									status: 'success'
								$orderby: 'created_at desc'
			)
			.then ({ id, belongs_to__application }) ->
				app = belongs_to__application[0]
				release = app.owns__release[0]
				if not release
					throw new errors.BalenaReleaseNotFound(fullReleaseHashOrId)
				return {
					deviceId: id
					releaseId: release.id
				}
		.then ({ deviceId, releaseId }) ->
			pine.patch
				resource: 'device'
				id: deviceId
				body: should_be_running__release: releaseId
		.asCallback(callback)

	###*
	# @summary Configure a specific device to track the current application release
	# @name trackApplicationRelease
	# @public
	# @function
	# @memberof balena.models.device
	#
	# @description The device's current release will be updated with each new successfully built release.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.device.trackApplicationRelease('7cf02a6').then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.device.trackApplicationRelease('7cf02a6', function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.trackApplicationRelease = (uuidOrId, callback) ->
		getId(uuidOrId).then (deviceId) ->
			return pine.patch
				resource: 'device'
				id: deviceId
				body: should_be_running__release: null
		.asCallback(callback)

	###*
	# @namespace balena.models.device.tags
	# @memberof balena.models.device
	###
	exports.tags = {
		###*
		# @summary Get all device tags for an application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.device.tags
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device tags
		# @returns {Promise}
		#
		# @example
		# balena.models.device.tags.getAllByApplication('MyApp').then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.device.tags.getAllByApplication('MyApp', function(error, tags) {
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
		# @memberof balena.models.device.tags
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device tags
		# @returns {Promise}
		#
		# @example
		# balena.models.device.tags.getAllByDevice('7cf02a6').then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.device.tags.getAllByDevice(123).then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.device.tags.getAllByDevice('7cf02a6', function(error, tags) {
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
		# @memberof balena.models.device.tags
		#
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device tags
		# @returns {Promise}
		#
		# @example
		# balena.models.device.tags.getAll().then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.device.tags.getAll(function(error, tags) {
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
		# @memberof balena.models.device.tags
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} tagKey - tag key
		# @param {String|undefined} value - tag value
		#
		# @returns {Promise}
		#
		# @example
		# balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim');
		#
		# @example
		# balena.models.device.tags.set(123, 'EDITOR', 'vim');
		#
		# @example
		# balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
		# 	if (error) throw error;
		# });
		###
		set: tagsModel.set

		###*
		# @summary Remove a device tag
		# @name remove
		# @public
		# @function
		# @memberof balena.models.device.tags
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} tagKey - tag key
		# @returns {Promise}
		#
		# @example
		# balena.models.device.tags.remove('7cf02a6', 'EDITOR');
		#
		# @example
		# balena.models.device.tags.remove('7cf02a6', 'EDITOR', function(error) {
		# 	if (error) throw error;
		# });
		###
		remove: tagsModel.remove
	}

	###*
	# @namespace balena.models.device.configVar
	# @memberof balena.models.device
	###
	exports.configVar = {
		###*
		# @summary Get all config variables for a device
		# @name getAllByDevice
		# @public
		# @function
		# @memberof balena.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device config variables
		# @returns {Promise}
		#
		# @example
		# balena.models.device.configVar.getAllByDevice('7cf02a6').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.configVar.getAllByDevice(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.configVar.getAllByDevice('7cf02a6', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByDevice: configVarModel.getAllByParent

		###*
		# @summary Get all device config variables by application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.device.configVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device config variables
		# @returns {Promise}
		#
		# @example
		# balena.models.device.configVar.getAllByApplication('MyApp').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.configVar.getAllByApplication('MyApp', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByApplication: (nameOrId, options = {}, callback) ->
			callback = findCallback(arguments)

			applicationModel().get(nameOrId, $select: 'id')
			.get('id')
			.then (id) ->
				configVarModel.getAll(
					mergePineOptions
						$filter:
							device:
								$any:
									$alias: 'd'
									$expr: d:
										belongs_to__application: id
						$orderby: 'name asc'
					, options
				)
			.asCallback(callback)

		###*
		# @summary Get the value of a specific config variable
		# @name get
		# @public
		# @function
		# @memberof balena.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - config variable name
		# @fulfil {String|undefined} - the config variable value (or undefined)
		# @returns {Promise}
		#
		# @example
		# balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.device.configVar.get(999999, 'BALENA_VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR', function(error, value) {
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
		# @memberof balena.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - config variable name
		# @param {String} value - config variable value
		# @returns {Promise}
		#
		# @example
		# balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue', function(error) {
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
		# @memberof balena.models.device.configVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - config variable name
		# @returns {Promise}
		#
		# @example
		# balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.configVar.remove(999999, 'BALENA_VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		remove: configVarModel.remove
	}

	###*
	# @namespace balena.models.device.envVar
	# @memberof balena.models.device
	###
	exports.envVar = {
		###*
		# @summary Get all environment variables for a device
		# @name getAllByDevice
		# @public
		# @function
		# @memberof balena.models.device.envVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device environment variables
		# @returns {Promise}
		#
		# @example
		# balena.models.device.envVar.getAllByDevice('7cf02a6').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.envVar.getAllByDevice(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.envVar.getAllByDevice('7cf02a6', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByDevice: envVarModel.getAllByParent

		###*
		# @summary Get all device environment variables by application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.device.envVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - device environment variables
		# @returns {Promise}
		#
		# @example
		# balena.models.device.envVar.getAllByApplication('MyApp').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.envVar.getAllByApplication('MyApp', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByApplication: (nameOrId, options = {}, callback) ->
			callback = findCallback(arguments)

			applicationModel().get(nameOrId, $select: 'id')
			.get('id')
			.then (id) ->
				envVarModel.getAll(
					mergePineOptions
						$filter:
							device:
								$any:
									$alias: 'd'
									$expr: d:
										belongs_to__application: id
						$orderby: 'name asc'
					, options
				)
			.asCallback(callback)

		###*
		# @summary Get the value of a specific environment variable
		# @name get
		# @public
		# @function
		# @memberof balena.models.device.envVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - environment variable name
		# @fulfil {String|undefined} - the environment variable value (or undefined)
		# @returns {Promise}
		#
		# @example
		# balena.models.device.envVar.get('7cf02a6', 'VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.device.envVar.get(999999, 'VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.device.envVar.get('7cf02a6', 'VAR', function(error, value) {
		# 	if (error) throw error;
		# 	console.log(value)
		# });
		###
		get: envVarModel.get

		###*
		# @summary Set the value of a specific environment variable
		# @name set
		# @public
		# @function
		# @memberof balena.models.device.envVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - environment variable name
		# @param {String} value - environment variable value
		# @returns {Promise}
		#
		# @example
		# balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.envVar.set(999999, 'VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		set: envVarModel.set

		###*
		# @summary Clear the value of a specific environment variable
		# @name remove
		# @public
		# @function
		# @memberof balena.models.device.envVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {String} key - environment variable name
		# @returns {Promise}
		#
		# @example
		# balena.models.device.envVar.remove('7cf02a6', 'VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.envVar.remove(999999, 'VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.envVar.remove('7cf02a6', 'VAR', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		remove: envVarModel.remove
	}

	###*
	# @namespace balena.models.device.serviceVar
	# @memberof balena.models.device
	###
	exports.serviceVar = {

		###*
		# @summary Get all service variable overrides for a device
		# @name getAllByDevice
		# @public
		# @function
		# @memberof balena.models.device.serviceVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - service variables
		# @returns {Promise}
		#
		# @example
		# balena.models.device.serviceVar.getAllByDevice('7cf02a6').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.serviceVar.getAllByDevice(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.serviceVar.getAllByDevice('7cf02a6', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByDevice: (uuidOrId, options = {}, callback) ->
			callback = findCallback(arguments)

			exports.get(uuidOrId, $select: 'id').get('id')
			.then (deviceId) ->
				pine.get
					resource: 'device_service_environment_variable'
					options: mergePineOptions
						$filter:
							service_install:
								$any:
									$alias: 'si',
									$expr: si: device: deviceId
						, options
			.asCallback(callback)

		###*
		# @summary Get all device service variable overrides by application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.device.serviceVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - service variables
		# @returns {Promise}
		#
		# @example
		# balena.models.device.serviceVar.getAllByApplication('MyApp').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.device.serviceVar.getAllByApplication('MyApp', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByApplication: (nameOrId, options = {}, callback) ->
			callback = findCallback(arguments)

			applicationModel().get(nameOrId, $select: 'id')
			.get('id')
			.then (id) ->
				pine.get
					resource: 'device_service_environment_variable'
					options:
						mergePineOptions
							$filter:
								service_install:
									$any:
										$alias: 'si',
										$expr: si:
											device:
												$any:
													$alias: 'd'
													$expr: d:
														belongs_to__application: id
							$orderby: 'name asc'
						, options
			.asCallback(callback)

		###*
		# @summary Get the overriden value of a service variable on a device
		# @name get
		# @public
		# @function
		# @memberof balena.models.device.serviceVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Number} id - service id
		# @param {String} key - variable name
		# @fulfil {String|undefined} - the variable value (or undefined)
		# @returns {Promise}
		#
		# @example
		# balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR', function(error, value) {
		# 	if (error) throw error;
		# 	console.log(value)
		# });
		###
		get: (uuidOrId, serviceId, key, callback) ->
			callback = findCallback(arguments)

			exports.get(uuidOrId, $select: 'id').get('id')
			.then (deviceId) ->
				pine.get
					resource: 'device_service_environment_variable'
					options:
						$filter:
							service_install:
								$any:
									$alias: 'si',
									$expr: si:
										device: deviceId
										service: serviceId
							name: key
			.get(0)
			.then (variable) ->
				variable?.value
			.asCallback(callback)

		###*
		# @summary Set the overriden value of a service variable on a device
		# @name set
		# @public
		# @function
		# @memberof balena.models.device.serviceVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Number} id - service id
		# @param {String} key - variable name
		# @param {String} value - variable value
		# @returns {Promise}
		#
		# @example
		# balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		set: (uuidOrId, serviceId, key, value, callback) ->
			Promise.try ->
				value = String(value)

				deviceFilter = if isId(uuidOrId)
					uuidOrId
				else
					$any:
						$alias: 'd'
						$expr: d:
							uuid: uuidOrId

				pine.get
					resource: 'service_install'
					options:
						$filter:
							device: deviceFilter
							service: serviceId
				.tap (serviceInstalls) ->
					if isEmpty(serviceInstalls)
						throw new errors.BalenaServiceNotFound(serviceId)
					if serviceInstalls.length > 1
						throw new errors.BalenaAmbiguousDevice(uuidOrId)
				.get(0)
				.get('id')
			.then (serviceInstallId) ->
				upsert
					resource: 'device_service_environment_variable'
					body:
						service_install: serviceInstallId
						name: key
						value: value
				,
				[
					'service_install'
					'name'
				]
			.asCallback(callback)

		###*
		# @summary Clear the overridden value of a service variable on a device
		# @name remove
		# @public
		# @function
		# @memberof balena.models.device.serviceVar
		#
		# @param {String|Number} uuidOrId - device uuid (string) or id (number)
		# @param {Number} id - service id
		# @param {String} key - variable name
		# @returns {Promise}
		#
		# @example
		# balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		remove: (uuidOrId, serviceId, key, callback) ->
			exports.get(uuidOrId, $select: 'id').get('id')
			.then (deviceId) ->
				pine.delete
					resource: 'device_service_environment_variable'
					options:
						$filter:
							service_install:
								$any:
									$alias: 'si',
									$expr: si:
										device: deviceId
										service: serviceId
							name: key
			.asCallback(callback)
	}

	return exports

module.exports = getDeviceModel
