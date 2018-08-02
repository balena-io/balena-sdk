###
The methods of this file should be imported and used in
the respective resource tests that support the tag related methods
eg: application.spec, device.spec
###
_ = require('lodash')
m = require('mochainon')

getAllByResourceFactory = (model, resourceName) ->
	(idOrUniqueParam) ->
		model["getAllBy#{_.startCase(resourceName)}"](idOrUniqueParam)

NO_UNIQUE_PROP_LABEL = 'unique property'

exports.itShouldGetAllTagsByResource = (opts) ->
	{ model, resourceName, uniquePropertyName } = opts
	getAllByResource = getAllByResourceFactory(model, resourceName)

	beforeEach ->
		@resource = opts.resourceProvider()
		# used for tag creation in beforeEach
		@setTagResource = (opts.setTagResourceProvider || opts.resourceProvider)()

	it 'should become an empty array by default', ->
		promise = getAllByResource(@resource.id)
		m.chai.expect(promise).to.become([])

	it "should be rejected if the #{resourceName} id does not exist", ->
		promise = getAllByResource(999999)
		m.chai.expect(promise).to.be.rejectedWith("#{_.startCase(resourceName)} not found: 999999")

	it "should be rejected if the #{resourceName} #{uniquePropertyName || NO_UNIQUE_PROP_LABEL} does not exist", ->
		if !uniquePropertyName
			return this.skip()

		promise = getAllByResource('123456789')
		m.chai.expect(promise).to.be.rejectedWith("#{_.startCase(resourceName)} not found: 123456789")

	describe 'given a tag', ->

		beforeEach ->
			# we use the tag associated resource id here
			# for cases like device.tags.getAllByApplication()
			# where @setTagResource will be a device and
			# @resource will be an application
			model.set(@setTagResource.id, 'EDITOR', 'vim')

		it "should retrieve the tag by #{resourceName} id", ->
			getAllByResource(@resource.id)
			.then (tags) ->
				m.chai.expect(tags).to.have.length(1)
				m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
				m.chai.expect(tags[0].value).to.equal('vim')

		it "should retrieve the tag by #{resourceName} #{uniquePropertyName || NO_UNIQUE_PROP_LABEL}", ->
			if !uniquePropertyName
				return this.skip()

			getAllByResource(@resource[uniquePropertyName])
			.then (tags) ->
				m.chai.expect(tags).to.have.length(1)
				m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
				m.chai.expect(tags[0].value).to.equal('vim')

exports.itShouldGetAllTags = (opts) ->
	{ model, resourceName } = opts

	beforeEach ->
		@resource = opts.resourceProvider()

	it 'should become an empty array by default', ->
		promise = model.getAll()
		m.chai.expect(promise).to.become([])

	describe 'given two tags', ->

		beforeEach ->
			Promise.all([
				model.set(@resource.id, 'EDITOR', 'vim')
				model.set(@resource.id, 'LANGUAGE', 'js')
			])

		it 'should retrieve all the tags', ->
			model.getAll()
			.then (tags) ->
				tags = _.sortBy(tags, 'tag_key')
				m.chai.expect(tags).to.have.length(2)
				m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
				m.chai.expect(tags[0].value).to.equal('vim')
				m.chai.expect(tags[1].tag_key).to.equal('LANGUAGE')
				m.chai.expect(tags[1].value).to.equal('js')

		it 'should retrieve the filtered tag', ->
			model.getAll($filter: tag_key: 'EDITOR')
			.then (tags) ->
				m.chai.expect(tags).to.have.length(1)
				m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
				m.chai.expect(tags[0].value).to.equal('vim')

