chai = require('chai')
expect = chai.expect
OSParams = require('../lib/os-params')

describe 'OS Params:', ->

	describe '#constructor()', ->

		it 'should throw an error if no appId', ->
			expect ->
				new OSParams(network: 'ethernet')
			.to.throw('Missing option: appId')

		it 'should throw an error if not a parseable string', ->
			expect ->
				new OSParams
					network: 'ethernet'
					appId: 'myApp'
			.to.throw('Invalid option appId')

		it 'should throw an error if no network', ->
			expect ->
				new OSParams
					appId: 91
			.to.throw('Missing option: network')

		it 'should throw an error if network is not wifi or ethernet', ->
			expect ->
				new OSParams
					network: 'hello'
					appId: 91
			.to.throw('Invalid option network: hello')

		describe 'if network is wifi', ->

			it 'should throw an error if missing wifiSsid', ->
				expect ->
					new OSParams
						network: 'wifi'
						appId: 91
						wifiKey: 'secret'
				.to.throw('Missing option: wifiSsid')

			it 'should throw an error if missing wifiKey', ->
				expect ->
					new OSParams
						network: 'wifi'
						appId: 91
						wifiSsid: 'mySsid'
				.to.throw('Missing option: wifiKey')

		it 'should merge all options to the instance', ->
			connectionParams = new OSParams
				network: 'wifi'
				wifiSsid: 'mySsid'
				wifiKey: 'secret'
				appId: 91

			expect(connectionParams.network).to.equal('wifi')
			expect(connectionParams.wifiSsid).to.equal('mySsid')
			expect(connectionParams.wifiKey).to.equal('secret')
			expect(connectionParams.appId).to.equal(91)

		it 'should parse a string appId', ->
			connectionParams = new OSParams
				network: 'ethernet'
				appId: '91'

			expect(connectionParams.appId).to.equal(91)

		it 'should throw an error if extra options', ->
			expect ->
				new OSParams
					network: 'ethernet'
					appId: '91'
					hello: 'world'
			.to.throw('Non allowed option: hello')
