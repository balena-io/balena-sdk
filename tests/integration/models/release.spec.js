import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import * as _ from 'lodash';

const { expect } = m.chai;

import {
	balena,
	credentials,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
	IS_BROWSER,
} from '../setup';

import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';

describe('Release Model', function () {
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
				return m.chai
					.expect(promise)
					.to.be.rejectedWith('Release not found: 123');
			});

			it('should be rejected if the release id does not exist by commit', function () {
				const promise = balena.models.release.get('7cf02a6');
				return m.chai
					.expect(promise)
					.to.be.rejectedWith('Release not found: 7cf02a6');
			});
		});

		parallel('balena.models.release.getWithImageDetails()', function () {
			it('should be rejected if the release id does not exist by id', function () {
				const promise = balena.models.release.getWithImageDetails(123);
				return m.chai
					.expect(promise)
					.to.be.rejectedWith('Release not found: 123');
			});

			it('should be rejected if the release id does not exist by commit', function () {
				const promise = balena.models.release.getWithImageDetails('7cf02a6');
				return m.chai
					.expect(promise)
					.to.be.rejectedWith('Release not found: 7cf02a6');
			});
		});

		parallel('balena.models.release.getAllByApplication()', function () {
			['id', 'app_name', 'slug'].forEach((prop) =>
				it(`should eventually become an empty array given an application ${prop}`, function () {
					const promise = balena.models.release.getAllByApplication(
						ctx.application[prop],
					);
					return expect(promise).to.become([]);
				}),
			);

			it('should be rejected if the application name does not exist', function () {
				const promise = balena.models.release.getAllByApplication(
					'HelloWorldApp',
				);
				return m.chai
					.expect(promise)
					.to.be.rejectedWith('Application not found: HelloWorldApp');
			});

			it('should be rejected if the application id does not exist', function () {
				const promise = balena.models.release.getAllByApplication(999999);
				return m.chai
					.expect(promise)
					.to.be.rejectedWith('Application not found: 999999');
			});
		});

		describe('balena.models.release.createFromUrl()', function () {
			// There is a CORS header that only allows us to run this from dashboard.balena-cloud.com
			if (IS_BROWSER) {
				return;
			}

			const TEST_SOURCE_URL =
				'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz';

			after(function () {
				return balena.pine.delete({
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
				it('should be rejected if the application name does not exist', function () {
					const promise = balena.models.release.createFromUrl('HelloWorldApp', {
						url: TEST_SOURCE_URL,
					});
					return m.chai
						.expect(promise)
						.to.be.rejectedWith('Application not found: HelloWorldApp');
				});

				it('should be rejected if the application id does not exist', function () {
					const promise = balena.models.release.createFromUrl(999999, {
						url: TEST_SOURCE_URL,
					});
					return m.chai
						.expect(promise)
						.to.be.rejectedWith('Application not found: 999999');
				});

				it('should be rejected when the provided tarball url is not found', function () {
					const promise = balena.models.release.createFromUrl(
						ctx.application.id,
						{
							url:
								'https://github.com/balena-io-projects/simple-server-node/archive/v0.0.0.tar.gz',
						},
					);
					return expect(promise).to.be.rejected.then(function (error) {
						expect(error).to.have.property('code', 'BalenaRequestError');
						expect(error).to.have.property('statusCode', 404);
						return m.chai
							.expect(error)
							.to.have.property('message')
							.that.contains('Failed to fetch tarball from passed URL');
					});
				});

				it('should be rejected when the provided url is not a tarball', function () {
					const promise = balena.models.release.createFromUrl(
						ctx.application.id,
						{ url: 'https://github.com/balena-io-projects/simple-server-node' },
					);
					return expect(promise).to.be.rejected.then(function (error) {
						expect(error).to.have.property('code', 'BalenaError');
						return m.chai
							.expect(error)
							.to.have.property('message')
							.that.contains(
								'Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?',
							);
					});
				});

				// [mutating operations]
				['id', 'app_name', 'slug'].forEach((prop) => {
					it(`should be able to create a release using a tarball url given an application ${prop}`, function () {
						return balena.models.release
							.createFromUrl(ctx.application[prop], { url: TEST_SOURCE_URL })
							.then((releaseId) => {
								expect(releaseId).to.be.a('number');
								return balena.models.release.get(releaseId).then((release) => {
									expect(release).to.deep.match({
										status: 'running',
										source: 'cloud',
										id: releaseId,
										belongs_to__application: { __id: ctx.application.id },
									});
									return m.chai
										.expect(release)
										.to.have.property('commit')
										.that.is.a('string');
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

		describe('balena.models.release.tags', function () {
			const appTagTestOptions = {
				// prettier-ignore
				model:
					/** @type {import('./tags').TagModelBase<import('../../../').ReleaseTag>} */ (balena.models.release.tags),
				modelNamespace: 'balena.models.release.tags',
				resourceName: 'application',
				uniquePropertyNames: ['app_name', 'slug'],
			};

			const releaseTagTestOptions = {
				// prettier-ignore
				model:
					/** @type {import('./tags').TagModelBase<import('../../../').ReleaseTag>} */ (balena .models.release.tags),
				modelNamespace: 'balena.models.release.tags',
				resourceName: 'release',
				uniquePropertyNames: ['commit'],
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
					['id', 'app_name', 'slug'].forEach((prop) =>
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
					return m.chai
						.expect(promise)
						.to.be.rejected.and.eventually.have.property(
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
					return m.chai
						.expect(promise)
						.to.be.rejected.and.eventually.have.property(
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
