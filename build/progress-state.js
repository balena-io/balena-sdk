
/**
 * @module resin/progress-state
 * @protected
 */

(function() {
  var ProgressState, getCurrentTime, _;

  _ = require('lodash');


  /**
   * Represent a progress state
   * @name ProgressState
   * @protected
   * @class
   * @param {Object} options - progress state options
   *
   * A ProgressState instance consists of the following fields:
   *
   * - total.
   * - percentage.
   * - eta.
   * - received.
   * - delta.
   *
   * @throws {Error} If the state options are invalid
   */

  ProgressState = (function() {
    function ProgressState(options) {
      if (options.total != null) {
        if (!_.isNumber(options.total) || options.total < 0) {
          throw new Error("Invalid total option: " + options.total);
        }
      }
      if (options.percentage != null) {
        if (!_.isNumber(options.percentage) || options.percentage < 0 || options.percentage > 100) {
          throw new Error("Invalid percentage option: " + options.percentage);
        }
      }
      if (options.eta != null) {
        if (!_.isNumber(options.eta) || options.eta < 0) {
          throw new Error("Invalid eta option: " + options.eta);
        }
      }
      if (options.received == null) {
        throw new Error('Missing received option');
      }
      if (!_.isNumber(options.received) || options.received < 0) {
        throw new Error("Invalid received option: " + options.received);
      }
      if ((options.total != null) && options.received > options.total) {
        throw new Error("Received option can't be higher than total: " + options.received + " > " + options.total);
      }
      if (options.delta == null) {
        throw new Error('Missing delta option');
      }
      if (!_.isNumber(options.delta) || options.delta < 0) {
        throw new Error("Invalid delta option: " + options.delta);
      }
      if ((options.total != null) && options.delta > options.total) {
        throw new Error("Delta option can't be higher than total: " + options.delta + " > " + options.total);
      }
      if (options.delta > options.received) {
        throw new Error("Delta option can't be higher than received: " + options.delta + " > " + options.received);
      }
      _.extend(this, options);
    }

    return ProgressState;

  })();

  getCurrentTime = function() {
    return new Date().getTime();
  };


  /**
   * createFromNodeRequestProgress callback
   * @callback module:resin/auth~createFromNodeRequestProgressCallback
   * @param {module:resin/progress-state~ProgressState} state - progress state
   */


  /**
   * @summary Create a ProgressState listener from a node-request-progress state
   * @protected
   * @function
   *
   * @param {module:resin/auth~createFromNodeRequestProgressCallback} callback - callback
   *
   * @example
   * request = require('request')
   * progress = require('request-progress')
   *
   * onProgressCallback = (state) ->
   *		console.log(state.percentage)
   *
   * progress(request(options))
   *		.on('progress', ProgressState.createFromNodeRequestProgress(onProgressCallback))
   *		.on('error', ...)
   *		.on('close', ...)
   */

  ProgressState.createFromNodeRequestProgress = function(callback) {
    var received, time;
    time = getCurrentTime();
    received = 0;
    return function(state) {
      var eta, newTime, progressState, receivedDelta, remaining, remainingTicks, timeDelta;
      newTime = getCurrentTime();
      remaining = state.total - state.received;
      receivedDelta = state.received - received;
      remainingTicks = remaining / receivedDelta;
      timeDelta = newTime - time;
      eta = Math.floor(remainingTicks * timeDelta);
      time = newTime;
      progressState = new ProgressState({
        percentage: state.percent,
        received: state.received,
        total: state.total,
        eta: eta,
        delta: receivedDelta
      });
      return callback(progressState);
    };
  };

  module.exports = ProgressState;

}).call(this);
