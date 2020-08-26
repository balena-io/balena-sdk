var esVersion = require('@balena/es-version').get(['es2015', 'es2018']);
module.exports = typeof window !== 'undefined' && window !== null ?
	require('./' + esVersion) :
	// support bundling with pkg
	require(require('path').join(__dirname, esVersion));
