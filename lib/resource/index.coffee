###*
# @namespace resin.models
###
module.exports =

	###*
	# @memberof resin.models
	# @see {@link module:resin.models.application}
	###
	application: require('./models/application')

	###*
	# @memberof resin.models
	# @see {@link module:resin.models.device}
	###
	device: require('./models/device')

	###*
	# @memberof resin.models
	# @see {@link module:resin.models.key}
	###
	key: require('./models/key')

	###*
	# @memberof resin.models
	# @see {@link module:resin.models.environment-variables}
	###
	environmentVariables: require('./models/environment-variables')

	###*
	# @memberof resin.models
	# @see {@link module:resin.models.os}
	###
	os: require('./models/os')

	###*
	# @memberof resin.models
	# @see {@link module:resin.models.config}
	###
	config: require('./models/config')
