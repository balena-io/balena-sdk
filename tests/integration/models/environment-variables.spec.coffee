m = require('mochainon')

{ resin, givenLoggedInUser } = require('../setup')

describe 'Environment Variables Model', ->

	before ->
		resin.auth.logout()

	describe 'resin.models.environmentVariables.isSystemVariable()', ->

		it 'should return false for EDITOR', ->
			result = resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
			m.chai.expect(result).to.be.false

		it 'should return false for RESINATOR', ->
			result = resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
			m.chai.expect(result).to.be.false

		it 'should return true for RESIN', ->
			result = resin.models.environmentVariables.isSystemVariable(name: 'RESIN')
			m.chai.expect(result).to.be.true

		it 'should return true for RESIN_API_KEY', ->
			result = resin.models.environmentVariables.isSystemVariable(name: 'RESIN_API_KEY')
			m.chai.expect(result).to.be.true

	describe 'when logged in', ->

		givenLoggedInUser()

		describe 'given a single application with no devices', ->

			beforeEach ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

			describe 'resin.models.environmentVariables.getAllByApplication()', ->

				it 'should become an empty array by default', ->
					promise = resin.models.environmentVariables.getAllByApplication(@application.app_name)
					m.chai.expect(promise).to.become([])

				it 'should be rejected if the application uuid does not exist', ->
					promise = resin.models.environmentVariables.getAllByApplication('HelloWorldApp')
					m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				it 'should be rejected if the application id does not exist', ->
					promise = resin.models.environmentVariables.getAllByApplication(999999)
					m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			describe 'resin.models.environmentVariables.create()', ->

				it 'should be able to create a non resin variable given an app name', ->
					resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 'vim').then =>
						resin.models.environmentVariables.getAllByApplication(@application.id)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('vim')

				it 'should be able to create a non resin variable given an app id', ->
					resin.models.environmentVariables.create(@application.id, 'EDITOR', 'vim').then =>
						resin.models.environmentVariables.getAllByApplication(@application.id)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('vim')

				it 'should be able to create a numeric non resin variable', ->
					resin.models.environmentVariables.create(@application.app_name, 'EDITOR', 1).then =>
						resin.models.environmentVariables.getAllByApplication(@application.app_name)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('1')

				it 'should not allow creating a resin variable', ->
					promise = resin.models.environmentVariables.create(@application.app_name, 'RESIN_API_KEY', 'secret')
					m.chai.expect(promise).to.be.rejectedWith('Environment variables beginning with RESIN_ are reserved.')

				it 'should be rejected if the application name does not exist', ->
					promise = resin.models.environmentVariables.create('HelloWorldApp', 'EDITOR', 'vim')
					m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				it 'should be rejected if the application id does not exist', ->
					promise = resin.models.environmentVariables.create(999999, 'EDITOR', 'vim')
					m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			describe 'given an existing environment variable', ->

				beforeEach ->
					resin.models.environmentVariables.create(@application.id, 'EDITOR', 'vim').then (envVar) =>
						@envVar = envVar

				describe 'resin.models.environmentVariables.update()', ->

					it 'should be able to update an environment variable', ->
						resin.models.environmentVariables.update(@envVar.id, 'emacs').then =>
							resin.models.environmentVariables.getAllByApplication(@application.app_name)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('emacs')

				describe 'resin.models.environmentVariables.remove()', ->

					it 'should be able to remove an environment variable', ->
						resin.models.environmentVariables.remove(@envVar.id).then =>
							resin.models.environmentVariables.getAllByApplication(@application.app_name)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(0)

		describe 'given a single application with a single offline device', ->

			beforeEach ->
				resin.models.application.create('FooBar', 'raspberry-pi').then (application) =>
					@application = application

					uuid = resin.models.device.generateUniqueKey()
					resin.models.device.register(application.app_name, uuid)
					.then (deviceInfo) ->
						resin.models.device.get(deviceInfo.uuid)
					.then (device) =>
						@device = device

			describe 'resin.models.environmentVariables.device.getAll()', ->

				it 'should become an empty array by default', ->
					promise = resin.models.environmentVariables.device.getAll(@device.uuid)
					m.chai.expect(promise).to.become([])

				it 'should be rejected if the device uuid does not exist', ->
					promise = resin.models.environmentVariables.device.getAll('asdfghjkl')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = resin.models.environmentVariables.device.getAll(999999)
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'resin.models.environmentVariables.device.getAllByApplication()', ->

				it 'should become an empty array by default', ->
					promise = resin.models.environmentVariables.device.getAllByApplication(@application.id)
					m.chai.expect(promise).to.become([])

				it 'should return device environment variables if they exist', ->
					resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 'vim').then =>
						resin.models.environmentVariables.device.getAllByApplication(@application.id)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('vim')

				it 'should be rejected if the application name does not exist', ->
					promise = resin.models.environmentVariables.device.getAllByApplication('HelloWorldApp')
					m.chai.expect(promise).to.be.rejectedWith('Application not found: HelloWorldApp')

				it 'should be rejected if the application id does not exist', ->
					promise = resin.models.environmentVariables.device.getAllByApplication(999999)
					m.chai.expect(promise).to.be.rejectedWith('Application not found: 999999')

			describe 'resin.models.environmentVariables.device.create()', ->

				it 'should be able to create a non resin variable given a device uuid', ->
					resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 'vim').then =>
						resin.models.environmentVariables.device.getAll(@device.id)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('vim')

				it 'should be able to create a non resin variable given a device id', ->
					resin.models.environmentVariables.device.create(@device.id, 'EDITOR', 'vim').then =>
						resin.models.environmentVariables.device.getAll(@device.id)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('vim')

				it 'should be able to create a numeric non resin variable', ->
					resin.models.environmentVariables.device.create(@device.uuid, 'EDITOR', 1).then =>
						resin.models.environmentVariables.device.getAll(@device.id)
					.then (envs) ->
						m.chai.expect(envs).to.have.length(1)
						m.chai.expect(envs[0].name).to.equal('EDITOR')
						m.chai.expect(envs[0].value).to.equal('1')

				it 'should not allow creating a resin variable', ->
					promise = resin.models.environmentVariables.device.create(@device.uuid, 'RESIN_API_KEY', 'secret')
					m.chai.expect(promise).to.be.rejectedWith('Environment variables beginning with RESIN_ are reserved.')

				it 'should be rejected if the device uuid does not exist', ->
					promise = resin.models.environmentVariables.device.create('asdfghjkl', 'EDITOR', 'vim')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: asdfghjkl')

				it 'should be rejected if the device id does not exist', ->
					promise = resin.models.environmentVariables.device.create(999999, 'EDITOR', 'vim')
					m.chai.expect(promise).to.be.rejectedWith('Device not found: 999999')

			describe 'given an existing environment variable', ->

				beforeEach ->
					resin.models.environmentVariables.device.create(@device.id, 'EDITOR', 'vim').then (envVar) =>
						@envVar = envVar

				describe 'resin.models.environmentVariables.device.update()', ->

					it 'should be able to update an environment variable', ->
						resin.models.environmentVariables.device.update(@envVar.id, 'emacs').then =>
							resin.models.environmentVariables.device.getAll(@device.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(1)
							m.chai.expect(envs[0].name).to.equal('EDITOR')
							m.chai.expect(envs[0].value).to.equal('emacs')

				describe 'resin.models.environmentVariables.device.remove()', ->

					it 'should be able to remove an environment variable', ->
						resin.models.environmentVariables.device.remove(@envVar.id).then =>
							resin.models.environmentVariables.device.getAll(@device.id)
						.then (envs) ->
							m.chai.expect(envs).to.have.length(0)
