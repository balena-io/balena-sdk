/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const webpack = require('webpack');
// Webpack plugins
const TerserPlugin = require('terser-webpack-plugin');

// Paths
const root = path.resolve(__dirname, '.');
const entryIndexFile = path.join(root, 'index.js');

// Webpack base configuration
const config = {
	entry: {
		scripts: entryIndexFile,
	},

	output: {
		filename: 'balena-browser.min.js',
		library: 'balenaSdk',
		libraryTarget: 'umd',
	},

	mode: 'production',

	resolve: {
		// Polyfills or mocks for various node stuff
		fallback: {
			// node
			fs: false,
			'fs/promises': false,
			path: false,
			// dependencies
			'balena-settings-client': false,
			mime: false,
			// required by: ndjson
			os: require.resolve('os-browserify/browser'),
			// required by: balena-request
			stream: require.resolve('stream-browserify'),
		},
	},

	plugins: [
		// Polyfills or mocks for various node stuff
		new webpack.ProvidePlugin({
			// required by: release.asset.download() -> balena-request.stream() -> getProgressStream()
			process: 'process/browser.js',
		}),
		// Modules that are conditionally required by the sdk & its dependencies
		// but are not used in a browser context.
		new webpack.IgnorePlugin({
			resourceRegExp: /^(balena-settings-client|mime)$/,
		}),
	],

	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				// Prevent creating a separate LICENSE.txt file
				extractComments: false,
				terserOptions: {
					format: {
						// Remove ALL comments, including licenses and JSDoc.
						comments: false,
					},
				},
			}),
		],
	},
};

module.exports = config;
