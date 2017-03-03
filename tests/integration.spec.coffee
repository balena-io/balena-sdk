Promise = require('bluebird')

m = require('mochainon')
_ = require('lodash')
errors = require('resin-errors')
superagent = require('superagent')

getPine = require('resin-pine')

PUBLIC_KEY = require('./data/public-key')

IS_BROWSER = window?

if IS_BROWSER
	getSdk = window.resinSdk

	opts =
		apiUrl: 'https://api.resin.io'
		imageMakerUrl: 'https://img.resin.io'

	env = window.__env__
else
	getSdk = require('..')

	fs = Promise.promisifyAll(require('fs'))
	tmp = require('tmp')
	rindle = require('rindle')

	settings = require('resin-settings-client')
	opts =
		apiUrl: settings.get('apiUrl')
		imageMakerUrl: settings.get('imageMakerUrl')
		dataDirectory: settings.get('dataDirectory')

	env = process.env

_.assign opts,
	apiVersion: 'v2'
	apiKey: null
	isBrowser: IS_BROWSER,
	retries: 3

resin = getSdk(opts)
pine = getPine(_.assign({}, opts, { request: resin.request, token: resin.token }))

simpleRequest = (url) ->
	return new Promise (resolve, reject) ->
		superagent.get(url)
		.end (err, res) ->
			# have to normalize because of different behaviour in the browser and node
			resolve
				status: res?.status or err.status or 0
				isError: !!err
				response: res?.text

reset = ->
	return resin.auth.isLoggedIn().then (isLoggedIn) ->
		return if not isLoggedIn

		Promise.all [
			pine.delete
				resource: 'application'

			pine.delete
				resource: 'user__has__public_key'
		]

buildCredentials = ->
	if not env
		throw new Error('Missing environment object?!')

	credentials =
		email: env.RESINTEST_EMAIL
		password: env.RESINTEST_PASSWORD
		username: env.RESINTEST_USERNAME
		userId: _.parseInt(env.RESINTEST_USERID)
		register:
			email: env.RESINTEST_REGISTER_EMAIL
			password: env.RESINTEST_REGISTER_PASSWORD
			username: env.RESINTEST_REGISTER_USERNAME

	if not _.every [
		credentials.email?
		credentials.password?
		credentials.username?
		credentials.userId?
		credentials.register.email?
		credentials.register.password?
		credentials.register.username?
	]
		throw new Error('Missing environment credentials')

	return credentials

credentials = buildCredentials()

