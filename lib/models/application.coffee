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

Promise = require('bluebird')
once = require('lodash/once')
assign = require('lodash/assign')
forEach = require('lodash/forEach')
isArray = require('lodash/isArray')
isEmpty = require('lodash/isEmpty')
filter = require('lodash/filter')
size = require('lodash/size')
errors = require('balena-errors')

{
	isId,
	findCallback,
	getCurrentServiceDetailsPineOptions,
	generateCurrentServiceDetails,
	mergePineOptions,
	notFoundResponse,
	noApplicationForKeyResponse,
	treatAsMissingApplication,
	LOCKED_STATUS_CODE
} = require('../util')
{ normalizeDeviceOsVersion } = require('../util/device-os-version')

getApplicationModel = (deps, opts) ->
	{ request, pine } = deps
	{ apiUrl } = opts

	auth = require('../auth')(deps, opts)

	deviceModel = once -> require('./device')(deps, opts)
	releaseModel = once -> require('./release')(deps, opts)

	{ buildDependentResource } = require('../util/dependent-resource')

	tagsModel = buildDependentResource { pine }, {
		resourceName: 'application_tag'
		resourceKeyField: 'tag_key'
		parentResourceName: 'application',
		getResourceId: (nameOrId) -> exports.get(nameOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaApplicationNotFound
	}

	configVarModel = buildDependentResource { pine }, {
		resourceName: 'application_config_variable'
		resourceKeyField: 'name'
		parentResourceName: 'application',
		getResourceId: (nameOrId) -> exports.get(nameOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaApplicationNotFound
	}
	envVarModel = buildDependentResource { pine }, {
		resourceName: 'application_environment_variable'
		resourceKeyField: 'name'
		parentResourceName: 'application',
		getResourceId: (nameOrId) -> exports.get(nameOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaApplicationNotFound
	}

	exports = {}

	# Internal method for name/id disambiguation
	# Note that this throws an exception for missing names, but not missing ids
	getId = (nameOrId) ->
		Promise.try ->
			if isId(nameOrId)
				return nameOrId
			else
				exports.get(nameOrId, $select: 'id').get('id')

	exports._getId = getId

	normalizeApplication = (application) ->
		if isArray(application.owns__device)
			forEach application.owns__device, (device) ->
				normalizeDeviceOsVersion(device)
		return application

	###*
	# @summary Get all applications
	# @name getAll
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - applications
	# @returns {Promise}
	#
	# @example
	# balena.models.application.getAll().then(function(applications) {
	# 	console.log(applications);
	# });
	#
	# @example
	# balena.models.application.getAll(function(error, applications) {
	# 	if (error) throw error;
	# 	console.log(applications);
	# });
	###
	exports.getAll = (options = {}, callback) ->
		callback = findCallback(arguments)

		auth.getUserId()
		.then (userId) ->
			return pine.get
				resource: 'my_application'
				options:
					mergePineOptions
						$orderby: 'app_name asc'
					, options

		.map (application) ->
			normalizeApplication(application)
			return application

		.asCallback(callback)

	###*
	# @summary Get applications and their devices, along with each device's
	# associated services' essential details
	# @name getAllWithDeviceServiceDetails
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @description
	# This method does not map exactly to the underlying model: it runs a
	# larger prebuilt query, and reformats it into an easy to use and
	# understand format. If you want more control, or to see the raw model
	# directly, use `application.getAll(options)` instead.
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - applications
	# @returns {Promise}
	#
	# @example
	# balena.models.application.getAllWithDeviceServiceDetails().then(function(applications) {
	# 	console.log(applications);
	# })
	#
	# @example
	# balena.models.application.getAllWithDeviceServiceDetails(function(error, applications) {
	# 	if (error) throw error;
	# 	console.log(applications);
	# });
	###
	exports.getAllWithDeviceServiceDetails = (options = {}, callback) ->
		callback = findCallback(arguments)

		serviceOptions = mergePineOptions
			$expand: [
				owns__device: getCurrentServiceDetailsPineOptions()
			]
		, options

		exports.getAll(serviceOptions)
		.then (apps) ->
			apps.forEach (app) ->
				app.owns__device = app.owns__device.map(generateCurrentServiceDetails)
			return apps
		.asCallback(callback)

	###*
	# @summary Get a single application
	# @name get
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# balena.models.application.get('MyApp').then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# balena.models.application.get(123).then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# balena.models.application.get('MyApp', function(error, application) {
	# 	if (error) throw error;
	# 	console.log(application);
	# });
	###
	exports.get = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		Promise.try ->
			if not nameOrId?
				throw new errors.BalenaApplicationNotFound(nameOrId)

			if isId(nameOrId)
				pine.get
					resource: 'application'
					id: nameOrId
					options: mergePineOptions({}, options)
				.tap (application) ->
					if not application?
						throw new errors.BalenaApplicationNotFound(nameOrId)
			else
				pine.get
					resource: 'application'
					options:
						mergePineOptions
							$filter:
								app_name: nameOrId
						, options
				.tap (applications) ->
					if isEmpty(applications)
						throw new errors.BalenaApplicationNotFound(nameOrId)

					if size(applications) > 1
						throw new errors.BalenaAmbiguousApplication(nameOrId)
				.get(0)
		.tap(normalizeApplication)
		.asCallback(callback)

	###*
	# @summary Get a single application and its devices, along with each device's
	# associated services' essential details
	# @name getWithDeviceServiceDetails
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @description
	# This method does not map exactly to the underlying model: it runs a
	# larger prebuilt query, and reformats it into an easy to use and
	# understand format. If you want more control, or to see the raw model
	# directly, use `application.get(uuidOrId, options)` instead.
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# balena.models.application.getWithDeviceServiceDetails('7cf02a6').then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
	# 	console.log(device);
	# })
	#
	# @example
	# balena.models.application.getWithDeviceServiceDetails('7cf02a6', function(error, device) {
	# 	if (error) throw error;
	# 	console.log(device);
	# });
	###
	exports.getWithDeviceServiceDetails = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		serviceOptions = mergePineOptions
			$expand: [
				owns__device: getCurrentServiceDetailsPineOptions()
			]
		, options

		exports.get(nameOrId, serviceOptions)
		.then (app) ->
			if app and app.owns__device
				app.owns__device = app.owns__device.map(generateCurrentServiceDetails)

			return app
		.asCallback(callback)


	###*
	# @summary Get a single application using the appname and owner's username
	# @name getAppByOwner
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String} appName - application name
	# @param {String} owner - The owner's username
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# balena.models.application.getAppByOwner('MyApp', 'MyUser').then(function(application) {
	# 	console.log(application);
	# });
	###
	exports.getAppByOwner = (appName, owner, options = {}, callback) ->
		callback = findCallback(arguments)

		appName = appName.toLowerCase()
		owner = owner.toLowerCase()

		pine.get
			resource: 'application'
			options:
				mergePineOptions
					$filter:
						slug: "#{owner}/#{appName}"
				, options
		.tap (applications) ->
			if isEmpty(applications)
				throw new errors.BalenaApplicationNotFound("#{owner}/#{appName}")
			if size(applications) > 1
				throw new errors.BalenaAmbiguousApplication("#{owner}/#{appName}")
		.get(0)
		.tap(normalizeApplication)
		.asCallback(callback)

	###*
	# @summary Check if an application exists
	# @name has
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Boolean} - has application
	# @returns {Promise}
	#
	# @example
	# balena.models.application.has('MyApp').then(function(hasApp) {
	# 	console.log(hasApp);
	# });
	#
	# @example
	# balena.models.application.has(123).then(function(hasApp) {
	# 	console.log(hasApp);
	# });
	#
	# @example
	# balena.models.application.has('MyApp', function(error, hasApp) {
	# 	if (error) throw error;
	# 	console.log(hasApp);
	# });
	###
	exports.has = (nameOrId, callback) ->
		exports.get(nameOrId, $select: ['id']).return(true)
		.catch errors.BalenaApplicationNotFound, ->
			return false
		.asCallback(callback)

	###*
	# @summary Check if the user has any applications
	# @name hasAny
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @fulfil {Boolean} - has any applications
	# @returns {Promise}
	#
	# @example
	# balena.models.application.hasAny().then(function(hasAny) {
	# 	console.log('Has any?', hasAny);
	# });
	#
	# @example
	# balena.models.application.hasAny(function(error, hasAny) {
	# 	if (error) throw error;
	# 	console.log('Has any?', hasAny);
	# });
	###
	exports.hasAny = (callback) ->
		exports.getAll($select: ['id']).then (applications) ->
			return not isEmpty(applications)
		.asCallback(callback)

	###*
	# @summary Create an application
	# @name create
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {Object} options - application creation parameters
	# @param {String} options.name - application name
	# @param {String} [options.applicationType] - application type slug e.g. microservices-starter
	# @param {String} options.deviceType - device type slug
	# @param {(Number|String)} [options.parent] - parent application name or id
	#
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# balena.models.application.create({ name: 'My App', applicationType: 'essentials', deviceType: 'raspberry-pi').then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# balena.models.application.create({ name: 'My App', applicationType: 'microservices', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# balena.models.application.create({ name: 'My App', applicationType: 'microservices-starter', deviceType: 'raspberry-pi' }, function(error, application) {
	# 	if (error) throw error;
	# 	console.log(application);
	# });
	###
	exports.create = ({ name, applicationType, deviceType, parent }, callback) ->
		callback = findCallback(arguments)

		applicationTypePromise = if !applicationType
			Promise.resolve()
		else
			pine.get
				resource: 'application_type'
				options:
					$select: [ 'id' ]
					$filter:
						slug: applicationType
			.get(0)
			.then (appType) ->
				if not appType
					throw new Error("Invalid application type: #{applicationType}")
				appType.id

		parentAppPromise = if parent
			exports.get(parent, $select: [ 'id' ])
		else
			Promise.resolve()

		deviceManifestPromise = deviceModel().getManifestBySlug(deviceType)
		.tap (deviceManifest) ->
			if not deviceManifest?
				throw new errors.BalenaInvalidDeviceType(deviceType)

		return Promise.all([
			deviceManifestPromise
			applicationTypePromise
			parentAppPromise
		])
		.then ([
			deviceManifest
			applicationTypeId
			parentApplication
		]) ->
			if deviceManifest.state == 'DISCONTINUED'
				throw new errors.BalenaDiscontinuedDeviceType(deviceType)

			extraOptions = if parentApplication
				depends_on__application: parentApplication.id
			else {}

			if applicationTypeId
				assign extraOptions,
					application_type: applicationTypeId

			return pine.post
				resource: 'application'
				body:
					assign
						app_name: name
						device_type: deviceManifest.slug
					, extraOptions
		.asCallback(callback)

	###*
	# @summary Remove application
	# @name remove
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.remove('MyApp');
	#
	# @example
	# balena.models.application.remove(123);
	#
	# @example
	# balena.models.application.remove('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.remove = (nameOrId, callback) ->
		getId(nameOrId).then (applicationId) ->
			return pine.delete
				resource: 'application'
				id: applicationId
		.catch(notFoundResponse, treatAsMissingApplication(nameOrId))
		.asCallback(callback)

	###*
	# @summary Restart application
	# @name restart
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.restart('MyApp');
	#
	# @example
	# balena.models.application.restart(123);
	#
	# @example
	# balena.models.application.restart('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.restart = (nameOrId, callback) ->
		getId(nameOrId).then (applicationId) ->
			return request.send
				method: 'POST'
				url: "/application/#{applicationId}/restart"
				baseUrl: apiUrl
		.return(undefined)
		.catch(notFoundResponse, treatAsMissingApplication(nameOrId))
		.asCallback(callback)

	###*
	# @summary Generate an API key for a specific application
	# @name generateApiKey
	# @public
	# @function
	# @memberof balena.models.application
	# @deprecated
	# @description
	# Generally you shouldn't use this method: if you're provisioning a recent BalenaOS
	# version (2.4.0+) then generateProvisioningKey should work just as well, but
	# be more secure.
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {String} - api key
	# @returns {Promise}
	#
	# @example
	# balena.models.application.generateApiKey('MyApp').then(function(apiKey) {
	# 	console.log(apiKey);
	# });
	#
	# @example
	# balena.models.application.generateApiKey(123).then(function(apiKey) {
	# 	console.log(apiKey);
	# });
	#
	# @example
	# balena.models.application.generateApiKey('MyApp', function(error, apiKey) {
	# 	if (error) throw error;
	# 	console.log(apiKey);
	# });
	###
	exports.generateApiKey = (nameOrId, callback) ->
		# Do a full get, not just getId, because the actual api endpoint doesn't fail if the id
		# doesn't exist. TODO: Can use getId once https://github.com/balena-io/balena-api/issues/110 is resolved
		exports.get(nameOrId, $select: 'id').then ({ id }) ->
			return request.send
				method: 'POST'
				url: "/application/#{id}/generate-api-key"
				baseUrl: apiUrl
		.get('body')
		.asCallback(callback)

	###*
	# @summary Generate a device provisioning key for a specific application
	# @name generateProvisioningKey
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {String} - device provisioning key
	# @returns {Promise}
	#
	# @example
	# balena.models.application.generateProvisioningKey('MyApp').then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# balena.models.application.generateProvisioningKey(123).then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# balena.models.application.generateProvisioningKey('MyApp', function(error, key) {
	# 	if (error) throw error;
	# 	console.log(key);
	# });
	###
	exports.generateProvisioningKey = (nameOrId, callback) ->
		getId(nameOrId).then (applicationId) ->
			return request.send
				method: 'POST'
				url: "/api-key/application/#{applicationId}/provisioning"
				baseUrl: apiUrl
		.catch(noApplicationForKeyResponse, treatAsMissingApplication(nameOrId))
		.get('body')
		.asCallback(callback)

	###*
	# @summary Purge devices by application id
	# @name purge
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {Number} appId - application id
	# @returns {Promise}
	#
	# @example
	# balena.models.application.purge(123);
	#
	# @example
	# balena.models.application.purge(123, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.purge = (appId, callback) ->
		return request.send
			method: 'POST'
			url: '/supervisor/v1/purge'
			baseUrl: apiUrl
			body:
				appId: appId
				data:
					appId: "#{appId}"
		.catch (err) ->
			if err.statusCode == LOCKED_STATUS_CODE
				throw new errors.BalenaSupervisorLockedError()

			throw err
		.asCallback(callback)

	###*
	# @summary Shutdown devices by application id
	# @name shutdown
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {Number} appId - application id
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# balena.models.application.shutdown(123);
	#
	# @example
	# balena.models.application.shutdown(123, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.shutdown = (appId, options = {}, callback) ->
		return request.send
			method: 'POST'
			url: '/supervisor/v1/shutdown'
			baseUrl: apiUrl
			body:
				appId: appId
				data:
					force: Boolean(options.force)
		.catch (err) ->
			if err.statusCode == LOCKED_STATUS_CODE
				throw new errors.BalenaSupervisorLockedError()

			throw err
		.asCallback(callback)

	###*
	# @summary Reboot devices by application id
	# @name reboot
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {Number} appId - application id
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# balena.models.application.reboot(123);
	#
	# @example
	# balena.models.application.reboot(123, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.reboot = (appId, options = {}, callback) ->
		return request.send
			method: 'POST'
			url: '/supervisor/v1/reboot'
			baseUrl: apiUrl
			body:
				appId: appId
				data:
					force: Boolean(options.force)
		.catch (err) ->
			if err.statusCode == LOCKED_STATUS_CODE
				throw new errors.BalenaSupervisorLockedError()

			throw err
		.asCallback(callback)

	###*
	# @summary Get whether the application is configured to receive updates whenever a new release is available
	# @name willTrackNewReleases
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Boolean} - is tracking the latest release
	# @returns {Promise}
	#
	# @example
	# balena.models.application.willTrackNewReleases('MyApp').then(function(isEnabled) {
	# 	console.log(isEnabled);
	# });
	#
	# @example
	# balena.models.application.willTrackNewReleases(123).then(function(isEnabled) {
	# 	console.log(isEnabled);
	# });
	#
	# @example
	# balena.models.application.willTrackNewReleases('MyApp', function(error, isEnabled) {
	# 	console.log(isEnabled);
	# });
	###
	exports.willTrackNewReleases = (nameOrId, callback) ->
		exports.get(nameOrId, $select: 'should_track_latest_release')
		.get('should_track_latest_release')
		.asCallback(callback)

	###*
	# @summary Get whether the application is up to date and is tracking the latest release for updates
	# @name isTrackingLatestRelease
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Boolean} - is tracking the latest release
	# @returns {Promise}
	#
	# @example
	# balena.models.application.isTrackingLatestRelease('MyApp').then(function(isEnabled) {
	# 	console.log(isEnabled);
	# });
	#
	# @example
	# balena.models.application.isTrackingLatestRelease(123).then(function(isEnabled) {
	# 	console.log(isEnabled);
	# });
	#
	# @example
	# balena.models.application.isTrackingLatestRelease('MyApp', function(error, isEnabled) {
	# 	console.log(isEnabled);
	# });
	###
	exports.isTrackingLatestRelease = (nameOrId, callback) ->
		Promise.all([
			exports.get(nameOrId, $select: ['commit', 'should_track_latest_release'])
			releaseModel().getLatestByApplication(nameOrId, $select: 'commit')
		])
		.then ([application, latestRelease]) ->
			return application.should_track_latest_release &&
			(!latestRelease || application.commit == latestRelease.commit)
		.asCallback(callback)

	###*
	# @summary Set a specific application to run a particular release
	# @name pinToRelease
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @description Configures the application to run a particular release
	# and not get updated when the latest release changes.
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {String} fullReleaseHash - the hash of a successful release (string)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.pinToRelease('MyApp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.application.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.application.pinToRelease('MyApp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847', function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.pinToRelease = (nameOrId, fullReleaseHash, callback) ->
		getId(nameOrId)
		.then (applicationId) ->
			pine.patch
				resource: 'application'
				id: applicationId
				body:
					commit: fullReleaseHash
					should_track_latest_release: false
		.asCallback(callback)

	###*
	# @summary Get the hash of the current release for a specific application
	# @name getTargetReleaseHash
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {String} - The release hash of the current release
	# @returns {Promise}
	#
	# @example
	# balena.models.application.getTargetReleaseHash('MyApp').then(function(release) {
	# 	console.log(release);
	# });
	#
	# @example
	# balena.models.application.getTargetReleaseHash(123).then(function(release) {
	# 	console.log(release);
	# });
	#
	# @example
	# balena.models.application.getTargetReleaseHash('MyApp', function(release) {
	# 	console.log(release);
	# });
	###
	exports.getTargetReleaseHash = (nameOrId, callback) ->
		exports.get(nameOrId, $select: 'commit')
		.get('commit')
		.asCallback(callback)

	###*
	# @summary Configure a specific application to track the latest available release
	# @name trackLatestRelease
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @description The application's current release will be updated with each new successfully built release.
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.trackLatestRelease('MyApp').then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.application.trackLatestRelease(123).then(function() {
	# 	...
	# });
	#
	# @example
	# balena.models.application.trackLatestRelease('MyApp', function(error) {
	# 	if (error) throw error;
	# 	...
	# });
	###
	exports.trackLatestRelease = (nameOrId, callback) ->
		releaseModel().getLatestByApplication(nameOrId,
			$select: ['commit', 'belongs_to__application']
		)
		.then (latestRelease) ->
			if not latestRelease
				return Promise.props(
					applicationId: getId(nameOrId)
					commit: null
				)

			return {
				applicationId: latestRelease.belongs_to__application.__id
				commit: latestRelease.commit
			}
		.then ({ applicationId, commit }) ->
			body =
				should_track_latest_release: true

			if commit
				body.commit = commit

			return pine.patch
				resource: 'application'
				id: applicationId
				body: body
		.asCallback(callback)

	###*
	# @summary Enable device urls for all devices that belong to an application
	# @name enableDeviceUrls
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.enableDeviceUrls('MyApp');
	#
	# @example
	# balena.models.application.enableDeviceUrls(123);
	#
	# @example
	# balena.models.device.enableDeviceUrls('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.enableDeviceUrls = (nameOrId, callback) ->
		exports.get(nameOrId, $select: 'id').then ({ id }) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: true
				options:
					$filter:
						belongs_to__application: id
		.asCallback(callback)

	###*
	# @summary Disable device urls for all devices that belong to an application
	# @name disableDeviceUrls
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.disableDeviceUrls('MyApp');
	#
	# @example
	# balena.models.application.disableDeviceUrls(123);
	#
	# @example
	# balena.models.device.disableDeviceUrls('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.disableDeviceUrls = (nameOrId, callback) ->
		exports.get(nameOrId, $select: 'id').then ({ id }) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: false
				options:
					$filter:
						belongs_to__application: id
		.asCallback(callback)

	###*
	# @summary Grant support access to an application until a specified time
	# @name grantSupportAccess
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
	# @returns {Promise}
	#
	# @example
	# balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000);
	#
	# @example
	# balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
	#
	# @example
	# balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.grantSupportAccess = (nameOrId, expiryTimestamp, callback) ->
		if not expiryTimestamp? or expiryTimestamp <= Date.now()
			throw new errors.BalenaInvalidParameterError('expiryTimestamp', expiryTimestamp)

		getId(nameOrId).then (applicationId) ->
			return pine.patch
				resource: 'application'
				id: applicationId
				body: is_accessible_by_support_until__date: expiryTimestamp
		.catch(notFoundResponse, treatAsMissingApplication(nameOrId))
		.asCallback(callback)

	###*
	# @summary Revoke support access to an application
	# @name revokeSupportAccess
	# @public
	# @function
	# @memberof balena.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# balena.models.application.revokeSupportAccess('MyApp');
	#
	# @example
	# balena.models.application.revokeSupportAccess(123);
	#
	# @example
	# balena.models.application.revokeSupportAccess('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.revokeSupportAccess = (nameOrId, callback) ->
		getId(nameOrId).then (applicationId) ->
			return pine.patch
				resource: 'application'
				id: applicationId
				body: is_accessible_by_support_until__date: null
		.catch(notFoundResponse, treatAsMissingApplication(nameOrId))
		.asCallback(callback)

	###*
	# @namespace balena.models.application.tags
	# @memberof balena.models.application
	###
	exports.tags = {

		###*
		# @summary Get all application tags for an application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.application.tags
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - application tags
		# @returns {Promise}
		#
		# @example
		# balena.models.application.tags.getAllByApplication('MyApp').then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.application.tags.getAllByApplication('MyApp', function(error, tags) {
		# 	if (error) throw error;
		# 	console.log(tags)
		# });
		###
		getAllByApplication: tagsModel.getAllByParent

		###*
		# @summary Get all application tags
		# @name getAll
		# @public
		# @function
		# @memberof balena.models.application.tags
		#
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - application tags
		# @returns {Promise}
		#
		# @example
		# balena.models.application.tags.getAll().then(function(tags) {
		# 	console.log(tags);
		# });
		#
		# @example
		# balena.models.application.tags.getAll(function(error, tags) {
		# 	if (error) throw error;
		# 	console.log(tags)
		# });
		###
		getAll: tagsModel.getAll

		###*
		# @summary Set an application tag
		# @name set
		# @public
		# @function
		# @memberof balena.models.application.tags
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} tagKey - tag key
		# @param {String|undefined} value - tag value
		#
		# @returns {Promise}
		#
		# @example
		# balena.models.application.tags.set('7cf02a6', 'EDITOR', 'vim');
		#
		# @example
		# balena.models.application.tags.set(123, 'EDITOR', 'vim');
		#
		# @example
		# balena.models.application.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
		# 	if (error) throw error;
		# });
		###
		set: tagsModel.set

		###*
		# @summary Remove an application tag
		# @name remove
		# @public
		# @function
		# @memberof balena.models.application.tags
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} tagKey - tag key
		# @returns {Promise}
		#
		# @example
		# balena.models.application.tags.remove('7cf02a6', 'EDITOR');
		#
		# @example
		# balena.models.application.tags.remove('7cf02a6', 'EDITOR', function(error) {
		# 	if (error) throw error;
		# });
		###
		remove: tagsModel.remove
	}

	###*
	# @namespace balena.models.application.configVar
	# @memberof balena.models.application
	###
	exports.configVar = {
		###*
		# @summary Get all config variables for an application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.application.configVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - application config variables
		# @returns {Promise}
		#
		# @example
		# balena.models.application.configVar.getAllByApplication('MyApp').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.application.configVar.getAllByApplication('MyApp', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByApplication: configVarModel.getAllByParent

		###*
		# @summary Get the value of a specific config variable
		# @name get
		# @public
		# @function
		# @memberof balena.models.application.configVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} key - config variable name
		# @fulfil {String|undefined} - the config variable value (or undefined)
		# @returns {Promise}
		#
		# @example
		# balena.models.application.configVar.get('MyApp', 'BALENA_VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.application.configVar.get('MyApp', 'BALENA_VAR', function(error, value) {
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
		# @memberof balena.models.application.configVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} key - config variable name
		# @param {String} value - config variable value
		# @returns {Promise}
		#
		# @example
		# balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue', function(error) {
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
		# @memberof balena.models.application.configVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} key - config variable name
		# @returns {Promise}
		#
		# @example
		# balena.models.application.configVar.remove('MyApp', 'BALENA_VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.configVar.remove('MyApp', 'BALENA_VAR', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		remove: configVarModel.remove
	}

	###*
	# @namespace balena.models.application.envVar
	# @memberof balena.models.application
	###
	exports.envVar = {
		###*
		# @summary Get all environment variables for an application
		# @name getAllByApplication
		# @public
		# @function
		# @memberof balena.models.application.envVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {Object} [options={}] - extra pine options to use
		# @fulfil {Object[]} - application environment variables
		# @returns {Promise}
		#
		# @example
		# balena.models.application.envVar.getAllByApplication('MyApp').then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
		# 	console.log(vars);
		# });
		#
		# @example
		# balena.models.application.envVar.getAllByApplication('MyApp', function(error, vars) {
		# 	if (error) throw error;
		# 	console.log(vars)
		# });
		###
		getAllByApplication: envVarModel.getAllByParent

		###*
		# @summary Get the value of a specific environment variable
		# @name get
		# @public
		# @function
		# @memberof balena.models.application.envVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} key - environment variable name
		# @fulfil {String|undefined} - the environment variable value (or undefined)
		# @returns {Promise}
		#
		# @example
		# balena.models.application.envVar.get('MyApp', 'VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
		# 	console.log(value);
		# });
		#
		# @example
		# balena.models.application.envVar.get('MyApp', 'VAR', function(error, value) {
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
		# @memberof balena.models.application.envVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} key - environment variable name
		# @param {String} value - environment variable value
		# @returns {Promise}
		#
		# @example
		# balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue', function(error) {
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
		# @memberof balena.models.application.envVar
		#
		# @param {String|Number} nameOrId - application name (string) or id (number)
		# @param {String} key - environment variable name
		# @returns {Promise}
		#
		# @example
		# balena.models.application.envVar.remove('MyApp', 'VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.envVar.remove(999999, 'VAR').then(function() {
		# 	...
		# });
		#
		# @example
		# balena.models.application.envVar.remove('MyApp', 'VAR', function(error) {
		# 	if (error) throw error;
		# 	...
		# });
		###
		remove: envVarModel.remove
	}

	return exports

module.exports = getApplicationModel
