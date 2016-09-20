###
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

memoize = require('memoizee')
mapValues = require('lodash/mapValues')
defaults = require('lodash/defaults')
getRequest = require('resin-request')
getToken = require('resin-token')
getPine = require('resin-pine')
{ notImplemented } = require('./util')

###*
# @namespace resin
# @description
# Welcome to the Resin SDK documentation.
#
# This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.
#
# If you feel something is missing, not clear or could be improved, please don't hesitate to open an [issue in GitHub](https://github.com/resin-io/resin-sdk/issues/new), we'll be happy to help.
###
sdkTemplate =

	###*
	# @namespace models
	# @memberof resin
	###
	models: require('./models')

	###*
	# @namespace auth
	# @memberof resin
	###
	auth: require('./auth')

	###*
	# @namespace logs
	# @memberof resin
	###
	logs: require('./logs')

	###*
	# @namespace settings. **Only implemented in Node.js**
	# @memberof resin
	###
	settings: require('./settings')


### opts:
apiUrl
apiVersion?
apiKey?
dataDirectory?
imageMakerUrl
###

getSdk = (opts) ->
	defaults opts,
		apiVersion: 'v1',
		isBrowser: window?

	if opts.isBrowser
		settings =
			get: notImplemented
			getAll: notImplemented
	else
		settings = require('resin-settings-client')

	deps = {
		settings,
		request: getRequest(opts),
		token: getToken(opts),
		pine: getPine(opts)
	}

	return mapValues(sdkTemplate, (v) -> v(deps, opts))

module.exports = memoize(getSdk)
