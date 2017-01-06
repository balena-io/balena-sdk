path = require('path')

gulp = require('gulp')
mocha = require('gulp-mocha')
gutil = require('gulp-util')
coffeelint = require('gulp-coffeelint')
coffee = require('gulp-coffee')
runSequence = require('run-sequence')
browserify = require('browserify')
uglify = require('gulp-uglify')
source = require('vinyl-source-stream')
buffer = require('vinyl-buffer')

packageJSON = require('./package.json')

{ loadEnv } = require('./tests/util')

OPTIONS =
	config:
		coffeelint: path.join(__dirname, 'coffeelint.json')
		browserLibraryName: 'resin-sdk'
	files:
		coffee: [ 'lib/**/*.coffee', 'tests/**/*.coffee', 'gulpfile.coffee' ]
		app: 'lib/**/*.coffee'
		integration: 'tests/integration.spec.coffee'
		browserEntry: 'resin.js'
		browserOutput: 'resin-browser.js'
	directories:
		doc: 'doc/'
		build: 'build/'

gulp.task 'test', ->
	loadEnv()
	gulp.src(OPTIONS.files.integration, read: false)
		.pipe(mocha({
			reporter: 'spec'
		}))

gulp.task 'lint', ->
	gulp.src(OPTIONS.files.coffee)
		.pipe(coffeelint({
			optFile: OPTIONS.config.coffeelint
		}))
		.pipe(coffeelint.reporter())

gulp.task 'build', (callback) ->
	runSequence('lint', 'build-node', 'build-browser', callback)

gulp.task 'build-node', ->
	gulp.src(OPTIONS.files.app)
		.pipe(coffee(header: true)).on('error', gutil.log)
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'build-browser', ['build-node'], ->
	browserify
		entries: OPTIONS.files.browserEntry,
		basedir: OPTIONS.directories.build
		standalone: OPTIONS.config.browserLibraryName
	.bundle()
	.pipe(source(OPTIONS.files.browserOutput))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'watch', [ 'build' ], ->
	gulp.watch([ OPTIONS.files.coffee ], [ 'lint' ])
