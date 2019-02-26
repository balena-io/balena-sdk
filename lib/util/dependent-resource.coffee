###
Copyright 2017 Balena

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

###
This file contains an abstract implementation for dependent metadata resources:
key-value resources directly attached to a parent (e.g. tags, config variables).
###

Promise = require('bluebird')
isEmpty = require('lodash/isEmpty')
errors = require('balena-errors')

{
	findCallback
	isId
	mergePineOptions
	unauthorizedError
	isUniqueKeyViolationResponse
} = require('../util')

exports.buildDependentResource = (
	{ pine }
	{
		resourceName # e.g. device_tag
		resourceKeyField # e.g. tag_key
		parentResourceName # e.g. device
		getResourceId # e.g. getId(uuidOrId)
		ResourceNotFoundError # e.g. DeviceNotFoundError
	}
) ->
	exports = {
		getAll: (options = {}, callback) ->
			callback = findCallback(arguments)

			pine.get
				resource: resourceName
				options:
					mergePineOptions
						$orderby: "#{resourceKeyField} asc"
					, options
			.asCallback(callback)

		getAllByParent: (parentParam, options = {}, callback) ->
			callback = findCallback(arguments)

			getResourceId(parentParam).then (id) ->
				exports.getAll(
					mergePineOptions
						$filter: "#{parentResourceName}": id
						$orderby: "#{resourceKeyField} asc"
					, options
				)
			.asCallback(callback)

		get: (parentParam, key, callback) ->
			callback = findCallback(arguments)

			getResourceId(parentParam).then (id) ->
				pine.get
					resource: resourceName
					options:
						$filter:
							"#{parentResourceName}": id
							"#{resourceKeyField}": key
			.then (results) ->
				if (results[0])
					results[0].value
			.asCallback(callback)

		set: (parentParam, key, value, callback) ->
			Promise.try ->
				value = String(value)

				# Trying to avoid an extra HTTP request
				# when the provided parameter looks like an id.
				# Note that this throws an exception for missing names/uuids,
				# but not for missing ids
				if isId(parentParam)
					return parentParam
				else
					getResourceId(parentParam)
			.then (parentId) ->
				pine.post
					resource: resourceName
					body:
						"#{parentResourceName}": parentId
						"#{resourceKeyField}": key
						value: value
				.tapCatch unauthorizedError, ->
					# On Pine 7, when the post throws a 401
					# then the associated parent resource might not exist.
					# If we never checked that the resource actually exists
					# then we should reject an appropriate error.
					if not isId(parentParam)
						return
					getResourceId(parentParam)
				.catch isUniqueKeyViolationResponse, ->
					pine.patch
						resource: resourceName
						options:
							$filter:
								"#{parentResourceName}": parentId
								"#{resourceKeyField}": key
						body:
							value: value
			.asCallback(callback)

		remove: (parentParam, key, callback) ->
			getResourceId(parentParam).then (parentId) ->
				pine.delete
					resource: "#{resourceName}"
					options:
						$filter:
							"#{parentResourceName}": parentId
							"#{resourceKeyField}": key
			.asCallback(callback)
	}

	return exports
