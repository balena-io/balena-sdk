m = require('mochainon')
_ = require('lodash')

{
	balena
	givenAnApplication
	givenLoggedInUser
	givenMulticontainerApplication
} = require('../setup')

describe 'Service Model', ->

	givenLoggedInUser(before)

	describe 'given an application with no services', ->

		givenAnApplication(before)

		describe 'balena.models.service.getAllByApplication()', ->

			it 'should eventually become an empty array given an application name', ->
				promise = balena.models.service.getAllByApplication(@application.app_name)
				m.chai.expect(promise).to.become([])

			it 'should eventually become an empty array given an application id', ->
				promise = balena.models.service.getAllByApplication(@application.id)
				m.chai.expect(promise).to.become([])

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.service.getAllByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.service.getAllByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

	describe 'given a multicontainer application with two services', ->

		givenMulticontainerApplication(before)

		describe 'balena.models.service.getAllByApplication()', ->

			it 'should load both services', ->
				balena.models.service.getAllByApplication(@application.id)
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

		describe 'balena.models.service.var', ->

			varModel = balena.models.service.var

			it 'can create a variable', ->
				promise = varModel.set(@webService.id, 'EDITOR', 'vim')
				m.chai.expect(promise).to.not.be.rejected

			it '...can retrieve a created variable', ->
				varModel.get(@webService.id, 'EDITOR')
				.then (result) ->
					m.chai.expect(result).to.equal('vim')

			it '...can update and retrieve a variable', ->
				varModel.set(@webService.id, 'EDITOR', 'emacs')
				.then =>
					varModel.get(@webService.id, 'EDITOR')
				.then (result) ->
					m.chai.expect(result).to.equal('emacs')

			it '...can delete and then fail to retrieve a variable', ->
				varModel.remove(@webService.id, 'EDITOR')
				.then =>
					varModel.get(@webService.id, 'EDITOR')
				.then (result) ->
					m.chai.expect(result).to.equal(undefined)

			it 'can create and then retrieve multiple variables', ->
				Promise.all [
					varModel.set(@webService.id, 'A', 'a')
					varModel.set(@webService.id, 'B', 'b')
				]
				.then =>
					varModel.getAllByService(@webService.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'A' })).to.be.an('object')
						.that.has.property('value', 'a')
					m.chai.expect(_.find(result, { name: 'B' })).to.be.an('object')
						.that.has.property('value', 'b')
				.then =>
					Promise.all [
						varModel.remove(@webService.id, 'A')
						varModel.remove(@webService.id, 'B')
					]

			it 'can create and then retrieve multiple variables by application', ->
				Promise.all [
					varModel.set(@webService.id, 'A_BY_APPLICATION', 'a')
					varModel.set(@webService.id, 'B_BY_APPLICATION', 'b')
				]
				.then =>
					varModel.getAllByApplication(@application.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'A_BY_APPLICATION' })).to.be.an('object')
						.that.has.property('value', 'a')
					m.chai.expect(_.find(result, { name: 'B_BY_APPLICATION' })).to.be.an('object')
						.that.has.property('value', 'b')
				.then =>
					Promise.all [
						varModel.remove(@webService.id, 'A_BY_APPLICATION')
						varModel.remove(@webService.id, 'B_BY_APPLICATION')
					]

