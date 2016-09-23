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

errors = require('resin-errors')
{ notImplemented } = require('../util')

module.exports.get = (deps, opts) ->
	{ request } = deps
	{ isBrowser, imageMakerUrl } = opts

	exports = {}

	###*
	# @summary Get OS image last modified date
	# @name getLastModified
	# @public
	# @function
	# @memberof resin.models.os
	#
	# @param {String} deviceType - device type slug
	# @fulfil {Date} - last modified date
	# @returns {Promise}
	#
	# @example
	# resin.models.os.getLastModified('raspberry-pi').then(function(date) {
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	#
	# resin.models.os.getLastModified('raspberry-pi', function(error, date) {
	# 	if (error) throw error;
	# 	console.log('The raspberry-pi image was last modified in ' + date);
	# });
	###
	exports.getLastModified = (deviceType, callback) ->
		request.send
			method: 'HEAD'
			url: "/api/v1/image/#{deviceType}/"
			baseUrl: imageMakerUrl
		.catch
			name: 'ResinRequestError'
			statusCode: 404
		, ->
			throw new errors.ResinRequestError('No such device type')
		.then (response) ->
			return new Date(response.headers['last-modified'])
		.nodeify(callback)

	###*
	# @summary Download an OS image
	# @name download
	# @public
	# @function
	# @memberof resin.models.os
	#
	# @param {String} deviceType - device type slug
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
	exports.download = if isBrowser then notImplemented else (deviceType, callback) ->
		request.stream
			method: 'GET'
			url: "/api/v1/image/#{deviceType}/"
			baseUrl: imageMakerUrl
		.nodeify(callback)

	return exports
