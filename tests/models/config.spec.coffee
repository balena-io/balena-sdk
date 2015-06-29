m = require('mochainon')
Promise = require('bluebird')
nock = require('nock')
settings = require('../../lib/settings')
config = require('../../lib/models/config')

describe 'Config Model:', ->

	describe '.getAll()', ->

		describe 'given valid config', ->

			beforeEach (done) ->
				settings.get('remoteUrl').then (remoteUrl) ->
					nock(remoteUrl).get('/config').reply 200,
						hello: 'world'
					done()

			afterEach ->
				nock.cleanAll()

			it 'should eventually become the configuration', ->
				promise = config.getAll()
				m.chai.expect(promise).to.eventually.become(hello: 'world')

	describe '.getPubNubKeys()', ->

		describe 'given a configuration with pubnub keys', ->

			beforeEach ->
				@configGetAllStub = m.sinon.stub(config, 'getAll')
				@configGetAllStub.returns Promise.resolve
					pubnub:
						subscribe_key: 'subscribe'
						publish_key: 'publish'

			afterEach ->
				@configGetAllStub.restore()

			it 'should eventually become the pubnub keys', ->
				promise = config.getPubNubKeys()
				m.chai.expect(promise).to.eventually.become
					subscribe_key: 'subscribe'
					publish_key: 'publish'

		describe 'given a configuration without pubnub keys', ->

			beforeEach ->
				@configGetAllStub = m.sinon.stub(config, 'getAll')
				@configGetAllStub.returns(Promise.resolve({}))

			afterEach ->
				@configGetAllStub.restore()

			it 'should reject with an error message', ->
				promise = config.getPubNubKeys()
				m.chai.expect(promise).to.be.rejectedWith('No pubnub keys')

	describe '.getDeviceTypes()', ->

		describe 'given a configuration with device types', ->

			beforeEach ->
				@configGetAllStub = m.sinon.stub(config, 'getAll')
				@configGetAllStub.returns Promise.resolve
					deviceTypes: [
						{ slug: 'raspberry-pi' }
						{ slug: 'intel-edison' }
					]

			afterEach ->
				@configGetAllStub.restore()

			it 'should eventually become the device types', ->
				promise = config.getDeviceTypes()
				m.chai.expect(promise).to.eventually.become [
					{ slug: 'raspberry-pi' }
					{ slug: 'intel-edison' }
				]
		describe 'given a configuration without device types', ->

			beforeEach ->
				@configGetAllStub = m.sinon.stub(config, 'getAll')
				@configGetAllStub.returns(Promise.resolve({}))

			afterEach ->
				@configGetAllStub.restore()

			it 'should reject with an error message', ->
				promise = config.getDeviceTypes()
				m.chai.expect(promise).to.be.rejectedWith('No device types')
