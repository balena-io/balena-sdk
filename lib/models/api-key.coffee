###
Copyright 2018 Resin.io

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
isString = require('lodash/isString')
pick = require('lodash/pick')
errors = require('resin-errors')

{ findCallback, mergePineOptions } = require('../util')

getApiKeysModel = (deps, opts) ->
	{ pine, request } = deps
	{ apiUrl } = opts

	exports = {}

	###*
	# @summary Creates a new user API key
	# @name create
	# @public
	# @function
	# @memberof resin.models.apiKey
	#
	# @description This method registers a new api key for the current user with the name given.
	#
	# @param {String} name - the API key name
	# @param {String} [description=null] - the API key description
	#
	# @fulfil {String} - API key
	# @returns {Promise}
	#
	# @example
	# resin.models.apiKey.create(apiKeyName).then(function(apiKey) {
	# 	console.log(apiKey);
	# });
	#
	# @example
	# resin.models.apiKey.create(apiKeyName, apiKeyDescription).then(function(apiKey) {
	# 	console.log(apiKey);
	# });
	#
	# @example
	# resin.models.apiKey.create(apiKeyName, function(error, apiKey) {
	# 	if (error) throw error;
	# 	console.log(apiKey);
	# });
	###
	exports.create = (name, description = null, callback) ->
		callback = findCallback(arguments)

		apiKeyBody =
			name: name

		if isString(description) and !!description
			apiKeyBody.description = description

		request.send
			method: 'POST'
			url: '/api-key/user/full'
			baseUrl: apiUrl
			body: apiKeyBody
		.get('body')
		.catch ->
			throw new errors.ResinNotLoggedIn()
		.asCallback(callback)

	###*
	# @summary Get all API keys
	# @name getAll
	# @public
	# @function
	# @memberof resin.models.apiKey
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - apiKeys
	# @returns {Promise}
	#
	# @example
	# resin.models.apiKey.getAll().then(function(apiKeys) {
	# 	console.log(apiKeys);
	# });
	#
	# @example
	# resin.models.apiKey.getAll(function(error, apiKeys) {
	# 	if (error) throw error;
	# 	console.log(apiKeys);
	# });
	###
	exports.getAll = (options = {}, callback) ->
		callback = findCallback(arguments)

		return pine.get
			resource: 'api_key'
			options:
				mergePineOptions
					# the only way to reason whether
					# it's a named user api key is whether
					# it has a name
					$filter: name: $ne: null
					$orderby: 'name asc'
				, options

		.asCallback(callback)

	###*
	# @summary Update the details of an API key
	# @name update
	# @public
	# @function
	# @memberof resin.models.apiKey
	#
	# @param {Number} id - API key id
	# @param {Object} apiKeyInfo - an object with the updated name or description
	# @returns {Promise}
	#
	# @example
	# resin.models.apiKey.update(123, { name: 'updatedName' });
	#
	# @example
	# resin.models.apiKey.update(123, { description: 'updated description' });
	#
	# @example
	# resin.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
	#
	# @example
	# resin.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' }, function(error, apiKeys) {
	# 	if (error) throw error;
	# 	console.log(apiKeys);
	# });
	###
	exports.update = (id, apiKeyInfo, callback) ->
		Promise.try ->
			if not apiKeyInfo
				throw new errors.ResinInvalidParameterError('apiKeyInfo', apiKeyInfo)

			if apiKeyInfo.name == null or apiKeyInfo.name == ''
				throw new errors.ResinInvalidParameterError('apiKeyInfo.name', apiKeyInfo.name)

			return pine.patch
				resource: 'api_key'
				id: id
				body: pick(apiKeyInfo
					[
						'name'
						'description'
					]
				)
				options:
					# the only way to reason whether
					# it's a named user api key is whether
					# it has a name
					$filter: name: $ne: null
		.asCallback(callback)

	###*
	# @summary Revoke an API key
	# @name revoke
	# @public
	# @function
	# @memberof resin.models.apiKey
	#
	# @param {Number} id - API key id
	# @returns {Promise}
	#
	# @example
	# resin.models.apiKey.revoke(123);
	#
	# @example
	# resin.models.apiKey.revoke(123, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.revoke = (id, callback) ->
		return pine.delete
			resource: 'api_key'
			id: id
			options:
				# so that we don't accidentally delete
				# a non named user api key
				$filter: name: $ne: null

		.asCallback(callback)

	return exports

module.exports = getApiKeysModel
