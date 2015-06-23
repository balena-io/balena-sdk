m = require('mochainon')
Promise = require('bluebird')
request = require('resin-request')
token = require('resin-token')
errors = require('resin-errors')
auth = require('../lib/auth')
johnDoeFixture = require('./tokens.json').johndoe

describe 'Auth:', ->

	describe 'given all tokens are valid', ->

		beforeEach ->
			@tokenIsValidStub = m.sinon.stub(token, 'isValid')
			@tokenIsValidStub.returns(Promise.resolve(true))

		afterEach ->
			@tokenIsValidStub.restore()

		describe '.whoami()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					token.set(johnDoeFixture.token)

				it 'should return the username', (done) ->
					auth.whoami (error, username) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(username).to.equal(johnDoeFixture.data.username)
						done()

			describe 'given a not logged in user', ->

				beforeEach ->
					token.remove()

				it 'should undefined', (done) ->
					auth.whoami (error, username) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(username).to.be.undefined
						done()

			describe 'given an invalid token', ->

				beforeEach ->
					token.set('1234')

				it 'should throw an error', (done) ->
					auth.whoami (error, username) ->
						m.chai.expect(error).to.be.an.instanceof(Error)
						m.chai.expect(error.message).to.equal('Malformed token: 1234')
						m.chai.expect(username).to.not.exist
						done()

		describe '.register()', ->

			describe 'given valid credentials', ->

				beforeEach ->
					@requestStub = m.sinon.stub(request, 'send')
					@requestStub.returns(Promise.resolve(body: '1234'))

				afterEach ->
					@requestStub.restore()

				it 'should be able to register a username', (done) ->
					auth.register
						username: 'johndoe'
						password: 'secret'
						email: 'john@doe.com'
					, (error, token) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(token).to.equal('1234')
						done()

		describe '.loginWithToken()', ->

			describe 'given a not logged in user', ->

				beforeEach (done) ->
					auth.logout(done)

				it 'should save the token', (done) ->
					auth.getToken (error, token) ->
						m.chai.expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
						m.chai.expect(token).to.not.exist

						auth.loginWithToken '1234', (error) ->
							m.chai.expect(error).to.not.exist

							auth.getToken (error, token) ->
								m.chai.expect(error).to.not.exist
								m.chai.expect(token).to.equal('1234')
								done()

		describe '.authenticate()', ->

			describe 'given valid credentials', ->

				beforeEach ->
					@requestStub = m.sinon.stub(request, 'send')
					@requestStub.returns(Promise.resolve(body: '1234'))

				afterEach ->
					@requestStub.restore()

				it 'should return a token string', (done) ->
					auth.authenticate
						username: 'johndoe'
						password: 'secret'
					, (error, token) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(token).to.equal('1234')
						done()

			describe 'given invalid credentials', ->

				beforeEach ->
					@requestStub = m.sinon.stub(request, 'send')
					@requestStub.returns(Promise.reject(new Error('auth error')))

				afterEach ->
					@requestStub.restore()

				it 'should return an error', (done) ->
					auth.authenticate
						username: 'johndoe'
						password: 'secret'
					, (error, token) ->
						m.chai.expect(error).to.exist
						m.chai.expect(error).to.be.an.instanceof(Error)
						m.chai.expect(token).to.be.undefined
						done()

		describe '.login()', ->

			describe 'given a not logged in user', ->

				beforeEach (done) ->
					@requestStub = m.sinon.stub(request, 'send')
					@requestStub.returns(Promise.resolve(body: '1234'))
					auth.logout(done)

				afterEach ->
					@requestStub.restore()

				it 'should save the token', (done) ->
					auth.getToken (error, token) ->
						m.chai.expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
						m.chai.expect(token).to.not.exist

						auth.login
							username: 'johndoe'
							password: 'secret'
						, (error) ->
							m.chai.expect(error).to.not.exist

							auth.getToken (error, token) ->
								m.chai.expect(error).to.not.exist
								m.chai.expect(token).to.exist
								done()

			describe 'given invalid credentials', ->

				beforeEach ->
					@requestStub = m.sinon.stub(request, 'send')
					@requestStub.returns(Promise.reject(new Error('auth error')))

				afterEach ->
					@requestStub.restore()

				it 'should return an error', (done) ->
					auth.login
						username: 'johndoe'
						password: 'secret'
					, (error, token) ->
						m.chai.expect(error).to.be.an.instanceof(Error)
						m.chai.expect(token).to.be.undefined
						done()

			describe 'given a logged in user', ->

				beforeEach ->
					token.set('1234')

					@requestStub = m.sinon.stub(request, 'send')
					@requestStub.returns(Promise.resolve(body: '5678'))

				afterEach ->
					@requestStub.restore()

				it 'should override the old user', (done) ->
					token.get().then (savedToken) ->
						m.chai.expect(savedToken).to.equal('1234')

						auth.login
							username: 'johndoe'
							password: 'secret'
						, (error) ->
							m.chai.expect(error).to.not.exist

							token.get().then (savedToken) ->
								m.chai.expect(savedToken).to.equal('5678')
								done()

		describe '.isLoggedIn()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					token.set('1234')

				it 'should return true', ->
					m.chai.expect(token.has()).to.eventually.be.true

			describe 'given a not logged in user', ->

				beforeEach (done) ->
					auth.logout(done)

				it 'should return false', (done) ->
					auth.isLoggedIn (error, isLoggedIn) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(isLoggedIn).to.be.false
						done()

		describe '.getToken()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					token.set('1234')

				it 'should return the token', (done) ->
					auth.getToken (error, token) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(token).to.equal('1234')
						done()

			describe 'given a not logged in user', ->

				beforeEach (done) ->
					auth.logout(done)

				it 'should return an error', (done) ->
					auth.getToken (error, token) ->
						m.chai.expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
						m.chai.expect(token).to.not.exist
						done()

		describe '.getUserId()', ->

			describe 'given there was an error getting the user id', ->

				beforeEach ->
					@tokenGetUserIdStub = m.sinon.stub(token, 'getUserId')
					@tokenGetUserIdStub.returns(Promise.reject(new Error('token error')))

				afterEach ->
					@tokenGetUserIdStub.restore()

				it 'should return the error', (done) ->
					auth.getUserId (error, id) ->
						m.chai.expect(error).to.be.an.instanceof(Error)
						m.chai.expect(error.message).to.equal('token error')
						m.chai.expect(id).to.not.exist
						done()

			describe 'given no user id could not be retrieved', ->

				beforeEach ->
					@tokenGetUserIdStub = m.sinon.stub(token, 'getUserId')
					@tokenGetUserIdStub.returns(Promise.resolve(undefined))

				afterEach ->
					@tokenGetUserIdStub.restore()

				it 'should return a ResinNotLoggedIn error', (done) ->
					auth.getUserId (error, id) ->
						m.chai.expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
						m.chai.expect(id).to.not.exist
						done()

			describe 'given the user id could be retrieved', ->

				beforeEach ->
					@tokenGetUserIdStub = m.sinon.stub(token, 'getUserId')
					@tokenGetUserIdStub.returns(Promise.resolve(123))

				afterEach ->
					@tokenGetUserIdStub.restore()

				it 'should return the id', (done) ->
					auth.getUserId (error, id) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(id).to.equal(123)
						done()

		describe '#logout()', ->

			describe 'given a logged in user', ->

				beforeEach ->
					token.set('1234')

				it 'should remove the token', (done) ->
					token.has().then (hasToken) ->
						m.chai.expect(hasToken).to.be.true
						auth.logout (error) ->
							m.chai.expect(error).to.not.exist
							token.has().then (hasToken) ->
								m.chai.expect(hasToken).to.be.false
								done()

			describe 'given a not logged in user', ->

				beforeEach (done) ->
					auth.logout(done)

				it 'should not return any error', (done) ->
					auth.logout (error) ->
						m.chai.expect(error).to.not.exist
						done()

				it 'should keep the token undefined', (done) ->
					auth.logout (error) ->
						m.chai.expect(error).to.not.exist
						auth.isLoggedIn (error, isLoggedIn) ->
							m.chai.expect(error).to.not.exist
							m.chai.expect(isLoggedIn).to.be.false
							done()
