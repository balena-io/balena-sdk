_ = require('lodash')
m = require('mochainon')

{ balena } = require('../setup')

expectDeviceTypeArray = (deviceTypes) ->
	m.chai.expect(deviceTypes).to.be.an('array')
	m.chai.expect(deviceTypes).to.not.have.length(0)

	for deviceType in deviceTypes
		m.chai.expect(deviceType.slug).to.exist
		m.chai.expect(deviceType.name).to.exist
		m.chai.expect(deviceType.arch).to.exist

REPLACED_STATES = [
	'PREVIEW'
	'EXPERIMENTAL'
]

REPLACED_NAME_SUFFIXES = [
	'(PREVIEW)'
	'(EXPERIMENTAL)'
	'(BETA)'
]

itNormalizesDeviceTypes = ->
	it 'changes old device type states', ->
		for deviceType in @deviceTypes
			m.chai.expect(deviceType.state).to.satisfy (dtState) ->
				_.every(REPLACED_STATES, (replacedState) -> dtState != replacedState)

	it 'changes old device type name suffixes', ->
		for deviceType in @deviceTypes
			m.chai.expect(deviceType.name).to.satisfy (dtName) ->
				_.every(REPLACED_NAME_SUFFIXES, (replacedSuffix) -> !_.endsWith(dtName, replacedSuffix))

	it 'properly replaces the names of device types with old states', ->
		for deviceType in @deviceTypes
			if deviceType.state == 'PREVIEW'
				m.chai.expect(deviceType.name).to.satisfy (dtName) -> _.endsWith(dtName, '(ALPHA)')

			if deviceType.state == 'BETA'
				m.chai.expect(deviceType.name).to.satisfy (dtName) -> _.endsWith(dtName, '(NEW)')

describe 'Config Model', ->

	describe 'balena.models.config.getAll()', ->

		it 'should return all the configuration', ->
			balena.models.config.getAll().then (config) ->
				m.chai.expect(_.isPlainObject(config)).to.be.true
				m.chai.expect(_.isEmpty(config)).to.be.false

		it 'should include the pubnub keys', ->
			balena.models.config.getAll().get('pubnub').then (pubnubKeys) ->
				m.chai.expect(pubnubKeys.publish_key).to.be.a('string').that.has.length(0)
				m.chai.expect(pubnubKeys.subscribe_key).to.be.a('string').that.has.length(0)

		it 'should include the mixpanel token', ->
			balena.models.config.getAll().get('mixpanelToken').then (mixpanelToken) ->
				m.chai.expect(mixpanelToken).to.be.a('string')
				m.chai.expect(mixpanelToken).to.equal('balena-main')

		it 'should include the deviceTypes', ->
			balena.models.config.getAll().get('deviceTypes').then (deviceTypes) ->
				expectDeviceTypeArray(deviceTypes)

		describe 'device type normalization', ->
			before ->
				balena.models.config.getAll().get('deviceTypes').then (@deviceTypes) =>
					return

			itNormalizesDeviceTypes()

	describe 'balena.models.config.getDeviceTypes()', ->

		it 'should become the device types', ->
			balena.models.config.getDeviceTypes().then (deviceTypes) ->
				expectDeviceTypeArray(deviceTypes)

		describe 'device type normalization', ->
			before ->
				balena.models.config.getDeviceTypes().then (@deviceTypes) =>
					return

			itNormalizesDeviceTypes()

	describe 'balena.models.config.getDeviceOptions()', ->

		it 'should become the device options', ->
			balena.models.config.getDeviceOptions('raspberry-pi').then (options) ->
				m.chai.expect(_.isArray(options)).to.be.true

		it 'should become the device options given a device type alias', ->
			balena.models.config.getDeviceOptions('raspberrypi').then (options) ->
				m.chai.expect(_.isArray(options)).to.be.true

		it 'should reject if device type is invalid', ->
			promise = balena.models.config.getDeviceOptions('foobarbaz')
			m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobarbaz')
