chai = require('chai')
expect = chai.expect
ConnectionParams = require('../lib/connection-params')

describe 'Connection Params:', ->

	describe '#constructor()', ->

		it 'should throw an error if no appId', ->
			expect ->
				new ConnectionParams(network: 'ethernet')
			.to.throw('Missing appId')

		it 'should throw an error if not a parseable string', ->
			expect ->
				new ConnectionParams
					network: 'ethernet'
					appId: 'myApp'
			.to.throw('Invalid appId')

		it 'should throw an error if no network', ->
			expect ->
				new ConnectionParams
					appId: 91
			.to.throw('Missing network')

		it 'should throw an error if network is not wifi or ethernet', ->
			expect ->
				new ConnectionParams
					network: 'hello'
					appId: 91
			.to.throw('Invalid network type: hello')

		describe 'if network is wifi', ->

			it 'should throw an error if missing wifiSsid', ->
				expect ->
					new ConnectionParams
						network: 'wifi'
						appId: 91
						wifiKey: 'secret'
				.to.throw('Missing wifiSsid')

			it 'should throw an error if missing wifiKey', ->
				expect ->
					new ConnectionParams
						network: 'wifi'
						appId: 91
						wifiSsid: 'mySsid'
				.to.throw('Missing wifiKey')

		it 'should merge all options to the instance', ->
			connectionParams = new ConnectionParams
				network: 'wifi'
				wifiSsid: 'mySsid'
				wifiKey: 'secret'
				appId: 91

			expect(connectionParams.network).to.equal('wifi')
			expect(connectionParams.wifiSsid).to.equal('mySsid')
			expect(connectionParams.wifiKey).to.equal('secret')
			expect(connectionParams.appId).to.equal(91)

		it 'should parse a string appId', ->
			connectionParams = new ConnectionParams
				network: 'ethernet'
				appId: '91'

			expect(connectionParams.appId).to.equal(91)

		it 'should throw an error if extra options', ->
			expect ->
				new ConnectionParams
					network: 'ethernet'
					appId: '91'
					hello: 'world'
			.to.throw('Invalid option: hello')
