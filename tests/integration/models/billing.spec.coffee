_ = require('lodash')
m = require('mochainon')
Promise = require('bluebird')

{ balena, givenLoggedInUser, loginPaidUser, IS_BROWSER } = require('../setup')

eventuallyExpectProperty = (promise, prop) ->
	m.chai.expect(promise).to.eventually.have.property(prop)

describe 'Billing Model', ->

	describe 'Free Account', ->
		givenLoggedInUser(beforeEach)

		describe 'balena.models.billing.getAccount()', ->
			it 'should not return a billing account info object', ->
				promise = balena.models.billing.getAccount()
				m.chai.expect(promise).to.be.rejected
				.then (error) ->
					m.chai.expect(error).to.have.property('code', 'BalenaRequestError')
					m.chai.expect(error).to.have.property('statusCode', 404)
					m.chai.expect(error).to.have.property('message').that.contains('Billing Account was not found.')

		describe 'balena.models.billing.getPlan()', ->
			it 'should return a free tier billing plan object', ->
				balena.models.billing.getPlan()
				.then (plan) ->
					m.chai.expect(plan).to.deep.match
						title: 'Free'
						name: 'Free plan'
						code: 'free'
						tier: 'free'
						addOns: [],
						billing:
							currency: 'USD'
							charges: [
								{
									itemType: 'plan'
									name: 'Free plan'
									code: 'free'
									unitCostCents: '0'
									quantity: '1'
								}
								{
									itemType: 'support'
									name: 'Community support'
									code: 'community'
									unitCostCents: '0'
									quantity: '1'
								}
							]
							totalCostCents: '0'
						support:
							title: 'Community'
							name: 'Community support'

		describe 'balena.models.billing.getBillingInfo()', ->
			it 'should return a free tier billing info object', ->
				promise = balena.models.billing.getBillingInfo()
				m.chai.expect(promise).to.become({})

		describe 'balena.models.billing.updateBillingInfo()', ->
			it 'should throw when no parameters are provided', ->
				promise = balena.models.billing.updateBillingInfo()
				m.chai.expect(promise).to.be.rejectedWith('Token not provided.')

			it 'should throw when an token_id is not provided', ->
				promise = balena.models.billing.updateBillingInfo({ token_id: '' })
				m.chai.expect(promise).to.be.rejectedWith('Token not provided.')

		describe 'balena.models.billing.getInvoices()', ->
			it 'should return no invoices', ->
				promise = balena.models.billing.getInvoices()
				m.chai.expect(promise).to.become([])

		describe 'balena.models.billing.downloadInvoice()', ->
			before ->
				balena.models.billing.getInvoices()
				.then (invoices) =>
					@firstInvoiceNumber = invoices[0]?.invoice_number
				.catch ->

			it 'should not be able to download any invoice', ->
				m.chai.expect(@firstInvoiceNumber).to.be.a('undefined')
				promise = balena.models.billing.downloadInvoice('anyinvoicenumber')
				m.chai.expect(promise).to.be.rejected

			it 'should throw when an invoice number is not provided', ->
				promise = balena.models.billing.downloadInvoice()
				m.chai.expect(promise).to.be.rejected

			it 'should throw when an empty string invoice number is provided', ->
				promise = balena.models.billing.downloadInvoice('')
				m.chai.expect(promise).to.be.rejected

			it 'should throw when trying to retrieve an non-existing invoice', ->
				promise = balena.models.billing.downloadInvoice('notfound')
				m.chai.expect(promise).to.be.rejected

			it 'should not return an invoice of a different user', ->
				promise = balena.models.billing.downloadInvoice('1000')
				m.chai.expect(promise).to.be.rejected

	describe 'Paid Account', ->

		hasActiveBillingAccount = false

		givenABillingAccountIt = (description, testFn) ->
			it description, ->
				if not hasActiveBillingAccount
					return this.skip()
				testFn.apply(this, arguments)

		before ->
			loginPaidUser().then ->
				balena.models.billing.getAccount()
			.then (accountInfo) ->
				hasActiveBillingAccount = accountInfo?.account_state == 'active'
			.catch ->

		describe 'balena.models.billing.getAccount()', ->
			givenABillingAccountIt 'should return a paid tier billing account info object', ->
				promise = balena.models.billing.getAccount()
				m.chai.expect(promise).to.become({
					account_state: 'active'
					address:
						address1: 'One London Wall'
						address2: '6th Floor'
						city: 'London'
						country: 'GB'
						phone: '6970000000'
						state: 'Greater London'
						zip: 'EC2Y 5EB'
					cc_emails: 'testdev-cc@nomail.com'
					company_name: 'Resin.io'
					first_name: 'John'
					last_name: 'Doe'
					vat_number: ''
				})

		describe 'balena.models.billing.getPlan()', ->
			givenABillingAccountIt 'should return a paid tier billing plan object', ->
				balena.models.billing.getPlan()
				.then (plan) ->
					m.chai.expect(plan).to.deep.match
						title: 'Team member'
						name: 'Team member plan'
						code: 'free'
						tier: 'free'
						addOns: []
						addonPlan:
							addOns: []
							billing:
								charges: []
								currency: 'USD'
								totalCostCents: '0'
							code: 'addons'
							currentPeriodEndDate: ''
							uuid: ''
						billing:
							currency: 'USD'
							charges: [
								{
									itemType: 'plan'
									name: 'Team member plan'
									code: 'free'
									unitCostCents: '0'
									quantity: '1'
								}
								{
									itemType: 'support'
									name: 'Standard support'
									code: 'core'
									unitCostCents: '0'
									quantity: '1'
								}
							]
							totalCostCents: '0'
						support:
							title: 'Standard'
							name: 'Standard support'

					m.chai.expect(plan).to.have.property('currentPeriodEndDate').that.is.a('string')

		describe 'balena.models.billing.getBillingInfo()', ->
			givenABillingAccountIt 'should return a billing info object', ->
				balena.models.billing.getBillingInfo()
				.then (billingInfo) ->
					m.chai.expect(billingInfo).to.not.be.null
					# this is for local tests
					if billingInfo.card_type == 'Visa'
						m.chai.expect(billingInfo).to.deep.equal({
							first_name: 'John'
							last_name: 'Doe'
							company: 'Resin.io'
							vat_number: 'GBUK00000000000'
							address1: 'One London Wall'
							address2: '6th floor'
							city: 'London'
							state: 'Greater London'
							zip: 'EC2Y 5EB'
							country: 'GB'
							phone: '6970000000'
							card_type: 'Visa'
							last_four: '1111'
							type: 'credit_card'
							first_one: '4'
							year: '2018'
							month: '8'
							full_name: 'John Doe'
						})
					else
						m.chai.expect(billingInfo).to.deep.equal({})

		describe 'balena.models.billing.getInvoices()', ->
			givenABillingAccountIt 'should return an array of invoice objects', ->
				balena.models.billing.getInvoices()
				.then (invoices) ->
					m.chai.expect(_.isArray(invoices)).to.be.true
					m.chai.expect(invoices.length).to.not.equal(0)

					invoice = invoices[0]
					m.chai.expect(invoice).to.have.property('closed_at').that.is.a('string')
					m.chai.expect(invoice).to.have.property('created_at').that.is.a('string')
					m.chai.expect(invoice).to.have.property('due_on').that.is.a('string')
					m.chai.expect(invoice).to.have.property('invoice_number').that.is.a('string')
					m.chai.expect(invoice).to.have.property('uuid').that.is.a('string')

					m.chai.expect(invoice).to.have.property('currency', 'USD')
					m.chai.expect(invoice).to.have.property('total_in_cents', '0')
					m.chai.expect(invoice).to.have.property('subtotal_in_cents', '0')
					m.chai.expect(invoice).to.have.property('state', 'paid')

		describe 'balena.models.billing.downloadInvoice()', ->
			before ->
				balena.models.billing.getInvoices()
				.then (invoices) =>
					@firstInvoiceNumber = invoices[0]?.invoice_number
				.catch ->

			if IS_BROWSER
				givenABillingAccountIt 'should be able to download an invoice on the browser', ->
					balena.models.billing.downloadInvoice(@firstInvoiceNumber)
					.then (result) ->
						m.chai.expect(result).to.be.an.instanceof(Blob)
						m.chai.expect(result.size).to.not.equal(0)
						m.chai.expect(result.type).to.equal('application/pdf')

			if not IS_BROWSER
				rindle = require('rindle')
				tmp = require('tmp')
				fs = Promise.promisifyAll(require('fs'))

				givenABillingAccountIt 'should be able to download an invoice on node', ->
					balena.models.billing.downloadInvoice(@firstInvoiceNumber)
					.then (stream) ->
						m.chai.expect(stream.mime).to.equal('application/pdf')

						tmpFile = tmp.tmpNameSync()
						rindle.wait(stream.pipe(fs.createWriteStream(tmpFile)))
						.then ->
							fs.statAsync(tmpFile)
						.then (stat) ->
							m.chai.expect(stat.size).to.not.equal(0)
						.finally ->
							fs.unlinkAsync(tmpFile)
