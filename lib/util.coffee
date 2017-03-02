errors = require('resin-errors')
isNumber = require('lodash/isNumber')
isArray = require('lodash/isArray')
isString = require('lodash/isString')
fromPairs = require('lodash/fromPairs')
cloneDeep = require('lodash/cloneDeep')

exports.notImplemented = notImplemented = ->
	throw new Error('The method is not implemented.')

exports.onlyIf = (condition) -> (fn) -> if condition then fn else notImplemented

exports.isId = isNumber

exports.notFoundResponse =
	code: 'ResinRequestError'
	statusCode: 404

exports.treatAsMissingApplication = (nameOrId) ->
	return (err) ->
		replacementErr = new errors.ResinApplicationNotFound(nameOrId)
		replacementErr.stack = err.stack
		throw replacementErr

exports.treatAsMissingDevice = (uuidOrId) ->
	return (err) ->
		replacementErr = new errors.ResinDeviceNotFound(uuidOrId)
		replacementErr.stack = err.stack
		throw replacementErr

# Merging two sets of pine options sensibly is more complicated than it sounds.
#
# The general rules are:
# * select, top and skip override (select this instead of the default)
# * filters are combined (i.e. both filters must match)
# * expands are combined (include both expansions), and this recurses down.
#   * That means $expands within expands are combined
#   * And $selects within expands override
# * Any unknown options 'extra' options throw an error. Unknown 'default' options are ignored.
exports.mergePineOptions = (defaults, extras) ->
	if not extras
		return defaults

	result = cloneDeep(defaults)

	for own option, value of extras
		switch option
			when 'select', 'top', 'skip'
				result[option] = value

			when 'filter'
				if defaults.filter
					result.filter = $and: [defaults.filter, value]
				else
					result.filter = value

			when 'expand'
				result.expand = mergeExpandOptions(defaults.expand, value)

			else
				throw new Error("Unknown pine option: #{option}")

	return result

mergeExpandOptions = (defaultExpand, extraExpand) ->
	if not defaultExpand? then return extraExpand

	defaultExpand = convertExpandToObject(defaultExpand)
	extraExpand = convertExpandToObject(extraExpand)

	for own expandKey, extraExpandOptions of extraExpand
		expandOptions = defaultExpand[expandKey] ||= {}

		if extraExpandOptions.$select
			expandOptions.$select = extraExpandOptions.$select

		if extraExpandOptions.$expand
			expandOptions.$expand = mergeExpandOptions(expandOptions.$expand, extraExpandOptions.$expand)

	defaultExpand

# Converts a valid expand object in any format into a new object
# containing (at most) a $expand and a $select key
convertExpandToObject = (expandOption) ->
	if not expandOption?
		return {}
	else if isString(expandOption)
		return "#{expandOption}": {}
	else if isArray(expandOption)
		return fromPairs(expandOption.map((key) -> [key, {}]))
	else
		# Check the options in this object are the ones we know how to merge
		for own expandKey, expandRelationshipOptions of expandOption
			invalidKeys = Object.keys(expandRelationshipOptions).filter (key) ->
				key != '$select' and key != '$expand'
			if invalidKeys.length > 0
				throw new Error("Unknown pine expand options: #{invalidKeys}")

		return cloneDeep(expandOption)
