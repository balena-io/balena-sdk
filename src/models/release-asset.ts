import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';
import type { InjectedDependenciesParam, Release, ReleaseAsset } from '..';
import { mergePineOptions } from '../util';
import type { ReleaseRawVersionApplicationPair } from './release';
import pLimit from 'p-limit';

type EditReleaseAssetParams = Omit<ReleaseAsset['Write'], 'asset'> & {
	asset?: File;
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
	getRelease: <T extends ODataOptionsWithoutCount<Release['Read']>>(
		slugOrUuidOrId: string | number | ReleaseRawVersionApplicationPair,
		options?: T,
	) => Promise<OptionsToResponse<Release['Read'], T, undefined>[number]>,
) {
	const { pine, request } = deps;

	const getOrCreateReleaseAsset = async (
		{ release, asset_key }: EditReleaseAssetParams,
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

	const uploadPart = async (
		file: File,
		part: UploadPart,
		requestedPartSize: number,
	) => {
		const offset = (part.partNumber - 1) * requestedPartSize;
		const end = offset + part.chunkSize;
		const chunk = file.slice(offset, end);

		const res = await fetch(part.url, {
			method: 'PUT',
			body: chunk,
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
		asset: File,
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
		asset: File,
		uploadParams: Required<Pick<UploadParams, 'chunkSize' | 'parallelUploads'>>,
	) => {
		const beginUploadResponse = (await pine.post({
			resource: 'release_asset',
			id: releaseAssetId,
			action: 'beginUpload',
			body: {
				asset: {
					filename: asset.name,
					content_type: asset.type,
					size: asset.size,
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
		createParams: EditReleaseAssetParams,
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
			createParams: EditReleaseAssetParams,
			{
				chunkSize = DEFAULT_MULTIPART_CHUNK_SIZE,
				parallelUploads = DEFAULT_MULTIPART_PARALLEL_UPLOAD,
				override = false,
			}: UploadParams = {},
		) {
			if (
				createParams.asset == null ||
				createParams.asset.size <= MINIMUM_MULTIPART_SIZE
			) {
				return await pine.post({
					resource: 'release_asset',
					body: createParams,
				});
			} else {
				await createMultipartReleaseAsset(createParams, {
					chunkSize,
					parallelUploads,
					override,
				});
			}
		},

		async update(
			id: ReleaseAssetId,
			updateParams: Partial<
				Pick<EditReleaseAssetParams, 'asset_key' | 'asset'>
			>,
			{
				chunkSize = DEFAULT_MULTIPART_CHUNK_SIZE,
				parallelUploads = DEFAULT_MULTIPART_PARALLEL_UPLOAD,
			}: UploadParams = {},
		) {
			const { id: releaseAssetId } = await exports.get(id, { $select: 'id' });
			if (
				updateParams.asset == null ||
				updateParams.asset.size <= MINIMUM_MULTIPART_SIZE
			) {
				await pine.patch({
					id: releaseAssetId,
					resource: 'release_asset',
					body: updateParams,
				});
			} else {
				await uploadMultipartReleaseAsset(releaseAssetId, updateParams.asset, {
					chunkSize,
					parallelUploads,
				});
				if (updateParams.asset_key != null) {
					await pine.patch({
						id: releaseAssetId,
						resource: 'release_asset',
						body: {
							asset_key: updateParams.asset_key,
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
