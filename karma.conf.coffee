_ = require('lodash')
getKarmaConfig = require('balena-config-karma')
packageJSON = require('./package.json')
{ loadEnv } = require('./tests/util')

getKarmaConfig.DEFAULT_WEBPACK_CONFIG.externals = fs: true

BROWSER_BUNDLE = 'build/balena-browser.js'

module.exports = (config) ->
	loadEnv()

	karmaConfig = getKarmaConfig(packageJSON)
	karmaConfig.plugins.push(require('karma-env-preprocessor'))
	# do not pre-process the browser build
	karmaConfig.preprocessors = _.omitBy(karmaConfig.preprocessors, (_value, key) -> _.startsWith(key, 'build/'))
	karmaConfig.preprocessors['tests/**/*.coffee'] = [ 'webpack', 'sourcemap', 'env' ]
	karmaConfig.client = mocha:
		timeout: 5 * 60 * 1000
		slow: 10 * 1000
	karmaConfig.files = [
		BROWSER_BUNDLE
		'tests/**/*.spec.coffee'
		'tests/**/*.spec.ts'
	]

	karmaConfig.browserConsoleLogOptions =
		level: 'log'
		format: '%b %T: %m'
		terminal: true

	karmaConfig.envPreprocessor = [
		'TEST_API_URL'
		'TEST_EMAIL'
		'TEST_PASSWORD'
		'TEST_USERNAME'
		'TEST_PAID_EMAIL'
		'TEST_PAID_PASSWORD'
	]

	config.set(karmaConfig)
