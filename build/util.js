(function() {
  var notImplemented;

  exports.notImplemented = notImplemented = function() {
    throw new Error('The method is not implemented.');
  };

  exports.onlyIf = function(condition) {
    return function(fn) {
      if (condition) {
        return fn;
      } else {
        return notImplemented;
      }
    };
  };

}).call(this);
