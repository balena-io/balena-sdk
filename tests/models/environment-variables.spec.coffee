m = require('mochainon')
pine = require('resin-pine')
environmentVariables = require('../../lib/models/environment-variables')

describe 'Environment Variables Model:', ->

	describe '.isSystemVariable()', ->

		describe 'given a system variable', ->

			it 'should return true for RESIN_VAR', ->
				result = environmentVariables.isSystemVariable(name: 'RESIN_VAR')
				m.chai.expect(result).to.be.true

		describe 'given a non system variable', ->

			it 'should return false for EDITOR', ->
				result = environmentVariables.isSystemVariable(name: 'EDITOR')
				m.chai.expect(result).to.be.false
