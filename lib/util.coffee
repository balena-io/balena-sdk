errors = require('resin-errors')
isNumber = require('lodash/isNumber')

exports.notImplemented = notImplemented = ->
	throw new Error('The method is not implemented.')

exports.onlyIf = (condition) -> (fn) -> if condition then fn else notImplemented

exports.isId = isNumber

treat404AsOtherError = (replacementError) ->
	(error) ->
		if error.code == 'ResinRequestError' and error.statusCode == 404
			replacementError.stack = error.stack
			throw replacementError
		else
			throw error

exports.treat404AsMissingApplication = (nameOrId) ->
	treat404AsOtherError(new errors.ResinApplicationNotFound(nameOrId))

exports.treat404AsMissingDevice = (uuidOrId) ->
	treat404AsOtherError(new errors.ResinDeviceNotFound(uuidOrId))
