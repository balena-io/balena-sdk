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

once = require('lodash/once')
errors = require('resin-errors')

{ findCallback, mergePineOptions } = require('../util')

getBuildModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application')(deps, opts)

	exports = {}

	###*
	# @summary Get a specific build
	# @name get
	# @public
	# @function
	# @memberof resin.models.build
	#
	# @param {Number} id - build id
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - build
	# @returns {Promise}
	#
	# @example
	# resin.models.build.get(123).then(function(build) {
	#		console.log(build);
	# });
	#
	# @example
	# resin.models.build.get(123, function(error, build) {
	#		if (error) throw error;
	#		console.log(build);
	# });
	###
	exports.get = (id, options = {}, callback) ->
		callback = findCallback(arguments)

		return pine.get
			resource: 'build'
			id: id
			options: mergePineOptions({}, options)
		.tap (build) ->
			if not build?
				throw new errors.ResinBuildNotFound(id)
		.asCallback(callback)

	###*
	# @summary Get all builds from an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.build
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - builds
	# @returns {Promise}
	#
	# @example
	# resin.models.build.getAllByApplication('MyApp').then(function(builds) {
	#		console.log(builds);
	# });
	#
	# @example
	# resin.models.build.getAllByApplication(123).then(function(builds) {
	#		console.log(builds);
	# });
	#
	# @example
	# resin.models.build.getAllByApplication('MyApp', function(error, builds) {
	#		if (error) throw error;
	#		console.log(builds);
	# });
	###
	exports.getAllByApplication = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		applicationModel().get(nameOrId, select: 'id').then ({ id }) ->

			return pine.get
				resource: 'build'
				options:
					mergePineOptions
						filter:
							application: id
						select: [
							'id'
							'created_at'
							'commit_hash'
							'push_timestamp'
							'start_timestamp'
							'end_timestamp'
							'update_timestamp'
							'project_type'
							'source'
							'status'
							'message'
							# 'log' # We *don't* include logs by default, since it's usually huge.
						]
						orderby: 'created_at desc'
					, options
		.asCallback(callback)

	return exports

module.exports = getBuildModel
