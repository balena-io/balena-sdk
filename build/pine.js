(function() {
  var PinejsClientCore, PinejsClientRequest, Promise, promisifiedServerRequest, server, settings, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Promise = require('bluebird');

  PinejsClientCore = require('pinejs-client-js')(_, Promise);

  settings = require('./settings');

  server = require('./server');

  promisifiedServerRequest = Promise.promisify(server.request, server);

  PinejsClientRequest = (function(_super) {
    __extends(PinejsClientRequest, _super);

    function PinejsClientRequest() {
      return PinejsClientRequest.__super__.constructor.apply(this, arguments);
    }

    PinejsClientRequest.prototype._request = function(params) {
      params.json = params.data;
      if (params.gzip == null) {
        params.gzip = true;
      }
      return promisifiedServerRequest(params).spread(function(response, body) {
        var _ref;
        if ((200 <= (_ref = response.statusCode) && _ref < 300)) {
          return body;
        }
        throw new Error(body);
      });
    };

    return PinejsClientRequest;

  })(PinejsClientCore);

  module.exports = new PinejsClientRequest({
    apiPrefix: settings.get('apiPrefix')
  });

}).call(this);
