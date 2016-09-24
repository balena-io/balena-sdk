fs = require('fs')
path = require('path')

gulp = require('gulp')
mocha = require('gulp-mocha')
gutil = require('gulp-util')
coffeelint = require('gulp-coffeelint')
coffee = require('gulp-coffee')
runSequence = require('run-sequence')
packageJSON = require('./package.json')

OPTIONS =
	config:
		coffeelint: path.join(__dirname, 'coffeelint.json')
	files:
		coffee: [ 'lib/**/*.coffee', 'tests/**/*.coffee', 'gulpfile.coffee' ]
		app: 'lib/**/*.coffee'
		integration: 'tests/integration.spec.coffee'
		javascript: 'build/**/*.js'
	directories:
		doc: 'doc/'
		build: 'build/'

gulp.task 'coffee', ->
	gulp.src(OPTIONS.files.app)
		.pipe(coffee()).on('error', gutil.log)
		.pipe(gulp.dest(OPTIONS.directories.build))

loadEnv = ->
	envPath = path.join(__dirname, '.env')
	try
		fs.accessSync(envPath, fs.constants.R_OK)
	catch
		return

	fs.readFileSync(envPath, 'utf8')
		.split(/\n+/)
		.filter (s) -> !!s
		.forEach (s) ->
			i = s.indexOf('=')
			if i < 0
				throw new Error('The .env file looks malformed, key and value must be separated with =')
			key = s.substring(0, i)
			value = s.substring(i + 1)
			process.env[key] = value

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
	runSequence([
		'lint'
	], [ 'coffee' ], callback)

gulp.task 'watch', [ 'build' ], ->
	gulp.watch([ OPTIONS.files.coffee ], [ 'lint' ])
