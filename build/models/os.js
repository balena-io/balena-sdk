
/*
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
 */

(function() {
  var errors, getImageMakerUrl, request, settings, url;

  url = require('url');

  request = require('resin-request');

  errors = require('resin-errors');

  settings = require('resin-settings-client');

  getImageMakerUrl = function(deviceType) {
    var imageMakerUrl;
    imageMakerUrl = settings.get('imageMakerUrl');
    return url.resolve(imageMakerUrl, "/api/v1/image/" + deviceType + "/");
  };


  /**
   * @summary Get OS image last modified date
   * @name getLastModified
   * @public
   * @function
   * @memberof resin.models.os
   *
   * @param {String} deviceType - device type slug
   * @fulfil {Date} - last modified date
   * @returns {Promise}
   *
   * @example
   * resin.models.os.getLastModified('raspberry-pi').then(function(date) {
   * 	console.log('The raspberry-pi image was last modified in ' + date);
   * });
   *
   * resin.models.os.getLastModified('raspberry-pi', function(error, date) {
   * 	if (error) throw error;
   * 	console.log('The raspberry-pi image was last modified in ' + date);
   * });
   */

  exports.getLastModified = function(deviceType, callback) {
    return request.send({
      method: 'HEAD',
      url: getImageMakerUrl(deviceType)
    })["catch"](function(error) {
      if (error.name === 'ResinRequestError' && error.statusCode === 404) {
        throw new errors.ResinRequestError('No such device type');
      }
      throw error;
    }).then(function(response) {
      return new Date(response.headers['last-modified']);
    }).nodeify(callback);
  };


  /**
   * @summary Download an OS image
   * @name download
   * @public
   * @function
   * @memberof resin.models.os
   *
   * @param {String} deviceType - device type slug
   * @fulfil {ReadableStream} - download stream
   * @returns {Promise}
   *
   * @example
   * resin.models.os.download('raspberry-pi').then(function(stream) {
   * 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
   * });
   *
   * resin.models.os.download('raspberry-pi', function(error, stream) {
   * 	if (error) throw error;
   * 	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
   * });
   */

  exports.download = function(deviceType, callback) {
    return request.stream({
      method: 'GET',
      url: getImageMakerUrl(deviceType)
    }).nodeify(callback);
  };

}).call(this);
