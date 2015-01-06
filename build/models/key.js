(function() {
  var errors, server, settings, _;

  _ = require('lodash-contrib');

  server = require('../server');

  settings = require('../settings');

  errors = require('../errors');

  exports.getAll = function(callback) {
    var url;
    url = settings.get('urls.keys');
    return server.get(url, function(error, response, keys) {
      if (error != null) {
        return callback(error);
      }
      if (_.isEmpty(keys)) {
        return callback(new errors.NotAny('keys'));
      }
      return callback(null, keys);
    });
  };

  exports.get = function(id, callback) {
    var url;
    url = settings.get('urls.keys');
    return server.get(url, function(error, response, keys) {
      var key;
      if (error != null) {
        return callback(error);
      }
      key = _.findWhere(keys, {
        id: id
      });
      if (key == null) {
        return callback(new errors.NotFound("key " + id));
      }
      return callback(null, key);
    });
  };

  exports.remove = function(id, callback) {
    var url;
    url = settings.get('urls.sshKey');
    url = _.template(url, {
      id: id
    });
    return server["delete"](url, _.unary(callback));
  };

  exports.create = function(title, key, callback) {
    var data, url;
    url = settings.get('urls.keys');
    data = {
      title: title,
      key: key
    };
    return server.post(url, data, _.unary(callback));
  };

}).call(this);
