m = require('mochainon')

{ resin, givenLoggedInUser } = require('../setup')

describe 'Release Model', ->

	givenLoggedInUser()

	beforeEach ->
		resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
			@application = application

	describe 'given no releases', ->

		describe 'resin.models.release.get()', ->

			it 'should be rejected if the release id does not exist', ->
				promise = resin.models.release.get(123)
				m.chai.expect(promise).to.be.rejectedWith('Release not found: 123')

		describe 'resin.models.release.getAllByApplication()', ->

			it 'should eventually become an empty array given an application name', ->
				promise = resin.models.release.getAllByApplication(@application.app_name)
				m.chai.expect(promise).to.become([])

			it 'should eventually become an empty array given an application id', ->
				promise = resin.models.release.getAllByApplication(@application.id)
				m.chai.expect(promise).to.become([])

			it 'should be rejected if the application name does not exist', ->
				promise = resin.models.release.getAllByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = resin.models.release.getAllByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')
