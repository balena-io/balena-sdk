(function() {
  var PinejsClientCore, PinejsClientRequest, Promise, promisifiedServerRequest, resinRequest, settings, token, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Promise = require('bluebird');

  PinejsClientCore = require('pinejs-client/core')(_, Promise);

  resinRequest = require('resin-request');

  token = require('resin-token');

  settings = require('../settings');

  promisifiedServerRequest = Promise.promisify(resinRequest.request, resinRequest);

  PinejsClientRequest = (function(_super) {
    __extends(PinejsClientRequest, _super);

    function PinejsClientRequest() {
      return PinejsClientRequest.__super__.constructor.apply(this, arguments);
    }


    /**
    	 * @summary Trigger a request to the resin.io API
    	 * @private
    	 *
    	 * @description Makes use of [pinejs-client-js](https://github.com/resin-io/pinejs-client-js)
    	 * You shouldn't make use of this method directly, but through models
    	 *
    	 * @param {Object} params - request params (same as node-request params)
     */

    PinejsClientRequest.prototype._request = function(params) {
      params.json = true;
      if (params.gzip == null) {
        params.gzip = true;
      }
      params.remoteUrl = settings.get('remoteUrl');
      params.token = token.get();
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
    apiPrefix: '/ewa/'
  });

}).call(this);
