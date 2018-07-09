Promise = require('bluebird')
m = require('mochainon')
rindle = require('rindle')

{ resin, sdkOpts, givenLoggedInUser } = require('./setup')

sendLogMessages = (uuid, deviceApiKey, messages) ->
	resin.request.send
		method: 'POST'
		url: "/device/v2/#{uuid}/logs"
		baseUrl: sdkOpts.apiUrl
		sendToken: false
		headers: Authorization: "Bearer #{deviceApiKey}"
		body: messages

describe 'Logs', ->

	givenLoggedInUser()

	describe 'given a device', ->

		beforeEach ->
			resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
				@application = application
				@uuid = resin.models.device.generateUniqueKey()
				resin.models.device.register(application.id, @uuid)
			.then (registrationInfo) =>
				@deviceApiKey = registrationInfo.api_key

		describe 'resin.logs.history()', ->

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
					resin.logs.history(@uuid)
				.then (logs) ->
					m.chai.expect(logs).to.deep.match [{
						message: 'First message'
					}, {
						message: 'Second message'
					}]

		describe 'resin.logs.subscribe()', ->

			it 'should load historical logs first', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'Old message',
					timestamp: Date.now()
				}, {
					message: 'Slightly newer message',
					timestamp: Date.now()
				}]
				.then =>
					resin.logs.subscribe(@uuid)
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
					m.chai.expect(lines.length).to.equal(2)
					m.chai.expect(lines).to.deep.match [{
						message: 'Old message'
					}, {
						message: 'Slightly newer message'
					}]

			it 'should stream new logs after historical logs', ->
				sendLogMessages @uuid, @deviceApiKey, [{
					message: 'Existing message',
					timestamp: Date.now()
				}]
				.then =>
					resin.logs.subscribe(@uuid)
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
					m.chai.expect(lines.length).to.equal(2)
					m.chai.expect(lines).to.deep.match [{
						message: 'Existing message'
					}, {
						message: 'New message'
					}]

			it 'should allow unsubscribing from logs', ->
				resin.logs.subscribe(@uuid)
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
					m.chai.expect(lines.length).to.equal(0)
