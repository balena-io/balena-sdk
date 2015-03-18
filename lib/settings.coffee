###*
# @module resin.settings
###

ConfJS = require('conf.js')
path = require('path')
userHome = require('user-home')
helpers = require('./helpers')

###*
# @namespace resin.settings
###
settings =

	###*
	# @member {String}
	# @memberof resin.settings
	###
	remoteUrl: 'https://dashboard.resin.io'

	###*
	# @member {String}
	# @memberof resin.settings
	###
	dataPrefix: path.join(userHome, '.resin')

	###*
	# @namespace resin.settings.directories
	###
	directories:

		###*
		# @member {String}
		# @memberof resin.settings.directories
		###
		plugins: 'plugins'

		###*
		# @member {String}
		# @memberof resin.settings.directories
		###
		os: 'os'

	###*
	# @member {String}
	# @memberof resin.settings
	###
	localConfig: '.resinconf'

	###*
	# @namespace resin.settings.files
	###
	files:

		###*
		# @member {String}
		# @memberof resin.settings.files
		###
		config: 'config'

settings.directories = helpers.prefixObjectValuesWithPath(settings.dataPrefix, settings.directories)
settings.files = helpers.prefixObjectValuesWithPath(settings.dataPrefix, settings.files)

###*
# @name set
# @summary Set a setting value
# @public
# @function
# @static
# @memberof module:resin.settings
# @see {@link https://github.com/resin-io/conf.js}
#
# @param {String} key - setting key
# @param {*} value - setting value
###

###*
# @name get
# @summary Get a setting value
# @public
# @function
# @static
# @memberof module:resin.settings
# @see {@link https://github.com/resin-io/conf.js}
#
# @param {String} key - setting key
# @returns {*} key value
###

###*
# @name has
# @summary Has a setting value
# @public
# @function
# @static
# @memberof module:resin.settings
# @see {@link https://github.com/resin-io/conf.js}
#
# @param {String} key - setting key
# @returns {Boolean} has key value
###

module.exports = new ConfJS
	keys:
		userConfig: 'files.config'
		localConfig: 'localConfig'
	default: settings
