assign = require('lodash/assign')
getUnauthenticatedRequestHelper = require('./unauthenticated-request-helper')

IMG_MAKER_API_VERSION = '1'
IMG_MAKER_API_PREFIX = "/api/v#{IMG_MAKER_API_VERSION}"

DEFAULT_RESULTS_CACHING_INTERVAL = 10 * 60 * 1000 # 10 minutes

getImageMakerHelper = (baseUrl, request) ->
	exports = getUnauthenticatedRequestHelper(baseUrl, request)

	baseBuildOptions = exports.buildOptions

	exports.buildOptions = (options) ->
		{ url } = options
		url = "#{IMG_MAKER_API_PREFIX}#{url}"
		return assign(baseBuildOptions(options), { url })

	return exports

module.exports = getImageMakerHelper
