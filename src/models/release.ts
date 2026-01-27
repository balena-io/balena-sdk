/*
Copyright 2016 Balena

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

import * as errors from 'balena-errors';
import once from 'lodash/once';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import { isId, mergePineOptions } from '../util';
import type { ReleaseTag, Release, User, Image } from '../types/models';
import type { BuilderUrlDeployOptions } from '../util/builder';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';

export interface ReleaseRawVersionApplicationPair {
	application: string | number;
	rawVersion: string;
}

type ReleaseRead = Release['Read'];
export interface ReleaseWithImageDetails extends ReleaseRead {
	images: Array<{
		id: number;
		service_name: string;
	}>;
	user: Pick<User['Read'], 'id' | 'username'> | undefined;
}

const getReleaseModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const {
		pine,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	} = deps;
	const { buildDependentResource } =
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');
	const builderHelper = once(() => {
		const { BuilderHelper } =
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			require('../util/builder') as typeof import('../util/builder');
		return new BuilderHelper(deps, opts);
	});

	const assetsModel =
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		(require('./release-asset') as typeof import('./release-asset')).default(
			deps,
			opts,
			(...args: Parameters<typeof get>) => get(...args),
		);

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'release_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'release',
			async getResourceId(commitOrIdOrRawVersion) {
				const { id } = await get(
					commitOrIdOrRawVersion as
						| string
						| number
						| ReleaseRawVersionApplicationPair,
					{ $select: 'id' },
				);
				return id;
			},
		},
	);

	/**
	 * @summary Get a specific release
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.get(123).then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.get('7cf02a69e4d34c9da573914963cf54fd').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.get({application: 456, raw_version: '0.0.0'}).then(function(release) {
	 * 	console.log(release);
	 * });
	 */
	async function get<T extends ODataOptionsWithoutCount<Release['Read']>>(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
		options?: T,
	): Promise<OptionsToResponse<Release['Read'], T, undefined>[number]> {
		if (commitOrIdOrRawVersion == null) {
			throw new errors.BalenaReleaseNotFound(commitOrIdOrRawVersion);
		}
		if (commitOrIdOrRawVersion === '') {
			throw new errors.BalenaInvalidParameterError(
				'commitOrIdOrRawVersion',
				commitOrIdOrRawVersion,
			);
		}

		if (isId(commitOrIdOrRawVersion)) {
			const release = await pine.get({
				resource: 'release',
				id: commitOrIdOrRawVersion,
				options,
			});
			if (release == null) {
				throw new errors.BalenaReleaseNotFound(commitOrIdOrRawVersion);
			}
			return release;
		} else {
			let $filter;
			if (typeof commitOrIdOrRawVersion === 'object') {
				const { rawVersion, application } = commitOrIdOrRawVersion;
				const { id } = await sdkInstance.models.application.get(application, {
					$select: 'id',
				});
				$filter = {
					raw_version: rawVersion,
					belongs_to__application: id,
				};
			} else {
				$filter = {
					commit: commitOrIdOrRawVersion,
				};
			}
			const releases = (await pine.get({
				resource: 'release',
				options: mergePineOptions(
					{
						$filter,
					},
					options,
				),
			})) as OptionsToResponse<Release['Read'], T, undefined>;
			if (releases.length === 0) {
				throw new errors.BalenaReleaseNotFound(
					typeof commitOrIdOrRawVersion === 'string'
						? commitOrIdOrRawVersion
						: `unique pair ${Object.keys(commitOrIdOrRawVersion).join(
								' & ',
							)}: ${Object.values(commitOrIdOrRawVersion).join(' & ')}`,
				);
			}

			if (releases.length > 1) {
				throw new errors.BalenaAmbiguousRelease(
					commitOrIdOrRawVersion as string, // only the `string` commitOrIdOrRawVersions can result in this error
				);
			}
			return releases[0];
		}
	}

	/**
	 * @summary Get a specific release with the details of the images built
	 * @name getWithImageDetails
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @description
	 * This method does not map exactly to the underlying model: it runs a
	 * larger prebuilt query, and reformats it into an easy to use and
	 * understand format. If you want significantly more control, or to see the
	 * raw model directly, use `release.get(id, options)` instead.
	 *
	 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
	 * @param {Object} [options={}] - a map of extra pine options
	 * @param {Boolean} [options.release={}] - extra pine options for releases
	 * @param {Object} [options.image={}] - extra pine options for images
	 * @fulfil {Object} - release with image details
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123).then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails('7cf02a69e4d34c9da573914963cf54fd').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails({application: 456, raw_version: '0.0.0'}).then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
	 * .then(function(release) {
	 * 	console.log(release.images[0].build_log);
	 * });
	 */
	async function getWithImageDetails<
		R extends ODataOptionsWithoutCount<Release['Read']>,
		I extends ODataOptionsWithoutCount<Image['Read']>,
	>(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
		options: {
			release?: R;
			image?: I;
		} = {},
	) {
		const baseImageOptions = {
			$select: ['id'],
			$expand: {
				is_a_build_of__service: {
					$select: 'service_name',
				},
			},
		} as const;

		const baseReleaseOptions = {
			$expand: {
				release_image: {
					$expand: {
						image: mergePineOptions(
							baseImageOptions,
							options.image,
						) as typeof baseImageOptions,
					},
				},
				is_created_by__user: {
					$select: ['id', 'username'],
				},
			},
		} as const;

		const rawRelease = await get(
			commitOrIdOrRawVersion,
			mergePineOptions(
				baseReleaseOptions,
				options.release,
			) as typeof baseReleaseOptions,
		);
		const release = rawRelease as ReleaseWithImageDetails;

		// Squash .release_image[x].image[0] into a simple array
		const images = rawRelease.release_image.map(
			(imageJoin) => imageJoin.image[0],
		);
		delete release.release_image;

		release.images = images
			.map(function ({ is_a_build_of__service, ...imageData }) {
				const image = {
					...imageData,
					service_name: is_a_build_of__service[0].service_name,
				};
				return image;
			})
			.sort((a, b) => a.service_name.localeCompare(b.service_name));

		release.user = rawRelease.is_created_by__user[0];

		return release;
	}

	/**
	 * @summary Get all releases from an application
	 * @name getAllByApplication
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - releases
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getAllByApplication('myorganization/myapp').then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getAllByApplication(123).then(function(releases) {
	 * 	console.log(releases);
	 * });
	 */
	async function getAllByApplication<
		T extends ODataOptionsWithoutCount<Release['Read']>,
	>(
		slugOrUuidOrId: string | number,
		options?: T,
	): Promise<NoInfer<OptionsToResponse<Release['Read'], T, undefined>>> {
		const { id } = await sdkInstance.models.application.get(slugOrUuidOrId, {
			$select: 'id',
		});
		return (await pine.get({
			resource: 'release',
			options: mergePineOptions(
				{
					$filter: {
						belongs_to__application: id,
					},
					$orderby: { created_at: 'desc' },
				},
				options,
			),
		})) as OptionsToResponse<Release['Read'], T, undefined>;
	}

	/**
	 * @summary Get the latest successful release for an application
	 * @name getLatestByApplication
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object|undefined} - release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getLatestByApplication('myorganization/myapp').then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getLatestByApplication(123).then(function(releases) {
	 * 	console.log(releases);
	 * });
	 */
	async function getLatestByApplication<
		T extends ODataOptionsWithoutCount<Release['Read']>,
	>(
		slugOrUuidOrId: string | number,
		options?: T,
	): Promise<OptionsToResponse<Release['Read'], T, undefined>[number]> {
		const [release] = (await getAllByApplication(
			slugOrUuidOrId,
			mergePineOptions(
				{
					$top: 1,
					$filter: {
						status: 'success',
					},
				},
				options,
			),
		)) as OptionsToResponse<Release['Read'], T, undefined>;
		return release;
	}

	/**
	 * @summary Create a new release built from the source in the provided url
	 * @name createFromUrl
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
	 * @param {Object} urlDeployOptions - builder options
	 * @param {String} urlDeployOptions.url - a url with a tarball of the project to build
	 * @param {Boolean} [urlDeployOptions.shouldFlatten=true] - Should be true when the tarball includes an extra root folder with all the content
	 * @fulfil {number} - release ID
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.createFromUrl('myorganization/myapp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	 * 	console.log(releaseId);
	 * });
	 *
	 * @example
	 * balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	 * 	console.log(releaseId);
	 * });
	 */
	async function createFromUrl(
		slugOrUuidOrId: string | number,
		urlDeployOptions: BuilderUrlDeployOptions,
	): Promise<number> {
		const appOptions = {
			$select: 'app_name',
			$expand: {
				organization: {
					$select: 'handle',
				},
			},
		} as const;

		const { app_name, organization } = await sdkInstance.models.application.get(
			slugOrUuidOrId,
			appOptions,
		);
		return await builderHelper().buildFromUrl(
			organization[0].handle,
			app_name,
			urlDeployOptions,
		);
	}

	/**
	 * @summary Finalizes a draft release
	 * @name finalize
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
	 * @fulfil {void}
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.finalize(123).then(function() {
	 * 	console.log('finalized!');
	 * });
	 *
	 * @example
	 * balena.models.release.finalize('7cf02a69e4d34c9da573914963cf54fd').then(function() {
	 * 	console.log('finalized!');
	 * });
	 *
	 * @example
	 * balena.models.release.finalize({application: 456, raw_version: '0.0.0'}).then(function(release) {
	 * 	console.log('finalized!');
	 * });
	 *
	 */
	async function finalize(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
	): Promise<void> {
		const { id } = await get(commitOrIdOrRawVersion, { $select: 'id' });
		await pine.patch({
			resource: 'release',
			id,
			body: {
				is_final: true,
			},
		});
	}

	/**
	 * @summary Set the is_invalidated property of a release to true or false
	 * @name setIsInvalidated
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
	 * @param {Boolean} isInvalidated - boolean value, true for invalidated, false for validated
	 * @fulfil {void}
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.setIsInvalidated(123, true).then(function() {
	 * 	console.log('invalidated!');
	 * });
	 *
	 * @example
	 * balena.models.release.setIsInvalidated('7cf02a69e4d34c9da573914963cf54fd', true).then(function() {
	 * 	console.log('invalidated!');
	 * });
	 *
	 * @example
	 * balena.models.release.setIsInvalidated({application: 456, raw_version: '0.0.0'}).then(function(release) {
	 * 	console.log('invalidated!);
	 * });
	 *
	 * @example
	 * balena.models.release.setIsInvalidated(123, false).then(function() {
	 * 	console.log('validated!');
	 * });
	 *
	 * @example
	 * balena.models.release.setIsInvalidated('7cf02a69e4d34c9da573914963cf54fd', false).then(function() {
	 * 	console.log('validated!');
	 * });
	 *
	 */
	async function setIsInvalidated(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
		isInvalidated: boolean,
	): Promise<void> {
		const { id } = await get(commitOrIdOrRawVersion, { $select: 'id' });
		await pine.patch({
			resource: 'release',
			id,
			body: {
				is_invalidated: isInvalidated,
			},
		});
	}

	/**
	 * @summary Add a note to a release
	 * @name setNote
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
	 * @param {String|Null} noteOrNull - the note
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.setNote('7cf02a69e4d34c9da573914963cf54fd', 'My useful note');
	 *
	 * @example
	 * balena.models.release.setNote(123, 'My useful note');
	 *
	 * @example
	 * balena.models.release.setNote({ application: 456, rawVersion: '0.0.0' }, 'My useful note');
	 *
	 */
	async function setNote(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
		noteOrNull: string | null,
	): Promise<void> {
		const { id } = await get(commitOrIdOrRawVersion, { $select: 'id' });
		await pine.patch({
			resource: 'release',
			id,
			body: {
				note: noteOrNull,
			},
		});
	}

	/**
	 * @summary Add a known issue list to a release
	 * @name setKnownIssueList
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
	 * @param {String|Null} knownIssueListOrNull - the known issue list
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.setKnownIssueList('7cf02a69e4d34c9da573914963cf54fd', 'This is an issue');
	 *
	 * @example
	 * balena.models.release.setKnownIssueList(123, 'This is an issue');
	 *
	 * @example
	 * balena.models.release.setKnownIssueList({application: 456, rawVersion: '0.0.0'}, 'This is an issue');
	 */
	async function setKnownIssueList(
		commitOrIdOrRawVersion: string | number | ReleaseRawVersionApplicationPair,
		knownIssueListOrNull: string | null,
	): Promise<void> {
		const { id } = await get(commitOrIdOrRawVersion, { $select: 'id' });
		await pine.patch({
			resource: 'release',
			id,
			body: {
				known_issue_list: knownIssueListOrNull,
			},
		});
	}

	/**
	 * @namespace balena.models.release.tags
	 * @memberof balena.models.release
	 */
	const tags = {
		/**
		 * @summary Get all release tags for an application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 */
		async getAllByApplication<
			T extends ODataOptionsWithoutCount<ReleaseTag['Read']>,
		>(
			slugOrUuidOrId: string | number,
			options?: T,
		): Promise<OptionsToResponse<ReleaseTag['Read'], T, undefined>> {
			const { id } = await sdkInstance.models.application.get(slugOrUuidOrId, {
				$select: 'id',
			});
			return (await tagsModel.getAll(
				mergePineOptions(
					{
						$filter: {
							release: {
								$any: {
									$alias: 'r',
									$expr: {
										r: {
											belongs_to__application: id,
										},
									},
								},
							},
						},
					},
					options,
				),
			)) as OptionsToResponse<ReleaseTag['Read'], T, undefined>;
		},

		/**
		 * @summary Get all release tags for a release
		 * @name getAllByRelease
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease(123).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease('7cf02a69e4d34c9da573914963cf54fd').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease({application: 456, rawVersion: '0.0.0'}).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 */
		async getAllByRelease<
			T extends ODataOptionsWithoutCount<ReleaseTag['Read']>,
		>(
			commitOrIdOrRawVersion:
				| string
				| number
				| ReleaseRawVersionApplicationPair,
			options?: T,
		): Promise<OptionsToResponse<ReleaseTag['Read'], T, undefined>> {
			const release = await get(commitOrIdOrRawVersion, {
				$select: 'id',
				$expand: {
					release_tag: mergePineOptions(
						{ $orderby: { tag_key: 'asc' } },
						options,
					),
				},
			});

			return release.release_tag as OptionsToResponse<
				ReleaseTag['Read'],
				T,
				undefined
			>;
		},

		/**
		 * @summary Set a release tag
		 * @name set
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
		 * @param {String} tagKey - tag key
		 * @param {String|undefined} value - tag value
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.set(123, 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.release.tags.set('7cf02a69e4d34c9da573914963cf54fd', 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.release.tags.set({application: 456, rawVersion: '0.0.0'}, 'EDITOR', 'vim');
		 */
		set: tagsModel.set,

		/**
		 * @summary Remove a release tag
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
		 * @param {String} tagKey - tag key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.remove(123, 'EDITOR');
		 *
		 * @example
		 * balena.models.release.tags.remove('7cf02a69e4d34c9da573914963cf54fd', 'EDITOR');
		 *
		 * @example
		 * balena.models.release.tags.remove({application: 456, rawVersion: '0.0.0'}, 'EDITOR');
		 */
		remove: tagsModel.remove,
	};

	/**
	 * @namespace asset
	 * @memberof balena.models.release
	 */
	const asset = {
		/**
		 * @summary Get all release assets for a release
		 * @name getAllByRelease
		 * @public
		 * @function
		 * @memberof balena.models.release.asset
		 *
		 * @param {String|Number|Object} commitOrIdOrRawVersion - release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release assets
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.asset.getAllByRelease(123).then(function(assets) {
		 * 	console.log(assets);
		 * });
		 *
		 * @example
		 * balena.models.release.asset.getAllByRelease('7cf02a69e4d34c9da573914963cf54fd').then(function(assets) {
		 * 	console.log(assets);
		 * });
		 *
		 * @example
		 * balena.models.release.asset.getAllByRelease({ application: 456, raw_version: '1.2.3' }).then(function(assets) {
		 * 	console.log(assets);
		 * });
		 */
		getAllByRelease: assetsModel.getAllByRelease,

		/**
		 * @summary Get a specific release asset
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.release.asset
		 *
		 * @param {Number|Object} id - release asset ID or object specifying the unique release & asset_key pair
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object} - release asset
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.asset.get(123).then(function(asset) {
		 * 	console.log(asset);
		 * });
		 *
		 * @example
		 * balena.models.release.asset.get({
		 * 	asset_key: 'logo.png',
		 * 	release: 123
		 * }).then(function(asset) {
		 * 	console.log(asset);
		 * });
		 */
		get: assetsModel.get,

		/**
		 * @summary Download a release asset
		 * @name download
		 * @public
		 * @function
		 * @memberof balena.models.release.asset
		 *
		 * @param {Number|Object} id - release asset ID or object specifying the unique release & asset_key pair
		 * @fulfil {NodeJS.ReadableStream} - download stream
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.asset.download(123).then(function(stream) {
		 * 	stream.pipe(fs.createWriteStream('logo.png'));
		 * });
		 *
		 * @example
		 * balena.models.release.asset.download({
		 * 	asset_key: 'logo.png',
		 * 	release: 123
		 * }).then(function(stream) {
		 * 	stream.pipe(fs.createWriteStream('logo.png'));
		 * });
		 */
		download: assetsModel.download,

		/**
		 * @summary Upload a release asset
		 * @name upload
		 * @public
		 * @function
		 * @memberof balena.models.release.asset
		 *
		 * @param {Object} uploadParams - upload parameters
		 * @param {String|File} uploadParams.asset - asset file path (string, Node.js only) or File object (Node.js & browser). For File objects, use new File([content], filename, {type: mimeType})
		 * @param {String} uploadParams.asset_key - unique key for the asset within the release
		 * @param {Number} uploadParams.release - release ID
		 * @param {Object} [options={}] - upload options
		 * @param {Number} [options.chunkSize=5242880] - chunk size for multipart uploads (5MiB default)
		 * @param {Number} [options.parallelUploads=5] - number of parallel uploads for multipart
		 * @param {Boolean} [options.overwrite=false] - whether to overwrite existing asset
		 * @param {Function} [options.onUploadProgress] - callback for upload progress
		 * @fulfil {Object} - uploaded release asset
		 * @returns {Promise}
		 *
		 * @example
		 * // Upload from file path (Node.js)
		 * balena.models.release.asset.upload({
		 * 	asset: '/path/to/logo.png',
		 * 	asset_key: 'logo.png',
		 * 	release: 123
		 * }).then(function(asset) {
		 * 	console.log('Asset uploaded:', asset);
		 * });
		 *
		 * @example
		 * // Upload with File API (Node.js and browser)
		 * const content = Buffer.from('Hello, World!', 'utf-8');
		 * const file = new File([content], 'readme.txt', { type: 'text/plain' });
		 *
		 * balena.models.release.asset.upload({
		 * 	asset: file,
		 * 	asset_key: 'readme.txt',
		 * 	release: 123
		 * }).then(function(asset) {
		 * 	console.log('Asset uploaded:', asset);
		 * });
		 *
		 * @example
		 * // Upload large file with File API and progress tracking
		 * const largeContent = new Uint8Array(10 * 1024 * 1024); // 10MB
		 * const largeFile = new File([largeContent], 'data.bin', { type: 'application/octet-stream' });
		 *
		 * balena.models.release.asset.upload({
		 * 	asset: largeFile,
		 * 	asset_key: 'data.bin',
		 * 	release: 123
		 * }, {
		 * 	chunkSize: 5 * 1024 * 1024, // 5MB chunks
		 * 	parallelUploads: 3,
		 * 	onUploadProgress: function(progress) {
		 * 		const percent = (progress.uploaded / progress.total * 100).toFixed(2);
		 * 		console.log(`Upload progress: ${percent}%`);
		 * 	}
		 * }).then(function(asset) {
		 * 	console.log('Large file uploaded:', asset);
		 * });
		 *
		 * @example
		 * // Browser: Upload file from input element
		 * const fileInput = document.getElementById('fileInput');
		 * const file = fileInput.files[0]; // File object from input
		 *
		 * balena.models.release.asset.upload({
		 * 	asset: file,
		 * 	asset_key: file.name,
		 * 	release: 123
		 * }).then(function(asset) {
		 * 	console.log('File uploaded from browser:', asset);
		 * });
		 *
		 * @example
		 * // Upload with overwrite option
		 * balena.models.release.asset.upload({
		 * 	asset: '/path/to/logo.png',
		 * 	asset_key: 'logo.png',
		 * 	release: 123
		 * }, {
		 * 	overwrite: true
		 * }).then(function(asset) {
		 * 	console.log('Asset uploaded/updated:', asset);
		 * });
		 */
		upload: assetsModel.upload,

		/**
		 * @summary Remove a release asset
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.release.asset
		 *
		 * @param {Number|Object} id - release asset ID or object specifying the unique release & asset_key pair
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.asset.remove(123);
		 *
		 * @example
		 * balena.models.release.asset.remove({
		 * 	asset_key: 'logo.png',
		 * 	release: 123
		 * });
		 */
		remove: assetsModel.remove,
	};

	return {
		get,
		getAllByApplication,
		getLatestByApplication,
		getWithImageDetails,
		createFromUrl,
		finalize,
		setIsInvalidated,
		setNote,
		setKnownIssueList,
		tags,
		asset,
	};
};

export default getReleaseModel;
