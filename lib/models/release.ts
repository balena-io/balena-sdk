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
import once = require('lodash/once');
import type * as BalenaSdk from '..';
import type {
	InjectedDependenciesParam,
	InjectedOptionsParam,
	PineTypedResult,
} from '..';
import { isId, mergePineOptions } from '../util';
import { toWritable } from '../util/types';
import type { Application, ReleaseTag, Release, User } from '../types/models';
import type { BuilderUrlDeployOptions } from '../util/builder';

export interface ReleaseWithImageDetails extends Release {
	images: Array<{
		id: number;
		service_name: string;
	}>;
	user: Pick<User, 'id' | 'username'> | undefined;
}

const getReleaseModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine } = deps;
	const applicationModel = once(() =>
		(require('./application') as typeof import('./application')).default(
			deps,
			opts,
		),
	);

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');
	const builderHelper = once(() => {
		const { BuilderHelper } =
			require('../util/builder') as typeof import('../util/builder');
		return new BuilderHelper(deps, opts);
	});

	const tagsModel = buildDependentResource<ReleaseTag>(
		{ pine },
		{
			resourceName: 'release_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'release',
			getResourceId: async (commitOrId: string | number): Promise<number> =>
				(await get(commitOrId, { $select: 'id' })).id,
		},
	);

	/**
	 * @summary Get a specific release
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
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
	 * balena.models.release.get('7cf02a6').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.get(123, function(error, release) {
	 * 	if (error) throw error;
	 * 	console.log(release);
	 * });
	 */
	async function get(
		commitOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Release> = {},
	): Promise<BalenaSdk.Release> {
		if (commitOrId == null) {
			throw new errors.BalenaReleaseNotFound(commitOrId);
		}

		if (isId(commitOrId)) {
			const release = await pine.get({
				resource: 'release',
				id: commitOrId,
				options: mergePineOptions({}, options),
			});
			if (release == null) {
				throw new errors.BalenaReleaseNotFound(commitOrId);
			}
			return release;
		} else {
			const releases = await pine.get({
				resource: 'release',
				options: mergePineOptions(
					{
						$filter: {
							commit: { $startswith: commitOrId },
						},
					},
					options,
				),
			});
			if (releases.length === 0) {
				throw new errors.BalenaReleaseNotFound(commitOrId);
			}

			if (releases.length > 1) {
				throw new errors.BalenaAmbiguousRelease(commitOrId);
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
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
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
	 * balena.models.release.getWithImageDetails('7cf02a6').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
	 * .then(function(release) {
	 * 	console.log(release.images[0].build_log);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123, function(error, release) {
	 * 	if (error) throw error;
	 * 	console.log(release);
	 * });
	 */
	async function getWithImageDetails(
		commitOrId: string | number,
		options: {
			release?: BalenaSdk.PineOptions<BalenaSdk.Release>;
			image?: BalenaSdk.PineOptions<BalenaSdk.Image>;
		} = {},
	): Promise<BalenaSdk.ReleaseWithImageDetails> {
		const baseImageOptions = {
			$select: 'id',
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
					$select: toWritable(['id', 'username'] as const),
				},
			},
		} as const;

		const rawRelease = (await get(
			commitOrId,
			mergePineOptions(baseReleaseOptions, options.release),
		)) as PineTypedResult<Release, typeof baseReleaseOptions>;
		const release = rawRelease as BalenaSdk.ReleaseWithImageDetails;

		// Squash .release_image[x].image[0] into a simple array
		const images = rawRelease.release_image.map(
			(imageJoin) => imageJoin.image[0],
		);
		delete release.release_image;

		release.images = images
			.map(function ({ is_a_build_of__service, ...imageData }) {
				const image: BalenaSdk.ReleaseWithImageDetails['images'][number] = {
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
	 *
	 * @example
	 * balena.models.release.getAllByApplication('myorganization/myapp', function(error, releases) {
	 * 	if (error) throw error;
	 * 	console.log(releases);
	 * });
	 */
	async function getAllByApplication(
		slugOrUuidOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Release> = {},
	): Promise<BalenaSdk.Release[]> {
		const { id } = await applicationModel().get(slugOrUuidOrId, {
			$select: 'id',
		});
		return await pine.get({
			resource: 'release',
			options: mergePineOptions(
				{
					$filter: {
						belongs_to__application: id,
					},
					$orderby: 'created_at desc',
				},
				options,
			),
		});
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
	 *
	 * @example
	 * balena.models.release.getLatestByApplication('myorganization/myapp', function(error, releases) {
	 * 	if (error) throw error;
	 * 	console.log(releases);
	 * });
	 */
	async function getLatestByApplication(
		slugOrUuidOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Release> = {},
	): Promise<BalenaSdk.Release | undefined> {
		const [release] = await getAllByApplication(
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
		);
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
	 *
	 * @example
	 * balena.models.release.createFromUrl('myorganization/myapp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }, function(error, releaseId) {
	 * 	if (error) throw error;
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

		const { app_name, organization } = (await applicationModel().get(
			slugOrUuidOrId,
			appOptions,
		)) as PineTypedResult<Application, typeof appOptions>;
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
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
	 * @fulfil {void}
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.finalize(123).then(function() {
	 * 	console.log('finalized!');
	 * });
	 *
	 * @example
	 * balena.models.release.finalize('7cf02a6').then(function() {
	 * 	console.log('finalized!');
	 * });
	 *
	 */
	async function finalize(commitOrId: string | number): Promise<void> {
		const { id } = await get(commitOrId, { $select: 'id' });
		await pine.patch<Release>({
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
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
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
	 * balena.models.release.setIsInvalidated('7cf02a6', true).then(function() {
	 * 	console.log('invalidated!');
	 * });
	 *
	 * @example
	 * balena.models.release.setIsInvalidated(123, false).then(function() {
	 * 	console.log('validated!');
	 * });
	 *
	 * @example
	 * balena.models.release.setIsInvalidated('7cf02a6', false).then(function() {
	 * 	console.log('validated!');
	 * });
	 *
	 */
	async function setIsInvalidated(
		commitOrId: string | number,
		isInvalidated: boolean,
	): Promise<void> {
		const { id } = await get(commitOrId, { $select: 'id' });
		await pine.patch<Release>({
			resource: 'release',
			id,
			body: {
				is_invalidated: isInvalidated,
			},
		});
	}

	// TODO: Rename to `setNote` in the next major
	/**
	 * @summary Add a note to a release
	 * @name note
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
	 * @param {String|Null} noteOrNull - the note
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.note('7cf02a6', 'My useful note');
	 *
	 * @example
	 * balena.models.release.note(123, 'My useful note');
	 */
	async function note(
		commitOrId: string | number,
		noteOrNull: string | null,
	): Promise<void> {
		const { id } = await get(commitOrId, { $select: 'id' });
		await pine.patch<Release>({
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
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
	 * @param {String|Null} knownIssueListOrNull - the known issue list
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.setKnownIssueList('7cf02a6', 'This is an issue');
	 *
	 * @example
	 * balena.models.release.setKnownIssueList(123, 'This is an issue');
	 */
	async function setKnownIssueList(
		commitOrId: string | number,
		knownIssueListOrNull: string | null,
	): Promise<void> {
		const { id } = await get(commitOrId, { $select: 'id' });
		await pine.patch<Release>({
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
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication('myorganization/myapp', function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		async getAllByApplication(
			slugOrUuidOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ReleaseTag> = {},
		): Promise<BalenaSdk.ReleaseTag[]> {
			const { id } = await applicationModel().get(slugOrUuidOrId, {
				$select: 'id',
			});
			return await tagsModel.getAll(
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
			);
		},

		/**
		 * @summary Get all release tags for a release
		 * @name getAllByRelease
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} commitOrId - release commit (string) or id (number)
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
		 * balena.models.release.tags.getAllByRelease('7cf02a6').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease(123, function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		async getAllByRelease(
			commitOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ReleaseTag> = {},
		): Promise<BalenaSdk.ReleaseTag[]> {
			const releaseOpts = {
				$select: 'id',
				$expand: {
					release_tag: mergePineOptions({ $orderby: 'tag_key asc' }, options),
				},
			} as const;

			const release = (await get(commitOrId, releaseOpts)) as PineTypedResult<
				Release,
				typeof releaseOpts
			>;
			return release.release_tag;
		},

		/**
		 * @summary Get all release tags
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAll().then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAll(function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		getAll: tagsModel.getAll,

		/**
		 * @summary Set a release tag
		 * @name set
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} commitOrId - release commit (string) or id (number)
		 * @param {String} tagKey - tag key
		 * @param {String|undefined} value - tag value
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.set(123, 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.release.tags.set('7cf02a6', 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.release.tags.set(123, 'EDITOR', 'vim', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		set: tagsModel.set,

		/**
		 * @summary Remove a release tag
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} commitOrId - release commit (string) or id (number)
		 * @param {String} tagKey - tag key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.remove(123, 'EDITOR');
		 *
		 * @example
		 * balena.models.release.tags.remove('7cf02a6', 'EDITOR');
		 *
		 * @example
		 * balena.models.release.tags.remove(123, 'EDITOR', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		remove: tagsModel.remove,
	};

	return {
		get,
		getAllByApplication,
		getLatestByApplication,
		getWithImageDetails,
		createFromUrl,
		finalize,
		setIsInvalidated,
		note,
		setKnownIssueList,
		tags,
	};
};

export default getReleaseModel;
