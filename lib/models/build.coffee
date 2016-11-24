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

getBuildModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application')(deps, opts)

	exports = {}

	###*
	# @summary Get all builds from an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.build
	#
	# @param {String} name - application name
	# @fulfil {Object[]} - builds
	# @returns {Promise}
	#
	# @example
	# resin.models.build.getAllByApplication('MyApp').then(function(builds) {
	#		console.log(builds);
	# });
	#
	# @example
	# resin.models.build.getAllByApplication('MyApp', function(error, builds) {
	#		if (error) throw error;
	#		console.log(builds);
	# });
	###
	exports.getAllByApplication = (name, callback) ->
		applicationModel().has(name).then (hasApplication) ->

			if not hasApplication
				throw new errors.ResinApplicationNotFound(name)

			return pine.get
				resource: 'build'
				filter:
					application: $any:
						$alias: 'a'
						$expr: a: app_name: name
				select: [
					'id'
					'created_at'
					'commit_hash'
					'push_timestamp'
					'start_timestamp'
					'end_timestamp'
					'project_type'
					'status'
					'message'
				]
				expand:
					user:
						$select: [
							'id'
							'username'
						]
				orderby: 'created_at desc'
		.asCallback(callback)

	return exports

module.exports = getBuildModel
