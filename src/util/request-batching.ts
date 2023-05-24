import * as errors from 'balena-errors';
import chunk = require('lodash/chunk');
import { groupByMap, mergePineOptions } from '.';
import type {
	PineOptionsStrict,
	PineSelectableProps,
	PineTypedResult,
	PineFilter,
} from '..';

const ID_CHUNK_SIZE = 200;
const UUID_CHUNK_SIZE = 50;

export function batchResourceOperationFactory<
	T extends { id: number; uuid: string },
>({
	getAll,
	NotFoundError,
	AmbiguousResourceError,
}: {
	getAll: (options?: PineOptionsStrict<T>) => Promise<T[]>;
	NotFoundError: new (id: string | number) => Error;
	AmbiguousResourceError: new (id: string | number) => Error;
}) {
	type Item<TOpts> = {
		id: number;
		uuid: string;
	} & (TOpts extends PineOptionsStrict<T> ? PineTypedResult<T, TOpts> : {});

	async function batchResourceOperation<
		TOpts extends PineOptionsStrict<T>,
	>(options: {
		uuidOrIdOrIds: number | number[] | string | string[];
		options?: TOpts;
		fn: (items: Array<Item<TOpts>>) => Promise<void>;
		groupByNavigationPoperty?: undefined;
	}): Promise<void>;
	async function batchResourceOperation<
		TOpts extends PineOptionsStrict<T>,
	>(options: {
		uuidOrIdOrIds: number | number[] | string | string[];
		options?: TOpts;
		fn: (items: Array<Item<TOpts>>, ownerId: number) => Promise<void>;
		groupByNavigationPoperty: PineSelectableProps<T>;
	}): Promise<void>;
	async function batchResourceOperation<TOpts extends PineOptionsStrict<T>>({
		uuidOrIdOrIds,
		options,
		groupByNavigationPoperty,
		fn,
	}: {
		uuidOrIdOrIds: number | number[] | string | string[];
		options?: TOpts;
		fn: (items: Array<Item<TOpts>>, ownerId?: number) => Promise<void>;
		groupByNavigationPoperty?: PineSelectableProps<T>;
	}): Promise<void> {
		if (Array.isArray(uuidOrIdOrIds)) {
			if (!uuidOrIdOrIds.length) {
				throw new errors.BalenaInvalidParameterError(
					'uuidOrIdOrIds',
					uuidOrIdOrIds,
				);
			}
			let lastType = typeof uuidOrIdOrIds[0];
			for (const param of uuidOrIdOrIds) {
				const type = typeof param;
				if (type !== 'number' && type !== 'string') {
					throw new errors.BalenaInvalidParameterError(
						'uuidOrIdOrIds',
						uuidOrIdOrIds,
					);
				}
				if (lastType !== type) {
					throw new errors.BalenaInvalidParameterError(
						'uuidOrIdOrIds',
						uuidOrIdOrIds,
					);
				}
				if (
					typeof param === 'string' &&
					param.length !== 32 &&
					param.length !== 62
				) {
					throw new errors.BalenaInvalidParameterError(
						'uuidOrIdOrIds',
						uuidOrIdOrIds,
					);
				}
				lastType = type;
			}
		}

		// create a list of UUIDs or chunks of IDs
		const chunks: Array<string | number | string[] | number[]> = !Array.isArray(
			uuidOrIdOrIds,
		)
			? [uuidOrIdOrIds]
			: typeof uuidOrIdOrIds[0] === 'string'
			? chunk(uuidOrIdOrIds as string[], UUID_CHUNK_SIZE)
			: chunk(uuidOrIdOrIds as number[], ID_CHUNK_SIZE);

		const items: Array<
			Item<TOpts> &
				Partial<{
					[groupByNavigationPoperty: string]: { __id: number };
				}>
		> = [];
		for (const uuidOrIdOrIdsChunk of chunks) {
			const resourceFilter: PineFilter<{ id: number; uuid: string }> =
				Array.isArray(uuidOrIdOrIdsChunk)
					? typeof uuidOrIdOrIdsChunk[0] === 'string'
						? {
								uuid: { $in: uuidOrIdOrIdsChunk as string[] },
						  }
						: {
								id: { $in: uuidOrIdOrIdsChunk as number[] },
						  }
					: typeof uuidOrIdOrIdsChunk === 'string'
					? {
							uuid: { $startswith: uuidOrIdOrIdsChunk },
					  }
					: {
							id: uuidOrIdOrIdsChunk,
					  };
			const combinedOptions = mergePineOptions(
				{
					$select: [
						'id',
						...(Array.isArray(uuidOrIdOrIdsChunk) &&
						typeof uuidOrIdOrIdsChunk[0] === 'string'
							? ['uuid']
							: []),
						...(groupByNavigationPoperty ? [groupByNavigationPoperty] : []),
					] as Array<PineSelectableProps<T>>,
					$filter: resourceFilter as PineFilter<T>,
				},
				options,
			) as PineOptionsStrict<T>;

			items.push(...((await getAll(combinedOptions)) as typeof items));
		}

		if (!items.length) {
			throw new NotFoundError(uuidOrIdOrIds.toString());
		}

		const itemsByAccosiactedResource = groupByNavigationPoperty
			? groupByMap(items, (item) => item[groupByNavigationPoperty]!.__id)
			: new Map([[undefined, items]]);
		if (typeof uuidOrIdOrIds === 'string' && items.length > 1) {
			throw new AmbiguousResourceError(uuidOrIdOrIds);
		} else if (Array.isArray(uuidOrIdOrIds)) {
			const identifierProperty =
				typeof uuidOrIdOrIds[0] === 'string' ? 'uuid' : 'id';
			const resourceIdentifiers = items.map((item) => item[identifierProperty]);
			const resourceIdsSet = new Set(resourceIdentifiers);
			for (const identifier of uuidOrIdOrIds) {
				if (!resourceIdsSet.has(identifier)) {
					throw new NotFoundError(identifier);
				}
			}
		}

		for (const [
			associatedResourceId,
			associatedItems,
		] of itemsByAccosiactedResource.entries()) {
			for (const chunkedAssociatedItems of chunk(
				associatedItems,
				ID_CHUNK_SIZE,
			)) {
				await fn(chunkedAssociatedItems, associatedResourceId);
			}
		}
	}

	return batchResourceOperation;
}
