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
import { limitedMap, mergePineOptions } from '../util';
import type { ReleaseRawVersionApplicationPair } from './release';
import { BalenaError } from 'balena-errors';
import { once } from 'es-toolkit';

type WriteReleaseAssetParams = Omit<ReleaseAsset['Write'], 'asset'> & {
	asset: File | string;
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

type UploadProgressInfo = {
	total: number;
	uploaded: number;
};

type UploadParams = {
	chunkSize?: number | undefined;
	parallelUploads?: number | undefined;
	overwrite?: boolean | undefined;
	onUploadProgress?: (progress: UploadProgressInfo) => void | Promise<void>;
};

type ReleaseAssetId =
	| ReleaseAsset['Read']['id']
	| {
			asset_key: ReleaseAsset['Read']['asset_key'];
			release: string | number | ReleaseRawVersionApplicationPair;
	  };

class ReleaseAssetAlreadyExists extends BalenaError {
	constructor(release: number, asset_key: string) {
		super(
			new Error(
				`Release asset combination of ${release} and ${asset_key} already exists`,
			),
		);
	}
}

const MINIMUM_MULTIPART_SIZE = 5 * 1024 * 1024; // 5MiB

const DEFAULT_MULTIPART_CHUNK_SIZE = 5 * 1024 * 1024; // 5MiB
const DEFAULT_MULTIPART_PARALLEL_UPLOAD = 5;

const getFileBasename = (filePath: string): string => {
	return filePath.split('/').pop() ?? filePath.split('\\').pop() ?? filePath;
};

const getReleaseAssetModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
	getRelease: <T extends ODataOptionsWithoutCount<Release['Read']>>(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
		options?: T,
	) => Promise<OptionsToResponse<Release['Read'], T, undefined>[number]>,
) {
	const assetHelpers = once(
		() =>
			(opts.isBrowser
				? // eslint-disable-next-line @typescript-eslint/no-require-imports
					(require('../util/asset-helpers.browser') as typeof import('../util/asset-helpers.browser'))
				: // eslint-disable-next-line @typescript-eslint/no-require-imports
					(require('../util/asset-helpers') as typeof import('../util/asset-helpers'))
			).assetHelpers,
	);
	const { pine, request } = deps;

	const parseUrlForRequest = (href: string) => {
		const url = new URL(href);
		const baseUrl = `${url.protocol}//${url.host}`;
		const pathname = url.pathname;
		const qs: Record<string, string> = {};

		url.searchParams.forEach((value, key) => {
			qs[key] = value;
		});

		return {
			baseUrl,
			url: pathname,
			qs,
			sendToken: false,
		};
	};

	const uploadPart = async (
		asset: File | string,
		part: UploadPart,
		requestedPartSize: number,
	) => {
		let body: Blob | ArrayBuffer;
		const offset = (part.partNumber - 1) * requestedPartSize;

		if (typeof asset === 'string') {
			const buffer = await assetHelpers().readFileChunk(
				asset,
				offset,
				part.chunkSize,
			);
			body = buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength,
			);
		} else {
			const end = offset + part.chunkSize;
			body = asset.slice(offset, end);
		}

		// We directly use fetch API rather than balena-request because
		// pre-signed S3 URLs contain authentication in query parameters
		// and must be used exactly as provided without modification (encoding/decoding for balena-request)
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
		totalSize: number,
		onUploadProgress:
			| ((progress: UploadProgressInfo) => void | Promise<void>)
			| undefined,
	) => {
		let totalUploaded = 0;
		return await limitedMap(
			parts,
			async (part) => {
				const result = await uploadPart(asset, part, uploadParams.chunkSize);
				totalUploaded += part.chunkSize;
				if (onUploadProgress != null) {
					await onUploadProgress({
						total: totalSize,
						uploaded: Math.min(totalUploaded, totalSize),
					});
				}
				return result;
			},
			{ concurrency: uploadParams.parallelUploads },
		);
	};

	const uploadMultipartReleaseAsset = async (
		releaseAssetId: number,
		asset: File | string,
		uploadParams: Required<Pick<UploadParams, 'chunkSize' | 'parallelUploads'>>,
		onUploadProgress:
			| ((progress: UploadProgressInfo) => void | Promise<void>)
			| undefined,
	) => {
		let metadata;
		if (typeof asset === 'string') {
			const size = await assetHelpers().getFileSize(asset);
			metadata = {
				filename: getFileBasename(asset),
				content_type: assetHelpers().getMimeType(asset),
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
						metadata.size,
						onUploadProgress,
					),
				},
			} satisfies CommitData,
		});
	};

	const createMultipartReleaseAsset = async (
		{ asset, asset_key, release }: WriteReleaseAssetParams,
		uploadParams: Required<Pick<UploadParams, 'chunkSize' | 'parallelUploads'>>,
		onUploadProgress:
			| ((progress: UploadProgressInfo) => void | Promise<void>)
			| undefined,
	) => {
		const releaseAsset = await pine.post({
			resource: 'release_asset',
			body: {
				asset_key,
				release,
				asset: null,
			},
		});
		if (asset != null) {
			await uploadMultipartReleaseAsset(
				releaseAsset.id,
				asset,
				uploadParams,
				onUploadProgress,
			);
		}
		return await exports.get(releaseAsset.id);
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
		): Promise<OptionsToResponse<ReleaseAsset['Read'], T, undefined>> {
			const release = await getRelease(commitOrIdOrRawVersion, {
				$select: 'id',
				$expand: {
					release_asset: mergePineOptions({ $orderby: { id: 'asc' } }, options),
				},
			});

			return release.release_asset as OptionsToResponse<
				ReleaseAsset['Read'],
				T,
				undefined
			>;
		},
		async get<T extends ODataOptionsWithoutCount<ReleaseAsset['Read']>>(
			id: ReleaseAssetId,
			options?: T,
		): Promise<OptionsToResponse<ReleaseAsset['Read'], T, undefined>[number]> {
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

			return await request.stream({
				method: 'GET',
				...parseUrlForRequest(asset.href),
			});
		},
		async upload(
			uploadParams: WriteReleaseAssetParams,
			{
				chunkSize = DEFAULT_MULTIPART_CHUNK_SIZE,
				parallelUploads = DEFAULT_MULTIPART_PARALLEL_UPLOAD,
				overwrite = false,
				onUploadProgress,
			}: UploadParams = {},
		) {
			const { asset, ...restParams } = uploadParams;

			let size: number;
			let normalizedParams: Omit<ReleaseAsset['Write'], 'asset'> & {
				asset: File;
			};

			if (typeof asset === 'string') {
				size = await assetHelpers().getFileSize(asset);
				if (size <= MINIMUM_MULTIPART_SIZE) {
					const buffer = await assetHelpers().readFileChunk(asset, 0, size);
					normalizedParams = {
						...restParams,
						asset: new File([buffer], getFileBasename(asset), {
							type: assetHelpers().getMimeType(asset),
						}),
					};
				}
			} else {
				size = asset.size;
				if (size <= MINIMUM_MULTIPART_SIZE) {
					normalizedParams = uploadParams as Omit<
						ReleaseAsset['Write'],
						'asset'
					> & { asset: File };
				}
			}

			// The pattern executed here of first getting the release_asset and then post/patch
			// is slightly different than most places where we would use upsert, the main reason for that
			// is to avoid posting a file (higher bandwitch usage) that we know would fail, so we do first a get
			// and based on that result and the overwrite flag we either patch or post
			const existingReleaseAsset = await pine.get({
				resource: 'release_asset',
				id: { asset_key: restParams.asset_key, release: restParams.release },
				options: { $select: 'id' },
			});

			if (existingReleaseAsset != null && !overwrite) {
				throw new ReleaseAssetAlreadyExists(
					restParams.release,
					restParams.asset_key,
				);
			}
			if (size <= MINIMUM_MULTIPART_SIZE) {
				// Multipart request (file on the wire)
				if (onUploadProgress != null) {
					await onUploadProgress({
						total: size,
						uploaded: 0,
					});
				}
				let result;
				if (existingReleaseAsset != null) {
					await pine.patch({
						id: existingReleaseAsset.id,
						resource: 'release_asset',
						body: { asset: normalizedParams!.asset },
					});
					result = await exports.get(existingReleaseAsset.id);
				} else {
					result = await pine.post({
						resource: 'release_asset',
						body: normalizedParams!,
					});
				}
				if (onUploadProgress != null) {
					await onUploadProgress({
						total: size,
						uploaded: size,
					});
				}
				return result;
			}
			// Multipart upload
			if (existingReleaseAsset != null) {
				await uploadMultipartReleaseAsset(
					existingReleaseAsset.id,
					asset,
					{
						chunkSize,
						parallelUploads,
					},
					onUploadProgress,
				);
				return await exports.get(existingReleaseAsset.id);
			}
			return await createMultipartReleaseAsset(
				uploadParams,
				{
					chunkSize,
					parallelUploads,
				},
				onUploadProgress,
			);
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
