Promise = require('bluebird')
_ = require('lodash')

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
	apiVersion: 'v2'
	apiKey: null
	isBrowser: IS_BROWSER,
	retries: 3

console.log('Starting tests using opts', opts)

buildCredentials = ->
	if not env
		throw new Error('Missing environment object?!')

	credentials =
		email: env.RESINTEST_EMAIL
		password: env.RESINTEST_PASSWORD
		username: env.RESINTEST_USERNAME
		userId: _.parseInt(env.RESINTEST_USERID)
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

exports.loginPaidUser = ->
	resin.auth.login
		email: exports.credentials.paid.email
		password: exports.credentials.paid.password
