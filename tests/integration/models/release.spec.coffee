m = require('mochainon')
_ = require('lodash')

{ balena, credentials, givenLoggedInUser, givenMulticontainerApplication } = require('../setup')

{
	itShouldGetAllTagsByResource
	itShouldGetAllTags
	itShouldSetTags
	itShouldRemoveTags
} = require('./tags')

describe 'Release Model', ->

	givenLoggedInUser()

	describe 'given an application with no releases', ->

		beforeEach ->
			balena.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

		describe 'balena.models.release.get()', ->

			it 'should be rejected if the release id does not exist', ->
				promise = balena.models.release.get(123)
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 123')

		describe 'balena.models.release.getWithImageDetails()', ->

			it 'should be rejected if the release id does not exist', ->
				promise = balena.models.release.getWithImageDetails(123)
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 123')

		describe 'balena.models.release.getAllByApplication()', ->

			it 'should eventually become an empty array given an application name', ->
				promise = balena.models.release.getAllByApplication(@application.app_name)
				m.chai.expect(promise).to.become([])

			it 'should eventually become an empty array given an application id', ->
				promise = balena.models.release.getAllByApplication(@application.id)
				m.chai.expect(promise).to.become([])

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.release.getAllByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.release.getAllByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

	describe 'given a multicontainer application with two releases', ->

		givenMulticontainerApplication()

		describe 'balena.models.release.get()', ->

			it 'should get the requested release', ->
				balena.models.release.get(@currentRelease.id)
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

			it 'should get the release with associated images attached', ->
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

		describe 'balena.models.release.tags', ->

			appTagTestOptions =
				model: balena.models.release.tags
				resourceName: 'application'
				uniquePropertyName: 'app_name'

			releaseTagTestOptions =
				model: balena.models.release.tags
				resourceName: 'release'
				uniquePropertyName: null

			beforeEach ->
				appTagTestOptions.resourceProvider = => @application
				releaseTagTestOptions.resourceProvider = => @currentRelease
				# used for tag creation during the
				# release.tags.getAllByApplication() test
				appTagTestOptions.setTagResourceProvider = => @currentRelease

			describe 'balena.models.release.tags.getAllByApplication()', ->
				itShouldGetAllTagsByResource(appTagTestOptions)

			describe 'balena.models.release.tags.getAllByRelease()', ->
				itShouldGetAllTagsByResource(releaseTagTestOptions)

			describe 'balena.models.release.tags.getAll()', ->
				itShouldGetAllTags(releaseTagTestOptions)

			describe 'balena.models.release.tags.set()', ->
				itShouldSetTags(releaseTagTestOptions)

			describe 'balena.models.release.tags.remove()', ->
				itShouldRemoveTags(releaseTagTestOptions)
