isEmpty = require('lodash/isEmpty')
{ isProvisioned } = require('.')

exports.normalizeDeviceOsVersion = (device) ->
	if device.os_version? and isEmpty(device.os_version) and isProvisioned(device)
		device.os_version = 'Resin OS 1.0.0-pre'

	return
