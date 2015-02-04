###*
# @module resin/server
# @private
###

_ = require('lodash')
async = require('async')
settings = require('./settings')
serverUtils = require('./server-utils')

###*
# @ignore
###
urlResolve = require('url').resolve

###*
# request callback
# @callback module:resin/server~requestCallback
# @param {(Error|null)} error - error
# @param {Object} response - response
# @param {Object} body - body
###

###*
# @summary Send an HTTP request to resin.io
# @private
# @function
#
# @description If the user is logged in, the token gets automatically added to Authorization header
# If the response is JSON, it will attempt to parse it
#
# @param {Object} options -  request options
# @option options {String} url - relative url
# @option options {String} json - request body
# @option options {String} method - http method
# @option options {Object} headers - custom http headers
# @option options {Function} pipe - define this function if you want to stream the response
#
# @param {module:resin/server~requestCallback} callback - callback
# @param {Function} [onProgress] - on progress callback
#
# @throws {Error} Will throw if no URL
#
# @todo This big function should be splitted to be better unit tested.
#
# @example
#	resin.server.request {
#		method: 'GET'
#		url: '/foobar'
#	}, (error, response, body) ->
#		throw error if error?
#		console.log(body)
#
#	@example
#	resin.server.request {
#		method: 'POST'
#		url: '/foobar'
#		json:
#			name: 'My FooBar'
#	}, (error, response, body) ->
#		throw error if error?
#		assert(response.statusCode is 201)
#
#	@example
#	resin.server.request {
#		method: 'GET'
#		url: '/download'
#		pipe: fs.createWriteStream('/tmp/download')
#	}, (error) ->
#		throw error if error?
#	, (state) ->
#		console.log("Received: #{state.received}")
#		console.log("Total: #{state.total}")
#		console.log("Is Complete? #{state.complete}")
###
exports.request = (options = {}, callback, onProgress = _.noop) ->

	if not options.url?
		throw new Error('Missing URL')

	options.url = urlResolve(settings.get('remoteUrl'), options.url)
	options.method = options.method.toUpperCase() if options.method?

	_.defaults options,
		method: 'GET'
		gzip: true

	async.waterfall([

		(callback) ->
			serverUtils.checkIfOnline(callback)

		(callback) ->
			serverUtils.authenticate(options, callback)

		(callback) ->
			if options.pipe?
				serverUtils.pipeRequest(options, callback, onProgress)
			else
				serverUtils.sendRequest(options, callback)

	], callback)

# @summary Generate shorthand functions for every method
#
# @private
#
# @todo Find a way to document all of the methods directly
#
createFacadeFunction = (method) ->
	lowerCaseMethod = method.toLowerCase()
	exports[lowerCaseMethod] = (url, body, callback, onProgress) ->
		options = {
			method
			url
		}

		if _.isFunction(body)
			onProgress = callback
			callback = body
		else
			options.json = body

		return exports.request(options, callback, onProgress)

for method in [
	'GET'
	'HEAD'
	'POST'
	'PATCH'
	'PUT'
	'DELETE'
]
	createFacadeFunction(method)
