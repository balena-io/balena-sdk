m = require('mochainon')
Promise = require('bluebird')
_ = require('lodash')

{
	balena
	credentials
	givenAnApplication
	givenLoggedInUser
	givenMulticontainerApplication
	IS_BROWSER
} = require('../setup')

{
	itShouldSetGetAndRemoveTags
	itShouldGetAllTagsByResource
} = require('./tags')

describe 'Release Model', ->

	givenLoggedInUser(before)

	describe 'given an application with no releases', ->

		givenAnApplication(before)

		describe 'balena.models.release.get()', ->

			it 'should be rejected if the release id does not exist by id', ->
				promise = balena.models.release.get(123)
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 123')

			it 'should be rejected if the release id does not exist by commit', ->
				promise = balena.models.release.get('7cf02a6')
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 7cf02a6')

		describe 'balena.models.release.getWithImageDetails()', ->

			it 'should be rejected if the release id does not exist by id', ->
				promise = balena.models.release.getWithImageDetails(123)
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 123')

			it 'should be rejected if the release id does not exist by commit', ->
				promise = balena.models.release.getWithImageDetails('7cf02a6')
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 7cf02a6')

		describe 'balena.models.release.getAllByApplication()', ->

			[
				'id'
				'app_name'
				'slug'
			].forEach (prop) ->

				it "should eventually become an empty array given an application #{prop}", ->
					promise = balena.models.release.getAllByApplication(@application[prop])
					m.chai.expect(promise).to.become([])

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.release.getAllByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.release.getAllByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'balena.models.release.createFromUrl()', ->
			# There is a CORS header that only allows us to run this from dashboard.balena-cloud.com
			return if IS_BROWSER

			TEST_SOURCE_URL = 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz'

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.release.createFromUrl('HelloWorldApp', { url: TEST_SOURCE_URL })
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.release.createFromUrl(999999, { url: TEST_SOURCE_URL })
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			it 'should be rejected when the provided tarball url is not found', ->
				promise = balena.models.release.createFromUrl(@application.id, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v0.0.0.tar.gz' })
				m.chai.expect(promise).to.be.rejected
				.then (error) ->
					m.chai.expect(error).to.have.property('code', 'BalenaRequestError')
					m.chai.expect(error).to.have.property('statusCode', 404)
					m.chai.expect(error).to.have.property('message').that.contains('Failed to fetch tarball from passed URL')

			it 'should be rejected when the provided url is not a tarball', ->
				promise = balena.models.release.createFromUrl(@application.id, { url: 'https://github.com/balena-io-projects/simple-server-node' })
				m.chai.expect(promise).to.be.rejected
				.then (error) ->
					m.chai.expect(error).to.have.property('code', 'BalenaError')
					m.chai.expect(error).to.have.property('message').that.contains('Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?')

			describe '[mutating operations]', ->

				afterEach ->
					balena.pine.delete
						resource: 'release'
						options:
							$filter:
								belongs_to__application: @application.id

				[
					'id'
					'app_name'
					'slug'
				].forEach (prop) ->

					it "should be able to create a release using a tarball url given an application #{prop}", ->
						balena.models.release.createFromUrl(@application[prop], { url: TEST_SOURCE_URL })
						.then (releaseId) =>
							m.chai.expect(releaseId).to.be.a('number')
							balena.models.release.get(releaseId)
							.then (release) =>
								m.chai.expect(release).to.deep.match
									status: 'running',
									source: 'cloud',
									id: releaseId
									belongs_to__application: __id: @application.id
								m.chai.expect(release).to.have.property('commit').that.is.a('string')

	describe 'given a multicontainer application with two releases', ->

		givenMulticontainerApplication(before)

		describe 'balena.models.release.get()', ->

			it 'should get the requested release by id', ->
				balena.models.release.get(@currentRelease.id)
				.then (release) =>
					m.chai.expect(release).to.deep.match
						status: 'success',
						source: 'cloud',
						commit: 'new-release-commit',
						id: @currentRelease.id
						belongs_to__application: __id: @application.id

			it 'should get the requested release by commit', ->
				balena.models.release.get(@currentRelease.commit)
				.then (release) =>
					m.chai.expect(release).to.deep.match
						status: 'success',
						source: 'cloud',
						commit: 'new-release-commit',
						id: @currentRelease.id
						belongs_to__application: __id: @application.id

			it 'should get the requested release by shorter commit', ->
				balena.models.release.get(@currentRelease.commit.slice(0, 7))
				.then (release) =>
					m.chai.expect(release).to.deep.match
						status: 'success',
						source: 'cloud',
						commit: 'new-release-commit',
						id: @currentRelease.id
						belongs_to__application: __id: @application.id

		describe 'balena.models.release.getAllByApplication()', ->

			it 'should load both releases', ->
				balena.models.release.getAllByApplication(@application.id)
				.then (releases) ->
					m.chai.expect(releases).to.have.lengthOf(2)

					# Need to sort explicitly because releases were both created
					# at almost exactly the same time (just now, in test setup)
					sortedReleases = _.sortBy releases, (release) ->
						release.start_timestamp
					m.chai.expect(sortedReleases).to.deep.match [
						status: 'success',
						source: 'cloud',
						commit: 'old-release-commit'
					,
						status: 'success',
						source: 'cloud',
						commit: 'new-release-commit'
					]

		describe 'balena.models.release.getWithImageDetails()', ->

			it 'should get the release with associated images attached by id', ->
				balena.models.release.getWithImageDetails(@currentRelease.id)
				.then (release) ->
					m.chai.expect(release).to.deep.match
						commit: 'new-release-commit'
						status: 'success'
						source: 'cloud'
						images: [
							{ service_name: 'db' }
							{ service_name: 'web' }
						]
						user:
							username: credentials.username

					m.chai.expect(release.images[0].build_log).to.be.undefined

			it 'should get the release with associated images attached by commit', ->
				balena.models.release.getWithImageDetails(@currentRelease.commit)
				.then (release) ->
					m.chai.expect(release).to.deep.match
						commit: 'new-release-commit'
						status: 'success'
						source: 'cloud'
						images: [
							{ service_name: 'db' }
							{ service_name: 'web' }
						]
						user:
							username: credentials.username

					m.chai.expect(release.images[0].build_log).to.be.undefined

			it 'should get the release with associated images attached by shorter commit', ->
				balena.models.release.getWithImageDetails(@currentRelease.commit.slice(0, 7))
				.then (release) ->
					m.chai.expect(release).to.deep.match
						commit: 'new-release-commit'
						status: 'success'
						source: 'cloud'
						images: [
							{ service_name: 'db' }
							{ service_name: 'web' }
						]
						user:
							username: credentials.username

					m.chai.expect(release.images[0].build_log).to.be.undefined

			it 'should allow extra options to also get the build log', ->
				balena.models.release.getWithImageDetails @currentRelease.id,
					image: $select: 'build_log'
				.then (release) ->
					m.chai.expect(release).to.deep.match
						images: [
							service_name: 'db'
							build_log: 'db log'
						,
							service_name: 'web'
							build_log: 'web log'
						]

	describe 'given an application with two releases that share the same commit root', ->

		givenAnApplication(before)

		before ->
			application = @application
			balena.auth.getUserId()
			.then (userId) ->
				balena.pine.post
					resource: 'release'
					body:
						belongs_to__application: application.id
						is_created_by__user: userId
						commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc'
						status: 'success'
						source: 'cloud'
						composition: {}
						start_timestamp: 64321
				.then ->
					balena.pine.post
						resource: 'release'
						body:
							belongs_to__application: application.id
							is_created_by__user: userId
							commit: 'feb236123bf740d48900c19027d4a02127d4a021'
							status: 'success'
							source: 'cloud'
							composition: {}
							start_timestamp: 74321

		describe 'balena.models.release.get()', ->

			it 'should be rejected with an error if there is an ambiguation between shorter commits', ->
				promise = balena.models.release.get('feb23612')
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaAmbiguousRelease')

			it 'should get the requested release by the full commit', ->
				balena.models.release.get('feb2361230dc40dba6dca9a18f2c19dc8f2c19dc')
				.then (release) ->
					m.chai.expect(release).to.deep.match
						commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc'
						status: 'success'
						source: 'cloud'

		describe 'balena.models.release.getWithImageDetails()', ->

			it 'should be rejected with an error if there is an ambiguation between shorter commits', ->
				promise = balena.models.release.getWithImageDetails('feb23612')
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaAmbiguousRelease')

			it 'should get the release with associated images attached by the full commit', ->
				balena.models.release.getWithImageDetails('feb2361230dc40dba6dca9a18f2c19dc8f2c19dc')
				.then (release) ->
					m.chai.expect(release).to.deep.match
						commit: 'feb2361230dc40dba6dca9a18f2c19dc8f2c19dc'
						status: 'success'
						source: 'cloud'

	describe 'given a multicontainer application with successful & failed releases', ->

		describe 'balena.models.release.getLatestByApplication()', ->

			givenMulticontainerApplication(before)

			before ->
				balena.auth.getUserId()
				.then (userId) =>
					Promise.mapSeries [
							belongs_to__application: @application.id
							is_created_by__user: userId
							commit: 'errored-then-fixed-release-commit'
							status: 'error'
							source: 'cloud'
							composition: {}
							start_timestamp: 64321
						,
							belongs_to__application: @application.id
							is_created_by__user: userId
							commit: 'errored-then-fixed-release-commit'
							status: 'success'
							source: 'cloud'
							composition: {}
							start_timestamp: 74321
						,
							belongs_to__application: @application.id
							is_created_by__user: userId
							commit: 'failed-release-commit'
							status: 'failed'
							source: 'cloud'
							composition: {}
							start_timestamp: 84321
					], (body) ->
						balena.pine.post
							resource: 'release'
							body: body

			[
				'id'
				'app_name'
				'slug'
			].forEach (prop) ->

				it "should get the latest release by application #{prop}", ->
					balena.models.release.getLatestByApplication(@application[prop])
					.then (release) =>
						m.chai.expect(release).to.deep.match
							status: 'success',
							source: 'cloud',
							commit: 'errored-then-fixed-release-commit',
							belongs_to__application: __id: @application.id

		describe 'balena.models.release.tags', ->

			givenMulticontainerApplication(before)

			appTagTestOptions =
				model: balena.models.release.tags
				modelNamespace: 'balena.models.release.tags'
				resourceName: 'application'
				uniquePropertyNames: ['app_name', 'slug']

			releaseTagTestOptions =
				model: balena.models.release.tags
				modelNamespace: 'balena.models.release.tags'
				resourceName: 'release'
				uniquePropertyNames: ['commit']

			beforeEach ->
				appTagTestOptions.resourceProvider = => @application
				releaseTagTestOptions.resourceProvider = => @currentRelease
				# used for tag creation during the
				# release.tags.getAllByApplication() test
				appTagTestOptions.setTagResourceProvider = => @currentRelease

			itShouldSetGetAndRemoveTags(releaseTagTestOptions)

			describe 'balena.models.release.tags.getAllByApplication()', ->
				itShouldGetAllTagsByResource(appTagTestOptions)

			describe 'balena.models.release.tags.getAllByRelease()', ->
				itShouldGetAllTagsByResource(releaseTagTestOptions)
