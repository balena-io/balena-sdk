import * as errors from 'balena-errors';
import chunk from 'lodash/chunk';
import { groupByMap, mergePineOptions } from '.';
import type {
	PineOptionsStrict,
	PineSelectableProps,
	PineTypedResult,
	PineFilter,
} from '..';

const NUMERIC_ID_CHUNK_SIZE = 200;
const STRING_ID_CHUNK_SIZE = 50;

export interface ChunkSizeOptions {
	numericId: number;
	stringId: number;
}

export function batchResourceOperationFactory<
	T extends { id: number; uuid: string },
>({
	getAll,
	NotFoundError,
	AmbiguousResourceError,
	chunkSize: chunkSizeParam,
}: {
	getAll: (options?: PineOptionsStrict<T>) => Promise<T[]>;
	NotFoundError: new (id: string | number) => Error;
	AmbiguousResourceError: new (id: string | number) => Error;
	chunkSize?: number | Partial<ChunkSizeOptions>;
}) {
	const chunkSize =
		typeof chunkSizeParam === 'number'
			? {
					numericId: chunkSizeParam,
					stringId: chunkSizeParam,
				}
			: {
					numericId: chunkSizeParam?.numericId ?? NUMERIC_ID_CHUNK_SIZE,
					stringId: chunkSizeParam?.stringId ?? STRING_ID_CHUNK_SIZE,
				};

	type Item<TOpts> = {
		id: number;
		uuid: string;
	} & (TOpts extends PineOptionsStrict<T> ? PineTypedResult<T, TOpts> : object);

	async function batchResourceOperation<
		TOpts extends PineOptionsStrict<T>,
	>(options: {
		uuidOrIdOrArray: number | number[] | string | string[];
		options?: TOpts;
		groupByNavigationPoperty?: undefined;
		fn: (items: Array<Item<TOpts>>) => Promise<void>;
	}): Promise<void>;
	async function batchResourceOperation<
		TOpts extends PineOptionsStrict<T>,
	>(options: {
		uuidOrIdOrArray: number | number[] | string | string[];
		options?: TOpts;
		groupByNavigationPoperty: PineSelectableProps<T>;
		fn: (items: Array<Item<TOpts>>, ownerId: number) => Promise<void>;
	}): Promise<void>;
	async function batchResourceOperation<TOpts extends PineOptionsStrict<T>>({
		uuidOrIdOrArray,
		options,
		groupByNavigationPoperty,
		fn,
	}: {
		uuidOrIdOrArray: number | number[] | string | string[];
		options?: TOpts;
		groupByNavigationPoperty?: PineSelectableProps<T>;
		fn:
			| ((items: Array<Item<TOpts>>) => Promise<void>)
			| ((items: Array<Item<TOpts>>, ownerId: number) => Promise<void>);
	}): Promise<void> {
		if (Array.isArray(uuidOrIdOrArray)) {
			if (!uuidOrIdOrArray.length) {
				throw new errors.BalenaInvalidParameterError(
					'uuidOrIdOrArray',
					uuidOrIdOrArray,
				);
			}
			let lastType = typeof uuidOrIdOrArray[0];
			for (const param of uuidOrIdOrArray) {
				const type = typeof param;
				if (type !== 'number' && type !== 'string') {
					throw new errors.BalenaInvalidParameterError(
						'uuidOrIdOrArray',
						uuidOrIdOrArray,
					);
				}
				if (lastType !== type) {
					throw new errors.BalenaInvalidParameterError(
						'uuidOrIdOrArray',
						uuidOrIdOrArray,
					);
				}
				if (
					typeof param === 'string' &&
					param.length !== 32 &&
					param.length !== 62
				) {
					throw new errors.BalenaInvalidParameterError(
						'uuidOrIdOrArray',
						uuidOrIdOrArray,
					);
				}
				lastType = type;
			}
		}

		// create a list of UUIDs or chunks of IDs
		const chunks: Array<string | number | string[] | number[]> = !Array.isArray(
			uuidOrIdOrArray,
		)
			? [uuidOrIdOrArray]
			: typeof uuidOrIdOrArray[0] === 'string'
				? chunk(uuidOrIdOrArray as string[], chunkSize.stringId)
				: chunk(uuidOrIdOrArray as number[], chunkSize.numericId);

		const items: Array<
			Item<TOpts> &
				Partial<{
					[groupByNavigationPoperty: string]: { __id: number };
				}>
		> = [];
		for (const uuidOrIdOrArrayChunk of chunks) {
			const resourceFilter: PineFilter<{ id: number; uuid: string }> =
				Array.isArray(uuidOrIdOrArrayChunk)
					? typeof uuidOrIdOrArrayChunk[0] === 'string'
						? {
								uuid: { $in: uuidOrIdOrArrayChunk as string[] },
							}
						: {
								id: { $in: uuidOrIdOrArrayChunk as number[] },
							}
					: typeof uuidOrIdOrArrayChunk === 'string'
						? {
								uuid: { $startswith: uuidOrIdOrArrayChunk },
							}
						: {
								id: uuidOrIdOrArrayChunk,
							};
			const combinedOptions = mergePineOptions(
				{
					$select: [
						'id',
						...(Array.isArray(uuidOrIdOrArrayChunk) &&
						typeof uuidOrIdOrArrayChunk[0] === 'string'
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
			throw new NotFoundError(uuidOrIdOrArray.toString());
		}

		const itemsByAccosiactedResource = groupByNavigationPoperty
			? groupByMap(items, (item) => item[groupByNavigationPoperty]!.__id)
			: new Map([[undefined, items]]);
		if (typeof uuidOrIdOrArray === 'string' && items.length > 1) {
			throw new AmbiguousResourceError(uuidOrIdOrArray);
		} else if (Array.isArray(uuidOrIdOrArray)) {
			const identifierProperty =
				typeof uuidOrIdOrArray[0] === 'string' ? 'uuid' : 'id';
			const resourceIdentifiers = items.map((item) => item[identifierProperty]);
			const resourceIdsSet = new Set(resourceIdentifiers);
			for (const identifier of uuidOrIdOrArray) {
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
				chunkSize.numericId,
			)) {
				await (
					fn as (items: Array<Item<TOpts>>, ownerId?: number) => Promise<void>
				)(chunkedAssociatedItems, associatedResourceId);
			}
		}
	}

	return batchResourceOperation;
}
