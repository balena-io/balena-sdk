assign = require('lodash/assign')
promiseMemoize = require('promise-memoize')

DEFAULT_RESULTS_CACHING_INTERVAL = 10 * 60 * 1000 # 10 minutes

getUnauthenticatedRequestHelper = (baseUrl, request) ->
	exports = {}

	exports.buildOptions = (options) ->
		return assign(
			{ method: 'GET' },
			options,
			{ baseUrl, sendToken: false }
		)

	exports.request = sendRequest = (options) ->
		request.send(exports.buildOptions(options))

	exports.stream = (options) ->
		request.stream(exports.buildOptions(options))

	# NB: for the sake of memoization currently only works with GET requests
	exports.buildMemoizedApiRequester = ({
		buildUrl,
		postProcess = (x) -> x,
		onError = (x) -> throw x,
		maxAge
	} = {}) ->
		callHelper = (deviceType, version) ->
			sendRequest url: buildUrl(
				deviceType: encodeURIComponent(deviceType)
				version: encodeURIComponent(version)
			)
			.then(postProcess)
			.catch(onError)

		# set to default if not passed
		if maxAge is undefined
			maxAge = DEFAULT_RESULTS_CACHING_INTERVAL
		# use `null` for explicit "don't set"
		else if maxAge is null
			maxAge = undefined

		memoizedFunction = promiseMemoize(callHelper, { maxAge })

		return (deviceType, version = 'latest') ->
			memoizedFunction(deviceType, version)

	return exports

module.exports = getUnauthenticatedRequestHelper
