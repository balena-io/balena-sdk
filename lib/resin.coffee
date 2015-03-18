###*
# @namespace resin
###
module.exports =

	###*
	# @memberof resin
	# @see {@link resin.models}
	###
	models: require('./resource')

	###*
	# @memberof resin
	# @see {@link module:resin.auth}
	###
	auth: require('./auth')

	###*
	# @memberof resin
	# @see {@link module:resin.settings}
	###
	settings: require('./settings')

	###*
	# @memberof resin
	# @see {@link module:resin.logs}
	###
	logs: require('./logs')
