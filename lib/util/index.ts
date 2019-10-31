errors = require('balena-errors')
assign = require('lodash/assign')
cloneDeep = require('lodash/cloneDeep')
isArray = require('lodash/isArray')
isFunction = require('lodash/isFunction')
isNumber = require('lodash/isNumber')
isString = require('lodash/isString')
throttle = require('lodash/throttle')
memoizee = require('memoizee')
moment = require('moment')

exports.deviceTypes = require('./device-types')
exports.getOsUpdateHelper = require('./device-actions/os-update').getOsUpdateHelper

exports.notImplemented = notImplemented = ->
	throw new Error('The method is not implemented.')

exports.onlyIf = (condition) -> (fn) -> if condition then fn else notImplemented

exports.now = now = throttle(
	-> moment(),
	1000,
	{ leading: true },
)

exports.dateToMoment = dateToMoment = memoizee((date) ->
	return moment(date)
, { max: 1000, primitive: true })

exports.timeSince = (input, suffix = true) ->
	date = dateToMoment(input)

	# We do this to avoid out-of-sync times causing this to return
	# e.g. 'in a few seconds'.
	# if the date is in the future .min will make it at maximum, the time since now
	# which results in 'a few seconds ago'.
	time = now()
	return moment.min(time, date).from(time, !suffix)


exports.isId = isNumber

exports.LOCKED_STATUS_CODE = 423

# Use with: `findCallback(arguments)`.
exports.findCallback = (args) ->
	lastArg = args[args.length - 1]
	if isFunction(lastArg)
		return lastArg
	return null

exports.unauthorizedError =
	code: 'BalenaRequestError'
	statusCode: 401

exports.notFoundResponse =
	code: 'BalenaRequestError'
	statusCode: 404

exports.noDeviceForKeyResponse =
	code: 'BalenaRequestError'
	statusCode: 500
	body: 'No device found to associate with the api key'

exports.noApplicationForKeyResponse =
	code: 'BalenaRequestError'
	statusCode: 500
	body: 'No application found to associate with the api key'

exports.isUniqueKeyViolationResponse = ({code, body}) ->
	code == 'BalenaRequestError' &&
	(
		# api translated response
		body == 'Unique key constraint violated' ||
		# pine response (tested on pine 10)
		/^".*" must be unique\.$/.test(body)
	)

exports.treatAsMissingApplication = (nameOrId) ->
	return (err) ->
		replacementErr = new errors.BalenaApplicationNotFound(nameOrId)
		replacementErr.stack = err.stack
		throw replacementErr

exports.treatAsMissingDevice = (uuidOrId) ->
	return (err) ->
		replacementErr = new errors.BalenaDeviceNotFound(uuidOrId)
		replacementErr.stack = err.stack
		throw replacementErr

exports.isDevelopmentVersion = (version) ->
	/(\.|\+|-)dev/.test(version)

# Merging two sets of pine options sensibly is more complicated than it sounds.
#
# The general rules are:
# * select, orderby, top and skip override (select this, instead of the default)
# * filters are combined (i.e. both filters must match)
# * expands are combined (include both expansions), and this recurses down.
#   * That means $expands within expands are combined
#   * And $selects within expands override
# * Any unknown 'extra' options throw an error. Unknown 'default' options are ignored.
exports.mergePineOptions = (defaults, extras) ->
	if not extras
		return defaults

	result = cloneDeep(defaults)

	for own option, value of extras
		switch option
			when '$select'
				if value?
					if not isArray(value)
						value = [value]

				result[option] = value

			when '$orderby', '$top', '$skip'
				result[option] = value

			when '$filter'
				if defaults.$filter
					result.$filter = $and: [ defaults.$filter, value ]
				else
					result.$filter = value

			when '$expand'
				result.$expand = mergeExpandOptions(defaults.$expand, value)

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

		if extraExpandOptions.$filter
			if expandOptions.$filter
				expandOptions.$filter = $and: [ expandOptions.$filter, extraExpandOptions.$filter ]
			else
				expandOptions.$filter = extraExpandOptions.$filter

		if extraExpandOptions.$expand
			expandOptions.$expand = mergeExpandOptions(expandOptions.$expand, extraExpandOptions.$expand)

	return defaultExpand

# Converts a valid expand object in any format into a new object
# containing (at most) $expand, $filter and $select keys
convertExpandToObject = (expandOption) ->
	if not expandOption?
		return {}
	else if isString(expandOption)
		return "#{expandOption}": {}
	else if isArray(expandOption)
		# Reduce the array into a single object
		return expandOption.reduce (result, option) ->
			assign(result, if isString(option) then { "#{option}": {} } else option)
		, {}
	else
		# Check the options in this object are the ones we know how to merge
		for own expandKey, expandRelationshipOptions of expandOption
			invalidKeys = Object.keys(expandRelationshipOptions).filter (key) ->
				key != '$select' and key != '$expand' and key != '$filter'
			if invalidKeys.length > 0
				throw new Error("Unknown pine expand options: #{invalidKeys}")

		return cloneDeep(expandOption)
