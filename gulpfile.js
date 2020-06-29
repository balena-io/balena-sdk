const gulp = require('gulp');
const gulpMocha = require('gulp-mocha');
const replace = require('gulp-replace');
const browserify = require('browserify');
const uglifyEs = require('uglify-es');
const uglifyComposer = require('gulp-uglify/composer');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const minimist = require('minimist');

const minify = uglifyComposer(uglifyEs, console);

const packageJSON = require('./package.json');

const { loadEnv } = require('./tests/loadEnv');

const cliOptions = minimist(process.argv.slice(2), {
	string: 'buildDir',
	default: { buildDir: 'es2015' },
});

const OPTIONS = {
	config: {
		browserLibraryName: 'balena-sdk',
	},
	files: {
		tests: ['tests/**/*.spec.ts', 'tests/**/*.spec.coffee'],
		browserEntry: 'index.js',
		browserOutput: 'balena-browser.js',
		browserMinifiedOutput: 'balena-browser.min.js',
	},
	directories: {
		doc: 'doc/',
		build: cliOptions.buildDir,
	},
};

gulp.task('test', function (cb) {
	loadEnv();

	const { TEST_ONLY_ON_ENVIRONMENT } = process.env;
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
			require: ['ts-node/register/transpile-only', 'coffeescript/register'],
			timeout: 5 * 60 * 1000,
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

gulp.task('pack-browser', function () {
	const bundle = browserify({
		entries: OPTIONS.files.browserEntry,
		basedir: OPTIONS.directories.build,
		standalone: OPTIONS.config.browserLibraryName,
	})
		.exclude('fs')
		.exclude('path')
		.exclude('balena-settings-client')
		.exclude('node-localstorage')
		.bundle();

	bundle
		.pipe(source(OPTIONS.files.browserOutput))
		.pipe(gulp.dest(OPTIONS.directories.build));

	return bundle
		.pipe(source(OPTIONS.files.browserMinifiedOutput))
		.pipe(buffer())
		.pipe(minify())
		.pipe(gulp.dest(OPTIONS.directories.build));
});
