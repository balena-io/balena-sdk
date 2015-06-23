m = require('mochainon')
OSParams = require('../../lib/models/os-params')

describe 'OS Params:', ->

	describe '#constructor()', ->

		it 'should throw an error if no appId', ->
			m.chai.expect ->
				new OSParams(network: 'ethernet')
			.to.throw('Missing option: appId')

		it 'should throw an error if not a parseable string', ->
			m.chai.expect ->
				new OSParams
					network: 'ethernet'
					appId: 'myApp'
			.to.throw('Invalid option appId')

		it 'should throw an error if no network', ->
			m.chai.expect ->
				new OSParams
					appId: 91
			.to.throw('Missing option: network')

		it 'should throw an error if network is not wifi or ethernet', ->
			m.chai.expect ->
				new OSParams
					network: 'hello'
					appId: 91
			.to.throw('Invalid option network: hello')

		describe 'if network is wifi', ->

			it 'should throw an error if missing wifiSsid', ->
				m.chai.expect ->
					new OSParams
						network: 'wifi'
						appId: 91
						wifiKey: 'secret'
				.to.throw('Missing option: wifiSsid')

			it 'should throw an error if missing wifiKey', ->
				m.chai.expect ->
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

			m.chai.expect(connectionParams.network).to.equal('wifi')
			m.chai.expect(connectionParams.wifiSsid).to.equal('mySsid')
			m.chai.expect(connectionParams.wifiKey).to.equal('secret')
			m.chai.expect(connectionParams.appId).to.equal(91)

		it 'should parse a string appId', ->
			connectionParams = new OSParams
				network: 'ethernet'
				appId: '91'

			m.chai.expect(connectionParams.appId).to.equal(91)

		it 'should throw an error if extra options', ->
			m.chai.expect ->
				new OSParams
					network: 'ethernet'
					appId: '91'
					hello: 'world'
			.to.throw('Non allowed option: hello')
