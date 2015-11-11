m = require('mochainon')
_ = require('lodash')
Promise = require('bluebird')
nock = require('nock')
errors = require('resin-errors')
pine = require('resin-pine')
settings = require('../../lib/settings')
device = require('../../lib/models/device')
application = require('../../lib/models/application')
config = require('../../lib/models/config')
auth = require('../../lib/auth')
johnDoeFixture = require('../tokens.json').johndoe

describe 'Device Model:', ->

	describe 'given a /whoami endpoint', ->

		beforeEach (done) ->
			settings.get('apiUrl').then (apiUrl) ->
				nock(apiUrl).get('/whoami').reply(200, johnDoeFixture.token)
				done()

		afterEach ->
			nock.cleanAll()

		describe '.getAll()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually become an empty array', ->
					promise = device.getAll()
					m.chai.expect(promise).to.eventually.become([])

			describe 'given devices', ->

				beforeEach ->
					@devices = [
						{
							is_online: 0
							id: 1
							name: 'Device1'
							application: [
								{ app_name: 'MyApp' }
							]
						}
						{
							is_online: 0
							id: 1
							name: 'Device1'
							application: [
								{ app_name: 'MyApp' }
							]
						}
					]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(@devices))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually become the devices with an application_name property', ->
					promise = device.getAll()
					m.chai.expect(promise).to.eventually.become [
						{
							is_online: 0
							id: 1
							name: 'Device1'
							application_name: 'MyApp'
							application: [
								{ app_name: 'MyApp' }
							]
						}
						{
							is_online: 0
							id: 1
							name: 'Device1'
							application_name: 'MyApp'
							application: [
								{ app_name: 'MyApp' }
							]
						}
					]

		describe '.getAllByApplication()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually become an empty array', ->
					promise = device.getAllByApplication('MyApp')
					m.chai.expect(promise).to.eventually.become([])

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually return the correct number of devices', ->
					promise = device.getAllByApplication('MyApp')
					m.chai.expect(promise).to.eventually.have.length(1)

				it 'should add application_name', ->
					promise = device.getAllByApplication('MyApp')
					m.chai.expect(promise).to.eventually.become [
						id: 1
						name: 'Device1'
						application_name: 'App1'
						application: [
							app_name: 'App1'
						]
					]

		describe '.get()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should be rejected', ->
					promise = device.get('7cf02')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						uuid: '1234'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually return the device', ->
					promise = device.get('1234')
					m.chai.expect(promise).to.eventually.become
						id: 1
						name: 'Device1'
						uuid: '1234'
						application_name: 'App1'
						application: [
							app_name: 'App1'
						]

		describe '.getByName()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should be rejected', ->
					promise = device.getByName('MyDevice')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						uuid: '1234'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually return the device', ->
					promise = device.getByName('Device1')
					m.chai.expect(promise).to.eventually.become [
						id: 1
						name: 'Device1'
						uuid: '1234'
						application_name: 'App1'
						application: [
							app_name: 'App1'
						]
					]

			describe 'given multiple devices with the same name', ->

				beforeEach ->
					@devices = [
						{
							id: 1
							name: 'Device1'
							uuid: '1234'
							application: [
								app_name: 'App1'
							]
						}
						{
							id: 2
							name: 'Device1'
							uuid: '5678'
							application: [
								app_name: 'App1'
							]
						}
					]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(@devices))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually return the devices', ->
					promise = device.getByName('Device1')
					m.chai.expect(promise).to.eventually.become [
						{
							id: 1
							name: 'Device1'
							uuid: '1234'
							application_name: 'App1'
							application: [
								app_name: 'App1'
							]
						}
						{
							id: 2
							name: 'Device1'
							uuid: '5678'
							application_name: 'App1'
							application: [
								app_name: 'App1'
							]
						}
					]

		describe '.getName()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should be rejected', ->
					promise = device.getName('1234')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						uuid: '1234'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually return the device name', ->
					promise = device.getName('1234')
					m.chai.expect(promise).to.eventually.equal('Device1')

		describe '.getApplicationName()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should be rejected', ->
					promise = device.getApplicationName('7cf02')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						uuid: '1234'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually return the application name', ->
					promise = device.getApplicationName('1234')
					m.chai.expect(promise).to.eventually.equal('App1')

		describe '.has()', ->

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be false', ->
					promise = device.has('1234')
					m.chai.expect(promise).to.eventually.be.false

			describe 'given the device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						uuid: '1234'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be true', ->
					promise = device.has('1234')
					m.chai.expect(promise).to.eventually.be.true

		describe '.isOnline()', ->

			describe 'given the device does not exist', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns(Promise.reject(new errors.ResinDeviceNotFound('1234')))

				afterEach ->
					@deviceGetStub.restore()

				it 'should be rejected', ->
					promise = device.isOnline('1234')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given the device is online', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns(Promise.resolve(is_online: true))

				afterEach ->
					@deviceGetStub.restore()

				it 'should eventually be true', ->
					promise = device.isOnline('1234')
					m.chai.expect(promise).to.eventually.be.true

			describe 'given the device is not online', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns(Promise.resolve(is_online: false))

				afterEach ->
					@deviceGetStub.restore()

				it 'should eventually be false', ->
					promise = device.isOnline('1234')
					m.chai.expect(promise).to.eventually.be.false

		describe '.getLocalIPAddresses()', ->

			describe 'given the device is online', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns Promise.resolve
						is_online: true
						ip_address: '10.2.0.78 192.168.2.7'
						vpn_address: '10.2.0.78'

				afterEach ->
					@deviceGetStub.restore()

				it 'should eventually be the an array with the local ip address', ->
					promise = device.getLocalIPAddresses('1234')
					m.chai.expect(promise).to.eventually.become([ '192.168.2.7' ])

			describe 'given the device is not online', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns Promise.resolve
						is_online: false
						ip_address: '10.2.0.78 192.168.2.7'
						vpn_address: '10.2.0.78'

				afterEach ->
					@deviceGetStub.restore()

				it 'should be rejected with an error message', ->
					promise = device.getLocalIPAddresses('1234')
					m.chai.expect(promise).to.be.rejectedWith('The device is offline: 1234')

			describe 'given the device is online, but no local ip exist', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns Promise.resolve
						is_online: true
						ip_address: '10.2.0.78'
						vpn_address: '10.2.0.78'

				afterEach ->
					@deviceGetStub.restore()

				it 'should eventually become an empty array', ->
					promise = device.getLocalIPAddresses('1234')
					m.chai.expect(promise).to.eventually.become([])

			describe 'given the device is online and has multiple local ip addresses', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns Promise.resolve
						is_online: true
						ip_address: '10.2.0.78 192.168.2.7 192.168.2.10'
						vpn_address: '10.2.0.78'

				afterEach ->
					@deviceGetStub.restore()

				it 'should eventually be the an array with the local ip addresses', ->
					promise = device.getLocalIPAddresses('1234')
					m.chai.expect(promise).to.eventually.become([ '192.168.2.7', '192.168.2.10' ])

		describe '.remove()', ->

			describe 'given the device does not exist', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should reject with not found error', ->
					promise = device.remove('7cf02')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

		describe '.identify()', ->

			describe 'given the device does not exist', ->

				beforeEach ->
					@deviceHasStub = m.sinon.stub(device, 'has')
					@deviceHasStub.returns(Promise.resolve(false))

				afterEach ->
					@deviceHasStub.restore()

				it 'should be rejected', ->
					promise = device.identify('1234')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given the device exists', ->

				beforeEach ->
					@deviceHasStub = m.sinon.stub(device, 'has')
					@deviceHasStub.returns(Promise.resolve(true))

				afterEach ->
					@deviceHasStub.restore()

				describe 'given the device is offline', ->

					beforeEach (done) ->
						settings.get('apiUrl').then (apiUrl) ->
							nock(apiUrl).post('/blink').reply(404, 'No online device(s) found')
							done()

					afterEach ->
						nock.cleanAll()

					it 'should be rejected with the correct error message', ->
						promise = device.identify('1234')
						m.chai.expect(promise).to.be.rejectedWith('No online device(s) found')

				describe 'given the device is online', ->

					beforeEach (done) ->
						settings.get('apiUrl').then (apiUrl) ->
							nock(apiUrl).post('/blink').reply(200)
							done()

					afterEach ->
						nock.cleanAll()

					it 'should eventually be undefined', ->
						promise = device.identify('1234')
						m.chai.expect(promise).to.eventually.be.undefined

		describe '.move()', ->

			describe 'given an invalid device', ->

				beforeEach ->
					@deviceHasStub = m.sinon.stub(device, 'has')
					@deviceHasStub.returns(Promise.resolve(false))

				afterEach ->
					@deviceHasStub.restore()

				it 'should reject with not found error', ->
					promise = device.move('1234', 'MyApp')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given a valid device', ->

				beforeEach ->
					@deviceHasStub = m.sinon.stub(device, 'has')
					@deviceHasStub.returns(Promise.resolve(true))

				afterEach ->
					@deviceHasStub.restore()

				describe 'given a valid application', ->

					beforeEach ->
						@applicationGetStub = m.sinon.stub(application, 'get')
						@applicationGetStub.returns(Promise.resolve(id: 999))

					afterEach ->
						@applicationGetStub.restore()

					describe 'given a successful patch', ->

						beforeEach ->
							@pinePatchStub = m.sinon.stub(pine, 'patch')
							@pinePatchStub.returns(Promise.resolve())

						afterEach ->
							@pinePatchStub.restore()

						it 'should update the device application id', (done) ->
							device.move('1234', 'MyApp').then =>
								args = @pinePatchStub.getCall(0).args
								m.chai.expect(args[0].body.application).to.equal(999)
							.nodeify(done)

		describe '.restart()', ->

			describe 'given an invalid device', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should reject with not found error', ->
					promise = device.restart('1234')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

			describe 'given a valid device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						uuid: '1234'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				describe 'given a successful restart', ->

					beforeEach (done) ->
						settings.get('apiUrl').then (apiUrl) ->
							nock(apiUrl).post('/device/1/restart').reply(200)
							done()

					afterEach ->
						nock.cleanAll()

					it 'should eventually be undefined', ->
						promise = device.restart('1234')
						m.chai.expect(promise).to.eventually.be.undefined

				describe 'given an unsuccessful restart', ->

					beforeEach (done) ->
						settings.get('apiUrl').then (apiUrl) ->
							nock(apiUrl).post('/device/1/restart')
								.reply(403, 'Error restarting device')
							done()

					afterEach ->
						nock.cleanAll()

					it 'should be rejected with an error message', ->
						promise = device.restart('1234')
						m.chai.expect(promise).to.be.rejectedWith('Error restarting device')

		describe '.getDisplayName()', ->

			describe 'given device types', ->

				beforeEach ->
					@configGetDeviceTypesStub = m.sinon.stub(config, 'getDeviceTypes')
					@configGetDeviceTypesStub.returns Promise.resolve [
						{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
						{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
					]

				afterEach ->
					@configGetDeviceTypesStub.restore()

				describe 'given the device slug is valid', ->

					it 'should eventually equal the display name', ->
						promise = device.getDisplayName('raspberry-pi')
						m.chai.expect(promise).to.eventually.equal('Raspberry Pi')

				describe 'given the device slug is not valid', ->

					it 'should eventually be undefined', ->
						promise = device.getDisplayName('foo-bar')
						m.chai.expect(promise).to.eventually.be.undefined

		describe '.getDeviceSlug()', ->

			describe 'given device types', ->

				beforeEach ->
					@configGetDeviceTypesStub = m.sinon.stub(config, 'getDeviceTypes')
					@configGetDeviceTypesStub.returns Promise.resolve [
						{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
						{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
					]

				afterEach ->
					@configGetDeviceTypesStub.restore()

				describe 'given the device name is valid', ->

					it 'should eventually equal the device slug', ->
						promise = device.getDeviceSlug('Raspberry Pi')
						m.chai.expect(promise).to.eventually.equal('raspberry-pi')

				describe 'given the device name is not valid', ->

					it 'should eventually be undefined', ->
						promise = device.getDeviceSlug('Foo Bar')
						m.chai.expect(promise).to.eventually.be.undefined

				describe 'given a slug', ->

					it 'should return the device that matches the slug', ->
						promise = device.getDeviceSlug('raspberry-pi')
						m.chai.expect(promise).to.eventually.equal('raspberry-pi')

		describe '.getSupportedDeviceTypes()', ->

			describe 'given device types', ->

				beforeEach ->
					@configGetDeviceTypesStub = m.sinon.stub(config, 'getDeviceTypes')
					@configGetDeviceTypesStub.returns Promise.resolve [
						{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
						{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
					]

				afterEach ->
					@configGetDeviceTypesStub.restore()

				it 'should eventually become an array of names', ->
					promise = device.getSupportedDeviceTypes()
					m.chai.expect(promise).to.eventually.become([ 'Raspberry Pi', 'BeagleBone Black' ])

		describe '.getManifestBySlug()', ->

			describe 'given device types', ->

				beforeEach ->
					@configGetDeviceTypesStub = m.sinon.stub(config, 'getDeviceTypes')
					@configGetDeviceTypesStub.returns Promise.resolve [
						{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
						{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
					]

				afterEach ->
					@configGetDeviceTypesStub.restore()

				it 'should be rejected if no slug', ->
					promise = device.getManifestBySlug('foo-bar')
					m.chai.expect(promise).to.be.rejectedWith('Unsupported device: foo-bar')

				it 'should eventually become the manifest if slug is valid', ->
					promise = device.getManifestBySlug('raspberry-pi')
					m.chai.expect(promise).to.eventually.become
						name: 'Raspberry Pi'
						slug: 'raspberry-pi'

		describe '.getManifestByApplication()', ->

			describe 'given device types', ->

				beforeEach ->
					@configGetDeviceTypesStub = m.sinon.stub(config, 'getDeviceTypes')
					@configGetDeviceTypesStub.returns Promise.resolve [
						{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
						{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
					]

				afterEach ->
					@configGetDeviceTypesStub.restore()

				describe 'given the app exists', ->

					beforeEach ->
						@applicationGetStub = m.sinon.stub(application, 'get')
						@applicationGetStub.returns Promise.resolve
							name: 'MyApp'
							device_type: 'raspberry-pi'

					afterEach ->
						@applicationGetStub.restore()

					it 'should eventually become the manifest', ->
						promise = device.getManifestByApplication('MyApp')
						m.chai.expect(promise).to.eventually.become
							name: 'Raspberry Pi'
							slug: 'raspberry-pi'

		describe '.generateUUID()', ->

			it 'should return a string', ->
				promise = device.generateUUID()
				m.chai.expect(promise).to.eventually.be.a('string')

			it 'should have a length of 62 (31 bytes)', ->
				promise = device.generateUUID()
				m.chai.expect(promise).to.eventually.have.length(62)

			it 'should generate different uuids each time', (done) ->
				Promise.props
					one: device.generateUUID()
					two: device.generateUUID()
					three: device.generateUUID()
				.then (uuids) ->
					m.chai.expect(uuids.one).to.not.equal(uuids.two)
					m.chai.expect(uuids.two).to.not.equal(uuids.three)
					m.chai.expect(uuids.three).to.not.equal(uuids.one)
				.nodeify(done)

		describe '.register()', ->

			describe 'given the user is not logged in', ->

				beforeEach ->
					auth.logout()

				describe 'given the application exists', ->

					beforeEach ->
						@applicationGetApiKeyStub = m.sinon.stub(application, 'getApiKey')
						@applicationGetApiKeyStub.returns(Promise.resolve('asdf'))

						@applicationGetStub = m.sinon.stub(application, 'get')
						@applicationGetStub.returns Promise.resolve
							id: 999
							device_type: 'raspberry-pi'

					afterEach ->
						@applicationGetApiKeyStub.restore()
						@applicationGetStub.restore()

					it 'should be rejected with a not logged in error', ->
						uuid = device.generateUUID()
						promise = device.register('MyApp', uuid)
						m.chai.expect(promise).to.be.rejectedWith(errors.ResinNotLoggedIn)

			describe 'given a logged in user', ->

				beforeEach ->
					auth.loginWithToken(johnDoeFixture.token)

				describe 'given the app does not exist', ->

					beforeEach ->
						@applicationGetApiKeyStub = m.sinon.stub(application, 'getApiKey')
						@applicationGetApiKeyStub.returns(Promise.reject(new errors.ResinApplicationNotFound('MyApp')))

						@applicationGetStub = m.sinon.stub(application, 'get')
						@applicationGetStub.returns(Promise.reject(new errors.ResinApplicationNotFound('MyApp')))

					afterEach ->
						@applicationGetApiKeyStub.restore()
						@applicationGetStub.restore()

					it 'should be rejected with an application not found error', ->
						uuid = device.generateUUID()
						promise = device.register('MyApp', uuid)
						m.chai.expect(promise).to.be.rejectedWith(errors.ResinApplicationNotFound)

		describe '.hasDeviceUrl()', ->

			describe 'given a device that is web accessible', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns Promise.resolve [
						id: 1
						name: 'Device1'
						application: [
							{ app_name: 'MyApp' }
						]
						is_web_accessible: true
					]

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be true', ->
					promise = device.hasDeviceUrl('asdf')
					m.chai.expect(promise).to.eventually.be.true

			describe 'given a device that is not web accessible', ->

				beforeEach ->
					@pineGetStub = m.sinon.stub(pine, 'get')
					@pineGetStub.returns Promise.resolve [
						id: 1
						name: 'Device1'
						application: [
							{ app_name: 'MyApp' }
						]
						is_web_accessible: false
					]

				afterEach ->
					@pineGetStub.restore()

				it 'should eventually be false', ->
					promise = device.hasDeviceUrl('asdf')
					m.chai.expect(promise).to.eventually.be.false

		describe '.getDeviceUrl()', ->

			describe 'given a device that is not web accessible', ->

				beforeEach ->
					@deviceHasDeviceUrlStub = m.sinon.stub(device, 'hasDeviceUrl')
					@deviceHasDeviceUrlStub.returns(Promise.resolve(false))

				afterEach ->
					@deviceHasDeviceUrlStub.restore()

				it 'should be rejected with an error', ->
					promise = device.getDeviceUrl('asdf')
					m.chai.expect(promise).to.be.rejectedWith('Device is not web accessible: asdf')

			describe 'given a device that is web accessible', ->

				beforeEach ->
					@deviceHasDeviceUrlStub = m.sinon.stub(device, 'hasDeviceUrl')
					@deviceHasDeviceUrlStub.returns(Promise.resolve(true))

				afterEach ->
					@deviceHasDeviceUrlStub.restore()

				describe 'given a working /config endpoint', ->

					beforeEach ->
						@configModelGetAllStub = m.sinon.stub(config, 'getAll')
						@configModelGetAllStub.returns Promise.resolve
							deviceUrlsBase: 'resindevice.io'

					afterEach ->
						@configModelGetAllStub.restore()

					it 'should return the device url', ->
						promise = device.getDeviceUrl('asdf')
						m.chai.expect(promise).to.eventually.equal('https://asdf.resindevice.io')
