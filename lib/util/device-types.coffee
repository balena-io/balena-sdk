# copied from the @resin-io/device-types
# because that has the run-time dependency on coffee-script

find = (array, predicate) ->
	for el in array
		return el if predicate(el)

includes = (array, el) -> array and el in array

dtPredicate = (slug) ->
	return (deviceType) ->
		deviceType.slug is slug or includes(deviceType.aliases, slug)

exports.findBySlug = findBySlug = (deviceTypes, slug) ->
	find(deviceTypes, dtPredicate(slug))

exports.normalizeDeviceType = (deviceTypes, slug) ->
	# returns `undefined` in case of invalid slug
	findBySlug(deviceTypes, slug)?.slug
