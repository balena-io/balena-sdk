m = require('mochainon')

{ resin, getSdk, sdkOpts, givenLoggedInUser } = require('./setup')

describe 'Resin SDK', ->

	validKeys = ['auth', 'models', 'logs', 'settings']

	describe 'factory function', ->

		describe 'given no opts', ->

			it 'should return an object with valid keys', ->
				mockResin = getSdk()
				m.chai.expect(mockResin).to.include.keys(validKeys)

		describe 'given empty opts', ->

			it 'should return an object with valid keys', ->
				mockResin = getSdk({})
				m.chai.expect(mockResin).to.include.keys(validKeys)

		describe 'given opts', ->

			it 'should return an object with valid keys', ->
				mockResin = getSdk(sdkOpts)
				m.chai.expect(mockResin).to.include.keys(validKeys)

	it 'should expose a resin-pine instance', ->
		m.chai.expect(resin.pine).to.exist

	it 'should expose an resin-errors instance', ->
		m.chai.expect(resin.errors).to.exist

	describe 'interception Hooks', ->

		beforeEach ->
			resin.interceptors = []

		afterEach ->
			resin.interceptors = []

		givenLoggedInUser()

		ignoreWhoamiCalls = (fn) ->
			(arg) ->
				if /\/user\/v1\/whoami/.test(arg.url)
					return arg
				return fn(arg)

		it "should update if the array is set directly (not only if it's mutated)", ->
			interceptor = m.sinon.mock().returnsArg(0)
			resin.interceptors = [ { request: ignoreWhoamiCalls(interceptor) } ]
			resin.models.application.getAll().then ->
				m.chai.expect(interceptor.called).to.equal true,
					'Interceptor set directly should have its request hook called'

		describe 'for request', ->
			it 'should be able to intercept requests', ->
				resin.interceptors.push request: m.sinon.mock().returnsArg(0)

				promise = resin.models.application.getAll()

				promise.then ->
					m.chai.expect(resin.interceptors[0].request.called).to.equal true,
						'Interceptor request hook should be called'

		describe 'for requestError', ->
			it 'should intercept request errors from other interceptors', ->
				resin.interceptors.push request:
					m.sinon.mock().throws(new Error('rejected'))
				resin.interceptors.push requestError:
					m.sinon.mock().throws(new Error('replacement error'))

				promise = resin.models.application.getAll()

				m.chai.expect(promise).to.be.rejectedWith('replacement error')
				.then ->
					m.chai.expect(resin.interceptors[1].requestError.called).to.equal true,
						'Interceptor requestError hook should be called'

		describe 'for response', ->
			it 'should be able to intercept responses', ->
				resin.interceptors.push response: m.sinon.mock().returnsArg(0)
				promise = resin.models.application.getAll()

				promise.then ->
					m.chai.expect(resin.interceptors[0].response.called).to.equal true,
						'Interceptor response hook should be called'

		describe 'for responseError', ->
			it 'should be able to intercept error responses', ->
				called = false
				resin.interceptors.push responseError: (err) ->
					called = true
					throw err

				promise = resin.models.device.restartApplication(999999)

				m.chai.expect(promise).to.be.rejected
				.then ->
					m.chai.expect(called).to.equal true,
						'responseError should be called when request fails'

	describe 'getSdk.setSharedOptions()', ->
		it 'should set a global containing shared options', ->
			root = if window? then window else global
			opts =
				foo: 'bar'

			getSdk.setSharedOptions(opts)

			m.chai.expect(root['RESIN_SDK_SHARED_OPTIONS']).to.equal(opts)

	describe 'getSdk.fromSharedOptions()', ->
		it 'should return an object with valid keys', ->

			mockResin = getSdk.fromSharedOptions()
			m.chai.expect(mockResin).to.include.keys(validKeys)

