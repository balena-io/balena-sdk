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
omit = require('lodash/omit')
errors = require('resin-errors')
Promise = require('bluebird')

{ findCallback, mergePineOptions } = require('../util')

getReleaseModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application')(deps, opts)

	{ buildDependentResource } = require('../util/dependent-resource')

	tagsModel = buildDependentResource { pine }, {
		resourceName: 'release_tag'
		resourceKeyField: 'tag_key'
		parentResourceName: 'release',
		getResourceId: (id) -> exports.get(id, $select: 'id').get('id')
		ResourceNotFoundError: errors.ResinReleaseNotFound
	}

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
	# @summary Get a specific release with the details of the images built
	# @name getWithImageDetails
	# @public
	# @function
	# @memberof resin.models.release
	#
	# @description
	# This method does not map exactly to the underlying model: it runs a
	# larger prebuilt query, and reformats it into an easy to use and
	# understand format. If you want significantly more control, or to see the
	# raw model directly, use `release.get(id, options)` instead.
	#
	# @param {Number} id - release id
	# @param {Object} [options={}] - a map of extra pine options
	# @param {Boolean} [options.release={}] - extra pine options for releases
	# @param {Object} [options.image={}] - extra pine options for images
	# @fulfil {Object} - release with image details
	# @returns {Promise}
	#
	# @example
	# resin.models.release.getWithImageDetails(123).then(function(release) {
	#		console.log(release);
	# });
	#
	# @example
	# resin.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
	# .then(function(release) {
	#		console.log(release.images[0].build_log);
	# });
	#
	# @example
	# resin.models.release.getWithImageDetails(123, function(error, release) {
	#		if (error) throw error;
	#		console.log(release);
	# });
	###
	exports.getWithImageDetails = (id, options = {}, callback) ->
		callback = findCallback(arguments)

		return exports.get id, mergePineOptions
			$expand:
				contains__image:
					$expand:
						image:
							mergePineOptions
								$select: [ 'id' ]
								$expand:
									is_a_build_of__service:
										$select: [ 'service_name' ]
							, options.image
				is_created_by__user:
					$select: ['id', 'username']
		, options.release
		.then (rawRelease) ->
			release = omit rawRelease, [
				'contains__image'
				'is_created_by__user'
			]

			# Squash .contains__image[x].image[0] into a simple array
			images = rawRelease.contains__image.map (imageJoin) ->
				imageJoin.image[0]

			release.images = images.map (imageData) ->
				image = omit(imageData, 'is_a_build_of__service')
				image.service_name = imageData.is_a_build_of__service[0].service_name
				return image
			.sort (a, b) ->
				a.service_name.localeCompare(b.service_name)

			release.user = rawRelease.is_created_by__user[0]

			return release
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

		applicationModel().get(nameOrId, $select: 'id')
		.then ({ id }) ->
			return pine.get
				resource: 'release'
				options:
					mergePineOptions
						$filter:
							belongs_to__application: id
						$orderby: 'created_at desc'
					, options
		.asCallback(callback)

	###*
	# @namespace resin.models.release.tags
	# @memberof resin.models.release
	###
	exports.tags = {}

	###*
	# @summary Get all release tags for an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.release.tags
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - release tags
	# @returns {Promise}
	#
	# @example
	# resin.models.release.tags.getAllByApplication('MyApp').then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# resin.models.release.tags.getAllByApplication(999999).then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# resin.models.release.tags.getAllByApplication('MyApp', function(error, tags) {
	# 	if (error) throw error;
	# 	console.log(tags)
	# });
	###
	exports.tags.getAllByApplication = (nameOrId, options = {}, callback) ->
		applicationModel().get(nameOrId, $select: 'id').get('id').then (id) ->
			tagsModel.getAll(
				mergePineOptions
					$filter:
						release:
							$any:
								$alias: 'r',
								$expr: r: belongs_to__application: id
				, options
			)
		.asCallback(callback)

	###*
	# @summary Get all release tags for a release
	# @name getAllByRelease
	# @public
	# @function
	# @memberof resin.models.release.tags
	#
	# @param {Number} id - release id
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - release tags
	# @returns {Promise}
	#
	# @example
	# resin.models.release.tags.getAllByRelease(123).then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# resin.models.release.tags.getAllByRelease(123, function(error, tags) {
	# 	if (error) throw error;
	# 	console.log(tags)
	# });
	###
	exports.tags.getAllByRelease = (id, options = {}, callback) ->
		callback = findCallback(arguments)

		exports.get(id,
			$select: 'id'
			$expand:
				release_tag:
					mergePineOptions
						$orderby: 'tag_key asc'
					, options
		)
		.then (release) -> release.release_tag
		.asCallback(callback)

	###*
	# @summary Get all release tags
	# @name getAll
	# @public
	# @function
	# @memberof resin.models.release.tags
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - release tags
	# @returns {Promise}
	#
	# @example
	# resin.models.release.tags.getAll().then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# resin.models.release.tags.getAll(function(error, tags) {
	# 	if (error) throw error;
	# 	console.log(tags)
	# });
	###
	exports.tags.getAll = tagsModel.getAll

	###*
	# @summary Set a release tag
	# @name set
	# @public
	# @function
	# @memberof resin.models.release.tags
	#
	# @param {Number} releaseId - release id
	# @param {String} tagKey - tag key
	# @param {String|undefined} value - tag value
	#
	# @returns {Promise}
	#
	# @example
	# resin.models.release.tags.set(123, 'EDITOR', 'vim');
	#
	# @example
	# resin.models.release.tags.set(123, 'EDITOR', 'vim', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.tags.set = tagsModel.set

	###*
	# @summary Remove a release tag
	# @name remove
	# @public
	# @function
	# @memberof resin.models.release.tags
	#
	# @param {Number} releaseId - release id
	# @param {String} tagKey - tag key
	# @returns {Promise}
	#
	# @example
	# resin.models.release.tags.remove(123, 'EDITOR');
	#
	# @example
	# resin.models.release.tags.remove(123, 'EDITOR', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.tags.remove = tagsModel.remove

	return exports

module.exports = getReleaseModel
