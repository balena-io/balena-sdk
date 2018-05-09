###
Copyright 2017 Resin.io

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
This file contains an abstract implementation for resource tags and the
methods defined here will not be part of the models namespace. The `tagsModel`
method is used as a factory method to create the tag models for the
`application` and `device` resources and expose them as a nested namespace.
###

Promise = require('bluebird')
isEmpty = require('lodash/isEmpty')
errors = require('resin-errors')

{
	findCallback
	isId
	mergePineOptions
	unauthorizedError
	uniqueKeyViolated
} = require('../util')

exports.tagsModel = (
	{ pine }
	{
		associatedResource
		getResourceId
		ResourceNotFoundError
	}
) ->
	exports = {}

	exports.getAll = (options = {}, callback) ->
		callback = findCallback(arguments)

		pine.get
			resource: "#{associatedResource}_tag"
			options: mergePineOptions
				orderby: 'tag_key asc'
			, options
		.asCallback(callback)

	exports.set = (uniqueParam, tagKey, value, callback) ->
		Promise.try ->
			value = String(value)

			# Trying to avoid an extra HTTP request
			# when the provided parameter looks like an id.
			# Note that this throws an exception for missing names/uuids,
			# but not for missing ids
			if isId(uniqueParam)
				return uniqueParam
			else
				getResourceId(uniqueParam)
		.then (resourceId) ->
			pine.post
				resource: "#{associatedResource}_tag"
				body:
					"#{associatedResource}": resourceId
					tag_key: tagKey
					value: value
			.tap (tag) ->
				# On Pine 6, when the post adds nothing to the DB
				# then the associated tagged resource was not found.
				# If we never checked that the resource actually exists
				# then we should reject an appropriate error.
				if isId(uniqueParam) && isEmpty(tag)
					throw new ResourceNotFoundError(uniqueParam)
			.tapCatch unauthorizedError, ->
				# On Pine 7, when the post throws a 401
				# then the associated tagged resource might not exist.
				# If we never checked that the resource actually exists
				# then we should reject an appropriate error.
				if not isId(uniqueParam)
					return
				getResourceId(uniqueParam)
			.catch uniqueKeyViolated, ->
				pine.patch
					resource: "#{associatedResource}_tag"
					options:
						filter:
							"#{associatedResource}": resourceId
							tag_key: tagKey
					body:
						value: value
		.asCallback(callback)

	exports.remove = (uniqueParam, tagKey, callback) ->
		Promise.try ->
			getResourceId(uniqueParam).then (resourceId) ->
				pine.delete
					resource: "#{associatedResource}_tag"
					options:
						filter:
							"#{associatedResource}": resourceId
							tag_key: tagKey
		.asCallback(callback)

	return exports
