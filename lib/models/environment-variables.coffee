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

pine = require('resin-pine')
deviceModel = require('./device')
applicationModel = require('./application')

###*
# @summary Get all environment variables by application
# @name getAll
# @public
# @function
# @memberof resin.models.environment-variables
#
# @param {String} applicationName - application name
# @fulfil {Object[]} - environment variables
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.getAllByApplication('MyApp').then (environmentVariables) ->
# 	console.log(environmentVariables)
#
# @example
# resin.models.environmentVariables.getAllByApplication 'MyApp', (error, environmentVariables) ->
# 	throw error if error?
# 	console.log(environmentVariables)
###
exports.getAllByApplication = (applicationName, callback) ->
	applicationModel.get(applicationName).get('id').then (applicationId) ->
		return pine.get
			resource: 'environment_variable'
			options:
				filter:
					application: applicationId
				orderby: 'name asc'
	.nodeify(callback)

###*
# @summary Create an environment variable for an application
# @name create
# @public
# @function
# @memberof resin.models.environment-variables
#
# @param {String} applicationName - application name
# @param {String} name - environment variable name
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim')
#
# @example
# resin.models.environmentVariables.create 'MyApp', 'EDITOR', 'vim', (error) ->
# 	throw error if error?
###
exports.create = (applicationName, name, value, callback) ->
	applicationModel.get(applicationName).get('id').then (applicationId) ->
		return pine.post
			resource: 'environment_variable'
			body:
				name: name
				value: value
				application: applicationId
	.nodeify(callback)

###*
# @summary Update an environment variable value from an application
# @name update
# @public
# @function
# @memberof resin.models.environment-variables
#
# @param {(String|Number)} id - environment variable id
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.update(317, 'vim')
#
# @example
# resin.models.environmentVariables.update 317, 'vim', (error) ->
# 	throw error if error?
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
# @name remove
# @public
# @function
# @memberof resin.models.environment-variables
#
# @param {(String|Number)} id - environment variable id
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.remove(51)
#
# @example
# resin.models.environmentVariables.remove 51, (error) ->
# 	throw error if error?
###
exports.remove = (id, callback) ->
	return pine.delete
		resource: 'environment_variable'
		id: id
	.nodeify(callback)

###*
# @summary Check is a variable is system specific
# @name isSystemVariable
# @public
# @function
# @memberof resin.models.environment-variables
#
# @param {Object} variable - environment variable
# @returns {Boolean} Whether a variable is system specific or not
#
# @example
# resin.models.environmentVariables.isSystemVariable(name: 'RESIN_SUPERVISOR')
# > true
#
# @example
# resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
# > false
####
exports.isSystemVariable = (variable) ->
	return /^RESIN_|^RESIN$|^USER$/.test(variable.name)

###*
# @namespace resin.models.environment-variables.device
# @memberof resin.models.environment-variables
###
exports.device = {}

###*
# @summary Get all device environment variables
# @name getAll
# @public
# @function
# @memberof resin.models.environment-variables.device
#
# @param {String} uuid - device uuid
# @fulfil {Object[]} - device environment variables
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.getAll('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (environmentVariables) ->
# 	console.log(environmentVariables)
#
# @example
# resin.models.environmentVariables.device.getAll '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, environmentVariables) ->
# 	throw error if error?
# 	console.log(environmentVariables)
###
exports.device.getAll = (uuid, callback) ->
	deviceModel.get(uuid).then (device) ->
		return pine.get
			resource: 'device_environment_variable'
			options:
				filter:
					device: device.id
				expand: 'device'
				orderby: 'env_var_name asc'
	.map (environmentVariable) ->

		# Workaround to the fact that applications environment variables
		# contains a `name` property, while device environment variables
		# contains an `env_var_name` property instead.
		if environmentVariable.env_var_name?
			environmentVariable.name = environmentVariable.env_var_name
			delete environmentVariable.env_var_name
		return environmentVariable

	.nodeify(callback)

###*
# @summary Create a device environment variable
# @name create
# @public
# @function
# @memberof resin.models.environment-variables.device
#
# @param {String} uuid - device uuid
# @param {String} name - environment variable name
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.create('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'EDITOR', 'vim')
#
# @example
# resin.models.environmentVariables.device.create '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'EDITOR', 'vim', (error) ->
# 	throw error if error?
###
exports.device.create = (uuid, name, value, callback) ->
	deviceModel.get(uuid).then (device) ->
		return pine.post
			resource: 'device_environment_variable'
			body:
				device: device.id
				env_var_name: name
				value: value
	.nodeify(callback)

###*
# @summary Update a device environment variable
# @name update
# @public
# @function
# @memberof resin.models.environment-variables.device
#
# @param {(String|Number)} id - environment variable id
# @param {String} value - environment variable value
#
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.update(2, 'emacs')
#
# @example
# resin.models.environmentVariables.device.update 2, 'emacs', (error) ->
# 	throw error if error?
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
# @name remove
# @public
# @function
# @memberof resin.models.environment-variables.device
#
# @param {(String|Number)} id - environment variable id
# @returns {Promise}
#
# @example
# resin.models.environmentVariables.device.remove(2)
#
# @example
# resin.models.environmentVariables.device.remove 2, (error) ->
# 	throw error if error?
###
exports.device.remove = (id, callback) ->
	return pine.delete
		resource: 'device_environment_variable'
		id: id
	.nodeify(callback)
