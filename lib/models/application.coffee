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
isEmpty = require('lodash/isEmpty')
filter = require('lodash/filter')
size = require('lodash/size')
errors = require('resin-errors')

{ isId, notFoundResponse, treatAsMissingApplication } = require('../util')

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
				exports.get(nameOrId).get('id')

	###*
	# @summary Get all applications
	# @name getAll
	# @public
	# @function
	# @memberof resin.models.application
	#
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
	exports.getAll = (callback) ->
		token.getUserId().then (userId) ->
			return pine.get
				resource: 'application'
				options:
					orderby: 'app_name asc'
					expand: 'device'
					filter:
						user: userId

		# TODO: It might be worth to do all these handy
		# manipulations server side directly.
		.map (application) ->
			application.online_devices = filter(application.device, is_online: true).length
			application.devices_length = application.device?.length or 0
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
	exports.get = (nameOrId, callback) ->
		Promise.try ->
			if not nameOrId?
				throw new errors.ResinApplicationNotFound(nameOrId)

			else if isId(nameOrId)
				pine.get
					resource: 'application'
					id: nameOrId
				.tap (application) ->
					if not application?
						throw new errors.ResinApplicationNotFound(nameOrId)
			else
				pine.get
					resource: 'application'
					options:
						filter:
							app_name: nameOrId
				.tap (applications) ->
					if isEmpty(applications)
						throw new errors.ResinApplicationNotFound(nameOrId)

					if size(applications) > 1
						throw new errors.ResinAmbiguousApplication(nameOrId)
				.get(0)
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
		exports.get(nameOrId).return(true)
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
		exports.getAll().then (applications) ->
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
	# resin.models.application.create('My App', 'raspberry-pi', function(error, application) {
	# 	if (error) throw error;
	# 	console.log(application);
	# });
	###
	exports.create = (name, deviceType, callback) ->
		return deviceModel().getDeviceSlug(deviceType)

		.tap (deviceSlug) ->
			if not deviceSlug?
				throw new errors.ResinInvalidDeviceType(deviceType)

		.then (deviceSlug) ->
			return pine.post
				resource: 'application'
				body:
					app_name: name
					device_type: deviceSlug
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
	# @summary Generate an API key for a specific application
	# @name generateApiKey
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {String} - api key
	# @returns {Promise}
	#
	# @example
	# resin.models.application.generateApiKey('MyApp').then(function(apiKey) {
	# 	console.log(apiKey);
	# });
	#
	# @example
	# resin.models.application.generateApiKey(123).then(function(apiKey) {
	# 	console.log(apiKey);
	# });
	#
	# @example
	# resin.models.application.generateApiKey('MyApp', function(error, apiKey) {
	# 	if (error) throw error;
	# 	console.log(apiKey);
	# });
	###
	exports.generateApiKey = (nameOrId, callback) ->
		# Do a full get, not just getId, because the actual api endpoint doesn't fail if the id
		# doesn't exist. TODO: Can use getId once https://github.com/resin-io/resin-api/issues/110 is resolved
		exports.get(nameOrId).then (application) ->
			return request.send
				method: 'POST'
				url: "/application/#{application.id}/generate-api-key"
				baseUrl: apiUrl
		.get('body')
		.asCallback(callback)

	###*
	# @summary Get an API key for a specific application
	# @name getApiKey
	# @public
	# @function
	# @memberof resin.models.application
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {String} - api key
	# @returns {Promise}
	#
	# @deprecated Use generateApiKey instead
	# @see {@link resin.models.application.generateApiKey}
	###
	exports.getApiKey = exports.generateApiKey

	return exports

module.exports = getApplicationModel
