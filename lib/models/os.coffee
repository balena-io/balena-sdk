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

errors = require('balena-errors')
Promise = require('bluebird')
assign = require('lodash/assign')
defaults = require('lodash/defaults')
find = require('lodash/find')
first = require('lodash/first')
includes = require('lodash/includes')
once = require('lodash/once')
partition = require('lodash/partition')
reject = require('lodash/reject')
bSemver = require('balena-semver')
semver = require('semver')
promiseMemoize = require('promise-memoize')

{
	onlyIf
	getImgMakerHelper
	findCallback
	notFoundResponse
	treatAsMissingApplication
	deviceTypes: deviceTypesUtil
	isDevelopmentVersion
} = require('../util')
{ hupActionHelper } = require('../util/device-actions/os-update/utils')

BALENAOS_VERSION_REGEX = /v?\d+\.\d+\.\d+(\.rev\d+)?((\-|\+).+)?/

DEVICE_TYPES_ENDPOINT_CACHING_INTERVAL = 10 * 60 * 1000 # 10 minutes

withDeviceTypesEndpointCaching = (fn) ->
	promiseMemoize(fn, { maxAge: DEVICE_TYPES_ENDPOINT_CACHING_INTERVAL })

getOsModel = (deps, opts) ->
	{ request } = deps
	{ apiUrl, isBrowser, imageMakerUrl } = opts

	imgMakerHelper = getImgMakerHelper(imageMakerUrl, request)

	configModel = once -> require('./config')(deps, opts)
	applicationModel = once -> require('./application')(deps, opts)

	getDeviceTypes = once ->
		configModel().getDeviceTypes()

	isValidDeviceType = (deviceType) ->
		getDeviceTypes()
		.then (types) ->
			!!deviceTypesUtil.findBySlug(types, deviceType)

	validateDeviceType = (deviceType) ->
		isValidDeviceType(deviceType)
		.then (isValid) ->
			if not isValid
				throw new errors.BalenaInvalidDeviceType('No such device type')

	exports = {}

	###*
	# @summary Get OS versions download size
	# @description Utility method exported for testability.
	# @name _getDownloadSize
	# @private
	# @function
	# @memberof balena.models.os
	###
	exports._getDownloadSize = withDeviceTypesEndpointCaching (deviceType, version) ->
		request.send
			method: 'GET'
			url: "/device-types/v1/#{deviceType}/images/#{version}/download-size"
			baseUrl: apiUrl
			sendToken: false
		.get('body')
		.get('size')

	###*
	# @summary Get OS versions
	# @description Utility method exported for testability.
	# @name _getOsVersions
	# @private
	# @function
	# @memberof balena.models.os
	###
	exports._getOsVersions = withDeviceTypesEndpointCaching (deviceType) ->
		request.send
			method: 'GET'
			url: "/device-types/v1/#{deviceType}/images"
			baseUrl: apiUrl
			sendToken: false
		.get('body')
		.then ({ versions, latest }) ->

			versions.sort(bSemver.rcompare)
			potentialRecommendedVersions = reject versions, (version) ->
				semver.prerelease(version) or isDevelopmentVersion(version)
			recommended = potentialRecommendedVersions?[0] || null

			return {
				versions
				recommended
				latest
				default: recommended or latest
			}

	###*
	# @summary Clears the cached results from the `device-types/v1` endpoint.
	# @description Utility method exported for testability.
	# @name _clearDeviceTypesEndpointCaches
	# @private
	# @function
	# @memberof balena.models.os
	###
	exports._clearDeviceTypesEndpointCaches = ->
		exports._getDownloadSize.clear()
		exports._getOsVersions.clear()

	normalizeVersion = (v) ->
		if not v
			throw new Error("Invalid version: #{v}")
		if v is 'latest'
			return v
		vNormalized = if v[0] is 'v' then v.substring(1) else v
		if not BALENAOS_VERSION_REGEX.test(vNormalized)
			throw new Error("Invalid semver version: #{v}")
		return vNormalized

	deviceImageUrl = (deviceType, version) ->
		"/image/#{deviceType}/?version=#{encodeURIComponent(version)}"

	fixNonSemver = (version) ->
		if version?
			version?.replace(/\.rev(\d+)/, '+FIXED-rev$1')
		else
			version

	unfixNonSemver = (version) ->
		if version?
			version.replace(/\+FIXED-rev(\d+)/, '.rev$1')
		else
			version

	###*
	# @summary Get the max OS version satisfying the given range.
	# @description Utility method exported for testability.
	# @name _getMaxSatisfyingVersion
	# @private
	# @function
	# @memberof balena.models.os
	###
	exports._getMaxSatisfyingVersion = (versionOrRange, osVersions) ->
		if versionOrRange in [ 'default', 'latest', 'recommended' ]
			return osVersions[versionOrRange]

		semverVersions = osVersions.versions.map(fixNonSemver)

		# TODO: Once we integrate balena-semver, balena-semver should learn to handle this itself
		semverVersionOrRange = fixNonSemver(versionOrRange)
		if includes(semverVersions, semverVersionOrRange)
			# If the _exact_ version you're looking for exists, it's not a range, and
			# we should return it exactly, not any old equivalent version.
			return unfixNonSemver(semverVersionOrRange)

		maxVersion = semver.maxSatisfying(semverVersions, semverVersionOrRange)

		return unfixNonSemver(maxVersion)

	###*
	# @summary Get OS download size estimate
	# @name getDownloadSize
	# @public
	# @function
	# @memberof balena.models.os
	# @description **Note!** Currently only the raw (uncompressed) size is reported.
	#
	# @param {String} deviceType - device type slug
	# @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'.
	# The version **must** be the exact version number.
	# @fulfil {Number} - OS image download size, in bytes.
	# @returns {Promise}
	#
	# @example
	# balena.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	# 	console.log('The OS download size for raspberry-pi', size);
	# });
	#
	# balena.models.os.getDownloadSize('raspberry-pi', function(error, size) {
	# 	if (error) throw error;
	# 	console.log('The OS download size for raspberry-pi', size);
	# });
	###
	exports.getDownloadSize = (deviceType, version = 'latest', callback) ->
		callback = findCallback(arguments)

		return validateDeviceType(deviceType)
			.then ->
				exports._getDownloadSize(deviceType, version)
			.asCallback(callback)

	###*
	# @summary Get OS supported versions
	# @name getSupportedVersions
	# @public
	# @function
	# @memberof balena.models.os
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
	# balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	#
	# balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	# 	if (error) throw error;
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	###
	exports.getSupportedVersions = (deviceType, callback) ->
		callback = findCallback(arguments)

		return validateDeviceType(deviceType)
			.then  ->
				exports._getOsVersions(deviceType)
			.asCallback(callback)

	###*
	# @summary Get the max OS version satisfying the given range
	# @name getMaxSatisfyingVersion
	# @public
	# @function
	# @memberof balena.models.os
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
	# balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	#
	# balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	# 	if (error) throw error;
	# 	console.log('Supported OS versions for raspberry-pi', osVersions);
	# });
	###
	exports.getMaxSatisfyingVersion = (deviceType, versionOrRange = 'latest', callback) ->
		callback = findCallback(arguments)

		return validateDeviceType(deviceType)
			.then ->
				exports.getSupportedVersions(deviceType)
			.then (osVersions) ->
				exports._getMaxSatisfyingVersion(versionOrRange, osVersions)
			.asCallback(callback)

	###*
	# @summary Get the OS image last modified date
	# @name getLastModified
	# @public
	# @function
	# @memberof balena.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'.
	# Unsupported (unpublished) version will result in rejection.
	# The version **must** be the exact version number.
	# To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`.
	# @fulfil {Date} - last modified date
	# @returns {Promise}
	#
	# @example
	# balena.models.os.getLastModified('raspberry-pi').then(function(date) {
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	#
	# balena.models.os.getLastModified('raspberrypi3', '2.0.0').then(function(date) {
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	#
	# balena.models.os.getLastModified('raspberry-pi', function(error, date) {
	# 	if (error) throw error;
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	###
	exports.getLastModified = (deviceType, version = 'latest', callback) ->
		callback = findCallback(arguments)

		return validateDeviceType(deviceType)
			.then ->
				normalizeVersion(version)
			.then (version) ->
				imgMakerHelper.request
					method: 'HEAD'
					url: deviceImageUrl(deviceType, version)
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
	# @memberof balena.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} [version] - semver-compatible version or 'latest', defaults to 'latest'
	# Unsupported (unpublished) version will result in rejection.
	# The version **must** be the exact version number.
	# To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`.
	# @fulfil {ReadableStream} - download stream
	# @returns {Promise}
	#
	# @example
	# balena.models.os.download('raspberry-pi').then(function(stream) {
	# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	# });
	#
	# balena.models.os.download('raspberry-pi', function(error, stream) {
	# 	if (error) throw error;
	# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
	# });
	###
	exports.download = onlyIf(not isBrowser) (deviceType, version = 'latest', callback) ->
		callback = findCallback(arguments)

		return validateDeviceType(deviceType)
			.then ->
				normalizeVersion(version)
			.then (version) ->
				imgMakerHelper.stream
					url: deviceImageUrl(deviceType, version)
			.catch notFoundResponse, ->
				throw new Error('No such version for the device type')
			.asCallback(callback)

	###*
	# @summary Get an applications config.json
	# @name getConfig
	# @public
	# @function
	# @memberof balena.models.os
	#
	# @description
	# Builds the config.json for a device in the given application, with the given
	# options.
	#
	# Note that an OS version is required. For versions < 2.7.8, config
	# generation is only supported when using a session token, not an API key.
	#
	# @param {String|Number} nameOrId - application name (string) or id (number).
	# @param {Object} options - OS configuration options to use.
	# @param {String} options.version - Required: the OS version of the image.
	# @param {String} [options.network='ethernet'] - The network type that
	# the device will use, one of 'ethernet' or 'wifi'.
	# @param {Number} [options.appUpdatePollInterval] - How often the OS checks
	# for updates, in minutes.
	# @param {String} [options.wifiKey] - The key for the wifi network the
	# device will connect to.
	# @param {String} [options.wifiSsid] - The ssid for the wifi network the
	# device will connect to.
	# @param {String} [options.ip] - static ip address.
	# @param {String} [options.gateway] - static ip gateway.
	# @param {String} [options.netmask] - static ip netmask.
	# @fulfil {Object} - application configuration as a JSON object.
	# @returns {Promise}
	#
	# @example
	# balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	# 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	# });
	#
	# balena.models.os.getConfig(123, { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	# 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	# });
	#
	# balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }, function(error, config) {
	# 	if (error) throw error;
	# 	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
	# });
	###
	exports.getConfig = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		Promise.try ->
			if !options.version
				throw new Error('An OS version is required when calling os.getConfig')

			defaultOpts =
				network: 'ethernet'

			defaults(options, defaultOpts)

			applicationModel()._getId(nameOrId)
			.then (applicationId) ->
				request.send
					method: 'POST'
					url: '/download-config'
					baseUrl: apiUrl
					body: assign(options, appId: applicationId)
			.get('body')
			.catch(notFoundResponse, treatAsMissingApplication(nameOrId))
		.asCallback(callback)

	###*
	# @summary Returns whether the provided device type supports OS updates between the provided balenaOS versions
	# @name isSupportedOsUpdate
	# @public
	# @function
	# @memberof balena.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} currentVersion - semver-compatible version for the starting OS version
	# @param {String} targetVersion - semver-compatible version for the target OS version
	# @fulfil {Boolean} - whether upgrading the OS to the target version is supported
	# @returns {Promise}
	#
	# @example
	# balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(isSupported) {
	# 	console.log(isSupported);
	# });
	#
	# balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod', function(error, config) {
	# 	if (error) throw error;
	# 	console.log(isSupported);
	# });
	###
	exports.isSupportedOsUpdate = (deviceType, currentVersion, targetVersion, callback) ->
		validateDeviceType(deviceType)
		.then ->
			hupActionHelper.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)
		.asCallback(callback)

	###*
	# @summary Returns the supported OS update targets for the provided device type
	# @name getSupportedOsUpdateVersions
	# @public
	# @function
	# @memberof balena.models.os
	#
	# @param {String} deviceType - device type slug
	# @param {String} currentVersion - semver-compatible version for the starting OS version
	# @fulfil {Object} - the versions information, of the following structure:
	# * versions - an array of strings,
	# containing exact version numbers that OS update is supported
	# * recommended - the recommended version, i.e. the most recent version
	# that is _not_ pre-release, can be `null`
	# * current - the provided current version after normalization
	# @returns {Promise}
	#
	# @example
	# balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod').then(function(isSupported) {
	# 	console.log(isSupported);
	# });
	#
	# balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod', function(error, config) {
	# 	if (error) throw error;
	# 	console.log(isSupported);
	# });
	###
	exports.getSupportedOsUpdateVersions = (deviceType, currentVersion, callback) ->
		exports.getSupportedVersions(deviceType)
		.then ({ versions: allVersions }) ->
			# use bSemver.compare to find the current version in the OS list
			# to benefit from the baked-in normalization
			current = find(allVersions, (v) -> bSemver.compare(v, currentVersion) == 0)

			versions = allVersions.filter (v) ->
				# avoid the extra call to validateDeviceType,
				# since getSupportedVersions is already does that
				hupActionHelper.isSupportedOsUpdate(deviceType, currentVersion, v)

			recommended = first(
				reject(versions, bSemver.prerelease)
			)

			return {
				versions
				recommended
				current
			}
		.asCallback(callback)

	return exports

module.exports = getOsModel
