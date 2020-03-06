m = require('mochainon')

{ balena, sdkOpts, credentials, givenLoggedInUser, givenLoggedInUserWithApiKey } = require('./setup')

describe 'SDK authentication', ->

	describe 'when not logged in', ->

		beforeEach ->
			balena.auth.logout()

		describe 'balena.auth.isLoggedIn()', ->

			it 'should eventually be false', ->
				promise = balena.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.false

		describe 'balena.auth.whoami()', ->

			it 'should eventually be undefined', ->
				promise = balena.auth.whoami()
				m.chai.expect(promise).to.eventually.be.undefined

		describe 'balena.auth.logout()', ->

			it 'should not be rejected', ->
				promise = balena.auth.logout()
				m.chai.expect(promise).to.not.be.rejected

		describe 'balena.auth.authenticate()', ->

			it 'should not save the token given valid credentials', ->
				balena.auth.authenticate(credentials).then ->
					promise = balena.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

			it 'should be rejected given invalid credentials', ->
				promise = balena.auth.authenticate
					email: credentials.username,
					password: 'NOT-THE-CORRECT-PASSWORD'

				m.chai.expect(promise).to.be.rejectedWith('Unauthorized')

		describe 'balena.auth.getToken()', ->

			it 'should be rejected', ->
				promise = balena.auth.getToken()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')

		describe 'balena.auth.loginWithToken()', ->

			it 'should be able to login with a session token', ->
				balena.auth.authenticate(credentials)
				.then(balena.auth.loginWithToken)
				.then(balena.auth.getToken)
				.then (key) ->
					m.chai.expect(key).to.be.a('string')

			it 'should be able to login with an API Key', ->
				balena.auth.authenticate(credentials)
				.then(balena.auth.loginWithToken)
				.then ->
					balena.models.apiKey.create('apiKey')
				.tap(balena.auth.logout)
				.then(balena.auth.loginWithToken)
				.then(balena.auth.getToken)
				.then (key) ->
					m.chai.expect(key).to.be.a('string')

		describe 'balena.auth.getEmail()', ->

			it 'should be rejected with an error', ->
				promise = balena.auth.getEmail()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')

		describe 'balena.auth.getUserId()', ->

			it 'should be rejected with an error', ->
				promise = balena.auth.getUserId()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')

		describe.skip 'balena.auth.register()', ->

			beforeEach ->
				balena.auth.login
					email: credentials.register.email
					password: credentials.register.password
				.then(balena.auth.getUserId)
				.then (userId) ->
					return balena.request.send
						method: 'DELETE'
						url: "/v2/user(#{userId})"
						baseUrl: sdkOpts.apiUrl
					.then(balena.auth.logout)
				.catch(message: 'Request error: Unauthorized', ->)

			it 'should be able to register an account', ->
				balena.auth.register
					email: credentials.register.email
					password: credentials.register.password
				.then(balena.auth.loginWithToken)
				.then(balena.auth.isLoggedIn)
				.then (isLoggedIn) ->
					m.chai.expect(isLoggedIn).to.be.true

			it 'should not save the token automatically', ->
				balena.auth.register
					email: credentials.register.email
					password: credentials.register.password
				.then(balena.auth.isLoggedIn)
				.then (isLoggedIn) ->
					m.chai.expect(isLoggedIn).to.be.false

			it 'should be rejected if the email is invalid', ->
				promise = balena.auth.register
					email: 'foobarbaz'
					password: credentials.register.password

				m.chai.expect(promise).to.be.rejectedWith('Invalid email')

			it 'should be rejected if the email is taken', ->
				promise = balena.auth.register
					email: credentials.email
					password: credentials.register.password

				m.chai.expect(promise).to.be.rejectedWith('This email is already taken')

		describe 'given an invalid token', ->

			describe 'balena.auth.loginWithToken()', ->

				it 'should be not rejected', ->
					balena.auth.authenticate(credentials)
					.then((token) -> balena.auth.loginWithToken("#{token}malformingsuffix"))
					.then(balena.auth.getToken)
					.then (key) ->
						m.chai.expect(key).to.be.a('string')

	describe 'when logged in with an invalid token', ->

		before ->
			balena.auth.logout()
			.then ->
				balena.auth.authenticate(credentials)
			.then (token) ->
				balena.auth.loginWithToken("#{token}malformingsuffix")

		describe 'balena.auth.isLoggedIn()', ->

			it 'should eventually be false', ->
				promise = balena.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.false

		describe 'balena.auth.whoami()', ->

			it 'should eventually be undefined', ->
				promise = balena.auth.whoami()
				m.chai.expect(promise).to.eventually.be.undefined

		describe 'balena.auth.getEmail()', ->

			it 'should be rejected with an error', ->
				promise = balena.auth.getEmail()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')

		describe 'balena.auth.getUserId()', ->

			it 'should be rejected with an error', ->
				promise = balena.auth.getUserId()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')

	describe 'when logged in with credentials', ->

		givenLoggedInUser(beforeEach)

		describe 'balena.auth.isLoggedIn()', ->

			it 'should eventually be true', ->
				promise = balena.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.true

		describe 'balena.auth.logout()', ->

			it 'should logout the user', ->
				balena.auth.logout().then ->
					promise = balena.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

		describe 'balena.auth.whoami()', ->

			it 'should eventually be the username', ->
				promise = balena.auth.whoami()
				m.chai.expect(promise).to.eventually.equal(credentials.username)

		describe 'balena.auth.getEmail()', ->

			it 'should eventually be the email', ->
				promise = balena.auth.getEmail()
				m.chai.expect(promise).to.eventually.equal(credentials.email)

		describe 'balena.auth.getUserId()', ->

			it 'should eventually be a user id', ->
				balena.auth.getUserId()
				.then (userId) ->
					m.chai.expect(userId).to.be.a('number')
					m.chai.expect(userId).to.be.greaterThan(0)

	describe 'when logged in with API key', ->

		givenLoggedInUserWithApiKey(beforeEach)

		describe 'balena.auth.isLoggedIn()', ->

			it 'should eventually be true', ->
				promise = balena.auth.isLoggedIn()
				m.chai.expect(promise).to.eventually.be.true

		describe 'balena.auth.logout()', ->

			it 'should logout the user', ->
				balena.auth.logout().then ->
					promise = balena.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

			it 'should reset the token on logout', ->
				balena.auth.logout().then ->
					promise = balena.auth.getToken()
					m.chai.expect(promise).to.be.rejected
						.and.eventually.have.property('code', 'BalenaNotLoggedIn')

		describe 'balena.auth.whoami()', ->

			it 'should eventually be the username', ->
				promise = balena.auth.whoami()
				m.chai.expect(promise).to.eventually.equal(credentials.username)

		describe 'balena.auth.getEmail()', ->

			it 'should eventually be the email', ->
				promise = balena.auth.getEmail()
				m.chai.expect(promise).to.eventually.equal(credentials.email)

		describe 'balena.auth.getUserId()', ->

			it 'should eventually be a user id', ->
				balena.auth.getUserId()
				.then (userId) ->
					m.chai.expect(userId).to.be.a('number')
					m.chai.expect(userId).to.be.greaterThan(0)
