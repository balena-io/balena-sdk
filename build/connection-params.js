(function() {
  var ConnectionParams, NETWORK_ETHERNET, NETWORK_TYPES, NETWORK_WIFI, VALID_OPTIONS, _;

  _ = require('lodash');

  NETWORK_WIFI = 'wifi';

  NETWORK_ETHERNET = 'ethernet';

  NETWORK_TYPES = [NETWORK_WIFI, NETWORK_ETHERNET];

  VALID_OPTIONS = ['network', 'appId', 'wifiSsid', 'wifiKey'];


  /**
   * Create a set of connection parameters
   * @name ConnectionParams
   * @memberof module:resin/connection
   * @public
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

  module.exports = ConnectionParams = (function() {
    function ConnectionParams(options) {
      var invalidOptions;
      if (options.appId == null) {
        throw new Error('Missing appId');
      }
      options.appId = _.parseInt(options.appId);
      if (_.isNaN(options.appId)) {
        throw new Error('Invalid appId');
      }
      if (options.network == null) {
        throw new Error('Missing network');
      }
      if (_.indexOf(NETWORK_TYPES, options.network) === -1) {
        throw new Error("Invalid network type: " + options.network);
      }
      if (options.network === NETWORK_WIFI) {
        if (options.wifiSsid == null) {
          throw new Error('Missing wifiSsid');
        }
        if (options.wifiKey == null) {
          throw new Error('Missing wifiKey');
        }
      }
      invalidOptions = _.difference(_.keys(options), VALID_OPTIONS);
      if (!_.isEmpty(invalidOptions)) {
        throw new Error("Invalid option: " + (_.first(invalidOptions)));
      }
      _.extend(this, options);
    }

    return ConnectionParams;

  })();

}).call(this);
