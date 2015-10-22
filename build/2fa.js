
/*
The MIT License

Copyright (c) 2015 Resin.io, Inc. https://resin.io.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
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
   * resin.auth.twoFactor.isEnabled().then (isEnabled) ->
   * 	if isEnabled
   * 		console.log('2FA is enabled for this account')
   *
   * @example
   * resin.auth.twoFactor.isEnabled (error, isEnabled) ->
   * 	throw error if error?
   *
   * 	if isEnabled
   * 		console.log('2FA is enabled for this account')
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
   * resin.auth.twoFactor.isPassed().then (isPassed) ->
   * 	if isPassed
   * 		console.log('2FA challenge passed')
   *
   * @example
   * resin.auth.twoFactor.isPassed (error, isPassed) ->
   * 	throw error if error?
   *
   * 	if isPassed
   * 		console.log('2FA challenge passed')
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
   * resin.auth.twoFactor.challenge('1234')
   *
   * @example
   * resin.auth.twoFactor.challenge '1234', (error) ->
   * 	throw error if error?
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
