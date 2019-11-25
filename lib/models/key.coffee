###
Copyright 2016 Balena

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
isEmpty = require('lodash/isEmpty')
errors = require('balena-errors')

{ findCallback, mergePineOptions } = require('../util')

getKeyModel = (deps, opts) ->
	{ pine, sdkInstance: { auth } } = deps

	exports = {}

	###*
	# @summary Get all ssh keys
	# @name getAll
	# @public
	# @function
	# @memberof balena.models.key
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - ssh keys
	# @returns {Promise}
	#
	# @example
	# balena.models.key.getAll().then(function(keys) {
	# 	console.log(keys);
	# });
	#
	# @example
	# balena.models.key.getAll(function(error, keys) {
	# 	if (error) throw error;
	# 	console.log(keys);
	# });
	###
	exports.getAll = (options = {}, callback) ->
		callback = findCallback(arguments)
		return pine.get
			resource: 'user__has__public_key'
			options: mergePineOptions({}, options)
		.asCallback(callback)

	###*
	# @summary Get a single ssh key
	# @name get
	# @public
	# @function
	# @memberof balena.models.key
	#
	# @param {(String|Number)} id - key id
	# @fulfil {Object} - ssh key
	# @returns {Promise}
	#
	# @example
	# balena.models.key.get(51).then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# balena.models.key.get(51, function(error, key) {
	# 	if (error) throw error;
	# 	console.log(key);
	# });
	###
	exports.get = (id, callback) ->
		return pine.get
			resource: 'user__has__public_key'
			id: id
		.tap (key) ->
			if isEmpty(key)
				throw new errors.BalenaKeyNotFound(id)
		.asCallback(callback)

	###*
	# @summary Remove ssh key
	# @name remove
	# @public
	# @function
	# @memberof balena.models.key
	#
	# @param {(String|Number)} id - key id
	# @returns {Promise}
	#
	# @example
	# balena.models.key.remove(51);
	#
	# @example
	# balena.models.key.remove(51, function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.remove = (id, callback) ->
		return pine.delete
			resource: 'user__has__public_key'
			id: id
		.asCallback(callback)

	###*
	# @summary Create a ssh key
	# @name create
	# @public
	# @function
	# @memberof balena.models.key
	#
	# @param {String} title - key title
	# @param {String} key - the public ssh key
	#
	# @fulfil {Object} - ssh key
	# @returns {Promise}
	#
	# @example
	# balena.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# balena.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, key) {
	# 	if (error) throw error;
	# 	console.log(key);
	# });
	###
	exports.create = (title, key, callback) ->
		Promise.try ->
			# Avoid ugly whitespaces
			key = key.trim()

			auth.getUserId().then (userId) ->
				return pine.post
					resource: 'user__has__public_key'
					body:
						title: title
						public_key: key
						user: userId
		.asCallback(callback)

	return exports

module.exports =
	default: getKeyModel
