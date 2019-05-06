_ = require('lodash')
m = require('mochainon')
Promise = require('bluebird')

{ balena, givenLoggedInUser } = require('../setup')

eventuallyExpectProperty = (promise, prop) ->
	m.chai.expect(promise).to.eventually.have.property(prop)

describe 'API Key model', ->

	givenLoggedInUser(beforeEach)

	describe 'balena.models.apiKey.create()', ->

		it 'should be able to create a new api key', ->
			balena.models.apiKey.create('apiKey')
			.then (key) ->
				m.chai.expect(key).to.be.a('string')

		it 'should be able to create a new api key with description', ->
			balena.models.apiKey.create('apiKey', 'apiKeyDescription')
			.then (key) ->
				m.chai.expect(key).to.be.a('string')
				balena.models.apiKey.getAll()
			.then (apiKeys) ->
				m.chai.expect(apiKeys).to.be.an('array')
				m.chai.expect(apiKeys).to.have.lengthOf(1)
				m.chai.expect(apiKeys).to.deep.match [
					name: 'apiKey'
					description: 'apiKeyDescription'
				]

	describe 'balena.models.apiKey.getAll()', ->

		describe 'given no named api keys', ->

			it 'should retrieve an empty array', ->
				balena.models.apiKey.getAll()
				.then (apiKeys) ->
					m.chai.expect(apiKeys).to.be.an('array')
					m.chai.expect(apiKeys).to.have.lengthOf(0)

		describe 'given two named api keys', ->

			beforeEach ->
				Promise.all([
					balena.models.apiKey.create('apiKey1')
					balena.models.apiKey.create('apiKey2', 'apiKey2Description')
				])

			it 'should be able to retrieve all api keys created', ->
				balena.models.apiKey.getAll()
				.then (apiKeys) ->
					m.chai.expect(apiKeys).to.be.an('array')
					m.chai.expect(apiKeys).to.have.lengthOf(2)
					m.chai.expect(apiKeys).to.deep.match [
						{
							name: 'apiKey1'
							description: null
						}
						{
							name: 'apiKey2'
							description: 'apiKey2Description'
						}
					]
					_.forEach apiKeys, (apiKey) ->
						m.chai.expect(apiKey).to.have.property('id').that.is.a('number')
						m.chai.expect(apiKey).to.have.property('created_at').that.is.a('string')

	describe 'balena.models.apiKey.update()', ->

		describe 'given a named api key', ->

			beforeEach ->
				balena.models.apiKey.create('apiKeyToBeUpdated', 'apiKeyDescriptionToBeUpdated')
				.then ->
					balena.models.apiKey.getAll({ $filter: name: 'apiKeyToBeUpdated' })
				.then ([apiKey]) =>
					@apiKey = apiKey

			it 'should be able to update the name of an api key', ->
				balena.models.apiKey.update(@apiKey.id, { name: 'updatedApiKeyName' })
				.then =>
					balena.models.apiKey.getAll({ $filter: id: @apiKey.id })
				.then ([apiKey]) ->
					m.chai.expect(apiKey).to.deep.match
						name: 'updatedApiKeyName'
						description: 'apiKeyDescriptionToBeUpdated'

			it 'should be able to update the description of an api key to a non empty string', ->
				balena.models.apiKey.update(@apiKey.id, { description: 'updatedApiKeyDescription' })
				.then =>
					balena.models.apiKey.getAll({ $filter: id: @apiKey.id })
				.then ([apiKey]) ->
					m.chai.expect(apiKey).to.deep.match
						name: 'apiKeyToBeUpdated'
						description: 'updatedApiKeyDescription'

			it 'should be able to update the description of an api key to an empty string', ->
				balena.models.apiKey.update(@apiKey.id, { description: '' })
				.then =>
					balena.models.apiKey.getAll({ $filter: id: @apiKey.id })
				.then ([apiKey]) ->
					m.chai.expect(apiKey).to.deep.match
						name: 'apiKeyToBeUpdated'
						description: ''

			it 'should not be able to update the name of an api key to null', ->
				m.chai.expect(balena.models.apiKey.update(@apiKey.id, { name: null })).to.be.rejected

			it 'should not be able to update the name of an api key to an empty string', ->
				m.chai.expect(balena.models.apiKey.update(@apiKey.id, { name: '' })).to.be.rejected

			it 'should be able to update the description of an api key to null', ->
				balena.models.apiKey.update(@apiKey.id, { description: null })
				.then =>
					balena.models.apiKey.getAll({ $filter: id: @apiKey.id })
				.then ([apiKey]) ->
					m.chai.expect(apiKey).to.deep.match
						name: 'apiKeyToBeUpdated'
						description: null

			it 'should be able to update the name & description of an api key', ->
				balena.models.apiKey.update(@apiKey.id, { name: 'updatedApiKeyName', description: 'updatedApiKeyDescription' })
				.then =>
					balena.models.apiKey.getAll({ $filter: id: @apiKey.id })
				.then ([apiKey]) ->
					m.chai.expect(apiKey).to.deep.match
						name: 'updatedApiKeyName'
						description: 'updatedApiKeyDescription'

	describe 'balena.models.apiKey.revoke()', ->

		describe 'given a named api key', ->

			beforeEach ->
				balena.models.apiKey.create('apiKeyToBeRevoked')
				.then ->
					balena.models.apiKey.getAll({ $filter: name: 'apiKeyToBeRevoked' })
				.then ([apiKey]) =>
					@apiKey = apiKey

			it 'should be able to revoke an exising api key', ->
				m.chai.expect(balena.models.apiKey.revoke(@apiKey.id)).to.not.be.rejected
				.then ->
					balena.models.apiKey.getAll()
				.then (apiKeys) ->
					m.chai.expect(apiKeys).to.be.an('array')
					m.chai.expect(apiKeys).to.have.lengthOf(0)
