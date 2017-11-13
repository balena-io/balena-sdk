m = require('mochainon')
_ = require('lodash')

{ resin, credentials, givenLoggedInUser, givenMulticontainerApplication } = require('../setup')

describe 'Image Model', ->

	givenLoggedInUser()

	describe 'given an application with no releases', ->

		beforeEach ->
			resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
				@application = application

		describe 'resin.models.image.get()', ->

			it 'should be rejected if the image id does not exist', ->
				promise = resin.models.image.get(123)
				m.chai.expect(promise).to.be.rejectedWith('Image not found: 123')

		describe 'resin.models.image.getLogs()', ->

			it 'should be rejected if the image id does not exist', ->
				promise = resin.models.image.getLogs(123)
				m.chai.expect(promise).to.be.rejectedWith('Image not found: 123')

	describe 'given a multicontainer application with two releases', ->

		givenMulticontainerApplication()

		describe 'resin.models.image.get()', ->

			it 'should get the requested image', ->
				resin.models.image.get(@newWebImage.id)
				.then (image) =>
					m.chai.expect(image).to.deep.match
						project_type: 'dockerfile'
						status: 'success'
						id: @newWebImage.id
					m.chai.expect(image.build_log).to.be.undefined

		describe 'resin.models.image.getLogs()', ->

			it 'should get the requested image logs', ->
				resin.models.image.getLogs(@newWebImage.id)
				.then (logs) ->
					m.chai.expect(logs).to.equal('new web log')
