errors = require('resin-errors')
semver = require('semver')
assign = require('lodash/assign')
cloneDeep = require('lodash/cloneDeep')
groupBy = require('lodash/groupBy')
includes = require('lodash/includes')
isArray = require('lodash/isArray')
isEmpty = require('lodash/isEmpty')
isFunction = require('lodash/isFunction')
isNumber = require('lodash/isNumber')
isString = require('lodash/isString')
mapKeys = require('lodash/mapKeys')
mapValues = require('lodash/mapValues')
omit = require('lodash/omit')
throttle = require('lodash/throttle')
memoizee = require('memoizee')
moment = require('moment')

exports.deviceTypes = require('./device-types')
exports.getImgMakerHelper = require('./img-maker')

exports.dollarify = (obj) -> mapKeys(obj, (v, k) -> "$#{k}")

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

exports.notFoundResponse =
	code: 'ResinRequestError'
	statusCode: 404

exports.noDeviceForKeyResponse =
	code: 'ResinRequestError'
	statusCode: 500
	body: 'No device found to associate with the api key'

exports.noApplicationForKeyResponse =
	code: 'ResinRequestError'
	statusCode: 500
	body: 'No application found to associate with the api key'

exports.uniqueKeyViolated =
	code: 'ResinRequestError'
	body: 'Unique key constraint violated'

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

safeSemver = (version) ->
	version.replace(/(\.[0-9]+)\.rev/, '$1+rev')

exports.osVersionRCompare = (versionA, versionB) ->
	versionA = safeSemver(versionA)
	versionB = safeSemver(versionB)
	semverResult = semver.rcompare(versionA, versionB)
	if semverResult != 0
		return semverResult

	revA = getRev(versionA)
	revB = getRev(versionB)

	if revA isnt revB
		return revB - revA

	devA = exports.isDevelopmentVersion(versionA)
	devB = exports.isDevelopmentVersion(versionB)
	if devA isnt devB
		return devA - devB

	return versionA.localeCompare(versionB)

exports.isDevelopmentVersion = (version) ->
	/(\.|\+|-)dev/.test(version)

exports.isProvisioned = (device) ->
	!isEmpty(device.supervisor_version) and !isEmpty(device.last_connectivity_event)

getRev = (osVersion) ->
	rev = semver.parse(osVersion).build
	.map((metadataPart) -> /rev(\d+)/.exec(metadataPart)?[1])
	.filter((x) -> x?)[0]

	if rev?
		parseInt(rev, 10)
	else
		0

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
		# Drop leading `$`, so we support select & $select
		# We'll move to _only_ $select with pine 5, this is a short-term change (hopefully)
		switch option.replace(/^\$/, '')
			when 'select'
				if value?
					if not isArray(value)
						value = [value]

				result[option] = value

			when 'orderby', 'top', 'skip'
				result[option] = value

			when 'filter'
				if defaults.filter
					result.filter = $and: [ defaults.filter, value ]
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

# Pine options necessary for getting raw service data for a device
exports.getCurrentServiceDetailsPineOptions = ->
	expand:
		image_install:
			$select: [
				'id'
				'download_progress'
				'status'
				'install_date'
			]
			$filter:
				# We filter out deleted images entirely
				$ne:
					[
						$tolower: $: 'status'
						'deleted'
					]
			$expand:
				image:
					$select: ['id']
					$expand:
						is_a_build_of__service:
							$select: ['id', 'service_name']
				is_provided_by__release:
					$select: ['id', 'commit']

# Converts raw service data into a more usable structure and attaches it to the
# device object under the `current_services` key
exports.generateCurrentServiceDetails = (rawData) ->
		containers = rawData.image_install.map (install) ->
			release = install.is_provided_by__release[0]
			image = install.image[0]
			service = image.is_a_build_of__service[0]

			return Object.assign {}, omit(install, 'image'),
				service_name: service.service_name
				image_id: image.id
				service_id: service.id
				commit: release.commit

		# Strip expanded fields (we reformat and re-add them below)
		device = omit(rawData, [
			'image_install'
		])

		device.current_services = mapValues groupBy(containers, 'service_name'), (service_containers) ->
			service_containers.map (container) ->
				omit(container, 'service_name')
			.sort (a, b) ->
				b.install_date.localeCompare(a.install_date)

		return device
