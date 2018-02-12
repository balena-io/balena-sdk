m = require('mochainon')
Promise = require('bluebird')

{
	mergePineOptions
	getImgMakerHelper
	osVersionRCompare
} = require('../build/util')

describe 'Pine option merging', ->

	it 'uses the defaults only, if no extra options are provided', ->
		defaults = $filter: id: 1
		result = mergePineOptions(defaults, undefined)
		m.chai.expect(result).to.deep.equal(defaults)

	it "uses extra options directly if they don't conflict with defaults", ->
		extras =
			$filter: id: 1
			$select: [ 'id' ]
			$expand:
				device:
					$select: ['id']
					$expand: ['application', 'user']
			$top: 1
			$skip: 1
		result = mergePineOptions({}, extras)
		m.chai.expect(result).to.deep.equal(extras)

	it 'overrides top, skip and orderby options', ->
		result = mergePineOptions
			$top: 1
			$skip: 2
			$orderby: 'app_name asc'
		,
			$top: 3
			$skip: 4
			$orderby: 'id asc'

		m.chai.expect(result).to.deep.equal
			$top: 3
			$skip: 4
			$orderby: 'id asc'

	it 'combines filter options with $and', ->
		result = mergePineOptions
			$filter: id: 1
		,
			$filter: name: 'MyApp'

		m.chai.expect(result).to.deep.equal
			$filter:
				$and: [
					id: 1
				,
					name: 'MyApp'
				]

	it 'combines expand options for separate single relationships', ->
		result = mergePineOptions
			$expand: 'device'
		,
			$expand: 'application'

		m.chai.expect(result).to.deep.equal
			$expand:
				device: {}
				application: {}

	it 'combines expand options for separate arrays of relationships', ->
		result = mergePineOptions
			$expand: ['device', 'application']
		,
			$expand: ['application', 'build']

		m.chai.expect(result).to.deep.equal
			$expand:
				device: {}
				application: {}
				build: {}

	it 'combines identical expand options to a single expand', ->
		result = mergePineOptions
			$expand: 'device'
		,
			$expand: 'device'

		m.chai.expect(result).to.deep.equal
			$expand: device: {}

	it 'overrides $select params for expand options for the same relationship, if present', ->
		result = mergePineOptions
			$expand: device: $select: [ 'id' ]
		,
			$expand: device: $select: [ 'name' ]

		m.chai.expect(result).to.deep.equal
			$expand: device: $select: [ 'name' ]

	it 'adds $filter params for expand options, if present', ->
		result = mergePineOptions
			$expand: 'device'
		,
			$expand: device: $filter: name: 'myname'

		m.chai.expect(result).to.deep.equal
			$expand: device: $filter: name: 'myname'

	it 'combines $filter params for expand options for the same relationship, if present', ->
		result = mergePineOptions
			$expand: device: $filter: id: 1
		,
			$expand: device: $filter: name: 'myname'

		m.chai.expect(result).to.deep.equal
			$expand: device: $filter: $and: [
				id: 1
			,
				name: 'myname'
			]

	it 'combines $expand params for expand options for the same relationship, if present', ->
		result = mergePineOptions
			$expand: device: $expand: [ 'application' ]
		,
			$expand: device: $expand: [ 'build' ]

		m.chai.expect(result).to.deep.equal
			$expand:
				device:
					$expand:
						application: {}
						build: {}

	it 'combines $expand params for expand options that are arrays of objects', ->
		result = mergePineOptions
			$expand: [
				device: $select: [ 'id' ]
			]
		,
			$expand: [
				device: $expand: [ 'build' ]
			]

		m.chai.expect(result).to.deep.equal
			$expand:
				device:
					$select: [ 'id' ]
					$expand: [ 'build' ]

	it 'rejects any unknown extra options', ->
		m.chai.expect(
			-> mergePineOptions({}, unknownKey: 'value')
		).to.throw('Unknown pine option: unknownKey')

	it 'ignores any unknown default options', ->
		m.chai.expect(
			-> mergePineOptions(unknownKey: 'value', {})
		).not.to.throw()

describe 'ImgMakerHelper', ->

	ROOT_URL = 'https://img.resin.io'

	beforeEach =>
		@requestStub = send: m.sinon.stub().returns(new Promise(->))
		@imgMakerHelper = getImgMakerHelper(ROOT_URL, @requestStub)

	it 'should build API requesters', =>
		requester = @imgMakerHelper.buildApiRequester
			buildUrl: ({ deviceType, version }) ->
				"/endpoint?d=#{deviceType}&v=#{version}"

		requester('raspberrypi3', '1.24.0')

		m.chai.expect(@requestStub.send).to.be.calledWithMatch
			method: 'GET'
			baseUrl: ROOT_URL
			url: '/api/v1/endpoint?d=raspberrypi3&v=1.24.0'

	it 'should cache reponses', =>
		requester = @imgMakerHelper.buildApiRequester
			buildUrl: ({ deviceType, version }) ->
				"/endpoint?d=#{deviceType}&v=#{version}"

		requester('raspberrypi3', '1.24.0')
		requester('raspberrypi3', '1.24.0')

		m.chai.expect(@requestStub.send).to.be.calledOnce

describe 'osVersionRCompare', ->

	it 'compares simple semver correctly', ->
		m.chai.expect(osVersionRCompare('1.0.0', '1.1.0')).to.equal(1)
		m.chai.expect(osVersionRCompare('2.0.0', '1.0.0')).to.equal(-1)
		m.chai.expect(osVersionRCompare('3.0.0', '3.0.0')).to.equal(0)

	it 'puts prerelease below real releases', ->
		m.chai.expect(osVersionRCompare('2.0.0-rc6+rev2', '2.0.0+rev1')).to.equal(1)
		m.chai.expect(osVersionRCompare('2.0.0-rc6.rev2', '2.0.0+rev1')).to.equal(1)

	it 'sorts by rev if the semver otherwise matches', ->
		m.chai.expect(osVersionRCompare('2.0.6+rev3.prod', '2.0.0+rev1')).to.equal(-1)
		m.chai.expect(osVersionRCompare('2.0.6+rev3.prod', '2.0.6+rev3.prod')).to.equal(0)
		m.chai.expect(osVersionRCompare('2.0.0+rev1', '2.0.6+rev3.prod')).to.equal(1)

	it 'sorts any rev above no rev', ->
		m.chai.expect(osVersionRCompare('2.0.0', '2.0.0+rev1')).to.equal(1)

	it 'sorts by non-rev build metadata for matching revs', ->
		m.chai.expect(osVersionRCompare('2.0.6+rev3.dev', '2.0.0+rev1')).to.equal(-1)
		m.chai.expect(osVersionRCompare('2.0.0+dev.rev2', '2.0.6+rev3.prod')).to.equal(1)
		m.chai.expect(osVersionRCompare('2.0.0+rev1', '2.0.6+rev3.dev')).to.equal(1)

	it 'correctly sorts a full list', ->
		m.chai.expect([
			'1.0.0'
			'2.0.0-rc1+rev5'
			'2.0.6+rev3.prod'
			'2.0.0+rev1'
			'2.0.0'
			'1.24.0+rev100'
			'2.0.6+rev3.dev'
		].sort(osVersionRCompare)).to.deep.equal [
			'2.0.6+rev3.prod'
			'2.0.6+rev3.dev'
			'2.0.0+rev1'
			'2.0.0'
			'2.0.0-rc1+rev5'
			'1.24.0+rev100'
			'1.0.0'
		]

