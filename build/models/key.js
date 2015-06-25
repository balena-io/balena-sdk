
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


/**
 * @module resin.models.key
 */

(function() {
  var _, auth, errors, pine;

  _ = require('lodash');

  errors = require('resin-errors');

  pine = require('resin-pine');

  auth = require('../auth');


  /**
   * @summary Get all ssh keys
   * @public
   * @function
   *
   * @returns {Promise<Object[]>} ssh keys
   *
   * @example
   * resin.models.key.getAll().then (keys) ->
   * 	console.log(keys)
   */

  exports.getAll = function(callback) {
    return pine.get({
      resource: 'user__has__public_key'
    }).nodeify(callback);
  };


  /**
   * @summary Get a single ssh key
   * @public
   * @function
   *
   * @param {(String|Number)} id - key id
   * @returns {Promise<Object>} ssh key
   *
   * @example
   * resin.models.key.get(51).then (key) ->
   * 	console.log(key)
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
   * @public
   * @function
   *
   * @param {(String|Number)} id - key id
   * @returns {Promise}
   *
   * @example
   * resin.models.key.remove(51)
   */

  exports.remove = function(id, callback) {
    return pine["delete"]({
      resource: 'user__has__public_key',
      id: id
    }).nodeify(callback);
  };


  /**
   * @summary Create a ssh key
   * @public
   * @function
   *
   * @param {String} title - key title
   * @param {String} key - the public ssh key
   *
   * @returns {Promise<Number>} ssh key id
   *
   * @todo We should return an id for consistency with the other models
   *
   * @example
   * resin.models.key.create('Main', 'ssh-rsa AAAAB....').then (id) ->
   * 	console.log(id)
   */

  exports.create = function(title, key, callback) {
    key = key.trim();
    return pine.post({
      resource: 'user__has__public_key',
      body: {
        title: title,
        key: key
      }
    }).get('id').nodeify(callback);
  };

}).call(this);
