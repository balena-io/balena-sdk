_ = require('lodash')
m = require('mochainon')
Promise = require('bluebird')

{ resin, givenLoggedInUser, IS_BROWSER } = require('../setup')

{ osVersionRCompare } = require('../../../build/util')

eventuallyExpectProperty = (promise, prop) ->
	m.chai.expect(promise).to.eventually.have.property(prop)

describe 'OS model', ->

	describe 'resin.models.os._getMaxSatisfyingVersion()', ->
		osVersions = {
			versions: [
				'2.0.1+rev2.prod',
				'2.0.1+rev2.dev',
				'2.0.0.rev1'
				'2.0.0-rc1.rev2-dev',
				'2.0.0-rc1.rev2',
				'1.24.1',
				'1.24.0',
				'1.8.0'
			],
			recommended: '1.24.1',
			latest: '2.0.0.rev1',
			default: '1.24.1'
		}

		it "should support 'latest'", ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('latest', osVersions)
			).to.equal(osVersions.latest)

		it "should support 'recommended'", ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('recommended', osVersions)
			).to.equal(osVersions.recommended)

		it "should support 'default'", ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('default', osVersions)
			).to.equal(osVersions.default)

		it 'should support exact version', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('1.24.1', osVersions)
			).to.equal('1.24.1')

		it 'should support exact non-semver version', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('2.0.0.rev1', osVersions)
			).to.equal('2.0.0.rev1')

		it 'should return an exact match, if it exists, when given a specific version', ->
			# Concern here is that semver says .dev is equivalent to .prod, but
			# we want provide an exact version and use _exactly_ that version.
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('2.0.1+rev2.dev', osVersions)
			).to.equal('2.0.1+rev2.dev')

		it 'should return an equivalent result, if no exact result exists, when given a specific version', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('2.0.1+rev2', osVersions)
			).to.equal('2.0.1+rev2.prod')

		it 'should support semver ranges', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('^1.24.0', osVersions)
			).to.equal('1.24.1')

		it 'should support non-semver version ranges', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('^2.0.0.rev1', osVersions)
			).to.equal('2.0.1+rev2.prod')

		it 'should drop unsupported exact versions', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('1.24.5', osVersions)
			).to.equal(null)

		it 'should drop unsupported semver ranges', ->
			m.chai.expect(
				resin.models.os._getMaxSatisfyingVersion('~1.30.0', osVersions)
			).to.equal(null)

	describe 'resin.models.os.getSupportedVersions()', ->

		describe 'given a valid device slug', ->

			areValidVersions = (osVersions) ->
				sortedVersions = _.clone(osVersions.versions)
				sortedVersions.sort(osVersionRCompare)
				return osVersions and
					osVersions.versions and osVersions.versions.length and
					_.isEqual(osVersions.versions, sortedVersions)
					osVersions.latest and osVersions.recommended and osVersions.default and
					osVersions.default is osVersions.recommended

			it 'should eventually return the valid versions object', ->
				promise = resin.models.os.getSupportedVersions('raspberry-pi')
				m.chai.expect(promise).to.eventually.satisfy(areValidVersions)

			it 'should eventually return the valid versions object if passing a device type alias', ->
				promise = resin.models.os.getSupportedVersions('raspberrypi')
				m.chai.expect(promise).to.eventually.satisfy(areValidVersions)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = resin.models.os.getSupportedVersions('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'resin.models.os.getDownloadSize()', ->

		describe 'given a valid device slug', ->

			it 'should eventually be a valid number', ->
				promise = resin.models.os.getDownloadSize('raspberry-pi')
				m.chai.expect(promise).to.eventually.be.a('number')

			it 'should eventually be a valid number if passing a device type alias', ->
				promise = resin.models.os.getDownloadSize('raspberrypi')
				m.chai.expect(promise).to.eventually.be.a('number')

		describe 'given a specific OS version', ->

			it 'should get a result for ResinOS v1', ->
				promise = resin.models.os.getDownloadSize('raspberry-pi', '1.24.0')
				m.chai.expect(promise).to.eventually.be.a('number')

			it 'should get a result for ResinOS v2', ->
				promise = resin.models.os.getDownloadSize('raspberry-pi', '2.0.6+rev3.prod')
				m.chai.expect(promise).to.eventually.be.a('number')

			it 'should cache download sizes independently for each version', ->
				Promise.all [
					resin.models.os.getDownloadSize('raspberry-pi', '1.24.0')
					resin.models.os.getDownloadSize('raspberry-pi', '2.0.6+rev3.prod')
				]
				.then ([ os1Size, os2Size ]) ->
					m.chai.expect(os1Size).not.to.equal(os2Size)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = resin.models.os.getDownloadSize('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'resin.models.os.getLastModified()', ->

		describe 'given a valid device slug', ->

			it 'should eventually be a valid Date instance', ->
				promise = resin.models.os.getLastModified('raspberry-pi')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

			it 'should eventually be a valid Date instance if passing a device type alias', ->
				promise = resin.models.os.getLastModified('raspberrypi')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

			it 'should be able to query for a specific version', ->
				promise = resin.models.os.getLastModified('raspberrypi', '1.24.0')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

			it 'should be able to query for a version containing a plus', ->
				promise = resin.models.os.getLastModified('raspberrypi', '2.0.6+rev3.prod')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = resin.models.os.getLastModified('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'resin.models.os.download()', ->
		return if IS_BROWSER

		rindle = require('rindle')
		tmp = require('tmp')
		fs = Promise.promisifyAll(require('fs'))

		describe 'given a valid device slug', ->

			it 'should contain a valid mime property', ->
				resin.models.os.download('raspberry-pi').then (stream) ->
					m.chai.expect(stream.mime).to.equal('application/octet-stream')

			it 'should contain a valid mime property if passing a device type alias', ->
				resin.models.os.download('raspberrypi').then (stream) ->
					m.chai.expect(stream.mime).to.equal('application/octet-stream')

			it 'should be able to download the image', ->
				tmpFile = tmp.tmpNameSync()
				resin.models.os.download('raspberry-pi').then (stream) ->
					stream.pipe(fs.createWriteStream(tmpFile))
				.then(rindle.wait)
				.then ->
					return fs.statAsync(tmpFile)
				.then (stat) ->
					m.chai.expect(stat.size).to.not.equal(0)
				.finally ->
					fs.unlinkAsync(tmpFile)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = resin.models.os.download('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'when logged in as a user with a single application', ->

		givenLoggedInUser()

		beforeEach ->
			resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
				@application = application

		describe 'resin.models.os.getConfig()', ->
			beforeEach ->
				resin.models.application.create('TestApp', 'raspberry-pi').then (application) =>
					@application = application

			it 'should be able to get an application config by id', ->
				promise = resin.models.os.getConfig(@application.id)
				Promise.all [
					eventuallyExpectProperty(promise, 'applicationId')
					eventuallyExpectProperty(promise, 'apiKey')
					eventuallyExpectProperty(promise, 'userId')
					eventuallyExpectProperty(promise, 'username')
					eventuallyExpectProperty(promise, 'deviceType')
					eventuallyExpectProperty(promise, 'files')
					eventuallyExpectProperty(promise, 'apiEndpoint')
					eventuallyExpectProperty(promise, 'registryEndpoint')
					eventuallyExpectProperty(promise, 'vpnEndpoint')
					eventuallyExpectProperty(promise, 'pubnubSubscribeKey')
					eventuallyExpectProperty(promise, 'pubnubPublishKey')
					eventuallyExpectProperty(promise, 'listenPort')
				]

			it 'should be able to get an application config by name', ->
				promise = resin.models.os.getConfig(@application.app_name)
				Promise.all [
					eventuallyExpectProperty(promise, 'applicationId')
					eventuallyExpectProperty(promise, 'apiKey')
					eventuallyExpectProperty(promise, 'userId')
					eventuallyExpectProperty(promise, 'username')
					eventuallyExpectProperty(promise, 'deviceType')
					eventuallyExpectProperty(promise, 'files')
					eventuallyExpectProperty(promise, 'apiEndpoint')
					eventuallyExpectProperty(promise, 'registryEndpoint')
					eventuallyExpectProperty(promise, 'vpnEndpoint')
					eventuallyExpectProperty(promise, 'pubnubSubscribeKey')
					eventuallyExpectProperty(promise, 'pubnubPublishKey')
					eventuallyExpectProperty(promise, 'listenPort')
				]

			it 'should be able to configure image parameters', ->
				configOptions =
					appUpdatePollInterval: 72
					network: 'wifi'
					wifiKey: 'foobar'
					wifiSsid: 'foobarbaz'
					ip: '1.2.3.4'
					gateway: '5.6.7.8'
					netmask: '9.10.11.12'
					version: 'v1+foo'
				promise = resin.models.os.getConfig(@application.id, configOptions)
				Promise.all [
					# NOTE: the interval is converted to ms in the config object
					eventuallyExpectProperty(promise, 'appUpdatePollInterval').that.equals(configOptions.appUpdatePollInterval * 60 * 1000)
					eventuallyExpectProperty(promise, 'wifiKey').that.equals(configOptions.wifiKey)
					eventuallyExpectProperty(promise, 'wifiSsid').that.equals(configOptions.wifiSsid)
					eventuallyExpectProperty(promise, 'version').that.equals(configOptions.version)
					eventuallyExpectProperty(promise, 'files')
						.that.has.property('network/network.config')
						.that.includes("#{configOptions.ip}/#{configOptions.netmask}/#{configOptions.gateway}")
				]

			it 'should be rejected if the application id does not exist', ->
				promise = resin.models.os.getConfig(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			it 'should be rejected if the application name does not exist', ->
				promise = resin.models.os.getConfig('foobarbaz')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: foobarbaz')
