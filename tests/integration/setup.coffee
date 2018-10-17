Promise = require('bluebird')
_ = require('lodash')

{ chai } = require('mochainon')
chai.use(require('chai-samsam'))

exports.IS_BROWSER = IS_BROWSER = window?

if IS_BROWSER
	require('js-polyfills/es6')
	getSdk = window.balenaSdk
	env = window.__env__

	opts =
		apiUrl: env.TEST_API_URL || 'https://api.balena-cloud.com'
		imageMakerUrl: 'https://img.balena-cloud.com'

else
	getSdk = require('../..')
	settings = require('balena-settings-client')
	env = process.env

	opts =
		apiUrl: env.TEST_API_URL || settings.get('apiUrl')
		imageMakerUrl: settings.get('imageMakerUrl')
		dataDirectory: settings.get('dataDirectory')

_.assign opts,
	apiKey: null
	isBrowser: IS_BROWSER,
	retries: 3

buildCredentials = ->
	if not env
		throw new Error('Missing environment object?!')

	credentials =
		email: env.TEST_EMAIL
		password: env.TEST_PASSWORD
		username: env.TEST_USERNAME
		paid:
			email: env.TEST_PAID_EMAIL
			password: env.TEST_PAID_PASSWORD
		register:
			email: env.TEST_REGISTER_EMAIL
			password: env.TEST_REGISTER_PASSWORD
			username: env.TEST_REGISTER_USERNAME

	if not _.every [
		credentials.email?
		credentials.password?
		credentials.username?
		credentials.register.email?
		credentials.register.password?
		credentials.register.username?
	]
		throw new Error('Missing environment credentials')

	return credentials

exports.getSdk = getSdk

exports.sdkOpts = opts
exports.balena = balena = getSdk(opts)

exports.resetUser = ->
	return balena.auth.isLoggedIn().then (isLoggedIn) ->
		return if not isLoggedIn

		Promise.all [
			balena.pine.delete
				resource: 'application'

			balena.pine.delete
				resource: 'user__has__public_key'

			balena.pine.delete
				resource: 'api_key'
				# only delete named user api keys
				options: $filter: name: $ne: null
			# Api keys can't delete api keys, just ignore failures here
			.catchReturn()
		]

exports.credentials = buildCredentials()

exports.givenLoggedInUserWithApiKey = ->
	beforeEach ->
		balena.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then ->
			return balena.request.send
				method: 'POST'
				url: '/api-key/user/full'
				baseUrl: opts.apiUrl
				body:
					name: 'apiKey'
		.get('body')
		.tap(balena.auth.logout)
		.then(balena.auth.loginWithToken)
		.then(exports.resetUser)

	afterEach ->
		exports.resetUser()

exports.givenLoggedInUser = ->
	beforeEach ->
		balena.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then(exports.resetUser)

	afterEach ->
		exports.resetUser()

exports.loginPaidUser = ->
	balena.auth.login
		email: exports.credentials.paid.email
		password: exports.credentials.paid.password

