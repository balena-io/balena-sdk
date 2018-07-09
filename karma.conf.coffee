karmaConfig = require('resin-config-karma')
packageJSON = require('./package.json')
{ loadEnv } = require('./tests/util')

BROWSER_BUNDLE = 'build/resin-browser.js'

module.exports = (config) ->
	loadEnv()

	karmaConfig.plugins.push(require('karma-chrome-launcher'))
	karmaConfig.browsers = ['ChromeHeadless']

	karmaConfig.logLevel = config.LOG_INFO
	karmaConfig.sauceLabs =
		testName: "#{packageJSON.name} v#{packageJSON.version}"
	karmaConfig.client =
		captureConsole: true

	karmaConfig.plugins.push(require('karma-env-preprocessor'))
	karmaConfig.preprocessors['**/*.spec.coffee'] = [ 'browserify', 'env' ]
	karmaConfig.browserify.configure = (bundle) ->
		bundle.on 'prebundle', ->
			bundle.external(BROWSER_BUNDLE)
	karmaConfig.client = mocha:
		timeout: 5 * 60 * 1000
		slow: 10 * 1000
	karmaConfig.files = [
		BROWSER_BUNDLE,
		'tests/**/*.spec.coffee'
	]

	karmaConfig.browserConsoleLogOptions =
		level: 'log'
		format: '%b %T: %m'
		terminal: true

	karmaConfig.envPreprocessor = [
		'RESINTEST_API_URL'
		'RESINTEST_EMAIL'
		'RESINTEST_PASSWORD'
		'RESINTEST_USERNAME'
		'RESINTEST_PAID_EMAIL'
		'RESINTEST_PAID_PASSWORD'
		'RESINTEST_REGISTER_EMAIL'
		'RESINTEST_REGISTER_PASSWORD'
		'RESINTEST_REGISTER_USERNAME'
	]

	config.set(karmaConfig)
