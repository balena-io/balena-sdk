_ = require('lodash')
Promise = require('bluebird')
PinejsClientCore = require('pinejs-client/core')(_, Promise)
settings = require('./settings')
server = require('./server')
promisifiedServerRequest = Promise.promisify(server.request, server)

class PinejsClientRequest extends PinejsClientCore

	###*
	# @summary Trigger a request to the resin.io API
	# @private
	#
	# @description Makes use of [pinejs-client-js](https://github.com/resin-io/pinejs-client-js)
	# You shouldn't make use of this method directly, but through models
	#
	# @param {Object} params - request params (same as node-request params)
	###
	_request: (params) ->
		params.json = true
		params.gzip ?= true
		promisifiedServerRequest(params).spread (response, body) ->
			if 200 <= response.statusCode < 300
				return body
			throw new Error(body)

module.exports = new PinejsClientRequest
	apiPrefix: settings.get('apiPrefix')
