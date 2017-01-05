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
isEmpty = require('lodash/isEmpty')
errors = require('resin-errors')

getKeyModel = (deps, opts) ->
	{ pine } = deps

	auth = require('../auth')(deps, opts)

	exports = {}

	###*
	# @summary Get all ssh keys
	# @name getAll
	# @public
	# @function
	# @memberof resin.models.key
	#
	# @fulfil {Object[]} - ssh keys
	# @returns {Promise}
	#
	# @example
	# resin.models.key.getAll().then(function(keys) {
	# 	console.log(keys);
	# });
	#
	# @example
	# resin.models.key.getAll(function(error, keys) {
	# 	if (error) throw error;
	# 	console.log(keys);
	# });
	###
	exports.getAll = (callback) ->
		return pine.get
			resource: 'user__has__public_key'
		.asCallback(callback)

	###*
	# @summary Get a single ssh key
	# @name get
	# @public
	# @function
	# @memberof resin.models.key
	#
	# @param {(String|Number)} id - key id
	# @fulfil {Object} - ssh key
	# @returns {Promise}
	#
	# @example
	# resin.models.key.get(51).then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# resin.models.key.get(51, function(error, key) {
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
				throw new errors.ResinKeyNotFound(id)
		.asCallback(callback)

	###*
	# @summary Remove ssh key
	# @name remove
	# @public
	# @function
	# @memberof resin.models.key
	#
	# @param {(String|Number)} id - key id
	# @returns {Promise}
	#
	# @example
	# resin.models.key.remove(51);
	#
	# @example
	# resin.models.key.remove(51, function(error) {
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
	# @memberof resin.models.key
	#
	# @param {String} title - key title
	# @param {String} key - the public ssh key
	#
	# @fulfil {Object} - ssh key
	# @returns {Promise}
	#
	# @example
	# resin.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	# 	console.log(key);
	# });
	#
	# @example
	# resin.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, key) {
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

module.exports = getKeyModel
