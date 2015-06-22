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

		describe 'given no applications', ->

			beforeEach ->
				@pineGetStub = sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return an empty array', (done) ->
				application.getAll (error, applications) ->
					expect(error).to.not.exist
					expect(applications).to.deep.equal([])
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

	describe '.get()', ->

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

	describe '.has()', ->

		describe 'given no application', ->

			beforeEach ->
				@pineGetStub = sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return false', (done) ->
				application.has 'MyApp', (error, has) ->
					expect(error).to.not.exist
					expect(has).to.be.false
					done()

		describe 'given an application', ->

			beforeEach ->
				applicationMock =
					device: null
					id: 999
					user: { __deferred: [Object], __id: 555 }
					app_name: 'App1'
					git_repository: 'git@git.resin.io:johndoe/device1.git'
					commit: null,
					device_type: 'raspberry-pi'
					__metadata: { uri: '/ewa/application(999)', type: '' }

				@pineGetStub = sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([ applicationMock ]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return true', (done) ->
				application.has 'MyApp', (error, has) ->
					expect(error).to.not.exist
					expect(has).to.be.true
					done()

	describe '.hasAny()', ->

		describe 'given no application', ->

			beforeEach ->
				@pineGetStub = sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return false', (done) ->
				application.hasAny (error, hasAny) ->
					expect(error).to.not.exist
					expect(hasAny).to.be.false
					done()

		describe 'given an application', ->

			beforeEach ->
				applicationMock =
					device: null
					id: 999
					user: { __deferred: [Object], __id: 555 }
					app_name: 'App1'
					git_repository: 'git@git.resin.io:johndoe/device1.git'
					commit: null,
					device_type: 'raspberry-pi'
					__metadata: { uri: '/ewa/application(999)', type: '' }

				@pineGetStub = sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([ applicationMock ]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return true', (done) ->
				application.hasAny (error, hasAny) ->
					expect(error).to.not.exist
					expect(hasAny).to.be.true
					done()

	describe '.getById()', ->

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

	describe '.create()', ->

		describe 'given device slug was not found', ->

			beforeEach ->
				@deviceGetDeviceSlugStub = sinon.stub(device, 'getDeviceSlug')
				@deviceGetDeviceSlugStub.returns(Promise.resolve(undefined))

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
				@deviceGetDeviceSlugStub.returns(Promise.resolve('raspberry-pi'))

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

			it 'should return the application', (done) ->
				application.create 'MyApp', 'Raspberry Pi', (error, createdApplication) =>
					expect(error).to.not.exist
					expect(createdApplication).to.deep.equal(@application)
					done()
