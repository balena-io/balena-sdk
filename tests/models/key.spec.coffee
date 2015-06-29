m = require('mochainon')
Promise = require('bluebird')
errors = require('resin-errors')
pine = require('resin-pine')
key = require('../../lib/models/key')

describe 'Key Model:', ->

	describe '.get()', ->

		describe 'given no keys', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should be rejected', ->
				promise = key.get(2)
				m.chai.expect(promise).to.be.rejectedWith(errors.ResinKeyNotFound)

		describe 'given a key', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns Promise.resolve [
					title: 'Main'
					key: 'ssh-rsa ...'
				]

			afterEach ->
				@pineGetStub.restore()

			it 'should eventually become the key', ->
				promise = key.get(2)
				m.chai.expect(promise).to.eventually.become
					title: 'Main'
					key: 'ssh-rsa ...'
