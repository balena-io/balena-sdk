_ = require('lodash')
m = require('mochainon')

{ balena, getSdk, sdkOpts, credentials, givenLoggedInUser } = require('./setup')

describe 'Balena SDK', ->

	validKeys = ['auth', 'models', 'logs', 'settings']

	describe 'factory function', ->

		describe 'given no opts', ->

			it 'should return an object with valid keys', ->
				mockBalena = getSdk()
				m.chai.expect(mockBalena).to.include.keys(validKeys)

		describe 'given empty opts', ->

			it 'should return an object with valid keys', ->
				mockBalena = getSdk({})
				m.chai.expect(mockBalena).to.include.keys(validKeys)

		describe 'given opts', ->

			it 'should return an object with valid keys', ->
				mockBalena = getSdk(sdkOpts)
				m.chai.expect(mockBalena).to.include.keys(validKeys)

	it 'should expose a balena-pine instance', ->
		m.chai.expect(balena.pine).to.exist

	it 'should expose an balena-errors instance', ->
		m.chai.expect(balena.errors).to.exist

	describe 'interception Hooks', ->

		beforeEach ->
			balena.interceptors = []

		afterEach ->
			balena.interceptors = []

		givenLoggedInUser(beforeEach)

		ignoreUserInfoCalls = (fn) ->
			(arg) ->
				if /\/user\/v1\/whoami/.test(arg.url) or
				new RegExp("/#{balena.pine.API_VERSION}/organization_membership\\?\\$select=is_member_of__organization&\\$filter=\\(user eq \\d+\\) and \\(organization_membership_role/any\\(omr:omr/name eq 'personal'\\)\\)").test(arg.url)
					return arg
				return fn(arg)

		it "should update if the array is set directly (not only if it's mutated)", ->
			interceptor = m.sinon.mock().returnsArg(0)
			balena.interceptors = [ { request: ignoreUserInfoCalls(interceptor) } ]
			balena.models.application.getAll().then ->
				m.chai.expect(interceptor.called).to.equal true,
					'Interceptor set directly should have its request hook called'

		describe 'for request', ->
			it 'should be able to intercept requests', ->
				balena.interceptors.push request: m.sinon.mock().returnsArg(0)

				promise = balena.models.application.getAll()

				promise.then ->
					m.chai.expect(balena.interceptors[0].request.called).to.equal true,
						'Interceptor request hook should be called'

		describe 'for requestError', ->
			it 'should intercept request errors from other interceptors', ->
				balena.interceptors.push request:
					m.sinon.mock().throws(new Error('rejected'))
				balena.interceptors.push requestError:
					m.sinon.mock().throws(new Error('replacement error'))

				promise = balena.models.application.getAll()

				m.chai.expect(promise).to.be.rejectedWith('replacement error')
				.then ->
					m.chai.expect(balena.interceptors[1].requestError.called).to.equal true,
						'Interceptor requestError hook should be called'

		describe 'for response', ->
			it 'should be able to intercept responses', ->
				balena.interceptors.push response: m.sinon.mock().returnsArg(0)
				promise = balena.models.application.getAll()

				promise.then ->
					m.chai.expect(balena.interceptors[0].response.called).to.equal true,
						'Interceptor response hook should be called'

		describe 'for responseError', ->
			it 'should be able to intercept error responses', ->
				called = false
				balena.interceptors.push responseError: (err) ->
					called = true
					throw err

				promise = balena.models.device.restartApplication(999999)

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

			m.chai.expect(root['BALENA_SDK_SHARED_OPTIONS']).to.equal(opts)

	describe 'getSdk.fromSharedOptions()', ->
		it 'should return an object with valid keys', ->

			mockBalena = getSdk.fromSharedOptions()
			m.chai.expect(mockBalena).to.include.keys(validKeys)

	describe 'constructor options', ->

		describe 'Given an apiKey', ->

			givenLoggedInUser(before)

			before ->
				balena.models.apiKey.create('apiKey', 'apiKeyDescription')
				.then (@testApiKey) =>
					m.chai.expect(@testApiKey).to.be.a('string')
					balena.auth.logout()

			it 'should not be used in API requests', ->
				m.chai.expect(@testApiKey).to.be.a('string')
				testSdkOpts = _.assign({}, sdkOpts, { apiKey: @testApiKey })
				testSdk = getSdk(testSdkOpts)
				promise = testSdk.models.apiKey.getAll()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')
