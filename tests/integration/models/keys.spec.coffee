_ = require('lodash')
m = require('mochainon')

{ resin, givenLoggedInUser } = require('../setup')

PUBLIC_KEY = require('../../data/public-key')

describe 'Key Model', ->

	givenLoggedInUser()

	describe 'given no keys', ->

		describe 'resin.models.key.getAll()', ->

			it 'should become an empty array', ->
				promise = resin.models.key.getAll()
				m.chai.expect(promise).to.become([])

			it 'should support arbitrary pinejs options', ->
				resin.models.key.create('MyKey', PUBLIC_KEY)
				.then ->
					resin.models.key.getAll { select: [ 'public_key' ] }
				.then (keys) ->
					key = keys[0]
					m.chai.expect(key.public_key).to.equal(PUBLIC_KEY)
					m.chai.expect(key.title).to.be.undefined

			it 'should support a callback with no options', (done) ->
				resin.models.key.getAll (err, keys) ->
					m.chai.expect(keys).to.deep.equal([])
					done()
				return

		describe 'resin.models.key.create()', ->

			it 'should be able to create a key', ->
				key = PUBLIC_KEY
				resin.models.key.create('MyKey', key).then ->
					return resin.models.key.getAll()
				.then (keys) ->
					m.chai.expect(keys).to.have.length(1)
					m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
					m.chai.expect(keys[0].title).to.equal('MyKey')

			it 'should be able to create a key from a non trimmed string', ->
				key = PUBLIC_KEY
				resin.models.key.create('MyKey', "    #{key}    ").then ->
					return resin.models.key.getAll()
				.then (keys) ->
					m.chai.expect(keys).to.have.length(1)
					m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
					m.chai.expect(keys[0].title).to.equal('MyKey')

	describe 'given a single key', ->

		beforeEach ->
			publicKey = PUBLIC_KEY
			resin.models.key.create('MyKey', publicKey).then (key) =>
				@key = key

		describe 'resin.models.key.getAll()', ->

			it 'should become the list of keys', ->
				resin.models.key.getAll().then (keys) =>
					m.chai.expect(keys).to.have.length(1)
					m.chai.expect(keys[0].public_key).to.equal(@key.public_key.replace(/\n/g, ''))
					m.chai.expect(keys[0].title).to.equal('MyKey')

		describe 'resin.models.key.get()', ->

			it 'should be able to get a key', ->
				resin.models.key.get(@key.id).then (key) =>
					m.chai.expect(key.public_key).to.equal(@key.public_key.replace(/\n/g, ''))
					m.chai.expect(key.title).to.equal('MyKey')

			it 'should be rejected if the key id is invalid', ->
				promise = resin.models.key.get(99999999999)
				m.chai.expect(promise).to.be.rejectedWith('Request error')

		describe 'resin.models.key.remove()', ->

			it 'should be able to remove the key', ->
				resin.models.key.remove(@key.id).then ->
					promise = resin.models.key.getAll()
					m.chai.expect(promise).to.eventually.have.length(0)
