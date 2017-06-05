m = require('mochainon')

{ resin, givenLoggedInUser } = require('../setup')

describe 'Build Model', ->

	givenLoggedInUser()

	beforeEach ->
		resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
			@application = application

	describe 'resin.models.build.get()', ->

		it 'should be rejected if the build id does not exist', ->
			promise = resin.models.build.get(123)
			m.chai.expect(promise).to.be.rejectedWith('Build not found: 123')

	describe 'resin.models.build.getAllByApplication()', ->

		it 'should eventually become an empty array given an application name', ->
			promise = resin.models.build.getAllByApplication(@application.app_name)
			m.chai.expect(promise).to.become([])

		it 'should eventually become an empty array given an application id', ->
			promise = resin.models.build.getAllByApplication(@application.id)
			m.chai.expect(promise).to.become([])

		it 'should be rejected if the application name does not exist', ->
			promise = resin.models.build.getAllByApplication('HelloWorldApp')
			m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

		it 'should be rejected if the application id does not exist', ->
			promise = resin.models.build.getAllByApplication(999999)
			m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')
