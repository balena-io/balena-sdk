karmaConfig = require('resin-config-karma')
packageJSON = require('./package.json')

module.exports = (config) ->
	karmaConfig.logLevel = config.LOG_INFO
	karmaConfig.sauceLabs =
		testName: "#{packageJSON.name} v#{packageJSON.version}"
	karmaConfig.client =
		captureConsole: true
	config.preprocessors[ '**/*.spec.js' ] = [ 'env']
	config.envPreprocessor: [
		'RESINTEST_EMAIL'
		'RESINTEST_PASSWORD'
		'RESINTEST_USERNAME'
		'RESINTEST_USERID'
		'RESINTEST_REGISTER_EMAIL'
		'RESINTEST_REGISTER_PASSWORD'
		'RESINTEST_REGISTER_USERNAME'
	]
	config.set(karmaConfig)
