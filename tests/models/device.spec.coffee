_ = require('lodash')
sinon = require('sinon')
chai = require('chai')
chai.use(require('sinon-chai'))
expect = chai.expect
Promise = require('bluebird')
errors = require('resin-errors')
pine = require('resin-pine')
token = require('resin-token')
device = require('../../lib/models/device')
application = require('../../lib/models/application')
config = require('../../lib/models/config')

describe 'Device Model:', ->

	describe '.getAll()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return an empty array', (done) ->
					device.getAll (error, devices) ->
						expect(error).to.not.exist
						expect(devices).to.deep.equal([])
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

					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve(@devices))

				afterEach ->
					@pineGetStub.restore()

				it 'should return the devices', (done) ->
					device.getAll (error, devices) =>
						expect(error).to.not.exist
						expect(devices).to.deep.equal(@devices)
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.getAll (error, devices) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(devices).to.not.exist
					done()

	describe '.getAllByApplication()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return an error', (done) ->
					device.getAllByApplication 'MyApp', (error, devices) ->
						expect(error).to.not.exist
						expect(devices).to.deep.equal([])
						done()

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return the correct number of devices', (done) ->
					device.getAllByApplication 'MyApp', (error, devices) ->
						expect(error).to.not.exist
						expect(devices).to.have.length(1)
						done()

				it 'should add application_name', (done) ->
					device.getAllByApplication 'MyApp', (error, devices) =>
						expect(devices[0].application_name).to.equal(@device.application[0].app_name)
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.getAllByApplication 'MyApp', (error, devices) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(devices).to.not.exist
					done()

	describe '.get()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return an error', (done) ->
					device.get 'MyDevice', (error, device) ->
						expect(error).to.be.an.instanceof(errors.ResinDeviceNotFound)
						expect(device).to.not.exist
						done()

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return the device', (done) ->
					device.get 'MyDevice', (error, device) =>
						expect(error).to.not.exist
						expect(device).to.deep.equal(@device)
						done()

				it 'should add application_name', (done) ->
					device.get 'MyDevice', (error, device) =>
						expect(device.application_name).to.equal(@device.application[0].app_name)
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.get 'MyDevice', (error, devices) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(devices).to.not.exist
					done()

	describe '.has()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given no devices', ->

				beforeEach ->
					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return false', (done) ->
					device.has 'MyDevice', (error, hasDevice) ->
						expect(error).to.not.exist
						expect(hasDevice).to.be.false
						done()

			describe 'given a device', ->

				beforeEach ->
					@device =
						id: 1
						name: 'Device1'
						application: [
							app_name: 'App1'
						]

					@pineGetStub = sinon.stub(pine, 'get')
					@pineGetStub.returns(Promise.resolve([ @device ]))

				afterEach ->
					@pineGetStub.restore()

				it 'should return true', (done) ->
					device.has 'Device1', (error, hasDevice) ->
						expect(error).to.not.exist
						expect(hasDevice).to.be.true
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.has 'Device1', (error, hasDevice) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(hasDevice).to.not.exist
					done()

	describe '.isOnline()', ->

		describe 'given the device does not exist', ->

			beforeEach ->
				@deviceGetStub = sinon.stub(device, 'get')
				@deviceGetStub.returns(Promise.reject(new errors.ResinDeviceNotFound('device')))

			afterEach ->
				@deviceGetStub.restore()

			it 'should return an error', (done) ->
				device.isOnline 'MyDevice', (error, isOnline) ->
					expect(error).to.be.an.instanceof(errors.ResinDeviceNotFound)
					expect(isOnline).to.not.exist
					done()

		describe 'given the device is online', ->

			beforeEach ->
				@deviceGetStub = sinon.stub(device, 'get')
				@deviceGetStub.returns(Promise.resolve(is_online: true))

			afterEach ->
				@deviceGetStub.restore()

			it 'should return true', (done) ->
				device.isOnline 'MyDevice', (error, isOnline) ->
					expect(error).to.not.exist
					expect(isOnline).to.be.true
					done()

		describe 'given the device is not online', ->

			beforeEach ->
				@deviceGetStub = sinon.stub(device, 'get')
				@deviceGetStub.returns(Promise.resolve(is_online: false))

			afterEach ->
				@deviceGetStub.restore()

			it 'should return false', (done) ->
				device.isOnline 'MyDevice', (error, isOnline) ->
					expect(error).to.not.exist
					expect(isOnline).to.be.false
					done()

	describe '.remove()', ->

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.remove 'MyDevice', (error, devices) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(devices).to.not.exist
					done()

	describe '.identify()', ->

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.identify 'uuid', (error, devices) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(devices).to.not.exist
					done()

	describe '.rename()', ->

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.rename 'MyDevice', 'NewDevice', (error) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					done()

	describe '.note()', ->

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.note 'MyDevice', 'Note', (error) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					done()

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given the device was not found', ->

				beforeEach ->
					@deviceHasStub = sinon.stub(device, 'has')
					@deviceHasStub.returns(Promise.resolve(false))

				afterEach ->
					@deviceHasStub.restore()

				it 'should return an error', (done) ->
					device.note 'MyDevice', 'Hello World', (error) ->
						expect(error).to.be.an.instanceof(errors.ResinDeviceNotFound)
						done()

	describe '.register()', ->

		describe 'given there was an error getting the application configuration', ->

			beforeEach ->
				@applicationGetConfigurationStub = sinon.stub(application, 'getConfiguration')
				@applicationGetConfigurationStub.returns(Promise.reject(new Error('pine error')))

			afterEach ->
				@applicationGetConfigurationStub.restore()

			it 'should yield an error to the callback', (done) ->
				device.register 'MyApp', null, (error, device) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('pine error')
					expect(device).to.not.exist
					done()

		describe 'given we got valid application configuration', ->

			beforeEach ->
				@applicationGetConfigurationStub = sinon.stub(application, 'getConfiguration')
				@applicationGetConfigurationStub.returns Promise.resolve
					userId: 199
					applicationId: 10350
					deviceType: 'raspberry-pi'
					uuid: 'asdf'
					apiKey: 'asdf'

			afterEach ->
				@applicationGetConfigurationStub.restore()

			describe 'given the post operation is unsuccessful', ->

				beforeEach ->
					@pinePostStub = sinon.stub(pine, 'post')
					@pinePostStub.returns(Promise.reject(new Error('pine error')))

				afterEach ->
					@pinePostStub.restore()

				it 'should yield an error to the callback', (done) ->
					device.register 'MyApp', null, (error, device) ->
						expect(error).to.be.an.instanceof(Error)
						expect(error.message).to.equal('pine error')
						expect(device).to.not.exist
						done()

			describe 'given the post operation is successful', ->

				beforeEach ->
					@pinePostStub = sinon.stub(pine, 'post')
					@pinePostStub.returns Promise.resolve
						id: 999
						userId: 199
						applicationId: 10350
						deviceType: 'raspberry-pi'
						uuid: 'asdf'
						apiKey: 'asdf'

				afterEach ->
					@pinePostStub.restore()

				it 'should return the resulting uuid and id', (done) ->
					device.register 'MyApp', null, (error, device) ->
						expect(error).to.not.exist
						expect(device.id).to.equal(999)
						expect(device.uuid).to.equal('asdf')
						done()

	describe 'isValidUUID()', ->

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given the uuid exists', ->

				beforeEach ->
					@deviceGetAllStub = sinon.stub(device, 'getAll')
					@deviceGetAllStub.returns(Promise.resolve([ uuid: '1234' ]))

				afterEach ->
					@deviceGetAllStub.restore()

				it 'should return true', (done) ->
					device.isValidUUID '1234', (error, isValidUUID) ->
						expect(error).to.not.exist
						expect(isValidUUID).to.be.true
						done()

			describe 'given the uuid does not exists', ->

				beforeEach ->
					@deviceGetAllStub = sinon.stub(device, 'getAll')
					@deviceGetAllStub.returns(Promise.resolve([ uuid: '5678' ]))

				afterEach ->
					@deviceGetAllStub.restore()

				it 'should return false', (done) ->
					device.isValidUUID '1234', (error, isValidUUID) ->
						expect(error).to.not.exist
						expect(isValidUUID).to.be.false
						done()

		describe 'given no logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns(undefined)

			afterEach ->
				@tokenGetUsernameStub.restore()

			it 'should return an error', (done) ->
				device.isValidUUID 'uuid', (error, devices) ->
					expect(error).to.be.an.instanceof(errors.ResinNotLoggedIn)
					expect(devices).to.not.exist
					done()

	describe '.getDisplayName()', ->

		describe 'given device types', ->

			beforeEach ->
				@configGetDeviceTypesStub = sinon.stub(config, 'getDeviceTypes')
				@configGetDeviceTypesStub.returns Promise.resolve [
					{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
					{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
				]

			afterEach ->
				@configGetDeviceTypesStub.restore()

			describe 'given the device slug is valid', ->

				it 'should return the display name', (done) ->

					device.getDisplayName 'raspberry-pi', (error, displayName) ->
						expect(error).to.not.exist
						expect(displayName).to.equal('Raspberry Pi')
						done()

			describe 'given the device slug is not valid', ->

				it 'should return undefined', (done) ->

					device.getDisplayName 'foo-bar', (error, displayName) ->
						expect(error).to.not.exist
						expect(displayName).to.be.undefined
						done()

	describe '.getDeviceSlug()', ->

		describe 'given device types', ->

			beforeEach ->
				@configGetDeviceTypesStub = sinon.stub(config, 'getDeviceTypes')
				@configGetDeviceTypesStub.returns Promise.resolve [
					{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
					{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
				]

			afterEach ->
				@configGetDeviceTypesStub.restore()

			describe 'given the device name is valid', ->

				it 'should return the device slug', (done) ->

					device.getDeviceSlug 'Raspberry Pi', (error, slug) ->
						expect(error).to.not.exist
						expect(slug).to.equal('raspberry-pi')
						done()

			describe 'given the device name is not valid', ->

				it 'should return undefined', (done) ->

					device.getDeviceSlug 'Foo Bar', (error, slug) ->
						expect(error).to.not.exist
						expect(slug).to.be.undefined
						done()

	describe '.getSupportedDeviceTypes()', ->

		describe 'given device types', ->

			beforeEach ->
				@configGetDeviceTypesStub = sinon.stub(config, 'getDeviceTypes')
				@configGetDeviceTypesStub.returns Promise.resolve [
					{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
					{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
				]

			afterEach ->
				@configGetDeviceTypesStub.restore()

			it 'should return an array of names', (done) ->
				device.getSupportedDeviceTypes (error, deviceTypes) ->
					expect(error).to.not.exist
					expect(deviceTypes).to.deep.equal([ 'Raspberry Pi', 'BeagleBone Black' ])
					done()

	describe '.getManifestBySlug()', ->

		describe 'given device types', ->

			beforeEach ->
				@configGetDeviceTypesStub = sinon.stub(config, 'getDeviceTypes')
				@configGetDeviceTypesStub.returns Promise.resolve [
					{ name: 'Raspberry Pi', slug: 'raspberry-pi' }
					{ name: 'BeagleBone Black', slug: 'beaglebone-black' }
				]

			afterEach ->
				@configGetDeviceTypesStub.restore()

			it 'should return an error if no slug', (done) ->
				device.getManifestBySlug 'foo-bar', (error, manifest) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Unsupported device: foo-bar')
					expect(manifest).to.not.exist
					done()

			it 'should return the manifest if slug is valid', (done) ->
				device.getManifestBySlug 'raspberry-pi', (error, manifest) ->
					expect(error).to.not.exist
					expect(manifest).to.deep.equal
						name: 'Raspberry Pi'
						slug: 'raspberry-pi'
					done()

	describe '.generateUUID()', ->

		it 'should return a string', ->
			uuid = device.generateUUID()
			expect(uuid).to.be.a('string')

		it 'should have a length of 62 (31 bytes)', ->
			uuid = device.generateUUID()
			expect(uuid).to.have.length(62)

		it 'should generate different uuids each time', ->
			uuid1 = device.generateUUID()
			uuid2 = device.generateUUID()
			uuid3 = device.generateUUID()

			expect(uuid1).to.not.equal(uuid2)
			expect(uuid2).to.not.equal(uuid3)
			expect(uuid3).to.not.equal(uuid1)
