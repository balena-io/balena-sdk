(function() {
  var deviceModel, errors, pine, server, settings, _;

  _ = require('lodash-contrib');

  pine = require('../pine');

  deviceModel = require('./device');

  errors = require('../errors');

  server = require('../server');

  settings = require('../settings');

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'application',
      options: {
        orderby: 'app_name asc',
        expand: 'device'
      }
    }).then(function(applications) {
      if (_.isEmpty(applications)) {
        return callback(new errors.NotAny('applications'));
      }
      applications = _.map(applications, function(application) {
        var _ref;
        application.device_display_name = deviceModel.getDisplayName(application.device_type);
        application.online_devices = _.where(application.device, {
          is_online: 1
        }).length;
        application.devices_length = ((_ref = application.device) != null ? _ref.length : void 0) || 0;
        return application;
      });
      return callback(null, applications);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.get = function(id, callback) {
    return pine.get({
      resource: 'application',
      id: id
    }).then(function(application) {
      if (application == null) {
        return callback(new errors.NotFound("application " + id));
      }
      application.device_display_name = deviceModel.getDisplayName(application.device_type);
      return callback(null, application);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.create = function(name, deviceType, callback) {
    return pine.post({
      resource: 'application',
      data: {
        app_name: name,
        device_type: deviceType
      }
    }).then(function(res) {
      var id;
      id = res != null ? res.id : void 0;
      if (id == null) {
        return callback(new errors.NotFound('created application id'));
      }
      return callback(null, id);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'application',
      id: id
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.restart = function(id, callback) {
    var url;
    url = _.template(settings.get('urls.applicationRestart'), {
      id: id
    });
    return server.post(url, _.unary(callback));
  };

}).call(this);
