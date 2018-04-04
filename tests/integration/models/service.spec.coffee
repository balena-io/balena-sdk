m = require('mochainon')
_ = require('lodash')

{ resin, credentials, givenLoggedInUser, givenMulticontainerApplication } = require('../setup')

describe 'Service Model', ->

	givenLoggedInUser()

	describe 'given an application with no services', ->

		beforeEach ->
			resin.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

		describe 'resin.models.service.getAllByApplication()', ->

			it 'should eventually become an empty array given an application name', ->
				promise = resin.models.service.getAllByApplication(@application.app_name)
				m.chai.expect(promise).to.become([])

			it 'should eventually become an empty array given an application id', ->
				promise = resin.models.service.getAllByApplication(@application.id)
				m.chai.expect(promise).to.become([])

			it 'should be rejected if the application name does not exist', ->
				promise = resin.models.service.getAllByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = resin.models.service.getAllByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

	describe 'given a multicontainer application with two services', ->

		givenMulticontainerApplication()

		describe 'resin.models.service.getAllByApplication()', ->

			it 'should load both services', ->
				resin.models.service.getAllByApplication(@application.id)
				.then (services) =>
					m.chai.expect(services).to.have.lengthOf(2)

					sortedServices = _.sortBy services, (service) ->
						service.service_name
					m.chai.expect(sortedServices).to.deep.match [
						service_name: 'db'
						application: __id: @application.id
					,
						service_name: 'web'
						application: __id: @application.id
					]
