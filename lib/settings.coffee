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
	apiPrefix: '/ewa/'

	###*
	# @member {String}
	# @memberof resin.settings
	###
	tokenKey: 'token'

	###*
	# @member {String}
	# @memberof resin.settings
	###
	dataPrefix: path.join(userHome, '.resin')

	###*
	# @member {Number}
	# @memberof resin.settings
	###
	sshKeyWidth: 43

	###*
	# @member {String}
	# @memberof resin.settings
	###
	gitRemote: 'resin'

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

	###*
	# @namespace resin.settings.pubnub
	###
	pubnub:

		###*
		# @member {Boolean}
		# @memberof resin.settings.pubnub
		###
		ssl: true

	###*
	# @namespace resin.settings.events
	###
	events:

		###*
		# @member {String}
		# @memberof resin.settings.events
		###
		deviceLogs: 'device-<%= uuid %>-logs'

	###*
	# @namespace resin.settings.urls
	###
	urls:

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		config: '/config'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		signup: '/signup'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		preferences: '/preferences'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		register: '/user/register'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		keys: '/user/keys'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		identify: '/blink'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		authenticate: '/login_'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		applicationRestart: '/application/<%= id %>/restart'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		sshKey: '/user/keys/<%= id %>'

		###*
		# @member {String}
		# @memberof resin.settings.urls
		###
		download: '/download'

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
