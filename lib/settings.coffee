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

getSettings = (deps, opts) ->
	{ settings } = deps

	exports = {}

	###*
	# @summary Get a single setting. **Only implemented in Node.js**
	# @name get
	# @function
	# @public
	# @memberof balena.settings
	#
	# @param {String} [key] - setting key
	# @fulfil {*} - setting value
	# @returns {Promise}
	#
	# @example
	# balena.settings.get('apiUrl').then(function(apiUrl) {
	# 	console.log(apiUrl);
	# });
	#
	# @example
	# balena.settings.get('apiUrl', function(error, apiUrl) {
	# 	if (error) throw error;
	# 	console.log(apiUrl);
	# });
	###
	exports.get = (key, callback) ->
		Promise.try ->
			return settings.get(key)
		.asCallback(callback)

	###*
	# @summary Get all settings **Only implemented in Node.js**
	# @name getAll
	# @function
	# @public
	# @memberof balena.settings
	#
	# @fulfil {Object} - settings
	# @returns {Promise}
	#
	# @example
	# balena.settings.getAll().then(function(settings) {
	# 	console.log(settings);
	# });
	#
	# @example
	# balena.settings.getAll(function(error, settings) {
	# 	if (error) throw error;
	# 	console.log(settings);
	# });
	###
	exports.getAll = (callback) ->
		Promise.try ->
			return settings.getAll()
		.asCallback(callback)

	return exports

module.exports = getSettings
