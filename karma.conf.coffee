karmaConfig = require('resin-config-karma')
packageJSON = require('./package.json')
{ loadEnv } = require('./tests/util')

module.exports = (config) ->
	loadEnv()

	karmaConfig.logLevel = config.LOG_INFO
	karmaConfig.sauceLabs =
		testName: "#{packageJSON.name} v#{packageJSON.version}"
	karmaConfig.client =
		captureConsole: true

	karmaConfig.plugins.push(require('karma-env-preprocessor'))
	karmaConfig.preprocessors['**/*.spec.coffee'] = [ 'env' ]
	karmaConfig.envPreprocessor = [
		'RESINTEST_EMAIL'
		'RESINTEST_PASSWORD'
		'RESINTEST_USERNAME'
		'RESINTEST_USERID'
		'RESINTEST_REGISTER_EMAIL'
		'RESINTEST_REGISTER_PASSWORD'
		'RESINTEST_REGISTER_USERNAME'
	]

	config.set(karmaConfig)
