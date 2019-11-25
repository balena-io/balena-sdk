###
Copyright 2017 Balena

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

once = require('lodash/once')
errors = require('balena-errors')

{ findCallback, mergePineOptions } = require('../util')

getImageModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application').default(deps, opts)

	exports = {}

	###*
	# @summary Get a specific image
	# @name get
	# @public
	# @function
	# @memberof balena.models.image
	#
	# @param {Number} id - image id
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - image
	# @returns {Promise}
	#
	# @example
	# balena.models.image.get(123).then(function(image) {
	#		console.log(image);
	# });
	#
	# @example
	# balena.models.image.get(123, function(error, image) {
	#		if (error) throw error;
	#		console.log(image);
	# });
	###
	exports.get = (id, options = {}, callback) ->
		callback = findCallback(arguments)

		return pine.get
			resource: 'image'
			id: id
			options: mergePineOptions
				$select: [
					# Select all the interesting fields *except* build_log
					# (which can be very large)
					'id'
					'content_hash'
					'dockerfile'
					'project_type'
					'status'
					'error_message'
					'image_size'
					'created_at'
					'push_timestamp'
					'start_timestamp'
					'end_timestamp'
				]
			, options
		.tap (image) ->
			if not image?
				throw new errors.BalenaImageNotFound(id)
		.asCallback(callback)

	###*
	# @summary Get the logs for an image
	# @name getLogs
	# @public
	# @function
	# @memberof balena.models.image
	#
	# @param {Number} id - image id
	# @fulfil {string} - logs
	# @returns {Promise}
	#
	# @example
	# balena.models.image.getLogs(123).then(function(logs) {
	#		console.log(logs);
	# });
	#
	# @example
	# balena.models.image.getLogs(123, function(error, logs) {
	#		if (error) throw error;
	#		console.log(logs);
	# });
	###
	exports.getLogs = (id, callback) ->
		return exports.get(id, $select: 'build_log')
		.get('build_log')
		.asCallback(callback)

	return exports

module.exports =
	default: getImageModel
