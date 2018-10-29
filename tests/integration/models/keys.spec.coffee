_ = require('lodash')
m = require('mochainon')

{ balena, givenLoggedInUser } = require('../setup')

PUBLIC_KEY = require('../../data/public-key')

describe 'Key Model', ->

	givenLoggedInUser()

	describe 'given no keys', ->

		describe 'balena.models.key.getAll()', ->

			it 'should become an empty array', ->
				promise = balena.models.key.getAll()
				m.chai.expect(promise).to.become([])

			it 'should support arbitrary pinejs options', ->
				balena.models.key.create('MyKey', PUBLIC_KEY)
				.then ->
					balena.models.key.getAll { $select: [ 'public_key' ] }
				.then (keys) ->
					key = keys[0]
					m.chai.expect(key.public_key).to.equal(PUBLIC_KEY)
					m.chai.expect(key.title).to.be.undefined

			it 'should support a callback with no options', (done) ->
				balena.models.key.getAll (err, keys) ->
					m.chai.expect(keys).to.deep.equal([])
					done()
				return

		describe 'balena.models.key.create()', ->

			it 'should be able to create a key', ->
				key = PUBLIC_KEY
				balena.models.key.create('MyKey', key).then ->
					return balena.models.key.getAll()
				.then (keys) ->
					m.chai.expect(keys).to.have.length(1)
					m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
					m.chai.expect(keys[0].title).to.equal('MyKey')

			it 'should be able to create a key from a non trimmed string', ->
				key = PUBLIC_KEY
				balena.models.key.create('MyKey', "    #{key}    ").then ->
					return balena.models.key.getAll()
				.then (keys) ->
					m.chai.expect(keys).to.have.length(1)
					m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
					m.chai.expect(keys[0].title).to.equal('MyKey')

	describe 'given a single key', ->

		beforeEach ->
			publicKey = PUBLIC_KEY
			balena.models.key.create('MyKey', publicKey).then (key) =>
				@key = key

		describe 'balena.models.key.getAll()', ->

			it 'should become the list of keys', ->
				balena.models.key.getAll().then (keys) =>
					m.chai.expect(keys).to.have.length(1)
					m.chai.expect(keys[0].public_key).to.equal(@key.public_key.replace(/\n/g, ''))
					m.chai.expect(keys[0].title).to.equal('MyKey')

		describe 'balena.models.key.get()', ->

			it 'should be able to get a key', ->
				balena.models.key.get(@key.id).then (key) =>
					m.chai.expect(key.public_key).to.equal(@key.public_key.replace(/\n/g, ''))
					m.chai.expect(key.title).to.equal('MyKey')

			it 'should be rejected if the key id is invalid', ->
				promise = balena.models.key.get(99999999999)
				m.chai.expect(promise).to.be.rejectedWith('Request error')

		describe 'balena.models.key.remove()', ->

			it 'should be able to remove the key', ->
				balena.models.key.remove(@key.id).then ->
					promise = balena.models.key.getAll()
					m.chai.expect(promise).to.eventually.have.length(0)
