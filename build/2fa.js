
/*
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function() {
  var request, token;

  token = require('resin-token');

  request = require('resin-request');


  /**
   * @summary Check if two factor authentication is enabled
   * @name isEnabled
   * @public
   * @function
   * @memberof resin.auth.twoFactor
   *
   * @fulfil {Boolean} - whether 2fa is enabled
   * @returns {Promise}
   *
   * @example
   * resin.auth.twoFactor.isEnabled().then(function(isEnabled) {
   * 	if (isEnabled) {
   * 		console.log('2FA is enabled for this account');
   * 	}
   * });
   *
   * @example
   * resin.auth.twoFactor.isEnabled(function(error, isEnabled) {
   * 	if (error) throw error;
   *
   * 	if (isEnabled) {
   * 		console.log('2FA is enabled for this account');
   * 	}
   * });
   */

  exports.isEnabled = function(callback) {
    return token.getProperty('twoFactorRequired').then(function(twoFactorRequired) {
      return twoFactorRequired != null;
    }).nodeify(callback);
  };


  /**
   * @summary Check if two factor authentication challenge was passed
   * @name isPassed
   * @public
   * @function
   * @memberof resin.auth.twoFactor
   *
   * @fulfil {Boolean} - whether 2fa challenge was passed
   * @returns {Promise}
   *
   * @example
   * resin.auth.twoFactor.isPassed().then(function(isPassed) {
   * 	if (isPassed) {
   * 		console.log('2FA challenge passed');
   * 	}
   * });
   *
   * @example
   * resin.auth.twoFactor.isPassed(function(error, isPassed) {
   * 	if (error) throw error;
   *
   * 	if (isPassed) {
   * 		console.log('2FA challenge passed');
   * 	}
   * });
   */

  exports.isPassed = function(callback) {
    return token.getProperty('twoFactorRequired').then(function(twoFactorRequired) {
      return !twoFactorRequired;
    }).nodeify(callback);
  };


  /**
   * @summary Challenge two factor authentication
   * @name challenge
   * @public
   * @function
   * @memberof resin.auth.twoFactor
   *
   * @param {String} code - code
   * @returns {Promise}
   *
   * @example
   * resin.auth.twoFactor.challenge('1234');
   *
   * @example
   * resin.auth.twoFactor.challenge('1234', function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.challenge = function(code, callback) {
    return request.send({
      method: 'POST',
      url: '/auth/totp/verify',
      body: {
        code: code
      }
    }).get('body').then(token.set).nodeify(callback);
  };

}).call(this);
