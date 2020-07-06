import * as _fs from 'fs';
// TODO: change this to type-only import once TS 3.8 gets released
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import { balena, givenLoggedInUser, IS_BROWSER, loginPaidUser } from '../setup';
import { getInitialOrganization } from '../utils';
import type * as BalenaSdk from '../../..';
const { expect } = m.chai;

describe('Billing Model', function () {
	[
		{
			title: 'When no org param is specified',
			getOrgParam: async () => undefined,
		},
		{
			title: 'When an org param is specified',
			getOrgParam: () => getInitialOrganization().then((org) => org.id),
		},
	].forEach((testSetup) => {
		describe(testSetup.title, function () {
			describe('Free Account', function () {
				givenLoggedInUser(before);

				let orgParam;
				before(async function () {
					orgParam = await testSetup.getOrgParam();
				});

				describe('balena.models.billing.getAccount()', () =>
					it('should not return a billing account info object', function () {
						const promise = balena.models.billing.getAccount(orgParam);
						return expect(promise).to.be.rejected.then(function (error) {
							expect(error).to.have.property('code', 'BalenaRequestError');
							expect(error).to.have.property('statusCode', 404);
							expect(error)
								.to.have.property('message')
								.that.contains('Billing Account was not found.');
						});
					}));

				describe('balena.models.billing.getPlan()', () =>
					it('should return a free tier billing plan object', () =>
						balena.models.billing.getPlan(orgParam).then((plan) =>
							expect(plan).to.deep.match({
								title: 'Free',
								name: 'Free plan',
								code: 'free',
								tier: 'free',
								addOns: [],
								billing: {
									currency: 'USD',
									charges: [
										{
											itemType: 'plan',
											name: 'Free plan',
											code: 'free',
											unitCostCents: '0',
											quantity: '1',
										},
										{
											itemType: 'support',
											name: 'Community support',
											code: 'community',
											unitCostCents: '0',
											quantity: '1',
										},
									],
									totalCostCents: '0',
								},
								support: {
									title: 'Community',
									name: 'Community support',
								},
							}),
						)));

				describe('balena.models.billing.getBillingInfo()', () =>
					it('should return a free tier billing info object', function () {
						const promise = balena.models.billing.getBillingInfo(orgParam);
						return expect(promise).to.become({});
					}));

				describe('balena.models.billing.updateBillingInfo()', function () {
					it('should throw when no parameters are provided', function () {
						const promise = (balena.models.billing.updateBillingInfo as any)();
						return expect(promise).to.be.rejected.then((error) =>
							expect(error).to.have.property('statusCode', 400),
						);
					});

					it('should throw when an empty parameter object is provided', function () {
						const promise = balena.models.billing.updateBillingInfo(
							{} as any,
							orgParam,
						);
						return expect(promise).to.be.rejected.then((error) =>
							expect(error).to.have.property('statusCode', 400),
						);
					});

					it('should throw when the token_id is empty', function () {
						const promise = balena.models.billing.updateBillingInfo(
							{
								token_id: '',
							},
							orgParam,
						);
						return expect(promise).to.be.rejected.then((error) =>
							expect(error).to.have.property('statusCode', 400),
						);
					});
				});

				describe('balena.models.billing.getInvoices()', () =>
					it('should return no invoices', function () {
						const promise = balena.models.billing.getInvoices(orgParam);
						return expect(promise).to.become([]);
					}));

				describe('balena.models.billing.downloadInvoice()', function () {
					before(function () {
						return balena.models.billing
							.getInvoices(orgParam)
							.then((invoices) => {
								this.firstInvoiceNumber = invoices?.[0]?.invoice_number;
							})
							.catch(_.noop);
					});

					it('should not be able to download any invoice', function () {
						expect(this.firstInvoiceNumber).to.be.a('undefined');
						const promise = balena.models.billing.downloadInvoice(
							'anyinvoicenumber',
							orgParam,
						);
						return expect(promise).to.be.rejected;
					});

					it('should throw when an invoice number is not provided', function () {
						const promise = (balena.models.billing.downloadInvoice as any)();
						return expect(promise).to.be.rejected;
					});

					it('should throw when an empty string invoice number is provided', function () {
						const promise = balena.models.billing.downloadInvoice('', orgParam);
						return expect(promise).to.be.rejected;
					});

					it('should throw when trying to retrieve an non-existing invoice', function () {
						const promise = balena.models.billing.downloadInvoice(
							'notfound',
							orgParam,
						);
						return expect(promise).to.be.rejected;
					});

					it('should not return an invoice of a different user', function () {
						const promise = balena.models.billing.downloadInvoice(
							'1000',
							orgParam,
						);
						return expect(promise).to.be.rejected;
					});
				});
			});

			describe('Paid Account', function () {
				let hasActiveBillingAccount = false;

				const givenABillingAccountIt = (
					description: string,
					testFn: (...args: any[]) => any,
				) => {
					const $it = hasActiveBillingAccount ? it : it.skip;
					$it(description, testFn);
				};

				before(() =>
					loginPaidUser()
						.then(() => balena.models.billing.getAccount())
						.then(
							(accountInfo) =>
								(hasActiveBillingAccount =
									(accountInfo != null
										? accountInfo.account_state
										: undefined) === 'active'),
						)
						.catch(_.noop),
				);

				let orgParam;
				before(function () {
					orgParam = testSetup.getOrgParam();
				});

				describe('balena.models.billing.getAccount()', () =>
					givenABillingAccountIt(
						'should return a paid tier billing account info object',
						function () {
							const promise = balena.models.billing.getAccount(orgParam);
							return expect(promise).to.become({
								account_state: 'active',
								address: {
									address1: 'One London Wall',
									address2: '6th Floor',
									city: 'London',
									country: 'GB',
									phone: '6970000000',
									state: 'Greater London',
									zip: 'EC2Y 5EB',
								},
								cc_emails: 'testdev-cc@nomail.com',
								company_name: 'Resin.io',
								first_name: 'John',
								last_name: 'Doe',
								vat_number: '',
							});
						},
					));

				describe('balena.models.billing.getPlan()', () =>
					givenABillingAccountIt(
						'should return a paid tier billing plan object',
						() =>
							balena.models.billing.getPlan(orgParam).then(function (plan) {
								expect(plan).to.deep.match({
									title: 'Team member',
									name: 'Team member plan',
									code: 'free',
									tier: 'free',
									addOns: [],
									addonPlan: {
										addOns: [],
										billing: {
											charges: [],
											currency: 'USD',
											totalCostCents: '0',
										},
										code: 'addons',
										currentPeriodEndDate: '',
										uuid: '',
									},
									billing: {
										currency: 'USD',
										charges: [
											{
												itemType: 'plan',
												name: 'Team member plan',
												code: 'free',
												unitCostCents: '0',
												quantity: '1',
											},
											{
												itemType: 'support',
												name: 'Standard support',
												code: 'core',
												unitCostCents: '0',
												quantity: '1',
											},
										],
										totalCostCents: '0',
									},
									support: {
										title: 'Standard',
										name: 'Standard support',
									},
								});

								expect(plan)
									.to.have.property('currentPeriodEndDate')
									.that.is.a('string');
							}),
					));

				describe('balena.models.billing.getBillingInfo()', () =>
					givenABillingAccountIt('should return a billing info object', () =>
						balena.models.billing
							.getBillingInfo(orgParam)
							.then(function (billingInfo) {
								expect(billingInfo).to.not.be.null;
								// this is for local tests
								if (
									(billingInfo as BalenaSdk.CardBillingInfo).card_type ===
									'Visa'
								) {
									expect(billingInfo).to.deep.equal({
										first_name: 'John',
										last_name: 'Doe',
										company: 'Resin.io',
										vat_number: 'GBUK00000000000',
										address1: 'One London Wall',
										address2: '6th floor',
										city: 'London',
										state: 'Greater London',
										zip: 'EC2Y 5EB',
										country: 'GB',
										phone: '6970000000',
										card_type: 'Visa',
										last_four: '1111',
										type: 'credit_card',
										first_one: '4',
										year: '2018',
										month: '8',
										full_name: 'John Doe',
									});
								} else {
									expect(billingInfo).to.deep.equal({});
								}
							}),
					));

				describe('balena.models.billing.getInvoices()', () =>
					givenABillingAccountIt(
						'should return an array of invoice objects',
						() =>
							balena.models.billing
								.getInvoices(orgParam)
								.then(function (invoices) {
									expect(Array.isArray(invoices)).to.be.true;
									expect(invoices.length).to.not.equal(0);

									const invoice = invoices[0];
									expect(invoice)
										.to.have.property('closed_at')
										.that.is.a('string');
									expect(invoice)
										.to.have.property('created_at')
										.that.is.a('string');
									expect(invoice)
										.to.have.property('due_on')
										.that.is.a('string');
									expect(invoice)
										.to.have.property('invoice_number')
										.that.is.a('string');
									expect(invoice).to.have.property('uuid').that.is.a('string');

									expect(invoice).to.have.property('currency', 'USD');
									expect(invoice).to.have.property('total_in_cents', '0');
									expect(invoice).to.have.property('subtotal_in_cents', '0');
									expect(invoice).to.have.property('state', 'paid');
								}),
					));

				describe('balena.models.billing.downloadInvoice()', function () {
					before(function () {
						return balena.models.billing
							.getInvoices(orgParam)
							.then((invoices) => {
								this.firstInvoiceNumber = invoices?.[0]?.invoice_number;
							})
							.catch(_.noop);
					});

					if (IS_BROWSER) {
						givenABillingAccountIt(
							'should be able to download an invoice on the browser',
							function () {
								return balena.models.billing
									.downloadInvoice(this.firstInvoiceNumber, orgParam)
									.then(function (result: Blob) {
										expect(result).to.be.an.instanceof(Blob);
										expect(result.size).to.not.equal(0);
										expect(result.type).to.equal('application/pdf');
									});
							},
						);
					}

					if (!IS_BROWSER) {
						const rindle = require('rindle');
						const tmp = require('tmp');
						const fs = require('fs') as typeof _fs;

						return givenABillingAccountIt(
							'should be able to download an invoice on node',
							function () {
								return balena.models.billing
									.downloadInvoice(this.firstInvoiceNumber, orgParam)
									.then(function (result) {
										const stream = result as Exclude<typeof result, Blob>;
										expect(stream.mime).to.equal('application/pdf');

										const tmpFile = tmp.tmpNameSync();
										return rindle
											.wait(stream.pipe(fs.createWriteStream(tmpFile)))
											.then(() => fs.promises.stat(tmpFile))
											.then((stat: _fs.Stats) =>
												expect(stat.size).to.not.equal(0),
											)
											.finally(() => fs.promises.unlink(tmpFile));
									});
							},
						);
					}
				});
			});
		});
	});
});
