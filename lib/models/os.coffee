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

request = require('resin-request')

###*
# @summary Download an OS image
# @name download
# @public
# @function
# @memberof resin.models.os
#
# @param {Object} parameters - os parameters
# @fulfil {ReadableStream} - download stream
# @returns {Promise}
#
# @todo In the future this function should only require a device type slug.
#
# @example
# // Ethernet
# var parameters = {
# 	network: 'ethernet',
# 	appId: 91
# };
#
# // Wifi
# var parameters = {
# 	network: 'wifi',
# 	wifiSsid: 'ssid',
# 	wifiKey: 'secret',
# 	appId: 91
# };
#
# resin.models.os.download(parameters).then(function(stream) {
# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
# });
#
# @example
# // Ethernet
# var parameters = {
# 	network: 'ethernet',
# 	appId: 91
# };
#
# // Wifi
# var parameters = {
# 	network: 'wifi',
# 	wifiSsid: 'ssid',
# 	wifiKey: 'secret',
# 	appId: 91
# };
#
# resin.models.os.download(parameters, function(error, stream) {
# 	if (error) throw error;
# 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
# });
###
exports.download = (parameters, callback) ->
	request.stream
		method: 'GET'
		url: '/download'
		qs: parameters
	.nodeify(callback)
