###*
# @module resin/models/device
###

pine = require('../pine')
_ = require('lodash-contrib')
errors = require('../errors')
server = require('../server')
settings = require('../settings')
DEVICES = require('./device-data.json')

###*
# A Resin API device
# @typedef {Object} Device
###

###*
# getAll callback
# @callback module:resin/models/device~getAllCallback
# @param {(Error|null)} error - error
# @param {Device[]} devices - devices
###

###*
# @summary Get all devices
# @public
# @function
#
# @param {module:resin/models/device~getAllCallback} callback - callback(error, devices)
#
# @example
#	resin.models.devices.getAll (error, devices) ->
#		throw error if error?
#		console.log(devices)
###
exports.getAll = (callback) ->
	return pine.get
		resource: 'device'
		options:
			expand: 'application'
			orderby: 'name asc'
	.then (devices) ->
		if _.isEmpty(devices)
			return callback(new errors.NotAny('devices'))

		return callback(null, devices)

	.catch (error) ->
		return callback(error)

###*
# getAllByApplication callback
# @callback module:resin/models/device~getAllByApplicationCallback
# @param {(Error|null)} error - error
# @param {Device[]} devices - devices
###

###*
# @summary Get all devices by application
# @public
# @function
#
# @param {(String|Number)} applicationId - application id
# @param {module:resin/models/device~getAllByApplicationCallback} callback - callback
#
# @example
#	resin.models.devices.getAllByApplication (error, devices) ->
#		throw error if error?
#		console.log(devices)
###
exports.getAllByApplication = (applicationId, callback) ->
	return pine.get
		resource: 'device'
		options:
			filter:
				application: applicationId
			expand: 'application'
			orderby: 'name asc'
	.then (devices) ->
		if _.isEmpty(devices)
			return callback(new errors.NotAny('devices'))

		# TODO: Move to server
		devices = _.map devices, (device) ->
			device.application_name = device.application[0].app_name
			device.device_display_name = exports.getDisplayName(device.device_type)
			return device

		return callback(null, devices)

	.catch (error) ->
		return callback(error)

###*
# get callback
# @callback module:resin/models/device~getCallback
# @param {(Error|null)} error - error
# @param {Device} device - device
###

###*
# @summary Get a single device
# @public
# @function
#
# @param {(String|Number)} id - device id
# @param {module:resin/models/device~getCallback} callback - callback
#
# @example
#	resin.models.device.get 51, (error, device) ->
#		throw error if error?
#		console.log(device)
###
exports.get = (deviceId, callback) ->
	return pine.get
		resource: 'device'
		id: deviceId
		options:
			expand: 'application'

	.then (device) ->
		if not device?
			return callback(new errors.NotFound("device #{id}"))

		# TODO: Move to server
		device.application_name = device.application[0].app_name
		device.device_display_name = exports.getDisplayName(device.device_type)

		return callback(null, device)

	.catch (error) ->
		return callback(error)

###*
# remove callback
# @callback module:resin/models/device~removeCallback
# @param {(Error|null)} error - error
###

###*
# @summary Remove device
# @public
# @function
#
# @param {(String|Number)} id - device id
# @param {module:resin/models/device~removeCallback} callback - callback
#
# @example
#	resin.models.device.remove 51, (error) ->
#		throw error if error?
###
exports.remove = (id, callback) ->
	return pine.delete
		resource: 'device'
		id: id
	.then ->
		return callback()
	.catch (error) ->
		return callback(error)

###*
# identify callback
# @callback module:resin/models/device~identifyCallback
# @param {(Error|null)} error - error
###

###*
# @summary Identify device
# @public
# @function
#
# @param {String} uuid - device uuid
# @param {module:resin/models/device~identifyCallback} callback - callback
#
# @example
#	resin.models.device.identify '23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a21369ac0f00db828', (error) ->
#		throw error if error?
###
exports.identify = (uuid, callback) ->
	server.post(settings.get('urls.identify'), { uuid }, _.unary(callback))

