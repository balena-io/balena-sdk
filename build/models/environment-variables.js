(function() {
  var errors, pine;

  pine = require('../pine');

  errors = require('../errors');

  exports.getAllByApplication = function(applicationId, callback) {
    return pine.get({
      resource: 'environment_variable',
      options: {
        filter: {
          application: applicationId
        },
        orderby: 'name asc'
      }
    }).then(function(environmentVariables) {
      if (environmentVariables == null) {
        return callback(new errors.NotFound('environment variables'));
      }
      return callback(null, environmentVariables);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.create = function(applicationId, name, value, callback) {
    return pine.post({
      resource: 'environment_variable',
      data: {
        name: name,
        value: value,
        application: applicationId
      }
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.update = function(id, value, callback) {
    return pine.patch({
      resource: 'environment_variable',
      id: id,
      data: {
        value: value
      }
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'environment_variable',
      id: id
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

}).call(this);
