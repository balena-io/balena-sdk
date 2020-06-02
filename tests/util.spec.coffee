_ = require('lodash')
m = require('mochainon')
bSemver = require('balena-semver')

{
	mergePineOptions
} = require('../es2015/util')
{
	getDeviceOsSemverWithVariant
} = require('../es2015/util/device-os-version')

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
			,
				application: $expand: [ 'release' ]
			]

		m.chai.expect(result).to.deep.equal
			$expand:
				application:
					$expand: [ 'release' ]
				device:
					$select: [ 'id' ]
					$expand: [ 'build' ]

	it 'combines $expand params for expand options that are arrays of objects with multiple keys', ->
		result = mergePineOptions
			$expand: [
				device: $select: [ 'id' ]
				application: $expand: [ 'user' ]
			]
		,
			$expand: [
				device: $expand: [ 'build' ]
				application: $expand: 'release'
			]

		m.chai.expect(result).to.deep.equal
			$expand:
				application:
					$expand:
						release: {},
						user: {},
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

itShouldCompareVersionsProperly = (rcompare) ->

	it 'compares simple semver correctly', ->
		m.chai.expect(rcompare('1.0.0', '1.1.0')).to.equal(1)
		m.chai.expect(rcompare('2.0.0', '1.0.0')).to.equal(-1)
		m.chai.expect(rcompare('3.0.0', '3.0.0')).to.equal(0)

	it 'puts prerelease below real releases', ->
		m.chai.expect(rcompare('2.0.0-rc6+rev2', '2.0.0+rev1')).to.equal(1)
		m.chai.expect(rcompare('2.0.0-rc6.rev2', '2.0.0+rev1')).to.equal(1)

	it 'sorts by rev if the semver otherwise matches', ->
		m.chai.expect(rcompare('2.0.6+rev3.prod', '2.0.0+rev1')).to.equal(-1)
		m.chai.expect(rcompare('2.0.6+rev3.prod', '2.0.6+rev3.prod')).to.equal(0)
		m.chai.expect(rcompare('2.0.0+rev1', '2.0.6+rev3.prod')).to.equal(1)

	it 'sorts any rev above no rev', ->
		m.chai.expect(rcompare('2.0.0', '2.0.0+rev1')).to.equal(1)

	it 'sorts by non-rev build metadata for matching revs', ->
		m.chai.expect(rcompare('2.0.6+rev3.dev', '2.0.0+rev1')).to.equal(-1)
		m.chai.expect(rcompare('2.0.0+dev.rev2', '2.0.6+rev3.prod')).to.equal(1)
		m.chai.expect(rcompare('2.0.0+rev1', '2.0.6+rev3.dev')).to.equal(1)

	it 'correctly sorts a full list', ->
		m.chai.expect([
			'1.0.0'
			'2.0.0-rc1+rev5'
			'2.0.6+rev3.prod'
			'2.0.0+rev1'
			'2.0.0'
			'1.24.0+rev100'
			'2.0.6+rev3.dev'
		].sort(rcompare)).to.deep.equal [
			'2.0.6+rev3.prod'
			'2.0.6+rev3.dev'
			'2.0.0+rev1'
			'2.0.0'
			'2.0.0-rc1+rev5'
			'1.24.0+rev100'
			'1.0.0'
		]

describe 'version comparisons', ->

	describe 'bSemver.rcompare', ->

		itShouldCompareVersionsProperly(bSemver.rcompare)

