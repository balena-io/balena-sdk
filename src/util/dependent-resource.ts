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
import type { StringKeyof } from '../../typings/utils';
import type {
	ExpandableStringKeyOf,
	Filter,
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';
import { BalenaInvalidParameterError } from '../errors';

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
			uuidOrIdOrDict: string | number | Record<string, unknown>,
		) => Promise<number>; // e.g. getId(uuidOrIdOrDict)
	},
) {
	async function set(
		parentParam: string | number | Record<string, unknown>,
		key: string,
		value: string,
	): Promise<void>;
	async function set(
		parentParam: string | number | Record<string, unknown>,
		tags: Record<string, string>,
	): Promise<void>;
	async function set(
		parentParam: string | number | Record<string, unknown>,
		keyOrTags: string | Record<string, string>,
		value?: string,
	): Promise<void> {
		let tags: Record<string, string>;
		if (keyOrTags == null) {
			throw new BalenaInvalidParameterError('keyOrTags', keyOrTags);
		}
		if (typeof keyOrTags === 'object') {
			if (arguments.length > 2) {
				throw new BalenaInvalidParameterError('value', value);
			}
			const values = Object.values(keyOrTags);
			if (values.length === 0) {
				throw new BalenaInvalidParameterError('value', value);
			}
			for (const v of values) {
				if (typeof v !== 'string') {
					throw new BalenaInvalidParameterError('value', value);
				}
			}
			tags = keyOrTags;
		} else {
			tags = { [keyOrTags]: String(value) };
		}

		// Trying to avoid an extra HTTP request
		// when the provided parameter looks like an id.
		// Note that this throws an exception for missing names/uuids,
		// but not for missing ids
		const parentId = isId(parentParam)
			? parentParam
			: await getResourceId(parentParam);
		const existingTags = await pine.get({
			resource: resourceName satisfies DependentResourceName,
			options: {
				$select: [
					// @ts-expect-error -- The resourceKeyField can be 'tag_key' for tags or 'name' for vars
					// so this can't be narrowed to a common field for all resources that the get()
					// can infer a fully typed result from.
					resourceKeyField,
					'value',
				],
				$filter: {
					[parentResourceName]: parentId,
					[resourceKeyField]: { $in: Object.keys(tags) },
				},
			},
		});
		if (!Array.isArray(existingTags)) {
			// manually narrowing down the result type b/c we had to use @ts-expect-error for the resourceKeyField
			throw new Error('Unexpected dependent resource response format');
		}
		const existingTagByKey = Object.fromEntries(
			existingTags.map((tag) => [
				// @ts-expect-error -- The resourceKeyField can be tag_key for tags or name for vars
				tag[resourceKeyField] as string,
				tag,
			]),
		);
		await Promise.all(
			Object.entries(tags).map(async ([key, newValue]) => {
				const existingTag = existingTagByKey[key];
				if (existingTag?.value === newValue) {
					return;
				}

				const altKey = {
					[parentResourceName]: parentId,
					[resourceKeyField]: key,
				};
				try {
					if (existingTag == null) {
						// We use upsert() instead of post() to automatically handle concurrent POSTs.
						// In that which case the last POST will get a Conflict error, and the upsert()
						// will automatically do a PATCH, so that the latest request persists the value.
						await pine.upsert({
							resource: resourceName satisfies DependentResourceName,
							id: altKey,
							body: {
								value: newValue,
							},
						});
						return;
					}

					await pine.patch({
						resource: resourceName satisfies DependentResourceName,
						id: altKey,
						body: {
							value: newValue,
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
			}),
		);
	}

	const exports = {
		getAll<O extends ODataOptionsWithoutCount<BalenaModel[T]['Read']>>(
			options?: O,
		): Promise<OptionsToResponse<BalenaModel[T]['Read'], O, undefined>> {
			return pine.get({
				resource: resourceName,
				options: mergePineOptions(
					{
						$orderby: {
							[resourceKeyField]: 'asc',
						} as const,
					},
					options,
				) as O,
			});
		},
		async getAllByParent<
			O extends ODataOptionsWithoutCount<BalenaModel[T]['Read']>,
		>(
			parentParam: string | number | Record<string, unknown>,
			options?: O,
		): Promise<OptionsToResponse<BalenaModel[T]['Read'], O, undefined>> {
			const id = await getResourceId(parentParam);
			return await exports.getAll(
				mergePineOptions(
					{
						$filter: { [parentResourceName]: id } as Filter<
							BalenaModel[T]['Read']
						>,
						$orderby: {
							[resourceKeyField]: 'asc',
						},
					},
					options,
				) as O,
			);
		},

		async get(
			parentParam: string | number | Record<string, unknown>,
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

		set,

		async remove(
			parentParam: string | number | Record<string, unknown>,
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
