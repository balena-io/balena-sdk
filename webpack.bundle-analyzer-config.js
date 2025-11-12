/* eslint-disable @typescript-eslint/no-require-imports */
const config = require('./webpack.config.js');
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

config.plugins.push(
	new BundleAnalyzerPlugin({
		analyzerMode: 'disabled',
		generateStatsFile: true,
	}),
);

module.exports = config;
