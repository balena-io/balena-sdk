###*
# @module resin.models.key
###

_ = require('lodash-contrib')
errors = require('resin-errors')
resinRequest = require('resin-request')
settings = require('../settings')
auth = require('../auth')

###*
# A Resin API key
# @typedef {Object} Key
###

# TODO: Do this with pinejs once it's exposed as an OData API

###*
# getAll callback
# @callback module:resin.models.key~getAllCallback
# @param {(Error|null)} error - error
# @param {Key[]} keys - ssh keys
###

###*
# @summary Get all ssh keys
# @public
# @function
#
# @param {module:resin.models.key~getAllCallback} callback - callback
#
# @example
#	resin.models.key.getAll (error, keys) ->
#		throw error if error?
#		console.log(keys)
###
exports.getAll = (callback) ->
	auth.getToken (error, token) ->
		return callback(error) if error?

		resinRequest.request
			method: 'GET'
			url: settings.get('urls.keys')
			remoteUrl: settings.get('remoteUrl')
			token: token
		, (error, response, keys) ->
			return callback(error) if error?

			if _.isEmpty(keys)
				return callback(new errors.ResinNotAny('keys'))

			return callback(null, keys)

###*
# get callback
# @callback module:resin.models.key~getCallback
# @param {(Error|null)} error - error
# @param {Key} key - ssh key
###

###*
# @summary Get a single ssh key
# @public
# @function
#
# @param {(String|Number)} id - key id
# @param {module:resin.models.key~getCallback} callback - callback
#
# @example
#	resin.models.key.get 51, (error, key) ->
#		throw error if error?
#		console.log(key)
###
exports.get = (id, callback) ->
	auth.getToken (error, token) ->
		return callback(error) if error?

		resinRequest.request
			method: 'GET'
			url: settings.get('urls.keys')
			remoteUrl: settings.get('remoteUrl')
			token: token
		, (error, response, keys) ->
			return callback(error) if error?

			key = _.findWhere(keys, { id })

			if not key?
				return callback(new errors.ResinKeyNotFound(id))

			return callback(null, key)

###*
# remove callback
# @callback module:resin.models.key~removeCallback
# @param {(Error|null)} error - error
###

###*
# @summary Remove ssh key
# @public
# @function
#
# @param {(String|Number)} id - key id
# @param {module:resin.models.key~removeCallback} callback - callback
#
# @example
#	resin.models.key.remove 51, (error) ->
#		throw error if error?
###
exports.remove = (id, callback) ->
	url = settings.get('urls.sshKey')
	url = _.template(url, { id })

	auth.getToken (error, token) ->
		return callback(error) if error?

		resinRequest.request
			method: 'DELETE'
			url: url
			remoteUrl: settings.get('remoteUrl')
			token: token
		, _.unary(callback)

###*
# create callback
# @callback module:resin.models.key~createCallback
# @param {(Error|null)} error - error
###

###*
# @summary Create a ssh key
# @public
# @function
#
# @param {String} title - key title
# @param {String} key - the public ssh key
# @param {module:resin.models.key~createCallback} callback - callback
#
# @todo We should return an id for consistency with the other models
#
# @example
#	resin.models.key.create 'Main', 'ssh-rsa AAAAB....', (error) ->
#		throw error if error?
###
exports.create = (title, key, callback) ->

	# Avoid ugly whitespaces
	key = key.trim()

	auth.getToken (error, token) ->
		return callback(error) if error?

		resinRequest.request
			method: 'POST'
			url: settings.get('urls.keys')
			remoteUrl: settings.get('remoteUrl')
			token: token
			json: { title, key }
		, _.unary(callback)
