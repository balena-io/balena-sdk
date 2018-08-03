_ = require('lodash')
m = require('mochainon')
superagent = require('superagent')
Promise = require('bluebird')

{ resin, givenLoggedInUser, givenMulticontainerApplication, sdkOpts, IS_BROWSER } = require('../setup')

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

	givenLoggedInUser()

	describe 'given no applications', ->

		describe 'resin.models.device.getDisplayName()', ->

			it 'should get the display name for a known slug', ->
				promise = resin.models.device.getDisplayName('raspberry-pi')
				m.chai.expect(promise).to.eventually.equal('Raspberry Pi (v1 and Zero)')

			it 'should get the display name given a device type alias', ->
				promise = resin.models.device.getDisplayName('raspberrypi')
				m.chai.expect(promise).to.eventually.equal('Raspberry Pi (v1 and Zero)')

			it 'should eventually be undefined if the slug is invalid', ->
				promise = resin.models.device.getDisplayName('asdf')
				m.chai.expect(promise).to.eventually.be.undefined

		describe 'resin.models.device.getDeviceSlug()', ->

			it 'should eventually be the slug from a display name', ->
				promise = resin.models.device.getDeviceSlug('Raspberry Pi (v1 and Zero)')
				m.chai.expect(promise).to.eventually.equal('raspberry-pi')

			it 'should eventually be the slug if passing already a slug', ->
				promise = resin.models.device.getDeviceSlug('raspberry-pi')
				m.chai.expect(promise).to.eventually.equal('raspberry-pi')

			it 'should eventually be undefined if the display name is invalid', ->
				promise = resin.models.device.getDeviceSlug('asdf')
				m.chai.expect(promise).to.eventually.be.undefined

			it 'should eventually be the slug if passing an alias', ->
				promise = resin.models.device.getDeviceSlug('raspberrypi')
				m.chai.expect(promise).to.eventually.equal('raspberry-pi')

		describe 'resin.models.device.getSupportedDeviceTypes()', ->

			it 'should return a non empty array', ->
				resin.models.device.getSupportedDeviceTypes().then (deviceTypes) ->
					m.chai.expect(_.isArray(deviceTypes)).to.be.true
					m.chai.expect(deviceTypes).to.not.have.length(0)

			it 'should return all valid display names', ->
				resin.models.device.getSupportedDeviceTypes().each (deviceType) ->
					promise = resin.models.device.getDeviceSlug(deviceType)
					m.chai.expect(promise).to.eventually.not.be.undefined

		describe 'resin.models.device.getManifestBySlug()', ->

			it 'should become the manifest if the slug is valid', ->
				resin.models.device.getManifestBySlug('raspberry-pi').then (manifest) ->
					m.chai.expect(_.isPlainObject(manifest)).to.be.true
					m.chai.expect(manifest.slug).to.exist
					m.chai.expect(manifest.name).to.exist
					m.chai.expect(manifest.options).to.exist

			it 'should be rejected if the device slug is invalid', ->
				promise = resin.models.device.getManifestBySlug('foobar')
				m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobar')

			it 'should become the manifest given a device type alias', ->
				resin.models.device.getManifestBySlug('raspberrypi').then (manifest) ->
					m.chai.expect(manifest.slug).to.equal('raspberry-pi')

		describe 'resin.models.device.getStatus()', ->

			it 'should return offline for offline devices', ->
				promise = resin.models.device.getStatus({ is_online: false })
				m.chai.expect(promise).to.eventually.equal('offline')

			it 'should return idle for idle devices', ->
				promise = resin.models.device.getStatus({ is_online: true })
				m.chai.expect(promise).to.eventually.equal('idle')

	describe 'given a single application without devices', ->

		beforeEach ->
			resin.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

		describe 'resin.models.device.getAll()', ->

			it 'should become an empty array', ->
				promise = resin.models.device.getAll()
				m.chai.expect(promise).to.become([])

		describe 'resin.models.device.getAllByApplication()', ->

			it 'should become an empty array', ->
				promise = resin.models.device.getAllByApplication(@application.id)
				m.chai.expect(promise).to.become([])

		describe 'resin.models.device.generateUniqueKey()', ->

			it 'should generate a valid uuid', ->
				uuid = resin.models.device.generateUniqueKey()

				m.chai.expect(uuid).to.be.a('string')
				m.chai.expect(uuid).to.have.length(62)
				m.chai.expect(uuid).to.match(/^[a-z0-9]{62}$/)

			it 'should generate different uuids', ->
				one = resin.models.device.generateUniqueKey()
				two = resin.models.device.generateUniqueKey()
				three = resin.models.device.generateUniqueKey()

				m.chai.expect(one).to.not.equal(two)
				m.chai.expect(two).to.not.equal(three)

		describe 'resin.models.device.getManifestByApplication()', ->

			it 'should return the appropriate manifest for an application name', ->
				resin.models.device.getManifestByApplication(@application.app_name).then (manifest) =>
					m.chai.expect(manifest.slug).to.equal(@application.device_type)

			it 'should return the appropriate manifest for an application id', ->
				resin.models.device.getManifestByApplication(@application.id).then (manifest) =>
					m.chai.expect(manifest.slug).to.equal(@application.device_type)

			it 'should be rejected if the application name does not exist', ->
				promise = resin.models.device.getManifestByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = resin.models.device.getManifestByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'resin.models.device.register()', ->

			it 'should be able to register a device to a valid application name', ->
				uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(@application.app_name, uuid)
				.then =>
					promise = resin.models.device.getAllByApplication(@application.app_name)
					m.chai.expect(promise).to.eventually.have.length(1)

			it 'should be able to register a device to a valid application id', ->
				uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(@application.id, uuid)
				.then =>
					promise = resin.models.device.getAllByApplication(@application.app_name)
					m.chai.expect(promise).to.eventually.have.length(1)

			it 'should become valid device registration info', ->
				uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(@application.id, uuid).then (deviceInfo) ->
					m.chai.expect(deviceInfo.uuid).to.equal(uuid)
					m.chai.expect(deviceInfo.api_key).to.be.a('string')

			it 'should be rejected if the application name does not exist', ->
				uuid = resin.models.device.generateUniqueKey()
				promise = resin.models.device.register('HelloWorldApp', uuid)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				uuid = resin.models.device.generateUniqueKey()
				promise = resin.models.device.register(999999, uuid)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

	describe 'given a single application with a single offline device', ->

		beforeEach ->
			resin.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

				uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(application.app_name, uuid)
				.then (deviceInfo) ->
					resin.models.device.get(deviceInfo.uuid)
				.then (device) =>
					@device = device

		describe 'resin.models.device.getAll()', ->

			it 'should become the device', ->
				resin.models.device.getAll().then (devices) =>
					m.chai.expect(devices).to.have.length(1)
					m.chai.expect(devices[0].id).to.equal(@device.id)

			it 'should support arbitrary pinejs options', ->
				resin.models.device.getAll($select: [ 'id' ])
				.then ([ device ]) =>
					m.chai.expect(device.id).to.equal(@device.id)
					m.chai.expect(device.device_name).to.equal(undefined)

		describe 'resin.models.device.getAllByApplication()', ->

			it 'should get the device given the right application name', ->
				resin.models.device.getAllByApplication(@application.app_name).then (devices) =>
					m.chai.expect(devices).to.have.length(1)
					m.chai.expect(devices[0].id).to.equal(@device.id)

			it 'should get the device given the right application id', ->
				resin.models.device.getAllByApplication(@application.id).then (devices) =>
					m.chai.expect(devices).to.have.length(1)
					m.chai.expect(devices[0].id).to.equal(@device.id)

			it 'should be rejected if the application name does not exist', ->
				promise = resin.models.device.getAllByApplication('HelloWorldApp')
				m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

			it 'should be rejected if the application id does not exist', ->
				promise = resin.models.device.getAllByApplication(999999)
				m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			it 'should support arbitrary pinejs options', ->
				resin.models.device.getAllByApplication(@application.id, $select: [ 'id' ])
				.then ([ device ]) =>
					m.chai.expect(device.id).to.equal(@device.id)
					m.chai.expect(device.device_name).to.equal(undefined)

		describe 'resin.models.device.getAllByParentDevice()', ->
			beforeEach ->
				Promise.props
					userId: resin.auth.getUserId()
					childApplication: resin.models.application.create
						name: 'ChildApp'
						applicationType: 'microservices-starter'
						deviceType: @application.device_type
						parent: @application.id
				.then ({ userId, @childApplication }) =>
					# We don't use the built-in .register or resin-register-device,
					# because they don't yet support parent devices.
					resin.pine.post
						resource: 'device'
						body:
							belongs_to__user: userId
							belongs_to__application: @childApplication.id
							device_type: @childApplication.device_type
							uuid: resin.models.device.generateUniqueKey()
							is_managed_by__device: @device.id
				.then (device) =>
					@childDevice = device

			it 'should get the device given the right parent uuid', ->
				resin.models.device.getAllByParentDevice(@device.uuid).then (childDevices) =>
					m.chai.expect(childDevices).to.have.length(1)
					m.chai.expect(childDevices[0].id).to.equal(@childDevice.id)

			it 'should get the device given the right parent id', ->
				resin.models.device.getAllByParentDevice(@device.id).then (childDevices) =>
					m.chai.expect(childDevices).to.have.length(1)
					m.chai.expect(childDevices[0].id).to.equal(@childDevice.id)

			it 'should be empty if the parent device has no children', ->
				promise = resin.models.device.getAllByParentDevice(@childDevice.id).then (childDevices) ->
					m.chai.expect(childDevices).to.have.length(0)

			it 'should be rejected if the parent device does not exist', ->
				promise = resin.models.device.getAllByParentDevice('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should support arbitrary pinejs options', ->
				resin.models.device.getAllByParentDevice(@device.id, $select: [ 'id' ])
				.then ([ childDevice ]) =>
					m.chai.expect(childDevice.id).to.equal(@childDevice.id)
					m.chai.expect(childDevice.device_name).to.equal(undefined)

		describe 'resin.models.device.get()', ->

			it 'should be able to get the device by uuid', ->
				resin.models.device.get(@device.uuid).then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)

			it 'should be able to get the device by id', ->
				resin.models.device.get(@device.id).then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)

			it 'should be rejected if the device name does not exist', ->
				promise = resin.models.device.get('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.get(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			it 'should be able to use a shorter uuid', ->
				resin.models.device.get(@device.uuid.slice(0, 8)).then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)

			it 'should support arbitrary pinejs options', ->
				resin.models.device.get(@device.id, $select: [ 'id' ])
				.then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)
					m.chai.expect(device.device_name).to.equal(undefined)

		describe 'resin.models.device.getByName()', ->

			it 'should be able to get the device', ->
				resin.models.device.getByName(@device.device_name).then (devices) =>
					m.chai.expect(devices).to.have.length(1)
					m.chai.expect(devices[0].id).to.equal(@device.id)

			it 'should be rejected if the device does not exist', ->
				promise = resin.models.device.getByName('HelloWorldDevice')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: HelloWorldDevice')

			it 'should support arbitrary pinejs options', ->
				resin.models.device.getByName(@device.device_name, $select: [ 'id' ])
				.then ([ device ]) =>
					m.chai.expect(device.id).to.equal(@device.id)
					m.chai.expect(device.device_name).to.equal(undefined)

		describe 'resin.models.device.getName()', ->

			it 'should get the correct name by uuid', ->
				promise = resin.models.device.getName(@device.uuid)
				m.chai.expect(promise).to.eventually.equal(@device.device_name)

			it 'should get the correct name by id', ->
				promise = resin.models.device.getName(@device.id)
				m.chai.expect(promise).to.eventually.equal(@device.device_name)

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.getName('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.getName(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.getApplicationName()', ->

			it 'should get the correct application name from a device uuid', ->
				promise = resin.models.device.getApplicationName(@device.uuid)
				m.chai.expect(promise).to.eventually.equal(@application.app_name)

			it 'should get the correct application name from a device id', ->
				promise = resin.models.device.getApplicationName(@device.id)
				m.chai.expect(promise).to.eventually.equal(@application.app_name)

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.getApplicationName('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.getApplicationName(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.has()', ->

			it 'should eventually be true if the device uuid exists', ->
				promise = resin.models.device.has(@device.uuid)
				m.chai.expect(promise).to.eventually.be.true

			it 'should eventually be true if the device id exists', ->
				promise = resin.models.device.has(@device.id)
				m.chai.expect(promise).to.eventually.be.true

			it 'should return false if the device id is undefined', ->
				promise = resin.models.application.has(undefined)
				m.chai.expect(promise).to.eventually.be.false

			it 'should eventually be false if the device uuid does not exist', ->
				promise = resin.models.device.has('asdfghjkl')
				m.chai.expect(promise).to.eventually.be.false

			it 'should eventually be false if the device id does not exist', ->
				promise = resin.models.device.has(999999)
				m.chai.expect(promise).to.eventually.be.false

		describe 'resin.models.device.isOnline()', ->

			it 'should eventually be false if the device uuid is offline', ->
				promise = resin.models.device.isOnline(@device.uuid)
				m.chai.expect(promise).to.eventually.be.false

			it 'should eventually be false if the device id is offline', ->
				promise = resin.models.device.isOnline(@device.id)
				m.chai.expect(promise).to.eventually.be.false

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.isOnline('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.isOnline(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.getLocalIPAddresses()', ->

			it 'should be rejected with an offline error if the device uuid is offline', ->
				promise = resin.models.device.getLocalIPAddresses(@device.uuid)
				m.chai.expect(promise).to.be.rejectedWith("The device is offline: #{@device.uuid}")

			it 'should be rejected with an offline error if the device id is offline', ->
				promise = resin.models.device.getLocalIPAddresses(@device.id)
				m.chai.expect(promise).to.be.rejectedWith("The device is offline: #{@device.id}")

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.getLocalIPAddresses('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.getLocalIPAddresses(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.remove()', ->

			it 'should be able to remove the device by uuid', ->
				resin.models.device.remove(@device.uuid)
					.then(-> resin.models.device.getAll())
					.then (devices) ->
						m.chai.expect(devices).to.deep.equal([])

			it 'should be able to remove the device by id', ->
				resin.models.device.remove(@device.id)
					.then(-> resin.models.device.getAll())
					.then (devices) ->
						m.chai.expect(devices).to.deep.equal([])

			it 'should be able to remove the device using a shorter uuid', ->
				resin.models.device.remove(@device.uuid.slice(0, 7))
					.then(-> resin.models.device.getAll())
					.then (devices) ->
						m.chai.expect(devices).to.deep.equal([])

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.remove('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.remove(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.rename()', ->

			it 'should be able to rename the device by uuid', ->
				resin.models.device.rename(@device.uuid, 'FooBarDevice').then =>
					resin.models.device.getName(@device.uuid)
				.then (name) ->
					m.chai.expect(name).to.equal('FooBarDevice')

			it 'should be able to rename the device by id', ->
				resin.models.device.rename(@device.id, 'FooBarDevice').then =>
					resin.models.device.getName(@device.id)
				.then (name) ->
					m.chai.expect(name).to.equal('FooBarDevice')

			it 'should be able to rename the device using a shorter uuid', ->
				resin.models.device.rename(@device.uuid.slice(0, 7), 'FooBarDevice').then =>
					resin.models.device.getName(@device.uuid)
				.then (name) ->
					m.chai.expect(name).to.equal('FooBarDevice')

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.rename('asdfghjkl', 'Foo Bar')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.rename(999999, 'Foo Bar')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.setCustomLocation()', ->

			it 'should be able to set the location of a device by uuid', ->
				resin.models.device.setCustomLocation @device.uuid,
					latitude: 41.383333
					longitude: 2.183333
				.then =>
					resin.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('41.383333')
					m.chai.expect(device.custom_longitude).to.equal('2.183333')

			it 'should be able to set the location of a device by id', ->
				resin.models.device.setCustomLocation @device.id,
					latitude: 41.383333
					longitude: 2.183333
				.then =>
					resin.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('41.383333')
					m.chai.expect(device.custom_longitude).to.equal('2.183333')

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.setCustomLocation 'asdfghjkl',
					latitude: 41.383333
					longitude: 2.183333
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.setCustomLocation 999999,
					latitude: 41.383333
					longitude: 2.183333
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.unsetCustomLocation()', ->

			beforeEach ->
				resin.models.device.setCustomLocation @device.id,
					latitude: 41.383333
					longitude: 2.183333

			it 'should be able to unset the location of a device by uuid', ->
				resin.models.device.unsetCustomLocation(@device.uuid).then =>
					resin.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('')
					m.chai.expect(device.custom_longitude).to.equal('')

			it 'should be able to unset the location of a device by id', ->
				resin.models.device.unsetCustomLocation(@device.id).then =>
					resin.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.custom_latitude).to.equal('')
					m.chai.expect(device.custom_longitude).to.equal('')

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.unsetCustomLocation('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.unsetCustomLocation(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.note()', ->

			it 'should be able to note a device by uuid', ->
				resin.models.device.note(@device.uuid, 'What you do today can improve all your tomorrows').then =>
					resin.models.device.get(@device.uuid)
				.then (device) ->
					m.chai.expect(device.note).to.equal('What you do today can improve all your tomorrows')

			it 'should be able to note a device by id', ->
				resin.models.device.note(@device.id, 'What you do today can improve all your tomorrows').then =>
					resin.models.device.get(@device.id)
				.then (device) ->
					m.chai.expect(device.note).to.equal('What you do today can improve all your tomorrows')

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.note('asdfghjkl', 'My note')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.note(999999, 'My note')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

		describe 'resin.models.device.hasDeviceUrl()', ->

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.hasDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.hasDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given device url is disabled', ->

				it 'should eventually be false given a device uuid', ->
					promise = resin.models.device.hasDeviceUrl(@device.uuid)
					m.chai.expect(promise).to.eventually.be.false

				it 'should eventually be false given a device id', ->
					promise = resin.models.device.hasDeviceUrl(@device.id)
					m.chai.expect(promise).to.eventually.be.false

			describe 'given device url is enabled', ->

				beforeEach ->
					resin.models.device.enableDeviceUrl(@device.id)

				it 'should eventually be true given a device uuid', ->
					promise = resin.models.device.hasDeviceUrl(@device.uuid)
					m.chai.expect(promise).to.eventually.be.true

				it 'should eventually be true given a device id', ->
					promise = resin.models.device.hasDeviceUrl(@device.id)
					m.chai.expect(promise).to.eventually.be.true

		describe 'resin.models.device.getDeviceUrl()', ->

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.getDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.getDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given device url is disabled', ->

				it 'should be rejected with an error given a device uuid', ->
					promise = resin.models.device.getDeviceUrl(@device.uuid)
					m.chai.expect(promise).to.be.rejectedWith("Device is not web accessible: #{@device.uuid}")

				it 'should be rejected with an error given a device id', ->
					promise = resin.models.device.getDeviceUrl(@device.id)
					m.chai.expect(promise).to.be.rejectedWith("Device is not web accessible: #{@device.id}")

			describe 'given device url is enabled', ->

				beforeEach ->
					resin.models.device.enableDeviceUrl(@device.id)

				it 'should eventually return the correct device url given a shorter uuid', ->
					promise = resin.models.device.getDeviceUrl(@device.uuid.slice(0, 7))
					m.chai.expect(promise).to.eventually.match(/[a-z0-9]{62}/)

				it 'should eventually return the correct device url given an id', ->
					promise = resin.models.device.getDeviceUrl(@device.id)
					m.chai.expect(promise).to.eventually.match(/[a-z0-9]{62}/)

				it 'should eventually be an absolute url given a uuid', ->
					resin.models.device.getDeviceUrl(@device.uuid)
					.then(makeRequest)
					.then (response) ->
						m.chai.expect(response.isError).to.equal(true)

						# in the browser we don't get the details
						# honestly it's unclear why, as it works for other services
						return if IS_BROWSER

						# Because the device is not online
						m.chai.expect(response.status).to.equal(503)

						# Standard HTML title for web enabled devices
						m.chai.expect(response.response).to.match(
							/<title>Resin.io Device Public URLs<\/title>/
						)

		describe 'resin.models.device.enableDeviceUrl()', ->

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.enableDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.enableDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given the device url is disabled', ->

				it 'should be able to enable web access using a uuid', ->
					resin.models.device.enableDeviceUrl(@device.uuid).then =>
						promise = resin.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.true

				it 'should be able to enable web access using an id', ->
					resin.models.device.enableDeviceUrl(@device.id).then =>
						promise = resin.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.true

				it 'should be able to enable web access using a shorter uuid', ->
					resin.models.device.enableDeviceUrl(@device.uuid.slice(0, 7)).then =>
						promise = resin.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.true

		describe 'resin.models.device.disableDeviceUrl()', ->

			it 'should be rejected if the device uuid does not exist', ->
				promise = resin.models.device.disableDeviceUrl('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.disableDeviceUrl(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given device url is enabled', ->

				beforeEach ->
					resin.models.device.enableDeviceUrl(@device.id)

				it 'should be able to disable web access using a uuid', ->
					resin.models.device.disableDeviceUrl(@device.uuid).then =>
						promise = resin.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.false

				it 'should be able to disable web access using an id', ->
					resin.models.device.disableDeviceUrl(@device.id).then =>
						promise = resin.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.false

				it 'should be able to disable web access using a shorter uuid', ->
					resin.models.device.disableDeviceUrl(@device.uuid.slice(0, 7)).then =>
						promise = resin.models.device.hasDeviceUrl(@device.id)
						m.chai.expect(promise).to.eventually.be.false

		describe 'resin.models.device.generateDeviceKey()', ->

			it 'should be able to generate a device key by uuid', ->
				resin.models.device.generateDeviceKey(@device.uuid).then (deviceApiKey) ->
					m.chai.expect(deviceApiKey).to.be.a.string
					m.chai.expect(deviceApiKey).to.have.length(32)

			it 'should be able to generate a device key by id', ->
				resin.models.device.generateDeviceKey(@device.id).then (deviceApiKey) ->
					m.chai.expect(deviceApiKey).to.be.a.string
					m.chai.expect(deviceApiKey).to.have.length(32)

			it 'should be rejected if the device name does not exist', ->
				promise = resin.models.device.generateDeviceKey('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.generateDeviceKey(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			it 'should be able to use a shorter uuid', ->
				resin.models.device.generateDeviceKey(@device.uuid.slice(0, 8)).then (deviceApiKey) ->
					m.chai.expect(deviceApiKey).to.be.a.string
					m.chai.expect(deviceApiKey).to.have.length(32)

		describe 'resin.models.device.grantSupportAccess()', ->
			it 'should throw an error if the expiry time stamp is in the past', ->
				expiryTimestamp = Date.now() - 3600 * 1000

				m.chai.expect( => resin.models.device.grantSupportAccess(@device.id, expiryTimestamp))
				.to.throw()

			it 'should throw an error if the expiry time stamp is undefined', ->
				m.chai.expect( => resin.models.device.grantSupportAccess(@device.id))
				.to.throw()

			it 'should grant support access for the correct amount of time', ->
				expiryTimestamp = Date.now() + 3600 * 1000
				promise = resin.models.device.grantSupportAccess(@device.id, expiryTimestamp)
				.then =>
					resin.models.device.get(@device.id)
				.then ({ is_accessible_by_support_until__date }) ->
					Date.parse(is_accessible_by_support_until__date)

				m.chai.expect(promise).to.eventually.equal(expiryTimestamp)

		describe 'resin.models.device.revokeSupportAccess()', ->
			it 'should revoke support access', ->
				resin.models.device.grantSupportAccess(@device.id, Date.now() + 3600 * 1000)
				.then =>
					resin.models.device.revokeSupportAccess(@device.id)
				.then =>
					resin.models.device.get(@device.id)
				.then ({ is_accessible_by_support_until__date }) ->
					m.chai.expect(is_accessible_by_support_until__date).to.be.null

		describe 'resin.models.device.tags', ->

			appTagTestOptions =
				model: resin.models.device.tags
				resourceName: 'application'
				uniquePropertyName: 'app_name'

			deviceTagTestOptions =
				model: resin.models.device.tags
				resourceName: 'device'
				uniquePropertyName: 'uuid'

			beforeEach ->
				appTagTestOptions.resourceProvider = => @application
				deviceTagTestOptions.resourceProvider = => @device
				# used for tag creation during the
				# device.tags.getAllByApplication() test
				appTagTestOptions.setTagResourceProvider = => @device

			describe 'resin.models.device.tags.getAllByApplication()', ->
				itShouldGetAllTagsByResource(appTagTestOptions)

			describe 'resin.models.device.tags.getAllByDevice()', ->
				itShouldGetAllTagsByResource(deviceTagTestOptions)

			describe 'resin.models.device.tags.getAll()', ->
				itShouldGetAllTags(deviceTagTestOptions)

			describe 'resin.models.device.tags.set()', ->
				itShouldSetTags(deviceTagTestOptions)

			describe 'resin.models.device.tags.remove()', ->
				itShouldRemoveTags(deviceTagTestOptions)

		describe 'resin.models.device.configVar', ->

			configVarModel = resin.models.device.configVar

			['id', 'uuid'].forEach (deviceParam) ->

				it "can create and retrieve a variable by #{deviceParam}", ->
					configVarModel.set(@device[deviceParam], 'RESIN_EDITOR', 'vim')
					.then =>
						configVarModel.get(@device[deviceParam], 'RESIN_EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "can create, update and retrieve a variable by #{deviceParam}", ->
					configVarModel.set(@device[deviceParam], 'RESIN_EDITOR', 'vim')
					.then =>
						configVarModel.set(@device[deviceParam], 'RESIN_EDITOR', 'emacs')
					.then =>
						configVarModel.get(@device[deviceParam], 'RESIN_EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "can create and then retrieve multiple variables by #{deviceParam}", ->
					Promise.all [
						configVarModel.set(@device[deviceParam], 'RESIN_A', 'a')
						configVarModel.set(@device[deviceParam], 'RESIN_B', 'b')
					]
					.then =>
						configVarModel.getAllByDevice(@device[deviceParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: 'RESIN_A' }).value).equal('a')
						m.chai.expect(_.find(result, { name: 'RESIN_B' }).value).equal('b')

				it "can create, delete and then fail to retrieve a variable by #{deviceParam}", ->
					configVarModel.set(@device[deviceParam], 'RESIN_EDITOR', 'vim')
					.then =>
						configVarModel.remove(@device[deviceParam], 'RESIN_EDITOR')
					.then =>
						configVarModel.get(@device[deviceParam], 'RESIN_EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

			it 'can create and then retrieve multiple variables by application', ->
				Promise.all [
					configVarModel.set(@device.id, 'RESIN_A', 'a')
					configVarModel.set(@device.id, 'RESIN_B', 'b')
				]
				.then =>
					configVarModel.getAllByApplication(@application.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'RESIN_A' }).value).equal('a')
					m.chai.expect(_.find(result, { name: 'RESIN_B' }).value).equal('b')

		describe 'resin.models.device.envVar', ->

			envVarModel = resin.models.device.envVar

			['id', 'uuid'].forEach (deviceParam) ->

				it "can create and retrieve a variable by #{deviceParam}", ->
					envVarModel.set(@device[deviceParam], 'EDITOR', 'vim')
					.then =>
						envVarModel.get(@device[deviceParam], 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "can create, update and retrieve a variable by #{deviceParam}", ->
					envVarModel.set(@device[deviceParam], 'EDITOR', 'vim')
					.then =>
						envVarModel.set(@device[deviceParam], 'EDITOR', 'emacs')
					.then =>
						envVarModel.get(@device[deviceParam], 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "can create and then retrieve multiple variables by #{deviceParam}", ->
					Promise.all [
						envVarModel.set(@device[deviceParam], 'A', 'a')
						envVarModel.set(@device[deviceParam], 'B', 'b')
					]
					.then =>
						envVarModel.getAllByDevice(@device[deviceParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: 'A' }).value).equal('a')
						m.chai.expect(_.find(result, { name: 'B' }).value).equal('b')

				it "can create, delete and then fail to retrieve a variable by #{deviceParam}", ->
					envVarModel.set(@device[deviceParam], 'EDITOR', 'vim')
					.then =>
						envVarModel.remove(@device[deviceParam], 'EDITOR')
					.then =>
						envVarModel.get(@device[deviceParam], 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

			it 'can create and then retrieve multiple variables by application', ->
				Promise.all [
					envVarModel.set(@device.id, 'A', 'a')
					envVarModel.set(@device.id, 'B', 'b')
				]
				.then =>
					envVarModel.getAllByApplication(@application.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'A' }).value).equal('a')
					m.chai.expect(_.find(result, { name: 'B' }).value).equal('b')

	describe 'given a multicontainer application with a single offline device', ->

		givenMulticontainerApplication()

		describe 'resin.models.device.getWithServiceDetails()', ->

			it 'should be able to get the device by uuid', ->
				resin.models.device.getWithServiceDetails(@device.uuid).then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)

			it 'should be able to get the device by id', ->
				resin.models.device.getWithServiceDetails(@device.id).then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)

			it 'should retrieve the current service details', ->
				resin.models.device.getWithServiceDetails(@device.id).then (deviceDetails) =>
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
					resin.pine.post
						resource: 'gateway_download'
						body:
							image: @newWebImage.id
							status: 'downloading'
							is_downloaded_by__device: @device.id
							download_progress: 50
				,
					resin.pine.post
						resource: 'gateway_download'
						body:
							image: @oldWebImage.id
							status: 'deleted'
							is_downloaded_by__device: @device.id
							download_progress: 100
				]
				.then =>
					resin.models.device.getWithServiceDetails(@device.id)
				.then (deviceDetails) =>
					m.chai.expect(deviceDetails.current_gateway_downloads).to.have.lengthOf(1)
					m.chai.expect(deviceDetails.current_gateway_downloads[0]).to.deep.match
						service_id: @webService.id
						image_id: @newWebImage.id
						status: 'downloading'
						download_progress: 50

			it 'should allow options to change the device fields returned', ->
				resin.models.device.getWithServiceDetails @device.id,
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
				promise = resin.models.device.getWithServiceDetails('asdfghjkl')
				m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

			it 'should be rejected if the device id does not exist', ->
				promise = resin.models.device.getWithServiceDetails(999999)
				m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			it 'should be able to use a shorter uuid', ->
				resin.models.device.getWithServiceDetails(@device.uuid.slice(0, 8)).then (device) =>
					m.chai.expect(device.id).to.equal(@device.id)


		describe 'resin.models.device.serviceVar', ->

			varModel = resin.models.device.serviceVar

			['id', 'uuid'].forEach (deviceParam) ->

				it "can create and retrieve a variable by #{deviceParam}", ->
					varModel.set(@device[deviceParam], @webService.id, 'EDITOR', 'vim')
					.then =>
						varModel.get(@device[deviceParam], @webService.id, 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('vim')

				it "can create, update and retrieve a variable by #{deviceParam}", ->
					varModel.set(@device[deviceParam], @webService.id, 'EDITOR', 'vim')
					.then =>
						varModel.set(@device[deviceParam], @webService.id, 'EDITOR', 'emacs')
					.then =>
						varModel.get(@device[deviceParam], @webService.id, 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal('emacs')

				it "can create and then retrieve multiple variables by #{deviceParam}", ->
					Promise.all [
						varModel.set(@device[deviceParam], @webService.id, 'A', 'a')
						varModel.set(@device[deviceParam], @dbService.id, 'B', 'b')
					]
					.then =>
						varModel.getAllByDevice(@device[deviceParam])
					.then (result) ->
						m.chai.expect(_.find(result, { name: 'A' }).value).equal('a')
						m.chai.expect(_.find(result, { name: 'B' }).value).equal('b')

				it "can create, delete and then fail to retrieve a variable by #{deviceParam}", ->
					varModel.set(@device[deviceParam], @webService.id, 'EDITOR', 'vim')
					.then =>
						varModel.remove(@device[deviceParam], @webService.id, 'EDITOR')
					.then =>
						varModel.get(@device[deviceParam], @webService.id, 'EDITOR')
					.then (result) ->
						m.chai.expect(result).to.equal(undefined)

			it 'can create and then retrieve multiple variables by application', ->
				Promise.all [
					varModel.set(@device.id, @webService.id, 'A', 'a')
					varModel.set(@device.id, @dbService.id, 'B', 'b')
				]
				.then =>
					varModel.getAllByApplication(@application.id)
				.then (result) ->
					m.chai.expect(_.find(result, { name: 'A' }).value).equal('a')
					m.chai.expect(_.find(result, { name: 'B' }).value).equal('b')

	describe 'given a single application with a device id whose shorter uuid is only numbers', ->

		beforeEach ->
			resin.models.application.create
				name: 'TestApp'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

				# Preceeding 1 is so that this can't start with a 0, so we get reversible parsing later
				@shortUuid = '1' + Date.now().toString().slice(-6)
				uuid = @shortUuid + resin.models.device.generateUniqueKey().slice(7)
				resin.models.device.register(application.app_name, uuid)
			.then (deviceInfo) =>
				@deviceInfo = deviceInfo

		describe 'resin.models.device.get()', ->

			it 'should return the device given the shorter uuid as a string', ->
				resin.models.device.get(@shortUuid).then (device) =>
					m.chai.expect(device.id).to.equal(@deviceInfo.id)

			it 'should fail to find the device given the shorter uuid as a number', ->
				promise = resin.models.device.get(parseInt(@shortUuid, 10))
				m.chai.expect(promise).to.be.rejectedWith("Device not found: #{@shortUuid}")

	describe 'given a single application with two offline devices that share the same uuid root', ->

		beforeEach ->
			resin.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			.then (application) =>
				@application = application

				@uuidRoot = 'aaaaaaaaaaaaaaaa'
				uuid1 = @uuidRoot + resin.models.device.generateUniqueKey().slice(16)
				uuid2 = @uuidRoot + resin.models.device.generateUniqueKey().slice(16)

				Promise.all [
					resin.models.device.register(application.app_name, uuid1)
					resin.models.device.register(application.app_name, uuid2)
				]

		describe 'resin.models.device.get()', ->

			it 'should be rejected with an error if there is an ambiguation between shorter uuids', ->
				promise = resin.models.device.get(@uuidRoot)

				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'ResinAmbiguousDevice')

		describe 'resin.models.device.has()', ->

			it 'should be rejected with an error for an ambiguous shorter uuid', ->
				promise = resin.models.device.has(@uuidRoot)

				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'ResinAmbiguousDevice')

	describe 'given three compatible applications and a single device', ->

		beforeEach ->
			Promise.props
				application1: resin.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberrypi3'
				application2: resin.models.application.create
					name: 'BarBaz'
					applicationType: 'microservices-starter'
					deviceType: 'raspberrypi3'
				application3: resin.models.application.create
					name: 'BazFoo'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi2'
			.then (results) =>
				@application1 = results.application1
				@application2 = results.application2
				@application3 = results.application3

				uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(results.application1.app_name, uuid)
				.then (deviceInfo) =>
					@deviceInfo = deviceInfo

		describe 'resin.models.device.move()', ->

			it 'should be able to move a device by device uuid and application name', ->
				resin.models.device.move(@deviceInfo.uuid, @application2.app_name).then =>
					resin.models.device.getApplicationName(@deviceInfo.uuid)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application2.app_name)

			it 'should be able to move a device by device id and application id', ->
				resin.models.device.move(@deviceInfo.id, @application2.id).then =>
					resin.models.device.getApplicationName(@deviceInfo.id)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application2.app_name)

			it 'should be able to move a device using shorter uuids', ->
				resin.models.device.move(@deviceInfo.uuid.slice(0, 7), @application2.id).then =>
					resin.models.device.getApplicationName(@deviceInfo.id)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application2.app_name)

			it 'should be able to move a device to an application of the same architecture', ->
				resin.models.device.move(@deviceInfo.id, @application3.id).then =>
					resin.models.device.getApplicationName(@deviceInfo.id)
				.then (applicationName) =>
					m.chai.expect(applicationName).to.equal(@application3.app_name)

	describe 'given two incompatible applications and a single device', ->

		beforeEach ->
			Promise.props
				application1: resin.models.application.create
					name: 'FooBar'
					applicationType: 'microservices-starter'
					deviceType: 'raspberry-pi'
				application2: resin.models.application.create
					name: 'BarBaz'
					applicationType: 'microservices-starter'
					deviceType: 'intel-nuc'
			.then (results) =>
				@application1 = results.application1
				@application2 = results.application2

				uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(results.application1.app_name, uuid)
				.then (deviceInfo) =>
					@deviceInfo = deviceInfo

		describe 'resin.models.device.move()', ->

			it 'should be rejected with an incompatibility error', ->
				promise = resin.models.device.move(@deviceInfo.uuid, @application2.app_name)
				m.chai.expect(promise).to.be.rejectedWith("Incompatible application: #{@application2.app_name}")

	describe 'helpers', ->

		describe 'resin.models.device.getDashboardUrl()', ->

			it 'should return the respective DashboardUrl when a device uuid is provided', ->
				dashboardUrl = sdkOpts.apiUrl.replace(/api/, 'dashboard')
				m.chai.expect(
					resin.models.device.getDashboardUrl('af1150f1b1734c428fb1606a4cddec6c')
				).to.equal("#{dashboardUrl}/devices/af1150f1b1734c428fb1606a4cddec6c/summary")

			it 'should throw when a device uuid is not a string', ->
				m.chai.expect( -> resin.models.device.getDashboardUrl(1234567))
				.to.throw()

			it 'should throw when a device uuid is not provided', ->
				m.chai.expect( -> resin.models.device.getDashboardUrl())
				.to.throw()

		describe 'resin.models.device.lastOnline()', ->

			it 'should return the string "Connecting..." if the device has no `last_connectivity_event`', ->
				m.chai.expect(
					resin.models.device.lastOnline(last_connectivity_event: null)
				).to.equal('Connecting...')

			it 'should return the correct time string if the device is online', ->
				mockDevice =
					last_connectivity_event: Date.now() - 1000 * 60 * 5
					is_online: true

				m.chai.expect(
					resin.models.device.lastOnline(mockDevice)
				).to.equal('Currently online (for 5 minutes)')

			it 'should return the correct time string if the device is offline', ->
				mockDevice =
					last_connectivity_event: Date.now() - 1000 * 60 * 5
					is_online: false

				m.chai.expect(
					resin.models.device.lastOnline(mockDevice)
				).to.equal('5 minutes ago')
