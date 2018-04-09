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

	return exports

module.exports = getApiKeysModel
