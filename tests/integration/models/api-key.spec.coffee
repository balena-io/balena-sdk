_ = require('lodash')
m = require('mochainon')
Promise = require('bluebird')

{ resin, givenLoggedInUser } = require('../setup')

eventuallyExpectProperty = (promise, prop) ->
	m.chai.expect(promise).to.eventually.have.property(prop)

describe 'API Key model', ->

	givenLoggedInUser()

	describe 'resin.models.apiKey.create()', ->

		it 'should be able to create a new api key', ->
			resin.models.apiKey.create('apiKey')
			.then (key) ->
				m.chai.expect(key).to.be.a('string')

		it 'should be able to create a new api key with description', ->
			resin.models.apiKey.create('apiKey', 'apiKeyDescription')
			.then (key) ->
				m.chai.expect(key).to.be.a('string')
