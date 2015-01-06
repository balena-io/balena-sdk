(function() {
  var errors, mkdirp, prefix, _;

  _ = require('lodash');

  mkdirp = require('mkdirp');

  errors = require('./errors');

  prefix = null;

  exports.get = function() {
    return prefix;
  };

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

  exports.clear = function() {
    return prefix = null;
  };

}).call(this);
