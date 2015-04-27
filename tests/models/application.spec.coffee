_ = require('lodash')
sinon = require('sinon')
chai = require('chai')
chai.use(require('sinon-chai'))
expect = chai.expect
Promise = require('bluebird')
errors = require('resin-errors')
pine = require('resin-pine')
token = require('resin-token')
application = require('../../lib/models/application')
device = require('../../lib/models/device')

describe 'Application Model:', ->

	describe '.getAll()', ->

		it 'should throw if not callback', ->
			expect ->
				application.getAll(null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				application.getAll([ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no applications', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return an error', (done) ->
					application.getAll (error, applications) ->
						expect(error).to.be.an.instanceof(errors.ResinNotAny)
						expect(applications).to.not.exist
						done()

			describe 'given applications', ->

				describe 'given an application with devices', ->

					beforeEach ->
						@pineGetStub = sinon.stub(pine, 'get')
						@pineGetStub.returns Promise.resolve [
							{
								device: [
									{ is_online: false }
									{ is_online: true }
								]
								id: 999
								user: { __deferred: [Object], __id: 555 }
								app_name: 'App1'
								git_repository: 'git@git.resin.io:johndoe/device1.git'
								commit: null,
								device_type: 'raspberry-pi'
								__metadata: { uri: '/ewa/application(999)', type: '' }
							}
						]

					afterEach ->
						@pineGetStub.restore()

					it 'should return the correct number of applications', (done) ->
						application.getAll (error, applications) ->
							expect(error).to.not.exist
							expect(applications).to.have.length(1)
							done()

					it 'should add online_devices', (done) ->
						application.getAll (error, applications) ->
							expect(error).to.not.exist
							expect(applications[0].online_devices).to.equal(1)
							done()

					it 'should add devices_length', (done) ->
						application.getAll (error, applications) ->
							expect(error).to.not.exist
							expect(applications[0].devices_length).to.equal(2)
							done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				application.getAll (error, applications) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(applications).to.not.exist
					done()

	describe '.get()', ->

		it 'should throw if no name', ->
			expect ->
				application.get(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				application.get([ 'MyApp' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				application.get('MyApp', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				application.get('MyApp', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no application', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return an error', (done) ->
					application.get 'MyApp', (error, application) ->
						expect(error).to.be.an.instanceof(errors.ResinApplicationNotFound)
						expect(application).to.not.exist
						done()

			describe 'given an application', ->

				beforeEach ->
					@application =
						device: null
						id: 999
						user: { __deferred: [Object], __id: 555 }
						app_name: 'App1'
						git_repository: 'git@git.resin.io:johndoe/device1.git'
						commit: null,
						device_type: 'raspberry-pi'
						__metadata: { uri: '/ewa/application(999)', type: '' }

					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @application ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return the application', (done) ->
					application.get 'MyApp', (error, application) =>
						expect(error).to.not.exist
						expect(application).to.deep.equal(@application)
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				application.get 'MyApp', (error, application) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(application).to.not.exist
					done()

	describe '.getById()', ->

		it 'should throw if no id', ->
			expect ->
				application.get(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if id is not a string not a number', ->
			expect ->
				application.get([ 999 ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				application.getById('999', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				application.getById('999', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no application', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(undefined))

				afterEach ->
					@pineGetStub.restore()

				it 'should return an error', (done) ->
					application.getById 9999, (error, application) ->
						expect(error).to.be.an.instanceof(errors.ResinApplicationNotFound)
						expect(application).to.not.exist
						done()

			describe 'given an application', ->

				beforeEach ->
					@application =
						device: null
						id: 999
						user: { __deferred: [Object], __id: 555 }
						app_name: 'App1'
						git_repository: 'git@git.resin.io:johndoe/device1.git'
						commit: null,
						device_type: 'raspberry-pi'
						__metadata: { uri: '/ewa/application(999)', type: '' }

					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(@application))

				afterEach ->
					@pineGetStub.restore()

				it 'should return the application', (done) ->
					application.getById 999, (error, application) =>
						expect(error).to.not.exist
						expect(application).to.deep.equal(@application)
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				application.getById 9999, (error, application) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(application).to.not.exist
					done()

	describe '.create()', ->

		it 'should throw if no name', ->
			expect ->
				application.create(null, 'Raspberry Pi', _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				application.create([ 'MyApp' ], 'Raspberry Pi', _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if no device type', ->
			expect ->
				application.create('MyApp', null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if device type is not a string', ->
			expect ->
				application.create('MyApp', [ 'Raspberry Pi' ],  _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				application.create('MyApp', 'Raspberry Pi', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				application.create('MyApp', 'Raspberry Pi', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given device slug was not found', ->

				beforeEach ->
					@deviceGetDeviceSlugStub = sinon.stub(device, 'getDeviceSlug')
					@deviceGetDeviceSlugStub.yields(null, undefined)

				afterEach ->
					@deviceGetDeviceSlugStub.restore()

				it 'should return an error', (done) ->
					application.create 'MyApp', 'Unknown Device', (error, id) ->
						expect(error).to.be.an.instanceof(errors.ResinInvalidDeviceType)
						expect(id).to.not.exist
						done()

			describe 'given device slug was found', ->

				beforeEach ->
					@deviceGetDeviceSlugStub = sinon.stub(device, 'getDeviceSlug')
					@deviceGetDeviceSlugStub.yields(null, 'raspberry-pi')

					@application =
						device: null
						id: 999
						user: { __deferred: [Object], __id: 555 }
						app_name: 'App1'
						git_repository: 'git@git.resin.io:johndoe/device1.git'
						commit: null,
						device_type: 'raspberry-pi'
						__metadata: { uri: '/ewa/application(999)', type: '' }

					@pinePostStub = sinon.stub(pine, 'post')
					@pinePostStub.returns(Promise.resolve(@application))

				afterEach ->
					@deviceGetDeviceSlugStub.restore()
					@pinePostStub.restore()

				it 'should return the application id', (done) ->
					application.create 'MyApp', 'Raspberry Pi', (error, id) ->
						expect(error).to.not.exist
						expect(id).to.equal(999)
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				application.create 'MyApp', 'Raspberry Pi', (error, id) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(id).to.not.exist
					done()

	describe '.remove()', ->

		it 'should throw if no name', ->
			expect ->
				application.remove(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				application.remove([ 'MyApp' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				application.remove('MyApp', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				application.remove('MyApp', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				application.remove 'MyApp', (error) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					done()

	describe '.restart()', ->

		it 'should throw if no name', ->
			expect ->
				application.remove(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				application.remove([ 'MyApp' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				application.remove('MyApp', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				application.remove('MyApp', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				application.restart 'MyApp', (error) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					done()
