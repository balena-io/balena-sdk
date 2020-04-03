/*
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
*/

/*
This file contains an abstract implementation for dependent metadata resources:
key-value resources directly attached to a parent (e.g. tags, config variables).
*/

import * as Promise from 'bluebird';

import { isId, isUnauthorizedResponse, mergePineOptions } from '../util';

export function buildDependentResource(
	{ pine },
	{
		resourceName, // e.g. device_tag
		resourceKeyField, // e.g. tag_key
		parentResourceName, // e.g. device
		getResourceId, // e.g. getId(uuidOrId)
	},
) {
	const exports = {
		getAll(options) {
			if (options == null) {
				options = {};
			}

			return pine.get({
				resource: resourceName,
				options: mergePineOptions(
					{ $orderby: `${resourceKeyField} asc` },
					options,
				),
			});
		},

		getAllByParent(parentParam, options) {
			if (options == null) {
				options = {};
			}

			return getResourceId(parentParam).then((id) =>
				exports.getAll(
					mergePineOptions(
						{
							$filter: { [parentResourceName]: id },
							$orderby: `${resourceKeyField} asc`,
						},
						options,
					),
				),
			);
		},

		get(parentParam, key) {
			return getResourceId(parentParam)
				.then((id) =>
					pine.get({
						resource: resourceName,
						options: {
							$filter: {
								[parentResourceName]: id,
								[resourceKeyField]: key,
							},
						},
					}),
				)
				.then(function (results) {
					if (results[0]) {
						return results[0].value;
					}
				});
		},

		set(parentParam, key, value) {
			return Promise.try(function () {
				value = String(value);

				// Trying to avoid an extra HTTP request
				// when the provided parameter looks like an id.
				// Note that this throws an exception for missing names/uuids,
				// but not for missing ids
				if (isId(parentParam)) {
					return parentParam;
				} else {
					return getResourceId(parentParam);
				}
			}).then((parentId) =>
				pine
					.upsert({
						resource: resourceName,
						id: {
							[parentResourceName]: parentId,
							[resourceKeyField]: key,
						},
						body: {
							value,
						},
					})
					.tapCatch(isUnauthorizedResponse, function () {
						// Since Pine 7, when the post throws a 401
						// then the associated parent resource might not exist.
						// If we never checked that the resource actually exists
						// then we should reject an appropriate error.
						if (!isId(parentParam)) {
							return;
						}
						return getResourceId(parentParam);
					}),
			);
		},

		remove(parentParam, key) {
			return getResourceId(parentParam).then((parentId) =>
				pine.delete({
					resource: `${resourceName}`,
					options: {
						$filter: {
							[parentResourceName]: parentId,
							[resourceKeyField]: key,
						},
					},
				}),
			);
		},
	};

	return exports;
}
