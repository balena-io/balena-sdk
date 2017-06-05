Promise = require('bluebird')
_ = require('lodash')

exports.IS_BROWSER = IS_BROWSER = window?

if IS_BROWSER
	require('js-polyfills/es6')
	getSdk = window.resinSdk

	opts =
		apiUrl: 'https://api.resin.io'
		imageMakerUrl: 'https://img.resin.io'

	env = window.__env__
else
	getSdk = require('../..')

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
		]

exports.credentials = buildCredentials()

exports.givenLoggedInUser = ->
	beforeEach ->
		resin.auth.login
			email: exports.credentials.email
			password: exports.credentials.password
		.then(exports.resetUser)

	afterEach ->
		exports.resetUser()
