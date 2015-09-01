m = require('mochainon')
Promise = require('bluebird')
nock = require('nock')
settings = require('../../lib/settings')
device = require('../../lib/models/device')
config = require('../../lib/models/config')
johnDoeFixture = require('../tokens.json').johndoe

describe 'Config Model:', ->

	describe 'given a /whoami endpoint', ->

		beforeEach (done) ->
			settings.get('remoteUrl').then (remoteUrl) ->
				nock(remoteUrl).get('/whoami').reply(200, johnDoeFixture.token)
				done()

		afterEach ->
			nock.cleanAll()

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

		describe '.getMixpanelToken()', ->

			describe 'given a configuration with a mixpanel token', ->

				beforeEach ->
					@configGetAllStub = m.sinon.stub(config, 'getAll')
					@configGetAllStub.returns Promise.resolve
						mixpanelToken: 'asdf'

				afterEach ->
					@configGetAllStub.restore()

				it 'should eventually be the mixpanel token', ->
					promise = config.getMixpanelToken()
					m.chai.expect(promise).to.eventually.equal('asdf')

			describe 'given a configuration without a mixpanel token', ->

				beforeEach ->
					@configGetAllStub = m.sinon.stub(config, 'getAll')
					@configGetAllStub.returns(Promise.resolve({}))

				afterEach ->
					@configGetAllStub.restore()

				it 'should reject with an error message', ->
					promise = config.getMixpanelToken()
					m.chai.expect(promise).to.be.rejectedWith('No mixpanel token')

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

		describe '.getDeviceOptions()', ->

			describe 'given a manifest with configuration options', ->

				beforeEach ->
					@deviceGetManifestBySlugStub = m.sinon.stub(device, 'getManifestBySlug')
					@deviceGetManifestBySlugStub.returns Promise.resolve
						options: [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
						]

				afterEach ->
					@deviceGetManifestBySlugStub.restore()

				it 'should become the configuration options', ->
					promise = config.getDeviceOptions('mydevicetype')
					m.chai.expect(promise).to.become [
						message: 'Processor'
						name: 'processorType'
						type: 'list'
						choices: [ 'Z7010', 'Z7020' ]
					,
						message: 'Coprocessor cores'
						name: 'coprocessorCore'
						type: 'list'
						choices: [ '16', '64' ]
					]

			describe 'given a manifest with initialization options', ->

				beforeEach ->
					@deviceGetManifestBySlugStub = m.sinon.stub(device, 'getManifestBySlug')
					@deviceGetManifestBySlugStub.returns Promise.resolve
						initialization:
							options: [
								message: 'Select a drive'
								type: 'drive'
								name: 'drive'
							]

				afterEach ->
					@deviceGetManifestBySlugStub.restore()

				it 'should become the initialization options', ->
					promise = config.getDeviceOptions('mydevicetype')
					m.chai.expect(promise).to.become [
						message: 'Select a drive'
						type: 'drive'
						name: 'drive'
					]

			describe 'given a manifest with configuration and initialization options', ->

				beforeEach ->
					@deviceGetManifestBySlugStub = m.sinon.stub(device, 'getManifestBySlug')
					@deviceGetManifestBySlugStub.returns Promise.resolve
						options: [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
						]
						initialization:
							options: [
								message: 'Select a drive'
								type: 'drive'
								name: 'drive'
							]

				afterEach ->
					@deviceGetManifestBySlugStub.restore()

				it 'shoulde become an union of both', ->
					promise = config.getDeviceOptions('mydevicetype')
					m.chai.expect(promise).to.become [
							message: 'Processor'
							name: 'processorType'
							type: 'list'
							choices: [ 'Z7010', 'Z7020' ]
						,
							message: 'Coprocessor cores'
							name: 'coprocessorCore'
							type: 'list'
							choices: [ '16', '64' ]
						,
							message: 'Select a drive'
							type: 'drive'
							name: 'drive'
					]
