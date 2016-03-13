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

_ = require('lodash')

###*
# @summary Default settings
# @namespace settings
# @private
###
settings =

	###*
	# @property {String} resinUrl - Resin.io url
	# @memberof settings
	###
	resinUrl: 'resin.io'

	###*
	# @property {Function} apiUrl - Resin.io API url
	# @memberof settings
	###
	apiUrl: ->
		return "https://api.#{@resinUrl}"

	###*
	# @property {Function} pineUrl - Resin.io Pine API url
	# @memberof settings
	###
	pineUrl: ->
		return "#{@apiUrl?() or @apiUrl}/ewa/"

	###*
	# @property {Function} vpnUrl - Resin.io VPN url
	# @memberof settings
	###
	vpnUrl: ->
		return "vpn.#{@resinUrl}"

	###*
	# @property {Function} registryUrl - Resin.io Registry url
	# @memberof settings
	###
	registryUrl: ->
		return "registry.#{@resinUrl}"

	###*
	# @property {Function} imageMakerUrl - Resin.io Image Maker url
	# @memberof settings
	###
	imageMakerUrl: ->
		return "https://img.#{@resinUrl}"

	###*
	# @property {Function} deltaUrl - Resin.io Delta url
	# @memberof settings
	###
	deltaUrl: ->
		return "https://delta.#{@resinUrl}"

	###*
	# @property {Function} dashboardUrl - Resin.io dashboard url
	# @memberof settings
	###
	dashboardUrl: ->
		return "https://dashboard.#{@resinUrl}"

evaluateSettings = ->
	return _.chain(settings)
		.mapValues (value, key) ->
			value = _.get(settings, key)

			if _.isFunction(value)
				value = value.call(settings)

			return value
		.omit (value) ->
			return _.isUndefined(value) or _.isNull(value)
		.value()

cachedSettings = evaluateSettings()

###*
# @summary Set settings
# @name set
# @function
# @public
# @memberof resin.settings
#
# @param {(String|Object)} [key] - setting key
# @param {*} [value] - setting value
#
# @example
# resin.settings.set('resinUrl', 'resin.io');
#
# @example
# resin.settings.set({
#   resinUrl: 'resin.io',
#   apiUrl: 'https://api.resin.io'
# });
###
exports.set = (key, value) ->
	if _.isPlainObject(key) and not value?
		_.assign(settings, key)
	else
		_.set(settings, key, value)

	# Evaluate all settings functions after a setting
	# was added/changed for performance reasons,
	# since .get() and .getAll() only have to query
	# for primitive properties instead of re-evaluating
	# setting functions each time.
	cachedSettings = evaluateSettings()

###*
# @summary Get a single setting
# @name get
# @function
# @public
# @memberof resin.settings
#
# @param {String} [key] - setting key
# @returns {*} - setting value
#
# @example
# var apiUrl = resin.settings.get('apiUrl');
###
exports.get = (key) ->
	return _.get(cachedSettings, key)

###*
# @summary Get all settings
# @name getAll
# @function
# @public
# @memberof resin.settings
#
# @returns {Object} - settings
#
# @example
# var settings = resin.settings.getAll();
###
exports.getAll = ->
	return _.clone(cachedSettings)
