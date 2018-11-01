_ = require('lodash')
m = require('mochainon')

{ balena, givenLoggedInUser, credentials } = require('../setup')
{
	itShouldGetAllTagsByResource
	itShouldGetAllTags
	itShouldSetTags
	itShouldRemoveTags
} = require('./tags')

describe 'Application Model', ->

	givenLoggedInUser()

	describe 'given no applications', ->

		describe 'balena.models.application.getAll()', ->

			it 'should eventually become an empty array', ->
				promise = balena.models.application.getAll()
				m.chai.expect(promise).to.become([])

		describe 'balena.models.application.getAppByOwner()', ->

			it 'should eventually reject', ->
				promise = balena.models.application.getAppByOwner('testapp', 'FooBar')
				m.chai.expect(promise).to.be.rejected

		describe 'balena.models.application.hasAny()', ->

			it 'should eventually be false', ->
				promise = balena.models.application.hasAny()
				m.chai.expect(promise).to.eventually.be.false

		describe 'balena.models.application.create()', ->

			it 'should be able to create an application w/o providing an application type', ->
				balena.models.application.create
					name: 'FooBar'
					deviceType: 'raspberry-pi'
				.then ->
					promise = balena.models.application.getAll()
					m.chai.expect(promise).to.eventually.have.length(1)

			it 'should be able to create an application with a specific application type', ->
				balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi'
				.then ->
					promise = balena.models.application.getAll()
					m.chai.expect(promise).to.eventually.have.length(1)

			it 'should be able to create a child application', ->
				balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi'
				.then (parentApplication) ->
					balena.models.application.create
						name: 'FooBarChild'
						deviceType: 'generic'
						parent: parentApplication.id
				.then ->
					# application.getAll() doesn't return dependent apps
					balena.pine.get(resource: 'application')
				.then ([ parentApplication, childApplication ]) ->
					m.chai.expect(childApplication.depends_on__application.__id).to.equal(parentApplication.id)

			it 'should be rejected if the application type is invalid', ->
				promise = balena.models.application.create
					name: 'FooBar'
					applicationType: 'non-existing'
					deviceType: 'raspberry-pi'
				m.chai.expect(promise).to.be.rejectedWith('Invalid application type: non-existing')

			it 'should be rejected if the device type is invalid', ->
				promise = balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'foobarbaz'
				m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobarbaz')

			it 'should be rejected if the device type is discontinued', ->
				promise = balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'edge'
				m.chai.expect(promise).to.be.rejectedWith('Discontinued device type: edge')

			it 'should be rejected if the name has less than four characters', ->
				promise = balena.models.application.create
					name: 'Foo'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi'
				m.chai.expect(promise).to.be.rejected
				.then (error) ->
					m.chai.expect(error).to.have.property('code', 'BalenaRequestError')
					m.chai.expect(error).to.have.property('statusCode', 400)
					m.chai.expect(error).to.have.property('message')
					.that.contains('It is necessary that each application has an app name that has a Length (Type) that is greater than or equal to 4')

			it 'should be able to create an application using a device type alias', ->
				balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberrypi'
				.then ->
					promise = balena.models.application.getAll()
					m.chai.expect(promise).to.eventually.have.length(1)

	describe 'given a single application', ->

		beforeEach ->
			balena.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

		describe 'balena.models.application.hasAny()', ->

			it 'should eventually be true', ->
				promise = balena.models.application.hasAny()
				m.chai.expect(promise).to.eventually.be.true

		describe 'balena.models.application.create()', ->

			it 'should reject if trying to create an app with the same name', ->
				promise = balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'beaglebone-black'
				m.chai.expect(promise).to.be.rejectedWith('Application name must be unique')

		describe 'balena.models.application.hasAny()', ->

			it 'should eventually be true', ->
				promise = balena.models.application.hasAny()
				m.chai.expect(promise).to.eventually.be.true

		describe 'balena.models.application.getAppByOwner()', ->

			it 'should find the created application', ->
				balena.models.application.getAppByOwner('FooBar', credentials.username).then (application) =>
					m.chai.expect(application.id).to.equal(@application.id)

			it 'should not find the created application with a different username', ->
				promise = balena.models.application.getAppByOwner('FooBar', 'test_username')
				m.chai.expect(promise).to.eventually.be.rejectedWith('Application not found: test_username/foobar')

		describe 'balena.models.application.getAll()', ->

			it 'should return an array with length 1', ->
				promise = balena.models.application.getAll()
				m.chai.expect(promise).to.eventually.have.length(1)

			it 'should eventually become an array containing the application', ->
				balena.models.application.getAll().then (applications) =>
					m.chai.expect(applications[0].id).to.equal(@application.id)

			it 'should support arbitrary pinejs options', ->
				balena.models.application.getAll($expand: 'user')
				.then (applications) ->
					m.chai.expect(applications[0].user[0].username).to.equal(credentials.username)

		describe 'balena.models.application.get()', ->

			it 'should be able to get an application by name', ->
				promise = balena.models.application.get(@application.app_name)
				m.chai.expect(promise).to.become(@application)

			it 'should be able to get an application by id', ->
				promise = balena.models.application.get(@application.id)
				m.chai.expect(promise).to.become(@application)

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.application.get('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.application.get(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			it 'should support arbitrary pinejs options', ->
				balena.models.application.get(@application.id, $expand: 'user')
				.then (application) ->
					m.chai.expect(application.user[0].username).to.equal(credentials.username)

		describe 'balena.models.application.has()', ->

			it 'should eventually be true if the application name exists', ->
				promise = balena.models.application.has(@application.app_name)
				m.chai.expect(promise).to.eventually.be.true

			it 'should eventually be true if the application id exists', ->
				promise = balena.models.application.has(@application.id)
				m.chai.expect(promise).to.eventually.be.true

			it 'should return false if the application id is undefined', ->
				promise = balena.models.application.has(undefined)
				m.chai.expect(promise).to.eventually.be.false

			it 'should eventually be false if the application name does not exist', ->
				promise = balena.models.application.has('HelloWorldApp')
				m.chai.expect(promise).to.eventually.be.false

			it 'should eventually be false if the application id does not exist', ->
				promise = balena.models.application.has(999999)
				m.chai.expect(promise).to.eventually.be.false

		describe 'balena.models.application.remove()', ->

			it 'should be able to remove an existing application by name', ->
				balena.models.application.remove(@application.app_name).then ->
					promise = balena.models.application.getAll()
					m.chai.expect(promise).to.eventually.have.length(0)

			it 'should be able to remove an existing application by id', ->
				balena.models.application.remove(@application.id).then ->
					promise = balena.models.application.getAll()
					m.chai.expect(promise).to.eventually.have.length(0)

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.application.remove('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.application.remove(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'balena.models.application.generateApiKey()', ->

			it 'should be able to generate an API key by name', ->
				balena.models.application.generateApiKey(@application.app_name).then (apiKey) ->
					m.chai.expect(_.isString(apiKey)).to.be.true
					m.chai.expect(apiKey).to.have.length(32)

			it 'should be able to generate an API key by id', ->
				balena.models.application.generateApiKey(@application.id).then (apiKey) ->
					m.chai.expect(_.isString(apiKey)).to.be.true
					m.chai.expect(apiKey).to.have.length(32)

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.application.generateApiKey('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.application.generateApiKey(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'balena.models.application.generateProvisioningKey()', ->

			it 'should be able to generate a provisioning key by name', ->
				balena.models.application.generateProvisioningKey(@application.app_name).then (key) ->
					m.chai.expect(_.isString(key)).to.be.true
					m.chai.expect(key).to.have.length(32)

			it 'should be able to generate an API key by id', ->
				balena.models.application.generateProvisioningKey(@application.id).then (key) ->
					m.chai.expect(_.isString(key)).to.be.true
					m.chai.expect(key).to.have.length(32)

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.application.generateProvisioningKey('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.application.generateProvisioningKey(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'balena.models.application.tags', ->

			tagTestOptions =
				model: balena.models.application.tags
				resourceName: 'application'
				uniquePropertyName: 'app_name'

			beforeEach ->
				tagTestOptions.resourceProvider = => @application

			describe 'balena.models.application.tags.getAllByApplication()', ->
				itShouldGetAllTagsByResource(tagTestOptions)

			describe 'balena.models.application.tags.getAll()', ->
				itShouldGetAllTags(tagTestOptions)

			describe 'balena.models.application.tags.set()', ->
				itShouldSetTags(tagTestOptions)

			describe 'balena.models.application.tags.remove()', ->
				itShouldRemoveTags(tagTestOptions)

		describe 'balena.models.application.grantSupportAccess()', ->
			it 'should throw an error if the expiry time stamp is in the past', ->
				expiryTimestamp = Date.now() - 3600 * 1000

				m.chai.expect( => balena.models.application.grantSupportAccess(@application.id, expiryTimestamp))
				.to.throw()

			it 'should throw an error if the expiry time stamp is undefined', ->
				m.chai.expect( => balena.models.application.grantSupportAccess(@application.id))
				.to.throw()

			it 'should grant support access until the specified time', ->
				expiryTime = Date.now() + 3600 * 1000
				promise = balena.models.application.grantSupportAccess(@application.id, expiryTime)
				.then =>
					balena.models.application.get(@application.id)
				.then (app) ->
					Date.parse(app.is_accessible_by_support_until__date)

				m.chai.expect(promise).to.eventually.equal(expiryTime)

		describe 'balena.models.application.revokeSupportAccess()', ->
			it 'should revoke support access', ->
				expiryTime = Date.now() + 3600 * 1000
				promise = balena.models.application.grantSupportAccess(@application.id, expiryTime)
				.then =>
					balena.models.application.revokeSupportAccess(@application.id)
				.then =>
					balena.models.application.get(@application.id)
				.then (app) ->
					app.is_accessible_by_support_until__date

				m.chai.expect(promise).to.eventually.equal(null)

		describe 'balena.models.application.configVar', ->

			configVarModel = balena.models.application.configVar

			['id', 'app_name'].forEach (appParam) ->

				it "can create and retrieve a variable by #{appParam}", ->
					configVarModel.set(@application[appParam], 'BALENA_EDITOR', 'vim')
					.then =>
						configVarModel.get(@application[appParam], 'BALENA_EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "can create, update and retrieve a variable by #{appParam}", ->
					configVarModel.set(@application[appParam], 'BALENA_EDITOR', 'vim')
					.then =>
						configVarModel.set(@application[appParam], 'BALENA_EDITOR', 'emacs')
					.then =>
						configVarModel.get(@application[appParam], 'BALENA_EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "can create and then retrieve multiple variables by #{appParam}", ->
					Promise.all [
						configVarModel.set(@application[appParam], 'BALENA_A', 'a')
						configVarModel.set(@application[appParam], 'BALENA_B', 'b')
					]
					.then =>
						configVarModel.getAllByApplication(@application[appParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: 'BALENA_A' }).value).equal('a')
						m.chai.expect(_.find(result, { name: 'BALENA_B' }).value).equal('b')

				it "can create, delete and then fail to retrieve a variable by #{appParam}", ->
					configVarModel.set(@application[appParam], 'BALENA_EDITOR', 'vim')
					.then =>
						configVarModel.remove(@application[appParam], 'BALENA_EDITOR')
					.then =>
						configVarModel.get(@application[appParam], 'BALENA_EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

		describe 'balena.models.application.envVar', ->

			envVarModel = balena.models.application.envVar

			['id', 'app_name'].forEach (appParam) ->

				it "can create and retrieve a variable by #{appParam}", ->
					envVarModel.set(@application[appParam], 'EDITOR', 'vim')
					.then =>
						envVarModel.get(@application[appParam], 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "can create, update and retrieve a variable by #{appParam}", ->
					envVarModel.set(@application[appParam], 'EDITOR', 'vim')
					.then =>
						envVarModel.set(@application[appParam], 'EDITOR', 'emacs')
					.then =>
						envVarModel.get(@application[appParam], 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "can create and then retrieve multiple variables by #{appParam}", ->
					Promise.all [
						envVarModel.set(@application[appParam], 'A', 'a')
						envVarModel.set(@application[appParam], 'B', 'b')
					]
					.then =>
						envVarModel.getAllByApplication(@application[appParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: 'A' }).value).equal('a')
						m.chai.expect(_.find(result, { name: 'B' }).value).equal('b')

				it "can create, delete and then fail to retrieve a variable by #{appParam}", ->
					envVarModel.set(@application[appParam], 'EDITOR', 'vim')
					.then =>
						envVarModel.remove(@application[appParam], 'EDITOR')
					.then =>
						envVarModel.get(@application[appParam], 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

		describe 'with a registered device', ->

			beforeEach ->
				balena.models.device.register(@application.id, balena.models.device.generateUniqueKey())
				.then (deviceInfo) =>
					@deviceInfo = deviceInfo

			describe 'balena.models.application.enableDeviceUrls()', ->

				it "should enable the device url for the application's devices", ->
					promise = balena.models.application.enableDeviceUrls(@application.id)
					.then =>
						balena.models.device.hasDeviceUrl(@deviceInfo.uuid)

					m.chai.expect(promise).to.eventually.be.true

			describe 'balena.models.application.disableDeviceUrls()', ->

				it "should disable the device url for the application's devices", ->
					promise = balena.models.device.enableDeviceUrl(@deviceInfo.uuid)
					.then =>
						balena.models.application.disableDeviceUrls(@application.id)
					.then =>
						balena.models.device.hasDeviceUrl(@deviceInfo.uuid)

					m.chai.expect(promise).to.eventually.be.false

		describe 'given two releases', ->

			beforeEach ->
				userId = @application.user.__id

				balena.pine.post
					resource: 'release'
					body:
						belongs_to__application: @application.id
						is_created_by__user: userId
						commit: 'old-release-commit'
						status: 'success'
						source: 'cloud'
						composition: {}
						start_timestamp: 1234
				.then =>
					balena.pine.post
						resource: 'release'
						body:
							belongs_to__application: @application.id
							is_created_by__user: userId
							commit: 'new-release-commit'
							status: 'success'
							source: 'cloud'
							composition: {}
							start_timestamp: 54321

			describe 'balena.models.application.willTrackNewReleases()', ->

				it 'should be configured to track new releases by default', ->
					promise = balena.models.application.willTrackNewReleases(@application.id)
					m.chai.expect(promise).to.eventually.be.true

				it 'should be false when should_track_latest_release is false', ->
					balena.pine.patch
						resource: 'application'
						id: @application.id
						body: should_track_latest_release: false
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.false
					.then =>
						balena.pine.patch
							resource: 'application'
							id: @application.id
							body: should_track_latest_release: true
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.true

				it 'should be true regardless of the current commit', ->
					balena.pine.patch
						resource: 'application'
						id: @application.id
						body: commit: 'old-release-commit'
					.then =>
						promise = balena.models.application.willTrackNewReleases(@application.id)
						m.chai.expect(promise).to.eventually.be.true

			describe 'balena.models.application.isTrackingLatestRelease()', ->

				it 'should be tracking the latest release by default', ->
					promise = balena.models.application.isTrackingLatestRelease(@application.id)
					m.chai.expect(promise).to.eventually.be.true

				it 'should be false when should_track_latest_release is false', ->
					balena.pine.patch
						resource: 'application'
						id: @application.id
						body: should_track_latest_release: false
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.false
					.then =>
						balena.pine.patch
							resource: 'application'
							id: @application.id
							body: should_track_latest_release: true
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.true

				it 'should be false when the current commit is not of the latest release', ->
					balena.pine.patch
						resource: 'application'
						id: @application.id
						body: commit: 'old-release-commit'
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.false
					.then =>
						balena.pine.patch
							resource: 'application'
							id: @application.id
							body: commit: 'new-release-commit'
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.true

			describe 'balena.models.application.getTargetReleaseHash()', ->

				it 'should retrieve the commit hash of the current release', ->
					promise = balena.models.application.getTargetReleaseHash(@application.id)
					m.chai.expect(promise).to.eventually.equal('new-release-commit')

			describe 'balena.models.application.pinToRelease()', ->

				it 'should set the application to specific release & disable latest release tracking', ->
					balena.models.application.pinToRelease(@application.id, 'old-release-commit')
					.then =>
						promise = balena.models.application.getTargetReleaseHash(@application.id)
						m.chai.expect(promise).to.eventually.equal('old-release-commit')
					.then =>
						promise = balena.models.application.willTrackNewReleases(@application.id)
						m.chai.expect(promise).to.eventually.be.false
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.false

			describe 'balena.models.application.trackLatestRelease()', ->

				it 'should re-enable latest release tracking', ->
					balena.models.application.pinToRelease(@application.id, 'old-release-commit')
					.then =>
						promise = balena.models.application.getTargetReleaseHash(@application.id)
						m.chai.expect(promise).to.eventually.equal('old-release-commit')
					.then =>
						promise = balena.models.application.willTrackNewReleases(@application.id)
						m.chai.expect(promise).to.eventually.be.false
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.false
					.then =>
						balena.models.application.trackLatestRelease(@application.id)
					.then =>
						promise = balena.models.application.getTargetReleaseHash(@application.id)
						m.chai.expect(promise).to.eventually.equal('new-release-commit')
					.then =>
						promise = balena.models.application.willTrackNewReleases(@application.id)
						m.chai.expect(promise).to.eventually.be.true
					.then =>
						promise = balena.models.application.isTrackingLatestRelease(@application.id)
						m.chai.expect(promise).to.eventually.be.true
