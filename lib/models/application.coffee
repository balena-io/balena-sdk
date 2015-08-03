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

_ = require('lodash')
errors = require('resin-errors')
request = require('resin-request')
pine = require('resin-pine')
deviceModel = require('./device')

###*
# @summary Get all applications
# @name getAll
# @public
# @function
# @memberof resin.models.application
#
# @returns {Promise<Object[]>} applications
#
# @example
# resin.models.application.getAll().then (applications) ->
# 	console.log(applications)
#
# @example
# resin.models.application.getAll (error, applications) ->
# 	throw error if error?
# 	console.log(applications)
###
exports.getAll = (callback) ->
	return pine.get
		resource: 'application'
		options:
			orderby: 'app_name asc'
			expand: 'device'

	# TODO: It might be worth to do all these handy
	# manipulations server side directly.
	.map (application) ->
		application.online_devices = _.where(application.device, is_online: true).length
		application.devices_length = application.device?.length or 0
		return application

	.nodeify(callback)

###*
# @summary Get a single application
# @name get
# @public
# @function
# @memberof resin.models.application
#
# @param {String} name - application name
# @returns {Promise<Object>} application
#
# @example
# resin.models.application.get('MyApp').then (application) ->
# 	console.log(application)
#
# @example
# resin.models.application.get 'MyApp', (error, application) ->
# 	throw error if error?
# 	console.log(application)
###
exports.get = (name, callback) ->
	return pine.get
		resource: 'application'
		options:
			filter:
				app_name: name

	.tap (application) ->
		if _.isEmpty(application)
			throw new errors.ResinApplicationNotFound(name)
	.get(0)
	.nodeify(callback)

###*
# @summary Check if an application exist
# @name has
# @public
# @function
# @memberof resin.models.application
#
# @param {String} name - application name
# @returns {Promise<Boolean>} has application
#
# @example
# resin.models.application.has('MyApp').then (hasApp) ->
# 	console.log(hasApp)
#
# @example
# resin.models.application.has 'MyApp', (error, hasApp) ->
# 	throw error if error?
# 	console.log(hasApp)
###
exports.has = (name, callback) ->
	exports.get(name).return(true)
	.catch errors.ResinApplicationNotFound, ->
		return false
	.nodeify(callback)

###*
# @summary Check if the user has any applications
# @name hasAny
# @public
# @function
# @memberof resin.models.application
#
# @returns {Promise<Boolean>} has any applications
#
# @example
# resin.models.application.hasAny().then (hasAny) ->
# 	console.log("Has any? #{hasAny}")
#
# @example
# resin.models.application.hasAny (error, hasAny) ->
# 	throw error if error?
# 	console.log("Has any? #{hasAny}")
###
exports.hasAny = (callback) ->
	exports.getAll().then (applications) ->
		return not _.isEmpty(applications)
	.nodeify(callback)

###*
# @summary Get a single application by id
# @name getById
# @public
# @function
# @memberof resin.models.application
#
# @param {(Number|String)} id - application id
# @returns {Promise<Object>} application
#
# @example
# resin.models.application.getById(89).then (application) ->
# 	console.log(application)
#
# @example
# resin.models.application.getById 89, (error, application) ->
# 	throw error if error?
# 	console.log(application)
###
exports.getById = (id, callback) ->
	return pine.get
		resource: 'application'
		id: id
	.tap (application) ->
		if not application?
			throw new errors.ResinApplicationNotFound(id)
	.nodeify(callback)

###*
# @summary Create an application
# @name create
# @public
# @function
# @memberof resin.models.application
#
# @param {String} name - application name
# @param {String} deviceType - device type (display form)
#
# @returns {Promise<Number>} application id
#
# @example
# resin.models.application.create('My App', 'Raspberry Pi').then (id) ->
# 	console.log(id)
#
# @example
# resin.models.application.create 'My App', 'Raspberry Pi', (error, id) ->
# 	throw error if error?
# 	console.log(id)
###
exports.create = (name, deviceType, callback) ->
	return deviceModel.getDeviceSlug(deviceType)

	.tap (deviceSlug) ->
		if not deviceSlug?
			throw new errors.ResinInvalidDeviceType(deviceType)

	.then (deviceSlug) ->
		return pine.post
			resource: 'application'
			body:
				app_name: name
				device_type: deviceSlug
	.nodeify(callback)

###*
# @summary Remove application
# @name remove
# @public
# @function
# @memberof resin.models.application
#
# @param {String} name - application name
# @returns {Promise}
#
# @example
# resin.models.application.remove('MyApp')
#
# @example
# resin.models.application.remove 'MyApp', (error) ->
# 	throw error if error?
###
exports.remove = (name, callback) ->
	return pine.delete
		resource: 'application'
		options:
			filter:
				app_name: name
	.nodeify(callback)

###*
# @summary Restart application
# @name restart
# @public
# @function
# @memberof resin.models.application
#
# @param {String} name - application name
# @returns {Promise}
#
# @example
# resin.models.application.restart('MyApp')
#
# @example
# resin.models.application.restart 'MyApp', (error) ->
# 	throw error if error?
###
exports.restart = (name, callback) ->
	exports.get(name).then (application) ->
		return request.send
			method: 'POST'
			url: "/application/#{application.id}/restart"
	.return(undefined)
	.nodeify(callback)

###*
# @summary Get the API key for a specific application
# @name getApiKey
# @public
# @function
# @memberof resin.models.application
#
# @param {String} name - application name
# @returns {Promise<String>} the api key
#
# @example
# resin.models.application.getApiKey('MyApp').then (apiKey) ->
# 	console.log(apiKey)
#
# @example
# resin.models.application.getApiKey 'MyApp', (error, apiKey) ->
# 	throw error if error?
# 	console.log(apiKey)
###
exports.getApiKey = (name, callback) ->
	exports.get(name).then (application) ->
		return request.send
			method: 'POST'
			url: "/application/#{application.id}/generate-api-key"
	.get('body')
	.nodeify(callback)
