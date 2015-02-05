path = require('path')
gulp = require('gulp')
mocha = require('gulp-mocha')
gutil = require('gulp-util')
coffeelint = require('gulp-coffeelint')
coffee = require('gulp-coffee')
jsdoc = require('gulp-jsdoc')
runSequence = require('run-sequence')
packageJSON = require('./package.json')

OPTIONS =
	config:
		coffeelint: path.join(__dirname, 'coffeelint.json')
	files:
		coffee: [ 'lib/**/*.coffee', 'tests/**/*.spec.coffee', 'gulpfile.coffee' ]
		json: 'lib/**/*.json'
		app: 'lib/**/*.coffee'
		tests: 'tests/**/*.spec.coffee'
		javascript: 'build/**/*.js'
	directories:
		doc: 'doc/'
		build: 'build/'

gulp.task 'coffee', ->
	gulp.src(OPTIONS.files.app)
		.pipe(coffee()).on('error', gutil.log)
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'jsdoc', [ 'coffee' ], ->
	gulp.src([ OPTIONS.files.javascript, 'README.md' ])
		.pipe(jsdoc.parser({
			name: 'Resin SDK'
			description: 'The SDK to make Resin.io powered JavaScript applications'
			version: packageJSON.version
			licenses: [ 'MIT' ]
		}))
		.pipe(jsdoc.generator(OPTIONS.directories.doc))

gulp.task 'json', ->
	gulp.src(OPTIONS.files.json)
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'test', ->
	gulp.src(OPTIONS.files.tests, read: false)
		.pipe(mocha({
			reporter: 'landing'
		}))

gulp.task 'lint', ->
	gulp.src(OPTIONS.files.coffee)
		.pipe(coffeelint({
			optFile: OPTIONS.config.coffeelint
		}))
		.pipe(coffeelint.reporter())

gulp.task 'build', (callback) ->
	runSequence([ 'lint', 'test' ], [ 'json', 'coffee' ], 'jsdoc', callback)

gulp.task 'watch', [ 'build' ], ->
	gulp.watch([ OPTIONS.files.coffee, OPTIONS.files.json ], [ 'build' ])
