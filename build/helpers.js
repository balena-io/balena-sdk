
/**
 * @module resin/helpers
 */

(function() {
  var fsPlus, path, _;

  _ = require('lodash');

  fsPlus = require('fs-plus');

  path = require('path');


  /**
   * @summary Prefix relative value paths with another path
   * @function
   *
   * @description Absolute values will be omitted
   *
   * @protected
   *
   * @param {String} prefix - path prefix
   * @param {Object} object - object containing relative paths as values
   *
   * @example
   *	object =
   *		dataPrefix: 'resin'
   *
   *	object = prefixObjectValuesWithPath('/opt', object)
   *	console.log(object.dataPrefix) # /opt/resin
   */

  exports.prefixObjectValuesWithPath = function(prefix, object) {
    return _.object(_.map(object, function(value, key) {
      var result;
      result = [key];
      if (fsPlus.isAbsolute(value)) {
        result.push(value);
      } else {
        result.push(path.join(prefix, value));
      }
      return result;
    }));
  };

}).call(this);
