
/**
 * @module resin/models/os
 */

(function() {
  var ConnectionParams, fs, server, settings, url;

  url = require('url');

  fs = require('fs');

  server = require('../server');

  settings = require('../settings');

  ConnectionParams = require('../connection-params');


  /**
   * download callback
   * @callback module:resin/models/os~downloadCallback
   * @param {(Error|null)} error - error
   * @param {Object} response - response
   * @param {*} body - body
   */


  /**
   * @summary Download an OS image
   * @public
   * @function
   *
   * @param {module:resin/connection.ConnectionParams} parameters - os parameters
   * @param {String} destination - destination path
   * @param {module:resin/models/os~downloadCallback} callback - callback
   * @param {Function} onProgress - on progress callback
   *
   * @throws {Error} If parameters is not an instance of {@link module:resin/connection.ConnectionParams}
   *
   * @example
   * parameters = new ConnectionParams
   *		network: 'ethernet'
   *		appId: 91
   *
   * resin.models.os.download parameters, '/opt/os.zip', (error) ->
   *		throw error if error?
   *	, (state) ->
   *		console.log "Total: #{state.total}"
   *		console.log "Received: #{state.received}"
   */

  exports.download = function(parameters, destination, callback, onProgress) {
    var downloadUrl, query;
    if (!(parameters instanceof ConnectionParams)) {
      throw new Error('Invalid connection params');
    }
    query = url.format({
      query: parameters
    });
    downloadUrl = url.resolve(settings.get('urls.download'), query);
    return server.request({
      method: 'GET',
      url: downloadUrl,
      pipe: fs.createWriteStream(destination)
    }, callback, onProgress);
  };

}).call(this);
