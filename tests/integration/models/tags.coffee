###
The methods of this file should be imported and used in
the respective resource tests that support the tag related methods
eg: application.spec, device.spec
###
_ = require('lodash')
m = require('mochainon')


getAllByResourcePropNameProvider = (model, resourceName) ->
	"getAllBy#{_.startCase(resourceName)}"

getAllByResourceFactory = (model, resourceName) ->
	propName = getAllByResourcePropNameProvider(model, resourceName)
	(idOrUniqueParam) ->
		model[propName](idOrUniqueParam)

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

		before ->
			# we use the tag associated resource id here
			# for cases like device.tags.getAllByApplication()
			# where @setTagResource will be a device and
			# @resource will be an application
			model.set(@setTagResource.id, 'EDITOR', 'vim')

		after ->
			model.remove(@setTagResource.id, 'EDITOR', 'vim')

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

exports.itShouldSetGetAndRemoveTags = (opts) ->
	{ model, resourceName, uniquePropertyName, modelNamespace } = opts
	getAllByResourcePropName = getAllByResourcePropNameProvider(model, resourceName)
	getAllByResource = getAllByResourceFactory(model, resourceName)

	beforeEach ->
		@resource = opts.resourceProvider()

	['id', uniquePropertyName].forEach (param) ->

		describe "given a #{resourceName} #{param || NO_UNIQUE_PROP_LABEL}", ->

			it "should be rejected if the #{resourceName} id does not exist", ->
				return this.skip() if !param
				resourceUniqueKey = if param == 'id' then 999999 else '123456789'
				promise = model.set(resourceUniqueKey, 'EDITOR', 'vim')
				m.chai.expect(promise).to.be.rejectedWith("#{_.startCase(resourceName)} not found: #{resourceUniqueKey}")

			it 'should initially have no tags', ->
				return this.skip() if !param
				getAllByResource(@resource[param])
				.then (tags) ->
					m.chai.expect(tags).to.have.length(0)

			it '...should be able to create a tag', ->
				return this.skip() if !param
				promise = model.set(@resource[param], "EDITOR_BY_#{resourceName}_#{param}", 'vim')
				m.chai.expect(promise).to.not.be.rejected

			it '...should be able to retrieve all tags, including the one created', ->
				return this.skip() if !param
				getAllByResource(@resource[param])
				.then (tags) ->
					m.chai.expect(tags).to.have.length(1)
					tag = tags[0]
					m.chai.expect(tag).to.be.an('object')
					m.chai.expect(tag.tag_key).to.equal("EDITOR_BY_#{resourceName}_#{param}")
					m.chai.expect(tag.value).to.equal('vim')

			it '...should be able to update a tag', ->
				return this.skip() if !param
				model.set(@resource[param], "EDITOR_BY_#{resourceName}_#{param}", 'nano')
				.then =>
					getAllByResource(@resource[param])
				.then (tags) ->
					m.chai.expect(tags).to.have.length(1)
					tag = tags[0]
					m.chai.expect(tag).to.be.an('object')
					m.chai.expect(tag.tag_key).to.equal("EDITOR_BY_#{resourceName}_#{param}")
					m.chai.expect(tag.value).to.equal('nano')

			it '...should be able to remove a tag', ->
				return this.skip() if !param
				model.remove(@resource[param], "EDITOR_BY_#{resourceName}_#{param}").then =>
					getAllByResource(@resource.id)
				.then (tags) ->
					m.chai.expect(tags).to.have.length(0)

	describe "#{modelNamespace}.set()", ->

		it 'should not allow creating a resin tag', ->
			promise = model.set(@resource.id, 'io.resin.test', 'secret')
			m.chai.expect(promise).to.be.rejectedWith('Tag keys beginning with io.resin. are reserved.')

		it 'should not allow creating a balena tag', ->
			promise = model.set(@resource.id, 'io.balena.test', 'secret')
			m.chai.expect(promise).to.be.rejectedWith('Tag keys beginning with io.balena. are reserved.')

		it 'should not allow creating a tag with a name containing a whitespace', ->
			promise = model.set(@resource.id, 'EDITOR 1', 'vim')
			m.chai.expect(promise).to.be.rejectedWith(/Request error: Tag keys cannot contain whitespace./)

		it 'should be rejected if the tag_key is undefined', ->
			promise = model.set(@resource.id, undefined, 'vim')
			m.chai.expect(promise).to.be.rejected

		it 'should be rejected if the tag_key is null', ->
			promise = model.set(@resource.id, null, 'vim')
			m.chai.expect(promise).to.be.rejected

		it 'should be able to create a numeric tag', ->
			model.set(@resource.id, 'EDITOR_NUMERIC', 1).then =>
				getAllByResource(@resource.id)
			.then (tags) =>
				m.chai.expect(tags).to.have.length(1)
				m.chai.expect(tags[0].tag_key).to.equal('EDITOR_NUMERIC')
				m.chai.expect(tags[0].value).to.equal('1')
				model.remove(@resource.id, 'EDITOR_NUMERIC')

	describe 'given two existing tags', ->

		before ->
			Promise.all([
				model.set(@resource.id, 'EDITOR', 'vim')
				model.set(@resource.id, 'LANGUAGE', 'js')
			])

		describe "#{modelNamespace}.getAll()", ->

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

		describe "#{modelNamespace}.set()", ->

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

		after ->
			Promise.all([
				model.remove(@resource.id, 'EDITOR', 'vim')
				model.remove(@resource.id, 'LANGUAGE', 'js')
			])
