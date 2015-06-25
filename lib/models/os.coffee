###
The MIT License

Copyright (c) 2015 Resin.io, Inc. https://resin.io.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
###

###*
# @module resin.models.os
###

url = require('url')
fs = require('fs')
request = require('resin-request')
errors = require('resin-errors')
OSParams = require('./os-params')

###*
# @summary Download an OS image
# @public
# @function
#
# @param {Object} parameters - os parameters
# @returns {ReadableStream} download stream
#
# @throws {Error} If parameters is not an instance of {@link module:resin/connection.OSParams}
#
# @todo In the future this function should only require a device type slug.
#
# @example
# parameters =
# 	network: 'ethernet'
# 	appId: 91
#
# resin.models.os.download(parameters).then (stream) ->
# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'))
###
exports.download = (parameters, callback) ->
	parameters = new OSParams(parameters)

	query = url.format(query: parameters)
	downloadUrl = url.resolve('/download', query)

	return request.stream
		method: 'GET'
		url: downloadUrl
	.nodeify(callback)
