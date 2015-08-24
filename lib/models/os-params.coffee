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

_ = require('lodash')

NETWORK_WIFI = 'wifi'
NETWORK_ETHERNET = 'ethernet'

NETWORK_TYPES = [
	NETWORK_WIFI
	NETWORK_ETHERNET
]

###*
# Create a set of connection parameters
# @name OSParams
# @private
# @class
# @param {Object} options - connection parameter options
#
# @throws {Error} If no appId option
# @throws {Error} If invalid appId option (not a number or parseable string)
# @throws {Error} If no network option
# @throws {Error} If network is not wifi or ethernet
# @throws {Error} If network is wifi and wifiSsid is missing
# @throws {Error} If network is wifi and wifiKey is missing
# @throws {Error} If a non supported option is passed
###
module.exports = class OSParams

	constructor: (options) ->
		if not options.appId?
			throw new Error('Missing option: appId')

		options.appId = _.parseInt(options.appId)

		if _.isNaN(options.appId)
			throw new Error("Invalid option appId: #{options.appId}")

		if not options.network?
			throw new Error('Missing option: network')

		if _.indexOf(NETWORK_TYPES, options.network) is -1
			throw new Error("Invalid option network: #{options.network}")

		if options.network == NETWORK_WIFI

			if not options.wifiSsid?
				throw new Error('Missing option: wifiSsid')

			if not options.wifiKey?
				throw new Error('Missing option: wifiKey')

		_.extend(this, options)
