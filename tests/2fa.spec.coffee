m = require('mochainon')
nock = require('nock')
Promise = require('bluebird')
token = require('resin-token')
tokens = require('./tokens.json')
johnDoeFixture = tokens.johndoe
twoFactorAuth = require('../lib/2fa.coffee')
settings = require('../lib/settings')

describe '2FA:', ->

	describe 'given a /whoami endpoint', ->

		beforeEach (done) ->
			settings.get('apiUrl').then (apiUrl) ->
				nock(apiUrl).get('/whoami').reply(200, johnDoeFixture.token)
				done()

		afterEach ->
			nock.cleanAll()

		describe '.isEnabled()', ->

			describe 'given a token with a twoFactorRequired property', ->

				beforeEach ->
					token.set(johnDoeFixture.tokenWith2FAPending)

				afterEach ->
					token.remove()

				it 'should eventually be true', ->
					promise = twoFactorAuth.isEnabled()
					m.chai.expect(promise).to.eventually.be.true

			describe 'given a token without a twoFactorRequired property', ->

				beforeEach ->
					token.set(johnDoeFixture.token)

				afterEach ->
					token.remove()

				it 'should eventually be false', ->
					promise = twoFactorAuth.isEnabled()
					m.chai.expect(promise).to.eventually.be.false

		describe '.isPassed()', ->

			describe 'given a token without a twoFactorRequired property', ->

				beforeEach ->
					token.set(johnDoeFixture.token)

				afterEach ->
					token.remove()

				it 'should eventually be true', ->
					promise = twoFactorAuth.isPassed()
					m.chai.expect(promise).to.eventually.be.true

			describe 'given a token with a truthy twoFactorRequired property', ->

				beforeEach ->
					token.set(johnDoeFixture.tokenWith2FAPending)

				afterEach ->
					token.remove()

				it 'should eventually be false', ->
					promise = twoFactorAuth.isPassed()
					m.chai.expect(promise).to.eventually.be.false

			describe 'given a token with a falsy twoFactorRequired property', ->

				beforeEach ->
					token.set(johnDoeFixture.tokenWith2FAPassed)

				afterEach ->
					token.remove()

				it 'should eventually be true', ->
					promise = twoFactorAuth.isPassed()
					m.chai.expect(promise).to.eventually.be.true

		describe '.challenge()', ->

			describe 'given a token with a pending 2FA challenge', ->

				beforeEach ->
					token.set(johnDoeFixture.tokenWith2FAPending)

				afterEach ->
					token.remove()

				describe 'given a challenge endpoint that passes if given the right code', ->

					beforeEach (done) ->
						settings.get('apiUrl').then (apiUrl) ->
							nock(apiUrl).post('/auth/totp/verify').reply (uri, body) ->
								if JSON.parse(body).code is '1234'
									return [ 200, johnDoeFixture.tokenWith2FAPassed ]
								return [ 400, 'Invalid token' ]
						.nodeify(done)

					afterEach ->
						nock.cleanAll()

					it 'should be rejected given an incorrect code', ->
						promise = twoFactorAuth.challenge('4321')
						m.chai.expect(promise).to.be.rejectedWith('Invalid token')

					it 'should have a pending challenge', ->
						promise = twoFactorAuth.isPassed()
						m.chai.expect(promise).to.eventually.be.false

					it 'should set the challenge as passed if given the correct code', ->
						promise = twoFactorAuth.challenge('1234')
							.then(twoFactorAuth.isPassed)

						m.chai.expect(promise).to.eventually.be.true
