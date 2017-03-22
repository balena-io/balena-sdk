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
reject = require('lodash/reject')
once = require('lodash/once')
semver = require('semver')

errors = require('resin-errors')

{ onlyIf, getImgMakerHelper, findCallback, notFoundResponse, deviceTypes: deviceTypesUtil } = require('../util')

getOsModel = (deps, opts) ->
	{ request } = deps
	{ isBrowser, imageMakerUrl } = opts

	imgMakerHelper = getImgMakerHelper(imageMakerUrl, request)

	configModel = once -> require('./config')(deps, opts)

	getDeviceTypes = once ->
		configModel().getDeviceTypes()

	isValidDeviceType = (deviceType) ->
		getDeviceTypes()
		.then (types) ->
			!!deviceTypesUtil.findBySlug(types, deviceType)

	getDownloadSize = imgMakerHelper.buildApiRequester
		url: '/size_estimate'
		withVersion: true
		postProcess: ({ body }) -> body.size

	getOsVersions = imgMakerHelper.buildApiRequester
		buildUrl: ({ deviceType }) ->
			"/image/#{deviceType}/versions"
		postProcess: ({ body }) ->
			{ versions, latest } = body
			versions.sort(semver.rcompare)
			recommended = reject(versions, semver.prerelease)?[0] || null
			return {
				versions
				recommended
				latest
				default: recommended or latest
			}

	normalizeVersion = (v) ->
		if not v
			throw new Error("Invalid version: #{v}")
		if v is 'latest'
			return v
		vNormalized = if v[0] is 'v' then v.substring(1) else v
		if not semver.valid(vNormalized)
			throw new Error("Invalid semver version: #{v}")
		return vNormalized

	exports = {}

	# utility method exported for testability
	exports._getMaxSatisfyingVersion = (versionOrRange, osVersions) ->
		if versionOrRange in [ 'default', 'latest', 'recommended' ]
			return osVersions[versionOrRange]
		return semver.maxSatisfying(osVersions.versions, versionOrRange)

	###*
	# @summary Get OS download size estimate
	# @name getDownloadSize
	# @public
	# @function
	# @memberof resin.models.os
	# @description **Note!** Currently only the raw (uncompressed) size is reported.
	#
	# @param {String} deviceType - device type slug
	# @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'.
	# The version **must** be the exact version number.
	# @fulfil {Number} - OS image download size, in bytes.
	# @returns {Promise}
	#
	# @example
	# resin.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	# 	console.log('The OS download size for raspberry-pi', size);
	# });
	#
	# resin.models.os.getDownloadSize('raspberry-pi', function(error, size) {
	# 	if (error) throw error;
	# 	console.log('The OS download size for raspberry-pi', size);
	# });
	###
	exports.getDownloadSize = (deviceType, version = 'latest', callback) ->
		callback = findCallback(arguments)

		return isValidDeviceType(deviceType)
			.then (isValid) ->
				if not isValid
					throw new errors.ResinInvalidDeviceType('No such device type')
				getDownloadSize(deviceType, version)
			.asCallback(callback)

	###*
	# @summary Get OS supported versions
	# @name getSupportedVersions
	# @public
	# @function
	# @memberof resin.models.os
	#
	# @param {String} deviceType - device type slug
	# @fulfil {Object} - the versions information, of the following structure:
	# * versions - an array of strings,
	# containing exact version numbers supported by the current environment
	# * recommended - the recommended version, i.e. the most recent version
	# that is _not_ pre-release, can be `null`
	# * latest - the most recent version, including pre-releases
	# * default - recommended (if available) or latest otherwise
	# @returns {Promise}
	#
	# @example
	# resin.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	#
	# resin.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	# 	if (error) throw error;
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	###
	exports.getSupportedVersions = (deviceType, callback) ->
		callback = findCallback(arguments)

		return isValidDeviceType(deviceType)
			.then (isValid) ->
				if not isValid
					throw new errors.ResinInvalidDeviceType('No such device type')
				getOsVersions(deviceType)
			.asCallback(callback)

	###*
	# @summary Get the max OS version satisfying the given range
	# @name getMaxSatisfyingVersion
	# @public
	# @function
	# @memberof resin.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} versionOrRange - can be one of
	# * the exact version number,
	# in which case it is returned if the version is supported,
	# or `null` is returned otherwise,
	# * a [semver](https://www.npmjs.com/package/semver)-compatible
	# range specification, in which case the most recent satisfying version is returned
	# if it exists, or `null` is returned,
	# * `'latest'` in which case the most recent version is returned, including pre-releases,
	# * `'recommended'` in which case the recommended version is returned, i.e. the most
	# recent version excluding pre-releases, which can be `null` if only pre-release versions
	# are available,
	# * `'default'` in which case the recommended version is returned if available,
	# or `latest` is returned otherwise.
	# Defaults to `'latest'`.
	# @fulfil {String|null} - the version number, or `null` if no matching versions are found
	# @returns {Promise}
	#
	# @example
	# resin.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	#
	# resin.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	# 	if (error) throw error;
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	###
	exports.getMaxSatisfyingVersion = (deviceType, versionOrRange = 'latest', callback) ->
		callback = findCallback(arguments)

		return isValidDeviceType(deviceType)
			.then (isValid) ->
				if not isValid
					throw new errors.ResinInvalidDeviceType('No such device type')
				exports.getSupportedVersions(deviceType)
			.then (osVersions) ->
				exports._getMaxSatisfyingVersion(versionOrRange, osVersions)
			.asCallback(callback)

	###*
	# @summary Get the OS image last modified date
	# @name getLastModified
	# @public
	# @function
	# @memberof resin.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'.
	# Unsupported (unpublished) version will result in rejection.
	# The version **must** be the exact version number.
	# To resolve the semver-compatible range use `resin.model.os.getMaxSatisfyingVersion`.
	# @fulfil {Date} - last modified date
	# @returns {Promise}
	#
	# @example
	# resin.models.os.getLastModified('raspberry-pi').then(function(date) {
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	#
	# resin.models.os.getLastModified('raspberrypi3', '2.0.0').then(function(date) {
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	#
	# resin.models.os.getLastModified('raspberry-pi', function(error, date) {
	# 	if (error) throw error;
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	###
	exports.getLastModified = (deviceType, version = 'latest', callback) ->
		callback = findCallback(arguments)

		return isValidDeviceType(deviceType)
			.then (isValid) ->
				if not isValid
					throw new errors.ResinInvalidDeviceType('No such device type')
				return normalizeVersion(version)
			.then (version) ->
				imgMakerHelper.request
					method: 'HEAD'
					url: "/image/#{deviceType}/?version=#{version}"
			.catch notFoundResponse, ->
				throw new Error('No such version for the device type')
			.then (response) ->
				return new Date(response.headers.get('last-modified'))
			.asCallback(callback)

	###*
	# @summary Download an OS image
	# @name download
	# @public
	# @function
	# @memberof resin.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'
	# Unsupported (unpublished) version will result in rejection.
	# The version **must** be the exact version number.
	# To resolve the semver-compatible range use `resin.model.os.getMaxSatisfyingVersion`.
	# @fulfil {ReadableStream} - download stream
	# @returns {Promise}
	#
	# @example
	# resin.models.os.download('raspberry-pi').then(function(stream) {
	# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	# });
	#
	# resin.models.os.download('raspberry-pi', function(error, stream) {
	# 	if (error) throw error;
	# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	# });
	###
	exports.download = onlyIf(not isBrowser) (deviceType, version = 'latest', callback) ->
		callback = findCallback(arguments)

		return isValidDeviceType(deviceType)
			.then (isValid) ->
				if not isValid
					throw new errors.ResinInvalidDeviceType('No such device type')
				return normalizeVersion(version)
			.then (version) ->
				imgMakerHelper.stream
					url: "/image/#{deviceType}/?version=#{version}"
			.catch notFoundResponse, ->
				throw new Error('No such version for the device type')
			.asCallback(callback)

	return exports

module.exports = getOsModel
