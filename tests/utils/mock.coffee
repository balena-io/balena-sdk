path = require('path')
fs = require('fs')
mockFs = require('mock-fs')
sinon = require('sinon')
settings = require('../../lib/settings')
connection = require('../../lib/connection')

exports.fs =

	init: (filesystemConfig = {}) ->
		mockFsOptions = {}

		# Mock data prefix automatically to remove
		# duplication in most of the tests
		mockFsOptions[settings.get('dataPrefix')] = mockFs.directory()

		# TODO: Very awkward workaround to the fact this file is required at runtime
		# by readable-stream, causing nock to fail due to mock-fs.
		# The ideal solution would be to rework the test suite to
		# prevent adding either mock-fs or nock.
		streamDuplex = path.resolve(__dirname, '../../node_modules/request/node_modules/bl/node_modules/readable-stream/lib/_stream_duplex.js')
		mockFsOptions[streamDuplex] = fs.readFileSync(streamDuplex)

		for key, value of filesystemConfig
			mockFsOptions[value.name] = value.contents
		mockFs(mockFsOptions)

	restore: ->
		mockFs.restore()

isOnlineStub = null

exports.connection =

	init: ->
		isOnlineStub = sinon.stub(connection, 'isOnline')
		isOnlineStub.yields(null, true)

	restore: ->
		isOnlineStub.restore()
