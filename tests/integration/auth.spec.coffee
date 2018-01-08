_ = require('lodash')
m = require('mochainon')

{ resin, sdkOpts, credentials, givenLoggedInUser, givenLoggedInUserWithApiKey } = require('./setup')

describe 'SDK authentication', ->

	describe 'when not logged in', ->

		beforeEach ->
			resin.auth.logout()

		describe 'resin.auth.isLoggedIn()', ->

			it 'should eventually be false', ->
				promise = resin.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.false

		describe 'resin.auth.whoami()', ->

			it 'should eventually be undefined', ->
				promise = resin.auth.whoami()
				m.chai.expect(promise).to.eventually.be.undefined

		describe 'resin.auth.logout()', ->

			it 'should not be rejected', ->
				promise = resin.auth.logout()
				m.chai.expect(promise).to.not.be.rejected

		describe 'resin.auth.authenticate()', ->

			it 'should eventually be a valid api key given valid credentials', ->
				resin.auth.authenticate(credentials)
				.then(resin.auth.loginWithToken)
				.then ->
					return resin.request.send
						method: 'POST'
						url: '/api-key/user/full'
						baseUrl: sdkOpts.apiUrl
						body:
							name: 'apiKey'
 				.get('body')
				.tap(resin.auth.logout)
				.then(resin.auth.loginWithToken)
				.then(resin.auth.getToken)
				.then (key) ->
					m.chai.expect(key).to.be.a('string')

			it 'should not save the token given valid credentials', ->
				resin.auth.authenticate(credentials).then ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

			it 'should eventually be a valid token given valid credentials', ->
				resin.auth.authenticate(credentials)
				.then(resin.auth.loginWithToken)
				.then(resin.auth.getToken)
				.then (key) ->
					m.chai.expect(key).to.be.a('string')

			it 'should be rejected given invalid credentials', ->
				promise = resin.auth.authenticate
					email: credentials.username,
					password: 'NOT-THE-CORRECT-PASSWORD'

				m.chai.expect(promise).to.be.rejectedWith('Unauthorized')

		describe 'resin.auth.getEmail()', ->

			it 'should be rejected with an error', ->
				promise = resin.auth.getEmail()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'ResinNotLoggedIn')

		describe 'resin.auth.getUserId()', ->

			it 'should be rejected with an error', ->
				promise = resin.auth.getUserId()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'ResinNotLoggedIn')

		describe 'resin.auth.register()', ->

			beforeEach ->
				resin.auth.login
					email: credentials.register.email
					password: credentials.register.password
				.then(resin.auth.getUserId)
				.then (userId) ->
					return resin.request.send
						method: 'DELETE'
						url: "/v2/user(#{userId})"
						baseUrl: sdkOpts.apiUrl
					.then(resin.auth.logout)
				.catch(message: 'Request error: Unauthorized', ->)

			it 'should be able to register an account', ->
				resin.auth.register
					email: credentials.register.email
					password: credentials.register.password
				.then(resin.auth.loginWithToken)
				.then(resin.auth.isLoggedIn)
				.then (isLoggedIn) ->
					m.chai.expect(isLoggedIn).to.be.true

			it 'should not save the token automatically', ->
				resin.auth.register
					email: credentials.register.email
					password: credentials.register.password
				.then(resin.auth.isLoggedIn)
				.then (isLoggedIn) ->
					m.chai.expect(isLoggedIn).to.be.false

			it 'should be rejected if the email is invalid', ->
				promise = resin.auth.register
					email: 'foobarbaz'
					password: credentials.register.password

				m.chai.expect(promise).to.be.rejectedWith('Invalid email')

			it 'should be rejected if the email is taken', ->
				promise = resin.auth.register
					email: credentials.email
					password: credentials.register.password

				m.chai.expect(promise).to.be.rejectedWith('This email is already taken')

	describe 'when logged in with credentials', ->

		givenLoggedInUser()

		describe 'resin.auth.isLoggedIn()', ->

			it 'should eventually be true', ->
				promise = resin.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.true

		describe 'resin.auth.logout()', ->

			it 'should logout the user', ->
				resin.auth.logout().then ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

		describe 'resin.auth.whoami()', ->

			it 'should eventually be the username', ->
				promise = resin.auth.whoami()
				m.chai.expect(promise).to.eventually.equal(credentials.username)

		describe 'resin.auth.getEmail()', ->

			it 'should eventually be the email', ->
				promise = resin.auth.getEmail()
				m.chai.expect(promise).to.eventually.equal(credentials.email)

		describe 'resin.auth.getUserId()', ->

			it 'should eventually be a user id', ->
				resin.auth.getUserId()
				.then (userId) ->
					m.chai.expect(userId).to.be.a('number')
					m.chai.expect(userId).to.be.greaterThan(0)

	describe 'when logged in with API key', ->

		givenLoggedInUserWithApiKey()

		describe 'resin.auth.isLoggedIn()', ->

			it 'should eventually be true', ->
				promise = resin.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.true

		describe 'resin.auth.logout()', ->

			it 'should logout the user', ->
				resin.auth.logout().then ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

			it 'should reset the token on logout', ->
				resin.auth.logout().then ->
					promise = resin.auth.getToken()
					m.chai.expect(promise).to.be.rejected
						.and.eventually.have.property('code', 'ResinNotLoggedIn')

		describe 'resin.auth.whoami()', ->

			it 'should eventually be the username', ->
				promise = resin.auth.whoami()
				m.chai.expect(promise).to.eventually.equal(credentials.username)

		describe 'resin.auth.getEmail()', ->

			it 'should eventually be the email', ->
				promise = resin.auth.getEmail()
				m.chai.expect(promise).to.eventually.equal(credentials.email)

		describe 'resin.auth.getUserId()', ->

			it 'should eventually be a user id', ->
				resin.auth.getUserId()
				.then (userId) ->
					m.chai.expect(userId).to.be.a('number')
					m.chai.expect(userId).to.be.greaterThan(0)
