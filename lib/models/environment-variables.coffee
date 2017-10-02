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
errors = require('resin-errors')
once = require('lodash/once')

getEnvironmentVariablesModel = (deps, opts) ->
	{ pine } = deps

	deviceModel = once -> require('./device')(deps, opts)
	applicationModel = once -> require('./application')(deps, opts)

	exports = {}

	isValidName = (envVarName) ->
		/^[a-zA-Z_]+[a-zA-Z0-9_]*$/.exec(envVarName)?

	###*
	# @summary Get all environment variables by application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.environment-variables
	#
	# @param {String|Number} applicationNameOrId - application name (string) or id (number)
	# @fulfil {Object[]} - environment variables
	# @returns {Promise}
	#
	# @example
	# resin.models.environmentVariables.getAllByApplication('MyApp').then(function(environmentVariables) {
	# 	console.log(environmentVariables);
	# });
	#
	# @example
	# resin.models.environmentVariables.getAllByApplication(123).then(function(environmentVariables) {
	# 	console.log(environmentVariables);
	# });
	#
	# @example
	# resin.models.environmentVariables.getAllByApplication('MyApp', function(error, environmentVariables) {
	# 	if (error) throw error;
	# 	console.log(environmentVariables);
	# });
	###
	exports.getAllByApplication = (applicationNameOrId, callback) ->
		applicationModel().get(applicationNameOrId, select: 'id').then ({ id }) ->
			return pine.get
				resource: 'environment_variable'
				options:
					filter:
						application: id
					orderby: 'name asc'
		.asCallback(callback)

	###*
	# @summary Create an environment variable for an application
	# @name create
	# @public
	# @function
	# @memberof resin.models.environment-variables
	#
	# @param {String|Number} applicationNameOrId - application name (string) or id (number)
	# @param {String} envVarName - environment variable name
	# @param {String} value - environment variable value
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim');
	#
	# @example
	# resin.models.environmentVariables.create(123, 'EDITOR', 'vim');
	#
	# @example
	# resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.create = (applicationNameOrId, envVarName, value, callback) ->
		Promise.try ->
			if not isValidName(envVarName)
				throw new errors.ResinInvalidParameterError('envVarName', envVarName)

			applicationModel().get(applicationNameOrId, select: 'id').then ({ id }) ->
				return pine.post
					resource: 'environment_variable'
					body:
						name: envVarName
						value: String(value)
						application: id
		.asCallback(callback)

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
	# resin.models.environmentVariables.update(317, 'vim');
	#
	# @example
	# resin.models.environmentVariables.update(317, 'vim', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.update = (id, value, callback) ->
		return pine.patch
			resource: 'environment_variable'
			id: id
			body:
				value: value
		.asCallback(callback)

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
	# resin.models.environmentVariables.remove(51);
	#
	# @example
	# resin.models.environmentVariables.remove(51, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.remove = (id, callback) ->
		return pine.delete
			resource: 'environment_variable'
			id: id
		.asCallback(callback)

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
	# resin.models.environmentVariables.isSystemVariable({
	# 	name: 'RESIN_SUPERVISOR'
	# });
	# > true
	#
	# @example
	# resin.models.environmentVariables.isSystemVariable({
	# 	name: 'EDITOR'
	# });
	# > false
	####
	exports.isSystemVariable = (variable) ->
		return /^RESIN_|^RESIN$|^USER$/.test(variable.name)

	# Internal method to workaround the fact that applications
	# environment variables contain a `name` property, while
	# device environment variables contain an `env_var_name`
	# property instead.
	fixDeviceEnvVarNameKey = (environmentVariable) ->
		if environmentVariable.env_var_name?
			environmentVariable.name = environmentVariable.env_var_name
			delete environmentVariable.env_var_name
		return environmentVariable

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
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {Object[]} - device environment variables
	# @returns {Promise}
	#
	# @example
	# resin.models.environmentVariables.device.getAll('7cf02a6').then(function(environmentVariables) {
	# 	console.log(environmentVariables);
	# });
	#
	# @example
	# resin.models.environmentVariables.device.getAll(123).then(function(environmentVariables) {
	# 	console.log(environmentVariables);
	# });
	#
	# @example
	# resin.models.environmentVariables.device.getAll('7cf02a6', function(error, environmentVariables) {
	# 	if (error) throw error;
	# 	console.log(environmentVariables)
	# });
	###
	exports.device.getAll = (uuidOrId, callback) ->
		deviceModel().get(uuidOrId, select: 'id').then ({ id }) ->
			return pine.get
				resource: 'device_environment_variable'
				options:
					filter: device: id
					orderby: 'env_var_name asc'
		.map(fixDeviceEnvVarNameKey)
		.asCallback(callback)

	###*
	# @summary Get all device environment variables for an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.environment-variables.device
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @fulfil {Object[]} - device environment variables
	# @returns {Promise}
	#
	# @example
	# resin.models.environmentVariables.device.getAllByApplication('MyApp').then(function(environmentVariables) {
	# 	console.log(environmentVariables);
	# });
	#
	# @example
	# resin.models.environmentVariables.device.getAllByApplication(999999).then(function(environmentVariables) {
	# 	console.log(environmentVariables);
	# });
	#
	# @example
	# resin.models.environmentVariables.device.getAllByApplication('MyApp', function(error, environmentVariables) {
	# 	if (error) throw error;
	# 	console.log(environmentVariables)
	# });
	###
	exports.device.getAllByApplication = (nameOrId, callback) ->
		applicationModel().get(nameOrId, select: 'id').then ({ id }) ->
			return pine.get
				resource: 'device_environment_variable'
				options:
					filter:
						device:
							$any:
								$alias: 'd',
								$expr: d: application: id
					orderby: 'env_var_name asc'
		.map(fixDeviceEnvVarNameKey)
		.asCallback(callback)

	###*
	# @summary Create a device environment variable
	# @name create
	# @public
	# @function
	# @memberof resin.models.environment-variables.device
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @param {String} envVarName - environment variable name
	# @param {String} value - environment variable value
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.environmentVariables.device.create('7cf02a6', 'EDITOR', 'vim');
	#
	# @example
	# resin.models.environmentVariables.device.create(123, 'EDITOR', 'vim');
	#
	# @example
	# resin.models.environmentVariables.device.create('7cf02a6', 'EDITOR', 'vim', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.device.create = (uuidOrId, envVarName, value, callback) ->
		Promise.try ->
			if not isValidName(envVarName)
				throw new errors.ResinInvalidParameterError('envVarName', envVarName)

			deviceModel().get(uuidOrId, select: 'id').then ({ id }) ->
				return pine.post
					resource: 'device_environment_variable'
					body:
						device: id
						env_var_name: envVarName
						value: String(value)
			.then(fixDeviceEnvVarNameKey)
		.asCallback(callback)

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
	# resin.models.environmentVariables.device.update(2, 'emacs');
	#
	# @example
	# resin.models.environmentVariables.device.update(2, 'emacs', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.device.update = (id, value, callback) ->
		return pine.patch
			resource: 'device_environment_variable'
			id: id
			body:
				value: value
		.then(fixDeviceEnvVarNameKey)
		.asCallback(callback)

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
	# resin.models.environmentVariables.device.remove(2);
	#
	# @example
	# resin.models.environmentVariables.device.remove(2, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.device.remove = (id, callback) ->
		return pine.delete
			resource: 'device_environment_variable'
			id: id
		.asCallback(callback)

	return exports

module.exports = getEnvironmentVariablesModel
