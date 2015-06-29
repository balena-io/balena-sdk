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

describe 'Device Model:', ->

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
					settings.get('remoteUrl').then (remoteUrl) ->
						nock(remoteUrl).post('/blink').reply(404, 'No online device(s) found')
						done()

				afterEach ->
					nock.cleanAll()

				it 'should be rejected with the correct error message', ->
					promise = device.identify('1234')
					m.chai.expect(promise).to.be.rejectedWith('No online device(s) found')

			describe 'given the device is online', ->

				beforeEach (done) ->
					settings.get('remoteUrl').then (remoteUrl) ->
						nock(remoteUrl).post('/blink').reply(200)
						done()

				afterEach ->
					nock.cleanAll()

				it 'should eventually be undefined', ->
					promise = device.identify('1234')
					m.chai.expect(promise).to.eventually.be.undefined

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

	describe '.generateUUID()', ->

		it 'should return a string', ->
			uuid = device.generateUUID()
			m.chai.expect(uuid).to.be.a('string')

		it 'should have a length of 62 (31 bytes)', ->
			uuid = device.generateUUID()
			m.chai.expect(uuid).to.have.length(62)

		it 'should generate different uuids each time', ->
			uuid1 = device.generateUUID()
			uuid2 = device.generateUUID()
			uuid3 = device.generateUUID()

			m.chai.expect(uuid1).to.not.equal(uuid2)
			m.chai.expect(uuid2).to.not.equal(uuid3)
			m.chai.expect(uuid3).to.not.equal(uuid1)
