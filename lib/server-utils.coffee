###*
# @module resin.server.utils
# @private
###

progress = require('request-progress')
errors = require('resin-errors')
connection = require('./connection')
auth = require('./auth')
ProgressState = require('./progress-state')

###*
# @ignore
# @private
###
exports.checkIfOnline = (callback) ->
	connection.isOnline (error, isOnline) ->
		return callback(error) if error?
		return callback() if isOnline
		return callback(new errors.ResinNoInternetConnection())

###*
# @ignore
# @private
###
exports.addAuthorizationHeader = (headers = {}, token) ->
	if not token?
		throw new errors.ResinMissingParameter('token')

	headers.Authorization = "Bearer #{token}"
	return headers

###*
# @ignore
# @private
###
exports.authenticate = (options, callback) ->

	if not options?
		throw new errors.ResinMissingParameter('options')

	auth.getToken (error, token) ->
		return callback(error) if error?

		if token?
			options.headers = exports.addAuthorizationHeader(options.headers, token)

		return callback()

###*
# @ignore
# @private
###

exports.pipeRequest = (options, callback, onProgress) ->

	if not options?
		throw new errors.ResinMissingParameter('options')

	if not options.pipe?
		throw new errors.ResinMissingOption('pipe')

	# TODO: Find a way to test this
	progress(connection.request(options))
		.on('progress', ProgressState.createFromNodeRequestProgress(onProgress))
		.on('error', callback)
		.pipe(options.pipe)
		.on('error', callback)
		.on('close', callback)

###*
# @ignore
# @private
###
exports.sendRequest = (options, callback) ->
	connection.request options, (error, response) ->
		return callback(error) if error?

		if response.statusCode >= 400
			return callback(new errors.ResinRequestError(response.body))

		try
			response.body = JSON.parse(response.body)

		return callback(null, response, response.body)
