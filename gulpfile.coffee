gulp = require('gulp')
mocha = require('gulp-mocha')
gutil = require('gulp-util')
coffee = require('gulp-coffee')
replace = require('gulp-replace')
browserify = require('browserify')
uglifyEs = require('uglify-es')
uglifyComposer = require('gulp-uglify/composer')
source = require('vinyl-source-stream')
buffer = require('vinyl-buffer')

minify = uglifyComposer(uglifyEs, console)

packageJSON = require('./package.json')

{ loadEnv } = require('./tests/util')

OPTIONS =
	config:
		browserLibraryName: 'balena-sdk'
	files:
		coffee: [ 'lib/**/*.coffee', 'tests/**/*.coffee', 'gulpfile.coffee' ]
		app: 'lib/**/*.coffee'
		tests: [ 'tests/**/*.spec.ts', 'tests/**/*.spec.coffee' ]
		browserEntry: 'balena.js'
		browserOutput: 'balena-browser.js'
		browserMinifiedOutput: 'balena-browser.min.js'
	directories:
		doc: 'doc/'
		build: 'build/'

gulp.task 'test', (cb) ->
	loadEnv()

	{ TEST_ONLY_ON_ENVIRONMENT } = process.env
	if TEST_ONLY_ON_ENVIRONMENT && TEST_ONLY_ON_ENVIRONMENT != 'node'
		console.log("TEST_ONLY_ON_ENVIRONMENT is set to #{TEST_ONLY_ON_ENVIRONMENT}")
		console.log('Skipping node tests')
		return cb()

	gulp.src(OPTIONS.files.tests, read: false)
		.pipe(mocha({
			reporter: 'spec',
			require: ['ts-node/register/transpile-only', 'coffeescript/register'],
			timeout: 5 * 60 * 1000,
			slow: 1000
		}))

gulp.task 'inject-version', ->
	gulp.src(["#{OPTIONS.directories.build}util/sdk-version.js"])
		.pipe(replace('__REPLACE_WITH_PACKAGE_JSON_VERSION__', packageJSON.version))
		.pipe(gulp.dest("#{OPTIONS.directories.build}util/"))

gulp.task 'build-node', ->
	gulp.src(OPTIONS.files.app)
		.pipe(coffee(header: true, bare: true)).on('error', gutil.log)
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'pack-browser', ->
	bundle = browserify
		entries: OPTIONS.files.browserEntry,
		basedir: OPTIONS.directories.build
		standalone: OPTIONS.config.browserLibraryName

	# These modules are referenced in the code, but only get used in Node:
	.exclude('fs')
	.exclude('path')
	.exclude('balena-settings-client')
	.exclude('node-localstorage')
	.bundle()

	bundle
		.pipe(source(OPTIONS.files.browserOutput))
		.pipe(gulp.dest(OPTIONS.directories.build))

	bundle
		.pipe(source(OPTIONS.files.browserMinifiedOutput))
		.pipe(buffer())
		.pipe(minify())
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'build',
	gulp.series(['build-node', 'pack-browser'])
