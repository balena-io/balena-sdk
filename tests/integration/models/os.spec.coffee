_ = require('lodash')
m = require('mochainon')
Promise = require('bluebird')
bSemver = require('balena-semver')

{ balena, givenLoggedInUser, IS_BROWSER } = require('../setup')

eventuallyExpectProperty = (promise, prop) ->
	m.chai.expect(promise).to.eventually.have.property(prop)

describe 'OS model', ->

	describe 'balena.models.os._getMaxSatisfyingVersion()', ->
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
				balena.models.os._getMaxSatisfyingVersion('latest', osVersions)
			).to.equal(osVersions.latest)

		it "should support 'recommended'", ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('recommended', osVersions)
			).to.equal(osVersions.recommended)

		it "should support 'default'", ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('default', osVersions)
			).to.equal(osVersions.default)

		it 'should support exact version', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('1.24.1', osVersions)
			).to.equal('1.24.1')

		it 'should support exact non-semver version', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('2.0.0.rev1', osVersions)
			).to.equal('2.0.0.rev1')

		it 'should return an exact match, if it exists, when given a specific version', ->
			# Concern here is that semver says .dev is equivalent to .prod, but
			# we want provide an exact version and use _exactly_ that version.
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('2.0.1+rev2.dev', osVersions)
			).to.equal('2.0.1+rev2.dev')

		it 'should return an equivalent result, if no exact result exists, when given a specific version', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('2.0.1+rev2', osVersions)
			).to.equal('2.0.1+rev2.prod')

		it 'should support semver ranges', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('^1.24.0', osVersions)
			).to.equal('1.24.1')

		it 'should support non-semver version ranges', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('^2.0.0.rev1', osVersions)
			).to.equal('2.0.1+rev2.prod')

		it 'should drop unsupported exact versions', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('1.24.5', osVersions)
			).to.equal(null)

		it 'should drop unsupported semver ranges', ->
			m.chai.expect(
				balena.models.os._getMaxSatisfyingVersion('~1.30.0', osVersions)
			).to.equal(null)

	describe 'balena.models.os.getSupportedVersions()', ->

		describe 'given a valid device slug', ->

			expectSorted = (array, comparator) ->
				# re-sorting could fail when the system is not using a stable
				# sorting algorithm, in which case items of the same value
				# might swap positions in the array
				array.forEach (item, i) ->
					if i == 0
						return

					previousItem = array[i - 1]
					m.chai.expect(comparator(previousItem, item)).to.be.lte(0)

			areValidVersions = (osVersions) ->
				m.chai.expect(osVersions).to.be.an('object')
				m.chai.expect(osVersions).to.have.property('versions').that.is.an('array')
				m.chai.expect(osVersions.versions).to.not.have.lengthOf(0)

				expectSorted(osVersions.versions, bSemver.rcompare)

				m.chai.expect(osVersions).to.have.property('latest').that.is.a('string')
				m.chai.expect(osVersions).to.have.property('recommended').that.is.a('string')
				m.chai.expect(osVersions).to.have.property('default').that.is.a('string')
				m.chai.expect(osVersions.default).to.equal(osVersions.recommended)

				return true

			it 'should eventually return the valid versions object', ->
				promise = balena.models.os.getSupportedVersions('raspberry-pi')
				m.chai.expect(promise).to.eventually.satisfy(areValidVersions)

			it 'should eventually return the valid versions object if passing a device type alias', ->
				promise = balena.models.os.getSupportedVersions('raspberrypi')
				m.chai.expect(promise).to.eventually.satisfy(areValidVersions)

			it 'should cache the results', ->
				balena.models.os.getSupportedVersions('raspberry-pi')
				.then (result1) ->
					balena.models.os.getSupportedVersions('raspberry-pi')
					.then (result2) ->
						m.chai.expect(result1).to.equal(result2)

			it 'should cache the supported versions independently for each device type', ->
				Promise.all [
					balena.models.os.getSupportedVersions('raspberry-pi')
					balena.models.os.getSupportedVersions('raspberrypi3')
				]
				.then ([ deviceType1Versions, deviceType2Versions ]) ->
					m.chai.expect(deviceType1Versions).not.to.equal(deviceType2Versions)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = balena.models.os.getSupportedVersions('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'balena.models.os._getOsVersions()', ->

		it 'should cache the results', ->
			p1 = balena.models.os._getOsVersions('raspberry-pi')
			p1.then (result1) ->
				p2 = balena.models.os._getOsVersions('raspberry-pi')
				p2.then (result2) ->
					m.chai.expect(result1).to.equal(result2)
					m.chai.expect(p1).to.equal(p2)

	describe 'balena.models.os.getDownloadSize()', ->

		describe 'given a valid device slug', ->

			it 'should eventually be a valid number', ->
				promise = balena.models.os.getDownloadSize('raspberry-pi')
				m.chai.expect(promise).to.eventually.be.a('number')

			it 'should eventually be a valid number if passing a device type alias', ->
				promise = balena.models.os.getDownloadSize('raspberrypi')
				m.chai.expect(promise).to.eventually.be.a('number')

		describe 'given a specific OS version', ->

			it 'should get a result for ResinOS v1', ->
				promise = balena.models.os.getDownloadSize('raspberry-pi', '1.26.1')
				m.chai.expect(promise).to.eventually.be.a('number')

			it 'should get a result for ResinOS v2', ->
				promise = balena.models.os.getDownloadSize('raspberry-pi', '2.0.6+rev3.prod')
				m.chai.expect(promise).to.eventually.be.a('number')

			it 'should cache the results', ->
				balena.models.os.getDownloadSize('raspberry-pi', '1.26.1')
				.then (result1) ->
					balena.models.os.getDownloadSize('raspberry-pi', '1.26.1')
					.then (result2) ->
						m.chai.expect(result1).to.equal(result2)

			it 'should cache download sizes independently for each version', ->
				Promise.all [
					balena.models.os.getDownloadSize('raspberry-pi', '1.26.1')
					balena.models.os.getDownloadSize('raspberry-pi', '2.0.6+rev3.prod')
				]
				.then ([ os1Size, os2Size ]) ->
					m.chai.expect(os1Size).not.to.equal(os2Size)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = balena.models.os.getDownloadSize('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'balena.models.os._getDownloadSize()', ->

		it 'should cache the results', ->
			p1 = balena.models.os._getDownloadSize('raspberry-pi', '1.26.1')
			p1.then (result1) ->
				p2 = balena.models.os._getDownloadSize('raspberry-pi', '1.26.1')
				p2.then (result2) ->
					m.chai.expect(result1).to.equal(result2)
					m.chai.expect(p1).to.equal(p2)

	describe 'balena.models.os._clearDeviceTypesEndpointCaches()', ->

		it 'should clear the result cache of balena.models.os._getOsVersions()', ->
			p1 = balena.models.os._getOsVersions('raspberry-pi')
			p1.then (result1) ->
				balena.models.os._clearDeviceTypesEndpointCaches()
				p2 = balena.models.os._getOsVersions('raspberry-pi')
				p2.then (result2) ->
					m.chai.expect(result1).to.deep.equal(result2)
					m.chai.expect(p1).to.not.equal(p2)

		it 'should clear the result cache of balena.models.os._getDownloadSize()', ->
			p1 = balena.models.os._getDownloadSize('raspberry-pi', '1.26.1')
			p1.then (result1) ->
				balena.models.os._clearDeviceTypesEndpointCaches()
				p2 = balena.models.os._getDownloadSize('raspberry-pi', '1.26.1')
				p2.then (result2) ->
					m.chai.expect(result1).to.deep.equal(result2)
					m.chai.expect(p1).to.not.equal(p2)

	describe 'balena.models.os.getLastModified()', ->

		describe 'given a valid device slug', ->

			it 'should eventually be a valid Date instance', ->
				promise = balena.models.os.getLastModified('raspberry-pi')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

			it 'should eventually be a valid Date instance if passing a device type alias', ->
				promise = balena.models.os.getLastModified('raspberrypi')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

			it 'should be able to query for a specific version', ->
				promise = balena.models.os.getLastModified('raspberrypi', '1.26.1')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

			it 'should be able to query for a version containing a plus', ->
				promise = balena.models.os.getLastModified('raspberrypi', '2.0.6+rev3.prod')
				m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = balena.models.os.getLastModified('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'balena.models.os.download()', ->
		return if IS_BROWSER

		rindle = require('rindle')
		tmp = require('tmp')
		fs = Promise.promisifyAll(require('fs'))

		describe 'given a valid device slug', ->

			it 'should contain a valid mime property', ->
				balena.models.os.download('raspberry-pi').then (stream) ->
					m.chai.expect(stream.mime).to.equal('application/octet-stream')

			it 'should contain a valid mime property if passing a device type alias', ->
				balena.models.os.download('raspberrypi').then (stream) ->
					m.chai.expect(stream.mime).to.equal('application/octet-stream')

			it 'should be able to download the image', ->
				tmpFile = tmp.tmpNameSync()
				balena.models.os.download('raspberry-pi').then (stream) ->
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
				promise = balena.models.os.download('foo-bar-baz')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

	describe 'balena.models.os.isSupportedOsUpdate()', ->

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = balena.models.os.isSupportedOsUpdate('foo-bar-baz', '2.0.0+rev1.prod', '2.29.2+rev1.prod')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

		describe 'given a valid device slug', ->

			describe 'given a unsupported low starting version number', ->

				it 'should return false', ->
					m.chai.expect(balena.models.os.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev0.prod', '2.2.0+rev2.prod'))
					.to.eventually.equal(false)

			describe 'given a unsupported low target version number', ->

				it 'should return false', ->
					m.chai.expect(balena.models.os.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev1.prod', '2.1.0+rev1.prod'))
					.to.eventually.equal(false)

			describe 'given a dev starting version number', ->

				it 'should return false', ->
					m.chai.expect(balena.models.os.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev1.dev', '2.2.0+rev2.prod'))
					.to.eventually.equal(false)

			describe 'given a dev target version number', ->

				it 'should return false', ->
					m.chai.expect(balena.models.os.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev1.prod', '2.1.0+rev1.dev'))
					.to.eventually.equal(false)

			describe 'given a supported os update path', ->

				it 'should return true', ->
					m.chai.expect(balena.models.os.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev1.prod', '2.2.0+rev2.prod'))
					.to.eventually.equal(true)

	describe 'balena.models.os.getSupportedOsUpdateVersions()', ->

		describe 'given an invalid device slug', ->

			it 'should be rejected with an error message', ->
				promise = balena.models.os.getSupportedOsUpdateVersions('foo-bar-baz', '2.9.6+rev1.prod')
				m.chai.expect(promise).to.be.rejectedWith('No such device type')

		describe 'given a valid device slug', ->

			it 'should return the list of supported hup targets', ->
				balena.models.os.getSupportedOsUpdateVersions('raspberrypi3', '2.9.6+rev1.prod')
				.then ({ current, recommended, versions }) ->
					m.chai.expect(current).to.equal('2.9.6+rev1.prod')
					m.chai.expect(recommended).to.be.a('string')
					m.chai.expect(versions).to.be.an('array')
					m.chai.expect(versions).to.not.have.length(0)
					_.each versions, (v) ->
						m.chai.expect(v).to.be.a('string')
						m.chai.expect(bSemver.gte(v, current)).to.be.true

					m.chai.expect(versions.length > 2).to.be.true
					sortedVersions = versions.slice().sort(bSemver.rcompare)
					m.chai.expect(versions).to.deep.equal(sortedVersions)

	describe 'when logged in as a user with a single application', ->

		givenLoggedInUser(beforeEach)

		beforeEach ->
			balena.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

		describe 'balena.models.os.getConfig()', ->
			DEFAULT_OS_VERSION = '2.12.7+rev1.prod'

			beforeEach ->
				balena.models.application.create
					name: 'TestApp'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi'
				.then (application) =>
					@application = application

			it 'should fail if no version option is provided', ->
				m.chai.expect(balena.models.os.getConfig(@application.id))
				.to.be.rejectedWith('An OS version is required when calling os.getConfig')

			it 'should be able to get an application config by id', ->
				promise = balena.models.os.getConfig(@application.id, { version: DEFAULT_OS_VERSION })
				Promise.all [
					eventuallyExpectProperty(promise, 'applicationId')
					eventuallyExpectProperty(promise, 'apiKey')
					eventuallyExpectProperty(promise, 'userId')
					eventuallyExpectProperty(promise, 'username')
					eventuallyExpectProperty(promise, 'deviceType')
					eventuallyExpectProperty(promise, 'apiEndpoint')
					eventuallyExpectProperty(promise, 'registryEndpoint')
					eventuallyExpectProperty(promise, 'vpnEndpoint')
					eventuallyExpectProperty(promise, 'pubnubSubscribeKey')
					eventuallyExpectProperty(promise, 'pubnubPublishKey')
					eventuallyExpectProperty(promise, 'listenPort')
				]

			it 'should be able to get an application config by name', ->
				promise = balena.models.os.getConfig(@application.app_name, { version: DEFAULT_OS_VERSION })
				Promise.all [
					eventuallyExpectProperty(promise, 'applicationId')
					eventuallyExpectProperty(promise, 'apiKey')
					eventuallyExpectProperty(promise, 'userId')
					eventuallyExpectProperty(promise, 'username')
					eventuallyExpectProperty(promise, 'deviceType')
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
				promise = balena.models.os.getConfig(@application.id, configOptions)
				Promise.all [
					# NOTE: the interval is converted to ms in the config object
					eventuallyExpectProperty(promise, 'appUpdatePollInterval').that.equals(configOptions.appUpdatePollInterval * 60 * 1000)
					eventuallyExpectProperty(promise, 'wifiKey').that.equals(configOptions.wifiKey)
					eventuallyExpectProperty(promise, 'wifiSsid').that.equals(configOptions.wifiSsid)
					eventuallyExpectProperty(promise, 'files')
						.that.has.property('network/network.config')
						.that.includes("#{configOptions.ip}/#{configOptions.netmask}/#{configOptions.gateway}")
				]

			it 'should be rejected if the application id does not exist', ->
				promise = balena.models.os.getConfig(999999, { version: DEFAULT_OS_VERSION })
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			it 'should be rejected if the application name does not exist', ->
				promise = balena.models.os.getConfig('foobarbaz', { version: DEFAULT_OS_VERSION })
				m.chai.expect(promise).to.be.rejectedWith('Application not found: foobarbaz')

	describe 'helpers', ->

		describe 'balena.models.os.isArchitectureCompatibleWith()', ->

			it 'should return false when comparing arm and i386 architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('armv7hf', 'i386')).to.equal(false)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('aarch64', 'i386')).to.equal(false)

			it 'should return false when comparing i386 and arm architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('i386', 'armv7hf')).to.equal(false)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('i386', 'aarch64')).to.equal(false)

			it 'should return false when comparing arm and amd64 architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('armv7hf', 'amd64')).to.equal(false)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('aarch64', 'amd64')).to.equal(false)

			it 'should return false when comparing amd64 and arm architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('amd64', 'armv7hf')).to.equal(false)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('amd64', 'aarch64')).to.equal(false)

			it 'should return true when comparing the same architecture slugs', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('rpi', 'rpi')).to.equal(true)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('armv5e', 'armv5e')).to.equal(true)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('armv7hf', 'armv7hf')).to.equal(true)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('aarch64', 'aarch64')).to.equal(true)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('i386', 'i386')).to.equal(true)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('i386-nlp', 'i386-nlp')).to.equal(true)
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('amd64', 'amd64')).to.equal(true)

			it 'should return true when comparing aarch64 and armv7hf architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('aarch64', 'armv7hf')).to.equal(true)

			it 'should return false when comparing armv7hf and aarch64 architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('armv7hf', 'aarch64')).to.equal(false)

			it 'should return false when comparing amd64 and i386 architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('amd64', 'i386')).to.equal(false)

			it 'should return false when comparing i386 and amd64 architectures', ->
				m.chai.expect(balena.models.os.isArchitectureCompatibleWith('i386', 'amd64')).to.equal(false)
