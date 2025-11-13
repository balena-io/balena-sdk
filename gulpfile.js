/* eslint-disable @typescript-eslint/no-require-imports */
const gulp = require('gulp');
const gulpMocha = require('gulp-mocha');
const replace = require('gulp-replace');
const minimist = require('minimist');
const { optionalVar } = require('@balena/env-parsing');

const packageJSON = require('./package.json');

const cliOptions = minimist(process.argv.slice(2), {
	string: 'buildDir', // eslint-disable-line id-denylist
	default: { buildDir: 'es2017' },
});

const OPTIONS = {
	files: {
		tests: ['tests/**/*.spec.js', 'tests/**/*.spec.ts'],
	},
	directories: {
		doc: 'doc/',
		build: cliOptions.buildDir,
	},
};

gulp.task('test', function (cb) {
	require('dotenv').config();

	// Only set NODE_OPTIONS for Node.js >= 22.18
	const nodeVersion = process.versions.node.split('.').map(Number);
	if (nodeVersion[0] > 22 || (nodeVersion[0] === 22 && nodeVersion[1] >= 18)) {
		process.env.NODE_OPTIONS = '--no-experimental-strip-types';
	}
	const TEST_ONLY_ON_ENVIRONMENT = optionalVar('TEST_ONLY_ON_ENVIRONMENT');
	if (TEST_ONLY_ON_ENVIRONMENT && TEST_ONLY_ON_ENVIRONMENT !== 'node') {
		console.log(
			`TEST_ONLY_ON_ENVIRONMENT is set to ${TEST_ONLY_ON_ENVIRONMENT}`,
		);
		console.log('Skipping node tests');
		return cb();
	}

	return gulp.src(OPTIONS.files.tests, { read: false }).pipe(
		gulpMocha({
			reporter: 'spec',
			require: ['ts-node/register/transpile-only'],
			timeout: 5 * 60 * 1000,
			retries: 2,
			slow: 1000,
		}),
	);
});

gulp.task('inject-version', () =>
	gulp
		.src([`${OPTIONS.directories.build}/util/sdk-version.js`])
		.pipe(replace('__REPLACE_WITH_PACKAGE_JSON_VERSION__', packageJSON.version))
		.pipe(gulp.dest(`${OPTIONS.directories.build}/util/`)),
);
