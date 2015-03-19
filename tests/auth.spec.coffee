chai = require('chai')
expect = chai.expect
sinon = require('sinon')
chai.use(require('sinon-chai'))
request = require('resin-request')
token = require('resin-token')
auth = require('../lib/auth')
johnDoeFixture = require('./tokens.json').johndoe

describe 'Auth:', ->

	describe '.whoami()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				token.set(johnDoeFixture.token)

			it 'should return the username', (done) ->
				auth.whoami (error, username) ->
					expect(error).to.not.exist
					expect(username).to.equal(johnDoeFixture.data.username)
					done()

		describe 'given a not logged in user', ->

			beforeEach ->
				token.remove()

			it 'should undefined', (done) ->
				auth.whoami (error, username) ->
					expect(error).to.not.exist
					expect(username).to.be.undefined
					done()

		describe 'given an invalid token', ->

			beforeEach ->
				token.set('1234')

			it 'should throw an error', (done) ->
				auth.whoami (error, username) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Malformed token: 1234')
					expect(username).to.not.exist
					done()

	describe '.register()', ->

		describe 'given invalid credentials', ->

			it 'should fail if no email', (done) ->
				auth.register
					username: 'johndoe'
					password: 'secret'
				, (error, token) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing credential: email')
					expect(token).to.not.exist
					done()

			it 'should fail if no username', (done) ->
				auth.register
					password: 'secret'
					email: 'john@doe.com'
				, (error, token) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing credential: username')
					expect(token).to.not.exist
					done()

			it 'should fail if no password', (done) ->
				auth.register
					username: 'johndoe'
					email: 'john@doe.com'
				, (error, token) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing credential: password')
					expect(token).to.not.exist
					done()

		describe 'given valid credentials', ->

			beforeEach ->
				@requestStub = sinon.stub(request, 'request')
				@requestStub.yields(null, {}, '1234')

			afterEach ->
				@requestStub.restore()

			it 'should be able to register a username', (done) ->
				auth.register
					username: 'johndoe'
					password: 'secret'
					email: 'john@doe.com'
				, (error, token) ->
					expect(error).to.not.exist
					expect(token).to.equal('1234')
					done()

	describe '.loginWithToken()', ->

		describe 'given a not logged in user', ->

			beforeEach (done) ->
				auth.logout(done)

			it 'should save the token', (done) ->
				expect(auth.getToken()).to.not.exist
				auth.loginWithToken '1234', (error) ->
					expect(error).to.not.exist
					expect(auth.getToken()).to.equal('1234')
					done()

	describe '.authenticate()', ->

		describe 'given valid credentials', ->

			beforeEach ->
				@requestStub = sinon.stub(request, 'request')
				@requestStub.yields(null, body: '1234')

			afterEach ->
				@requestStub.restore()

			it 'should return a token string', (done) ->
				auth.authenticate
					username: 'johndoe'
					password: 'secret'
				, (error, token, username) ->
					expect(error).to.not.exist
					expect(token).to.equal('1234')
					done()

			it 'should return the username', (done) ->
				auth.authenticate
					username: 'johndoe'
					password: 'secret'
				, (error, token, username) ->
					expect(error).to.not.exist
					expect(username).to.equal('johndoe')
					done()

		describe 'given invalid credentials', ->

			beforeEach ->
				@requestStub = sinon.stub(request, 'request')
				@requestStub.yields(new Error('auth error'))

			afterEach ->
				@requestStub.restore()

			it 'should return an error', (done) ->
				auth.authenticate
					username: 'johndoe'
					password: 'secret'
				, (error, token, username) ->
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Error)
					expect(token).to.be.undefined
					expect(username).to.be.undefined
					done()

	describe '.login()', ->

		describe 'given a not logged in user', ->

			beforeEach (done) ->
				@requestStub = sinon.stub(request, 'request')
				@requestStub.yields(null, body: '1234')
				auth.logout(done)

			afterEach ->
				@requestStub.restore()

			it 'should save the token', (done) ->
				expect(auth.getToken()).to.not.exist
				auth.login
					username: 'johndoe'
					password: 'secret'
				, (error) ->
					expect(error).to.not.exist
					expect(auth.getToken()).to.exist
					done()

		describe 'given invalid credentials', ->

			beforeEach ->
				@requestStub = sinon.stub(request, 'request')
				@requestStub.yields(new Error('auth error'))

			afterEach ->
				@requestStub.restore()

			it 'should return an error', (done) ->
				auth.login
					username: 'johndoe'
					password: 'secret'
				, (error, token) ->
					expect(error).to.be.an.instanceof(Error)
					expect(token).to.be.undefined
					done()

		describe 'given a logged in user', ->

			beforeEach ->
				token.set('1234')

				@requestStub = sinon.stub(request, 'request')
				@requestStub.yields(null, body: '5678')

			afterEach ->
				@requestStub.restore()

			it 'should override the old user', (done) ->
				expect(token.get()).to.equal('1234')
				auth.login
					username: 'johndoe'
					password: 'secret'
				, (error) ->
					expect(error).to.not.exist
					expect(token.get()).to.equal('5678')
					done()

	describe '.isLoggedIn()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				token.set('1234')

			it 'should return true', ->
				expect(token.has()).to.be.true

		describe 'given a not logged in user', ->

			beforeEach (done) ->
				auth.logout(done)

			it 'should return false', (done) ->
				auth.isLoggedIn (isLoggedIn) ->
					expect(isLoggedIn).to.be.false
					done()

	describe '.getToken()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				token.set('1234')

			it 'should return the token', ->
				expect(auth.getToken()).to.equal('1234')

		describe 'given a not logged in user', ->

			beforeEach (done) ->
				auth.logout(done)

			it 'should return null', ->
				expect(auth.getToken()).to.not.exist

	describe '#logout()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				token.set('1234')

			it 'should remove the token', (done) ->
				expect(token.has()).to.be.true
				auth.logout (error) ->
					expect(error).to.not.exist
					expect(token.has()).to.be.false
					done()

		describe 'given a not logged in user', ->

			beforeEach (done) ->
				auth.logout(done)

			it 'should not return any error', (done) ->
				auth.logout (error) ->
					expect(error).to.not.exist
					done()

			it 'should keep the token undefined', (done) ->
				auth.logout (error) ->
					expect(error).to.not.exist
					auth.isLoggedIn (isLoggedIn) ->
						expect(isLoggedIn).to.be.false
						done()
