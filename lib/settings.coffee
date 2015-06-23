Promise = require('bluebird')
settings = require('resin-settings-client')

###*
# @summary Get a single setting
# @function
# @public
#
# @param {String} [key] - setting key
# @returns {Promise<*>} setting value
#
# @example
# resin.settings.get('remoteUrl').then (remoteUrl) ->
# 	console.log(remoteUrl)
###
exports.get = (key, callback) ->
	Promise.try ->
		return settings.get(key)
	.nodeify(callback)

###*
# @summary Get all settings
# @function
# @public
#
# @returns {Promise<Object>} settings
#
# @example
# resin.settings.getAll().then (settings) ->
# 	console.log(settings)
###
exports.getAll = (callback) ->
	return exports.get(null).nodeify(callback)
