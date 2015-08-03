m = require('mochainon')
Promise = require('bluebird')
pine = require('resin-pine')
errors = require('resin-errors')
application = require('../../lib/models/application')
environmentVariables = require('../../lib/models/environment-variables')

describe 'Environment Variables Model:', ->

	describe '.getAllByApplication()', ->

		describe 'given the application does not exist', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should be rejected with an error message', ->
				promise = environmentVariables.getAllByApplication('MyApp')
				m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

	describe '.create()', ->

		describe 'given the application does not exist', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should be rejected with an error message', ->
				promise = environmentVariables.create('MyApp', 'EDITOR', 'vim')
				m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

	describe '.isSystemVariable()', ->

		describe 'given a system variable', ->

			it 'should return true for RESIN_VAR', ->
				result = environmentVariables.isSystemVariable(name: 'RESIN_VAR')
				m.chai.expect(result).to.be.true

		describe 'given a non system variable', ->

			it 'should return false for EDITOR', ->
				result = environmentVariables.isSystemVariable(name: 'EDITOR')
				m.chai.expect(result).to.be.false
