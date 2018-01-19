_ = require('lodash')
m = require('mochainon')
Promise = require('bluebird')

{ resin, givenLoggedInUser, givenMulticontainerApplication } = require('./setup')

createLog = (message, device, deviceKey, options = {}) ->
	resin.pine.post
		resource: 'device_log'
		body: Object.assign
			belongs_to__device: device.id
			device_timestamp: Date.now()
			stderr: false
			system: false
		, options, { message }
		passthrough:
			apiKey: deviceKey

createContainerLog = (message, imageInstall, deviceKey, options = {}) ->
	resin.pine.post
		resource: 'image_install_log'
		body: Object.assign
			belongs_to__image_install: imageInstall.id
			device_timestamp: Date.now()
			stderr: false
			system: false
			message: 'hi!'
		, options, { message }
		passthrough:
			apiKey: deviceKey

describe 'Logs', ->

	givenLoggedInUser()

	describe 'given an application with a api-logging device', ->

		givenMulticontainerApplication()

		beforeEach ->
			Promise.all [
				# Make sure our device looks api-log compatible
				resin.pine.patch
					resource: 'device'
					body:
						supervisor_version: '7.0.0'
			,
				resin.models.device.generateDeviceKey(@device.id)
				.then (key) =>
					@deviceKey = key
			]

		describe 'given no logs present', ->

			describe '.history', ->

				it 'should return no history', ->
					resin.logs.history(@device.uuid)
					.then (history) ->
						m.chai.expect(history).to.deep.equal([])

				it 'should emit new messages', ->
					resin.logs.subscribe(@device.uuid)
					.then (subscription) =>
						new Promise (resolve, reject) =>
							subscription.on('line', resolve)
							subscription.on('error', reject)

							createLog('New message', @device, @deviceKey)
						.timeout(2000)
						.then (logMessage) ->
							m.chai.expect(logMessage).to.deep.match
								message: 'New message'
						.finally ->
							subscription.unsubscribe()

		describe 'given pre-existing device logs', ->

			beforeEach ->
				createLog('Test message 1', @device, @deviceKey)
				.then =>
					createLog('Test message 2', @device, @deviceKey)

			describe '.history', ->

				it 'should return the logs', ->
					resin.logs.history(@device.uuid)
					.then (history) ->
						m.chai.expect(history).to.deep.match([
							message: 'Test message 1'
						,
							message: 'Test message 2'
						])

				it 'should limit the logs by the count given', ->
					resin.logs.history(@device.uuid, { count: 1 })
					.then (history) ->
						m.chai.expect(history).to.deep.match([
							message: 'Test message 2'
						])

			describe '.subscribe', ->

				it 'should emit new messages', ->
					resin.logs.subscribe(@device.uuid)
					.then (subscription) =>
						new Promise (resolve, reject) =>
							subscription.on('line', resolve)
							subscription.on('error', reject)

							createLog('New message', @device, @deviceKey)
						.timeout(2000)
						.then (logMessage) ->
							m.chai.expect(logMessage).to.deep.match
								message: 'New message'
						.finally ->
							subscription.unsubscribe()

		describe 'given preexisting container logs', ->

			beforeEach ->
				createContainerLog('Test message 1', @newWebInstall, @deviceKey)
				.then =>
					createContainerLog('Test message 2', @newDbInstall, @deviceKey)
				.then =>
					createContainerLog('Test message 3', @newWebInstall, @deviceKey)

			describe '.history', ->

				it 'should return the logs', ->
					resin.logs.history(@device.uuid)
					.then (history) =>
						m.chai.expect(history).to.deep.match([
							message: 'Test message 1'
							serviceId: @webService.id
						,
							message: 'Test message 2'
							serviceId: @dbService.id
						,
							message: 'Test message 3'
							serviceId: @webService.id
						])

				it 'should limit the logs by the count given', ->
					resin.logs.history(@device.uuid, { count: 1 })
					.then (history) ->
						m.chai.expect(history).to.deep.match([
							message: 'Test message 2'
						])

			describe '.subscribe', ->

				it 'should emit new messages', ->
					resin.logs.subscribe(@device.uuid)
					.then (subscription) =>
						new Promise (resolve, reject) =>
							subscription.on('line', resolve)
							subscription.on('error', reject)

							createContainerLog('New message', @newWebInstall, @deviceKey)
						.timeout(2000)
						.then (logMessage) ->
							m.chai.expect(logMessage).to.deep.match
								message: 'New message'
						.finally ->
							subscription.unsubscribe()



