
/**
 * @module resin/connection
 * @private
 */

(function() {
  var isOnline;

  isOnline = require('is-online');


  /**
   * isOnline callback
   * @callback module:resin/connection~isOnlineCallback
   * @param {(Error|null)} error - error
   * @param {Boolean} isOnline - is online
   */


  /**
   * @summary Check network status
   * @protected
   * @function
   * @protected
   *
   * @description A wrapper around isOnline in order to be able to stub it with Sinon
   *
   * @param {module:resin/connection~isOnlineCallback} callback - callback
   *
   * @example
   * connection.isOnline (error, isOnline) ->
   *		throw error if error?
   *		console.log "Online? #{isOnline}"
   */

  exports.isOnline = isOnline;

}).call(this);
