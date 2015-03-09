(function() {
  var PinejsClientCore, PinejsClientRequest, Promise, _, promisifiedServerRequest, server, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  Promise = require('bluebird');

  PinejsClientCore = require('pinejs-client/core')(_, Promise);

  settings = require('./settings');

  server = require('./server');

  promisifiedServerRequest = Promise.promisify(server.request, server);

  PinejsClientRequest = (function(superClass) {
    extend(PinejsClientRequest, superClass);

    function PinejsClientRequest() {
      return PinejsClientRequest.__super__.constructor.apply(this, arguments);
    }


    /**
    	 * @summary Trigger a request to the resin.io API
    	 * @private
    	#
    	 * @description Makes use of [pinejs-client-js](https://github.com/resin-io/pinejs-client-js)
    	 * You shouldn't make use of this method directly, but through models
    	#
    	 * @param {Object} params - request params (same as node-request params)
     */

    PinejsClientRequest.prototype._request = function(params) {
      params.json = true;
      if (params.gzip == null) {
        params.gzip = true;
      }
      return promisifiedServerRequest(params).spread(function(response, body) {
        var ref;
        if ((200 <= (ref = response.statusCode) && ref < 300)) {
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
