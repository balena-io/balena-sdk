import * as errors from 'balena-errors';
import chunk = require('lodash/chunk');
import { groupByMap, mergePineOptions } from '.';
import type {
	PineOptionsWithSelect,
	PineSelectableProps,
	PineTypedResult,
	PineFilter,
} from '..';

const CHUNK_SIZE = 50;

export function batchResourceOperationFactory<
	T extends { id: number; uuid: string },
>({
	getAll,
	NotFoundError,
	AmbiguousResourceError,
}: {
	getAll: (options?: PineOptionsWithSelect<T>) => Promise<T[]>;
	NotFoundError: new (id: string | number) => Error;
	AmbiguousResourceError: new (id: string | number) => Error;
}) {
	type Item<TOpts> = { id: number } & (TOpts extends PineOptionsWithSelect<T>
		? PineTypedResult<T, TOpts>
		: {});

	async function batchResourceOperation<
		TOpts extends PineOptionsWithSelect<T>,
	>(options: {
		uuidOrIdOrIds: string | number | number[];
		options?: TOpts;
		fn: (items: Array<Item<TOpts>>) => Promise<void>;
		groupByNavigationPoperty?: undefined;
	}): Promise<void>;
	async function batchResourceOperation<
		TOpts extends PineOptionsWithSelect<T>,
	>(options: {
		uuidOrIdOrIds: string | number | number[];
		options?: TOpts;
		fn: (items: Array<Item<TOpts>>, ownerId: number) => Promise<void>;
		groupByNavigationPoperty: PineSelectableProps<T>;
	}): Promise<void>;
	async function batchResourceOperation<
		TOpts extends PineOptionsWithSelect<T>,
	>({
		uuidOrIdOrIds,
		options,
		groupByNavigationPoperty,
		fn,
	}: {
		uuidOrIdOrIds: string | number | number[];
		options?: TOpts;
		fn: (items: Array<Item<TOpts>>, ownerId?: number) => Promise<void>;
		groupByNavigationPoperty?: PineSelectableProps<T>;
	}): Promise<void> {
		if (
			Array.isArray(uuidOrIdOrIds) &&
			(!uuidOrIdOrIds.length ||
				uuidOrIdOrIds.some((id) => typeof id !== 'number'))
		) {
			throw new errors.BalenaInvalidParameterError(
				'uuidOrIdOrIds',
				uuidOrIdOrIds,
			);
		}

		// create a list of UUIDs or chunks of IDs
		const chunks: Array<string | number[]> =
			typeof uuidOrIdOrIds === 'string'
				? [uuidOrIdOrIds]
				: chunk(
						!Array.isArray(uuidOrIdOrIds) ? [uuidOrIdOrIds] : uuidOrIdOrIds,
						CHUNK_SIZE,
				  );

		const items: Array<
			Item<TOpts> &
				Partial<{
					[groupByNavigationPoperty: string]: { __id: number };
				}>
		> = [];
		for (const uuidOrIdOrIdsChunk of chunks) {
			const resourceFilter: PineFilter<{ id: number; uuid: string }> =
				Array.isArray(uuidOrIdOrIdsChunk)
					? {
							id: { $in: uuidOrIdOrIdsChunk },
					  }
					: {
							uuid: { $startswith: uuidOrIdOrIdsChunk },
					  };
			const combinedOptions = mergePineOptions(
				{
					$select: [
						'id',
						...(groupByNavigationPoperty ? [groupByNavigationPoperty] : []),
					] as Array<PineSelectableProps<T>>,
					$filter: resourceFilter as PineFilter<T>,
				},
				options,
			) as PineOptionsWithSelect<T>;

			items.push(...((await getAll(combinedOptions)) as typeof items));
		}

		const resourceIds: number[] = items.map((item) => item.id);
		if (!resourceIds.length) {
			throw new NotFoundError(uuidOrIdOrIds.toString());
		}

		if (!groupByNavigationPoperty) {
			await fn(items);
			return;
		}

		const itemsByAccosiactedResource = groupByMap(
			items,
			(item) => item[groupByNavigationPoperty]!.__id,
		);
		if (typeof uuidOrIdOrIds === 'string' && resourceIds.length > 1) {
			throw new AmbiguousResourceError(uuidOrIdOrIds);
		} else if (Array.isArray(uuidOrIdOrIds)) {
			const resourceIdsSet = new Set(resourceIds);
			for (const id of uuidOrIdOrIds) {
				if (!resourceIdsSet.has(id)) {
					throw new NotFoundError(id);
				}
			}
		}

		for (const [
			associatedResourceId,
			associatedItems,
		] of itemsByAccosiactedResource.entries()) {
			for (const chunkedAssociatedItems of chunk(associatedItems, CHUNK_SIZE)) {
				await fn(chunkedAssociatedItems, associatedResourceId);
			}
		}
	}

	return batchResourceOperation;
}
