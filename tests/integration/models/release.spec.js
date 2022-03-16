import { expect } from 'chai';
import * as parallel from 'mocha.parallel';
import * as _ from 'lodash';
import { delay, timeSuite } from '../../util';

import {
	balena,
	credentials,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
	IS_BROWSER,
	applicationRetrievalFields,
} from '../setup';

import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';

const releaseRetrievalFields = ['id', 'commit'];

describe('Release Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);

	describe('given an application with no releases', function () {
		givenAnApplication(before);

		let ctx = null;

		before(function () {
			ctx = this;
		});

		parallel('balena.models.release.get()', function () {
			it('should be rejected if the release id does not exist by id', function () {
				const promise = balena.models.release.get(123);
				return expect(promise).to.be.rejectedWith('Release not found: 123');
			});

			it('should be rejected if the release id does not exist by commit', function () {
				const promise = balena.models.release.get('7cf02a6');
				return expect(promise).to.be.rejectedWith('Release not found: 7cf02a6');
			});
		});

		parallel('balena.models.release.getWithImageDetails()', function () {
			it('should be rejected if the release id does not exist by id', function () {
				const promise = balena.models.release.getWithImageDetails(123);
				return expect(promise).to.be.rejectedWith('Release not found: 123');
			});

			it('should be rejected if the release id does not exist by commit', function () {
				const promise = balena.models.release.getWithImageDetails('7cf02a6');
				return expect(promise).to.be.rejectedWith('Release not found: 7cf02a6');
			});
		});

		parallel('balena.models.release.getAllByApplication()', function () {
			applicationRetrievalFields.forEach((prop) =>
				it(`should eventually become an empty array given an application ${prop}`, function () {
					const promise = balena.models.release.getAllByApplication(
						ctx.application[prop],
					);
					return expect(promise).to.become([]);
				}),
			);

			it('should be rejected if the application name does not exist', function () {
				const promise =
					balena.models.release.getAllByApplication('HelloWorldApp');
				return expect(promise).to.be.rejectedWith(
					'Application not found: HelloWorldApp',
				);
			});

			it('should be rejected if the application id does not exist', function () {
				const promise = balena.models.release.getAllByApplication(999999);
				return expect(promise).to.be.rejectedWith(
					'Application not found: 999999',
				);
			});
		});

		describe('balena.models.release.createFromUrl()', function () {
			// There is a CORS header that only allows us to run this from dashboard.balena-cloud.com
			if (IS_BROWSER) {
				return;
			}

			const releaseIds = [];

			const TEST_SOURCE_URL =
				'https://github.com/balena-io-examples/balena-node-hello-world/archive/v1.0.0.tar.gz';
			const TEST_SOURCE_CONTAINER_COUNT = 1;

			async function waitForImagesToBeCreated(appId, releaseCount) {
				if (releaseCount === 0) {
					return;
				}
				const start = Date.now();
				while (true) {
					const imageCount = await balena.pine.get({
						resource: 'image',
						options: {
							$count: {
								$filter: {
									is_a_build_of__service: {
										$any: {
											$alias: 's',
											$expr: {
												s: {
													application: appId,
												},
											},
										},
									},
								},
							},
						},
					});
					if (imageCount === TEST_SOURCE_CONTAINER_COUNT * releaseCount) {
						break;
					}
					// don't wait more than 30 seconds
					const msWaiting = Date.now() - start;
					if (msWaiting > 30 * 1000) {
						console.warn(
							`Giving up waiting before balena.models.release.createFromUrl() cleanup, since ${
								Date.now() - start
							}ms have already passed`,
						);
						break;
					}
					console.info(
						'Waiting before balena.models.release.createFromUrl() cleanup',
					);
					await delay(5000);
				}
				console.info(
					'Continuing balena.models.release.createFromUrl() cleanup',
				);
			}

			after(async function () {
				// Wait for the builder to create the pending image records of the releases
				// since otherwise the release or application delete would fail with a DB error.
				// See: https://www.flowdock.com/app/rulemotion/resin-devops/threads/wOEEiorvtaeCtuGc4KVO0YpAy-f
				await waitForImagesToBeCreated(this.application.id, releaseIds.length);

				await balena.pine.delete({
					resource: 'release',
					options: {
						$filter: {
							belongs_to__application: this.application.id,
						},
					},
				});
			});

			parallel('', function () {
				// [read operations]
				it('should be rejected if the application name does not exist', async function () {
					const promise = balena.models.release.createFromUrl('HelloWorldApp', {
						url: TEST_SOURCE_URL,
					});
					await expect(promise).to.be.rejectedWith(
						'Application not found: HelloWorldApp',
					);
				});

				it('should be rejected if the application id does not exist', async function () {
					const promise = balena.models.release.createFromUrl(999999, {
						url: TEST_SOURCE_URL,
					});
					await expect(promise).to.be.rejectedWith(
						'Application not found: 999999',
					);
				});

				it('should be rejected when the provided tarball url is not found', async function () {
					const promise = balena.models.release.createFromUrl(
						ctx.application.id,
						{
							url: 'https://github.com/balena-io-projects/simple-server-node/archive/v0.0.0.tar.gz',
						},
					);
					const error = await expect(promise).to.be.rejected;
					expect(error).to.have.property('code', 'BalenaRequestError');
					expect(error).to.have.property('statusCode', 404);
					expect(error)
						.to.have.property('message')
						.that.contains('Failed to fetch tarball from passed URL');
				});

				it('should be rejected when the provided url is not a tarball', async function () {
					const promise = balena.models.release.createFromUrl(
						ctx.application.id,
						{ url: 'https://github.com/balena-io-projects/simple-server-node' },
					);
					const error = await expect(promise).to.be.rejected;
					expect(error).to.have.property('code', 'BalenaError');
					expect(error)
						.to.have.property('message')
						.that.contains(
							'Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?',
						);
				});

				// [mutating operations]
				applicationRetrievalFields.forEach((prop) => {
					it(`should be able to create a release using a tarball url given an application ${prop}`, async function () {
						const releaseId = await balena.models.release.createFromUrl(
							ctx.application[prop],
							{ url: TEST_SOURCE_URL },
						);

						expect(releaseId).to.be.a('number');
						releaseIds.push(releaseId);

						const release = await balena.models.release.get(releaseId);
						expect(release).to.deep.match({
							status: 'running',
							source: 'cloud',
							id: releaseId,
							belongs_to__application: { __id: ctx.application.id },
						});
						expect(release).to.have.property('commit').that.is.a('string');
					});
				});
			});
		});

		describe(`given ${releaseRetrievalFields.length} draft releases`, function () {
			const testReleaseByField = {};

			before(async function () {
				const userId = await balena.auth.getUserId();
				await Promise.all(
					releaseRetrievalFields.map(async (field, i) => {
						testReleaseByField[field] = await balena.pine.post({
							resource: 'release',
							body: {
								belongs_to__application: this.application.id,
								is_created_by__user: userId,
								commit: `abcdef${i}`,
								status: 'success',
								source: 'cloud',
								is_final: false,
								composition: {},
								start_timestamp: new Date().toISOString(),
							},
						});
					}),
				);
			});

			describe('balena.model.release.finalize()', function () {
				parallel('', function () {
					releaseRetrievalFields.forEach((field) => {
						it(`should finalize a release by ${field}`, async function () {
							const draftRelease = testReleaseByField[field];
							await balena.models.release.finalize(draftRelease[field]);
							const finalRelease = await balena.models.release.get(
								draftRelease.id,
							);
							expect(finalRelease).to.deep.match({
								id: draftRelease.id,
								commit: draftRelease.commit,
								is_final: true,
							});
						});
					});
				});
			});

			describe('balena.model.release.setIsInvalidated()', function () {
				releaseRetrievalFields.forEach((field) => {
					parallel('', function () {
						it(`should invalidate a release by ${field}`, async function () {
							const release = testReleaseByField[field];
							await balena.models.release.setIsInvalidated(
								release[field],
								true,
							);
							const invalidatedRelease = await balena.models.release.get(
								release.id,
								{ $select: 'is_invalidated' },
							);
							expect(invalidatedRelease).to.deep.match({
								is_invalidated: true,
							});
						});
					});

					parallel('', function () {
						it(`should validate a release by ${field}`, async function () {
							const release = testReleaseByField[field];
							await balena.models.release.setIsInvalidated(
								release[field],
								false,
							);
							const validatedRelease = await balena.models.release.get(
								release.id,
								{ $select: 'is_invalidated' },
							);
							expect(validatedRelease).to.deep.match({
								is_invalidated: false,
							});
						});
					});
				});
			});
		});
	});

	describe('given a multicontainer application with two releases', function () {
		givenMulticontainerApplication(before);

		let ctx = null;

		before(function () {
			ctx = this;
		});

		parallel('balena.models.release.get()', function () {
			it('should get the requested release by id', function () {
				return balena.models.release
					.get(ctx.currentRelease.id)
					.then((release) => {
						return expect(release).to.deep.match({
							status: 'success',
							source: 'cloud',
							commit: 'new-release-commit',
							id: ctx.currentRelease.id,
							belongs_to__application: { __id: ctx.application.id },
						});
					});
			});

			it('should get the requested release by commit', function () {
				return balena.models.release
					.get(ctx.currentRelease.commit)
					.then((release) => {
						return expect(release).to.deep.match({
							status: 'success',
							source: 'cloud',
							commit: 'new-release-commit',
							id: ctx.currentRelease.id,
							belongs_to__application: { __id: ctx.application.id },
						});
					});
			});

			it('should get the requested release by shorter commit', function () {
				return balena.models.release
					.get(ctx.currentRelease.commit.slice(0, 7))
					.then((release) => {
						return expect(release).to.deep.match({
							status: 'success',
							source: 'cloud',
							commit: 'new-release-commit',
							id: ctx.currentRelease.id,
							belongs_to__application: { __id: ctx.application.id },
						});
					});
			});
		});

		describe('balena.models.release.getAllByApplication()', () =>
			it('should load both releases', function () {
				return balena.models.release
					.getAllByApplication(this.application.id)
					.then(function (releases) {
						expect(releases).to.have.lengthOf(2);

						// Need to sort explicitly because releases were both created
						// at almost exactly the same time (just now, in test setup)
						const sortedReleases = _.sortBy(
							releases,
							(release) => release.start_timestamp,
						);
						return expect(sortedReleases).to.deep.match([
							{
								status: 'success',
								source: 'cloud',
								commit: 'old-release-commit',
							},
							{
								status: 'success',
								source: 'cloud',
								commit: 'new-release-commit',
							},
						]);
					});
			}));

		parallel('balena.models.release.getWithImageDetails()', function () {
			it('should get the release with associated images attached by id', function () {
				return balena.models.release
					.getWithImageDetails(ctx.currentRelease.id)
					.then(function (release) {
						expect(release).to.deep.match({
							commit: 'new-release-commit',
							status: 'success',
							source: 'cloud',
							images: [{ service_name: 'db' }, { service_name: 'web' }],
							user: {
								username: credentials.username,
							},
						});

						return expect(release.images[0]).to.not.have.property('build_log');
					});
			});

			it('should get the release with associated images attached by commit', function () {
				return balena.models.release
					.getWithImageDetails(ctx.currentRelease.commit)
					.then(function (release) {
						expect(release).to.deep.match({
							commit: 'new-release-commit',
							status: 'success',
							source: 'cloud',
							images: [{ service_name: 'db' }, { service_name: 'web' }],
							user: {
								username: credentials.username,
							},
						});

						return expect(release.images[0]).to.not.have.property('build_log');
					});
			});

			it('should get the release with associated images attached by shorter commit', function () {
				return balena.models.release
					.getWithImageDetails(ctx.currentRelease.commit.slice(0, 7))
					.then(function (release) {
						expect(release).to.deep.match({
							commit: 'new-release-commit',
							status: 'success',
							source: 'cloud',
							images: [{ service_name: 'db' }, { service_name: 'web' }],
							user: {
								username: credentials.username,
							},
						});

						return expect(release.images[0]).to.not.have.property('build_log');
					});
			});

			it('should allow extra options to also get the build log', function () {
				return balena.models.release
					.getWithImageDetails(ctx.currentRelease.id, {
						image: { $select: 'build_log' },
					})
					.then((release) =>
						expect(release).to.deep.match({
							images: [
								{
									service_name: 'db',
									build_log: 'db log',
								},
								{
									service_name: 'web',
									build_log: 'web log',
								},
							],
						}),
					);
			});
		});

		describe('balena.models.release.note()', function () {
			releaseRetrievalFields.forEach((field) => {
				it(`should set a note using the release ${field}`, async function () {
					const release = ctx.currentRelease;
					const note = `This is a note set using field: ${field}`;
					await balena.models.release.note(release[field], note);
					const updatedRelease = await balena.models.release.get(release.id, {
						$select: ['id', 'note'],
					});
					expect(updatedRelease).to.deep.match({
						id: release.id,
						note: note,
					});
				});
			});
		});

		describe('balena.models.release.setKnownIssueList()', function () {
			releaseRetrievalFields.forEach((field) => {
				it(`should set the known issue list using the release ${field}`, async function () {
					const release = ctx.currentRelease;
					const knownIssueList = `This is a note set using field: ${field}`;
					await balena.models.release.setKnownIssueList(
						release[field],
						knownIssueList,
					);
					const updatedRelease = await balena.models.release.get(release.id, {
						$select: ['id', 'known_issue_list'],
					});
					expect(updatedRelease).to.deep.match({
						id: release.id,
						known_issue_list: knownIssueList,
					});
				});
			});
		});

		describe('balena.models.release.tags', function () {
			const appTagTestOptions = {
				// prettier-ignore
				model:
					/** @type {import('./tags').TagModelBase<import('../../../').ReleaseTag>} */ (balena.models.release.tags),
				modelNamespace: 'balena.models.release.tags',
				resourceName: 'application',
				uniquePropertyNames: applicationRetrievalFields,
			};

			const releaseTagTestOptions = {
				// prettier-ignore
				model:
					/** @type {import('./tags').TagModelBase<import('../../../').ReleaseTag>} */ (balena .models.release.tags),
				modelNamespace: 'balena.models.release.tags',
				resourceName: 'release',
				uniquePropertyNames: ['id', 'commit'],
			};

			before(function () {
				appTagTestOptions.resourceProvider = () => this.application;
				releaseTagTestOptions.resourceProvider = () => this.currentRelease;
				// used for tag creation during the
				// release.tags.getAllByApplication() test
				appTagTestOptions.setTagResourceProvider = () => this.currentRelease;
			});

			itShouldSetGetAndRemoveTags(releaseTagTestOptions);

			describe('balena.models.release.tags.getAllByApplication()', function () {
				itShouldGetAllTagsByResource(appTagTestOptions);
			});

			describe('balena.models.release.tags.getAllByRelease()', function () {
				itShouldGetAllTagsByResource(releaseTagTestOptions);
			});
		});

		describe('given extra successful & failed releases', function () {
			describe('balena.models.release.getLatestByApplication()', function () {
				before(async function () {
					ctx = this;
					const userId = await balena.auth.getUserId();

					for (const body of [
						{
							belongs_to__application: this.application.id,
							is_created_by__user: userId,
							commit: 'errored-then-fixed-release-commit',
							status: 'error',
							source: 'cloud',
							composition: {},
							start_timestamp: 64321,
						},
						{
							belongs_to__application: this.application.id,
							is_created_by__user: userId,
							commit: 'errored-then-fixed-release-commit',
							status: 'success',
							source: 'cloud',
							composition: {},
							start_timestamp: 74321,
						},
						{
							belongs_to__application: this.application.id,
							is_created_by__user: userId,
							commit: 'failed-release-commit',
							status: 'failed',
							source: 'cloud',
							composition: {},
							start_timestamp: 84321,
						},
					]) {
						await balena.pine.post({
							resource: 'release',
							body,
						});
					}
				});

				parallel('', function () {
					applicationRetrievalFields.forEach((prop) =>
						it(`should get the latest release by application ${prop}`, function () {
							return balena.models.release
								.getLatestByApplication(ctx.application[prop])
								.then((release) => {
									return expect(release).to.deep.match({
										status: 'success',
										source: 'cloud',
										commit: 'errored-then-fixed-release-commit',
										belongs_to__application: { __id: ctx.application.id },
									});
								});
						}),
					);
				});
			});
		});

		describe('given two releases that share the same commit root', function () {
			before(function () {
				const { application } = this;
				return balena.auth.getUserId().then((userId) =>
					balena.pine
						.post({
							resource: 'release',
							body: {
								belongs_to__application: application.id,
								is_created_by__user: userId,
								commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
								status: 'success',
								source: 'cloud',
								composition: {},
								start_timestamp: 64321,
							},
						})
						.then(() =>
							balena.pine.post({
								resource: 'release',
								body: {
									belongs_to__application: application.id,
									is_created_by__user: userId,
									commit: 'feb236123bf740d48900c19027d4a02127d4a021',
									status: 'success',
									source: 'cloud',
									composition: {},
									start_timestamp: 74321,
								},
							}),
						),
				);
			});

			parallel('balena.models.release.get()', function () {
				it('should be rejected with an error if there is an ambiguation between shorter commits', function () {
					const promise = balena.models.release.get('feb23612');
					return expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousRelease',
					);
				});

				it('should get the requested release by the full commit', () =>
					balena.models.release
						.get('feb2361230dc40dba6dca9a18f2c19dc8f2c19dc')
						.then((release) =>
							expect(release).to.deep.match({
								commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
								status: 'success',
								source: 'cloud',
							}),
						));
			});

			parallel('balena.models.release.getWithImageDetails()', function () {
				it('should be rejected with an error if there is an ambiguation between shorter commits', function () {
					const promise = balena.models.release.getWithImageDetails('feb23612');
					return expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousRelease',
					);
				});

				it('should get the release with associated images attached by the full commit', function () {
					return balena.models.release
						.getWithImageDetails('feb2361230dc40dba6dca9a18f2c19dc8f2c19dc')
						.then((release) =>
							expect(release).to.deep.match({
								commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
								status: 'success',
								source: 'cloud',
							}),
						);
				});
			});
		});
	});
});
