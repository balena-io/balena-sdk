assign = require('lodash/assign')
promiseMemoize = require('promise-memoize')

IMG_MAKER_API_VERSION = '1'
IMG_MAKER_API_PREFIX = "/api/v#{IMG_MAKER_API_VERSION}"

DEFAULT_RESULTS_CACHING_INTERVAL = 10 * 60 * 1000 # 10 minutes

getImgMakerHelper = (imageMakerUrl, request) ->
	exports = {}

	buildOptions = (options) ->
		{ url } = options
		url = "#{IMG_MAKER_API_PREFIX}#{url}"

		return assign({ method: 'GET' }, options, { url, baseUrl: imageMakerUrl })

	exports.request = sendRequest = (options) ->
		request.send(buildOptions(options))

	exports.stream = (options) ->
		request.stream(buildOptions(options))

	defaultBuildImgMakerUrl = ({ url, deviceType, version }) ->
		url += "?deviceType=#{deviceType}"
		if version
			url += "&version=#{version}"
		return url

	# NB: for the sake of memoization currently only works with GET requests
	exports.buildApiRequester = ({
		url = '',
		withVersion = false,
		postProcess,
		onError,
		buildUrl = defaultBuildImgMakerUrl,
		maxAge
	} = {}) ->

		if withVersion
			normalizer = ([ deviceType, version ]) -> "#{deviceType}@#{version}"
		else
			normalizer = ([ deviceType ]) -> deviceType

		callHelper = (deviceType, version) ->
			fullUrl = buildUrl({ url, deviceType, version })
			p = sendRequest(url: fullUrl)

			if postProcess
				p = p.then(postProcess)
			if onError
				p = p.catch(onError)

			return p

		# set to default if not passed
		if maxAge is undefined
			maxAge = DEFAULT_RESULTS_CACHING_INTERVAL
		# use `null` for explicit "don't set"
		else if maxAge is null
			maxAge = undefined

		memoizedFn = promiseMemoize(callHelper, { resolve: normalizer, maxAge })

		return (deviceType, version) ->
			if withVersion
				version or= 'latest'
			return memoizedFn(deviceType, version)

	return exports

module.exports = getImgMakerHelper
