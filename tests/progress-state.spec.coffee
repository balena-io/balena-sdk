sinon = require('sinon')
chai = require('chai')
chai.use(require('sinon-chai'))
expect = chai.expect
ProgressState = require('../lib/progress-state')

describe 'ProgressState:', ->

	describe '#constructor()', ->

		it 'should merge options into the instance', ->
			options =
				total: 1000
				received: 300
				delta: 30
				percentage: 45
				eta: 9172
				speed: 45

			progressState = new ProgressState(options)

			for key, value of options
				expect(progressState[key]).to.equal(value)

		describe 'for received option', ->

			it 'should throw an error if missing', ->
				expect ->
					new ProgressState
						total: 1000
						received: null
						delta: 30
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Missing option: received')

			it 'should throw an error if not a number', ->
				expect ->
					new ProgressState
						total: 1000
						received: '353'
						delta: 30
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option received: 353')

			it 'should throw an error if negative', ->
				expect ->
					new ProgressState
						total: 1000
						received: -1
						delta: 30
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option received: -1')

			it 'should throw an error if received > total', ->
				expect ->
					new ProgressState
						total: 1000
						received: 1001
						delta: 30
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option received: 1001. 1001 > 1000')

		describe 'for delta option', ->

			it 'should throw an error if missing', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: null
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Missing option: delta')

			it 'should throw an error if not a number', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: '30'
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option delta: 30')

			it 'should throw an error if negative', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: -1
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option delta: -1')

			it 'should throw an error if delta > total', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 1001
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option delta: 1001. 1001 > 1000.')

			it 'should throw an error if delta > received', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 301
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option delta: 301. 301 > 300.')

		describe 'for total option', ->

			it 'should throw an error if not a number', ->
				expect ->
					new ProgressState
						total: '1000'
						received: 300
						delta: 30
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option total: 1000')

			it 'should throw an error if negative', ->
				expect ->
					new ProgressState
						total: -1
						received: 300
						delta: 30
						percentage: 45
						eta: 9172
						speed: 45
				.to.throw('Invalid option total: -1')

		describe 'for percentage option', ->

			it 'should throw an error if not a number', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 30
						percentage: '45'
						eta: 9172
						speed: 45
				.to.throw('Invalid option percentage: 45')

			it 'should throw an error if negative', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 30
						percentage: -1
						eta: 9172
						speed: 45
				.to.throw('Invalid option percentage: -1')

			it 'should throw an error if higher than 100', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 30
						percentage: 101
						eta: 9172
						speed: 45
				.to.throw('Invalid option percentage: 101')

		describe 'for eta option', ->

			it 'should throw an error if not a number', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 30
						percentage: 45
						eta: '9172'
						speed: 45
				.to.throw('Invalid option eta: 9172')

			it 'should throw an error if negative', ->
				expect ->
					new ProgressState
						total: 1000
						received: 300
						delta: 30
						percentage: 45
						eta: -1
						speed: 45
				.to.throw('Invalid option eta: -1')

	describe '.createFromNodeRequestProgress()', ->

		it 'should not throw any error', ->
			callback = (progressState) ->
				expect(progressState).to.be.an.instanceof(ProgressState)

			callbackSpy = sinon.spy(callback)

			tickFunction = ProgressState.createFromNodeRequestProgress(callbackSpy)

			tickFunction
				total: 150
				received: 0
				percent: 0

			tickFunction
				total: 150
				received: 75
				percent: 50

			tickFunction
				total: 150
				received: 150
				percent: 100

			expect(callbackSpy).to.have.been.calledThrice
