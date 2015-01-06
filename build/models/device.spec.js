(function() {
  var DEVICES, device, expect, _;

  _ = require('lodash');

  expect = require('chai').expect;

  device = require('./device');

  DEVICES = require('../../data/device-data.json');

  describe('Device:', function() {
    describe('#getDisplayName()', function() {
      it('should return Raspberry Pi for that device', function() {
        var name, possibleNames, _i, _len, _results;
        possibleNames = ['raspberry-pi', 'raspberrypi', 'rpi'];
        _results = [];
        for (_i = 0, _len = possibleNames.length; _i < _len; _i++) {
          name = possibleNames[_i];
          _results.push(expect(device.getDisplayName(name)).to.equal('Raspberry Pi'));
        }
        return _results;
      });
      it('should return unknown if no matches', function() {
        var name, unknownNames, _i, _len, _results;
        unknownNames = ['hello', 'foobar', {}, 123];
        _results = [];
        for (_i = 0, _len = unknownNames.length; _i < _len; _i++) {
          name = unknownNames[_i];
          _results.push(expect(device.getDisplayName(name)).to.equal('Unknown'));
        }
        return _results;
      });
      return it('should return the name itself if passing the display name', function() {
        var displayName, supportedDevice, _i, _len, _ref, _results;
        _ref = device.getSupportedDeviceTypes();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          supportedDevice = _ref[_i];
          displayName = device.getDisplayName(supportedDevice);
          _results.push(expect(displayName).to.equal(supportedDevice));
        }
        return _results;
      });
    });
    describe('#getDeviceSlug()', function() {
      it('should return valid slugs', function() {
        var key, value, _i, _len, _results;
        _results = [];
        for (value = _i = 0, _len = DEVICES.length; _i < _len; value = ++_i) {
          key = DEVICES[value];
          _results.push(expect(device.getDeviceSlug(key)).to.equal(value.slug));
        }
        return _results;
      });
      it('should return unknown if not valid device', function() {
        var result;
        result = device.getDeviceSlug('Foo Bar');
        return expect(result).to.equal('unknown');
      });
      return it('should return a valid slug if using an alternative name', function() {
        var key, name, value, _i, _len, _results;
        _results = [];
        for (value = _i = 0, _len = DEVICES.length; _i < _len; value = ++_i) {
          key = DEVICES[value];
          name = _.first(value.names);
          _results.push(expect(device.getDeviceSlug(name)).to.equal(value.slug));
        }
        return _results;
      });
    });
    return describe('#getSupportedDeviceTypes()', function() {
      it('should return an array', function() {
        return expect(device.getSupportedDeviceTypes()).to.be.an["instanceof"](Array);
      });
      return it('should have every supported device', function() {
        var key, supportedDevices, value, _i, _len, _results;
        supportedDevices = device.getSupportedDeviceTypes();
        _results = [];
        for (value = _i = 0, _len = DEVICES.length; _i < _len; value = ++_i) {
          key = DEVICES[value];
          _results.push(expect(supportedDevices.indexOf(key)).to.not.equal(-1));
        }
        return _results;
      });
    });
  });

}).call(this);
