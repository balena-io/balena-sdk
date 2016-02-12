m = require('mochainon')
settings = require('../lib/settings')

describe 'Settings', ->

	describe 'given fresh settings', ->

		beforeEach ->
			for key, value of settings.getAll()
				settings.set(key, undefined)

		describe '.set()', ->

			it 'should be able to set a single property', ->
				m.chai.expect(settings.get('foo')).to.be.undefined
				settings.set('foo', 'bar')
				m.chai.expect(settings.get('foo')).to.equal('bar')

			it 'should be able to override a setting', ->
				settings.set('foo', 'bar')
				m.chai.expect(settings.get('foo')).to.equal('bar')
				settings.set('foo', 'baz')
				m.chai.expect(settings.get('foo')).to.equal('baz')

			it 'should be able to set a single property in object mode', ->
				m.chai.expect(settings.get('foo')).to.be.undefined
				settings.set(foo: 'bar')
				m.chai.expect(settings.get('foo')).to.equal('bar')

			it 'should be able to override a setting using object mode', ->
				settings.set(foo: 'bar')
				m.chai.expect(settings.get('foo')).to.equal('bar')
				settings.set(foo: 'baz')
				m.chai.expect(settings.get('foo')).to.equal('baz')

			it 'should be able to clear a setting', ->
				settings.set('foo', 'bar')
				settings.set('foo', undefined)
				m.chai.expect(settings.get('foo')).to.be.undefined

			it 'should be able to clear a setting using null', ->
				settings.set('foo', 'bar')
				settings.set('foo', null)
				m.chai.expect(settings.get('foo')).to.be.undefined

			it 'should be able to clear a setting in object mode', ->
				settings.set(foo: 'bar')
				settings.set(foo: undefined)
				m.chai.expect(settings.get('foo')).to.be.undefined

			it 'should not clear other settings when using object mode', ->
				settings.set('foo', 'bar')
				settings.set('bar', 'baz')
				settings.set('baz', 'qux')
				settings.set('qux', 'foo')

				settings.set
					bar: 'hello'
					qux: 'world'

				m.chai.expect(settings.getAll()).to.deep.equal
					foo: 'bar'
					bar: 'hello'
					baz: 'qux'
					qux: 'world'

		describe '.get()', ->

			it 'should be able to get a static setting', ->
				settings.set('foo', 'bar')
				m.chai.expect(settings.get('foo')).to.equal('bar')

			it 'should be able to get a dynamic setting', ->
				settings.set('name', 'John')
				settings.set 'greeting', ->
					return "Hello #{@name}!"
				m.chai.expect(settings.get('greeting')).to.equal('Hello John!')

			it 'should return undefined if the key does not exist', ->
				m.chai.expect(settings.get('unknown')).to.be.undefined

		describe '.getAll()', ->

			it 'should return an empty object if no settings', ->
				m.chai.expect(settings.getAll()).to.deep.equal({})

			it 'should be able to get all settings', ->
				settings.set('foo', 'bar')
				settings.set('bar', 'baz')
				m.chai.expect(settings.getAll()).to.deep.equal
					foo: 'bar'
					bar: 'baz'

			it 'should make a copy of the object it returns', ->
				settings.set('foo', 'bar')
				allSettings = settings.getAll()
				allSettings.foo = 'baz'
				m.chai.expect(settings.get('foo')).to.equal('bar')
