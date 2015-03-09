
/**
 * @module resin.logs
 */

(function() {
  var PubNub, _, configModel, errors, settings;

  _ = require('lodash-contrib');

  PubNub = require('pubnub');

  settings = require('./settings');

  errors = require('./errors');

  configModel = require('./models/config');


  /**
   * subscribe callback
   * @callback module:resin.logs~subscribeCallback
   * @param {(Error|null)} error - error
   * @param {String|String[]} message - log message
   */


  /**
   * @summary Subscribe to device logs by their UUID
   * @public
   * @function
  #
   * @param {String} uuid - the device uuid
   * @param {Object} options - logs options (history=0, tail=false)
   * @param {module:resin.logs~subscribeCallback} callback - callback
  #
   * @throws {Error} Will throw if `options.history` is not a number or parseable string.
  #
   * @todo Find a way to test this
  #
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.logs.subscribe uuid, {
  #		history: 20
   * }, (error, message) ->
  #		throw error if error?
  #		console.log(message)
  #
   * @example
   * uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
   * resin.logs.subscribe uuid, {
  #		tail: true
   * }, (error, message) ->
  #		throw error if error?
  #		console.log(message)
   */

  exports.subscribe = function(uuid, options, callback) {
    var channel, pubnubOptions;
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      history: 0,
      tail: false
    });
    if (!_.isNumber(options.history)) {
      return callback(new errors.ResinInvalidOption('history', options.history));
    }
    pubnubOptions = settings.get('pubnub');
    channel = _.template(settings.get('events.deviceLogs'), {
      uuid: uuid
    });
    return configModel.getPubNubKeys(function(error, pubnubKeys) {
      var pubnub;
      if (error != null) {
        return callback(error);
      }
      _.extend(pubnubKeys, pubnubOptions);
      pubnub = PubNub.init(pubnubKeys);
      return pubnub.subscribe({
        channel: channel,
        callback: function(message) {
          if (!options.tail) {
            return;
          }
          return callback(null, message);
        },
        error: _.unary(callback),
        connect: function() {
          return pubnub.history({
            count: options.history,
            channel: channel,
            error: _.unary(callback),
            callback: function(message) {
              if (options.tail) {
                return callback(null, _.first(message));
              }
              return pubnub.unsubscribe({
                channel: channel
              }, function() {
                return callback(null, _.first(message));
              });
            }
          });
        }
      });
    });
  };

}).call(this);
