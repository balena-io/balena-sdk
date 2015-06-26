m = require('mochainon')
_ = require('lodash')
Promise = require('bluebird')
errors = require('resin-errors')
pine = require('resin-pine')
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

			it 'should return an empty array', (done) ->
				device.getAll (error, devices) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(devices).to.deep.equal([])
					done()

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

			it 'should return the devices', (done) ->
				device.getAll (error, devices) =>
					m.chai.expect(error).to.not.exist
					m.chai.expect(devices).to.deep.equal(@devices)
					done()

	describe '.getAllByApplication()', ->

		describe 'given no devices', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return an error', (done) ->
				device.getAllByApplication 'MyApp', (error, devices) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(devices).to.deep.equal([])
					done()

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

			it 'should return the correct number of devices', (done) ->
				device.getAllByApplication 'MyApp', (error, devices) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(devices).to.have.length(1)
					done()

			it 'should add application_name', (done) ->
				device.getAllByApplication 'MyApp', (error, devices) =>
					m.chai.expect(devices[0].application_name).to.equal(@device.application[0].app_name)
					done()

	describe '.get()', ->

		describe 'given no devices', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return an error', (done) ->
				device.get '7cf02', (error, device) ->
					m.chai.expect(error).to.be.an.instanceof(errors.ResinDeviceNotFound)
					m.chai.expect(device).to.not.exist
					done()

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

			it 'should return the device', (done) ->
				device.get '1234', (error, device) =>
					m.chai.expect(error).to.not.exist
					m.chai.expect(device).to.deep.equal(@device)
					done()

			it 'should add application_name', (done) ->
				device.get '1234', (error, device) =>
					m.chai.expect(device.application_name).to.equal(@device.application[0].app_name)
					done()

	describe '.has()', ->

		describe 'given no devices', ->

			beforeEach ->
				@pineGetStub = m.sinon.stub(pine, 'get')
				@pineGetStub.returns(Promise.resolve([]))

			afterEach ->
				@pineGetStub.restore()

			it 'should return false', (done) ->
				device.has '1234', (error, hasDevice) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(hasDevice).to.be.false
					done()

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

			it 'should return true', (done) ->
				device.has '1234', (error, hasDevice) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(hasDevice).to.be.true
					done()

	describe '.isOnline()', ->

		describe 'given the device does not exist', ->

			beforeEach ->
				@deviceGetStub = m.sinon.stub(device, 'get')
				@deviceGetStub.returns(Promise.reject(new errors.ResinDeviceNotFound('1234')))

			afterEach ->
				@deviceGetStub.restore()

			it 'should return an error', (done) ->
				device.isOnline '1234', (error, isOnline) ->
					m.chai.expect(error).to.be.an.instanceof(errors.ResinDeviceNotFound)
					m.chai.expect(isOnline).to.not.exist
					done()

		describe 'given the device is online', ->

			beforeEach ->
				@deviceGetStub = m.sinon.stub(device, 'get')
				@deviceGetStub.returns(Promise.resolve(is_online: true))

			afterEach ->
				@deviceGetStub.restore()

			it 'should return true', (done) ->
				device.isOnline '1234', (error, isOnline) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(isOnline).to.be.true
					done()

		describe 'given the device is not online', ->

			beforeEach ->
				@deviceGetStub = m.sinon.stub(device, 'get')
				@deviceGetStub.returns(Promise.resolve(is_online: false))

			afterEach ->
				@deviceGetStub.restore()

			it 'should return false', (done) ->
				device.isOnline '1234', (error, isOnline) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(isOnline).to.be.false
					done()

	describe '.note()', ->

		describe 'given the device was not found', ->

			beforeEach ->
				@deviceHasStub = m.sinon.stub(device, 'has')
				@deviceHasStub.returns(Promise.resolve(false))

			afterEach ->
				@deviceHasStub.restore()

			it 'should return an error', (done) ->
				device.note '1234', 'Hello World', (error) ->
					m.chai.expect(error).to.be.an.instanceof(errors.ResinDeviceNotFound)
					done()

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

				it 'should return the display name', (done) ->

					device.getDisplayName 'raspberry-pi', (error, displayName) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(displayName).to.equal('Raspberry Pi')
						done()

			describe 'given the device slug is not valid', ->

				it 'should return undefined', (done) ->

					device.getDisplayName 'foo-bar', (error, displayName) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(displayName).to.be.undefined
						done()

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

				it 'should return the device slug', (done) ->

					device.getDeviceSlug 'Raspberry Pi', (error, slug) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(slug).to.equal('raspberry-pi')
						done()

			describe 'given the device name is not valid', ->

				it 'should return undefined', (done) ->

					device.getDeviceSlug 'Foo Bar', (error, slug) ->
						m.chai.expect(error).to.not.exist
						m.chai.expect(slug).to.be.undefined
						done()

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

			it 'should return an array of names', (done) ->
				device.getSupportedDeviceTypes (error, deviceTypes) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(deviceTypes).to.deep.equal([ 'Raspberry Pi', 'BeagleBone Black' ])
					done()

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

			it 'should return an error if no slug', (done) ->
				device.getManifestBySlug 'foo-bar', (error, manifest) ->
					m.chai.expect(error).to.be.an.instanceof(Error)
					m.chai.expect(error.message).to.equal('Unsupported device: foo-bar')
					m.chai.expect(manifest).to.not.exist
					done()

			it 'should return the manifest if slug is valid', (done) ->
				device.getManifestBySlug 'raspberry-pi', (error, manifest) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(manifest).to.deep.equal
						name: 'Raspberry Pi'
						slug: 'raspberry-pi'
					done()

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
