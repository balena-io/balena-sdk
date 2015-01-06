(function() {
  var DEVICES, errors, pine, server, settings, _;

  pine = require('../pine');

  _ = require('lodash-contrib');

  errors = require('../errors');

  server = require('../server');

  settings = require('../settings');

  DEVICES = require('./device-data.json');

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'device',
      options: {
        expand: 'application',
        orderby: 'name asc'
      }
    }).then(function(devices) {
      if (_.isEmpty(devices)) {
        return callback(new errors.NotAny('devices'));
      }
      return callback(null, devices);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.getAllByApplication = function(applicationId, callback) {
    return pine.get({
      resource: 'device',
      options: {
        filter: {
          application: applicationId
        },
        expand: 'application',
        orderby: 'name asc'
      }
    }).then(function(devices) {
      if (_.isEmpty(devices)) {
        return callback(new errors.NotAny('devices'));
      }
      devices = _.map(devices, function(device) {
        device.application_name = device.application[0].app_name;
        device.device_display_name = exports.getDisplayName(device.device_type);
        return device;
      });
      return callback(null, devices);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.get = function(deviceId, callback) {
    return pine.get({
      resource: 'device',
      id: deviceId,
      options: {
        expand: 'application'
      }
    }).then(function(device) {
      if (device == null) {
        return callback(new errors.NotFound("device " + id));
      }
      device.application_name = device.application[0].app_name;
      device.device_display_name = exports.getDisplayName(device.device_type);
      return callback(null, device);
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'device',
      id: id
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.identify = function(uuid, callback) {
    return server.post(settings.get('urls.identify'), {
      uuid: uuid
    }, _.unary(callback));
  };

  exports.rename = function(id, name, callback) {
    return pine.patch({
      resource: 'device',
      id: id,
      data: {
        name: name
      }
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.note = function(id, note, callback) {
    return pine.patch({
      resource: 'device',
      id: id,
      data: {
        note: note
      }
    }).then(function() {
      return callback();
    })["catch"](function(error) {
      return callback(error);
    });
  };

  exports.getDisplayName = function(device) {
    var key, value;
    if (_.indexOf(exports.getSupportedDeviceTypes(), device) !== -1) {
      return device;
    }
    for (key in DEVICES) {
      value = DEVICES[key];
      if (_.indexOf(value.names, device) !== -1) {
        return key;
      }
    }
    return 'Unknown';
  };

  exports.getDeviceSlug = function(device) {
    var displayName, _ref;
    displayName = exports.getDisplayName(device);
    return ((_ref = DEVICES[displayName]) != null ? _ref.slug : void 0) || 'unknown';
  };

  exports.getSupportedDeviceTypes = function() {
    return _.keys(DEVICES);
  };

}).call(this);
