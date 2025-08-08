import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';
import type {
	InjectedDependenciesParam,
	InjectedOptionsParam,
	Release,
	ReleaseAsset,
} from '..';
import { mergePineOptions } from '../util';
import type { ReleaseRawVersionApplicationPair } from './release';
import pLimit from 'p-limit';
import * as path from 'path';
import { getType } from 'mime';

const getMimeType = (filePath: string): string => {
	return getType(filePath) ?? 'application/octet-stream';
};

type WriteReleaseAssetParams = Omit<ReleaseAsset['Write'], 'asset'> & {
	asset?: File | string;
};
type UploadPart = {
	url: string;
	chunkSize: number;
	partNumber: number;
};

type CommitData = {
	uuid: string;
	providerCommitData: {
		Parts: Array<{ PartNumber: number; ETag: string }>;
	};
};

type ReleaseAssetBeginUpload = {
	asset: {
		uuid: string;
		uploadParts: UploadPart[];
	};
};

type UploadParams = {
	chunkSize?: number | undefined;
	parallelUploads?: number | undefined;
	override?: boolean;
};

type ReleaseAssetId =
	| ReleaseAsset['Read']['id']
	| {
			asset_key: ReleaseAsset['Read']['asset_key'];
			release: string | number | ReleaseRawVersionApplicationPair;
	  };

const MINIMUM_MULTIPART_SIZE = 5 * 1024 * 1024; // 5MB

const DEFAULT_MULTIPART_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MULTIPART_PARALLEL_UPLOAD = 5;

const getReleaseAssetModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
	getRelease: <T extends ODataOptionsWithoutCount<Release['Read']>>(
		slugOrUuidOrId: string | number | ReleaseRawVersionApplicationPair,
		options?: T,
	) => Promise<OptionsToResponse<Release['Read'], T, undefined>[number]>,
) {
	const { pine, request } = deps;
	const { isBrowser } = opts;

	const getOrCreateReleaseAsset = async (
		{ release, asset_key }: WriteReleaseAssetParams,
		override: boolean,
	) => {
		const releaseAsset = await pine.get({
			resource: 'release_asset',
			id: { release, asset_key },
			options: {
				$select: 'id',
			},
		});

		if (releaseAsset != null && !override) {
			throw new Error(
				`A release_asset for release '${release}' and key '${asset_key}' already exists`,
			);
		}

		// TODO, should we warn log when overriding?
		let releaseAssetId: number;
		if (releaseAsset == null) {
			const createdReleaseAsset = await pine.post({
				resource: 'release_asset',
				body: {
					release,
					asset_key,
					asset: null,
				},
			});
			releaseAssetId = createdReleaseAsset.id;
		} else {
			releaseAssetId = releaseAsset.id;
		}

		return releaseAssetId;
	};

	const getFileSize = async (filePath: string): Promise<number> => {
		if (isBrowser) {
			throw new Error('File path uploads are not supported in the browser');
		}
		const fs = await import('fs/promises');
		const stats = await fs.stat(filePath);
		return stats.size;
	};

	const readFileChunk = async (
		filePath: string,
		offset: number,
		length: number,
	) => {
		if (isBrowser) {
			throw new Error('File path uploads are not supported in the browser');
		}

		const fs = await import('fs/promises');
		const fd = await fs.open(filePath, 'r');
		try {
			const buffer = Buffer.alloc(length);
			const { bytesRead } = await fd.read(buffer, 0, length, offset);
			return buffer.subarray(0, bytesRead);
		} finally {
			await fd.close();
		}
	};

	const uploadPart = async (
		asset: File | string,
		part: UploadPart,
		requestedPartSize: number,
	) => {
		let body: Blob | ArrayBuffer;
		const offset = (part.partNumber - 1) * requestedPartSize;

		if (typeof asset === 'string') {
			const buffer = await readFileChunk(asset, offset, part.chunkSize);
			body = buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength,
			);
		} else {
			const end = offset + part.chunkSize;
			body = asset.slice(offset, end);
		}

		const res = await fetch(part.url, {
			method: 'PUT',
			body,
		});

		const ETag = res.headers.get('ETag')?.replace(/^"+|"+$/g, '');
		if (ETag == null || typeof ETag !== 'string') {
			throw new Error(`Error on the received ETag ${ETag}`);
		}
		return {
			PartNumber: part.partNumber,
			ETag,
		};
	};

	const uploadParts = async (
		asset: File | string,
		parts: UploadPart[],
		uploadParams: Required<Pick<UploadParams, 'chunkSize' | 'parallelUploads'>>,
	) => {
		const limit = pLimit(uploadParams.parallelUploads);
		return await Promise.all(
			parts.map((part) =>
				limit(() => uploadPart(asset, part, uploadParams.chunkSize)),
			),
		);
	};

	const uploadMultipartReleaseAsset = async (
		releaseAssetId: number,
		asset: File | string,
		uploadParams: Required<Pick<UploadParams, 'chunkSize' | 'parallelUploads'>>,
	) => {
		let metadata;
		if (typeof asset === 'string') {
			const size = await getFileSize(asset);
			metadata = {
				filename: path.basename(asset),
				content_type: getMimeType(asset),
				size,
			};
		} else {
			metadata = {
				filename: asset.name,
				content_type: asset.type || 'application/octet-stream',
				size: asset.size,
			};
		}

		const beginUploadResponse = (await pine.post({
			resource: 'release_asset',
			id: releaseAssetId,
			action: 'beginUpload',
			body: {
				asset: {
					...metadata,
					chunk_size: uploadParams.chunkSize,
				},
			},
		})) as ReleaseAssetBeginUpload;

		await pine.post({
			resource: 'release_asset',
			id: releaseAssetId,
			action: 'commitUpload',
			body: {
				uuid: beginUploadResponse.asset.uuid,
				providerCommitData: {
					Parts: await uploadParts(
						asset,
						beginUploadResponse.asset.uploadParts,
						uploadParams,
					),
				},
			} satisfies CommitData,
		});
	};

	const createMultipartReleaseAsset = async (
		createParams: WriteReleaseAssetParams,
		uploadParams: Required<UploadParams>,
	) => {
		const releaseAssetId = await getOrCreateReleaseAsset(
			createParams,
			uploadParams.override,
		);
		if (createParams.asset != null) {
			await uploadMultipartReleaseAsset(
				releaseAssetId,
				createParams.asset,
				uploadParams,
			);
		}
		return await exports.get(releaseAssetId);
	};

	const getId = async (
		id: ReleaseAssetId,
	): Promise<
		| ReleaseAsset['Read']['id']
		| {
				release: number;
				asset_key: ReleaseAsset['Read']['asset_key'];
		  }
	> => {
		return typeof id === 'number' || typeof id.release === 'number'
			? // @ts-expect-error - typescript should be able to infer this
				id
			: {
					release: (await getRelease(id.release, { $select: 'id' })).id,
					asset_key: id.asset_key,
				};
	};

	const exports = {
		async getAllByRelease<
			T extends ODataOptionsWithoutCount<ReleaseAsset['Read']>,
		>(
			commitOrIdOrRawVersion:
				| string
				| number
				| ReleaseRawVersionApplicationPair,
			options?: T,
		) {
			const release = await getRelease(commitOrIdOrRawVersion, {
				$select: 'id',
				$expand: {
					release_asset: mergePineOptions({ $orderby: { id: 'asc' } }, options),
				},
			});

			return release.release_asset;
		},
		async get<T extends ODataOptionsWithoutCount<ReleaseAsset['Read']>>(
			id: ReleaseAssetId,
			options?: T,
		) {
			const releaseAssetId = await getId(id);
			const releaseAsset = await pine.get({
				resource: 'release_asset',
				id: releaseAssetId,
				options,
			});

			if (releaseAsset == null) {
				throw new Error(
					`Release asset not found '${JSON.stringify(releaseAssetId)}.'`,
				);
			}

			return releaseAsset;
		},
		async download(id: ReleaseAssetId) {
			const { asset } = await exports.get(id, { $select: 'asset' });
			if (asset == null) {
				throw new Error('Release asset does not contain any uploaded file');
			}

			await request.stream({
				method: 'GET',
				baseUrl: asset.href,
				url: '',
			});
		},
		async create(
			createParams: WriteReleaseAssetParams,
			{
				chunkSize = DEFAULT_MULTIPART_CHUNK_SIZE,
				parallelUploads = DEFAULT_MULTIPART_PARALLEL_UPLOAD,
				override = false,
			}: UploadParams = {},
		) {
			const { asset, ...restParams } = createParams;
			if (asset == null) {
				return await pine.post({
					resource: 'release_asset',
					body: { ...restParams, asset },
				});
			}

			let size: number;
			let normalizedParams: Omit<ReleaseAsset['Write'], 'asset'> & {
				asset: File | null;
			};

			if (typeof asset === 'string') {
				size = await getFileSize(asset);
				if (size <= MINIMUM_MULTIPART_SIZE) {
					const buffer = await readFileChunk(asset, 0, size);
					normalizedParams = {
						...restParams,
						asset: new File([buffer], path.basename(asset), {
							type: getMimeType(asset),
						}),
					};
				}
			} else {
				size = asset.size;
				if (size <= MINIMUM_MULTIPART_SIZE) {
					normalizedParams = createParams as Omit<
						ReleaseAsset['Write'],
						'asset'
					> & { asset: File };
				}
			}

			if (size <= MINIMUM_MULTIPART_SIZE) {
				return await pine.post({
					resource: 'release_asset',
					body: normalizedParams!,
				});
			} else {
				return await createMultipartReleaseAsset(createParams, {
					chunkSize,
					parallelUploads,
					override,
				});
			}
		},

		async update(
			id: ReleaseAssetId,
			updateParams: Partial<
				Pick<WriteReleaseAssetParams, 'asset_key' | 'asset'>
			>,
			{
				chunkSize = DEFAULT_MULTIPART_CHUNK_SIZE,
				parallelUploads = DEFAULT_MULTIPART_PARALLEL_UPLOAD,
			}: UploadParams = {},
		) {
			const { id: releaseAssetId } = await exports.get(id, { $select: 'id' });
			const { asset, ...restParams } = updateParams;

			if (asset == null) {
				await pine.patch({
					id: releaseAssetId,
					resource: 'release_asset',
					body: restParams,
				});
				return;
			}

			let size: number;
			let normalizedParams: Partial<
				Pick<ReleaseAsset['Write'], 'asset_key' | 'asset'>
			>;

			if (typeof asset === 'string') {
				size = await getFileSize(asset);
				if (size <= MINIMUM_MULTIPART_SIZE) {
					const buffer = await readFileChunk(asset, 0, size);
					normalizedParams = {
						...restParams,
						asset: new File([buffer], path.basename(asset), {
							type: getMimeType(asset),
						}),
					};
				}
			} else {
				size = asset.size;
				if (size <= MINIMUM_MULTIPART_SIZE) {
					normalizedParams = updateParams as Partial<
						Pick<ReleaseAsset['Write'], 'asset_key' | 'asset'>
					>;
				}
			}

			if (size <= MINIMUM_MULTIPART_SIZE) {
				await pine.patch({
					id: releaseAssetId,
					resource: 'release_asset',
					body: normalizedParams!,
				});
			} else {
				await uploadMultipartReleaseAsset(releaseAssetId, asset, {
					chunkSize,
					parallelUploads,
				});
				if (restParams.asset_key != null) {
					await pine.patch({
						id: releaseAssetId,
						resource: 'release_asset',
						body: {
							asset_key: restParams.asset_key,
						},
					});
				}
			}
		},

		async remove(id: ReleaseAssetId) {
			await pine.delete({
				resource: 'release_asset',
				id: await getId(id),
			});
		},
	};
	return exports;
};

export default getReleaseAssetModel;
