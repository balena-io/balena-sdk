(function() {
  var fsPlus, path, _;

  _ = require('lodash');

  fsPlus = require('fs-plus');

  path = require('path');

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
