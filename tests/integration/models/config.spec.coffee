_ = require('lodash')
m = require('mochainon')

{ resin } = require('../setup')

describe 'Config Model', ->

	describe 'resin.models.config.getAll()', ->

		it 'should return all the configuration', ->
			resin.models.config.getAll().then (config) ->
				m.chai.expect(_.isPlainObject(config)).to.be.true
				m.chai.expect(_.isEmpty(config)).to.be.false

		it 'should include the pubnub keys', ->
			resin.models.config.getAll().get('pubnub').then (pubnubKeys) ->
				m.chai.expect(_.isString(pubnubKeys.publish_key)).to.be.true
				m.chai.expect(_.isString(pubnubKeys.subscribe_key)).to.be.true
				m.chai.expect(pubnubKeys.publish_key).to.have.length(42)
				m.chai.expect(pubnubKeys.subscribe_key).to.have.length(42)

		it 'should include the mixpanel token', ->
			resin.models.config.getAll().get('mixpanelToken').then (mixpanelToken) ->
				m.chai.expect(_.isString(mixpanelToken)).to.be.true
				m.chai.expect(mixpanelToken).to.have.length(32)

	describe 'resin.models.config.getDeviceTypes()', ->

		it 'should become the device types', ->
			resin.models.config.getDeviceTypes().then (deviceTypes) ->
				m.chai.expect(deviceTypes).to.not.have.length(0)

				for deviceType in deviceTypes
					m.chai.expect(deviceType.slug).to.exist
					m.chai.expect(deviceType.name).to.exist
					m.chai.expect(deviceType.arch).to.exist

	describe 'resin.models.config.getDeviceOptions()', ->

		it 'should become the device options', ->
			resin.models.config.getDeviceOptions('raspberry-pi').then (options) ->
				m.chai.expect(_.isArray(options)).to.be.true

		it 'should become the device options given a device type alias', ->
			resin.models.config.getDeviceOptions('raspberrypi').then (options) ->
				m.chai.expect(_.isArray(options)).to.be.true

		it 'should reject if device type is invalid', ->
			promise = resin.models.config.getDeviceOptions('foobarbaz')
			m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobarbaz')
