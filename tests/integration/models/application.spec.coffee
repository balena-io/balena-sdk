_ = require('lodash')
Promise = require('bluebird')
m = require('mochainon')

{
	balena
	credentials
	givenADevice
	givenAnApplication
	givenLoggedInUser
	givenMulticontainerApplicationWithADevice
} = require('../setup')
{
	itShouldSetGetAndRemoveTags
	itShouldGetAllTagsByResource
} = require('./tags')

describe 'Application Model', ->

	givenLoggedInUser(before)

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

			describe '[read operations]', ->

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
						.that.contains('It is necessary that each application has an app name that has a Length (Type) that is greater than or equal to 4 and is less than or equal to 30')

				it 'should be rejected if the user does not have access to find the organization by name', ->
					promise = balena.models.application.create
						name: 'FooBar'
						deviceType: 'raspberry-pi'
						# add some extra invalid chart to the org name just to be sure
						organization: 'balena-test-non-existing-organization-name-!@#'
					m.chai.expect(promise).to.be.rejectedWith('Organization not found: balena-test-non-existing-organization-name-!@#')

				it 'should be rejected if the user does not have access to find the organization by id', ->
					promise = balena.models.application.create
						name: 'FooBar'
						deviceType: 'raspberry-pi'
						# This test will fail if org 1 adds the SDK's test user as a member...
						organization: 1
					m.chai.expect(promise).to.be.rejectedWith('Organization not found: 1')

			describe '[mutating operations]', ->

				afterEach ->
					balena.pine.delete
						resource: 'application'

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
						.then (childApplication) ->
							m.chai.expect(childApplication.depends_on__application).to.be.an('object')
							m.chai.expect(childApplication.depends_on__application).to.have.property('__id', parentApplication.id)
							# application.getAll() doesn't return dependent apps
							balena.pine.get
								resource: 'application'
								options:
									$filter: id: $in: [parentApplication.id, childApplication.id]
									$orderby: id: 'asc'
					.then ([ parentApplication, childApplication ]) ->
						m.chai.expect(childApplication.depends_on__application).to.be.an('object')
						m.chai.expect(childApplication.depends_on__application).to.have.property('__id', parentApplication.id)

				it 'should be able to create an application using a device type alias', ->
					balena.models.application.create
						name: 'FooBar'
						applicationType: 'microservices-starter'
						deviceType: 'raspberrypi'
					.then ->
						promise = balena.models.application.getAll()
						m.chai.expect(promise).to.eventually.have.length(1)

				it "should be able to create an application using the user's personal org id", ->
					balena.auth.getPersonalOrganizationId()
					.then (orgId) ->
						balena.models.application.create
							name: 'FooBar'
							deviceType: 'raspberrypi'
							organization: orgId
					.then ->
						Promise.all([
							balena.models.application.getAll()
							balena.auth.getPersonalOrganizationId()
						])
					.then ([apps, orgId]) ->
						m.chai.expect(apps).to.have.length(1)
						m.chai.expect(apps[0]).to.have.nested.property('organization.__id', orgId)

				it "should be able to create an application using the user's personal org name", ->
					balena.auth.whoami()
					.then (orgName) ->
						balena.models.application.create
							name: 'FooBar'
							deviceType: 'raspberrypi'
							organization: orgName
					.then ->
						Promise.all([
							balena.models.application.getAll()
							balena.auth.getPersonalOrganizationId()
						])
					.then ([apps, orgId]) ->
						m.chai.expect(apps).to.have.length(1)
						m.chai.expect(apps[0]).to.have.nested.property('organization.__id', orgId)

	describe 'given a single application', ->

		describe '[read operations]', ->

			givenAnApplication(before)

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
					balena.models.application.getAll($expand: 'organization')
					.then (applications) ->
						m.chai.expect(applications[0].organization[0].name).to.equal(credentials.username)

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
					balena.models.application.get(@application.id, $expand: 'organization')
					.then (application) ->
						m.chai.expect(application.organization[0].name).to.equal(credentials.username)

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

		describe '[mutating operations]', ->

			givenAnApplication(beforeEach)

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

		describe '[contained scenario]', ->

			givenAnApplication(before)

			describe 'balena.models.application.tags', ->

				tagTestOptions =
					model: balena.models.application.tags
					modelNamespace: 'balena.models.application.tags'
					resourceName: 'application'
					uniquePropertyName: 'app_name'

				beforeEach ->
					tagTestOptions.resourceProvider = => @application

				itShouldSetGetAndRemoveTags(tagTestOptions)

				describe 'balena.models.application.tags.getAllByApplication()', ->
					itShouldGetAllTagsByResource(tagTestOptions)

			describe 'balena.models.application.configVar', ->

				configVarModel = balena.models.application.configVar

				['id', 'app_name'].forEach (appParam) ->
					appParamUpper = appParam.toUpperCase()

					it "can create a variable by #{appParam}", ->
						promise = configVarModel.set(@application[appParam], "BALENA_EDITOR_#{appParamUpper}", 'vim')
						m.chai.expect(promise).to.not.be.rejected

					it "...can retrieve a created variable by #{appParam}", ->
						configVarModel.get(@application[appParam], "BALENA_EDITOR_#{appParamUpper}")
						.then (result) ->
							m.chai.expect(result).to.equal('vim')

					it "...can update and retrieve a variable by #{appParam}", ->
						configVarModel.set(@application[appParam], "BALENA_EDITOR_#{appParamUpper}", 'emacs')
						.then =>
							configVarModel.get(@application[appParam], "BALENA_EDITOR_#{appParamUpper}")
						.then (result) ->
							m.chai.expect(result).to.equal('emacs')

					it "...can delete and then fail to retrieve a variable by #{appParam}", ->
						configVarModel.remove(@application[appParam], "BALENA_EDITOR_#{appParamUpper}")
						.then =>
							configVarModel.get(@application[appParam], "BALENA_EDITOR_#{appParamUpper}")
						.then (result) ->
							m.chai.expect(result).to.equal(undefined)

					it "can create and then retrieve multiple variables by #{appParam}", ->
						Promise.all [
							configVarModel.set(@application[appParam], "BALENA_A_#{appParamUpper}", 'a')
							configVarModel.set(@application[appParam], "BALENA_B_#{appParamUpper}", 'b')
						]
						.then =>
							configVarModel.getAllByApplication(@application[appParam])
						.then (result) ->
							m.chai.expect(_.find(result, { name: "BALENA_A_#{appParamUpper}" })).to.be.an('object')
								.that.has.property('value', 'a')
							m.chai.expect(_.find(result, { name: "BALENA_B_#{appParamUpper}" })).to.be.an('object')
								.that.has.property('value', 'b')
						.then =>
							Promise.all [
								configVarModel.remove(@application[appParam], "BALENA_A_#{appParamUpper}")
								configVarModel.remove(@application[appParam], "BALENA_B_#{appParamUpper}")
							]

			describe 'balena.models.application.envVar', ->

				envVarModel = balena.models.application.envVar

				['id', 'app_name'].forEach (appParam) ->

					it "can create a variable by #{appParam}", ->
						promise = envVarModel.set(@application[appParam], "EDITOR_BY_#{appParam}", 'vim')
						m.chai.expect(promise).to.not.be.rejected

					it "...can retrieve a created variable by #{appParam}", ->
						envVarModel.get(@application[appParam], "EDITOR_BY_#{appParam}")
						.then (result) ->
							m.chai.expect(result).to.equal('vim')

					it "...can update and retrieve a variable by #{appParam}", ->
						envVarModel.set(@application[appParam], "EDITOR_BY_#{appParam}", 'emacs')
						.then =>
							envVarModel.get(@application[appParam], "EDITOR_BY_#{appParam}")
						.then (result) ->
							m.chai.expect(result).to.equal('emacs')

					it "...can delete and then fail to retrieve a variable by #{appParam}", ->
						envVarModel.remove(@application[appParam], "EDITOR_BY_#{appParam}")
						.then =>
							envVarModel.get(@application[appParam], "EDITOR_BY_#{appParam}")
						.then (result) ->
							m.chai.expect(result).to.equal(undefined)

					it "can create and then retrieve multiple variables by #{appParam}", ->
						Promise.all [
							envVarModel.set(@application[appParam], "A_BY_#{appParam}", 'a')
							envVarModel.set(@application[appParam], "B_BY_#{appParam}", 'b')
						]
						.then =>
							envVarModel.getAllByApplication(@application[appParam])
						.then (result) ->
							m.chai.expect(_.find(result, { name: "A_BY_#{appParam}" })).to.be.an('object')
								.that.has.property('value', 'a')
							m.chai.expect(_.find(result, { name: "B_BY_#{appParam}" })).to.be.an('object')
								.that.has.property('value', 'b')
						.then =>
							Promise.all [
								envVarModel.remove(@application[appParam], "A_BY_#{appParam}")
								envVarModel.remove(@application[appParam], "B_BY_#{appParam}")
							]

		describe 'with a registered device', ->

			givenAnApplication(beforeEach)

			givenADevice(beforeEach)

			describe 'balena.models.application.enableDeviceUrls()', ->

				it "should enable the device url for the application's devices", ->
					promise = balena.models.application.enableDeviceUrls(@application.id)
					.then =>
						balena.models.device.hasDeviceUrl(@device.uuid)

					m.chai.expect(promise).to.eventually.be.true

			describe 'balena.models.application.disableDeviceUrls()', ->

				it "should disable the device url for the application's devices", ->
					promise = balena.models.device.enableDeviceUrl(@device.uuid)
					.then =>
						balena.models.application.disableDeviceUrls(@application.id)
					.then =>
						balena.models.device.hasDeviceUrl(@device.uuid)

					m.chai.expect(promise).to.eventually.be.false

		describe 'given two releases', ->

			givenAnApplication(beforeEach)

			beforeEach ->
				balena.auth.getUserId()
				.then (userId) =>
					Promise.mapSeries [
							belongs_to__application: @application.id
							is_created_by__user: userId
							commit: 'old-release-commit'
							status: 'success'
							source: 'cloud'
							composition: {}
							start_timestamp: 1234
						,
							belongs_to__application: @application.id
							is_created_by__user: userId
							commit: 'new-release-commit'
							status: 'success'
							source: 'cloud'
							composition: {}
							start_timestamp: 54321
					], (body) ->
						balena.pine.post
							resource: 'release'
							body: body

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

	describe 'given a multicontainer application with a single offline device', ->

		givenMulticontainerApplicationWithADevice(before)

		itShouldBeAnApplicationWithDeviceServiceDetails = (application, expectCommit = false) ->
			# Commit is empty on newly created application, so ignoring it
			omittedFields = [
				'owns__device'
				'commit'
				'__metadata'
			]
			m.chai.expect(_.omit(application, omittedFields)).to.deep.equal(_.omit(@application, omittedFields))

			# Check commit value after release
			m.chai.expect(application.commit).to.equal('new-release-commit')

			deviceExpectation =
				device_name: @device.device_name
				uuid: @device.uuid
				is_on__commit: @currentRelease.commit
				current_services:
					web: [
						id: @newWebInstall.id
						service_id: @webService.id
						image_id: @newWebImage.id
						commit: 'new-release-commit'
						status: 'downloading'
						download_progress: 50
					,
						id: @oldWebInstall.id
						service_id: @webService.id
						image_id: @oldWebImage.id
						commit: 'old-release-commit'
						status: 'running'
						download_progress: 100
					]
					db: [
						id: @newDbInstall.id
						service_id: @dbService.id
						image_id: @newDbImage.id
						commit: 'new-release-commit'
						status: 'running'
						download_progress: 100
					]

			if !expectCommit
				_.forEach deviceExpectation.current_services, (currentServicesByName) ->
					currentServicesByName.forEach (currentServicesOfName) ->
						delete currentServicesOfName.commit

			m.chai.expect(application.owns__device).to.have.lengthOf(1)
			m.chai.expect(application.owns__device[0]).to.deep.match(deviceExpectation)

			# Should filter out deleted image installs
			m.chai.expect(application.owns__device[0].current_services.db).to.have.lengthOf(1)

			# Should have an empty list of gateway downloads
			m.chai.expect(application.owns__device[0].current_gateway_downloads).to.have.lengthOf(0)

		describe 'balena.models.application.getWithDeviceServiceDetails()', ->

			it 'should retrieve the application and it\'s devices along with service details', ->
				balena.models.application.getWithDeviceServiceDetails(@application.id)
				.then (applicationDetails) =>
					itShouldBeAnApplicationWithDeviceServiceDetails.call(this, applicationDetails, false)

		describe 'balena.models.application.getAllWithDeviceServiceDetails()', ->

			it 'should retrieve all applications and their devices, along with service details', ->
				balena.models.application.getAllWithDeviceServiceDetails(@application.id)
				.then (applications) =>
					m.chai.expect(applications).to.have.lengthOf(1)
					itShouldBeAnApplicationWithDeviceServiceDetails.call(this, applications[0], false)

		describe 'when expanding the release of the image installs', ->

			extraServiceDetailOptions =
				$expand:
					owns__device:
						$expand:
							image_install:
								$expand:
									is_provided_by__release:
										$select: ['id', 'commit']

			describe 'balena.models.application.getWithDeviceServiceDetails()', ->

				it 'should retrieve the application and it\'s devices along with service details including their commit', ->

					balena.models.application.getWithDeviceServiceDetails(@application.id, extraServiceDetailOptions)
					.then (applicationDetails) =>
						itShouldBeAnApplicationWithDeviceServiceDetails.call(this, applicationDetails, true)

			describe 'balena.models.application.getAllWithDeviceServiceDetails()', ->

				it 'should retrieve all applications and their devices, along with service details including their commit', ->
					balena.models.application.getAllWithDeviceServiceDetails(extraServiceDetailOptions)
					.then (applications) =>
						m.chai.expect(applications).to.have.lengthOf(1)
						itShouldBeAnApplicationWithDeviceServiceDetails.call(this, applications[0], true)
