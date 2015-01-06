(function() {
  var constructPath, errors, fs, haltIfNoPrefix, path, rimraf, _;

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  rimraf = require('rimraf');

  errors = require('./errors');

  exports.prefix = require('./data-prefix');

  haltIfNoPrefix = function(callback) {
    return function() {
      if (exports.prefix.get() == null) {
        throw new Error('Did you forget to set a prefix?');
      }
      return callback.apply(null, arguments);
    };
  };

  constructPath = function(key) {
    var prefix;
    if (!_.isString(key)) {
      throw new errors.InvalidKey();
    }
    prefix = exports.prefix.get();
    return path.join(prefix, key);
  };

  exports.get = haltIfNoPrefix(function(key, options, callback) {
    return exports.has(key, function(hasKey) {
      var keyPath;
      if (!hasKey) {
        return typeof callback === "function" ? callback(null, void 0) : void 0;
      }
      keyPath = constructPath(key);
      return fs.readFile(keyPath, options, callback);
    });
  });

  exports.getText = haltIfNoPrefix(function(key, callback) {
    return exports.get(key, {
      encoding: 'utf8'
    }, callback);
  });

  exports.set = haltIfNoPrefix(function(key, value, options, callback) {
    var keyPath;
    keyPath = constructPath(key);
    return fs.writeFile(keyPath, value, options, callback);
  });

  exports.setText = haltIfNoPrefix(function(key, value, callback) {
    return exports.set(key, value, {
      encoding: 'utf8'
    }, callback);
  });

  exports.has = haltIfNoPrefix(function(key, callback) {
    var keyPath;
    keyPath = constructPath(key);
    return fs.exists(keyPath, callback);
  });

  exports.remove = haltIfNoPrefix(function(key, callback) {
    var error, keyPath;
    if (callback == null) {
      callback = _.noop;
    }
    try {
      keyPath = constructPath(key);
    } catch (_error) {
      error = _error;
      return callback(error);
    }
    return rimraf(keyPath, callback);
  });

}).call(this);
