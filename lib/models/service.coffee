###
Copyright 2018 Resin.io

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

once = require('lodash/once')
errors = require('resin-errors')

{ findCallback, mergePineOptions } = require('../util')

getServiceModel = (deps, opts) ->
	{ pine } = deps
	applicationModel = once -> require('./application')(deps, opts)

	exports = {}

	###*
	# @summary Get all services from an application
	# @name getAllByApplication
	# @public
	# @function
	# @memberof resin.models.service
	#
	# @param {String|Number} nameOrId - application name (string) or id (number)
	# @param {Object} [options={}] - extra pine options to use
	# @fulfil {Object[]} - services
	# @returns {Promise}
	#
	# @example
	# resin.models.service.getAllByApplication('MyApp').then(function(services) {
	#		console.log(services);
	# });
	#
	# @example
	# resin.models.service.getAllByApplication(123).then(function(services) {
	#		console.log(services);
	# });
	#
	# @example
	# resin.models.service.getAllByApplication('MyApp', function(error, services) {
	#		if (error) throw error;
	#		console.log(services);
	# });
	###
	exports.getAllByApplication = (nameOrId, options = {}, callback) ->
		callback = findCallback(arguments)

		applicationModel().get(nameOrId, $select: 'id')
		.then ({ id }) ->
			return pine.get
				resource: 'service'
				options:
					mergePineOptions
						$filter: application: id
					, options
		.asCallback(callback)

	return exports

module.exports = getServiceModel
