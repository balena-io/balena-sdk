const _ = require('lodash');
const getKarmaConfig = require('balena-config-karma');
const packageJSON = require('./package.json');
const { loadEnv } = require('./tests/loadEnv');

getKarmaConfig.DEFAULT_WEBPACK_CONFIG.externals = { fs: true };

const BROWSER_BUNDLE = 'es2015/balena-browser.js';

module.exports = function (config) {
	loadEnv();

	const karmaConfig = getKarmaConfig(packageJSON);
	karmaConfig.plugins.push(require('karma-env-preprocessor'));
	// do not pre-process the browser build
	karmaConfig.preprocessors = _.omitBy(
		karmaConfig.preprocessors,
		(_value, key) => key.startsWith('es2015/') || key.startsWith('es2018/'),
	);
	karmaConfig.preprocessors['tests/**/*.coffee'] = [
		'webpack',
		'sourcemap',
		'env',
	];
	karmaConfig.client = {
		mocha: {
			timeout: 5 * 60 * 1000,
			slow: 10 * 1000,
		},
	};
	karmaConfig.files = [
		BROWSER_BUNDLE,
		'tests/**/*.spec.coffee',
		'tests/**/*.spec.ts',
	];

	const { TEST_ONLY_ON_ENVIRONMENT } = process.env;
	if (TEST_ONLY_ON_ENVIRONMENT && TEST_ONLY_ON_ENVIRONMENT !== 'browser') {
		console.log(
			`TEST_ONLY_ON_ENVIRONMENT is set to ${TEST_ONLY_ON_ENVIRONMENT}`,
		);
		console.log('Skipping browser tests');
		karmaConfig.files = [];
		karmaConfig.failOnEmptyTestSuite = false;
	}

	karmaConfig.browserConsoleLogOptions = {
		level: 'log',
		format: '%b %T: %m',
		terminal: true,
	};

	karmaConfig.envPreprocessor = [
		'TEST_API_URL',
		'TEST_EMAIL',
		'TEST_PASSWORD',
		'TEST_USERNAME',
		'TEST_PAID_EMAIL',
		'TEST_PAID_PASSWORD',
		'TEST_REGISTER_EMAIL',
		'TEST_REGISTER_PASSWORD',
		'TEST_REGISTER_USERNAME',
	];

	return config.set(karmaConfig);
};
