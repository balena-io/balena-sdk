m = require('mochainon')

exports.loadEnv = ->
	require('dotenv').config(silent: true)

exports.assertDeepMatchAndLength = (a, b) ->
	[a, b].forEach (target) ->
		m.chai.expect(target).to.have.property('length').that.is.a('number')

	if a.length != b.length
		# We found an error! Use deep.equal
		# so that the whole content of array a is printed.
		m.chai.expect(a).to.deep.equal(b)

	m.chai.expect(a).to.deep.match(b)
	m.chai.expect(a).to.have.lengthOf(b.length)
