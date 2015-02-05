###*
# @module resin.models.application
###

_ = require('lodash-contrib')
pine = require('../pine')
deviceModel = require('./device')
errors = require('../errors')
server = require('../server')
settings = require('../settings')

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
	return pine.get
		resource: 'application'
		options:
			orderby: 'app_name asc'
			expand: 'device'
	.then (applications) ->
		if _.isEmpty(applications)
			return callback(new errors.ResinNotAny('applications'))

		# TODO: It might be worth to do all these handy
		# manipulations server side directly.
		applications = _.map applications, (application) ->
			application.online_devices = _.where(application.device, is_online: 1).length
			application.devices_length = application.device?.length or 0
			return application

		return callback(null, applications)

	.catch (error) ->
		return callback(error)

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
# @param {(String|Number)} id - application id
# @param {module:resin.models.application~getCallback} callback - callback
#
# @example
#	resin.models.application.get 51, (error, application) ->
#		throw error if error?
#		console.log(application)
###
exports.get = (id, callback) ->
	return pine.get
		resource: 'application'
		id: id

	.then (application) ->
		if not application?
			return callback(new errors.ResinApplicationNotFound(id))

		return callback(null, application)

	.catch (error) ->
		return callback(error)

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
	slugifiedType = deviceModel.getDeviceSlug(deviceType)

	# TODO: Detecting an unknown device type by comparing
	# to this string looks like a terrible approach. Fix.
	if slugifiedType is 'unknown'
		return callback(new errors.ResinInvalidDeviceType(deviceType))

	return pine.post
		resource: 'application'
		data:
			app_name: name
			device_type: slugifiedType

	.then (res) ->
		return callback(null, res.id)

	.catch (error) ->
		return callback(error)

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
# @param {(String|Number)} id - application id
# @param {module:resin.models.application~removeCallback} callback - callback
#
# @example
#	resin.models.application.remove 51, (error) ->
#		throw error if error?
###
exports.remove = (id, callback) ->
	return pine.delete
		resource: 'application'
		id: id
	.then ->
		return callback()
	.catch (error) ->
		return callback(error)

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
# @param {(String|Number)} id - application id
# @param {module:resin.models.application~restartCallback} callback - callback
#
# @example
#	resin.models.application.restart 51, (error) ->
#		throw error if error?
###
exports.restart = (id, callback) ->
	url = _.template(settings.get('urls.applicationRestart'), { id })
	server.post(url, _.unary(callback))
