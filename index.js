var esVersion = require('@balena/es-version').get(['es2015', 'es2018']);
module.exports = require('./' + esVersion);