describe 'getDeviceOsSemverWithVariant', ->

	it 'should not parse invalid semver versions', ->
		_.forEach([
			['Resin OS ', 'dev']
			['Resin OS ', 'prod']
			['Resin OS 2.0-beta.8', '']
		]
		([os_version, os_variant, expectation]) ->
			m.chai.expect(getDeviceOsSemverWithVariant({ os_version, os_variant })).to.equal(null)
		)

	it 'should parse plain os versions w/o variant', ->
		_.forEach([
			['Resin OS 1.2.1', '', '1.2.1']
			['Resin OS 1.6.0', '', '1.6.0']
			['Resin OS 2.0.0-beta.1', '', '2.0.0-beta.1']
			['Resin OS 2.0.0-beta.3', '', '2.0.0-beta.3']
			['Resin OS 2.0.0-beta11.rev1', '', '2.0.0-beta11.rev1']
			['Resin OS 2.0.0-beta.8', '', '2.0.0-beta.8']
			['Resin OS 2.0.0-rc1.rev1', '', '2.0.0-rc1.rev1']
			['Resin OS 2.0.0-rc1.rev2', '', '2.0.0-rc1.rev2']
			['Resin OS 2.0.1-beta.4', '', '2.0.1-beta.4']
			['Resin OS 2.0.1.rev1', '', '2.0.1+rev1']
			['Resin OS 2.0.2-beta.2', '', '2.0.2-beta.2']
			['Resin OS 2.0.2-beta.7', '', '2.0.2-beta.7']
			['Resin OS 2.0.2+rev2', '', '2.0.2+rev2']
			['Resin OS 2.0.6+rev2', '', '2.0.6+rev2']
		]
		([os_version, os_variant, expectation]) ->
			m.chai.expect(getDeviceOsSemverWithVariant({ os_version, os_variant })).to.equal(expectation)
		)

	it 'should properly combine the plain os version & variant', ->
		_.forEach([
			['Resin OS 2.0.0-beta.8', 'prod', '2.0.0-beta.8+prod']
			['balenaOS 2.0.0-beta12.rev1', 'prod', '2.0.0-beta12.rev1+prod']
			['Resin OS 2.0.0-rc1.rev2', 'prod', '2.0.0-rc1.rev2+prod']
			['Resin OS 2.0.0+rev2', 'prod', '2.0.0+rev2.prod']
			['Resin OS 2.0.0+rev3', 'prod', '2.0.0+rev3.prod']
			['Resin OS 2.0.2+rev2', 'dev', '2.0.2+rev2.dev']
			['Resin OS 2.0.3+rev1', 'dev', '2.0.3+rev1.dev']
			['Resin OS 2.0.3+rev1', 'prod', '2.0.3+rev1.prod']
			['Resin OS 2.0.4+rev1', 'dev', '2.0.4+rev1.dev']
			['Resin OS 2.0.4+rev1', 'prod', '2.0.4+rev1.prod']
			['Resin OS 2.0.4+rev2', 'prod', '2.0.4+rev2.prod']
			['Resin OS 2.0.5', 'dev', '2.0.5+dev']
			['Resin OS 2.0.5+rev1', 'dev', '2.0.5+rev1.dev']
			['Resin OS 2.0.5+rev1', 'prod', '2.0.5+rev1.prod']
			['Resin OS 2.0.6+rev1', 'dev', '2.0.6+rev1.dev']
			['Resin OS 2.0.6+rev1', 'prod', '2.0.6+rev1.prod']
			['Resin OS 2.0.6+rev2', 'dev', '2.0.6+rev2.dev']
			['Resin OS 2.0.6+rev2', 'prod', '2.0.6+rev2.prod']
			['Resin OS 2.1.0+rev1', 'dev', '2.1.0+rev1.dev']
			['Resin OS 2.1.0+rev1', 'prod', '2.1.0+rev1.prod']
			['Resin OS 2.2.0+rev1', 'dev', '2.2.0+rev1.dev']
			['Resin OS 2.2.0+rev1', 'prod', '2.2.0+rev1.prod']
			['Resin OS 2.9.0-multi1+rev1', 'dev', '2.9.0-multi1+rev1.dev']
			['Resin OS 2.9.7+rev1', 'dev', '2.9.7+rev1.dev']
			['Resin OS 2.9.7+rev1', 'prod', '2.9.7+rev1.prod']
			['Resin OS 2.12.0+rev1', 'dev', '2.12.0+rev1.dev']
			['Resin OS 2.12.0+rev1', 'prod', '2.12.0+rev1.prod']
			['Resin OS 2.12.1+rev1', 'dev', '2.12.1+rev1.dev']
			['Resin OS 2.12.1+rev1', 'prod', '2.12.1+rev1.prod']
			['Resin OS 2.12.3', 'dev', '2.12.3+dev']
			['Resin OS 2.12.3+rev1', 'dev', '2.12.3+rev1.dev']
			['balenaOS 2.26.0', 'dev', '2.26.0+dev']
			['balenaOS 2.26.0+rev1', 'dev', '2.26.0+rev1.dev']
			['balenaOS 2.26.0+rev1', 'prod', '2.26.0+rev1.prod']
			['balenaOS 2.28.0-beta1.rev1', 'prod', '2.28.0-beta1.rev1+prod']
			['balenaOS 2.28.0+rev1', 'dev', '2.28.0+rev1.dev']
		]
		([os_version, os_variant, expectation]) ->
			m.chai.expect(getDeviceOsSemverWithVariant({ os_version, os_variant })).to.equal(expectation)
		)

	it 'should properly parse the os_version with variant suffix w/o os_variant', ->
		_.forEach([
			['Resin OS 2.0.0-rc6.rev1 (prod)', '', '2.0.0-rc6.rev1+prod']
			['Resin OS 2.0.0.rev1 (prod)', '', '2.0.0+rev1.prod']
			['Resin OS 2.0.0+rev2 (prod)', '', '2.0.0+rev2.prod']
			['Resin OS 2.0.0+rev3 (dev)', '', '2.0.0+rev3.dev']
			['Resin OS 2.0.0+rev3 (prod)', '', '2.0.0+rev3.prod']
			['Resin OS 2.0.0+rev4 (prod)', '', '2.0.0+rev4.prod']
			['Resin OS 2.0.0+rev5 (dev)', '', '2.0.0+rev5.dev']
		]
		([os_version, os_variant, expectation]) ->
			m.chai.expect(getDeviceOsSemverWithVariant({ os_version, os_variant })).to.equal(expectation)
		)

	it 'should properly combine the os_version with variant suffix & os_variant', ->
		_.forEach([
			['Resin OS 2.0.0.rev1 (prod)', 'prod', '2.0.0+rev1.prod']
			['Resin OS 2.0.0+rev2 (prod)', 'prod', '2.0.0+rev2.prod']
			['Resin OS 2.0.0+rev3 (dev)', 'dev', '2.0.0+rev3.dev']
			['Resin OS 2.0.0+rev3 (prod)', 'prod', '2.0.0+rev3.prod']
			['Resin OS 2.0.0+rev4 (prod)', 'prod', '2.0.0+rev4.prod']
			['Resin OS 2.0.0+rev5 (prod)', 'prod', '2.0.0+rev5.prod']
		]
		([os_version, os_variant, expectation]) ->
			m.chai.expect(getDeviceOsSemverWithVariant({ os_version, os_variant })).to.equal(expectation)
		)
