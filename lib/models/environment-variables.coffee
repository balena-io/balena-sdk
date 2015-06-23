###*
# @module resin.models.environment-variables
###

_ = require('lodash')
errors = require('resin-errors')
pine = require('resin-pine')
deviceModel = require('./device')

###*
# @summary Get all environment variables by application
# @public
# @function
#
# @param {(String|Number)} applicationId - application id
# @returns {Promise<Object[]>} environment variables
#
# @example
# resin.models.environmentVariables.getAll().then (environmentVariables) ->
# 	console.log(environmentVariables)
###
exports.getAllByApplication = (applicationId, callback) ->
	return pine.get
		resource: 'environment_variable'
		options:
			filter:
				application: applicationId
			orderby: 'name asc'
	.nodeify(callback)

###*
# @summary Create an environment variable for an application
# @public
# @function
#
# @param {(String|Number)} applicationId - application id
# @param {String} name - environment variable name
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.create(91, 'EDITOR', 'vim')
###
exports.create = (applicationId, name, value, callback) ->
	return pine.post
		resource: 'environment_variable'
		body:
			name: name
			value: value
			application: applicationId
	.nodeify(callback)

###*
# @summary Update an environment variable value from an application
# @public
# @function
#
# @param {(String|Number)} applicationId - application id
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.update(317, 'vim')
###
exports.update = (id, value, callback) ->
	return pine.patch
		resource: 'environment_variable'
		id: id
		body:
			value: value
	.nodeify(callback)

###*
# @summary Remove environment variable
# @public
# @function
#
# @param {(String|Number)} id - environment variable id
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.remove(51)
###
exports.remove = (id, callback) ->
	return pine.delete
		resource: 'environment_variable'
		id: id
	.nodeify(callback)

###*
# @summary Check is a variable is system specific
# @public
# @function
#
# @param {EnvironmentVariable} variable - environment variable
# @returns {Boolean} Whether a variable is system specific or not
#
# @example
# resin.models.environmentVariables.isSystemVariable('RESIN_SUPERVISOR')
# > true
#
# @example
# resin.models.environmentVariables.isSystemVariable('EDITOR')
# > false
####
exports.isSystemVariable = (variable) ->
	return /^RESIN_/.test(variable.name)

exports.device = {}

###*
# @summary Get all device environment variables
# @public
# @function
#
# @param {String} deviceName - device name
# @returns {Promise<Object[]>} device environment variables
#
# @example
# resin.models.environmentVariables.device.getAll('MyDevice').then (environmentVariables) ->
# 	console.log(environmentVariables)
###
exports.device.getAll = (deviceName, callback) ->
	deviceModel.get(deviceName).then (device) ->
		return pine.get
			resource: 'device_environment_variable'
			options:
				filter:
					device: device.id
				expand: 'device'
				orderby: 'env_var_name asc'
	.tap (environmentVariables) ->
		if _.isEmpty(environmentVariables)
			throw new errors.ResinNotAny('device environment variables')

	.map (environmentVariable) ->
		environmentVariable.name = environmentVariable.env_var_name
		return environmentVariable

	.nodeify(callback)

###*
# @summary Create a device environment variable
# @public
# @function
#
# @param {String} deviceName - device name
# @param {String} name - environment variable name
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.create('MyDevice', 'EDITOR', 'vim')
###
exports.device.create = (deviceName, name, value, callback) ->
	deviceModel.get(deviceName).then (device) ->
		return pine.post
			resource: 'device_environment_variable'
			body:
				device: device.id
				env_var_name: name
				value: value
	.nodeify(callback)

###*
# @summary Update a device environment variable
# @public
# @function
#
# @param {(String|Number)} id - environment variable id
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.update(2, 'emacs')
###
exports.device.update = (id, value, callback) ->
	return pine.patch
		resource: 'device_environment_variable'
		id: id
		body:
			value: value
	.nodeify(callback)

###*
# @summary Remove a device environment variable
# @public
# @function
#
# @param {(String|Number)} id - environment variable id
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.remove(2)
###
exports.device.remove = (id, callback) ->
	return pine.delete
		resource: 'device_environment_variable'
		id: id
	.nodeify(callback)
