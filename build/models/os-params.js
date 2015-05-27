(function() {
  var NETWORK_ETHERNET, NETWORK_TYPES, NETWORK_WIFI, OSParams, VALID_OPTIONS, _, errors;

  _ = require('lodash');

  errors = require('resin-errors');

  NETWORK_WIFI = 'wifi';

  NETWORK_ETHERNET = 'ethernet';

  NETWORK_TYPES = [NETWORK_WIFI, NETWORK_ETHERNET];

  VALID_OPTIONS = ['network', 'appId', 'wifiSsid', 'wifiKey'];


  /**
   * Create a set of connection parameters
   * @name OSParams
   * @private
   * @class
   * @param {Object} options - connection parameter options
   *
   * @throws {Error} If no appId option
   * @throws {Error} If invalid appId option (not a number or parseable string)
   * @throws {Error} If no network option
   * @throws {Error} If network is not wifi or ethernet
   * @throws {Error} If network is wifi and wifiSsid is missing
   * @throws {Error} If network is wifi and wifiKey is missing
   * @throws {Error} If a non supported option is passed
   */

  module.exports = OSParams = (function() {
    function OSParams(options) {
      var invalidOptions;
      if (options.appId == null) {
        throw new errors.ResinMissingOption('appId');
      }
      options.appId = _.parseInt(options.appId);
      if (_.isNaN(options.appId)) {
        throw new errors.ResinInvalidOption('appId', options.appId);
      }
      if (options.network == null) {
        throw new errors.ResinMissingOption('network');
      }
      if (_.indexOf(NETWORK_TYPES, options.network) === -1) {
        throw new errors.ResinInvalidOption('network', options.network);
      }
      if (options.network === NETWORK_WIFI) {
        if (options.wifiSsid == null) {
          throw new errors.ResinMissingOption('wifiSsid');
        }
        if (options.wifiKey == null) {
          throw new errors.ResinMissingOption('wifiKey');
        }
      }
      invalidOptions = _.difference(_.keys(options), VALID_OPTIONS);
      if (!_.isEmpty(invalidOptions)) {
        throw new errors.ResinNonAllowedOption(_.first(invalidOptions));
      }
      _.extend(this, options);
    }

    return OSParams;

  })();

}).call(this);