###*
# rename callback
# @callback module:resin/models/device~renameCallback
# @param {(Error|null)} error - error
###

###*
# @summary Rename device
# @public
# @function
#
# @param {(String|Number)} id - device id
# @param {String} name - the device new name
# @param {module:resin/models/device~renameCallback} callback - callback
#
# @todo This action doesn't return any error
# if trying to rename a device that does not
# exists. This should be fixed server side.
#
# @example
#	resin.models.device.rename 317, 'NewName', (error) ->
#		throw error if error?
#		console.log("Device has been renamed!")
###
exports.rename = (id, name, callback) ->
	return pine.patch
		resource: 'device'
		id: id
		data:
			name: name

	.then ->
		return callback()

	.catch (error) ->
		return callback(error)

###*
# note callback
# @callback module:resin/models/device~noteCallback
# @param {(Error|null)} error - error
###

###*
# @summary Note a device
# @public
# @function
#
# @param {(String|Number)} id - device id
# @param {String} note - the note
# @param {module:resin/models/device~noteCallback} callback - callback
#
# @example
#	resin.models.device.note 317, 'My useful note', (error) ->
#		throw error if error?
#		console.log("Device has been noted!")
###
exports.note = (id, note, callback) ->
	return pine.patch
		resource: 'device'
		id: id
		data:
			note: note

	.then ->
		return callback()

	.catch (error) ->
		return callback(error)

###*
# isValidUUID callback
# @callback module:resin/models/device~isValidUUIDCallback
# @param {(Error|null)} error - error
# @param {Boolean} isValid - whether is valid or not
###

###*
# @summary Checks if a UUID is valid
# @public
# @function
#
# @param {String} uuid - the device uuid
# @param {module:resin/models/device~isValidUUIDCallback} callback - callback
#
# @todo We should get better server side support for this operation
# to avoid having to get all devices list and check manually.
#
# @example
# uuid = 23c73a12e3527df55c60b9ce647640c1b7da1b32d71e6a39849ac0f00db828
# resin.models.device.isValidUUID uuid, (error, valid) ->
#		throw error if error?
#
#		if valid
#			console.log('This is a valid UUID')
###
exports.isValidUUID = (uuid, callback = _.noop) ->
	exports.getAll (error, devices) ->
		return callback(error) if error?
		uuidExists = _.findWhere(devices, { uuid })?
		return callback(null, uuidExists)

###*
# @summary Get display name for a device
# @public
# @function
#
# @see {@link module:resin/models/device.getSupportedDeviceTypes} for a list of supported devices
#
# @param {String} device - device name
# @returns {String} device display name or 'Unknown'
#
# @example
#	console.log resin.models.device.getDisplayName('raspberry-pi') # Raspberry Pi
#	console.log resin.models.device.getDisplayName('rpi') # Raspberry Pi
###
exports.getDisplayName = (device) ->
	if _.indexOf(exports.getSupportedDeviceTypes(), device) isnt -1
		return device

	for key, value of DEVICES
		if _.indexOf(value.names, device) isnt -1
			return key
	return 'Unknown'

###*
# @summary Get device slug
# @public
# @function
#
# @param {String} device - device name
# @returns {String} device slug or 'unknown'
#
# @example
#	console.log resin.models.device.getDeviceSlug('Raspberry Pi') # raspberry-pi
###
exports.getDeviceSlug = (device) ->
	displayName = exports.getDisplayName(device)
	return DEVICES[displayName]?.slug or 'unknown'

###*
# @summary Get a list of supported device types
# @public
# @function
#
# @returns {String[]} a list of all supported devices, by their display names
#
# @example
#	devices = resin.models.device.getSupportedDevicesTypes()
#	console.log(devices)
###
exports.getSupportedDeviceTypes = ->
	return _.keys(DEVICES)
