###*
# @module resin.models.application
###

_ = require('lodash-contrib')
errors = require('resin-errors')
request = require('resin-request')
token = require('resin-token')
pine = require('resin-pine')
deviceModel = require('./device')

###*
# A Resin API application
# @typedef {Object} Application
###

###*
# getAll callback
# @callback module:resin.models.application~getAllCallback
# @param {(Error|null)} error - error
# @param {Application[]} applications - applications
###

###*
# @summary Get all applications
# @public
# @function
#
# @param {module:resin.models.application~getAllCallback} callback - callback
#
# @example
#	resin.models.application.getAll (error, applications) ->
#		throw error if error?
#		console.log(applications)
###
exports.getAll = (callback) ->

	if not callback?
		throw new errors.ResinMissingParameter('callback')

	if not _.isFunction(callback)
		throw new errors.ResinInvalidParameter('callback', callback, 'not a function')

	username = token.getUsername()

	if not username?
		return callback(new errors.ResinNotLoggedIn())

	return pine.get
		resource: 'application'
		options:
			orderby: 'app_name asc'
			expand: 'device'

			filter:
				user: { username }

	.then (applications) ->
		if _.isEmpty(applications)
			throw new errors.ResinNotAny('applications')
		return applications

	# TODO: It might be worth to do all these handy
	# manipulations server side directly.
	.map (application) ->
		application.online_devices = _.where(application.device, is_online: true).length
		application.devices_length = application.device?.length or 0
		return application

	.nodeify(callback)

###*
# get callback
# @callback module:resin.models.application~getCallback
# @param {(Error|null)} error - error
# @param {Application} application - application
###

###*
# @summary Get a single application
# @public
# @function
#
# @param {String} name - application name
# @param {module:resin.models.application~getCallback} callback - callback
#
# @example
#	resin.models.application.get 'MyApp', (error, application) ->
#		throw error if error?
#		console.log(application)
###
exports.get = (name, callback) ->

	if not name?
		throw new errors.ResinMissingParameter('name')

	if not _.isString(name)
		throw new errors.ResinInvalidParameter('name', name, 'not a string')

	if not callback?
		throw new errors.ResinMissingParameter('callback')

	if not _.isFunction(callback)
		throw new errors.ResinInvalidParameter('callback', callback, 'not a function')

	username = token.getUsername()

	if not username?
		return callback(new errors.ResinNotLoggedIn())

	return pine.get
		resource: 'application'
		options:
			filter:
				app_name: name
				user: { username }

	.then (application) ->
		if _.isEmpty(application)
			throw new errors.ResinApplicationNotFound(name)
		return _.first(application)
	.nodeify(callback)

###*
# getById callback
# @callback module:resin.models.application~getByIdCallback
# @param {(Error|null)} error - error
# @param {Application} application - application
###

###*
# @summary Get a single application by id
# @public
# @function
#
# @param {(Number|String)} id - application id
# @param {module:resin.models.application~getByIdCallback} callback - callback
#
# @example
#	resin.models.application.getById 89, (error, application) ->
#		throw error if error?
#		console.log(application)
###
exports.getById = (id, callback) ->

	if not id?
		throw new errors.ResinMissingParameter('id')

	if not _.isString(id) and not _.isNumber(id)
		throw new errors.ResinInvalidParameter('id', id, 'not a string not number')

	if not callback?
		throw new errors.ResinMissingParameter('callback')

	if not _.isFunction(callback)
		throw new errors.ResinInvalidParameter('callback', callback, 'not a function')

	if not token.getUsername()?
		return callback(new errors.ResinNotLoggedIn())

	return pine.get
		resource: 'application'
		id: id
	.then (application) ->
		if not application?
			throw new errors.ResinApplicationNotFound(id)
		return application
	.nodeify(callback)

###*
# create callback
# @callback module:resin.models.application~createCallback
# @param {(Error|null)} error - error
# @param {Number} id - application id
###

###*
# @summary Create an application
# @public
# @function
#
# @param {String} name - application name
# @param {String} deviceType - device type (slug form)
# @param {module:resin.models.application~createCallback} callback - callback
#
# @throw {NotFound} Will throw if the request doesn't returns an id
#
# @example
#	resin.models.application.create 'My App', 'raspberry-pi', (error, id) ->
#		throw error if error?
#		console.log(id)
###
exports.create = (name, deviceType, callback) ->

	if not name?
		throw new errors.ResinMissingParameter('name')

	if not _.isString(name)
		throw new errors.ResinInvalidParameter('name', name, 'not a string')

	if not deviceType?
		throw new errors.ResinMissingParameter('deviceType')

	if not _.isString(deviceType)
		throw new errors.ResinInvalidParameter('deviceType', deviceType, 'not a string')

	if not callback?
		throw new errors.ResinMissingParameter('callback')

	if not _.isFunction(callback)
		throw new errors.ResinInvalidParameter('callback', callback, 'not a function')

	if not token.getUsername()?
		return callback(new errors.ResinNotLoggedIn())

	deviceModel.getDeviceSlug deviceType, (error, deviceSlug) ->
		return callback(error) if error?

		if not deviceSlug?
			return callback(new errors.ResinInvalidDeviceType(deviceType))

		return pine.post
			resource: 'application'
			body:
				app_name: name
				device_type: deviceSlug
		.get('id')
		.nodeify(callback)

###*
# remove callback
# @callback module:resin.models.application~removeCallback
# @param {(Error|null)} error - error
###

###*
# @summary Remove application
# @public
# @function
#
# @param {String} name - application name
# @param {module:resin.models.application~removeCallback} callback - callback
#
# @example
#	resin.models.application.remove 'MyApp', (error) ->
#		throw error if error?
###
exports.remove = (name, callback) ->

	if not name?
		throw new errors.ResinMissingParameter('name')

	if not _.isString(name)
		throw new errors.ResinInvalidParameter('name', name, 'not a string')

	if not callback?
		throw new errors.ResinMissingParameter('callback')

	if not _.isFunction(callback)
		throw new errors.ResinInvalidParameter('callback', callback, 'not a function')

	username = token.getUsername()

	if not username?
		return callback(new errors.ResinNotLoggedIn())

	return pine.delete
		resource: 'application'
		options:
			filter:
				app_name: name
				user: { username }
	.nodeify(callback)

###*
# restart callback
# @callback module:resin.models.application~restartCallback
# @param {(Error|null)} error - error
###

###*
# @summary Restart application
# @public
# @function
#
# @param {String} name - application name
# @param {module:resin.models.application~restartCallback} callback - callback
#
# @example
#	resin.models.application.restart 'MyApp', (error) ->
#		throw error if error?
###
exports.restart = (name, callback) ->

	if not callback?
		throw new errors.ResinMissingParameter('callback')

	if not _.isFunction(callback)
		throw new errors.ResinInvalidParameter('callback', callback, 'not a function')

	exports.get name, (error, application) ->
		return callback(error) if error?

		request.request
			method: 'POST'
			url: "/application/#{application.id}/restart"
		, _.unary(callback)
