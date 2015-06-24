
/**
 * @module resin.models.os
 */

(function() {
  var OSParams, errors, fs, request, url;

  url = require('url');

  fs = require('fs');

  request = require('resin-request');

  errors = require('resin-errors');

  OSParams = require('./os-params');


  /**
   * @summary Download an OS image
   * @public
   * @function
   *
   * @param {Object} parameters - os parameters
   * @returns {ReadableStream} download stream
   *
   * @throws {Error} If parameters is not an instance of {@link module:resin/connection.OSParams}
   *
   * @todo In the future this function should only require a device type slug.
   *
   * @example
   * parameters =
   * 	network: 'ethernet'
   * 	appId: 91
   *
   * resin.models.os.download(parameters).then (stream) ->
   * 	stream.pipe(fs.createWriteStream('foo/bar/image.img'))
   */

  exports.download = function(parameters, callback) {
    var downloadUrl, query;
    parameters = new OSParams(parameters);
    query = url.format({
      query: parameters
    });
    downloadUrl = url.resolve('/download', query);
    return request.stream({
      method: 'GET',
      url: downloadUrl
    }).nodeify(callback);
  };

}).call(this);
