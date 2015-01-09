###*
# @module resin/data
###

_ = require('lodash')
fs = require('fs')
path = require('path')
rimraf = require('rimraf')
errors = require('./errors')

###*
# @namespace resin/data
###

###*
# @name prefix
# @public
# @memberof resin/data
# @see {@link module:resin/data/prefix}
###
exports.prefix = require('./data-prefix')

###*
# @ignore
###
haltIfNoPrefix = (callback) ->
	return ->
		if not exports.prefix.get()?
			throw new Error('Did you forget to set a prefix?')
		return callback.apply(null, arguments)

###*
# @ignore
###
constructPath = (key) ->
	if not _.isString(key)
		throw new errors.InvalidKey()

	prefix = exports.prefix.get()
	return path.join(prefix, key)

###*
# get callback
# @callback module:resin/data~getCallback
# @param {(Error|null)} error - error
# @param {(String|Buffer)} value - key value
###

###*
# @summary Get data by key
# @public
# @function
#
# @description We call "data" to the information saved by the application in order to work properly.
# Examples of data are the token, cached downloads and much more.
#
# @param {String} key - path relative to dataPrefix
# @param {Object} options - node fs options for when reading the resource
# @param {module:resin/data~getCallback} callback - callback
#
# @example
#	resin.data.get 'token', encoding: 'utf8', (error, token) ->
#		throw error if error?
#		console.log(token)
#
#	@example
#	# Note: You should use the appropriate path.sep for your os
#	# http://nodejs.org/api/path.html#path_path_sep
#	resin.data.get 'my/nested/token', encoding: 'utf8', (error, token) ->
#		throw error if error?
#		console.log(token)
###
exports.get = haltIfNoPrefix (key, options, callback) ->
	exports.has key, (hasKey) ->
		if not hasKey

			# Pass undefined explicitly, otherwise
			# async gets confused
			return callback?(null, undefined)

		keyPath = constructPath(key)
		fs.readFile(keyPath, options, callback)

###*
# getText callback
# @callback module:resin/data~getTextCallback
# @param {(Error|null)} error - error
# @param {String} value - key value
###

###*
# @summary Get data by key as text
# @public
# @function
#
# @description This is the same as {@link module:resin/data.get}, however it assumes utf8 encoding.
#
# @param {String} key - path relative to dataPrefix
# @param {module:resin/data~getTextCallback} callback - callback
#
# @example
#	resin.data.getText 'myTextFile', (error, data) ->
#		throw error if error?
#		console.log(data)
###
exports.getText = haltIfNoPrefix (key, callback) ->
	exports.get(key, encoding: 'utf8', callback)

###*
# set callback
# @callback module:resin/data~setCallback
# @param {(Error|null)} error - error
###

###*
# @summary Set/Update a data resource
# @public
# @function
#
# @description You can save a buffer, but we strongly recommend saving plain text when possible
#
# @param {String} key - path relative to dataPrefix
# @param {(String|Buffer)} - value key value
# @param {Object} options - node fs options for when reading the resource
# @param {module:resin/data~setCallback} callback - callback
#
# @example
#	resin.data.set 'customValue', 'Hello World', encoding: 'utf8', (error) ->
#		throw error if error?
#		console.log("Value saved to #{resin.data.prefix.get()}/customValue")
###
exports.set = haltIfNoPrefix (key, value, options, callback) ->
	keyPath = constructPath(key)
	fs.writeFile(keyPath, value, options, callback)

###*
# setText callback
# @callback module:resin/data~setTextCallback
# @param {(Error|null)} error - error
###

###*
# @summary Set/Update a data resource as text
# @public
# @function
#
# @description This is the same as {@link module:resin/data.set}, however it assumes utf8 encoding.
#
# @param {String} key - path relative to dataPrefix
# @param {(String|Buffer)} value - key value
# @param {module:resin/data~setTextCallback} callback - callback
#
# @throws {Error} Will throw if data prefix was not previously set
#
# @example
#	resin.data.setText 'greeting/en', 'Hello World!', (error) ->
#		throw error if error?
###
exports.setText = haltIfNoPrefix (key, value, callback) ->
	exports.set(key, value, encoding: 'utf8', callback)

###*
# has callback
# @callback module:resin/data~hasCallback
# @param {Boolean} hasKey - has key
###

###*
# @summary Check if value exists
# @public
# @function
#
# @param {String} key - path relative to dataPrefix
# @param {module:resin/data~hasCallback} callback - callback
#
# @throws {Error} Will throw if data prefix was not previously set
#
# @example
#	resin.data.has 'foo/bar', (hasFooBar) ->
#		if hasFooBar
#			console.log('It\'s there!')
#		else
#			console.log('It\'s not there!')
###
exports.has = haltIfNoPrefix (key, callback) ->
	keyPath = constructPath(key)
	fs.exists(keyPath, callback)

###*
# remove callback
# @callback module:resin/data~removeCallback
# @param {(Error|null)} error - error
###

###*
# @summary Remove a key
# @public
# @function
#
# @param {String} key - path relative to dataPrefix
# @param {module:resin/data~removeCallback} [callback=_.noop] - callback
#
# @throws {Error} Will throw if data prefix was not previously set
#
# @example
#	resin.data.remove 'token', (error) ->
#		throw error if error?
###
exports.remove = haltIfNoPrefix (key, callback = _.noop) ->
	try
		keyPath = constructPath(key)
	catch error
		return callback(error)

	rimraf(keyPath, callback)
