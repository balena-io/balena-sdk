_ = require('lodash')

exports.notImplemented = notImplemented = ->
	throw new Error('The method is not implemented.')

exports.onlyIf = (condition) -> (fn) -> if condition then fn else notImplemented
