m = require('mochainon')

{ mergePineOptions } = require('../lib/util')

describe 'Pine option merging', ->

	it 'uses the defaults only, if no extra options are provided', ->
		defaults = filter: id: 1
		result = mergePineOptions(defaults, undefined)
		m.chai.expect(result).to.deep.equal(defaults)

	it "uses extra options directly if they don't conflict with defaults", ->
		extras =
			filter: id: 1
			select: [ 'id' ]
			expand:
				device:
					$select: ['id']
					$expand: ['application', 'user']
			top: 1
			skip: 1
		result = mergePineOptions({}, extras)
		m.chai.expect(result).to.deep.equal(extras)

	it 'overrides select, top, skip and orderby options', ->
		result = mergePineOptions
			top: 1
			skip: 2
			select: [ 'id' ]
			orderby: 'app_name asc'
		,
			top: 3
			skip: 4
			select: [ 'app_name' ]
			orderby: 'id asc'

		m.chai.expect(result).to.deep.equal
			top: 3
			skip: 4
			select: [ 'app_name' ]
			orderby: 'id asc'

	it 'combines filter options with $and', ->
		result = mergePineOptions
			filter: id: 1
		,
			filter: name: 'MyApp'

		m.chai.expect(result).to.deep.equal
			filter:
				$and: [
					id: 1
				,
					name: 'MyApp'
				]

	it 'combines expand options for separate single relationships', ->
		result = mergePineOptions
			expand: 'device'
		,
			expand: 'application'

		m.chai.expect(result).to.deep.equal
			expand:
				device: {}
				application: {}

	it 'combines expand options for separate arrays of relationships', ->
		result = mergePineOptions
			expand: ['device', 'application']
		,
			expand: ['application', 'build']

		m.chai.expect(result).to.deep.equal
			expand:
				device: {}
				application: {}
				build: {}

	it 'combines identical expand options to a single expand', ->
		result = mergePineOptions
			expand: 'device'
		,
			expand: 'device'

		m.chai.expect(result).to.deep.equal
			expand: device: {}

	it 'overrides $select params for expand options for the same relationship, if present', ->
		result = mergePineOptions
			expand: device: $select: [ 'id' ]
		,
			expand: device: $select: [ 'name' ]

		m.chai.expect(result).to.deep.equal
			expand: device: $select: [ 'name' ]

	it 'combines $expand params for expand options for the same relationship, if present', ->
		result = mergePineOptions
			expand: device: $expand: [ 'application' ]
		,
			expand: device: $expand: [ 'build' ]

		m.chai.expect(result).to.deep.equal
			expand:
				device:
					$expand:
						application: {}
						build: {}

	it 'rejects any unknown extra options', ->
		m.chai.expect(
			-> mergePineOptions({}, unknownKey: 'value')
		).to.throw('Unknown pine option: unknownKey')

	it 'ignores any unknown default options', ->
		m.chai.expect(
			-> mergePineOptions(unknownKey: 'value', {})
		).not.to.throw()
