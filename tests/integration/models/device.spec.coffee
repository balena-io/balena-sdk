_ = require('lodash')
m = require('mochainon')
superagent = require('superagent')
Promise = require('bluebird')

{
	balena
	givenADevice
	givenAnApplication
	givenAnApplicationWithADevice
	givenLoggedInUser
	givenMulticontainerApplicationWithADevice
	sdkOpts
	IS_BROWSER
} = require('../setup')

{
	itShouldGetAllTagsByResource
	itShouldGetAllTags
	itShouldSetTags
	itShouldRemoveTags
} = require('./tags')

makeRequest = (url) ->
	return new Promise (resolve, reject) ->
		superagent.get(url)
		.end (err, res) ->
			# have to normalize because of different behaviour in the browser and node
			resolve
				status: res?.status or err.status or 0
				isError: !!err
				response: res?.text

describe 'Device Model', ->

	givenLoggedInUser(before)

	describe 'given no applications', ->

		describe 'balena.models.device.getDisplayName()', ->

			it 'should get the display name for a known slug', ->
				promise = balena.models.device.getDisplayName('raspberry-pi')
				m.chai.expect(promise).to.eventually.equal('Raspberry Pi (v1 and Zero)')

			it 'should get the display name given a device type alias', ->
				promise = balena.models.device.getDisplayName('raspberrypi')
				m.chai.expect(promise).to.eventually.equal('Raspberry Pi (v1 and Zero)')

			it 'should eventually be undefined if the slug is invalid', ->
				promise = balena.models.device.getDisplayName('asdf')
				m.chai.expect(promise).to.eventually.be.undefined

		describe 'balena.models.device.getDeviceSlug()', ->

			it 'should eventually be the slug from a display name', ->
				promise = balena.models.device.getDeviceSlug('Raspberry Pi (v1 and Zero)')
				m.chai.expect(promise).to.eventually.equal('raspberry-pi')

			it 'should eventually be the slug if passing already a slug', ->
				promise = balena.models.device.getDeviceSlug('raspberry-pi')
				m.chai.expect(promise).to.eventually.equal('raspberry-pi')

			it 'should eventually be undefined if the display name is invalid', ->
				promise = balena.models.device.getDeviceSlug('asdf')
				m.chai.expect(promise).to.eventually.be.undefined

			it 'should eventually be the slug if passing an alias', ->
				promise = balena.models.device.getDeviceSlug('raspberrypi')
				m.chai.expect(promise).to.eventually.equal('raspberry-pi')

		describe 'balena.models.device.getSupportedDeviceTypes()', ->

			it 'should return a non empty array', ->
				balena.models.device.getSupportedDeviceTypes().then (deviceTypes) ->
					m.chai.expect(_.isArray(deviceTypes)).to.be.true
					m.chai.expect(deviceTypes).to.not.have.length(0)

			it 'should return all valid display names', ->
				balena.models.device.getSupportedDeviceTypes().each (deviceType) ->
					promise = balena.models.device.getDeviceSlug(deviceType)
					m.chai.expect(promise).to.eventually.not.be.undefined

		describe 'balena.models.device.getManifestBySlug()', ->

			it 'should become the manifest if the slug is valid', ->
				balena.models.device.getManifestBySlug('raspberry-pi').then (manifest) ->
					m.chai.expect(_.isPlainObject(manifest)).to.be.true
					m.chai.expect(manifest.slug).to.exist
					m.chai.expect(manifest.name).to.exist
					m.chai.expect(manifest.options).to.exist

			it 'should be rejected if the device slug is invalid', ->
				promise = balena.models.device.getManifestBySlug('foobar')
				m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobar')

			it 'should become the manifest given a device type alias', ->
				balena.models.device.getManifestBySlug('raspberrypi').then (manifest) ->
					m.chai.expect(manifest.slug).to.equal('raspberry-pi')

		describe 'balena.models.device.getStatus()', ->

			it 'should return offline for offline devices', ->
				promise = balena.models.device.getStatus({ is_online: false })
				m.chai.expect(promise).to.eventually.equal('offline')

			it 'should return idle for idle devices', ->
				promise = balena.models.device.getStatus({ is_online: true })
				m.chai.expect(promise).to.eventually.equal('idle')

	describe 'given a single application without devices', ->

		describe '[read operations]', ->

			givenAnApplication(before)

			describe 'balena.models.device.getAll()', ->

				it 'should become an empty array', ->
					promise = balena.models.device.getAll()
					m.chai.expect(promise).to.become([])

			describe 'balena.models.device.getAllByApplication()', ->

				it 'should become an empty array', ->
					promise = balena.models.device.getAllByApplication(@application.id)
					m.chai.expect(promise).to.become([])

			describe 'balena.models.device.generateUniqueKey()', ->

				it 'should generate a valid uuid', ->
					uuid = balena.models.device.generateUniqueKey()

					m.chai.expect(uuid).to.be.a('string')
					m.chai.expect(uuid).to.have.length(62)
					m.chai.expect(uuid).to.match(/^[a-z0-9]{62}$/)

				it 'should generate different uuids', ->
					one = balena.models.device.generateUniqueKey()
					two = balena.models.device.generateUniqueKey()
					three = balena.models.device.generateUniqueKey()

					m.chai.expect(one).to.not.equal(two)
					m.chai.expect(two).to.not.equal(three)

			describe 'balena.models.device.getManifestByApplication()', ->

				it 'should return the appropriate manifest for an application name', ->
					balena.models.device.getManifestByApplication(@application.app_name).then (manifest) =>
						m.chai.expect(manifest.slug).to.equal(@application.device_type)

				it 'should return the appropriate manifest for an application id', ->
					balena.models.device.getManifestByApplication(@application.id).then (manifest) =>
						m.chai.expect(manifest.slug).to.equal(@application.device_type)

				it 'should be rejected if the application name does not exist', ->
					promise = balena.models.device.getManifestByApplication('HelloWorldApp')
					m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				it 'should be rejected if the application id does not exist', ->
					promise = balena.models.device.getManifestByApplication(999999)
					m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'balena.models.device.register()', ->

			givenAnApplication(beforeEach)

			it 'should be able to register a device to a valid application name', ->
				uuid = balena.models.device.generateUniqueKey()
				balena.models.device.register(@application.app_name, uuid)
				.then =>
					promise = balena.models.device.getAllByApplication(@application.app_name)
					m.chai.expect(promise).to.eventually.have.length(1)

			it 'should be able to register a device to a valid application id', ->
				uuid = balena.models.device.generateUniqueKey()
				balena.models.device.register(@application.id, uuid)
				.then =>
					promise = balena.models.device.getAllByApplication(@application.app_name)
					m.chai.expect(promise).to.eventually.have.length(1)

			it 'should become valid device registration info', ->
				uuid = balena.models.device.generateUniqueKey()
				balena.models.device.register(@application.id, uuid).then (deviceInfo) ->
					m.chai.expect(deviceInfo.uuid).to.equal(uuid)
					m.chai.expect(deviceInfo.api_key).to.be.a('string')

			it 'should be rejected if the application name does not exist', ->
				uuid = balena.models.device.generateUniqueKey()
				promise = balena.models.device.register('HelloWorldApp', uuid)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				uuid = balena.models.device.generateUniqueKey()
				promise = balena.models.device.register(999999, uuid)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

	describe 'given a single application with a single offline device', ->

		describe '[read operations]', ->

			givenAnApplicationWithADevice(before)

			describe 'balena.models.device.getAll()', ->

				it 'should become the device', ->
					balena.models.device.getAll().then (devices) =>
						m.chai.expect(devices).to.have.length(1)
						m.chai.expect(devices[0].id).to.equal(@device.id)

				it 'should support arbitrary pinejs options', ->
					balena.models.device.getAll($select: [ 'id' ])
					.then ([ device ]) =>
						m.chai.expect(device.id).to.equal(@device.id)
						m.chai.expect(device.device_name).to.equal(undefined)

			describe 'balena.models.device.getAllByApplication()', ->

				it 'should get the device given the right application name', ->
					balena.models.device.getAllByApplication(@application.app_name).then (devices) =>
						m.chai.expect(devices).to.have.length(1)
						m.chai.expect(devices[0].id).to.equal(@device.id)

				it 'should get the device given the right application id', ->
					balena.models.device.getAllByApplication(@application.id).then (devices) =>
						m.chai.expect(devices).to.have.length(1)
						m.chai.expect(devices[0].id).to.equal(@device.id)

				it 'should be rejected if the application name does not exist', ->
					promise = balena.models.device.getAllByApplication('HelloWorldApp')
					m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				it 'should be rejected if the application id does not exist', ->
					promise = balena.models.device.getAllByApplication(999999)
					m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				it 'should support arbitrary pinejs options', ->
					balena.models.device.getAllByApplication(@application.id, $select: [ 'id' ])
					.then ([ device ]) =>
						m.chai.expect(device.id).to.equal(@device.id)
						m.chai.expect(device.device_name).to.equal(undefined)

			describe 'balena.models.device.get()', ->

				it 'should be able to get the device by uuid', ->
					balena.models.device.get(@device.uuid).then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)

				it 'should be able to get the device by id', ->
					balena.models.device.get(@device.id).then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)

				it 'should be rejected if the device name does not exist', ->
					promise = balena.models.device.get('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.get(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

				it 'should be able to use a shorter uuid', ->
					balena.models.device.get(@device.uuid.slice(0, 8)).then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)

				it 'should support arbitrary pinejs options', ->
					balena.models.device.get(@device.id, $select: [ 'id' ])
					.then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)
						m.chai.expect(device.device_name).to.equal(undefined)

			describe 'balena.models.device.getByName()', ->

				it 'should be able to get the device', ->
					balena.models.device.getByName(@device.device_name).then (devices) =>
						m.chai.expect(devices).to.have.length(1)
						m.chai.expect(devices[0].id).to.equal(@device.id)

				it 'should be rejected if the device does not exist', ->
					promise = balena.models.device.getByName('HelloWorldDevice')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: HelloWorldDevice')

				it 'should support arbitrary pinejs options', ->
					balena.models.device.getByName(@device.device_name, $select: [ 'id' ])
					.then ([ device ]) =>
						m.chai.expect(device.id).to.equal(@device.id)
						m.chai.expect(device.device_name).to.equal(undefined)

			describe 'balena.models.device.getName()', ->

				it 'should get the correct name by uuid', ->
					promise = balena.models.device.getName(@device.uuid)
					m.chai.expect(promise).to.eventually.equal(@device.device_name)

				it 'should get the correct name by id', ->
					promise = balena.models.device.getName(@device.id)
					m.chai.expect(promise).to.eventually.equal(@device.device_name)

				it 'should be rejected if the device uuid does not exist', ->
					promise = balena.models.device.getName('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.getName(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'balena.models.device.getApplicationName()', ->

				it 'should get the correct application name from a device uuid', ->
					promise = balena.models.device.getApplicationName(@device.uuid)
					m.chai.expect(promise).to.eventually.equal(@application.app_name)

				it 'should get the correct application name from a device id', ->
					promise = balena.models.device.getApplicationName(@device.id)
					m.chai.expect(promise).to.eventually.equal(@application.app_name)

				it 'should be rejected if the device uuid does not exist', ->
					promise = balena.models.device.getApplicationName('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.getApplicationName(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'balena.models.device.has()', ->

				it 'should eventually be true if the device uuid exists', ->
					promise = balena.models.device.has(@device.uuid)
					m.chai.expect(promise).to.eventually.be.true

				it 'should eventually be true if the device id exists', ->
					promise = balena.models.device.has(@device.id)
					m.chai.expect(promise).to.eventually.be.true

				it 'should return false if the device id is undefined', ->
					promise = balena.models.application.has(undefined)
					m.chai.expect(promise).to.eventually.be.false

				it 'should eventually be false if the device uuid does not exist', ->
					promise = balena.models.device.has('asdfghjkl')
					m.chai.expect(promise).to.eventually.be.false

				it 'should eventually be false if the device id does not exist', ->
					promise = balena.models.device.has(999999)
					m.chai.expect(promise).to.eventually.be.false

			describe 'balena.models.device.isOnline()', ->

				it 'should eventually be false if the device uuid is offline', ->
					promise = balena.models.device.isOnline(@device.uuid)
					m.chai.expect(promise).to.eventually.be.false

				it 'should eventually be false if the device id is offline', ->
					promise = balena.models.device.isOnline(@device.id)
					m.chai.expect(promise).to.eventually.be.false

				it 'should be rejected if the device uuid does not exist', ->
					promise = balena.models.device.isOnline('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.isOnline(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'balena.models.device.getLocalIPAddresses()', ->

				it 'should be rejected with an offline error if the device uuid is offline', ->
					promise = balena.models.device.getLocalIPAddresses(@device.uuid)
					m.chai.expect(promise).to.be.rejectedWith("The device is offline: #{@device.uuid}")

				it 'should be rejected with an offline error if the device id is offline', ->
					promise = balena.models.device.getLocalIPAddresses(@device.id)
					m.chai.expect(promise).to.be.rejectedWith("The device is offline: #{@device.id}")

				it 'should be rejected if the device uuid does not exist', ->
					promise = balena.models.device.getLocalIPAddresses('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.getLocalIPAddresses(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'balena.models.device.getAllByParentDevice()', ->

				before ->
					Promise.props
						userId: balena.auth.getUserId()
						childApplication: balena.models.application.create
							name: 'ChildApp'
							applicationType: 'microservices-starter'
							deviceType: @application.device_type
							parent: @application.id
					.then ({ userId, @childApplication }) =>
						# We don't use the built-in .register or resin-register-device,
						# because they don't yet support parent devices.
						balena.pine.post
							resource: 'device'
							body:
								belongs_to__user: userId
								belongs_to__application: @childApplication.id
								device_type: @childApplication.device_type
								uuid: balena.models.device.generateUniqueKey()
								is_managed_by__device: @device.id
					.then (device) =>
						@childDevice = device

				after ->
					balena.models.application.remove 'ChildApp'

				it 'should get the device given the right parent uuid', ->
					balena.models.device.getAllByParentDevice(@device.uuid).then (childDevices) =>
						m.chai.expect(childDevices).to.have.length(1)
						m.chai.expect(childDevices[0].id).to.equal(@childDevice.id)

				it 'should get the device given the right parent id', ->
					balena.models.device.getAllByParentDevice(@device.id).then (childDevices) =>
						m.chai.expect(childDevices).to.have.length(1)
						m.chai.expect(childDevices[0].id).to.equal(@childDevice.id)

				it 'should be empty if the parent device has no children', ->
					promise = balena.models.device.getAllByParentDevice(@childDevice.id).then (childDevices) ->
						m.chai.expect(childDevices).to.have.length(0)

				it 'should be rejected if the parent device does not exist', ->
					promise = balena.models.device.getAllByParentDevice('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should support arbitrary pinejs options', ->
					balena.models.device.getAllByParentDevice(@device.id, $select: [ 'id' ])
					.then ([ childDevice ]) =>
						m.chai.expect(childDevice.id).to.equal(@childDevice.id)
						m.chai.expect(childDevice.device_name).to.equal(undefined)

		describe 'balena.models.device.remove()', ->

			givenAnApplication(before)

			givenADevice(beforeEach)

			it 'should be able to remove the device by uuid', ->
				balena.models.device.remove(@device.uuid)
					.then(-> balena.models.device.getAll())
					.then (devices) ->
						m.chai.expect(devices).to.deep.equal([])

			it 'should be able to remove the device by id', ->
				balena.models.device.remove(@device.id)
					.then(-> balena.models.device.getAll())
					.then (devices) ->
						m.chai.expect(devices).to.deep.equal([])

			it 'should be able to remove the device using a shorter uuid', ->
				balena.models.device.remove(@device.uuid.slice(0, 7))
					.then(-> balena.models.device.getAll())
					.then (devices) ->
						m.chai.expect(devices).to.deep.equal([])

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.remove('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.remove(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'balena.models.device.rename()', ->

			givenAnApplication(before)

			givenADevice(beforeEach)

			it 'should be able to rename the device by uuid', ->
				balena.models.device.rename(@device.uuid, 'FooBarDeviceByUuid').then =>
					balena.models.device.getName(@device.uuid)
				.then (name) ->
					m.chai.expect(name).to.equal('FooBarDeviceByUuid')

			it 'should be able to rename the device by id', ->
				balena.models.device.rename(@device.id, 'FooBarDeviceById').then =>
					balena.models.device.getName(@device.id)
				.then (name) ->
					m.chai.expect(name).to.equal('FooBarDeviceById')

			it 'should be able to rename the device using a shorter uuid', ->
				balena.models.device.rename(@device.uuid.slice(0, 7), 'FooBarDeviceByShortUuid').then =>
					balena.models.device.getName(@device.uuid)
				.then (name) ->
					m.chai.expect(name).to.equal('FooBarDeviceByShortUuid')

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.rename('asdfghjkl', 'Foo Bar')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.rename(999999, 'Foo Bar')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'balena.models.device.setCustomLocation()', ->

			givenAnApplicationWithADevice(before)

			it 'should be able to set the location of a device by uuid', ->
				balena.models.device.setCustomLocation @device.uuid,
					latitude: 41.383333
					longitude: 2.183333
				.then =>
					balena.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('41.383333')
					m.chai.expect(device.custom_longitude).to.equal('2.183333')

			it 'should be able to set the location of a device by id', ->
				balena.models.device.setCustomLocation @device.id,
					latitude: 42.383333
					longitude: 2.283333
				.then =>
					balena.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('42.383333')
					m.chai.expect(device.custom_longitude).to.equal('2.283333')

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.setCustomLocation 'asdfghjkl',
					latitude: 43.383333
					longitude: 2.383333
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.setCustomLocation 999999,
					latitude: 44.383333
					longitude: 2.483333
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'balena.models.device.unsetCustomLocation()', ->

			givenAnApplicationWithADevice(before)

			beforeEach ->
				balena.models.device.setCustomLocation @device.id,
					latitude: 41.383333
					longitude: 2.183333

			it 'should be able to unset the location of a device by uuid', ->
				balena.models.device.unsetCustomLocation(@device.uuid).then =>
					balena.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('')
					m.chai.expect(device.custom_longitude).to.equal('')

			it 'should be able to unset the location of a device by id', ->
				balena.models.device.unsetCustomLocation(@device.id).then =>
					balena.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('')
					m.chai.expect(device.custom_longitude).to.equal('')

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.unsetCustomLocation('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.unsetCustomLocation(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'balena.models.device.note()', ->

			givenAnApplication(before)

			givenADevice(beforeEach)

			it 'should be able to note a device by uuid', ->
				balena.models.device.note(@device.uuid, 'What you do today can improve all your tomorrows').then =>
					balena.models.device.get(@device.uuid)
				.then (device) ->
					m.chai.expect(device.note).to.equal('What you do today can improve all your tomorrows')

			it 'should be able to note a device by id', ->
				balena.models.device.note(@device.id, 'What you do today can improve all your tomorrows').then =>
					balena.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.note).to.equal('What you do today can improve all your tomorrows')

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.note('asdfghjkl', 'My note')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.note(999999, 'My note')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'balena.models.device.hasDeviceUrl()', ->

			givenAnApplicationWithADevice(before)

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.hasDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.hasDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given device url is disabled', ->

				it 'should eventually be false given a device uuid', ->
					promise = balena.models.device.hasDeviceUrl(@device.uuid)
					m.chai.expect(promise).to.eventually.be.false

				it 'should eventually be false given a device id', ->
					promise = balena.models.device.hasDeviceUrl(@device.id)
					m.chai.expect(promise).to.eventually.be.false

			describe 'given device url is enabled', ->

				before ->
					balena.models.device.enableDeviceUrl(@device.id)

				it 'should eventually be true given a device uuid', ->
					promise = balena.models.device.hasDeviceUrl(@device.uuid)
					m.chai.expect(promise).to.eventually.be.true

				it 'should eventually be true given a device id', ->
					promise = balena.models.device.hasDeviceUrl(@device.id)
					m.chai.expect(promise).to.eventually.be.true

		describe 'balena.models.device.getDeviceUrl()', ->

			givenAnApplicationWithADevice(before)

			describe 'given a newly created device', ->

				it 'should be rejected if the device uuid does not exist', ->
					promise = balena.models.device.getDeviceUrl('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.getDeviceUrl(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given device url is disabled', ->

				it 'should be rejected with an error given a device uuid', ->
					promise = balena.models.device.getDeviceUrl(@device.uuid)
					m.chai.expect(promise).to.be.rejectedWith("Device is not web accessible: #{@device.uuid}")

				it 'should be rejected with an error given a device id', ->
					promise = balena.models.device.getDeviceUrl(@device.id)
					m.chai.expect(promise).to.be.rejectedWith("Device is not web accessible: #{@device.id}")

			describe 'given device url is enabled', ->

				before ->
					balena.models.device.enableDeviceUrl(@device.id)

				it 'should eventually return the correct device url given a shorter uuid', ->
					balena.models.device.getDeviceUrl(@device.uuid.slice(0, 7))
					.then (deviceUrl) ->
						m.chai.expect(deviceUrl).to.match(/[a-z0-9]{62}/)

				it 'should eventually return the correct device url given an id', ->
					balena.models.device.getDeviceUrl(@device.id)
					.then (deviceUrl) ->
						m.chai.expect(deviceUrl).to.match(/[a-z0-9]{62}/)

				it 'should eventually be an absolute url given a uuid', ->
					balena.models.device.getDeviceUrl(@device.uuid)
					.then(makeRequest)
					.then (response) ->
						m.chai.expect(response.isError).to.equal(true)

						# in the browser we don't get the details
						# honestly it's unclear why, as it works for other services
						return if IS_BROWSER

						# Because the device is not online
						m.chai.expect(response.status).to.equal(503)

						m.chai.expect(response.response).to.match(
							/Device Public URLs/
						)

		describe 'balena.models.device.enableDeviceUrl()', ->

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.enableDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.enableDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given the device url is disabled', ->

				givenAnApplication(before)

				givenADevice(beforeEach)

				it 'should be able to enable web access using a uuid', ->
					balena.models.device.enableDeviceUrl(@device.uuid).then =>
						promise = balena.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.true

				it 'should be able to enable web access using an id', ->
					balena.models.device.enableDeviceUrl(@device.id).then =>
						promise = balena.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.true

				it 'should be able to enable web access using a shorter uuid', ->
					balena.models.device.enableDeviceUrl(@device.uuid.slice(0, 7)).then =>
						promise = balena.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.true

		describe 'balena.models.device.disableDeviceUrl()', ->

			it 'should be rejected if the device uuid does not exist', ->
				promise = balena.models.device.disableDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.disableDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given device url is enabled', ->

				givenAnApplication(before)

				givenADevice(beforeEach)

				beforeEach ->
					balena.models.device.enableDeviceUrl(@device.id)

				it 'should be able to disable web access using a uuid', ->
					balena.models.device.disableDeviceUrl(@device.uuid).then =>
						promise = balena.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.false

				it 'should be able to disable web access using an id', ->
					balena.models.device.disableDeviceUrl(@device.id).then =>
						promise = balena.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.false

				it 'should be able to disable web access using a shorter uuid', ->
					balena.models.device.disableDeviceUrl(@device.uuid.slice(0, 7)).then =>
						promise = balena.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.false

		describe 'balena.models.device.generateDeviceKey()', ->

			givenAnApplicationWithADevice(before)

			it 'should be able to generate a device key by uuid', ->
				balena.models.device.generateDeviceKey(@device.uuid).then (deviceApiKey) ->
					m.chai.expect(deviceApiKey).to.be.a.string
					m.chai.expect(deviceApiKey).to.have.length(32)

			it 'should be able to generate a device key by id', ->
				balena.models.device.generateDeviceKey(@device.id).then (deviceApiKey) ->
					m.chai.expect(deviceApiKey).to.be.a.string
					m.chai.expect(deviceApiKey).to.have.length(32)

			it 'should be rejected if the device name does not exist', ->
				promise = balena.models.device.generateDeviceKey('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = balena.models.device.generateDeviceKey(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			it 'should be able to use a shorter uuid', ->
				balena.models.device.generateDeviceKey(@device.uuid.slice(0, 8)).then (deviceApiKey) ->
					m.chai.expect(deviceApiKey).to.be.a.string
					m.chai.expect(deviceApiKey).to.have.length(32)

		describe 'balena.models.device.grantSupportAccess()', ->

			givenAnApplicationWithADevice(before)

			it 'should throw an error if the expiry time stamp is in the past', ->
				expiryTimestamp = Date.now() - 3600 * 1000

				m.chai.expect( => balena.models.device.grantSupportAccess(@device.id, expiryTimestamp))
				.to.throw()

			it 'should throw an error if the expiry time stamp is undefined', ->
				m.chai.expect( => balena.models.device.grantSupportAccess(@device.id))
				.to.throw()

			it 'should grant support access for the correct amount of time', ->
				expiryTimestamp = Date.now() + 3600 * 1000
				promise = balena.models.device.grantSupportAccess(@device.id, expiryTimestamp)
				.then =>
					balena.models.device.get(@device.id)
				.then ({ is_accessible_by_support_until__date }) ->
					Date.parse(is_accessible_by_support_until__date)

				m.chai.expect(promise).to.eventually.equal(expiryTimestamp)

		describe 'balena.models.device.revokeSupportAccess()', ->

			givenAnApplicationWithADevice(before)

			before ->
				balena.models.device.grantSupportAccess(@device.id, Date.now() + 3600 * 1000)

			it 'should revoke support access', ->
				balena.models.device.revokeSupportAccess(@device.id)
				.then =>
					balena.models.device.get(@device.id)
				.then ({ is_accessible_by_support_until__date }) ->
					m.chai.expect(is_accessible_by_support_until__date).to.be.null

		describe 'balena.models.device.hasLockOverride()', ->

			givenAnApplicationWithADevice(before)

			it 'should be false by default for a device retrieved by uuid', ->
				balena.models.device.hasLockOverride(@device.uuid)
				.then (hasLockOverride) ->
					m.chai.expect(hasLockOverride).to.be.false

			it 'should be false by default for a device retrieved by id', ->
				balena.models.device.hasLockOverride(@device.id)
				.then (hasLockOverride) ->
					m.chai.expect(hasLockOverride).to.be.false

		describe 'balena.models.device.enableLockOverride()', ->

			givenAnApplication(before)

			givenADevice(beforeEach)

			it 'should be able to enable lock override by uuid', ->
				balena.models.device.enableLockOverride(@device.uuid)
				.then =>
					balena.models.device.hasLockOverride(@device.uuid)
				.then (hasLockOverride) ->
					m.chai.expect(hasLockOverride).to.be.true

			it 'should be able to enable lock override by id', ->
				balena.models.device.enableLockOverride(@device.id)
				.then =>
					balena.models.device.hasLockOverride(@device.id)
				.then (hasLockOverride) ->
					m.chai.expect(hasLockOverride).to.be.true

		describe 'balena.models.device.disableLockOverride()', ->

			givenAnApplication(before)

			givenADevice(beforeEach)

			beforeEach ->
				balena.models.device.enableLockOverride(@device.uuid)

			it 'should be able to disable lock override by uuid', ->
				balena.models.device.disableLockOverride(@device.uuid)
				.then =>
					balena.models.device.hasLockOverride(@device.uuid)
				.then (hasLockOverride) ->
					m.chai.expect(hasLockOverride).to.be.false

			it 'should be able to disable lock override by id', ->
				balena.models.device.disableLockOverride(@device.id)
				.then =>
					balena.models.device.hasLockOverride(@device.id)
				.then (hasLockOverride) ->
					m.chai.expect(hasLockOverride).to.be.false

		describe 'balena.models.device.getOsUpdateStatus()', ->

			givenAnApplicationWithADevice(before)

			it 'should be able to get the current OS update status', ->
				balena.models.device.getOsUpdateStatus(@device.uuid)
				.then (status) ->
					m.chai.expect(status).to.deep.match({
						status: 'idle'
					})

			it 'should be rejected if the device does not exist', ->
				promise = balena.models.device.getOsUpdateStatus('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

		describe 'balena.models.device.startOsUpdate()', ->

			givenAnApplicationWithADevice(before)

			describe 'given an offline device w/o os info', ->

				it 'should be rejected if the device does not exist', ->
					promise = balena.models.device.startOsUpdate('asdfghjkl', '2.29.2+rev1.prod')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should not be able to start an OS update without providing a targetOsVersion parameter', ->
					promise = balena.models.device.startOsUpdate(@device.uuid)
					m.chai.expect(promise).to.be.rejected
						.and.eventually.have.property('code', 'BalenaInvalidParameterError')

				it 'should not be able to start an OS update for an offline device', ->
					promise = balena.models.device.startOsUpdate(@device.uuid, '2.29.2+rev1.prod')
					m.chai.expect(promise).to.be.rejectedWith("The device is offline: #{@device.uuid}")

			describe 'given an online device w/o os info', ->

				before ->
					balena.pine.patch
						resource: 'device'
						id: @device.id
						body: is_online: true

				it 'should not be able to start an OS update for a device that has not yet reported its current version', ->
					promise = balena.models.device.startOsUpdate(@device.uuid, '2.29.2+rev1.prod')
					m.chai.expect(promise).to.be.rejectedWith("The current os version of the device is not available: #{@device.uuid}")

			describe 'given an online device with os info', ->

				before ->
					balena.pine.patch
						resource: 'device'
						id: @device.id
						body:
							is_online: true
							os_variant: 'prod'
							os_version: 'Resin OS 2.7.8+rev1'

				it 'should not be able to start an OS update when the target os version is not specified', ->
					promise = balena.models.device.startOsUpdate(@device.uuid)
					m.chai.expect(promise).to.be.rejectedWith("undefined is not a valid value for parameter 'targetOsVersion'")
					.and.eventually.have.property('code', 'BalenaInvalidParameterError')

				it 'should not be able to start an OS update when the target os version does not exist', ->
					promise = balena.models.device.startOsUpdate(@device.uuid, '2.29.1+rev1.prod')
					m.chai.expect(promise).to.be.rejectedWith("2.29.1+rev1.prod is not a valid value for parameter 'targetOsVersion'")
					.and.eventually.have.property('code', 'BalenaInvalidParameterError')

				# just to confirm that the above checks do not give false positives,
				# allow the request to reach the actions server and document the current error
				it 'should not be able to start an OS update for a fake device', ->
					promise = balena.models.device.startOsUpdate(@device.uuid, '2.29.2+rev1.prod')
					m.chai.expect(promise).to.be.rejected
					.then (error) ->
						m.chai.expect(error).to.have.property('statusCode', 500)
						m.chai.expect(error).to.have.property('message', 'Request error: [object Object]')
						m.chai.expect(error.code).to.not.equal('BalenaInvalidParameterError')

		describe 'balena.models.device.tags', ->

			givenAnApplication(before)

			givenADevice(beforeEach)

			appTagTestOptions =
				model: balena.models.device.tags
				resourceName: 'application'
				uniquePropertyName: 'app_name'

			deviceTagTestOptions =
				model: balena.models.device.tags
				resourceName: 'device'
				uniquePropertyName: 'uuid'

			beforeEach ->
				appTagTestOptions.resourceProvider = => @application
				deviceTagTestOptions.resourceProvider = => @device
				# used for tag creation during the
				# device.tags.getAllByApplication() test
				appTagTestOptions.setTagResourceProvider = => @device

			describe 'balena.models.device.tags.getAllByApplication()', ->
				itShouldGetAllTagsByResource(appTagTestOptions)

			describe 'balena.models.device.tags.getAllByDevice()', ->
				itShouldGetAllTagsByResource(deviceTagTestOptions)

			describe 'balena.models.device.tags.getAll()', ->
				itShouldGetAllTags(deviceTagTestOptions)

			describe 'balena.models.device.tags.set()', ->
				itShouldSetTags(deviceTagTestOptions)

			describe 'balena.models.device.tags.remove()', ->
				itShouldRemoveTags(deviceTagTestOptions)

		describe 'balena.models.device.configVar', ->

			givenAnApplicationWithADevice(before)

			configVarModel = balena.models.device.configVar

			['id', 'uuid'].forEach (deviceParam) ->
				deviceParamUpper = deviceParam.toUpperCase()

				it "can create a variable by #{deviceParam}", ->
					promise = configVarModel.set(@device[deviceParam], "BALENA_EDITOR_#{deviceParamUpper}", 'vim')
					m.chai.expect(promise).to.not.be.rejected

				it "...can retrieve a created variable by #{deviceParam}", ->
					configVarModel.get(@device[deviceParam], "BALENA_EDITOR_#{deviceParamUpper}")
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "...can update and retrieve a variable by #{deviceParam}", ->
					configVarModel.set(@device[deviceParam], "BALENA_EDITOR_#{deviceParamUpper}", 'emacs')
					.then =>
						configVarModel.get(@device[deviceParam], "BALENA_EDITOR_#{deviceParamUpper}")
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "...can delete and then fail to retrieve a variable by #{deviceParam}", ->
					configVarModel.remove(@device[deviceParam], "BALENA_EDITOR_#{deviceParamUpper}")
					.then =>
						configVarModel.get(@device[deviceParam], "BALENA_EDITOR_#{deviceParamUpper}")
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

				it "can create and then retrieve multiple variables by #{deviceParamUpper}", ->
					Promise.all [
						configVarModel.set(@device[deviceParam], "BALENA_A_#{deviceParamUpper}", 'a')
						configVarModel.set(@device[deviceParam], "BALENA_B_#{deviceParamUpper}", 'b')
					]
					.then =>
						configVarModel.getAllByDevice(@device[deviceParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: "BALENA_A_#{deviceParamUpper}" }).value).equal('a')
						m.chai.expect(_.find(result, { name: "BALENA_B_#{deviceParamUpper}" }).value).equal('b')
					.then =>
						Promise.all [
							configVarModel.remove(@device[deviceParam], "BALENA_A_#{deviceParamUpper}")
							configVarModel.remove(@device[deviceParam], "BALENA_B_#{deviceParamUpper}")
						]

			it 'can create and then retrieve multiple variables by application', ->
				Promise.all [
					configVarModel.set(@device.id, 'BALENA_A_BY_APPLICATION', 'a')
					configVarModel.set(@device.id, 'BALENA_B_BY_APPLICATION', 'b')
				]
				.then =>
					configVarModel.getAllByApplication(@application.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'BALENA_A_BY_APPLICATION' }).value).equal('a')
					m.chai.expect(_.find(result, { name: 'BALENA_B_BY_APPLICATION' }).value).equal('b')
				.then =>
					Promise.all [
						configVarModel.remove(@device.id, 'BALENA_A_BY_APPLICATION')
						configVarModel.remove(@device.id, 'BALENA_B_BY_APPLICATION')
					]

		describe 'balena.models.device.envVar', ->

			givenAnApplicationWithADevice(before)

			envVarModel = balena.models.device.envVar

			['id', 'uuid'].forEach (deviceParam) ->

				it "can create a variable by #{deviceParam}", ->
					promise = envVarModel.set(@device[deviceParam], "EDITOR_BY_#{deviceParam}", 'vim')
					m.chai.expect(promise).to.not.be.rejected

				it "...can retrieve a created variable by #{deviceParam}", ->
					envVarModel.get(@device[deviceParam], "EDITOR_BY_#{deviceParam}")
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "...can update and retrieve a variable by #{deviceParam}", ->
					envVarModel.set(@device[deviceParam], "EDITOR_BY_#{deviceParam}", 'emacs')
					.then =>
						envVarModel.get(@device[deviceParam], "EDITOR_BY_#{deviceParam}")
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "...can delete and then fail to retrieve a variable by #{deviceParam}", ->
					envVarModel.remove(@device[deviceParam], "EDITOR_BY_#{deviceParam}")
					.then =>
						envVarModel.get(@device[deviceParam], "EDITOR_BY_#{deviceParam}")
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

				it "can create and then retrieve multiple variables by #{deviceParam}", ->
					Promise.all [
						envVarModel.set(@device[deviceParam], "A_BY_#{deviceParam}", 'a')
						envVarModel.set(@device[deviceParam], "B_BY_#{deviceParam}", 'b')
					]
					.then =>
						envVarModel.getAllByDevice(@device[deviceParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: "A_BY_#{deviceParam}" }).value).equal('a')
						m.chai.expect(_.find(result, { name: "B_BY_#{deviceParam}" }).value).equal('b')
					.then =>
						Promise.all [
							envVarModel.remove(@device[deviceParam], "A_BY_#{deviceParam}")
							envVarModel.remove(@device[deviceParam], "B_BY_#{deviceParam}")
						]

			it 'can create and then retrieve multiple variables by application', ->
				Promise.all [
					envVarModel.set(@device.id, 'A_BY_APPLICATION', 'a')
					envVarModel.set(@device.id, 'B_BY_APPLICATION', 'b')
				]
				.then =>
					envVarModel.getAllByApplication(@application.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'A_BY_APPLICATION' }).value).equal('a')
					m.chai.expect(_.find(result, { name: 'B_BY_APPLICATION' }).value).equal('b')
				.then =>
					Promise.all [
						envVarModel.remove(@device.id, 'A_BY_APPLICATION')
						envVarModel.remove(@device.id, 'B_BY_APPLICATION')
					]

		describe 'balena.models.device.getSupervisorTargetState()', ->

			givenAnApplicationWithADevice(before)

			it 'should be rejected if the device does not exist', ->
				promise = balena.models.device.getSupervisorTargetState('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should reflect the device\'s target state', ->
				balena.models.device.getSupervisorTargetState(@device.id).then (state) =>
					# first, check the name
					m.chai.expect(state.local.name).to.be.a('string')
					m.chai.expect(state.local.name).to.equal(@device.device_name)

					# next, check application types and some values
					m.chai.expect(state.local.apps).to.be.an('object')
					m.chai.expect(state.local.apps[@application.id].name).to.equal(@application.app_name)
					m.chai.expect(state.local.apps[@application.id].name).to.be.a('string')
					m.chai.expect(state.local.apps[@application.id].services).to.be.an('object')
					m.chai.expect(state.local.apps[@application.id].volumes).to.be.an('object')
					m.chai.expect(state.local.apps[@application.id].networks).to.be.an('object')

					# finally, check configuration type and values
					m.chai.expect(state.local.config).to.be.an('object')
					m.chai.expect(state.local.config['RESIN_SUPERVISOR_NATIVE_LOGGER']).to.equal('true')
					m.chai.expect(state.local.config['RESIN_SUPERVISOR_POLL_INTERVAL']).to.equal('900000')

		describe 'balena.models.device.getSupervisorState()', ->

			givenAnApplicationWithADevice(before)

			it 'should be rejected if the device does not exist', ->
				promise = balena.models.device.getSupervisorState('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device exists but is inaccessible', ->
				promise = balena.models.device.getSupervisorState(@device.id)
				m.chai.expect(promise).to.be.rejectedWith('No online device(s) found')

	describe 'given a multicontainer application with a single offline device', ->

		describe '[contained scenario]', ->

			givenMulticontainerApplicationWithADevice(before)

			describe 'balena.models.device.getWithServiceDetails()', ->

				it 'should be able to get the device by uuid', ->
					balena.models.device.getWithServiceDetails(@device.uuid).then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)

				it 'should be able to get the device by id', ->
					balena.models.device.getWithServiceDetails(@device.id).then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)

				it 'should retrieve the current service details', ->
					balena.models.device.getWithServiceDetails(@device.id).then (deviceDetails) =>
						m.chai.expect(deviceDetails).to.deep.match
							device_name: @device.device_name
							uuid: @device.uuid
							is_on__commit: @currentRelease.commit
							current_services:
								web: [
									id: @newWebInstall.id
									service_id: @webService.id
									image_id: @newWebImage.id
									commit: 'new-release-commit'
									status: 'downloading'
									download_progress: 50
								,
									id: @oldWebInstall.id
									service_id: @webService.id
									image_id: @oldWebImage.id
									commit: 'old-release-commit'
									status: 'running'
									download_progress: 100
								]
								db: [
									id: @newDbInstall.id
									service_id: @dbService.id
									image_id: @newDbImage.id
									commit: 'new-release-commit'
									status: 'running'
									download_progress: 100
								]

						# Should filter out deleted image installs
						m.chai.expect(deviceDetails.current_services.db).to.have.lengthOf(1)

						# Should have an empty list of gateway downloads
						m.chai.expect(deviceDetails.current_gateway_downloads).to.have.lengthOf(0)

				it 'should return gateway downloads, if available', ->
					Promise.all [
						balena.pine.post
							resource: 'gateway_download'
							body:
								image: @newWebImage.id
								status: 'downloading'
								is_downloaded_by__device: @device.id
								download_progress: 50
					,
						balena.pine.post
							resource: 'gateway_download'
							body:
								image: @oldWebImage.id
								status: 'deleted'
								is_downloaded_by__device: @device.id
								download_progress: 100
					]
					.then =>
						balena.models.device.getWithServiceDetails(@device.id)
					.then (deviceDetails) =>
						m.chai.expect(deviceDetails.current_gateway_downloads).to.have.lengthOf(1)
						m.chai.expect(deviceDetails.current_gateway_downloads[0]).to.deep.match
							service_id: @webService.id
							image_id: @newWebImage.id
							status: 'downloading'
							download_progress: 50

				it 'should allow options to change the device fields returned', ->
					balena.models.device.getWithServiceDetails @device.id,
						$select: ['id', 'uuid']
						$expand:
							belongs_to__application:
								$select: ['id', 'app_name']
					.then (deviceDetails) =>

						m.chai.expect(deviceDetails.device_name).to.be.undefined

						m.chai.expect(deviceDetails.current_services).not.to.be.undefined

						m.chai.expect(deviceDetails.belongs_to__application[0]).to.deep.match
							id: @application.id
							app_name: @application.app_name

				it 'should be rejected if the device name does not exist', ->
					promise = balena.models.device.getWithServiceDetails('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = balena.models.device.getWithServiceDetails(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

				it 'should be able to use a shorter uuid', ->
					balena.models.device.getWithServiceDetails(@device.uuid.slice(0, 8)).then (device) =>
						m.chai.expect(device.id).to.equal(@device.id)

			describe 'balena.models.device.serviceVar', ->

				varModel = balena.models.device.serviceVar

				['id', 'uuid'].forEach (deviceParam) ->

					it "can create a variable by #{deviceParam}", ->
						promise = varModel.set(@device[deviceParam], @webService.id, "EDITOR_BY_#{deviceParam}", 'vim')
						m.chai.expect(promise).to.not.be.rejected

					it "...can retrieve a created variable by #{deviceParam}", ->
						varModel.get(@device[deviceParam], @webService.id, "EDITOR_BY_#{deviceParam}")
						.then (result) ->
							m.chai.expect(result).to.equal('vim')

					it "...can update and retrieve a variable by #{deviceParam}", ->
						varModel.set(@device[deviceParam], @webService.id, "EDITOR_BY_#{deviceParam}", 'emacs')
						.then =>
							varModel.get(@device[deviceParam], @webService.id, "EDITOR_BY_#{deviceParam}")
						.then (result) ->
							m.chai.expect(result).to.equal('emacs')

					it "...can delete and then fail to retrieve a variable by #{deviceParam}", ->
						varModel.remove(@device[deviceParam], @webService.id, "EDITOR_BY_#{deviceParam}")
						.then =>
							varModel.get(@device[deviceParam], @webService.id, "EDITOR_BY_#{deviceParam}")
						.then (result) ->
							m.chai.expect(result).to.equal(undefined)

					it "can create and then retrieve multiple variables by #{deviceParam}", ->
						Promise.all [
							varModel.set(@device[deviceParam], @webService.id, "A_BY_#{deviceParam}", 'a')
							varModel.set(@device[deviceParam], @dbService.id, "B_BY_#{deviceParam}", 'b')
						]
						.then =>
							varModel.getAllByDevice(@device[deviceParam])
						.then (result) ->
							m.chai.expect(_.find(result, { name: "A_BY_#{deviceParam}" }).value).equal('a')
							m.chai.expect(_.find(result, { name: "B_BY_#{deviceParam}" }).value).equal('b')
						.then =>
							Promise.all [
								varModel.remove(@device[deviceParam], @webService.id, "A_BY_#{deviceParam}")
								varModel.remove(@device[deviceParam], @dbService.id, "B_BY_#{deviceParam}")
							]

				it 'can create and then retrieve multiple variables by application', ->
					Promise.all [
						varModel.set(@device.id, @webService.id, 'A_BY_APPLICATION', 'a')
						varModel.set(@device.id, @dbService.id, 'B_BY_APPLICATION', 'b')
					]
					.then =>
						varModel.getAllByApplication(@application.id)
					.then (result) ->
						m.chai.expect(_.find(result, { name: 'A_BY_APPLICATION' }).value).equal('a')
						m.chai.expect(_.find(result, { name: 'B_BY_APPLICATION' }).value).equal('b')
					.then =>
						Promise.all [
							varModel.remove(@device.id, @webService.id, 'A_BY_APPLICATION')
							varModel.remove(@device.id, @dbService.id, 'B_BY_APPLICATION')
						]

			describe 'balena.models.device.isTrackingApplicationRelease()', ->

				it 'should be tracking the latest release, using the device id', ->
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.true

				it 'should be tracking the latest release, using the device uuid', ->
					promise = balena.models.device.isTrackingApplicationRelease(@device.uuid)
					m.chai.expect(promise).to.eventually.be.true

			describe 'balena.models.device.getTargetReleaseHash()', ->

				it 'should retrieve the commit hash of the tracked application release, using the device id', ->
					promise = balena.models.device.getTargetReleaseHash(@device.id)
					m.chai.expect(promise).to.eventually.equal('new-release-commit')

				it 'should retrieve the commit hash of the tracked application release, using the device uuid', ->
					promise = balena.models.device.getTargetReleaseHash(@device.uuid)
					m.chai.expect(promise).to.eventually.equal('new-release-commit')

		describe 'balena.models.device.pinToRelease()', ->

			givenMulticontainerApplicationWithADevice(beforeEach)

			it 'should set the device to a specific release, using the device id & release commit', ->
				balena.models.device.pinToRelease(@device.id, 'old-release-commit')
				.then =>
					promise = balena.models.device.getTargetReleaseHash(@device.id)
					m.chai.expect(promise).to.eventually.equal('old-release-commit')
				.then =>
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.false

			it 'should set the device to a specific release, using the device id & release id', ->
				balena.models.device.pinToRelease(@device.id, @oldRelease.id)
				.then =>
					promise = balena.models.device.getTargetReleaseHash(@device.id)
					m.chai.expect(promise).to.eventually.equal('old-release-commit')
				.then =>
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.false

			it 'should set the device to a specific release, using the device uuid & release commit', ->
				balena.models.device.pinToRelease(@device.uuid, 'old-release-commit')
				.then =>
					promise = balena.models.device.getTargetReleaseHash(@device.id)
					m.chai.expect(promise).to.eventually.equal('old-release-commit')
				.then =>
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.false

			it 'should set the device to a specific release, using the device uuid & release id', ->
				balena.models.device.pinToRelease(@device.uuid, @oldRelease.id)
				.then =>
					promise = balena.models.device.getTargetReleaseHash(@device.id)
					m.chai.expect(promise).to.eventually.equal('old-release-commit')
				.then =>
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.false

		describe 'balena.models.device.trackApplicationRelease()', ->

			givenMulticontainerApplicationWithADevice(beforeEach)

			it 'should set the device to track the current application release, using the device id', ->
				balena.models.device.pinToRelease(@device.id, 'old-release-commit')
				.then =>
					balena.models.device.trackApplicationRelease(@device.id)
				.then =>
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.true

			it 'should set the device to track the current application release, using the device uuid', ->
				balena.models.device.pinToRelease(@device.id, 'old-release-commit')
				.then =>
					balena.models.device.trackApplicationRelease(@device.uuid)
				.then =>
					promise = balena.models.device.isTrackingApplicationRelease(@device.id)
					m.chai.expect(promise).to.eventually.be.true

	describe 'given a single application with a device id whose shorter uuid is only numbers', ->

		givenAnApplication(before)

		before ->
			# Preceeding 1 is so that this can't start with a 0, so we get reversible parsing later
			@shortUuid = '1' + Date.now().toString().slice(-6)
			uuid = @shortUuid + balena.models.device.generateUniqueKey().slice(7)
			balena.models.device.register(@application.app_name, uuid)
			.then (deviceInfo) =>
				@deviceInfo = deviceInfo

		describe 'balena.models.device.get()', ->

			it 'should return the device given the shorter uuid as a string', ->
				balena.models.device.get(@shortUuid).then (device) =>
					m.chai.expect(device.id).to.equal(@deviceInfo.id)

			it 'should fail to find the device given the shorter uuid as a number', ->
				promise = balena.models.device.get(parseInt(@shortUuid, 10))
				m.chai.expect(promise).to.be.rejectedWith("Device not found: #{@shortUuid}")

	describe 'given a single application with two offline devices that share the same uuid root', ->

		givenAnApplication(before)

		before ->
			@uuidRoot = 'aaaaaaaaaaaaaaaa'
			uuid1 = @uuidRoot + balena.models.device.generateUniqueKey().slice(16)
			uuid2 = @uuidRoot + balena.models.device.generateUniqueKey().slice(16)

			Promise.all [
				balena.models.device.register(@application.app_name, uuid1)
				balena.models.device.register(@application.app_name, uuid2)
			]

		describe 'balena.models.device.get()', ->

			it 'should be rejected with an error if there is an ambiguation between shorter uuids', ->
				promise = balena.models.device.get(@uuidRoot)

				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaAmbiguousDevice')

		describe 'balena.models.device.has()', ->

			it 'should be rejected with an error for an ambiguous shorter uuid', ->
				promise = balena.models.device.has(@uuidRoot)

				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaAmbiguousDevice')

	describe 'given three compatible applications and a single device', ->

		beforeEach ->
			Promise.props
				application1: balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberrypi3'
				application2: balena.models.application.create
					name: 'BarBaz'
					applicationType: 'microservices-starter'
					deviceType: 'raspberrypi3'
				application3: balena.models.application.create
					name: 'BazFoo'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi2'
			.then (results) =>
				@application1 = results.application1
				@application2 = results.application2
				@application3 = results.application3

				uuid = balena.models.device.generateUniqueKey()
				balena.models.device.register(results.application1.app_name, uuid)
				.then (deviceInfo) =>
					@deviceInfo = deviceInfo

		afterEach ->
			Promise.map [
				@application1.id
				@application2.id
				@application3.id
			], balena.models.application.remove

		describe 'balena.models.device.move()', ->

			it 'should be able to move a device by device uuid and application name', ->
				balena.models.device.move(@deviceInfo.uuid, @application2.app_name).then =>
					balena.models.device.getApplicationName(@deviceInfo.uuid)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application2.app_name)

			it 'should be able to move a device by device id and application id', ->
				balena.models.device.move(@deviceInfo.id, @application2.id).then =>
					balena.models.device.getApplicationName(@deviceInfo.id)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application2.app_name)

			it 'should be able to move a device using shorter uuids', ->
				balena.models.device.move(@deviceInfo.uuid.slice(0, 7), @application2.id).then =>
					balena.models.device.getApplicationName(@deviceInfo.id)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application2.app_name)

			it 'should be able to move a device to an application of the same architecture', ->
				balena.models.device.move(@deviceInfo.id, @application3.id).then =>
					balena.models.device.getApplicationName(@deviceInfo.id)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application3.app_name)

	describe 'given two incompatible applications and a single device', ->

		beforeEach ->
			Promise.props
				application1: balena.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi'
				application2: balena.models.application.create
					name: 'BarBaz'
					applicationType: 'microservices-starter'
					deviceType: 'intel-nuc'
			.then (results) =>
				@application1 = results.application1
				@application2 = results.application2

				uuid = balena.models.device.generateUniqueKey()
				balena.models.device.register(results.application1.app_name, uuid)
				.then (deviceInfo) =>
					@deviceInfo = deviceInfo

		afterEach ->
			Promise.map [
				@application1.id
				@application2.id
			], balena.models.application.remove

		describe 'balena.models.device.move()', ->

			it 'should be rejected with an incompatibility error', ->
				promise = balena.models.device.move(@deviceInfo.uuid, @application2.app_name)
				m.chai.expect(promise).to.be.rejectedWith("Incompatible application: #{@application2.app_name}")

	describe 'helpers', ->

		describe 'balena.models.device.getDashboardUrl()', ->

			it 'should return the respective DashboardUrl when a device uuid is provided', ->
				dashboardUrl = sdkOpts.apiUrl.replace(/api/, 'dashboard')
				m.chai.expect(
					balena.models.device.getDashboardUrl('af1150f1b1734c428fb1606a4cddec6c')
				).to.equal("#{dashboardUrl}/devices/af1150f1b1734c428fb1606a4cddec6c/summary")

			it 'should throw when a device uuid is not a string', ->
				m.chai.expect( -> balena.models.device.getDashboardUrl(1234567))
				.to.throw()

			it 'should throw when a device uuid is not provided', ->
				m.chai.expect( -> balena.models.device.getDashboardUrl())
				.to.throw()

		describe 'balena.models.device.lastOnline()', ->

			it 'should return the string "Connecting..." if the device has no `last_connectivity_event`', ->
				m.chai.expect(
					balena.models.device.lastOnline(last_connectivity_event: null)
				).to.equal('Connecting...')

			it 'should return the correct time string if the device is online', ->
				mockDevice =
					last_connectivity_event: Date.now() - 1000 * 60 * 5
					is_online: true

				m.chai.expect(
					balena.models.device.lastOnline(mockDevice)
				).to.equal('Currently online (for 5 minutes)')

			it 'should return the correct time string if the device is offline', ->
				mockDevice =
					last_connectivity_event: Date.now() - 1000 * 60 * 5
					is_online: false

				m.chai.expect(
					balena.models.device.lastOnline(mockDevice)
				).to.equal('5 minutes ago')

		describe 'balena.models.device._checkOsUpdateTarget()', ->

			uuid = balena.models.device.generateUniqueKey()

			it 'should throw when the current os version is invalid', ->
				[
					['Resin OS ', 'dev']
					['Resin OS ', 'prod']
					['Resin OS 2.0-beta.8', '']
				].forEach ([os_version, os_variant]) ->
					mockDevice = {
						uuid
						device_type: 'raspberrypi3'
						is_online: true
						os_version
						os_variant
					}

					m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
						mockDevice
						'2.29.2+rev1.prod'
					)).to.throw('Invalid current balenaOS version')

			it 'should throw when the device is offline', ->
				[
					['Resin OS 1.21.0', '', '1.28.0']
					['Resin OS 1.30.1', '', '2.5.0+rev1']
					['balenaOS 2.26.0+rev1', 'prod', '2.29.2+rev1.prod']
				].forEach ([os_version, os_variant, target_os_version]) ->
					mockDevice = {
						uuid
						device_type: 'raspberrypi3'
						is_online: false
						os_version
						os_variant
					}

					m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
						mockDevice
						target_os_version
					)).to.throw('The device is offline')

			it 'should throw when the device is running a dev version', ->
				[
					['Resin OS 2.0.0+rev3 (dev)', 'dev']
					['Resin OS 2.0.0+rev3 (dev)', '']
					['Resin OS 2.0.0+rev5 (dev)', '']
					['Resin OS 2.0.2+rev2', 'dev']
					['Resin OS 2.0.3+rev1', 'dev']
					['Resin OS 2.0.4+rev1', 'dev']
					['Resin OS 2.0.5', 'dev']
					['Resin OS 2.0.5+rev1', 'dev']
					['Resin OS 2.0.6+rev1', 'dev']
					['Resin OS 2.0.6+rev2', 'dev']
					['Resin OS 2.1.0+rev1', 'dev']
					['Resin OS 2.2.0+rev1', 'dev']
					['Resin OS 2.9.7+rev1', 'dev']
					['Resin OS 2.12.0+rev1', 'dev']
					['Resin OS 2.12.1+rev1', 'dev']
					['Resin OS 2.12.3', 'dev']
					['Resin OS 2.12.3+rev1', 'dev']
					['balenaOS 2.26.0', 'dev']
					['balenaOS 2.26.0+rev1', 'dev']
					['balenaOS 2.28.0+rev1', 'dev']
				].forEach ([os_version, os_variant]) ->
					mockDevice = {
						uuid
						device_type: 'raspberrypi3'
						is_online: true
						os_version
						os_variant
					}

					m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
						mockDevice
						'2.29.2+rev1.prod'
					)).to.throw('Updates cannot be performed on development balenaOS variants')

			it 'should throw when the device is running a pre-release version', ->
				[
					['Resin OS 2.0.0-beta.1', '']
					['Resin OS 2.0.0-beta.3', '']
					['Resin OS 2.0.0-beta11.rev1', '']
					['Resin OS 2.0.0-beta.8', '']
					['Resin OS 2.0.0-beta.8', 'prod']
					['balenaOS 2.0.0-beta12.rev1', 'prod']
					['Resin OS 2.0.0-rc1.rev1', '']
					['Resin OS 2.0.0-rc1.rev2', 'prod']
					['Resin OS 2.0.0-rc1.rev2', '']
					['Resin OS 2.0.0-rc6.rev1 (prod)', '']
					['Resin OS 2.0.1-beta.4', '']
					['Resin OS 2.0.2-beta.2', '']
					['Resin OS 2.0.2-beta.7', '']
					['Resin OS 2.9.0-multi1+rev1', 'dev']
					['balenaOS 2.28.0-beta1.rev1', 'prod']
				].forEach ([os_version, os_variant]) ->
					mockDevice = {
						uuid
						device_type: 'raspberrypi3'
						is_online: true
						os_version
						os_variant
					}

					m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
						mockDevice
						'2.29.2+rev1.prod'
					)).to.throw('Updates cannot be performed on pre-release balenaOS versions')

			describe 'v1 -> v1 hup', ->

				[
					'raspberrypi3'
					'intel-nuc'
				].forEach (device_type) ->

					describe "given a #{device_type}", ->

						it 'should throw when current os version is < 1.8.0', ->
							[
								['Resin OS 1.2.1', '']
								['Resin OS 1.6.0', '']
								['Resin OS 1.7.2', '']
							].forEach ([os_version, os_variant]) ->
								mockDevice = {
									uuid
									device_type
									is_online: true
									os_version
									os_variant
								}

								m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
									mockDevice
									'1.26.0'
								)).to.throw('Current OS version must be >= 1.8.0')

						it 'should throw when the target os version is below the min supported v1 version', ->
							[
								['Resin OS 1.8.0', '']
								['Resin OS 1.10.0', '']
								['Resin OS 1.19.0', '']
								['Resin OS 1.21.0', '']
							].forEach ([os_version, os_variant]) ->
								mockDevice = {
									uuid
									device_type
									is_online: true
									os_version
									os_variant
								}

								m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
									mockDevice
									'1.25.0'
								)).to.throw('Target OS version must be >= 1.26.0')

						it 'should not throw when it is a valid v1 -> v1 hup', ->
							[
								['Resin OS 1.8.0', '']
								['Resin OS 1.10.0', '']
								['Resin OS 1.19.0', '']
								['Resin OS 1.21.0', '']
							].forEach ([os_version, os_variant]) ->
								mockDevice = {
									uuid
									device_type
									is_online: true
									os_version
									os_variant
								}

								m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
									mockDevice
									'1.28.0'
								)).to.not.throw()

			describe 'v1 -> v2 hup', ->

				describe 'given a raspberrypi3', ->

					it 'should throw when current os version is < 1.8.0', ->
						[
							['Resin OS 1.2.1', '']
							['Resin OS 1.6.0', '']
							['Resin OS 1.7.2', '']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'raspberrypi3'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.5.0+rev1'
							)).to.throw('Current OS version must be >= 1.8.0')

					it 'should not throw when it is a valid v1 -> v2 hup', ->
						[
							['Resin OS 1.8.0', '']
							['Resin OS 1.10.0', '']
							['Resin OS 1.19.0', '']
							['Resin OS 1.21.0', '']
							['Resin OS 1.26.1', '']
							['Resin OS 1.30.1', '']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'raspberrypi3'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.5.0+rev1'
							)).to.not.throw()

				describe 'given a beaglebone-black', ->

					it 'should throw when current os version is < 1.30.1', ->
						[
							['Resin OS 1.2.1', '']
							['Resin OS 1.6.0', '']
							['Resin OS 1.7.2', '']
							['Resin OS 1.8.0', '']
							['Resin OS 1.10.0', '']
							['Resin OS 1.19.0', '']
							['Resin OS 1.21.0', '']
							['Resin OS 1.26.1', '']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'beaglebone-black'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.5.0+rev1'
							)).to.throw('Current OS version must be >= 1.30.1')

					it 'should not throw when it is a valid v1 -> v2 hup', ->
						[
							['Resin OS 1.30.1', '']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'beaglebone-black'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.5.0+rev1'
							)).to.not.throw()

			describe 'v2 -> v2 hup', ->

				describe 'given a raspberrypi3', ->

					it 'should throw when current os version is < 2.0.0+rev1', ->
						[
							['Resin OS 2.0.0.rev0 (prod)', 'prod']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'raspberrypi3'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.1.0+rev1.prod'
							)).to.throw('Current OS version must be >= 2.0.0+rev1')

					it 'should not throw when it is a valid v2 -> v2 hup', ->
						[
							['Resin OS 2.0.0.rev1 (prod)', 'prod']
							['Resin OS 2.0.0.rev1 (prod)', '']
							['Resin OS 2.0.0+rev2', 'prod']
							['Resin OS 2.0.0+rev2 (prod)', 'prod']
							['Resin OS 2.0.0+rev2 (prod)', '']
							['Resin OS 2.0.0+rev3', 'prod']
							['Resin OS 2.0.0+rev3 (prod)', 'prod']
							['Resin OS 2.0.0+rev3 (prod)', '']
							['Resin OS 2.0.0+rev4 (prod)', 'prod']
							['Resin OS 2.0.0+rev4 (prod)', '']
							['Resin OS 2.0.0+rev5 (prod)', 'prod']
							['Resin OS 2.0.1.rev1', '']
							['Resin OS 2.0.2+rev2', '']
							['Resin OS 2.0.3+rev1', 'prod']
							['Resin OS 2.0.4+rev1', 'prod']
							['Resin OS 2.0.4+rev2', 'prod']
							['Resin OS 2.0.5+rev1', 'prod']
							['Resin OS 2.0.6+rev1', 'prod']
							['Resin OS 2.0.6+rev2', 'prod']
							['Resin OS 2.0.6+rev2', '']
							['Resin OS 2.1.0+rev1', 'prod']
							['Resin OS 2.2.0+rev1', 'prod']
							['Resin OS 2.9.7+rev1', 'prod']
							['Resin OS 2.12.0+rev1', 'prod']
							['Resin OS 2.12.1+rev1', 'prod']
							['balenaOS 2.26.0+rev1', 'prod']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'raspberrypi3'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.29.2+rev1.prod'
							)).to.not.throw()

				describe 'given a jetson-tx2', ->

					it 'should throw when current os version is < 2.7.4', ->
						[
							['Resin OS 2.0.0.rev1 (prod)', 'prod']
							['Resin OS 2.0.0.rev1 (prod)', '']
							['Resin OS 2.0.0+rev2', 'prod']
							['Resin OS 2.0.0+rev2 (prod)', 'prod']
							['Resin OS 2.0.0+rev2 (prod)', '']
							['Resin OS 2.0.0.rev1 (prod)', 'prod']
							['Resin OS 2.0.0.rev1 (prod)', '']
							['Resin OS 2.0.0+rev2', 'prod']
							['Resin OS 2.0.0+rev2 (prod)', 'prod']
							['Resin OS 2.0.0+rev2 (prod)', '']
							['Resin OS 2.0.0+rev3', 'prod']
							['Resin OS 2.0.0+rev3 (prod)', 'prod']
							['Resin OS 2.0.0+rev3 (prod)', '']
							['Resin OS 2.0.0+rev4 (prod)', 'prod']
							['Resin OS 2.0.0+rev4 (prod)', '']
							['Resin OS 2.0.0+rev5 (prod)', 'prod']
							['Resin OS 2.0.1.rev1', '']
							['Resin OS 2.0.2+rev2', '']
							['Resin OS 2.0.3+rev1', 'prod']
							['Resin OS 2.0.4+rev1', 'prod']
							['Resin OS 2.0.4+rev2', 'prod']
							['Resin OS 2.0.5+rev1', 'prod']
							['Resin OS 2.0.6+rev1', 'prod']
							['Resin OS 2.0.6+rev2', 'prod']
							['Resin OS 2.0.6+rev2', '']
							['Resin OS 2.1.0+rev1', 'prod']
							['Resin OS 2.2.0+rev1', 'prod']
							['Resin OS 2.3.0+rev1', 'prod']
							['Resin OS 2.3.0+rev2', 'prod']
							['Resin OS 2.4.1+rev1', 'prod']
							['Resin OS 2.4.2+rev1', 'prod']
							['Resin OS 2.6.0+rev1', 'prod']
							['Resin OS 2.7.2+rev1', 'prod']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'jetson-tx2'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.29.2+rev1.prod'
							)).to.throw('Current OS version must be >= 2.7.4')

					it 'should not throw when it is a valid v2 -> v2 hup', ->
						[
							['Resin OS 2.7.4+rev1', 'prod']
							['Resin OS 2.7.4+rev2', 'prod']
							['Resin OS 2.7.5+rev1', 'prod']
							['Resin OS 2.7.5+rev2', 'prod']
							['Resin OS 2.7.6+rev1', 'prod']
							['Resin OS 2.7.8+rev1', 'prod']
							['Resin OS 2.7.8+rev2', 'prod']
							['Resin OS 2.9.7+rev1', 'prod']
							['Resin OS 2.12.0+rev1', 'prod']
							['Resin OS 2.12.1+rev1', 'prod']
							['balenaOS 2.26.0+rev1', 'prod']
						].forEach ([os_version, os_variant]) ->
							mockDevice = {
								uuid
								device_type: 'jetson-tx2'
								is_online: true
								os_version
								os_variant
							}

							m.chai.expect(-> balena.models.device._checkOsUpdateTarget(
								mockDevice
								'2.29.2+rev1.prod'
							)).to.not.throw()
