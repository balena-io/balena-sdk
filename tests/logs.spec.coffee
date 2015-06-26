m = require('mochainon')
Promise = require('bluebird')
deviceLogs = require('resin-device-logs')
errors = require('resin-errors')
logs = require('../lib/logs')
device = require('../lib/models/device')
config = require('../lib/models/config')

describe 'Logs:', ->

	describe '.subscribe()', ->

		describe 'given pubnub keys', ->

			beforeEach ->
				@configGetPubNubKeysStub = m.sinon.stub(config, 'getPubNubKeys')
				@configGetPubNubKeysStub.returns Promise.resolve
					publish_key: 'publish'
					subscribe_key: 'subscribe'

			afterEach ->
				@configGetPubNubKeysStub.restore()

			describe 'given the device does not exist', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns(Promise.reject(new errors.ResinDeviceNotFound('MyDevice')))

				afterEach ->
					@deviceGetStub.restore()

				it 'should be rejected', ->
					promise = logs.subscribe('MyDevice')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

		describe 'given the device exists', ->

			beforeEach ->
				@deviceGetStub = m.sinon.stub(device, 'get')
				@deviceGetStub.returns Promise.resolve
					uuid: 'asdfasdf'

			afterEach ->
				@deviceGetStub.restore()

			describe 'given no pubnub keys', ->

				beforeEach ->
					@configGetPubNubKeysStub = m.sinon.stub(config, 'getPubNubKeys')
					@configGetPubNubKeysStub.returns(Promise.reject('config error'))

				afterEach ->
					@configGetPubNubKeysStub.restore()

				it 'should be rejected with the error message', ->
					promise = logs.subscribe('MyDevice')
					m.chai.expect(promise).to.be.rejectedWith('config error')

	describe '.history()', ->

		describe 'given pubnub keys', ->

			beforeEach ->
				@configGetPubNubKeysStub = m.sinon.stub(config, 'getPubNubKeys')
				@configGetPubNubKeysStub.returns Promise.resolve
					publish_key: 'publish'
					subscribe_key: 'subscribe'

			afterEach ->
				@configGetPubNubKeysStub.restore()

			describe 'given the device does not exist', ->

				beforeEach ->
					@deviceGetStub = m.sinon.stub(device, 'get')
					@deviceGetStub.returns(Promise.reject(new errors.ResinDeviceNotFound('MyDevice')))

				afterEach ->
					@deviceGetStub.restore()

				it 'should be rejected', ->
					promise = logs.history('MyDevice')
					m.chai.expect(promise).to.be.rejectedWith(errors.ResinDeviceNotFound)

		describe 'given the device exists', ->

			beforeEach ->
				@deviceGetStub = m.sinon.stub(device, 'get')
				@deviceGetStub.returns Promise.resolve
					uuid: 'asdfasdf'

			afterEach ->
				@deviceGetStub.restore()

			describe 'given no pubnub keys', ->

				beforeEach ->
					@configGetPubNubKeysStub = m.sinon.stub(config, 'getPubNubKeys')
					@configGetPubNubKeysStub.returns(Promise.reject('config error'))

				afterEach ->
					@configGetPubNubKeysStub.restore()

				it 'should be rejected with the error message', ->
					promise = logs.history('MyDevice')
					m.chai.expect(promise).to.be.rejectedWith('config error')