describe 'SDK Integration Tests', ->

	# A high timeout number prevents false alarms when
	# running the tests in a slow connection
	@timeout(30 * 60 * 1000)

	beforeEach ->
		resin.interceptors = []

	describe 'factory function', ->

		validKeys = ['auth', 'models', 'logs', 'settings']

		describe 'given no opts', ->

			it 'should return an object with valid keys', ->
				mockResin = getSdk()
				m.chai.expect(mockResin).to.include.keys(validKeys)

		describe 'given empty opts', ->

			it 'should return an object with valid keys', ->
				mockResin = getSdk({})
				m.chai.expect(mockResin).to.include.keys(validKeys)

		describe 'given opts', ->

			it 'should return an object with valid keys', ->
				mockResin = getSdk(opts)
				m.chai.expect(mockResin).to.include.keys(validKeys)

	describe 'given a not logged in user', ->

		beforeEach ->
			resin.auth.logout()

		describe 'Authentication', ->

			describe 'resin.auth.isLogged()', ->

				it 'should eventually be false', ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.false

			describe 'resin.auth.whoami()', ->

				it 'should eventually be undefined', ->
					promise = resin.auth.whoami()
					m.chai.expect(promise).to.eventually.be.undefined

			describe 'resin.auth.logout()', ->

				it 'should not be rejected', ->
					promise = resin.auth.logout()
					m.chai.expect(promise).to.not.be.rejected

			describe 'resin.auth.authenticate()', ->

				it 'should eventually be a valid token given valid credentials', ->
					resin.auth.authenticate(credentials).then(resin.token.isValid).then (isValid) ->
						m.chai.expect(isValid).to.be.true

				it 'should not save the token given valid credentials', ->
					resin.auth.authenticate(credentials).then ->
						promise = resin.auth.isLoggedIn()
						m.chai.expect(promise).to.eventually.be.false

				it 'should be rejected given invalid credentials', ->
					promise = resin.auth.authenticate
						email: 'helloworld@resin.io',
						password: 'asdfghjkl'

					m.chai.expect(promise).to.be.rejectedWith('Unauthorized')

			describe 'resin.auth.getEmail()', ->

				it 'should be rejected with an error', ->
					promise = resin.auth.getEmail()
					m.chai.expect(promise).to.be.rejected
						.and.eventually.have.property('code', 'ResinNotLoggedIn')

			describe 'resin.auth.getUserId()', ->

				it 'should be rejected with an error', ->
					promise = resin.auth.getUserId()
					m.chai.expect(promise).to.be.rejected
						.and.eventually.have.property('code', 'ResinNotLoggedIn')

			describe 'resin.auth.register()', ->

				beforeEach ->
					resin.auth.login
						email: credentials.register.email
						password: credentials.register.password
					.then(resin.auth.getUserId)
					.then (userId) ->
						return resin.request.send
							method: 'DELETE'
							url: "/ewa/user(#{userId})"
							baseUrl: opts.apiUrl
						.then(resin.auth.logout)
					.catch (error) ->
						if error?.message is 'Request error: Unauthorized'
							return
						throw error

				it 'should be able to register an account', ->
					resin.auth.register
						email: credentials.register.email
						password: credentials.register.password
					.then(resin.auth.loginWithToken)
					.then(resin.auth.isLoggedIn)
					.then (isLoggedIn) ->
						m.chai.expect(isLoggedIn).to.be.true

				it 'should not save the token automatically', ->
					resin.auth.register
						email: credentials.register.email
						password: credentials.register.password
					.then(resin.auth.isLoggedIn)
					.then (isLoggedIn) ->
						m.chai.expect(isLoggedIn).to.be.false

				it 'should be rejected if the email is invalid', ->
					promise = resin.auth.register
						email: 'foobarbaz'
						password: credentials.register.password

					m.chai.expect(promise).to.be.rejectedWith('Invalid email')

				it 'should be rejected if the email is taken', ->
					promise = resin.auth.register
						email: credentials.email
						password: credentials.register.password

					m.chai.expect(promise).to.be.rejectedWith('This email is already taken')

		describe 'Config Model', ->

			describe 'resin.models.config.getAll()', ->

				it 'should return all the configuration', ->
					resin.models.config.getAll().then (config) ->
						m.chai.expect(_.isPlainObject(config)).to.be.true
						m.chai.expect(_.isEmpty(config)).to.be.false

			describe 'resin.models.config.getPubNubKeys()', ->

				it 'should become the pubnub keys', ->
					resin.models.config.getPubNubKeys().then (pubnubKeys) ->
						m.chai.expect(_.isString(pubnubKeys.publish_key)).to.be.true
						m.chai.expect(_.isString(pubnubKeys.subscribe_key)).to.be.true
						m.chai.expect(pubnubKeys.publish_key).to.have.length(42)
						m.chai.expect(pubnubKeys.subscribe_key).to.have.length(42)

			describe 'resin.models.config.getMixpanelToken()', ->

				it 'should become the mixpanel token', ->
					resin.models.config.getMixpanelToken().then (mixpanelToken) ->
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

		describe 'Environment Variables Model', ->

			describe 'resin.models.environmentVariables.isSystemVariable()', ->

				it 'should return false for EDITOR', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
					m.chai.expect(result).to.be.false

				it 'should return false for RESINATOR', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
					m.chai.expect(result).to.be.false

				it 'should return true for RESIN', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'RESIN')
					m.chai.expect(result).to.be.true

				it 'should return true for RESIN_API_KEY', ->
					result = resin.models.environmentVariables.isSystemVariable(name: 'RESIN_API_KEY')
					m.chai.expect(result).to.be.true

	describe 'given a logged in fresh user', ->

		beforeEach ->
			resin.auth.login
				email: credentials.email
				password: credentials.password
			.then(reset)

		afterEach ->
			reset()

		describe 'Authentication', ->

			describe 'resin.auth.isLogged()', ->

				it 'should eventually be true', ->
					promise = resin.auth.isLoggedIn()
					m.chai.expect(promise).to.eventually.be.true

			describe 'resin.auth.logout()', ->

				it 'should logout the user', ->
					resin.auth.logout().then ->
						promise = resin.auth.isLoggedIn()
						m.chai.expect(promise).to.eventually.be.false

			describe 'resin.auth.whoami()', ->

				it 'should eventually be the username', ->
					promise = resin.auth.whoami()
					m.chai.expect(promise).to.eventually.equal(credentials.username)

			describe 'resin.auth.getEmail()', ->

				it 'should eventually be the email', ->
					promise = resin.auth.getEmail()
					m.chai.expect(promise).to.eventually.equal(credentials.email)

			describe 'resin.auth.getUserId()', ->

				it 'should eventually be the user id', ->
					promise = resin.auth.getUserId()
					m.chai.expect(promise).to.eventually.equal(credentials.userId)

		describe 'Device Model', ->

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

		describe 'given no applications', ->

			describe 'Application Model', ->

				describe 'resin.models.application.getAll()', ->

					it 'should eventually become an empty array', ->
						promise = resin.models.application.getAll()
						m.chai.expect(promise).to.become([])

				describe 'resin.models.application.hasAny()', ->

					it 'should eventually be false', ->
						promise = resin.models.application.hasAny()
						m.chai.expect(promise).to.eventually.be.false

				describe 'resin.models.application.create()', ->

					it 'should be able to create an application', ->
						resin.models.application.create('FooBar', 'raspberry-pi').then (id) ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(1)

					it 'should be rejected if the device type is invalid', ->
						promise = resin.models.application.create('FooBar', 'foobarbaz')
						m.chai.expect(promise).to.be.rejectedWith('Invalid device type: foobarbaz')

					it 'should be rejected if the name has less than three characters', ->
						promise = resin.models.application.create('Fo', 'raspberry-pi')
						m.chai.expect(promise).to.be.rejectedWith('It is necessary that each app name that is of a user (Auth), has a Length (Type) that is greater than or equal to 4.')

					it 'should be able to create an application using a device type alias', ->
						resin.models.application.create('FooBar', 'raspberrypi').then (id) ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(1)

		describe 'Key Model', ->

			describe 'given no keys', ->

				describe 'resin.models.key.getAll()', ->

					it 'should become an empty array', ->
						promise = resin.models.key.getAll()
						m.chai.expect(promise).to.become([])

				describe 'resin.models.key.create()', ->

					it 'should be able to create a key', ->
						key = PUBLIC_KEY
						resin.models.key.create('MyKey', key).then ->
							return resin.models.key.getAll()
						.then (keys) ->
							m.chai.expect(keys).to.have.length(1)
							m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
							m.chai.expect(keys[0].title).to.equal('MyKey')

					it 'should be able to create a key from a non trimmed string', ->
						key = PUBLIC_KEY
						resin.models.key.create('MyKey', "    #{key}    ").then ->
							return resin.models.key.getAll()
						.then (keys) ->
							m.chai.expect(keys).to.have.length(1)
							m.chai.expect(keys[0].public_key).to.equal(key.replace(/\n/g, ''))
							m.chai.expect(keys[0].title).to.equal('MyKey')

			describe 'given a single key', ->

				beforeEach ->
					publicKey = PUBLIC_KEY
					resin.models.key.create('MyKey', publicKey).then (key) =>
						@key = key

				describe 'resin.models.key.getAll()', ->

					it 'should become the list of keys', ->
						resin.models.key.getAll().then (keys) =>
							m.chai.expect(keys).to.have.length(1)
							m.chai.expect(keys[0].public_key).to.equal(@key.public_key.replace(/\n/g, ''))
							m.chai.expect(keys[0].title).to.equal('MyKey')

				describe 'resin.models.key.get()', ->

					it 'should be able to get a key', ->
						resin.models.key.get(@key.id).then (key) =>
							m.chai.expect(key.public_key).to.equal(@key.public_key.replace(/\n/g, ''))
							m.chai.expect(key.title).to.equal('MyKey')

					it 'should be rejected if the key id is invalid', ->
						promise = resin.models.key.get(99999999999)
						m.chai.expect(promise).to.be.rejectedWith('Request error: Internal Server Error')
						# TODO: used to work before, https://www.flowdock.com/app/rulemotion/platform/threads/v_RHSp7A6eGwvb4l4G6Ro2dd4Ss
						# m.chai.expect(promise).to.be.rejectedWith('Key not found: 99999999999')

				describe 'resin.models.key.remove()', ->

					it 'should be able to remove the key', ->
						resin.models.key.remove(@key.id).then ->
							promise = resin.models.key.getAll()
							m.chai.expect(promise).to.eventually.have.length(0)

		describe 'given a single application without devices', ->

			beforeEach ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

			describe 'Application Model', ->

				describe 'resin.models.application.hasAny()', ->

					it 'should eventually be true', ->
						promise = resin.models.application.hasAny()
						m.chai.expect(promise).to.eventually.be.true

				describe 'resin.models.application.create()', ->

					it 'should reject if trying to create an app with the same name', ->
						promise = resin.models.application.create('FooBar', 'beaglebone-black')
						m.chai.expect(promise).to.be.rejectedWith('Application name must be unique')

				describe 'resin.models.application.hasAny()', ->

					it 'should eventually be true', ->
						promise = resin.models.application.hasAny()
						m.chai.expect(promise).to.eventually.be.true

				describe 'resin.models.application.getAll()', ->

					it 'should return an array with length 1', ->
						promise = resin.models.application.getAll()
						m.chai.expect(promise).to.eventually.have.length(1)

					it 'should eventually become an array containing the application', ->
						resin.models.application.getAll().then (applications) =>
							m.chai.expect(applications[0].id).to.equal(@application.id)

					it 'should add a devices_length property', ->
						resin.models.application.getAll().then (applications) ->
							m.chai.expect(applications[0].devices_length).to.equal(0)

					it 'should add an online_devices property', ->
						resin.models.application.getAll().then (applications) ->
							m.chai.expect(applications[0].online_devices).to.equal(0)

				describe 'resin.models.application.get()', ->

					it 'should be able to get an application by name', ->
						promise = resin.models.application.get(@application.app_name)
						m.chai.expect(promise).to.become(@application)

					it 'should be able to get an application by id', ->
						promise = resin.models.application.get(@application.id)
						m.chai.expect(promise).to.become(@application)

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.application.get('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.application.get(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.application.getById()', ->

					it 'should be able to get an application', ->
						promise = resin.models.application.getById(@application.id)
						m.chai.expect(promise).to.become(@application)

					it 'should be rejected if the application does not exist', ->
						promise = resin.models.application.getById(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.application.has()', ->

					it 'should eventually be true if the application name exists', ->
						promise = resin.models.application.has(@application.app_name)
						m.chai.expect(promise).to.eventually.be.true

					it 'should eventually be true if the application id exists', ->
						promise = resin.models.application.has(@application.id)
						m.chai.expect(promise).to.eventually.be.true

					it 'should return false if the application id is undefined', ->
						promise = resin.models.application.has(undefined)
						m.chai.expect(promise).to.eventually.be.false

					it 'should eventually be false if the application name does not exist', ->
						promise = resin.models.application.has('HelloWorldApp')
						m.chai.expect(promise).to.eventually.be.false

					it 'should eventually be false if the application id does not exist', ->
						promise = resin.models.application.has(999999)
						m.chai.expect(promise).to.eventually.be.false

				describe 'resin.models.application.remove()', ->

					it 'should be able to remove an existing application by name', ->
						resin.models.application.remove(@application.app_name).then ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(0)

					it 'should be able to remove an existing application by id', ->
						resin.models.application.remove(@application.id).then ->
							promise = resin.models.application.getAll()
							m.chai.expect(promise).to.eventually.have.length(0)

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.application.remove('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.application.remove(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.application.getApiKey()', ->

					it 'should be able to generate an API key by name', ->
						resin.models.application.getApiKey(@application.app_name).then (apiKey) ->
							m.chai.expect(_.isString(apiKey)).to.be.true
							m.chai.expect(apiKey).to.have.length(32)

					it 'should be able to generate an API key by id', ->
						resin.models.application.getApiKey(@application.id).then (apiKey) ->
							m.chai.expect(_.isString(apiKey)).to.be.true
							m.chai.expect(apiKey).to.have.length(32)

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.application.getApiKey('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.application.getApiKey(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			describe 'Device Model', ->

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

			describe 'Environment Variables Model', ->

				describe 'resin.models.environmentVariables.getAllByApplication()', ->

					it 'should become an empty array by default', ->
						promise = resin.models.environmentVariables.getAllByApplication(@application.app_name)
						m.chai.expect(promise).to.become([])

					it 'should be rejected if the application uuid does not exist', ->
						promise = resin.models.environmentVariables.getAllByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.environmentVariables.getAllByApplication(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.environmentVariables.create()', ->

					it 'should be able to create a non resin variable given an app name', ->
						resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.getAllByApplication(@application.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')

					it 'should be able to create a non resin variable given an app id', ->
						resin.models.environmentVariables.create(@application.id, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.getAllByApplication(@application.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')

					it 'should be able to create a numeric non resin variable', ->
						resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 1).then =>
							resin.models.environmentVariables.getAllByApplication(@application.app_name)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('1')

					it 'should not allow creating a resin variable', ->
						promise = resin.models.environmentVariables.create(@application.app_name, 'RESIN_API_KEY', 'secret')
						m.chai.expect(promise).to.be.rejectedWith('Environment variables beginning with RESIN_ are reserved.')

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.environmentVariables.create('HelloWorldApp', 'EDITOR', 'vim')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.environmentVariables.create(999999, 'EDITOR', 'vim')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'given an existing environment variable', ->

					beforeEach ->
						resin.models.environmentVariables.create(@application.id, 'EDITOR', 'vim').then (envVar) =>
							@envVar = envVar

					describe 'resin.models.environmentVariables.update()', ->

						it 'should be able to update an environment variable', ->
							resin.models.environmentVariables.update(@envVar.id, 'emacs').then =>
								resin.models.environmentVariables.getAllByApplication(@application.app_name)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(1)
								m.chai.expect(envs[0].name).to.equal('EDITOR')
								m.chai.expect(envs[0].value).to.equal('emacs')

					describe 'resin.models.environmentVariables.remove()', ->

						it 'should be able to remove an environment variable', ->
							resin.models.environmentVariables.remove(@envVar.id).then =>
								resin.models.environmentVariables.getAllByApplication(@application.app_name)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(0)

			describe 'Build Model', ->

				describe 'resin.models.build.getAllByApplication()', ->

					it 'should eventually become an empty array given an application name', ->
						promise = resin.models.build.getAllByApplication(@application.app_name)
						m.chai.expect(promise).to.become([])

					it 'should eventually become an empty array given an application id', ->
						promise = resin.models.build.getAllByApplication(@application.id)
						m.chai.expect(promise).to.become([])

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.build.getAllByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.build.getAllByApplication(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

		describe 'given a single application with a single offline device', ->

			beforeEach ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

					uuid = resin.models.device.generateUniqueKey()
					resin.models.device.register(application.app_name, uuid)
					.then (deviceInfo) ->
						resin.models.device.get(deviceInfo.uuid)
					.then (device) =>
						@device = device

			describe 'Device Model', ->

				describe 'resin.models.device.getAll()', ->

					it 'should become the device', ->
						resin.models.device.getAll().then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)

					it 'should add an application_name property', ->
						resin.models.device.getAll().then (devices) =>
							m.chai.expect(devices[0].application_name).to.equal(@application.app_name)

				describe 'resin.models.device.getAllByApplication()', ->

					it 'should get the device given the right application name', ->
						resin.models.device.getAllByApplication(@application.app_name).then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)

					it 'should get the device given the right application id', ->
						resin.models.device.getAllByApplication(@application.id).then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)

					it 'should include an application_name property in the result', ->
						resin.models.device.getAllByApplication(@application.id).then (devices) =>
							m.chai.expect(devices[0].application_name).to.equal(@application.app_name)

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.device.getAllByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.device.getAllByApplication(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.device.get()', ->

					it 'should be able to get the device by uuid', ->
						resin.models.device.get(@device.uuid).then (device) =>
							m.chai.expect(device.id).to.equal(@device.id)

					it 'should be able to get the device by id', ->
						resin.models.device.get(@device.id).then (device) =>
							m.chai.expect(device.id).to.equal(@device.id)

					it 'should add an application_name property', ->
						resin.models.device.get(@device.id).then (device) =>
							m.chai.expect(device.application_name).to.equal(@application.app_name)

					it 'should be rejected if the device name does not exist', ->
						promise = resin.models.device.get('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

					it 'should be rejected if the device id does not exist', ->
						promise = resin.models.device.get(999999)
						m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

					it 'should be able to use a shorter uuid', ->
						resin.models.device.get(@device.uuid.slice(0, 8)).then (device) =>
							m.chai.expect(device.id).to.equal(@device.id)

				describe 'resin.models.device.getByName()', ->

					it 'should be able to get the device', ->
						resin.models.device.getByName(@device.name).then (devices) =>
							m.chai.expect(devices).to.have.length(1)
							m.chai.expect(devices[0].id).to.equal(@device.id)

					it 'should add an application_name property', ->
						resin.models.device.getByName(@device.name).then (devices) =>
							m.chai.expect(devices[0].application_name).to.equal(@application.app_name)

					it 'should be rejected if the device does not exist', ->
						promise = resin.models.device.getByName('HelloWorldDevice')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: HelloWorldDevice')

				describe 'resin.models.device.getName()', ->

					it 'should get the correct name by uuid', ->
						promise = resin.models.device.getName(@device.uuid)
						m.chai.expect(promise).to.eventually.equal(@device.name)

					it 'should get the correct name by id', ->
						promise = resin.models.device.getName(@device.id)
						m.chai.expect(promise).to.eventually.equal(@device.name)

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
							.then(resin.models.device.getAll)
							.then (devices) ->
								m.chai.expect(devices).to.deep.equal([])

					it 'should be able to remove the device by id', ->
						resin.models.device.remove(@device.id)
							.then(resin.models.device.getAll)
							.then (devices) ->
								m.chai.expect(devices).to.deep.equal([])

					it 'should be able to remove the device using a shorter uuid', ->
						resin.models.device.remove(@device.uuid.slice(0, 7))
							.then(resin.models.device.getAll)
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
							.then (deviceUrl) ->
								simpleRequest(deviceUrl)
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

			describe 'Environment Variables Model', ->

				describe 'resin.models.environmentVariables.device.getAll()', ->

					it 'should become an empty array by default', ->
						promise = resin.models.environmentVariables.device.getAll(@device.uuid)
						m.chai.expect(promise).to.become([])

					it 'should be rejected if the device uuid does not exist', ->
						promise = resin.models.environmentVariables.device.getAll('asdfghjkl')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

					it 'should be rejected if the device id does not exist', ->
						promise = resin.models.environmentVariables.device.getAll(999999)
						m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

				describe 'resin.models.environmentVariables.device.getAllByApplication()', ->

					it 'should become an empty array by default', ->
						promise = resin.models.environmentVariables.device.getAllByApplication(@application.id)
						m.chai.expect(promise).to.become([])

					it 'should return device environment variables if they exist', ->
						resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.device.getAllByApplication(@application.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')

					it 'should be rejected if the application name does not exist', ->
						promise = resin.models.environmentVariables.device.getAllByApplication('HelloWorldApp')
						m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

					it 'should be rejected if the application id does not exist', ->
						promise = resin.models.environmentVariables.device.getAllByApplication(999999)
						m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

				describe 'resin.models.environmentVariables.device.create()', ->

					it 'should be able to create a non resin variable given a device uuid', ->
						resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.device.getAll(@device.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')

					it 'should be able to create a non resin variable given a device id', ->
						resin.models.environmentVariables.device.create(@device.id, 'EDITOR', 'vim').then =>
							resin.models.environmentVariables.device.getAll(@device.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('vim')

					it 'should be able to create a numeric non resin variable', ->
						resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 1).then =>
							resin.models.environmentVariables.device.getAll(@device.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('1')

					it 'should not allow creating a resin variable', ->
						promise = resin.models.environmentVariables.device.create(@device.uuid, 'RESIN_API_KEY', 'secret')
						m.chai.expect(promise).to.be.rejectedWith('Environment variables beginning with RESIN_ are reserved.')

					it 'should be rejected if the device uuid does not exist', ->
						promise = resin.models.environmentVariables.device.create('asdfghjkl', 'EDITOR', 'vim')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

					it 'should be rejected if the device id does not exist', ->
						promise = resin.models.environmentVariables.device.create(999999, 'EDITOR', 'vim')
						m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

				describe 'given an existing environment variable', ->

					beforeEach ->
						resin.models.environmentVariables.device.create(@device.id, 'EDITOR', 'vim').then (envVar) =>
							@envVar = envVar

					describe 'resin.models.environmentVariables.device.update()', ->

						it 'should be able to update an environment variable', ->
							resin.models.environmentVariables.device.update(@envVar.id, 'emacs').then =>
								resin.models.environmentVariables.device.getAll(@device.id)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(1)
								m.chai.expect(envs[0].name).to.equal('EDITOR')
								m.chai.expect(envs[0].value).to.equal('emacs')

					describe 'resin.models.environmentVariables.device.remove()', ->

						it 'should be able to remove an environment variable', ->
							resin.models.environmentVariables.device.remove(@envVar.id).then =>
								resin.models.environmentVariables.device.getAll(@device.id)
							.then (envs) ->
								m.chai.expect(envs).to.have.length(0)

		describe 'given a single application with a device id whose shorter uuid is only numbers', ->

			beforeEach ->
				resin.models.application.create('TestApp', 'raspberry-pi').then (application) =>
					@application = application

					uuid = '1234567aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
					resin.models.device.register(application.app_name, uuid)
				.then (deviceInfo) =>
					@deviceInfo = deviceInfo

			describe 'Device Model', ->

				describe 'resin.models.device.get()', ->

					it 'should return the device given the shorter uuid as a string', ->
						resin.models.device.get('1234567').then (device) =>
							m.chai.expect(device.id).to.equal(@deviceInfo.id)

					it 'should fail to find the device given the shorter uuid as a number', ->
						promise = resin.models.device.get(1234567)
						m.chai.expect(promise).to.be.rejectedWith('Device not found: 1234567')

		describe 'given a single application with two offline devices that share the same uuid root', ->

			beforeEach ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

					uuid1 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
					uuid2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

					Promise.all [
						resin.models.device.register(application.app_name, uuid1)
						resin.models.device.register(application.app_name, uuid2)
					]

			describe 'Device Model', ->

				describe 'resin.models.device.get()', ->

					it 'should be rejected with an error if there is an ambiguation between shorter uuids', ->
						promise = resin.models.device.get('aaaaaaaaaaaaaaaa')

						m.chai.expect(promise).to.be.rejected
							.and.eventually.have.property('code', 'ResinAmbiguousDevice')

				describe 'resin.models.device.has()', ->

					it 'should be rejected with an error for an ambiguous shorter uuid', ->
						promise = resin.models.device.has('aaaaaaaaaaaaaaaa')

						m.chai.expect(promise).to.be.rejected
							.and.eventually.have.property('code', 'ResinAmbiguousDevice')

		describe 'given two compatible applications and a single device', ->

			beforeEach ->
				Promise.props
					application1: resin.models.application.create('FooBar', 'raspberry-pi')
					application2: resin.models.application.create('BarBaz', 'raspberry-pi')
				.then (results) =>
					@application1 = results.application1
					@application2 = results.application2

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

		describe 'given two incompatible applications and a single device', ->

			beforeEach ->
				Promise.props
					application1: resin.models.application.create('FooBar', 'raspberry-pi')
					application2: resin.models.application.create('BarBaz', 'beaglebone-black')
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

		describe 'OS Model', ->

			describe 'resin.models.os.getLastModified()', ->

				describe 'given a valid device slug', ->

					it 'should eventually be a valid Date instance', ->
						promise = resin.models.os.getLastModified('raspberry-pi')
						m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

					it 'should eventually be a valid Date instance if passing a device type alias', ->
						promise = resin.models.os.getLastModified('raspberrypi')
						m.chai.expect(promise).to.eventually.be.an.instanceof(Date)

				describe 'given an invalid device slug', ->

					it 'should be rejected with an error message', ->
						promise = resin.models.os.getLastModified('foo-bar-baz')
						m.chai.expect(promise).to.be.rejectedWith('No such device type')

			describe 'resin.models.os.download()', ->
				return if IS_BROWSER

				describe 'given a valid device slug', ->

					it 'should contain a valid mime property', ->
						resin.models.os.download('parallella').then (stream) ->
							m.chai.expect(stream.mime).to.equal('application/octet-stream')

					it 'should contain a valid mime property if passing a device type alias', ->
						resin.models.os.download('raspberrypi').then (stream) ->
							m.chai.expect(stream.mime).to.equal('application/octet-stream')

					it 'should be able to download the image', ->
						tmpFile = tmp.tmpNameSync()
						resin.models.os.download('parallella').then (stream) ->
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
						m.chai.expect(promise).to.be.rejectedWith('Request error: No such device type')

		describe 'Interception Hooks', ->

			it "should update if the array is set directly (not only if it's mutated)", ->
				interceptor = request: m.sinon.mock().returnsArg(0)
				resin.interceptors = [ interceptor ]

				promise = resin.models.application.getAll()

				promise.then ->
					m.chai.expect(interceptor.request.called).to.equal true,
						'Interceptor set directly should have its request hook called'

			describe 'for request', ->
				it 'should be able to intercept requests', ->
					resin.interceptors.push request: m.sinon.mock().returnsArg(0)

					promise = resin.models.application.getAll()

					promise.then ->
						m.chai.expect(resin.interceptors[0].request.called).to.equal true,
							'Interceptor request hook should be called'

			describe 'for requestError', ->
				it 'should intercept request errors from other interceptors', ->
					resin.interceptors.push request:
						m.sinon.mock().throws(new Error('rejected'))
					resin.interceptors.push requestError:
						m.sinon.mock().throws(new Error('replacement error'))

					promise = resin.models.application.getAll()

					m.chai.expect(promise).to.be.rejectedWith('replacement error')
					.then ->
						m.chai.expect(resin.interceptors[1].requestError.called).to.equal true,
							'Interceptor requestError hook should be called'

			describe 'for response', ->
				it 'should be able to intercept responses', ->
					resin.interceptors.push response: m.sinon.mock().returnsArg(0)

					promise = resin.models.application.getAll()

					promise.then ->
						m.chai.expect(resin.interceptors[0].response.called).to.equal true,
							'Interceptor response hook should be called'

			describe 'for responseError', ->
				it 'should be able to intercept error responses', ->
					called = false
					resin.interceptors.push responseError: (err) ->
						called = true
						throw err

					promise = resin.auth.authenticate
						email: 'helloworld@resin.io',
						password: 'asdfghjkl'

					m.chai.expect(promise).to.be.rejectedWith('Request error: Unauthorized')
					.then ->
						m.chai.expect(called).to.equal true,
							'responseError should be called when authentication fails'

