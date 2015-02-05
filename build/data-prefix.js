
/**
 * @module resin.data.prefix
 */

(function() {
  var errors, mkdirp, prefix, _;

  _ = require('lodash');

  mkdirp = require('mkdirp');

  errors = require('./errors');


  /**
   * @ignore
   */

  prefix = null;


  /**
   * @summary Get current prefix
   * @public
   * @function
   *
   * @returns {String} prefix
   *
   * @example
   *	prefix = resin.data.prefix.get()
   */

  exports.get = function() {
    return prefix;
  };


  /**
   * set callback
   * @callback module:resin.data.prefix~setCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Set prefix
   * @public
   * @function
   *
   * @param {String} newPrefix - new prefix
   * @param {module:resin.data.prefix~setCallback} callback - callback
   *
   * @example
   *	resin.data.prefix.set '/opt/resin', (error) ->
   *		throw error if error?
   */

  exports.set = function(newPrefix, callback) {
    if (!_.isString(newPrefix)) {
      return typeof callback === "function" ? callback(new errors.InvalidPath(newPrefix)) : void 0;
    }
    return mkdirp(newPrefix, function(error) {
      if (error != null) {
        return typeof callback === "function" ? callback(error) : void 0;
      }
      prefix = newPrefix;
      return typeof callback === "function" ? callback() : void 0;
    });
  };


  /**
   * @summary Clear prefix
   * @public
   * @function
   *
   * @example
   *	resin.data.prefix.clear()
   */

  exports.clear = function() {
    return prefix = null;
  };

}).call(this);
