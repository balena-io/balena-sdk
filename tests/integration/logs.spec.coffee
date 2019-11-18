Promise = require('bluebird')

{
	balena
	givenAnApplication
	givenLoggedInUser
	sdkOpts
} = require('./setup')
{ assertDeepMatchAndLength } = require('../util')

sendLogMessages = (uuid, deviceApiKey, messages) ->
	balena.request.send
		method: 'POST'
		url: "/device/v2/#{uuid}/logs"
		baseUrl: sdkOpts.apiUrl
		sendToken: false
		headers: Authorization: "Bearer #{deviceApiKey}"
		body: messages

describe 'Logs', ->

	givenLoggedInUser(before)

	describe 'given a device', ->

		givenAnApplication(before)

		beforeEach ->
			@uuid = balena.models.device.generateUniqueKey()
			balena.models.device.register(@application.id, @uuid)
			.then (registrationInfo) =>
				@deviceApiKey = registrationInfo.api_key

		afterEach ->
			balena.pine.delete
				resource: 'device'
				options:
					$filter: uuid: @uuid

		describe 'balena.logs.history()', ->

			it 'should successfully load historical logs', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'First message',
					timestamp: Date.now()
				}, {
					message: 'Second message',
					timestamp: Date.now()
				}]
				.delay(2000)
				.then =>
					balena.logs.history(@uuid)
				.then (lines) ->
					assertDeepMatchAndLength(lines, [{
						message: 'First message'
					}, {
						message: 'Second message'
					}])

			it 'should limit logs by count', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'First message',
					timestamp: Date.now()
				}, {
					message: 'Second message',
					timestamp: Date.now()
				}]
				.delay(2000)
				.then =>
					balena.logs.history(@uuid, { count: 1 })
				.then (lines) ->
					assertDeepMatchAndLength(lines, [{
						message: 'Second message'
					}])

		describe 'balena.logs.subscribe()', ->

			it 'should not load historical logs by default', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'Old message',
					timestamp: Date.now()
				}, {
					message: 'Slightly newer message',
					timestamp: Date.now()
				}]
				.then =>
					balena.logs.subscribe(@uuid)
				.then (logs) ->
					new Promise (resolve, reject) ->
						lines = []
						logs.on('line', (line) -> lines.push(line))
						logs.on('error', reject)

						Promise.delay(2000)
						.then ->
							resolve(lines)
					.finally(logs.unsubscribe)
				.then (lines) ->
					assertDeepMatchAndLength(lines, [])

			it 'should load historical logs if requested', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'Old message',
					timestamp: Date.now()
				}, {
					message: 'Slightly newer message',
					timestamp: Date.now()
				}]
				.then =>
					balena.logs.subscribe(@uuid, { count: 'all' })
				.then (logs) ->
					new Promise (resolve, reject) ->
						lines = []
						logs.on('line', (line) -> lines.push(line))
						logs.on('error', reject)

						Promise.delay(2000)
						.then ->
							resolve(lines)
					.finally(logs.unsubscribe)
				.then (lines) ->
					assertDeepMatchAndLength(lines, [{
						message: 'Old message'
					}, {
						message: 'Slightly newer message'
					}])

			it 'should limit historical logs by count', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'Old message',
					timestamp: Date.now()
				}, {
					message: 'Slightly newer message',
					timestamp: Date.now()
				}]
				.then =>
					balena.logs.subscribe(@uuid, { count: 1 })
				.then (logs) ->
					new Promise (resolve, reject) ->
						lines = []
						logs.on('line', (line) -> lines.push(line))
						logs.on('error', reject)

						Promise.delay(2000)
						.then ->
							resolve(lines)
					.finally(logs.unsubscribe)
				.then (lines) ->
					assertDeepMatchAndLength(lines, [{
						message: 'Slightly newer message'
					}])

			it 'should stream new logs after historical logs', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'Existing message',
					timestamp: Date.now()
				}]
				.then =>
					balena.logs.subscribe(@uuid, { count: 100 })
				.then (logs) =>
					new Promise (resolve, reject) =>
						lines = []
						logs.on('line', (line) -> lines.push(line))
						logs.on('error', reject)

						# After we see the historical message, send a new one
						logs.once 'line', =>
							sendLogMessages @uuid, @deviceApiKey, [{
								message: 'New message',
								timestamp: Date.now()
							}]
							.delay(2000)
							.then ->
								resolve(lines)
							.catch(reject)
					.finally(logs.unsubscribe)
				.then (lines) ->
					assertDeepMatchAndLength(lines, [{
						message: 'Existing message'
					}, {
						message: 'New message'
					}])

			it 'should allow unsubscribing from logs', ->
				balena.logs.subscribe(@uuid)
				.delay(1000) # Make sure we're connected
				.then (logs) =>
					# Unsubscribe before any messages are sent
					logs.unsubscribe()

					new Promise (resolve, reject) =>
						lines = []
						logs.on('line', (line) -> lines.push(line))
						logs.on('error', reject)

						sendLogMessages @uuid, @deviceApiKey, [{
							message: 'New message',
							timestamp: Date.now()
						}]
						.delay(2000)
						.then ->
							resolve(lines)
				.then (lines) ->
					assertDeepMatchAndLength(lines, [])
