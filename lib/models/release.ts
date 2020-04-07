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
import * as Promise from 'bluebird';
import omit = require('lodash/omit');
import once = require('lodash/once');
import * as BalenaSdk from '../../typings/balena-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '../balena';
import { findCallback, isId, mergePineOptions } from '../util';

const getReleaseModel = function(
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine } = deps;
	const applicationModel = once(() =>
		require('./application').default(deps, opts),
	) as () => BalenaSdk.BalenaSDK['models']['application'];

	const { buildDependentResource } = require('../util/dependent-resource');
	const { BuilderHelper } = require('../util/builder');
	const builderHelper = new BuilderHelper(deps, opts);

	const tagsModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'release_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'release',
			getResourceId: (commitOrId: string | number) =>
				get(commitOrId, { $select: 'id' }).get('id'),
			ResourceNotFoundError: errors.BalenaReleaseNotFound,
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
	function get(
		commitOrId: string | number,
		options: BalenaSdk.PineOptionsFor<BalenaSdk.Release> = {},
		callback?: (error?: Error, result?: BalenaSdk.Release) => void,
	): Promise<BalenaSdk.Release> {
		callback = findCallback(arguments);

		return Promise.try(() => {
			if (commitOrId == null) {
				throw new errors.BalenaReleaseNotFound(commitOrId);
			}

			if (isId(commitOrId)) {
				return pine
					.get<BalenaSdk.Release>({
						resource: 'release',
						id: commitOrId,
						options: mergePineOptions({}, options),
					})
					.tap(release => {
						if (release == null) {
							throw new errors.BalenaReleaseNotFound(commitOrId);
						}
					});
			} else {
				return pine
					.get<BalenaSdk.Release>({
						resource: 'release',
						options: mergePineOptions(
							{
								$filter: {
									commit: { $startswith: commitOrId },
								},
							},
							options,
						),
					})
					.tap(function(releases) {
						if (releases.length === 0) {
							throw new errors.BalenaReleaseNotFound(commitOrId);
						}

						if (releases.length > 1) {
							throw new errors.BalenaAmbiguousRelease(commitOrId);
						}
					})
					.get(0);
			}
		}).asCallback(callback);
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
	function getWithImageDetails(
		commitOrId: string | number,
		options: {
			release?: BalenaSdk.PineOptionsFor<BalenaSdk.Release>;
			image?: BalenaSdk.PineOptionsFor<BalenaSdk.Image>;
		} = {},
		callback?: (
			error?: Error,
			result?: BalenaSdk.ReleaseWithImageDetails,
		) => void,
	): Promise<BalenaSdk.ReleaseWithImageDetails> {
		callback = findCallback(arguments);

		return get(
			commitOrId,
			mergePineOptions(
				{
					$expand: {
						contains__image: {
							$expand: {
								image: mergePineOptions(
									{
										$select: ['id'],
										$expand: {
											is_a_build_of__service: {
												$select: ['service_name'],
											},
										},
									},
									options.image,
								),
							},
						},
						is_created_by__user: {
							$select: ['id', 'username'],
						},
					},
				},
				options.release,
			),
		)
			.then(function(rawRelease) {
				const release = omit(rawRelease, [
					'contains__image',
					'is_created_by__user',
				]) as BalenaSdk.ReleaseWithImageDetails;

				// Squash .contains__image[x].image[0] into a simple array
				const images = (rawRelease.contains__image as Array<{
					image: BalenaSdk.Image[];
				}>).map(imageJoin => imageJoin.image[0]);

				release.images = images
					.map(function({ is_a_build_of__service, ...imageData }) {
						const image: BalenaSdk.ReleaseWithImageDetails['images'][number] = {
							...imageData,
							service_name: (is_a_build_of__service as BalenaSdk.Service[])[0]
								.service_name,
						};
						return image;
					})
					.sort((a, b) => a.service_name.localeCompare(b.service_name));

				release.user = (rawRelease.is_created_by__user as BalenaSdk.User[])[0];

				return release as BalenaSdk.Release & {
					images: Array<{
						id: number;
						service_name: string;
					}>;
					user: BalenaSdk.User;
				};
			})
			.asCallback(callback);
	}

	/**
	 * @summary Get all releases from an application
	 * @name getAllByApplication
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - releases
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getAllByApplication('MyApp').then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getAllByApplication(123).then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getAllByApplication('MyApp', function(error, releases) {
	 * 	if (error) throw error;
	 * 	console.log(releases);
	 * });
	 */
	function getAllByApplication(
		nameOrSlugOrId: string | number,
		options: BalenaSdk.PineOptionsFor<BalenaSdk.Release> = {},
		callback?: (error?: Error, result?: BalenaSdk.Release[]) => void,
	): Promise<BalenaSdk.Release[]> {
		callback = findCallback(arguments);

		return applicationModel()
			.get(nameOrSlugOrId, { $select: 'id' })
			.then(({ id }) =>
				pine.get({
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
				}),
			)
			.asCallback(callback);
	}

	/**
	 * @summary Get the latest successful release for an application
	 * @name getLatestByApplication
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object|undefined} - release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getLatestByApplication('MyApp').then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getLatestByApplication(123).then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getLatestByApplication('MyApp', function(error, releases) {
	 * 	if (error) throw error;
	 * 	console.log(releases);
	 * });
	 */
	function getLatestByApplication(
		nameOrSlugOrId: string | number,
		options: BalenaSdk.PineOptionsFor<BalenaSdk.Release> = {},
		callback?: (error?: Error, result?: BalenaSdk.Release) => void,
	): Promise<BalenaSdk.Release> {
		callback = findCallback(arguments);

		return getAllByApplication(
			nameOrSlugOrId,
			mergePineOptions(
				{
					$top: 1,
					$filter: {
						status: 'success',
					},
				},
				options,
			),
		)
			.get(0)
			.asCallback(callback);
	}

	/**
	 * @summary Create a new release built from the source in the provided url
	 * @name createFromUrl
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
	 * @param {Object} urlDeployOptions - builder options
	 * @param {String} urlDeployOptions.url - a url with a tarball of the project to build
	 * @param {Boolean} [urlDeployOptions.shouldFlatten=true] - Should be true when the tarball includes an extra root folder with all the content
	 * @fulfil {number} - release ID
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.createFromUrl('MyApp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	 * 	console.log(releaseId);
	 * });
	 *
	 * @example
	 * balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	 * 	console.log(releaseId);
	 * });
	 *
	 * @example
	 * balena.models.release.createFromUrl('MyApp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }, function(error, releaseId) {
	 * 	if (error) throw error;
	 * 	console.log(releaseId);
	 * });
	 */
	function createFromUrl(
		nameOrSlugOrId: string | number,
		urlDeployOptions: BalenaSdk.BuilderUrlDeployOptions,
		callback?: (error?: Error, result?: number) => void,
	): Promise<number> {
		return applicationModel()
			.get(nameOrSlugOrId, {
				$select: 'app_name',
				$expand: {
					organization: {
						$select: 'handle',
					},
				},
			})
			.then(({ app_name, organization }) =>
				builderHelper.buildFromUrl(
					(organization as BalenaSdk.Organization[])[0].handle,
					app_name,
					urlDeployOptions,
				),
			)
			.asCallback(callback);
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
		 * @param {String|Number} nameOrSlugOrId - application name (string), slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication('MyApp').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication('MyApp', function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		getAllByApplication(
			nameOrSlugOrId: string | number,
			options: BalenaSdk.PineOptionsFor<BalenaSdk.ReleaseTag> = {},
			callback?: (error?: Error, result?: BalenaSdk.ReleaseTag[]) => void,
		): Promise<BalenaSdk.ReleaseTag[]> {
			return applicationModel()
				.get(nameOrSlugOrId, { $select: 'id' })
				.then(({ id }) =>
					tagsModel.getAll(
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
					),
				)
				.asCallback(callback);
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
		getAllByRelease(
			commitOrId: string | number,
			options: BalenaSdk.PineOptionsFor<BalenaSdk.ReleaseTag> = {},
			callback?: (error?: Error, result?: BalenaSdk.ReleaseTag[]) => void,
		): Promise<BalenaSdk.ReleaseTag[]> {
			callback = findCallback(arguments);

			return get(commitOrId, {
				$select: 'id',
				$expand: {
					release_tag: mergePineOptions({ $orderby: 'tag_key asc' }, options),
				},
			})
				.then(release => release.release_tag as BalenaSdk.ReleaseTag[])
				.asCallback(callback);
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
		tags,
	};
};

export default getReleaseModel;
