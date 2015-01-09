_ = require('lodash')
chai = require('chai')
chai.use(require('chai-string'))
expect = chai.expect
os = require('../../lib/models/os')
ConnectionParams = require('../../lib/connection-params')

describe 'Cache:', ->

	describe '#generateCacheName()', ->

		it 'should throw an error if parameter is not an instance of ConnectionParams', ->

			expect ->
				os.generateCacheName
					appId: 91
					network: 'ethernet'
			.to.throw(Error)

		describe 'given network is ethernet', ->

			it 'should construct a correct name', ->
				params = new ConnectionParams
					appId: 91
					network: 'ethernet'

				result = os.generateCacheName(params)
				expect(result).to.match(new RegExp("#{params.appId}-ethernet-\\d\+\$"))

		describe 'given network is wifi', ->
			it 'should construct a correct name', ->
				params = new ConnectionParams
					appId: 91
					network: 'wifi'
					wifiSsid: 'MYSSID'
					wifiKey: 'secret'

				result = os.generateCacheName(params)
				expect(result).to.match(new RegExp("#{params.appId}-wifi-#{params.wifiSsid}-\\d\+\$"))
