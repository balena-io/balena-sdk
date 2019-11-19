m = require('mochainon')

packageJSON = require('../../package.json')
{ balena, getSdk, sdkOpts, givenLoggedInUser } = require('./setup')

DIFFERENT_TEST_SERVER_URL = 'https://www.non-balena-api-domain.com/'

describe 'Balena SDK', ->

	validKeys = ['auth', 'models', 'logs', 'settings', 'version']

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

		describe 'version', ->

			it 'should match the package.json version', ->
				mockBalena = getSdk()
				m.chai.expect(mockBalena).to.have.property('version', packageJSON.version)

	it 'should expose a balena-pine instance', ->
		m.chai.expect(balena.pine).to.exist

	it 'should expose an balena-errors instance', ->
		m.chai.expect(balena.errors).to.exist

	describe 'interception Hooks', ->

		originalInterceptors = null

		before ->
			originalInterceptors = balena.interceptors.slice()
			balena.interceptors = originalInterceptors.slice()

		afterEach ->
			# register this afterEach first, so that we
			# are able to clear the mock interceptor, before
			# all other requests that might happen in afterEach
			balena.interceptors = originalInterceptors.slice()

		givenLoggedInUser(beforeEach)

		ignoreUserInfoCalls = (fn) ->
			(arg) ->
				if /\/user\/v1\/whoami/.test(arg.url) or
				# coffeelint: disable=max_line_length
				new RegExp("/#{balena.pine.API_VERSION}/organization_membership\\?\\$select=is_member_of__organization&\\$filter=\\(user eq \\d+\\) and \\(organization_membership_role/any\\(omr:omr/name eq 'personal'\\)\\)").test(arg.url)
				# coffeelint: enable=max_line_length
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
				requestInterceptor = m.sinon.mock().returnsArg(0)
				balena.interceptors.push request: requestInterceptor

				promise = balena.models.application.getAll()

				promise.then ->
					m.chai.expect(requestInterceptor.called).to.equal true,
						'Interceptor request hook should be called'

		describe 'for requestError', ->
			it 'should intercept request errors from other interceptors', ->
				requestInterceptor = m.sinon.mock().throws(new Error('rejected'))
				requestErrorInterceptor = m.sinon.mock().throws(new Error('replacement error'))

				balena.interceptors.push request: requestInterceptor
				balena.interceptors.push requestError: requestErrorInterceptor

				promise = balena.models.application.getAll()

				m.chai.expect(promise).to.be.rejectedWith('replacement error')
				.then ->
					m.chai.expect(requestErrorInterceptor.called).to.equal true,
						'Interceptor requestError hook should be called'

		describe 'for response', ->
			it 'should be able to intercept responses', ->
				responseInterceptor = m.sinon.mock().returnsArg(0)
				balena.interceptors.push response: responseInterceptor
				promise = balena.models.application.getAll()

				promise.then ->
					m.chai.expect(responseInterceptor.called).to.equal true,
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

		describe 'version header', ->

			getVersionHeaderResponseInterceptor =  ->
				responseInterceptor = (response) ->
					responseInterceptor.callCount++
					m.chai.expect(response.request.headers)
						.to.have.property('X-Balena-Client', "#{packageJSON.name}/#{packageJSON.version}")
					return response

				responseInterceptor.callCount = 0

				return responseInterceptor

			getVersionHeaderResponseErrorInterceptor = ->
				responseInterceptor = (err) ->
					responseInterceptor.callCount++
					m.chai.expect(err.requestOptions.headers)
						.to.not.have.property('X-Balena-Client')
					throw err

				responseInterceptor.callCount = 0

				return responseInterceptor

			describe 'model requests', ->

				it 'should include the version header', ->
					responseInterceptor = getVersionHeaderResponseInterceptor()
					balena.interceptors.push response: responseInterceptor

					promise = balena.models.application.getAll()

					promise.then ->
						m.chai.expect(responseInterceptor.callCount).to.equal 1,
							'Interceptor response hook should be called'

			describe 'pine requests', ->

				it 'should include the version header', ->
					responseInterceptor = getVersionHeaderResponseInterceptor()
					balena.interceptors.push response: responseInterceptor

					promise = balena.pine.get({
						resource: 'application'
					})

					promise.then ->
						m.chai.expect(responseInterceptor.callCount).to.equal 1,
							'Interceptor response hook should be called'

			describe 'plain requests', ->

				describe 'with a relative url & without a baseUrl', ->

					it 'should not include the version header', ->
						responseInterceptor = getVersionHeaderResponseErrorInterceptor()
						balena.interceptors.push responseError: responseInterceptor

						promise = balena.request.send
							method: 'GET'
							url: '/v5/application'

						m.chai.expect(promise).to.be.rejected
						.then ->
							m.chai.expect(responseInterceptor.callCount).to.equal 1,
								'Interceptor response hook should be called'

				describe 'with a baseUrl option', ->

					describe 'to the API', ->

						it 'should include the version header', ->
							responseInterceptor = getVersionHeaderResponseInterceptor()
							balena.interceptors.push response: responseInterceptor

							promise = balena.request.send
								method: 'GET'
								url: '/v5/application'
								baseUrl: sdkOpts.apiUrl

							promise.then ->
								m.chai.expect(responseInterceptor.callCount).to.equal 1,
									'Interceptor response hook should be called'

					describe 'to a differnet server', ->

						it 'should not include the version header', ->
							responseInterceptor = getVersionHeaderResponseErrorInterceptor()
							balena.interceptors.push responseError: responseInterceptor

							promise = balena.request.send
								method: 'GET'
								url: '/v5/application'
								baseUrl: DIFFERENT_TEST_SERVER_URL

							m.chai.expect(promise).to.be.rejected
							.then ->
								m.chai.expect(responseInterceptor.callCount).to.equal 1,
									'Interceptor response hook should be called'

				describe 'with a complete url option', ->

					describe 'to the API', ->

						it 'should include the version header', ->
							responseInterceptor = getVersionHeaderResponseInterceptor()
							balena.interceptors.push response: responseInterceptor

							promise = balena.request.send
								method: 'GET'
								url: "#{sdkOpts.apiUrl}/v5/application"

							promise.then ->
								m.chai.expect(responseInterceptor.callCount).to.equal 1,
									'Interceptor response hook should be called'

					describe 'to a differnet server', ->

						it 'should not include the version header', ->
							responseInterceptor = getVersionHeaderResponseErrorInterceptor()
							balena.interceptors.push responseError: responseInterceptor

							promise = balena.request.send
								method: 'GET'
								url: "#{DIFFERENT_TEST_SERVER_URL}/v5/application"

							m.chai.expect(promise).to.be.rejected
							.then ->
								m.chai.expect(responseInterceptor.callCount).to.equal 1,
									'Interceptor response hook should be called'

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
				testSdkOpts = Object.assign({}, sdkOpts, { apiKey: @testApiKey })
				testSdk = getSdk(testSdkOpts)
				promise = testSdk.models.apiKey.getAll()
				m.chai.expect(promise).to.be.rejected
					.and.eventually.have.property('code', 'BalenaNotLoggedIn')
