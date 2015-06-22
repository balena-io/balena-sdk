
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
   * download callback
   * @callback module:resin.models.os~downloadCallback
   * @param {(Error|null)} error - error
   * @param {ReadableStream} stream - download stream
   */


  /**
   * @summary Download an OS image
   * @public
   * @function
   *
   * @param {Object} parameters - os parameters
   * @param {module:resin.models.os~downloadCallback} callback - callback
   *
   * @throws {Error} If parameters is not an instance of {@link module:resin/connection.OSParams}
   *
   * @todo In the future this function should only require a device type slug.
   *
   * @example
   * parameters =
   *		network: 'ethernet'
   *		appId: 91
   *
   * resin.models.os.download parameters, (error, stream) ->
   *		throw error if error?
   *		stream.pipe(fs.createWriteStream('foo/bar/image.img'))
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
