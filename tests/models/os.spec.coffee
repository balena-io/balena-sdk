_ = require('lodash')
chai = require('chai')
chai.use(require('chai-string'))
expect = chai.expect
os = require('../../lib/models/os')

describe 'Cache:', ->

	describe '#generateCacheName()', ->

		describe 'given network is ethernet', ->

			it 'should construct a correct name', ->
				result = os.generateCacheName
					appId: 91
					network: 'ethernet'

				expect(result).to.match(new RegExp('91-ethernet-\\d\+\$'))

		describe 'given network is wifi', ->
			it 'should construct a correct name', ->
				result = os.generateCacheName
					appId: 91
					network: 'wifi'
					wifiSsid: 'MYSSID'
					wifiKey: 'secret'

				expect(result).to.match(new RegExp('91-wifi-MYSSID-\\d\+\$'))
