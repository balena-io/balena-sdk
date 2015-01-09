TypedError = require('typed-error')

exports.NotFound = class NotFound extends TypedError

	###*
	# @summary Construct a Not Found error
	# @private
	# @constructor
	#
	# @param {String} name - name of the thing that was not found
	#
	# @example
	#	throw new resin.errors.NotFound('application')
	#	Error: Couldn't find application
	###
	constructor: (name) ->
		@message = "Couldn't find #{name}"

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1

exports.InvalidConfigFile = class InvalidConfigFile extends TypedError

	###*
	# @summary Construct an Invalid Config File error
	# @private
	# @constructor
	#
	# @param {String} file - the name of the invalid configuration file
	#
	# @example
	#	throw new resin.errors.InvalidConfigFile('/opt/resin.conf')
	#	Error: Invalid configuration file: /opt/resin.conf
	###
	constructor: (file) ->
		@message = "Invalid configuration file: #{file}"

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1

exports.InvalidCredentials = class InvalidCredentials extends TypedError

	###*
	# @summary Construct an Invalid Credentials error
	# @private
	# @constructor
	#
	# @example
	#	throw new resin.errors.InvalidCredentials()
	#	Error: Invalid credentials
	###
	constructor: ->
		@message = 'Invalid credentials'

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1

exports.InvalidKey = class InvalidKey extends TypedError

	###*
	# @summary Construct an Invalid Key error
	# @private
	# @constructor
	#
	# @example
	#	throw new resin.errors.InvalidKey()
	#	Error: Invalid key
	###
	constructor: ->
		@message = 'Invalid key'

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1

exports.InvalidPath = class InvalidPath extends TypedError

	###*
	# @summary Construct an Invalid Path error
	# @private
	# @constructor
	#
	# @param {String} path - the name of the invalid path
	#
	# @example
	#	throw new resin.errors.InvalidPath('/tmp')
	#	Error: Invalid path: /tmp
	###
	constructor: (path) ->
		@message = "Invalid path: #{path}"

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1

exports.DirectoryDoesntExist = class DirectoryDoesntExist extends TypedError

	###*
	# @summary Construct a Directory Doesn't Exist error
	# @private
	# @constructor
	#
	# @param {String} directory - the name of the directory that doesn't exist
	#
	# @example
	#	throw new resin.errors.DirectoryDoesntExist('/tmp')
	#	Error: Directory doesn't exist: /tmp
	###
	constructor: (directory) ->
		@message = "Directory doesn't exist: #{directory}"

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1

exports.NotAny = class NotAny extends TypedError

	###*
	# @summary Construct an Not Any error
	# @private
	# @constructor
	#
	# @param {String} name - name of the thing that the user doesn't have
	#
	# @example
	#	throw new resin.errors.NotAny('applications')
	#	Error: You don't have any applications
	###
	constructor: (name) ->
		@message = "You don't have any #{name}"

	###*
	# @member {Number} Error exit code
	###
	exitCode: 0

exports.FileNotFound = class FileNotFound extends TypedError

	###*
	# @summary Construct an File Not Found error
	# @private
	# @constructor
	#
	# @param {String} filename - name of the file that was not found
	#
	# @example
	#	throw new resin.errors.FileNotFound('/foo')
	#	Error: File not found: /foo
	###
	constructor: (filename) ->
		@message = "File not found: #{filename}"

	###*
	# @member {Number} Error exit code
	###
	exitCode: 1
