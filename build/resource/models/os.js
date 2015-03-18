
/**
 * @module resin.models.os
 */

(function() {
  var OSParams, fs, request, settings, url;

  url = require('url');

  fs = require('fs');

  request = require('resin-request');

  settings = require('resin-settings-client');

  OSParams = require('../os-params');


  /**
   * download callback
   * @callback module:resin.models.os~downloadCallback
   * @param {(Error|null)} error - error
   * @param {Object} response - response
   * @param {*} body - body
   */


  /**
   * @summary Download an OS image
   * @public
   * @function
   *
   * @param {Object} parameters - os parameters
   * @param {String} destination - destination path
   * @param {module:resin.models.os~downloadCallback} callback - callback
   * @param {Function} onProgress - on progress callback
   *
   * @throws {Error} If parameters is not an instance of {@link module:resin/connection.OSParams}
   *
   * @todo Find a way to test this
   *
   * @example
   * parameters =
   *		network: 'ethernet'
   *		appId: 91
   *
   * resin.models.os.download parameters, '/opt/os.zip', (error) ->
   *		throw error if error?
   *	, (state) ->
   *		return if not state?
   *		console.log "Total: #{state.total}"
   *		console.log "Received: #{state.received}"
   */

  exports.download = function(parameters, destination, callback, onProgress) {
    var downloadUrl, query;
    parameters = new OSParams(parameters);
    query = url.format({
      query: parameters
    });
    downloadUrl = url.resolve('/download', query);
    return request.request({
      method: 'GET',
      url: downloadUrl,
      remoteUrl: settings.get('remoteUrl'),
      pipe: fs.createWriteStream(destination)
    }, callback, onProgress);
  };

}).call(this);
