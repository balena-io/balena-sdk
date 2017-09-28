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
once = require('lodash/once')
assign = require('lodash/assign')
forEach = require('lodash/forEach')
isArray = require('lodash/isArray')
isEmpty = require('lodash/isEmpty')
filter = require('lodash/filter')
size = require('lodash/size')
errors = require('resin-errors')

{
	isId,
	findCallback,
	mergePineOptions,
	notFoundResponse,
	noApplicationForKeyResponse,
	treatAsMissingApplication,
	LOCKED_STATUS_CODE
} = require('../util')
{ normalizeDeviceOsVersion } = require('../util/device-os-version')

getApplicationModel = (deps, opts) ->
	{ request, token, pine } = deps
	{ apiUrl } = opts

	deviceModel = once -> require('./device')(deps, opts)

	exports = {}

	# Internal method for name/id disambiguation
	# Note that this throws an exception for missing names, but not missing ids
	getId = (nameOrId) ->
		Promise.try ->
			if isId(nameOrId)
				return nameOrId
			else
				exports.get(nameOrId, select: 'id').get('id')

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
	# @memberof resin.models.application
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - applications
	# @returns {Promise}
	#
	# @example
	# resin.models.application.getAll().then(function(applications) {
	# 	console.log(applications);
	# });
	#
	# @example
	# resin.models.application.getAll(function(error, applications) {
	# 	if (error) throw error;
	# 	console.log(applications);
	# });
	###
	exports.getAll = (options = {}, callback) ->
		callback = findCallback(arguments)

		token.getUserId().then (userId) ->
			return pine.get
				resource: 'application'
				options:
					mergePineOptions
						orderby: 'app_name asc'
						filter:
							user: userId
					, options

		.map (application) ->
			normalizeApplication(application)
			return application

		.asCallback(callback)

	###*
	# @summary Get a single application
	# @name get
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# resin.models.application.get('MyApp').then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# resin.models.application.get(123).then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# resin.models.application.get('MyApp', function(error, application) {
	# 	if (error) throw error;
	# 	console.log(application);
	# });
	###
	exports.get = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		Promise.try ->
			if not nameOrId?
				throw new errors.ResinApplicationNotFound(nameOrId)

			if isId(nameOrId)
				pine.get
					resource: 'application'
					id: nameOrId
					options: mergePineOptions({}, options)
				.tap (application) ->
					if not application?
						throw new errors.ResinApplicationNotFound(nameOrId)
			else
				pine.get
					resource: 'application'
					options:
						mergePineOptions
							filter:
								app_name: nameOrId
						, options
				.tap (applications) ->
					if isEmpty(applications)
						throw new errors.ResinApplicationNotFound(nameOrId)

					if size(applications) > 1
						throw new errors.ResinAmbiguousApplication(nameOrId)
				.get(0)
		.tap(normalizeApplication)
		.asCallback(callback)

	###*
	# @summary Get a single application using the appname and owner's username
	# @name getAppByOwner
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String} appName - application name
	# @param {String} owner - The owner's username
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# resin.models.application.getAppByOwner('MyApp', 'MyUser').then(function(application) {
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
					filter:
						$eq: [
							$tolower: $: 'app_name'
							appName
						],
						user:
							$any:
								$alias: 'u',
								$expr: $eq: [
									$tolower: $: 'username'
									owner
								]
				, options
		.tap (applications) ->
			if isEmpty(applications)
				throw new errors.ResinApplicationNotFound("#{owner}/#{appName}")
			if size(applications) > 1
				throw new errors.ResinAmbiguousApplication("#{owner}/#{appName}")
		.get(0)
		.tap(normalizeApplication)
		.asCallback(callback)

	###*
	# @summary Check if an application exists
	# @name has
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Boolean} - has application
	# @returns {Promise}
	#
	# @example
	# resin.models.application.has('MyApp').then(function(hasApp) {
	# 	console.log(hasApp);
	# });
	#
	# @example
	# resin.models.application.has(123).then(function(hasApp) {
	# 	console.log(hasApp);
	# });
	#
	# @example
	# resin.models.application.has('MyApp', function(error, hasApp) {
	# 	if (error) throw error;
	# 	console.log(hasApp);
	# });
	###
	exports.has = (nameOrId, callback) ->
		exports.get(nameOrId, select: []).return(true)
		.catch errors.ResinApplicationNotFound, ->
			return false
		.asCallback(callback)

	###*
	# @summary Check if the user has any applications
	# @name hasAny
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @fulfil {Boolean} - has any applications
	# @returns {Promise}
	#
	# @example
	# resin.models.application.hasAny().then(function(hasAny) {
	# 	console.log('Has any?', hasAny);
	# });
	#
	# @example
	# resin.models.application.hasAny(function(error, hasAny) {
	# 	if (error) throw error;
	# 	console.log('Has any?', hasAny);
	# });
	###
	exports.hasAny = (callback) ->
		exports.getAll(select: []).then (applications) ->
			return not isEmpty(applications)
		.asCallback(callback)

	###*
	# @summary Get a single application by id
	# @name getById
	# @public
	# @function
	# @memberof resin.models.application
	# @deprecated .get() now accepts application ids directly
	#
	# @param {(Number|String)} id - application id
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# resin.models.application.getById(89).then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# resin.models.application.getById(89, function(error, application) {
	# 	if (error) throw error;
	# 	console.log(application);
	# });
	###
	exports.getById = (id, callback) ->
		return pine.get
			resource: 'application'
			id: id
		.tap (application) ->
			if not application?
				throw new errors.ResinApplicationNotFound(id)

			normalizeApplication(application)
		.asCallback(callback)

	###*
	# @summary Create an application
	# @name create
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String} name - application name
	# @param {String} deviceType - device type slug
	# @param {(Number|String)} [parentNameOrId] - parent application name or id
	#
	# @fulfil {Object} - application
	# @returns {Promise}
	#
	# @example
	# resin.models.application.create('My App', 'raspberry-pi').then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# resin.models.application.create('My App', 'raspberry-pi', 'ParentApp').then(function(application) {
	# 	console.log(application);
	# });
	#
	# @example
	# resin.models.application.create('My App', 'raspberry-pi', function(error, application) {
	# 	if (error) throw error;
	# 	console.log(application);
	# });
	###
	exports.create = (name, deviceType, parentNameOrId, callback) ->
		callback = findCallback(arguments)

		parentAppPromise = if parentNameOrId
			exports.get(parentNameOrId, select: [ 'id' ])
		else
			Promise.resolve()

		deviceManifestPromise = deviceModel().getManifestBySlug(deviceType)
		.tap (deviceManifest) ->
			if not deviceManifest?
				throw new errors.ResinInvalidDeviceType(deviceType)

		return Promise.all([ deviceManifestPromise, parentAppPromise ])
		.then ([ deviceManifest, parentApplication ]) ->
			if deviceManifest.state == 'DISCONTINUED'
				throw new errors.ResinDiscontinuedDeviceType(deviceType)

			extraOptions = if parentApplication
				depends_on__application: parentApplication.id
			else {}

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
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.application.remove('MyApp');
	#
	# @example
	# resin.models.application.remove(123);
	#
	# @example
	# resin.models.application.remove('MyApp', function(error) {
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
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.application.restart('MyApp');
	#
	# @example
	# resin.models.application.restart(123);
	#
	# @example
	# resin.models.application.restart('MyApp', function(error) {
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
	# @summary Generate a device provisioning key for a specific application
	# @name generateProvisioningKey
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {String} - device provisioning key
	# @returns {Promise}
	#
	# @example
	# resin.models.application.generateProvisioningKey('MyApp').then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# resin.models.application.generateProvisioningKey(123).then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# resin.models.application.generateProvisioningKey('MyApp', function(error, key) {
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
	# @memberof resin.models.application
	#
	# @param {Number} appId - application id
	# @returns {Promise}
	#
	# @example
	# resin.models.application.purge(123);
	#
	# @example
	# resin.models.application.purge(123, function(error) {
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
				throw new errors.ResinSupervisorLockedError()

			throw err
		.asCallback(callback)

	###*
	# @summary Shutdown devices by application id
	# @name shutdown
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {Number} appId - application id
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# resin.models.application.shutdown(123);
	#
	# @example
	# resin.models.application.shutdown(123, function(error) {
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
				throw new errors.ResinSupervisorLockedError()

			throw err
		.asCallback(callback)

	###*
	# @summary Reboot devices by application id
	# @name reboot
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {Number} appId - application id
	# @param {Object} [options] - options
	# @param {Boolean} [options.force=false] - override update lock
	# @returns {Promise}
	#
	# @example
	# resin.models.application.reboot(123);
	#
	# @example
	# resin.models.application.reboot(123, function(error) {
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
				throw new errors.ResinSupervisorLockedError()

			throw err
		.asCallback(callback)

	###*
	# @summary Enable device urls for all devices that belong to an application
	# @name enableDeviceUrls
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.application.enableDeviceUrls('MyApp');
	#
	# @example
	# resin.models.application.enableDeviceUrls(123);
	#
	# @example
	# resin.models.device.enableDeviceUrls('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.enableDeviceUrls = (nameOrId, callback) ->
		exports.get(nameOrId, select: 'id').then ({ id }) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: true
				options:
					filter:
						belongs_to__application: id
		.asCallback(callback)

	###*
	# @summary Disable device urls for all devices that belong to an application
	# @name disableDeviceUrls
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.application.disableDeviceUrls('MyApp');
	#
	# @example
	# resin.models.application.disableDeviceUrls(123);
	#
	# @example
	# resin.models.device.disableDeviceUrls('MyApp', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.disableDeviceUrls = (nameOrId, callback) ->
		exports.get(nameOrId, select: 'id').then ({ id }) ->
			return pine.patch
				resource: 'device'
				body:
					is_web_accessible: false
				options:
					filter:
						belongs_to__application: id
		.asCallback(callback)

	###*
	# @summary Grant support access to an application until a specified time
	# @name grantSupportAccess
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Number} expiryTimestamp - a timestamp in ms for when the support access will expire
	# @returns {Promise}
	#
	# @example
	# resin.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000);
	#
	# @example
	# resin.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
	#
	# @example
	# resin.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.grantSupportAccess = (nameOrId, expiryTimestamp, callback) ->
		if not expiryTimestamp? or expiryTimestamp <= Date.now()
			throw new errors.ResinInvalidParameterError('expiryTimestamp', expiryTimestamp)

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
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.models.application.revokeSupportAccess('MyApp');
	#
	# @example
	# resin.models.application.revokeSupportAccess(123);
	#
	# @example
	# resin.models.application.revokeSupportAccess('MyApp', function(error) {
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

	return exports

module.exports = getApplicationModel
