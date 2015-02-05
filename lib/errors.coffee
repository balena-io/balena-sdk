###*
# @namespace errors
###

TypedError = require('typed-error')

###*
# An invalid device type error
# @class ResinInvalidDeviceType
# @protected
# @memberof errors
#
# @param {String} type - the invalid device type
###
exports.ResinInvalidDeviceType = class ResinInvalidDeviceType extends TypedError
	constructor: (@type) ->
		###*
		# @name type
		# @type String
		# @memberof errors.ResinInvalidDeviceType
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinInvalidDeviceType
		# @instance
		# @constant
		# @default Invalid device type: this.type
		###
		@message = "Invalid device type: #{@type}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinInvalidDeviceType
	# @instance
	# @constant
	# @default ResinInvalidDeviceType
	###
	code: 'ResinInvalidDeviceType'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinInvalidDeviceType
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A missing credential error
# @class ResinMissingCredential
# @protected
# @memberof errors
#
# @param {String} credential - the missing credential name
###
exports.ResinMissingCredential = class ResinMissingCredential extends TypedError
	constructor: (@credential) ->
		###*
		# @name credential
		# @type String
		# @memberof errors.ResinMissingCredential
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinMissingCredential
		# @instance
		# @constant
		# @default Missing credential: this.credential
		###
		@message = "Missing credential: #{@credential}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinMissingCredential
	# @instance
	# @constant
	# @default ResinMissingCredential
	###
	code: 'ResinMissingCredential'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinMissingCredential
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A missing data prefix error
# @class ResinMissingDataPrefix
# @protected
# @memberof errors
###
exports.ResinMissingDataPrefix = class ResinMissingDataPrefix extends TypedError
	constructor: ->

		###*
		# @name message
		# @type String
		# @memberof errors.ResinMissingDataPrefix
		# @instance
		# @constant
		# @default Did you forget to set a prefix?
		###
		@message = 'Did you forget to set a prefix?'

	###*
	# @name code
	# @type String
	# @memberof errors.ResinMissingDataPrefix
	# @instance
	# @constant
	# @default ResinMissingDataPrefix
	###
	code: 'ResinMissingDataPrefix'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinMissingDataPrefix
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A no internet connection error
# @class ResinNoInternetConnection
# @protected
# @memberof errors
###
exports.ResinNoInternetConnection = class ResinNoInternetConnection extends TypedError
	constructor: ->

		###*
		# @name message
		# @type String
		# @memberof errors.ResinNoInternetConnection
		# @instance
		# @constant
		# @default You need internet connection to perform this task
		###
		@message = 'You need internet connection to perform this task'

	###*
	# @name code
	# @type String
	# @memberof errors.ResinNoInternetConnection
	# @instance
	# @constant
	# @default ResinNoInternetConnection
	###
	code: 'ResinNoInternetConnection'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinNoInternetConnection
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# An invalid option error
# @class ResinInvalidOption
# @protected
# @memberof errors
#
# @param {String} name - the invalid option name
# @param {*} value - the invalid option value
# @param {String} [explanation] - an optional explanation
###
exports.ResinInvalidOption = class ResinInvalidOption extends TypedError
	constructor: (@name, @value, @explanation) ->

		###*
		# @name name
		# @type String
		# @memberof errors.ResinInvalidOption
		# @instance
		# @constant
		###

		###*
		# @name value
		# @type *
		# @memberof errors.ResinInvalidOption
		# @instance
		# @constant
		###

		###*
		# @name explanation
		# @type String
		# @memberof errors.ResinInvalidOption
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinInvalidOption
		# @instance
		# @constant
		# @default Invalid option this.name: this.value. this.explanation.
		###
		@message = "Invalid option #{@name}: #{@value}"

		if @explanation?
			@message += ". #{@explanation}."

	###*
	# @name code
	# @type String
	# @memberof errors.ResinInvalidOption
	# @instance
	# @constant
	# @default ResinInvalidOption
	###
	code: 'ResinInvalidOption'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinInvalidOption
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A missing option error
# @class ResinMissingOption
# @protected
# @memberof errors
#
# @param {String} name - the missing option name
###
exports.ResinMissingOption = class ResinMissingOption extends TypedError
	constructor: (@name) ->

		###*
		# @name name
		# @type String
		# @memberof errors.ResinMissingOption
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinMissingOption
		# @instance
		# @constant
		# @default Missing option: this.name
		###
		@message = "Missing option: #{@name}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinMissingOption
	# @instance
	# @constant
	# @default ResinMissingOption
	###
	code: 'ResinMissingOption'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinMissingOption
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A non allowed option error
# @class ResinNonAllowedOption
# @protected
# @memberof errors
#
# @param {String} name - the non allowed option name
###
exports.ResinNonAllowedOption = class ResinNonAllowedOption extends TypedError
	constructor: (@name) ->

		###*
		# @name name
		# @type String
		# @memberof errors.ResinNonAllowedOption
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinNonAllowedOption
		# @instance
		# @constant
		# @default Non allowed option: this.name
		###
		@message = "Non allowed option: #{@name}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinNonAllowedOption
	# @instance
	# @constant
	# @default ResinNonAllowedOption
	###
	code: 'ResinNonAllowedOption'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinNonAllowedOption
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# An invalid parameter error
# @class ResinInvalidParameter
# @protected
# @memberof errors
#
# @param {String} name - the invalid parameter name
# @param {*} value - the invalid parameter value
# @param {String} [explanation] - an optional explanation
###
exports.ResinInvalidParameter = class ResinInvalidParameter extends TypedError
	constructor: (@name, @value, @explanation) ->

		###*
		# @name name
		# @type String
		# @memberof errors.ResinInvalidParameter
		# @instance
		# @constant
		###

		###*
		# @name value
		# @type *
		# @memberof errors.ResinInvalidParameter
		# @instance
		# @constant
		###

		###*
		# @name explanation
		# @type String
		# @memberof errors.ResinInvalidParameter
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinInvalidParameter
		# @instance
		# @constant
		# @default Invalid parameter this.name: this.value. this.explanation.
		###
		@message = "Invalid parameter #{@name}: #{@value}"

		if @explanation?
			@message += ". #{@explanation}."

	###*
	# @name code
	# @type String
	# @memberof errors.ResinInvalidParameter
	# @instance
	# @constant
	# @default ResinInvalidParameter
	###
	code: 'ResinInvalidParameter'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinInvalidParameter
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A missing parameter error
# @class ResinMissingParameter
# @protected
# @memberof errors
#
# @param {String} name - the missing parameter name
###
exports.ResinMissingParameter = class ResinMissingParameter extends TypedError
	constructor: (@name) ->

		###*
		# @name name
		# @type String
		# @memberof errors.ResinMissingParameter
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinMissingParameter
		# @instance
		# @constant
		# @default Missing parameter: this.name
		###
		@message = "Missing parameter: #{@name}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinMissingParameter
	# @instance
	# @constant
	# @default ResinMissingParameter
	###
	code: 'ResinMissingParameter'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinMissingParameter
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# An invalid data key error
# @class ResinInvalidDataKey
# @protected
# @memberof errors
#
# @param {String} key - the invalid data key
###
exports.ResinInvalidDataKey = class ResinInvalidDataKey extends TypedError
	constructor: (@key) ->

		###*
		# @name key
		# @type String
		# @memberof errors.ResinInvalidDataKey
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinInvalidDataKey
		# @instance
		# @constant
		# @default Invalid data key: this.key
		###
		@message = "Invalid data key: #{@key}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinInvalidDataKey
	# @instance
	# @constant
	# @default ResinInvalidDataKey
	###
	code: 'ResinInvalidDataKey'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinInvalidDataKey
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# An invalid path error
# @class ResinInvalidPath
# @protected
# @memberof errors
#
# @param {String} path - the invalid path
###
exports.ResinInvalidPath = class ResinInvalidPath extends TypedError
	constructor: (@path) ->

		###*
		# @name path
		# @type String
		# @memberof errors.ResinInvalidPath
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinInvalidPath
		# @instance
		# @constant
		# @default Invalid path: this.path
		###
		@message = "Invalid path: #{@path}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinInvalidPath
	# @instance
	# @constant
	# @default ResinInvalidPath
	###
	code: 'ResinInvalidPath'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinInvalidPath
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A no such directory error
# @class ResinNoSuchDirectory
# @protected
# @memberof errors
#
# @param {String} path - the path that is not a directory
###
exports.ResinNoSuchDirectory = class ResinNoSuchDirectory extends TypedError
	constructor: (@path) ->

		###*
		# @name path
		# @type String
		# @memberof errors.ResinNoSuchDirectory
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinNoSuchDirectory
		# @instance
		# @constant
		# @default No such directory: this.path
		###
		@message = "No such directory: #{@path}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinNoSuchDirectory
	# @instance
	# @constant
	# @default ResinNoSuchDirectory
	###
	code: 'ResinNoSuchDirectory'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinNoSuchDirectory
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# An application not found error
# @class ResinApplicationNotFound
# @protected
# @memberof errors
#
# @param {String|Number} id - the not found application id
###
exports.ResinApplicationNotFound = class ResinApplicationNotFound extends TypedError
	constructor: (@id) ->

		###*
		# @name id
		# @type String|Number
		# @memberof errors.ResinApplicationNotFound
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinApplicationNotFound
		# @instance
		# @constant
		# @default Application not found: this.id
		###
		@message = "Application not found: #{@id}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinApplicationNotFound
	# @instance
	# @constant
	# @default ResinApplicationNotFound
	###
	code: 'ResinApplicationNotFound'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinApplicationNotFound
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A device not found error
# @class ResinDeviceNotFound
# @protected
# @memberof errors
#
# @param {String|Number} id - the not found device id
###
exports.ResinDeviceNotFound = class ResinDeviceNotFound extends TypedError
	constructor: (@id) ->

		###*
		# @name id
		# @type String|Number
		# @memberof errors.ResinDeviceNotFound
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinDeviceNotFound
		# @instance
		# @constant
		# @default Device not found: this.id
		###
		@message = "Device not found: #{@id}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinDeviceNotFound
	# @instance
	# @constant
	# @default ResinDeviceNotFound
	###
	code: 'ResinDeviceNotFound'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinDeviceNotFound
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A key not found error
# @class ResinKeyNotFound
# @protected
# @memberof errors
#
# @param {String|Number} id - the not found key id
###
exports.ResinKeyNotFound = class ResinKeyNotFound extends TypedError
	constructor: (@id) ->

		###*
		# @name id
		# @type String|Number
		# @memberof errors.ResinKeyNotFound
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinKeyNotFound
		# @instance
		# @constant
		# @default Key not found: this.id
		###
		@message = "Key not found: #{@id}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinKeyNotFound
	# @instance
	# @constant
	# @default ResinKeyNotFound
	###
	code: 'ResinKeyNotFound'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinKeyNotFound
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A request error
# @class ResinKeyNotFound
# @protected
# @memberof errors
#
# @param {String|Object} body - the response body
###
exports.ResinRequestError = class ResinRequestError extends TypedError
	constructor: (@body) ->

		###*
		# @name body
		# @type String|Object
		# @memberof errors.ResinRequestError
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinRequestError
		# @instance
		# @constant
		# @default Request error: this.body
		###
		@message = "Request error: #{@body}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinRequestError
	# @instance
	# @constant
	# @default ResinRequestError
	###
	code: 'ResinRequestError'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinRequestError
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# An invalid application error
# @class ResinInvalidApplication
# @protected
# @memberof errors
#
# @param {String} application - the invalid application name
###
exports.ResinInvalidApplication = class ResinInvalidApplication extends TypedError
	constructor: (@application) ->

		###*
		# @name application
		# @type String
		# @memberof errors.ResinInvalidApplication
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinInvalidApplication
		# @instance
		# @constant
		# @default Invalid application: this.application
		###
		@message = "Invalid application: #{@application}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinInvalidApplication
	# @instance
	# @constant
	# @default ResinInvalidApplication
	###
	code: 'ResinInvalidApplication'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinInvalidApplication
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A directory not git repository error
# @class ResinDirectoryNotGitRepository
# @protected
# @memberof errors
#
# @param {String} directory - the directory path
###
exports.ResinDirectoryNotGitRepository = class ResinDirectoryNotGitRepository extends TypedError
	constructor: (@directory) ->

		###*
		# @name directory
		# @type String
		# @memberof errors.ResinDirectoryNotGitRepository
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinDirectoryNotGitRepository
		# @instance
		# @constant
		# @default Invalid application: this.application
		###
		@message = "Directory is not a git repository: #{@directory}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinDirectoryNotGitRepository
	# @instance
	# @constant
	# @default ResinDirectoryNotGitRepository
	###
	code: 'ResinDirectoryNotGitRepository'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinDirectoryNotGitRepository
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1

###*
# A not any error
# @class ResinNotAny
# @protected
# @memberof errors
#
# @param {String} resource - the resource name
###
exports.ResinNotAny = class ResinNotAny extends TypedError
	constructor: (@resource) ->

		###*
		# @name resource
		# @type String
		# @memberof errors.ResinNotAny
		# @instance
		# @constant
		###

		###*
		# @name message
		# @type String
		# @memberof errors.ResinNotAny
		# @instance
		# @constant
		# @default You don't have any this.resource
		###
		@message = "You don't have any #{@resource}"

	###*
	# @name code
	# @type String
	# @memberof errors.ResinNotAny
	# @instance
	# @constant
	# @default ResinNotAny
	###
	code: 'ResinNotAny'

	###*
	# @name exitCode
	# @type Number
	# @memberof errors.ResinNotAny
	# @instance
	# @constant
	# @default 1
	###
	exitCode: 1
