###*
# @module resin/server-utils
# @private
###

progress = require('request-progress')
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
		return callback(new Error('You need internet connection to perform this task'))

###*
# @ignore
# @private
###
exports.addAuthorizationHeader = (headers = {}, token) ->
	if not token?
		throw new Error('Missing token')

	headers.Authorization = "Bearer #{token}"
	return headers

###*
# @ignore
# @private
###
exports.authenticate = (options, callback) ->

	if not options?
		throw new Error('Missing options')

	auth.getToken (error, token) ->
		return callback(error) if error?

		if token?
			options.headers = exports.addAuthorizationHeader(options.headers, token)

		return callback()

###*
# @ignore
# @private
###

# TODO: Find a way to test this
# TODO: Throw error if no options.pipe
exports.pipeRequest = (options, callback, onProgress) ->
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
			return callback(new Error(response.body))

		try
			response.body = JSON.parse(response.body)

		return callback(null, response, response.body)
