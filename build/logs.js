
/**
 * @module resin.logs
 */

(function() {
  var PubNub, async, deviceModel, errors, _;

  async = require('async');

  _ = require('lodash-contrib');

  errors = require('resin-errors');

  deviceModel = require('./models/device');

  PubNub = require('./pubnub');


  /**
   * subscribe callback
   * @callback module:resin.logs~subscribeCallback
   * @param {(Error|null)} error - error
   */


  /**
   * @summary Subscribe to device logs by their UUID
   * @public
   * @function
   *
   * @param {String} uuid - the device uuid
   * @param {Object} options - logs options (history=0, tail=false)
   * @param {module:resin.logs~subscribeCallback} callback - callback
   *
   * @throws {Error} Will throw if `options.history` is not a number or parseable string.
   *
   * @todo Find a way to test this
   *
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.logs.subscribe uuid, {
   *		history: 20
   *		message: (message) ->
   *			console.log(message)
   * }, (error) ->
   *		throw error if error?
   *
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.logs.subscribe uuid, {
   *		tail: true
   *		message: (message) ->
   *			console.log(message)
   * }, (error) ->
   *		throw error if error?
   */

  exports.subscribe = function(uuid, options, callback) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      history: 0,
      tail: false,
      message: _.noop
    });
    if (!_.isNumber(options.history)) {
      throw new errors.ResinInvalidOption('history', options.history);
    }
    return async.waterfall([
      function(callback) {
        return deviceModel.isValidUUID(uuid, callback);
      }, function(isValidUUID, callback) {
        if (!isValidUUID) {
          return callback(new Error("Invalid uuid: " + uuid));
        }
        return PubNub.getInstance(callback);
      }, function(pubnub, callback) {
        var channel;
        channel = PubNub.getDeviceChannel(uuid);
        if (!options.tail) {
          return PubNub.getChannelHistory(pubnub, channel, {
            count: options.history
          }, function(error, messages) {
            if (error != null) {
              return callback(error);
            }
            _.each(messages, _.unary(options.message));
            return PubNub.unsubscribe(pubnub, channel, callback);
          });
        } else {
          return PubNub.subscribe(pubnub, channel, {
            message: options.message
          }, callback);
        }
      }
    ], callback);
  };

}).call(this);