exports.itShouldSetTags = (opts) ->
	{ model, resourceName, uniquePropertyName } = opts
	getAllByResource = getAllByResourceFactory(model, resourceName)

	beforeEach ->
		@resource = opts.resourceProvider()

	it "should be able to create a tag given a #{resourceName} id", ->
		model.set(@resource.id, 'EDITOR', 'vim').then =>
			getAllByResource(@resource.id)
		.then (tags) ->
			m.chai.expect(tags).to.have.length(1)
			m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
			m.chai.expect(tags[0].value).to.equal('vim')

	it "should be able to create a tag given a #{resourceName} #{uniquePropertyName || NO_UNIQUE_PROP_LABEL}", ->
		if !uniquePropertyName
			return this.skip()

		model.set(@resource[uniquePropertyName], 'EDITOR', 'vim').then =>
			getAllByResource(@resource.id)
		.then (tags) ->
			m.chai.expect(tags).to.have.length(1)
			m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
			m.chai.expect(tags[0].value).to.equal('vim')

	it 'should be able to create a numeric tag', ->
		model.set(@resource.id, 'EDITOR', 1).then =>
			getAllByResource(@resource.id)
		.then (tags) ->
			m.chai.expect(tags).to.have.length(1)
			m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
			m.chai.expect(tags[0].value).to.equal('1')

	it 'should not allow creating a resin tag', ->
		promise = model.set(@resource.id, 'io.resin.test', 'secret')
		m.chai.expect(promise).to.be.rejectedWith('Tag keys beginning with io.resin. are reserved.')

	it 'should not allow creating a tag with a name containing a whitespace', ->
		promise = model.set(@resource.id, 'EDITOR 1', 'vim')
		m.chai.expect(promise).to.be.rejectedWith(/Request error: Tag keys cannot contain whitespace./)

	it "should be rejected if the #{resourceName} id does not exist", ->
		promise = model.set(999999, 'EDITOR', 'vim')
		m.chai.expect(promise).to.be.rejectedWith("#{_.startCase(resourceName)} not found: 999999")

	it "should be rejected if the #{resourceName} #{uniquePropertyName || NO_UNIQUE_PROP_LABEL} does not exist", ->
		if !uniquePropertyName
			return this.skip()

		promise = model.set('123456789', 'EDITOR', 'vim')
		m.chai.expect(promise).to.be.rejectedWith("#{_.startCase(resourceName)} not found: 123456789")

	it 'should be rejected if the tag_key is undefined', ->
		promise = model.set(@resource.id, undefined, 'vim')
		m.chai.expect(promise).to.be.rejected

	it 'should be rejected if the tag_key is null', ->
		promise = model.set(@resource.id, null, 'vim')
		m.chai.expect(promise).to.be.rejected

	describe 'given two existing tags', ->

		beforeEach ->
			Promise.all([
				model.set(@resource.id, 'EDITOR', 'vim')
				model.set(@resource.id, 'LANGUAGE', 'js')
			])

		it 'should be able to update a tag without affecting the rest', ->
			model.set(@resource.id, 'EDITOR', 'emacs')
			.then => getAllByResource(@resource.id)
			.then (tags) ->
				tags = _.sortBy(tags, 'tag_key')
				m.chai.expect(tags).to.have.length(2)
				m.chai.expect(tags[0].tag_key).to.equal('EDITOR')
				m.chai.expect(tags[0].value).to.equal('emacs')
				m.chai.expect(tags[1].tag_key).to.equal('LANGUAGE')
				m.chai.expect(tags[1].value).to.equal('js')

exports.itShouldRemoveTags = (opts) ->
	{ model, resourceName, uniquePropertyName } = opts
	getAllByResource = getAllByResourceFactory(model, resourceName)

	describe 'given an existing tag', ->

		beforeEach ->
			@resource = opts.resourceProvider()
			model.set(@resource.id, 'EDITOR', 'vim').then (tag) =>
				@tag = tag

		it "should be able to remove a tag by #{resourceName} id", ->
			model.remove(@resource.id, @tag.tag_key).then =>
				getAllByResource(@resource.id)
			.then (tags) ->
				m.chai.expect(tags).to.have.length(0)

		it "should be able to remove a tag by #{resourceName} #{uniquePropertyName || NO_UNIQUE_PROP_LABEL}", ->
			if !uniquePropertyName
				return this.skip()

			model.remove(@resource[uniquePropertyName], @tag.tag_key).then =>
				getAllByResource(@resource[uniquePropertyName])
			.then (tags) ->
				m.chai.expect(tags).to.have.length(0)
