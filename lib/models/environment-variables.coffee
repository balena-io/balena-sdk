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

pine = require('resin-pine')
settings = require('../settings')
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
# resin.models.environmentVariables.getAllByApplication('MyApp').then(function(environmentVariables) {
# 	console.log(environmentVariables);
# });
#
# @example
# resin.models.environmentVariables.getAllByApplication('MyApp', function(error, environmentVariables) {
# 	if (error) throw error;
# 	console.log(environmentVariables);
# });
###
exports.getAllByApplication = (applicationName, callback) ->
	applicationModel.get(applicationName).get('id').then (applicationId) ->
		return pine.get
			apiPrefix: settings.get('pineUrl')
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
# resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim');
#
# @example
# resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim', function(error) {
# 	if (error) throw error;
# });
###
exports.create = (applicationName, name, value, callback) ->
	applicationModel.get(applicationName).get('id').then (applicationId) ->
		return pine.post
			apiPrefix: settings.get('pineUrl')
			resource: 'environment_variable'
			body:
				name: name
				value: String(value)
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
# resin.models.environmentVariables.update(317, 'vim');
#
# @example
# resin.models.environmentVariables.update(317, 'vim', function(error) {
# 	if (error) throw error;
# });
###
exports.update = (id, value, callback) ->
	return pine.patch
		apiPrefix: settings.get('pineUrl')
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
# resin.models.environmentVariables.remove(51);
#
# @example
# resin.models.environmentVariables.remove(51, function(error) {
# 	if (error) throw error;
# });
###
exports.remove = (id, callback) ->
	return pine.delete
		apiPrefix: settings.get('pineUrl')
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
# resin.models.environmentVariables.device.getAll('7cf02a6').then(function(environmentVariables) {
# 	console.log(environmentVariables);
# });
#
# @example
# resin.models.environmentVariables.device.getAll('7cf02a6', function(error, environmentVariables) {
# 	if (error) throw error;
# 	console.log(environmentVariables)
# });
###
exports.device.getAll = (uuid, callback) ->
	deviceModel.get(uuid).then (device) ->
		return pine.get
			apiPrefix: settings.get('pineUrl')
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
# resin.models.environmentVariables.device.create('7cf02a6', 'EDITOR', 'vim');
#
# @example
# resin.models.environmentVariables.device.create('7cf02a6', 'EDITOR', 'vim', function(error) {
# 	if (error) throw error;
# });
###
exports.device.create = (uuid, name, value, callback) ->
	deviceModel.get(uuid).then (device) ->
		return pine.post
			apiPrefix: settings.get('pineUrl')
			resource: 'device_environment_variable'
			body:
				device: device.id
				env_var_name: name
				value: String(value)
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
# resin.models.environmentVariables.device.update(2, 'emacs');
#
# @example
# resin.models.environmentVariables.device.update(2, 'emacs', function(error) {
# 	if (error) throw error;
# });
###
exports.device.update = (id, value, callback) ->
	return pine.patch
		apiPrefix: settings.get('pineUrl')
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
# resin.models.environmentVariables.device.remove(2);
#
# @example
# resin.models.environmentVariables.device.remove(2, function(error) {
# 	if (error) throw error;
# });
###
exports.device.remove = (id, callback) ->
	return pine.delete
		apiPrefix: settings.get('pineUrl')
		resource: 'device_environment_variable'
		id: id
	.nodeify(callback)
