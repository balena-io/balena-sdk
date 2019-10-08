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

isEmpty = require('lodash/isEmpty')
once = require('lodash/once')
omit = require('lodash/omit')
errors = require('balena-errors')
Promise = require('bluebird')

{ isId, findCallback, mergePineOptions } = require('../util')

getReleaseModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application').default(deps, opts)

	{ buildDependentResource } = require('../util/dependent-resource')
	{ BuilderHelper } = require('../util/builder')
	builderHelper = new BuilderHelper(deps, opts)

	tagsModel = buildDependentResource { pine }, {
		resourceName: 'release_tag'
		resourceKeyField: 'tag_key'
		parentResourceName: 'release',
		getResourceId: (commitOrId) -> exports.get(commitOrId, $select: 'id').get('id')
		ResourceNotFoundError: errors.BalenaReleaseNotFound
	}

	exports = {}

	###*
	# @summary Get a specific release
	# @name get
	# @public
	# @function
	# @memberof balena.models.release
	#
	# @param {String|Number} commitOrId - release commit (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object} - release
	# @returns {Promise}
	#
	# @example
	# balena.models.release.get(123).then(function(release) {
	#		console.log(release);
	# });
	#
	# @example
	# balena.models.release.get('7cf02a6').then(function(release) {
	#		console.log(release);
	# });
	#
	# @example
	# balena.models.release.get(123, function(error, release) {
	#		if (error) throw error;
	#		console.log(release);
	# });
	###
	exports.get = (commitOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		return Promise.try ->
			if not commitOrId?
				throw new errors.BalenaReleaseNotFound(commitOrId)

			if isId(commitOrId)
				pine.get
					resource: 'release'
					id: commitOrId
					options: mergePineOptions({}, options)
				.tap (release) ->
					if not release?
						throw new errors.BalenaReleaseNotFound(commitOrId)
			else
				pine.get
					resource: 'release'
					options:
						mergePineOptions
							$filter:
								commit: $startswith: commitOrId
						, options
				.tap (releases) ->
					if isEmpty(releases)
						throw new errors.BalenaReleaseNotFound(commitOrId)

					if releases.length > 1
						throw new errors.BalenaAmbiguousRelease(commitOrId)
				.get(0)
		.asCallback(callback)

	###*
	# @summary Get a specific release with the details of the images built
	# @name getWithImageDetails
	# @public
	# @function
	# @memberof balena.models.release
	#
	# @description
	# This method does not map exactly to the underlying model: it runs a
	# larger prebuilt query, and reformats it into an easy to use and
	# understand format. If you want significantly more control, or to see the
	# raw model directly, use `release.get(id, options)` instead.
	#
	# @param {String|Number} commitOrId - release commit (string) or id (number)
	# @param {Object} [options={}] - a map of extra pine options
	# @param {Boolean} [options.release={}] - extra pine options for releases
	# @param {Object} [options.image={}] - extra pine options for images
	# @fulfil {Object} - release with image details
	# @returns {Promise}
	#
	# @example
	# balena.models.release.getWithImageDetails(123).then(function(release) {
	#		console.log(release);
	# });
	#
	# @example
	# balena.models.release.getWithImageDetails('7cf02a6').then(function(release) {
	#		console.log(release);
	# });
	#
	# @example
	# balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
	# .then(function(release) {
	#		console.log(release.images[0].build_log);
	# });
	#
	# @example
	# balena.models.release.getWithImageDetails(123, function(error, release) {
	#		if (error) throw error;
	#		console.log(release);
	# });
	###
	exports.getWithImageDetails = (commitOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		return exports.get commitOrId, mergePineOptions
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
	# @memberof balena.models.release
	#
	# @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - releases
	# @returns {Promise}
	#
	# @example
	# balena.models.release.getAllByApplication('MyApp').then(function(releases) {
	#		console.log(releases);
	# });
	#
	# @example
	# balena.models.release.getAllByApplication(123).then(function(releases) {
	#		console.log(releases);
	# });
	#
	# @example
	# balena.models.release.getAllByApplication('MyApp', function(error, releases) {
	#		if (error) throw error;
	#		console.log(releases);
	# });
	###
	exports.getAllByApplication = (nameOrSlugOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		applicationModel().get(nameOrSlugOrId, $select: 'id')
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
	# @summary Get the latest successful release for an application
	# @name getLatestByApplication
	# @public
	# @function
	# @memberof balena.models.release
	#
	# @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object|undefined} - release
	# @returns {Promise}
	#
	# @example
	# balena.models.release.getLatestByApplication('MyApp').then(function(releases) {
	#		console.log(releases);
	# });
	#
	# @example
	# balena.models.release.getLatestByApplication(123).then(function(releases) {
	#		console.log(releases);
	# });
	#
	# @example
	# balena.models.release.getLatestByApplication('MyApp', function(error, releases) {
	#		if (error) throw error;
	#		console.log(releases);
	# });
	###
	exports.getLatestByApplication = (nameOrSlugOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		exports.getAllByApplication(nameOrSlugOrId,
			mergePineOptions
				$top: 1
				$filter:
					status: 'success'
			, options
		)
		.get(0)
		.asCallback(callback)

	###*
	# @summary Create a new release built from the source in the provided url
	# @name createFromUrl
	# @public
	# @function
	# @memberof balena.models.release
	#
	# @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	# @param {Object} urlDeployOptions - builder options
	# @param {String} urlDeployOptions.url - a url with a tarball of the project to build
	# @param {Boolean} [urlDeployOptions.shouldFlatten=true] - Should be true when the tarball includes an extra root folder with all the content
	# @fulfil {number} - release ID
	# @returns {Promise}
	#
	# @example
	# balena.models.release.createFromUrl('MyApp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	#		console.log(releaseId);
	# });
	#
	# @example
	# balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	#		console.log(releaseId);
	# });
	#
	# @example
	# balena.models.release.createFromUrl('MyApp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }, function(error, releaseId) {
	#		if (error) throw error;
	#		console.log(releaseId);
	# });
	###
	exports.createFromUrl = (nameOrSlugOrId, urlDeployOptions, callback) ->
		applicationModel().get(nameOrSlugOrId,
			$select: 'app_name'
			$expand:
				organization:
					$select: 'handle'
		)
		.then ({ app_name, organization }) ->
			builderHelper.buildFromUrl(organization[0].handle, app_name, urlDeployOptions)
		.asCallback(callback)

	###*
	# @namespace balena.models.release.tags
	# @memberof balena.models.release
	###
	exports.tags = {}

	###*
	# @summary Get all release tags for an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof balena.models.release.tags
	#
	# @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - release tags
	# @returns {Promise}
	#
	# @example
	# balena.models.release.tags.getAllByApplication('MyApp').then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# balena.models.release.tags.getAllByApplication('MyApp', function(error, tags) {
	# 	if (error) throw error;
	# 	console.log(tags)
	# });
	###
	exports.tags.getAllByApplication = (nameOrSlugOrId, options = {}, callback) ->
		applicationModel().get(nameOrSlugOrId, $select: 'id').get('id').then (id) ->
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
	# @memberof balena.models.release.tags
	#
	# @param {String|Number} commitOrId - release commit (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - release tags
	# @returns {Promise}
	#
	# @example
	# balena.models.release.tags.getAllByRelease(123).then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# balena.models.release.tags.getAllByRelease('7cf02a6').then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# balena.models.release.tags.getAllByRelease(123, function(error, tags) {
	# 	if (error) throw error;
	# 	console.log(tags)
	# });
	###
	exports.tags.getAllByRelease = (commitOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		exports.get(commitOrId,
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
	# @memberof balena.models.release.tags
	#
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - release tags
	# @returns {Promise}
	#
	# @example
	# balena.models.release.tags.getAll().then(function(tags) {
	# 	console.log(tags);
	# });
	#
	# @example
	# balena.models.release.tags.getAll(function(error, tags) {
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
	# @memberof balena.models.release.tags
	#
	# @param {String|Number} commitOrId - release commit (string) or id (number)
	# @param {String} tagKey - tag key
	# @param {String|undefined} value - tag value
	#
	# @returns {Promise}
	#
	# @example
	# balena.models.release.tags.set(123, 'EDITOR', 'vim');
	#
	# @example
	# balena.models.release.tags.set('7cf02a6', 'EDITOR', 'vim');
	#
	# @example
	# balena.models.release.tags.set(123, 'EDITOR', 'vim', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.tags.set = tagsModel.set

	###*
	# @summary Remove a release tag
	# @name remove
	# @public
	# @function
	# @memberof balena.models.release.tags
	#
	# @param {String|Number} commitOrId - release commit (string) or id (number)
	# @param {String} tagKey - tag key
	# @returns {Promise}
	#
	# @example
	# balena.models.release.tags.remove(123, 'EDITOR');
	#
	# @example
	# balena.models.release.tags.remove('7cf02a6', 'EDITOR');
	#
	# @example
	# balena.models.release.tags.remove(123, 'EDITOR', function(error) {
	# 	if (error) throw error;
	# });
	###
	exports.tags.remove = tagsModel.remove

	return exports

module.exports =
	default: getReleaseModel

