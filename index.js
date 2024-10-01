/* eslint-disable @typescript-eslint/no-require-imports */
const esVersion = require('@balena/es-version').get(['es2017', 'es2018']);
const sdkBuild = require('./' + esVersion);
module.exports = sdkBuild;
// The following explicit assignments enable named imports in mjs files.
module.exports.getSdk = sdkBuild.getSdk;
module.exports.setSharedOptions = sdkBuild.setSharedOptions;
module.exports.fromSharedOptions = sdkBuild.fromSharedOptions;
