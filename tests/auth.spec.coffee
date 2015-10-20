m = require('mochainon')
nock = require('nock')
Promise = require('bluebird')
token = require('resin-token')
errors = require('resin-errors')
auth = require('../lib/auth')
settings = require('../lib/settings')
tokens = require('./tokens.json')
johnDoeFixture = tokens.johndoe
janeDoeFixture = tokens.janedoe

describe 'Auth:', ->

	describe 'given a /whoami endpoint', ->

		beforeEach (done) ->
			settings.get('apiUrl').then (apiUrl) ->
				nock(apiUrl).get('/whoami').reply(200, johnDoeFixture.token)
				done()

		afterEach ->
			nock.cleanAll()

		describe '.whoami()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(johnDoeFixture.token)

				it 'should eventually be the username', ->
					promise = auth.whoami()
					m.chai.expect(promise).to.eventually.equal(johnDoeFixture.data.username)

			describe 'given a not logged in user', ->

				beforeEach ->
					auth.logout()

				it 'should eventually be undefined', ->
					promise = auth.whoami()
					m.chai.expect(promise).to.eventually.be.undefined

		describe '.authenticate()', ->

			describe 'given valid credentials', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/login_').reply(200, johnDoeFixture.token)
						done()

				afterEach ->
					nock.cleanAll()

				it 'should eventually return a token', ->
					promise = auth.authenticate
						email: 'foo'
						password: 'bar'

					m.chai.expect(promise).to.eventually.equal(johnDoeFixture.token)

			describe 'given invalid credentials', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/login_').reply(401, 'Unauthorized')
						done()

				afterEach ->
					nock.cleanAll()

				it 'should be rejected', ->
					promise = auth.authenticate
						email: 'foo'
						password: 'bar'

					m.chai.expect(promise).to.be.rejectedWith('Unauthorized')

		describe '.login()', ->

			describe 'given invalid credentials', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/login_').reply(401, 'Unauthorized')
						done()

				afterEach ->
					nock.cleanAll()

				it 'should be rejected', ->
					promise = auth.login
						email: 'foo'
						password: 'bar'

					m.chai.expect(promise).to.be.rejectedWith('Unauthorized')

			describe 'given valid credentials', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/login_').reply(200, johnDoeFixture.token)
						done()

				afterEach ->
					nock.cleanAll()

				describe 'given no logged in user', ->

					beforeEach ->
						auth.logout()

					it 'should save the token', (done) ->
						m.chai.expect(auth.getToken()).to.be.rejectedWith(errors.ResinNotLoggedIn)

						auth.login
							email: 'foo'
							password: 'bar'
						.then ->
							m.chai.expect(auth.getToken()).to.eventually.equal(johnDoeFixture.token)
							done()

				describe 'given a logged in user', ->

					beforeEach ->
						auth.loginWithToken(janeDoeFixture.token)

					it 'should replace the saved token', (done) ->
						m.chai.expect(auth.getToken()).to.eventually.equal(janeDoeFixture.token)

						auth.login
							email: 'foo'
							password: 'bar'
						.then ->
							m.chai.expect(auth.getToken()).to.eventually.equal(johnDoeFixture.token)
							done()

		describe '.loginWithToken()', ->

			describe 'given an invalid token', ->

				it 'should be rejected', ->
					promise = auth.loginWithToken('1234')
					m.chai.expect(promise).to.be.rejected

			describe 'given a not logged in user', ->

				beforeEach ->
					auth.logout()

				it 'should save the token', (done) ->
					m.chai.expect(auth.getToken()).to.be.rejectedWith(errors.ResinNotLoggedIn)

					auth.loginWithToken(johnDoeFixture.token).then ->
						m.chai.expect(auth.getToken()).to.eventually.equal(johnDoeFixture.token)
						done()

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(janeDoeFixture.token)

				it 'should replace the saved token', (done) ->
					m.chai.expect(auth.getToken()).to.eventually.equal(janeDoeFixture.token)

					auth.loginWithToken(johnDoeFixture.token).then ->
						m.chai.expect(auth.getToken()).to.eventually.equal(johnDoeFixture.token)
						done()

		describe '.isLoggedIn()', ->

			describe 'given a logged in user', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).get('/whoami').reply(200, janeDoeFixture.token)
						done()

				afterEach ->
					nock.cleanAll()

				it 'should eventually be true', ->
					promise = auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.true

			describe 'given no logged in user', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).get('/whoami').reply(401, 'Unauthorized')
						done()

				afterEach ->
					nock.cleanAll()

				it 'should eventually be false', ->
					promise = auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

		describe '.getToken()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(janeDoeFixture.token)

				it 'should eventually be the token', ->
					promise = auth.getToken()
					m.chai.expect(promise).to.eventually.equal(janeDoeFixture.token)

			describe 'given no logged in user', ->

				beforeEach ->
					auth.logout()

				it 'should be rejected', ->
					promise = auth.getToken()
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinNotLoggedIn)

		describe '.getUserId()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(janeDoeFixture.token)

				it 'should eventually be the username', ->
					promise = auth.getUserId()
					m.chai.expect(promise).to.eventually.equal(janeDoeFixture.data.id)

			describe 'given no logged in user', ->

				beforeEach ->
					auth.logout()

				it 'should be rejected', ->
					promise = auth.getUserId()
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinNotLoggedIn)

		describe '.getEmail()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(janeDoeFixture.token)

				it 'should eventually be the email', ->
					promise = auth.getEmail()
					m.chai.expect(promise).to.eventually.equal(janeDoeFixture.data.email)

			describe 'given no logged in user', ->

				beforeEach ->
					auth.logout()

				it 'should be rejected', ->
					promise = auth.getEmail()
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinNotLoggedIn)

		describe '.logout()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(janeDoeFixture.token)

				it 'should clear the token', (done) ->
					m.chai.expect(auth.getToken()).to.eventually.equal(janeDoeFixture.token)

					auth.logout().then ->
						m.chai.expect(auth.getToken()).to.be.rejectedWith(errors.ResinNotLoggedIn)
						done()

			describe 'given no logged in user', ->

				beforeEach ->
					token.remove()

				it 'should keep the token empty', (done) ->
					m.chai.expect(auth.getToken()).to.be.rejectedWith(errors.ResinNotLoggedIn)

					auth.logout().then ->
						m.chai.expect(auth.getToken()).to.be.rejectedWith(errors.ResinNotLoggedIn)
						done()

		describe '.register()', ->

			describe 'given register is successful', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/user/register').reply(201, johnDoeFixture.token)
						done()

				afterEach ->
					nock.cleanAll()

				it 'should eventually be the token', ->
					promise = auth.register
						email: johnDoeFixture.data.email
						password: '12345678'

					m.chai.expect(promise).to.eventually.equal(johnDoeFixture.token)

			describe 'given a validation error', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/user/register').reply(400, 'Password must be at least 8 characters.')
						done()

				afterEach ->
					nock.cleanAll()

				it 'should be rejected with the error message', ->
					promise = auth.register
						email: johnDoeFixture.data.email
						password: '1234'

					m.chai.expect(promise).to.be.rejectedWith('Password must be at least 8 characters.')

			describe 'given a missing field', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/user/register').reply(400, 'Password required.')
						done()

				afterEach ->
					nock.cleanAll()

				it 'should be rejected with the error message', ->
					promise = auth.register
						email: johnDoeFixture.data.email

					m.chai.expect(promise).to.be.rejectedWith('Password required.')

	describe 'given a 401 /whoami endpoint', ->

		beforeEach (done) ->
			settings.get('apiUrl').then (apiUrl) ->
				nock(apiUrl).get('/whoami').reply(401)
				done()

		afterEach ->
			nock.cleanAll()

		describe '.authenticate()', ->

			describe 'given valid credentials', ->

				beforeEach (done) ->
					settings.get('apiUrl').then (apiUrl) ->
						nock(apiUrl).post('/login_').reply(200, johnDoeFixture.token)
						done()

				afterEach ->
					nock.cleanAll()

				describe 'given the current token is old', ->

					beforeEach (done) ->
						settings.get('tokenRefreshInterval').then (tokenRefreshInterval) =>
							@tokenGetAgeStub = m.sinon.stub(token, 'getAge')
							@tokenGetAgeStub.returns(Promise.resolve(tokenRefreshInterval + 1))
						.nodeify(done)

					afterEach ->
						@tokenGetAgeStub.restore()

					it 'should eventually return a token', ->
						promise = auth.authenticate
							email: 'foo'
							password: 'bar'

						m.chai.expect(promise).to.eventually.equal(johnDoeFixture.token)
