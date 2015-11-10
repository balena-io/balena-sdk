
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
  var _, auth, errors, pine;

  _ = require('lodash');

  errors = require('resin-errors');

  pine = require('resin-pine');

  auth = require('../auth');


  /**
   * @summary Get all ssh keys
   * @name getAll
   * @public
   * @function
   * @memberof resin.models.key
   *
   * @fulfil {Object[]} - ssh keys
   * @returns {Promise}
   *
   * @example
   * resin.models.key.getAll().then(function(keys) {
   * 	console.log(keys);
   * });
   *
   * @example
   * resin.models.key.getAll(function(error, keys) {
   * 	if (error) throw error;
   * 	console.log(keys);
   * });
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'user__has__public_key'
    }).nodeify(callback);
  };


  /**
   * @summary Get a single ssh key
   * @name get
   * @public
   * @function
   * @memberof resin.models.key
   *
   * @param {(String|Number)} id - key id
   * @fulfil {Object} - ssh key
   * @returns {Promise}
   *
   * @example
   * resin.models.key.get(51).then(function(key) {
   * 	console.log(key);
   * });
   *
   * @example
   * resin.models.key.get(51, function(error, key) {
   * 	if (error) throw error;
   * 	console.log(key);
   * });
   */

  exports.get = function(id, callback) {
    return pine.get({
      resource: 'user__has__public_key',
      id: id
    }).tap(function(key) {
      if (_.isEmpty(key)) {
        throw new errors.ResinKeyNotFound(id);
      }
    }).nodeify(callback);
  };


  /**
   * @summary Remove ssh key
   * @name remove
   * @public
   * @function
   * @memberof resin.models.key
   *
   * @param {(String|Number)} id - key id
   * @returns {Promise}
   *
   * @example
   * resin.models.key.remove(51);
   *
   * @example
   * resin.models.key.remove(51, function(error) {
   * 	if (error) throw error;
   * });
   */

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'user__has__public_key',
      id: id
    }).nodeify(callback);
  };


  /**
   * @summary Create a ssh key
   * @name create
   * @public
   * @function
   * @memberof resin.models.key
   *
   * @param {String} title - key title
   * @param {String} key - the public ssh key
   *
   * @fulfil {Number} - ssh key id
   * @returns {Promise}
   *
   * @example
   * resin.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(id) {
   * 	console.log(id);
   * });
   *
   * @example
   * resin.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, id) {
   * 	if (error) throw error;
   * 	console.log(id);
   * });
   */

  exports.create = function(title, key, callback) {
    key = key.trim();
    return auth.getUserId().then(function(userId) {
      return pine.post({
        resource: 'user__has__public_key',
        body: {
          title: title,
          public_key: key,
          user: userId
        }
      }).get('id');
    }).nodeify(callback);
  };

}).call(this);
