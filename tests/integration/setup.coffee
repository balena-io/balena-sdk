Promise = require('bluebird')
_ = require('lodash')

{ chai } = require('mochainon')
chai.use(require('chai-samsam'))

exports.IS_BROWSER = IS_BROWSER = window?

if IS_BROWSER
	require('js-polyfills/es6')
	getSdk = window.resinSdk
	env = window.__env__

	opts =
		apiUrl: env.RESINTEST_API_URL || 'https://api.resin.io'
		imageMakerUrl: 'https://img.resin.io'

else
	getSdk = require('../..')
	settings = require('resin-settings-client')
	env = process.env

	opts =
		apiUrl: env.RESINTEST_API_URL || settings.get('apiUrl')
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
		email: env.RESINTEST_EMAIL
		password: env.RESINTEST_PASSWORD
		username: env.RESINTEST_USERNAME
		paid:
			email: env.RESINTEST_PAID_EMAIL
			password: env.RESINTEST_PAID_PASSWORD
		register:
			email: env.RESINTEST_REGISTER_EMAIL
			password: env.RESINTEST_REGISTER_PASSWORD
			username: env.RESINTEST_REGISTER_USERNAME

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
exports.resin = resin = getSdk(opts)

exports.resetUser = ->
	return resin.auth.isLoggedIn().then (isLoggedIn) ->
		return if not isLoggedIn

		Promise.all [
			resin.pine.delete
				resource: 'application'

			resin.pine.delete
				resource: 'user__has__public_key'

			resin.pine.delete
				resource: 'api_key'
				# only delete named user api keys
				options: $filter: name: $ne: null
			# Api keys can't delete api keys, just ignore failures here
			.catchReturn()
		]

exports.credentials = buildCredentials()

exports.givenLoggedInUserWithApiKey = ->
	beforeEach ->
		resin.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then ->
			return resin.request.send
				method: 'POST'
				url: '/api-key/user/full'
				baseUrl: opts.apiUrl
				body:
					name: 'apiKey'
		.get('body')
		.tap(resin.auth.logout)
		.then(resin.auth.loginWithToken)
		.then(exports.resetUser)

	afterEach ->
		exports.resetUser()

exports.givenLoggedInUser = ->
	beforeEach ->
		resin.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then(exports.resetUser)

	afterEach ->
		exports.resetUser()

exports.loginPaidUser = ->
	resin.auth.login
		email: exports.credentials.paid.email
		password: exports.credentials.paid.password

exports.givenMulticontainerApplication = ->
	beforeEach ->
		Promise.all([
			resin.models.application.create
				name: 'FooBar'
				applicationType: 'microservices-starter'
				deviceType: 'raspberry-pi'
			resin.auth.getUserId()
		])
		.then ([application, userId]) =>
			@application = application

			Promise.all [
				# Register web & DB services
				resin.pine.post
					resource: 'service'
					body:
						application: @application.id
						service_name: 'web'
			,
				resin.pine.post
					resource: 'service'
					body:
						application: @application.id
						service_name: 'db'
			,
				# Register an old & new release of this application
				resin.pine.post
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
				resin.pine.post
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

			uuid = resin.models.device.generateUniqueKey()

			Promise.all [
				# Register the device itself, running the new release
				resin.models.device.register(@application.app_name, uuid)
				.tap (deviceInfo) ->
					resin.pine.patch
						resource: 'device'
						body:
							is_on__commit: newRelease.commit
						options:
							$filter:
								uuid: deviceInfo.uuid
				.then (deviceInfo) ->
					resin.models.device.get(deviceInfo.uuid)
				.tap (device) =>
					@device = device
			,
				# Register an old & new web image build from the old and new
				# releases, a db build in the new release only
				resin.pine.post
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
				resin.pine.post
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
				resin.pine.post
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
				resin.pine.post
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
					resin.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: oldWebImage.id
							is_part_of__release: oldRelease.id
				,
					resin.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: oldDbImage.id
							is_part_of__release: oldRelease.id
				,
					resin.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: newWebImage.id
							is_part_of__release: newRelease.id
				,
					resin.pine.post
						resource: 'image__is_part_of__release'
						body:
							image: newDbImage.id
							is_part_of__release: newRelease.id
				,
					# Create image installs for the images on the device
					resin.pine.post
						resource: 'image_install'
						body:
							installs__image: oldWebImage.id
							is_provided_by__release: oldRelease.id
							device: device.id
							download_progress: 100
							status: 'running'
							install_date: '2017-10-01'
				,
					resin.pine.post
						resource: 'image_install'
						body:
							installs__image: newWebImage.id
							is_provided_by__release: newRelease.id
							device: device.id
							download_progress: 50,
							status: 'downloading'
							install_date: '2017-10-30'
				,
					resin.pine.post
						resource: 'image_install'
						body:
							installs__image: oldDbImage.id
							is_provided_by__release: oldRelease.id
							device: device.id
							download_progress: 100,
							status: 'Deleted',
							install_date: '2017-09-30'
				,
					resin.pine.post
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
					resin.pine.post
						resource: 'service_install'
						body:
							installs__service: webService.id
							device: device.id
				,
					resin.pine.post
						resource: 'service_install'
						body:
							installs__service: dbService.id
							device: device.id
				]
			.then ([..., oldWebInstall, newWebInstall, oldDbInstall, newDbInstall, _w, _db]) =>
				@oldWebInstall = oldWebInstall
				@newWebInstall = newWebInstall
				@newDbInstall = newDbInstall
