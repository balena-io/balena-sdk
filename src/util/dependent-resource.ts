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

import { isId, isUnauthorizedResponse, mergePineOptions } from '../util';
import type { BalenaModel, PineClient } from '..';
import type { Dictionary, StringKeyof } from '../../typings/utils';
import type {
	ExpandableStringKeyOf,
	ODataOptionsWithoutCount,
} from 'pinejs-client-core';

type DependentResourceName = {
	[K in StringKeyof<BalenaModel>]: BalenaModel[K] extends {
		Read: {
			id: number;
			value: string;
		};
		Write: { value: string };
	}
		? K
		: never;
}[StringKeyof<BalenaModel>];

export function buildDependentResource<T extends DependentResourceName>(
	{ pine }: { pine: PineClient },
	{
		resourceName,
		resourceKeyField,
		parentResourceName,
		getResourceId,
	}: {
		resourceName: T; // e.g. device_tag
		resourceKeyField: StringKeyof<BalenaModel[T]['Read']>; // e.g. tag_key
		parentResourceName: ExpandableStringKeyOf<BalenaModel[T]['Read']>; // e.g. device
		getResourceId: (
			uuidOrIdOrDict: string | number | Dictionary<unknown>,
		) => Promise<number>; // e.g. getId(uuidOrIdOrDict)
	},
) {
	const exports = {
		getAll(options?: ODataOptionsWithoutCount<BalenaModel[T]['Read']>) {
			options ??= {};
			return pine.get({
				resource: resourceName,
				options: mergePineOptions(
					{
						$orderby: {
							[resourceKeyField]: 'asc',
						} as const,
					},
					options,
				),
			});
		},
		async getAllByParent(
			parentParam: string | number | Dictionary<unknown>,
			options?: ODataOptionsWithoutCount<BalenaModel[T]['Read']>,
		) {
			const id = await getResourceId(parentParam);
			return await exports.getAll(
				mergePineOptions(
					{
						$filter: { [parentResourceName]: id },
						$orderby: {
							[resourceKeyField]: 'asc',
						},
					} as ODataOptionsWithoutCount<BalenaModel[T]['Read']>,
					options,
				),
			);
		},

		async get(
			parentParam: string | number | Dictionary<unknown>,
			key: string,
		): Promise<string | undefined> {
			const id = await getResourceId(parentParam);
			const [result] = await pine.get({
				resource: resourceName satisfies DependentResourceName,
				options: {
					$select: 'value',
					$filter: {
						[parentResourceName]: id,
						[resourceKeyField]: key,
					},
				},
			});

			if (result) {
				return result.value;
			}
		},

		async set(
			parentParam: string | number | Dictionary<unknown>,
			key: string,
			value: string,
		): Promise<void> {
			value = String(value);

			// Trying to avoid an extra HTTP request
			// when the provided parameter looks like an id.
			// Note that this throws an exception for missing names/uuids,
			// but not for missing ids
			const parentId = isId(parentParam)
				? parentParam
				: await getResourceId(parentParam);
			try {
				await pine.upsert({
					resource: resourceName satisfies DependentResourceName,
					id: {
						[parentResourceName]: parentId,
						[resourceKeyField]: key,
					},
					body: {
						value,
					},
				});
			} catch (err) {
				// Since Pine 7, when the post throws a 401
				// then the associated parent resource might not exist.
				// If we never checked that the resource actually exists
				// then we should reject an appropriate error.
				if (!isUnauthorizedResponse(err) || !isId(parentParam)) {
					throw err;
				}
				await getResourceId(parentParam);
				throw err;
			}
		},

		async remove(
			parentParam: string | number | Dictionary<unknown>,
			key: string,
		): Promise<void> {
			const parentId = await getResourceId(parentParam);
			await pine.delete({
				resource: resourceName satisfies DependentResourceName,
				options: {
					$filter: {
						[parentResourceName]: parentId,
						[resourceKeyField]: key,
					},
				},
			});
		},
	};

	return exports;
}
