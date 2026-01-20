import * as errors from 'balena-errors';
import { chunk } from 'es-toolkit';
import { groupByMap, mergePineOptions } from '.';
import type {
	ExpandableStringKeyOf,
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';

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
	getAll: (options: ODataOptionsWithoutCount<T>) => Promise<T[]>;
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

	type Item<TOpts extends ODataOptionsWithoutCount<T>> =
		// We always $select the id
		Pick<T, 'id'> &
			// but we might or might not $select the uuid
			Partial<Pick<T, 'uuid'>> &
			NonNullable<OptionsToResponse<T, TOpts, number | string>>;

	async function batchResourceOperation<
		TOpts extends ODataOptionsWithoutCount<T>,
	>(options: {
		uuidOrIdOrArray: number | number[] | string | string[];
		parameterName?: string;
		options?: TOpts;
		groupByNavigationPoperty?: undefined;
		fn: (items: Array<Item<TOpts>>) => Promise<void>;
	}): Promise<void>;
	async function batchResourceOperation<
		TOpts extends ODataOptionsWithoutCount<T>,
	>(options: {
		uuidOrIdOrArray: number | number[] | string | string[];
		parameterName?: string;
		options?: TOpts;
		groupByNavigationPoperty: ExpandableStringKeyOf<T>;
		fn: (items: Array<Item<TOpts>>, ownerId: number) => Promise<void>;
	}): Promise<void>;
	async function batchResourceOperation<
		TOpts extends ODataOptionsWithoutCount<T>,
	>({
		uuidOrIdOrArray,
		parameterName = 'uuidOrIdOrArray',
		options,
		groupByNavigationPoperty,
		fn,
	}: {
		uuidOrIdOrArray: number | number[] | string | string[];
		parameterName?: string;
		options?: TOpts;
		groupByNavigationPoperty?: ExpandableStringKeyOf<T>;
		fn:
			| ((items: Array<Item<TOpts>>) => Promise<void>)
			| ((items: Array<Item<TOpts>>, ownerId: number) => Promise<void>);
	}): Promise<void> {
		if (uuidOrIdOrArray === '') {
			throw new errors.BalenaInvalidParameterError(
				parameterName,
				uuidOrIdOrArray,
			);
		}
		if (Array.isArray(uuidOrIdOrArray)) {
			if (!uuidOrIdOrArray.length) {
				throw new errors.BalenaInvalidParameterError(
					parameterName,
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
					// OptionalNavigationResource
					[groupByNavigationPoperty: string]: { __id: number } | null;
				}>
		> = [];
		for (const uuidOrIdOrArrayChunk of chunks) {
			const resourceFilter = Array.isArray(uuidOrIdOrArrayChunk)
				? typeof uuidOrIdOrArrayChunk[0] === 'string'
					? ({
							uuid: { $in: uuidOrIdOrArrayChunk as string[] },
						} as const)
					: ({
							id: { $in: uuidOrIdOrArrayChunk as number[] },
						} as const)
				: typeof uuidOrIdOrArrayChunk === 'string'
					? ({
							uuid: { $startswith: uuidOrIdOrArrayChunk },
						} as const)
					: ({
							id: uuidOrIdOrArrayChunk,
						} as const);
			const combinedOptions = mergePineOptions(
				{
					$select: [
						'id',
						...(Array.isArray(uuidOrIdOrArrayChunk) &&
						typeof uuidOrIdOrArrayChunk[0] === 'string'
							? (['uuid'] as const)
							: []),
						...(groupByNavigationPoperty ? [groupByNavigationPoperty] : []),
					],
					$filter: resourceFilter,
				},
				options,
			);
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
