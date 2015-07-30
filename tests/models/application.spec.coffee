m = require('mochainon')
_ = require('lodash')
nock = require('nock')
Promise = require('bluebird')
errors = require('resin-errors')
pine = require('resin-pine')
token = require('resin-token')
settings = require('../../lib/settings')
application = require('../../lib/models/application')
device = require('../../lib/models/device')
auth = require('../../lib/auth')
johnDoeFixture = require('../tokens.json').johndoe

describe 'Application Model:', ->

	describe 'given a /whoami endpoint', ->

		beforeEach (done) ->
			settings.get('remoteUrl').then (remoteUrl) ->
				nock(remoteUrl).get('/whoami').reply(200, johnDoeFixture.token)
				done()

		afterEach ->
			nock.cleanAll()

		describe '.getAll()', ->

			describe 'given no applications', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually become an empty array', ->
					promise = application.getAll()
					m.chai.expect(promise).to.eventually.become([])

			describe 'given applications', ->

				describe 'given an application with devices', ->

					beforeEach ->
						@pineGetStub = m.sinon.stub(pine, 'get')
						@pineGetStub.returns Promise.resolve [
							{
								name: 'MyApp'
								id: 999
								device: [
									{ is_online: false }
									{ is_online: true }
								]
							}
						]

					afterEach ->
						@pineGetStub.restore()

					it 'should eventually have the correct number of applications', ->
						promise = application.getAll()
						m.chai.expect(promise).to.eventually.have.length(1)

					it 'should add online_devices', ->
						promise = application.getAll().get(0)
						m.chai.expect(promise.get('online_devices')).to.eventually.equal(1)

					it 'should add devices_length', ->
						promise = application.getAll().get(0)
						m.chai.expect(promise.get('devices_length')).to.eventually.equal(2)

		describe '.get()', ->

			describe 'given no application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should be rejected', ->
					promise = application.get('MyApp')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

			describe 'given an application', ->

				beforeEach ->
					@application =
						id: 999
						device_type: 'raspberry-pi'

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @application ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually become the application', ->
					promise = application.get('MyApp')
					m.chai.expect(promise).to.eventually.become(@application)

		describe '.has()', ->

			describe 'given no application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be false', ->
					promise = application.has('MyApp')
					m.chai.expect(promise).to.eventually.be.false

			describe 'given an application', ->

				beforeEach ->
					applicationMock =
						id: 999
						app_name: 'App1'
						device_type: 'raspberry-pi'

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ applicationMock ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be true', ->
					promise = application.has('MyApp')
					m.chai.expect(promise).to.eventually.be.true

		describe '.hasAny()', ->

			describe 'given no application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be false', ->
					promise = application.hasAny()
					m.chai.expect(promise).to.eventually.be.false

			describe 'given an application', ->

				beforeEach ->
					applicationMock =
						id: 999
						app_name: 'App1'
						device_type: 'raspberry-pi'

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ applicationMock ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be true', ->
					promise = application.hasAny()
					m.chai.expect(promise).to.eventually.be.true

		describe '.getById()', ->

			describe 'given no application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(undefined))

				afterEach ->
					@pineGetStub.restore()

				it 'should be rejected', ->
					promise = application.getById(9999)
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

			describe 'given an application', ->

				beforeEach ->
					@application =
						id: 999
						app_name: 'App1'
						device_type: 'raspberry-pi'

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(@application))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually become application', ->
					promise = application.getById(999)
					m.chai.expect(promise).to.eventually.become(@application)

		describe '.create()', ->

			describe 'given device slug was not found', ->

				beforeEach ->
					@deviceGetDeviceSlugStub = m.sinon.stub(device, 'getDeviceSlug')
					@deviceGetDeviceSlugStub.returns(Promise.resolve(undefined))

				afterEach ->
					@deviceGetDeviceSlugStub.restore()

				it 'should be rejected', ->
					promise = application.create('MyApp', 'Unknown Device')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinInvalidDeviceType)

			describe 'given device slug was found', ->

				beforeEach ->
					@deviceGetDeviceSlugStub = m.sinon.stub(device, 'getDeviceSlug')
					@deviceGetDeviceSlugStub.returns(Promise.resolve('raspberry-pi'))

					@application =
						id: 999
						app_name: 'App1'
						device_type: 'raspberry-pi'

					@pinePostStub = m.sinon.stub(pine, 'post')
					@pinePostStub.returns(Promise.resolve(@application))

				afterEach ->
					@deviceGetDeviceSlugStub.restore()
					@pinePostStub.restore()

				it 'should eventually become the application', ->
					promise = application.create('MyApp', 'Unknown Device')
					m.chai.expect(promise).to.eventually.become(@application)

		describe '.remove()', ->

			describe 'given an invalid application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should reject with not found error', ->
					promise = application.remove('App1')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

		describe '.restart()', ->

			describe 'given an invalid application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should reject with not found error', ->
					promise = application.restart('App1')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

			describe 'given a valid application', ->

				beforeEach ->
					@application =
						id: 999
						app_name: 'App1'
						device_type: 'raspberry-pi'

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @application ]))

				afterEach ->
					@pineGetStub.restore()

				describe 'given a successful restart', ->

					beforeEach (done) ->
						settings.get('remoteUrl').then (remoteUrl) ->
							nock(remoteUrl).post('/application/999/restart').reply(200)
							done()

					afterEach ->
						nock.cleanAll()

					it 'should eventually be undefined', ->
						promise = application.restart('App1')
						m.chai.expect(promise).to.eventually.be.undefined

				describe 'given an invalid application', ->

					beforeEach (done) ->
						settings.get('remoteUrl').then (remoteUrl) ->
							nock(remoteUrl).post('/application/999/restart')
								.reply(403, 'You do not have permission to access this application')
							done()

					afterEach ->
						nock.cleanAll()

					it 'should be rejected with an error message', ->
						promise = application.restart('App1')
						m.chai.expect(promise).to.be.rejectedWith('You do not have permission to access this application')

		describe '.getApiKey()', ->

			describe 'given an invalid application', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should reject with not found error', ->
					promise = application.getApiKey('App1')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

			describe 'given a valid application', ->

				beforeEach ->
					@application =
						id: 999
						app_name: 'App1'
						device_type: 'raspberry-pi'

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @application ]))

				afterEach ->
					@pineGetStub.restore()

				describe 'given a successful request', ->

					beforeEach (done) ->
						settings.get('remoteUrl').then (remoteUrl) ->
							nock(remoteUrl).post('/application/999/generate-api-key').reply(200, 'asdf1234')
							done()

					afterEach ->
						nock.cleanAll()

					it 'should eventually be the api key', ->
						promise = application.getApiKey('App1')
						m.chai.expect(promise).to.eventually.equal('asdf1234')
