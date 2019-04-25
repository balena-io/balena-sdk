includes = require('lodash/includes')
isEmpty = require('lodash/isEmpty')
bSemver = require('balena-semver')
{ isProvisioned } = require('.')

exports.normalizeDeviceOsVersion = (device) ->
	if device.os_version? and isEmpty(device.os_version) and isProvisioned(device)
		device.os_version = 'Resin OS 1.0.0-pre'

	return

exports.getDeviceOsSemverWithVariant = ({ os_version, os_variant }) ->
	if !os_version
		return null

	versionInfo = bSemver.parse(os_version)
	if !versionInfo
		return null

	version = versionInfo.version
	if os_variant and !includes(versionInfo.build.concat(versionInfo.prerelease), os_variant)
		versionInfo.build.push(os_variant)

	if !isEmpty(versionInfo.build)
		version = "#{version}+#{versionInfo.build.join('.')}"

	return version
