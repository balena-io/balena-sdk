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

getReleaseModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application')(deps, opts)

	exports = {}

	###*
	# @summary Get a specific release
	# @name get
	# @public
	# @function
	# @memberof resin.models.release
	#
	# @param {Number} id - release id
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - release
	# @returns {Promise}
	#
	# @example
	# resin.models.release.get(123).then(function(release) {
	#		console.log(release);
	# });
	#
	# @example
	# resin.models.release.get(123, function(error, release) {
	#		if (error) throw error;
	#		console.log(release);
	# });
	###
	exports.get = (id, options = {}, callback) ->
		callback = findCallback(arguments)

		return pine.get
			resource: 'release'
			id: id
			options: mergePineOptions({}, options)
		.tap (release) ->
			if not release?
				throw new errors.ResinReleaseNotFound(id)
		.asCallback(callback)

	###*
	# @summary Get all releases from an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.release
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - releases
	# @returns {Promise}
	#
	# @example
	# resin.models.release.getAllByApplication('MyApp').then(function(releases) {
	#		console.log(releases);
	# });
	#
	# @example
	# resin.models.release.getAllByApplication(123).then(function(releases) {
	#		console.log(releases);
	# });
	#
	# @example
	# resin.models.release.getAllByApplication('MyApp', function(error, releases) {
	#		if (error) throw error;
	#		console.log(releases);
	# });
	###
	exports.getAllByApplication = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		applicationModel().get(nameOrId, select: 'id')
		.then ({ id }) ->
			return pine.get
				resource: 'release'
				options:
					mergePineOptions
						filter:
							belongs_to__application: id
						orderby: 'created_at desc'
					, options
		.asCallback(callback)

	return exports

module.exports = getReleaseModel
