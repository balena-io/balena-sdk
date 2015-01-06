path = require('path')
gulp = require('gulp')
mocha = require('gulp-mocha')
gutil = require('gulp-util')
coffeelint = require('gulp-coffeelint')
coffee = require('gulp-coffee')
jsdoc = require('gulp-jsdoc')

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
	gulp.src(OPTIONS.files.javascript)
		.pipe(jsdoc(OPTIONS.directories.doc))

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

gulp.task 'build', [
	'lint'
	'test'
	'json'
	'coffee'
	'jsdoc'
]

gulp.task 'watch', [ 'build' ], ->
	gulp.watch([ OPTIONS.files.coffee, OPTIONS.files.json ], [ 'build' ])
