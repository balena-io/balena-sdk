import { expect } from 'chai';
import parallel from 'mocha.parallel';
import * as _ from 'lodash';
import { delay, timeSuite } from '../../util';
import { getFieldLabel, getParam } from '../utils';

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

const uniquePropertyNames = [
	'id',
	'commit',
	{ belongs_to__application: 'application', raw_version: 'rawVersion' },
];

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
			it('should be rejected if the release id does not exist by id', async () => {
				const promise = balena.models.release.get(123);
				await expect(promise).to.be.rejectedWith('Release not found: 123');
			});

			it('should be rejected if the release id does not exist by commit', async () => {
				const promise = balena.models.release.get('7cf02a6');
				await expect(promise).to.be.rejectedWith('Release not found: 7cf02a6');
			});

			it('should be rejected if the release id does not exist by raw_version', async () => {
				const promise = balena.models.release.get({
					application: ctx.application.id,
					rawVersion: '10.0.0',
				});
				await expect(promise).to.be.rejectedWith(
					`Release not found: unique pair application & rawVersion: ${ctx.application.id} & 10.0.0`,
				);
			});
		});

		parallel('balena.models.release.getWithImageDetails()', function () {
			it('should be rejected if the release id does not exist by id', async () => {
				const promise = balena.models.release.getWithImageDetails(123);
				await expect(promise).to.be.rejectedWith('Release not found: 123');
			});

			it('should be rejected if the release id does not exist by commit', async () => {
				const promise = balena.models.release.getWithImageDetails('7cf02a6');
				await expect(promise).to.be.rejectedWith('Release not found: 7cf02a6');
			});

			it('should be rejected if the release id does not exist by raw_version', async () => {
				const promise = balena.models.release.getWithImageDetails({
					application: ctx.application.id,
					rawVersion: '10.0.0',
				});
				await expect(promise).to.be.rejectedWith(
					`Release not found: unique pair application & rawVersion: ${ctx.application.id} & 10.0.0`,
				);
			});
		});

		parallel('balena.models.release.getAllByApplication()', function () {
			applicationRetrievalFields.forEach((prop) =>
				it(`should eventually become an empty array given an application ${prop}`, async () => {
					const releases = await balena.models.release.getAllByApplication(
						ctx.application[prop],
					);
					expect(releases).to.have.lengthOf(0);
				}),
			);

			it('should be rejected if the application name does not exist', async () => {
				const promise =
					balena.models.release.getAllByApplication('HelloWorldApp');
				await expect(promise).to.be.rejectedWith(
					'Application not found: HelloWorldApp',
				);
			});

			it('should be rejected if the application id does not exist', async () => {
				const promise = balena.models.release.getAllByApplication(999999);
				await expect(promise).to.be.rejectedWith(
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

			const waitForImagesToBeCreated = async (appId, releaseCount) => {
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
			};

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

			parallel('[read operations]', function () {
				it('should be rejected if the application name does not exist', async () => {
					const promise = balena.models.release.createFromUrl('HelloWorldApp', {
						url: TEST_SOURCE_URL,
					});
					await expect(promise).to.be.rejectedWith(
						'Application not found: HelloWorldApp',
					);
				});

				it('should be rejected if the application id does not exist', async () => {
					const promise = balena.models.release.createFromUrl(999999, {
						url: TEST_SOURCE_URL,
					});
					await expect(promise).to.be.rejectedWith(
						'Application not found: 999999',
					);
				});

				it('should be rejected when the provided tarball url is not found', async () => {
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

				it('should be rejected when the provided url is not a tarball', async () => {
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
			});

			describe('[mutating operations]', function () {
				applicationRetrievalFields.forEach((prop) => {
					it(`should be able to create a release using a tarball url given an application ${prop}`, async () => {
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

		describe(`given ${uniquePropertyNames.length} draft releases`, function () {
			const testReleaseByField = {};

			before(async function () {
				const userId = await balena.auth.getUserId();
				await Promise.all(
					uniquePropertyNames.map(async (field, i) => {
						const fieldKey = getFieldLabel(field);
						const release = await balena.pine.post({
							resource: 'release',
							body: {
								belongs_to__application: this.application.id,
								is_created_by__user: userId,
								commit: `abcdef${i}`,
								semver: '1.1.1',
								status: 'success',
								source: 'cloud',
								is_final: false,
								composition: {},
								start_timestamp: new Date().toISOString(),
							},
						});
						testReleaseByField[fieldKey] = await balena.models.release.get(
							release.id,
							{
								$select: [
									'id',
									'commit',
									'raw_version',
									'belongs_to__application',
								],
							},
						);
					}),
				);
			});

			describe('balena.model.release.finalize()', function () {
				uniquePropertyNames
					.map((key) => [key, getFieldLabel(key)])
					.forEach(([field, fieldLabel], index) => {
						it(`should finalize a release by ${fieldLabel}`, async () => {
							const draftRelease = testReleaseByField[fieldLabel];
							const finalizeParam = getParam(field, draftRelease);
							await balena.models.release.finalize(finalizeParam);
							const freshRelease = await balena.models.release.get(
								draftRelease.id,
								{
									$select: [
										'id',
										'commit',
										'raw_version',
										'is_final',
										'belongs_to__application',
									],
								},
							);
							expect(freshRelease).to.deep.match({
								id: draftRelease.id,
								commit: draftRelease.commit,
								raw_version: draftRelease.raw_version.replace(
									/-(\d)+$/,
									index > 0 ? `+rev${index}` : '',
								),
								is_final: true,
							});
							// Only update the releases in the context if the tests pass
							// otherwise retries could conceal errors.
							testReleaseByField[fieldLabel] = freshRelease;
						});
					});
			});

			describe('balena.model.release.setIsInvalidated()', function () {
				uniquePropertyNames
					.map((key) => [key, getFieldLabel(key)])
					.forEach(([field, fieldLabel]) => {
						it(`should invalidate a release by ${fieldLabel}`, async () => {
							const release = testReleaseByField[fieldLabel];
							const invalidateParam = getParam(field, release);
							await balena.models.release.setIsInvalidated(
								invalidateParam,
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

						it(`should validate a release by ${fieldLabel}`, async () => {
							const release = testReleaseByField[fieldLabel];
							const validateParam = getParam(field, release);
							await balena.models.release.setIsInvalidated(
								validateParam,
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

	describe('given a multicontainer application with two releases', function () {
		givenMulticontainerApplication(before);

		let ctx = null;

		before(function () {
			ctx = this;
		});

		parallel('balena.models.release.get()', function () {
			it('should get the requested release by id', async () => {
				const release = await balena.models.release.get(ctx.currentRelease.id);
				await expect(release).to.deep.match({
					status: 'success',
					source: 'cloud',
					commit: 'new-release-commit',
					id: ctx.currentRelease.id,
					belongs_to__application: { __id: ctx.application.id },
				});
			});

			it('should get the requested release by commit', async () => {
				const release = await balena.models.release.get(
					ctx.currentRelease.commit,
				);
				await expect(release).to.deep.match({
					status: 'success',
					source: 'cloud',
					commit: 'new-release-commit',
					id: ctx.currentRelease.id,
					belongs_to__application: { __id: ctx.application.id },
				});
			});

			it('should get the requested release by shorter commit', async () => {
				const release = await balena.models.release.get(
					ctx.currentRelease.commit.slice(0, 7),
				);
				await expect(release).to.deep.match({
					status: 'success',
					source: 'cloud',
					commit: 'new-release-commit',
					id: ctx.currentRelease.id,
					belongs_to__application: { __id: ctx.application.id },
				});
			});

			it('should get the requested release by raw_version', async () => {
				const release = await balena.models.release.get({
					application: ctx.application.id,
					rawVersion: ctx.currentRelease.raw_version,
				});
				await expect(release).to.deep.match({
					status: 'success',
					source: 'cloud',
					commit: 'new-release-commit',
					id: ctx.currentRelease.id,
					belongs_to__application: { __id: ctx.application.id },
				});
			});
		});

		describe('balena.models.release.getAllByApplication()', () =>
			it('should load both releases', async function () {
				await balena.models.release
					.getAllByApplication(this.application.id)
					.then((releases) => {
						expect(releases).to.have.lengthOf(2);

						// Need to sort explicitly because releases were both created
						// at almost exactly the same time (just now, in test setup)
						const sortedReleases = _.sortBy(
							releases,
							(release) => release.start_timestamp,
						);
						expect(sortedReleases).to.deep.match([
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
			it('should get the release with associated images attached by id', async () => {
				const release = await balena.models.release.getWithImageDetails(
					ctx.currentRelease.id,
				);
				expect(release).to.deep.match({
					commit: 'new-release-commit',
					status: 'success',
					source: 'cloud',
					images: [{ service_name: 'db' }, { service_name: 'web' }],
					user: {
						username: credentials.username,
					},
				});

				await expect(release.images[0]).to.not.have.property('build_log');
			});

			it('should get the release with associated images attached by commit', async () => {
				const release = await balena.models.release.getWithImageDetails(
					ctx.currentRelease.commit,
				);
				expect(release).to.deep.match({
					commit: 'new-release-commit',
					status: 'success',
					source: 'cloud',
					images: [{ service_name: 'db' }, { service_name: 'web' }],
					user: {
						username: credentials.username,
					},
				});

				expect(release.images[0]).to.not.have.property('build_log');
			});

			it('should get the release with associated images attached by shorter commit', async () => {
				const release = await balena.models.release.getWithImageDetails(
					ctx.currentRelease.commit.slice(0, 7),
				);
				expect(release).to.deep.match({
					commit: 'new-release-commit',
					status: 'success',
					source: 'cloud',
					images: [{ service_name: 'db' }, { service_name: 'web' }],
					user: {
						username: credentials.username,
					},
				});
				expect(release.images[0]).to.not.have.property('build_log');
			});

			it('should get the release with associated images attached by raw_version', async () => {
				const release = await balena.models.release.getWithImageDetails({
					application: ctx.application.id,
					rawVersion: ctx.currentRelease.raw_version,
				});
				expect(release).to.deep.match({
					commit: 'new-release-commit',
					status: 'success',
					source: 'cloud',
					images: [{ service_name: 'db' }, { service_name: 'web' }],
					user: {
						username: credentials.username,
					},
				});
				expect(release.images[0]).to.not.have.property('build_log');
			});

			it('should allow extra options to also get the build log', async () => {
				const release = await balena.models.release.getWithImageDetails(
					ctx.currentRelease.id,
					{
						image: { $select: 'build_log' },
					},
				);
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
				});
			});
		});

		describe('balena.models.release.note()', function () {
			uniquePropertyNames.forEach((field) => {
				const fieldLabel = getFieldLabel(field);
				it(`should set a note using the release ${fieldLabel}`, async () => {
					const release = ctx.currentRelease;
					const noteParam = getParam(field, release);
					const note = `This is a note set using field: ${fieldLabel}`;
					await balena.models.release.note(noteParam, note);
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
			uniquePropertyNames.forEach((field) => {
				const fieldLabel = getFieldLabel(field);
				it(`should set the known issue list using the release ${fieldLabel}`, async () => {
					const release = ctx.currentRelease;
					const knownIssuesParam = getParam(field, release);
					const knownIssueList = `This is an issue set using field: ${fieldLabel}`;
					await balena.models.release.setKnownIssueList(
						knownIssuesParam,
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
				uniquePropertyNames,
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
						it(`should get the latest release by application ${prop}`, async () => {
							const release =
								await balena.models.release.getLatestByApplication(
									ctx.application[prop],
								);
							expect(release).to.deep.match({
								status: 'success',
								source: 'cloud',
								commit: 'errored-then-fixed-release-commit',
								belongs_to__application: { __id: ctx.application.id },
							});
						}),
					);
				});
			});
		});

		describe('given two releases that share the same commit root', function () {
			before(async function () {
				const { application } = this;
				const userId = await balena.auth.getUserId();
				await balena.pine.post({
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
				});
				await balena.pine.post({
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
				});
			});

			parallel('balena.models.release.get()', function () {
				it('should be rejected with an error if there is an ambiguation between shorter commits', async () => {
					const promise = balena.models.release.get('feb23612');
					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousRelease',
					);
				});

				it('should get the requested release by the full commit', async () => {
					const release = await balena.models.release.get(
						'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
					);
					expect(release).to.deep.match({
						commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
						status: 'success',
						source: 'cloud',
					});
				});
			});

			parallel('balena.models.release.getWithImageDetails()', function () {
				it('should be rejected with an error if there is an ambiguation between shorter commits', async () => {
					const promise = balena.models.release.getWithImageDetails('feb23612');
					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousRelease',
					);
				});

				it('should get the release with associated images attached by the full commit', async () => {
					const release = await balena.models.release.getWithImageDetails(
						'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
					);
					expect(release).to.deep.match({
						commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc',
						status: 'success',
						source: 'cloud',
					});
				});
			});
		});
	});
});
