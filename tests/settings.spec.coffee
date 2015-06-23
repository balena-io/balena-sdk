m = require('mochainon')
resinSettings = require('resin-settings-client')
settings = require('../lib/settings')

describe 'Settings:', ->

	describe '.get()', ->

		describe 'given the setting exists', ->

			beforeEach ->
				@settingsGetStub = m.sinon.stub(resinSettings, 'get')
				@settingsGetStub.returns('bar')

			afterEach ->
				@settingsGetStub.restore()

			it 'should yield the setting value', (done) ->
				settings.get 'foo', (error, value) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(value).to.equal('bar')
					done()

		describe 'given the setting does not exist', ->

			beforeEach ->
				@settingsGetStub = m.sinon.stub(resinSettings, 'get')
				@settingsGetStub.returns(undefined)

			afterEach ->
				@settingsGetStub.restore()

			it 'should yield undefined', (done) ->
				settings.get 'foo', (error, value) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(value).to.be.undefined
					done()

		describe 'given the setting does not exist', ->

			beforeEach ->
				@settingsGetStub = m.sinon.stub(resinSettings, 'get')
				@settingsGetStub.returns(undefined)

			afterEach ->
				@settingsGetStub.restore()

			it 'should yield undefined', (done) ->
				settings.get 'foo', (error, value) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(value).to.be.undefined
					done()

	describe '.getAll()', ->

		describe 'given get() returns all settings', ->

			beforeEach ->
				@settingsGetStub = m.sinon.stub(resinSettings, 'get')
				@settingsGetStub.returns
					foo: 'bar'
					bar: 'baz'

			afterEach ->
				@settingsGetStub.restore()

			it 'should yield all settings', (done) ->
				settings.getAll (error, allSettings) ->
					m.chai.expect(error).to.not.exist
					m.chai.expect(allSettings).to.deep.equal
						foo: 'bar'
						bar: 'baz'
					done()