exports.givenMulticontainerApplication = ->
	beforeEach ->
		balena.models.application.create
			name: 'FooBar'
			applicationType: 'microservices-starter'
			deviceType: 'raspberry-pi'
		.then (application) =>
			@application = application
			userId = application.user.__id

			Promise.all [
				# Register web & DB services
				balena.pine.post
					resource: 'service'
					body:
						application: @application.id
						service_name: 'web'
			,
				balena.pine.post
					resource: 'service'
					body:
						application: @application.id
						service_name: 'db'
			,
				# Register an old & new release of this application
				balena.pine.post
					resource: 'release'
					body:
						belongs_to__application: @application.id
						is_created_by__user: userId
						commit: 'old-release-commit'
						status: 'success'
						source: 'cloud'
						composition: {}
						start_timestamp: 1234
			,
				balena.pine.post
					resource: 'release'
					body:
						belongs_to__application: @application.id
						is_created_by__user: userId
						commit: 'new-release-commit'
						status: 'success'
						source: 'cloud'
						composition: {}
						start_timestamp: 54321
			]
		.spread (webService, dbService, oldRelease, newRelease) =>
			@webService = webService
			@dbService = dbService
			@currentRelease = newRelease

			uuid = balena.models.device.generateUniqueKey()

			Promise.all [
				# Register the device itself, running the new release
				balena.models.device.register(@application.app_name, uuid)
				.tap (deviceInfo) ->
					balena.pine.patch
						resource: 'device'
						body:
							is_on__commit: newRelease.commit
						options:
							$filter:
								uuid: deviceInfo.uuid
				.then (deviceInfo) ->
					balena.models.device.get(deviceInfo.uuid)
				.tap (device) =>
					@device = device
			,
				# Register an old & new web image build from the old and new
				# releases, a db build in the new release only
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: webService.id
						project_type: 'dockerfile'
						content_hash: 'abc'
						build_log: 'old web log'
						start_timestamp: 1234
						push_timestamp: 1234
						status: 'success'
			,
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: webService.id
						project_type: 'dockerfile'
						content_hash: 'def'
						build_log: 'new web log'
						start_timestamp: 54321
						push_timestamp: 54321
						status: 'success'
			,
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: dbService.id
						project_type: 'dockerfile'
						content_hash: 'jkl'
						build_log: 'old db log'
						start_timestamp: 123
						push_timestamp: 123
						status: 'success'
			,
				balena.pine.post
					resource: 'image'
					body:
						is_a_build_of__service: dbService.id
						project_type: 'dockerfile'
						content_hash: 'ghi'
						build_log: 'new db log'
						start_timestamp: 54321
						push_timestamp: 54321
						status: 'success'
			]
			.spread (device, oldWebImage, newWebImage, oldDbImage, newDbImage) =>
				@oldWebImage = oldWebImage
				@newWebImage = newWebImage
				@oldDbImage = oldDbImage
				@newDbImage = newDbImage

				Promise.all [
					# Tie the images to their corresponding releases
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: oldWebImage.id
							is_part_of__release: oldRelease.id
				,
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: oldDbImage.id
							is_part_of__release: oldRelease.id
				,
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: newWebImage.id
							is_part_of__release: newRelease.id
				,
					balena.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: newDbImage.id
							is_part_of__release: newRelease.id
				,
					# Create image installs for the images on the device
					balena.pine.post
						resource: 'image_install'
						body:
							installs__image: oldWebImage.id
							is_provided_by__release: oldRelease.id
							device: device.id
							download_progress: 100
							status: 'running'
							install_date: '2017-10-01'
				,
					balena.pine.post
						resource: 'image_install'
						body:
							installs__image: newWebImage.id
							is_provided_by__release: newRelease.id
							device: device.id
							download_progress: 50,
							status: 'downloading'
							install_date: '2017-10-30'
				,
					balena.pine.post
						resource: 'image_install'
						body:
							installs__image: oldDbImage.id
							is_provided_by__release: oldRelease.id
							device: device.id
							download_progress: 100,
							status: 'Deleted',
							install_date: '2017-09-30'
				,
					balena.pine.post
						resource: 'image_install'
						body:
							installs__image: newDbImage.id
							is_provided_by__release: newRelease.id
							device: device.id
							download_progress: 100,
							status: 'running',
							install_date: '2017-10-30'
				,
					# Create service installs for the services running on the device
					balena.pine.post
						resource: 'service_install'
						body:
							installs__service: webService.id
							device: device.id
				,
					balena.pine.post
						resource: 'service_install'
						body:
							installs__service: dbService.id
							device: device.id
				]
			.then ([..., oldWebInstall, newWebInstall, oldDbInstall, newDbInstall, _w, _db]) =>
				@oldWebInstall = oldWebInstall
				@newWebInstall = newWebInstall
				@newDbInstall = newDbInstall
