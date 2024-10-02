/* eslint-disable @typescript-eslint/no-require-imports */
const _ = require('lodash');
const getKarmaConfig = require('balena-config-karma');
const packageJSON = require('./package.json');

const BROWSER_BUNDLE = 'es2017/balena-browser.min.js';

module.exports = function (config) {
	require('dotenv').config();
	const envVars = [
		'TEST_API_URL',
		'TEST_EMAIL',
		'TEST_PASSWORD',
		'TEST_USERNAME',
		'TEST_MEMBER_EMAIL',
		'TEST_MEMBER_PASSWORD',
		'TEST_MEMBER_USERNAME',
		'TEST_2FA_EMAIL',
		'TEST_2FA_PASSWORD',
		'TEST_2FA_SECRET',
		'TEST_REGISTER_EMAIL',
		'TEST_REGISTER_PASSWORD',
		'TEST_REGISTER_USERNAME',
	];

	const karmaConfig = getKarmaConfig(packageJSON);
	karmaConfig.webpack.resolve.fallback = {
		// required by: temp in tests
		constants: false,
		// required by: mockttp in tests
		crypto: require.resolve('crypto-browserify'),
		// required by: mocha.parallel in tests
		domain: require.resolve('domain-browser'),
		// used conditionally in the tests
		fs: false,
		// required by: ndjson
		os: require.resolve('os-browserify'),
		// used conditionally in the tests
		path: false,
		// required by: mockttp in tests
		querystring: require.resolve('querystring-es3'),
		// required by: balena-request
		stream: require.resolve('stream-browserify'),
		// required by: balena-request
		zlib: require.resolve('browserify-zlib'),
	};
	karmaConfig.webpack.plugins = [
		new getKarmaConfig.webpack.ProvidePlugin({
			// Polyfills or mocks for various node stuff
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer'],
		}),
		new getKarmaConfig.webpack.EnvironmentPlugin(envVars),
	];
	karmaConfig.webpack.module.rules.push({
		test: /\.m?js/,
		resolve: {
			fullySpecified: false,
		},
	});
	karmaConfig.webpack.experiments = {
		asyncWebAssembly: true,
	};
	// do not pre-process the browser build
	karmaConfig.preprocessors = _.omitBy(
		karmaConfig.preprocessors,
		(_value, key) => key.startsWith('es2017/') || key.startsWith('es2018/'),
	);
	karmaConfig.client = {
		mocha: {
			timeout: 5 * 60 * 1000,
			retries: 2,
			slow: 10 * 1000,
		},
	};
	karmaConfig.files = [
		BROWSER_BUNDLE,
		'tests/**/*.spec.js',
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

	return config.set(karmaConfig);
};
