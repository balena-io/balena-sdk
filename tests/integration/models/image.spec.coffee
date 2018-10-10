m = require('mochainon')
_ = require('lodash')

{ balena, credentials, givenLoggedInUser, givenMulticontainerApplication } = require('../setup')

describe 'Image Model', ->

	givenLoggedInUser()

	describe 'given an application with no releases', ->

		beforeEach ->
			balena.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

		describe 'balena.models.image.get()', ->

			it 'should be rejected if the image id does not exist', ->
				promise = balena.models.image.get(123)
				m.chai.expect(promise).to.be.rejectedWith('Image not found: 123')

		describe 'balena.models.image.getLogs()', ->

			it 'should be rejected if the image id does not exist', ->
				promise = balena.models.image.getLogs(123)
				m.chai.expect(promise).to.be.rejectedWith('Image not found: 123')

	describe 'given a multicontainer application with two releases', ->

		givenMulticontainerApplication()

		describe 'balena.models.image.get()', ->

			it 'should get the requested image', ->
				balena.models.image.get(@newWebImage.id)
				.then (image) =>
					m.chai.expect(image).to.deep.match
						project_type: 'dockerfile'
						status: 'success'
						id: @newWebImage.id
					m.chai.expect(image.build_log).to.be.undefined

		describe 'balena.models.image.getLogs()', ->

			it 'should get the requested image logs', ->
				balena.models.image.getLogs(@newWebImage.id)
				.then (logs) ->
					m.chai.expect(logs).to.equal('new web log')
