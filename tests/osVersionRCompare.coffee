# we keep this to ensure balena-semver has the exact same behavior
# and will drop it in a later PR
semver = require('semver')

safeSemver = (version) ->
	version.replace(/(\.[0-9]+)\.rev/, '$1+rev')

getRev = (osVersion) ->
	rev = semver.parse(osVersion).build
	.map((metadataPart) -> /rev(\d+)/.exec(metadataPart)?[1])
	.filter((x) -> x?)[0]

	if rev?
		parseInt(rev, 10)
	else
		0

isDevelopmentVersion = (version) ->
	/(\.|\+|-)dev/.test(version)

# TODO: Drop this once we make sure balena-semver is doign the exact same thing
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

	devA = isDevelopmentVersion(versionA)
	devB = isDevelopmentVersion(versionB)
	if devA isnt devB
		return devA - devB

	return versionA.localeCompare(versionB)
