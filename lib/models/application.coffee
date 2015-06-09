###*
# @module resin.models.application
###

Promise = require('bluebird')
async = require('async')
_ = require('lodash-contrib')
errors = require('resin-errors')
request = Promise.promisifyAll(require('resin-request'))
token = require('resin-token')
pine = require('resin-pine')
network = require('resin-network-config')
deviceModel = require('./device')
auth = require('../auth')

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
	Promise.try ->
		username = token.getUsername()
		throw new errors.ResinNotLoggedIn() if not username?

		return pine.get
			resource: 'application'
			options:
				orderby: 'app_name asc'
				expand: 'device'

				filter:
					user: { username }

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
	Promise.try ->
		username = token.getUsername()
		throw new errors.ResinNotLoggedIn() if not username?

		return pine.get
			resource: 'application'
			options:
				filter:
					app_name: name
					user: { username }

	.tap (application) ->
		if _.isEmpty(application)
			throw new errors.ResinApplicationNotFound(name)
	.get(0)
	.nodeify(callback)

###*
# has callback
# @callback module:resin.models.application~hasCallback
# @param {(Error|null)} error - error
# @param {Boolean} has - has application
###

###*
# @summary Check if an application exist
# @public
# @function
#
# @param {String} name - application name
# @param {module:resin.models.application~hasCallback} callback - callback
#
# @example
#	resin.models.application.has 'MyApp', (error, hasApp) ->
#		throw error if error?
#		console.log(hasApp)
###
exports.has = (name, callback) ->
	exports.get(name).return(true)
	.catch errors.ResinApplicationNotFound, ->
		return false
	.nodeify(callback)

###*
# hasAny callback
# @callback module:resin.models.application~hasAnyCallback
# @param {(Error|null)} error - error
# @param {Boolean} hasAny - has any application
###

###*
# @summary Check if the user has any applications
# @public
# @function
#
# @param {module:resin.models.application~hasAnyCallback} callback - callback
#
# @example
#	resin.models.application.hasAny (error, hasAny) ->
#		throw error if error?
#		console.log("Has any? #{hasAny}")
###
exports.hasAny = (callback) ->
	exports.getAll().then (applications) ->
		return not _.isEmpty(applications)
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
	Promise.try ->
		if not token.getUsername()?
			throw new errors.ResinNotLoggedIn()

		return pine.get
			resource: 'application'
			id: id
	.tap (application) ->
		if not application?
			throw new errors.ResinApplicationNotFound(id)
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
	Promise.try ->
		if not token.getUsername()?
			throw new errors.ResinNotLoggedIn()

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
	Promise.try ->
		username = token.getUsername()
		throw new errors.ResinNotLoggedIn() if not username?

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
	exports.get(name).then (application) ->
		return request.requestAsync
			method: 'POST'
			url: "/application/#{application.id}/restart"
	.nodeify(_.unary(callback))

###*
# getApiKey callback
# @callback module:resin.models.application~getApiKeyCallback
# @param {(Error|null)} error - error
# @param {String} apiKey - the api key
###

###*
# @summary Get the API key for a specific application
# @public
# @function
#
# @param {String} name - application name
# @param {module:resin.models.application~getApiKeyCallback} callback - callback
#
# @example
#	resin.models.application.getApiKey 'MyApp', (error, apiKey) ->
#		throw error if error?
#		console.log(apiKey)
###
exports.getApiKey = (name, callback) ->
	exports.get(name).then (application) ->
		return request.requestAsync
			method: 'POST'
			url: "/application/#{application.id}/generate-api-key"
	.get('body')
	.nodeify(callback)

###*
# getConfiguration callback
# @callback module:resin.models.application~getConfigurationCallback
# @param {(Error|null)} error - error
# @param {Object} configuration - application configuration
###

###*
# @summary Get an application device configuration
# @public
# @function
#
# @param {String} name - application name
# @param {Object} [options={}] - options
# @param {String} [options.wifiSsid] - wifi ssid
# @param {String} [options.wifiKey] - wifi key
# @param {module:resin.models.application~getConfigurationCallback} callback - callback
#
# @example
#	resin.models.application.getConfiguration 'MyApp',
#		wifiSsid: 'foobar'
#		wifiKey: 'hello'
#	, (error, configuration) ->
#		throw error if error?
#		console.log(configuration)
###
exports.getConfiguration = (name, options = {}, callback) ->
	Promise.all([
		exports.gek(name)
		exports.getApiKey(name)
		auth.getUserId()
		auth.whoami()
	]).spread (application, apiKey, userId, username) ->
		throw new errors.ResinNotLoggedIn() if not username?

		return {
			applicationId: String(application.id)
			apiKey: apiKey
			deviceType: application.device_type
			userId: String(userId)
			username: username
			wifiSsid: options.wifiSsid
			wifiKey: options.wifiKey
			files: network.getFiles(options)
		}
	.nodeify(callback)
