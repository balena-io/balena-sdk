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

describe 'Device Model:', ->

	describe '.getAll()', ->

		it 'should throw if not callback', ->
			expect ->
				device.getAll(null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.getAll([ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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
					device.getAll (error, devices) ->
						expect(error).to.be.an.instanceof(errors.ResinNotAny)
						expect(devices).to.not.exist
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

		it 'should throw if no name', ->
			expect ->
				device.getAllByApplication(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				device.getAllByApplication([ 'MyApp' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.getAllByApplication('MyApp', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.getAllByApplication('MyApp', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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
						expect(error).to.be.an.instanceof(errors.ResinNotAny)
						expect(devices).to.not.exist
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

		it 'should throw if no name', ->
			expect ->
				device.get(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				device.get([ 'MyDevice' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.get('MyDevice', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.get('MyDevice', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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

		it 'should throw if no name', ->
			expect ->
				device.has(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				device.has([ 'MyDevice' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.has('MyDevice', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.has('MyDevice', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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

	describe '.remove()', ->

		it 'should throw if no name', ->
			expect ->
				device.remove(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				device.remove([ 'MyDevice' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.remove('MyDevice', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.remove('MyDevice', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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

		it 'should throw if no uuid', ->
			expect ->
				device.identify(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if uuid is not a string', ->
			expect ->
				device.identify([ 'uuid' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.identify('uuid', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.identify('uuid', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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

		it 'should throw if no name', ->
			expect ->
				device.rename(null, 'NewDevice', _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				device.rename([ 'MyDevice' ], 'NewDevice', _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if no new name', ->
			expect ->
				device.rename('MyDevice', null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if new name is not a string', ->
			expect ->
				device.rename('MyDevice', [ 'NewDevice' ],  _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.rename('MyDevice', 'NewDevice', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.rename('MyDevice', 'NewDevice', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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

		it 'should throw if no name', ->
			expect ->
				device.rename(null, 'Note', _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if name is not a string', ->
			expect ->
				device.rename([ 'MyDevice' ], 'Note', _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if no note', ->
			expect ->
				device.rename('MyDevice', null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if note is not a string', ->
			expect ->
				device.rename('MyDevice', [ 'Note' ],  _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.rename('MyDevice', 'Note', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.rename('MyDevice', 'Note', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

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

	describe 'isValidUUID()', ->

		it 'should throw if no uuid', ->
			expect ->
				device.isValidUUID(null, _.noop)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if uuid is not a string', ->
			expect ->
				device.isValidUUID([ 'uuid' ], _.noop)
			.to.throw(errors.ResinInvalidParameter)

		it 'should throw if not callback', ->
			expect ->
				device.isValidUUID('uuid', null)
			.to.throw(errors.ResinMissingParameter)

		it 'should throw if callback is not a function', ->
			expect ->
				device.isValidUUID('uuid', [ _.noop ])
			.to.throw(errors.ResinInvalidParameter)

		describe 'given a logged in user', ->

			beforeEach ->
				@tokenGetUsernameStub = sinon.stub(token, 'getUsername')
				@tokenGetUsernameStub.returns('johndoe')

			afterEach ->
				@tokenGetUsernameStub.restore()

			describe 'given the uuid exists', ->

				beforeEach ->
					@deviceGetAllStub = sinon.stub(device, 'getAll')
					@deviceGetAllStub.yields null, [
						{ uuid: '1234' }
					]

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
					@deviceGetAllStub.yields null, [
						{ uuid: '5678' }
					]

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
