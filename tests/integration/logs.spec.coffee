Promise = require('bluebird')
m = require('mochainon')
rindle = require('rindle')

{
	balena
	givenAnApplication
	givenLoggedInUser
	sdkOpts
} = require('./setup')

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
				.then (logs) ->
					m.chai.expect(logs).to.deep.match [{
						message: 'First message'
					}, {
						message: 'Second message'
					}]

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
				.then (logs) ->
					m.chai.expect(logs).to.have.lengthOf(1)
					m.chai.expect(logs[0].message).to.equal('Second message')

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
					m.chai.expect(lines).to.have.lengthOf(0)

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
					m.chai.expect(lines).to.deep.match [{
						message: 'Old message'
					}, {
						message: 'Slightly newer message'
					}]
					m.chai.expect(lines).to.have.lengthOf(2)

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
					m.chai.expect(lines).to.deep.match [{
						message: 'Slightly newer message'
					}]
					m.chai.expect(lines).to.have.lengthOf(1)

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
					m.chai.expect(lines).to.deep.match [{
						message: 'Existing message'
					}, {
						message: 'New message'
					}]
					m.chai.expect(lines).to.have.lengthOf(2)

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
					m.chai.expect(lines).to.have.lengthOf(0)
