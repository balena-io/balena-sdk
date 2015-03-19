_ = require('lodash')
Promise = require('bluebird')
request = require('resin-request')
PinejsClientCore = require('pinejs-client/core')(_, Promise)
promisifiedRequest = Promise.promisify(request.request, request)

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

		promisifiedRequest(params).spread (response, body) ->
			if 200 <= response.statusCode < 300
				return body
			throw new Error(body)

module.exports = new PinejsClientRequest
	apiPrefix: '/ewa/'
