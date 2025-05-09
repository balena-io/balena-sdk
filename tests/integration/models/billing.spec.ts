import type * as _fs from 'fs';
// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import {
	balena,
	givenLoggedInUser,
	givenInitialOrganization,
	IS_BROWSER,
	loginPaidUser,
} from '../setup';
import { expectError, timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';

describe('Billing Model', function () {
	timeSuite(before);
	describe('Free Account', function () {
		givenLoggedInUser(before);
		givenInitialOrganization(before);

		describe('balena.models.billing.getAccount()', function () {
			it('should not return a billing account info object', async function () {
				await expectError(
					async () => {
						await balena.models.billing.getAccount(this.initialOrg.id);
					},
					(error) => {
						expect(error).to.have.property('code', 'BalenaRequestError');
						expect(error).to.have.property('statusCode', 404);
						expect(error)
							.to.have.property('message')
							.that.contains('Billing Account was not found.');
					},
				);
			});
		});

		describe('balena.models.billing.getPlan()', function () {
			it('should return a free tier billing plan object', async function () {
				const plan = await balena.models.billing.getPlan(this.initialOrg.id);
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
				});
			});
		});

		describe('balena.models.billing.getBillingInfo()', function () {
			it('should return a free tier billing info object', async function () {
				expect(
					await balena.models.billing.getBillingInfo(this.initialOrg.id),
				).to.deep.equal({});
			});
		});

		describe('balena.models.billing.updateBillingInfo()', function () {
			it('should throw when no parameters are provided', async function () {
				await expectError(
					async () => {
						await (balena.models.billing.updateBillingInfo as any)();
					},
					(error) => {
						expect(error).to.have.property(
							'code',
							'BalenaInvalidParameterError',
						);
					},
				);
			});

			it('should throw when no billing info parameter is provided', async function () {
				await expectError(
					async () => {
						await (balena.models.billing.updateBillingInfo as any)(
							this.initialOrg.id,
						);
					},
					(error) => {
						expect(error).to.have.property('statusCode', 400);
					},
				);
			});

			it('should throw when an empty parameter object is provided', async function () {
				await expectError(
					async () => {
						await balena.models.billing.updateBillingInfo(
							this.initialOrg.id,
							{} as any,
						);
					},
					(error) => {
						expect(error).to.have.property('statusCode', 400);
					},
				);
			});

			it('should throw when the token_id is empty', async function () {
				await expectError(
					async () => {
						await balena.models.billing.updateBillingInfo(this.initialOrg.id, {
							token_id: '',
						});
					},
					(error) => {
						expect(error).to.have.property('statusCode', 400);
					},
				);
			});
		});

		describe('balena.models.billing.getInvoices()', function () {
			it('should return no invoices', async function () {
				const result = await balena.models.billing.getInvoices(
					this.initialOrg.id,
				);
				expect(result).to.deep.equal([]);
			});
		});

		describe('balena.models.billing.downloadInvoice()', function () {
			before(function () {
				return balena.models.billing
					.getInvoices(this.initialOrg.id)
					.then((invoices) => {
						this.firstInvoiceNumber = invoices[0]?.invoice_number;
					})
					.catch(_.noop);
			});

			it('should not be able to download any invoice', async function () {
				expect(this.firstInvoiceNumber).to.be.a('undefined');
				await expectError(async () => {
					await balena.models.billing.downloadInvoice(
						this.initialOrg.id,
						'anyinvoicenumber',
					);
				});
			});

			it('should throw when an invoice number is not provided', async function () {
				await expectError(async () => {
					await (balena.models.billing.downloadInvoice as any)();
				});
			});

			it('should throw when an empty string invoice number is provided', async function () {
				await expectError(async () => {
					await balena.models.billing.downloadInvoice(this.initialOrg.id, '');
				});
			});

			it('should throw when trying to retrieve an non-existing invoice', async function () {
				await expectError(async () => {
					await balena.models.billing.downloadInvoice(
						this.initialOrg.id,
						'notfound',
					);
				});
			});

			it('should not return an invoice of a different user', async function () {
				await expectError(async () => {
					await balena.models.billing.downloadInvoice(
						this.initialOrg.id,
						'1000',
					);
				});
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

		before(function () {
			return loginPaidUser()
				.then(() => balena.models.billing.getAccount(this.initialOrg.id))
				.then((accountInfo) => {
					hasActiveBillingAccount =
						(accountInfo != null ? accountInfo.account_state : undefined) ===
						'active';
				})
				.catch(_.noop);
		});

		givenInitialOrganization(before);

		describe('balena.models.billing.getAccount()', function () {
			givenABillingAccountIt(
				'should return a paid tier billing account info object',
				async function () {
					expect(
						await balena.models.billing.getAccount(this.initialOrg.id),
					).to.deep.equal({
						email: 'testdev@nomail.com',
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
						company_name: 'Resin.io',
						tax_id: {
							type: 'al_tin',
							value: 'J12345678N',
						},
					});
				},
			);
		});

		describe('balena.models.billing.updateAccountInfo()', function () {
			givenABillingAccountIt(
				'should throw when no parameters are provided',
				async function () {
					await expectError(
						async () => {
							await (balena.models.billing.updateAccountInfo as any)();
						},
						(error) => {
							expect(error).to.have.property(
								'code',
								'BalenaInvalidParameterError',
							);
						},
					);
				},
			);

			givenABillingAccountIt(
				'should throw when no billing account info parameter is provided',
				async function () {
					await expectError(
						async () => {
							await (balena.models.billing.updateAccountInfo as any)(
								this.initialOrg.id,
							);
						},
						(error) => {
							expect(error).to.have.property('statusCode', 400);
						},
					);
				},
			);

			givenABillingAccountIt(
				'should throw when the email in the billing account info parameter is not a valid email',
				async function () {
					await expectError(
						async () => {
							await balena.models.billing.updateAccountInfo(
								this.initialOrg.id,
								{
									email: '',
								},
							);
						},
						(error) => {
							expect(error).to.have.property('statusCode', 400);
						},
					);
				},
			);

			givenABillingAccountIt(
				'should successfully update billing email',
				async function () {
					const email = 'hello@balena.io';
					await balena.models.billing.updateAccountInfo(this.initialOrg.id, {
						email,
					});
					const updatedAccountInfo = await balena.models.billing.getAccount(
						this.initialOrg.id,
					);
					expect(updatedAccountInfo).to.have.property('email', email);
				},
			);
		});

		describe('balena.models.billing.getPlan()', function () {
			givenABillingAccountIt(
				'should return a paid tier billing plan object',
				function () {
					return balena.models.billing
						.getPlan(this.initialOrg.id)
						.then(function (plan) {
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
						});
				},
			);
		});

		describe('balena.models.billing.getBillingInfo()', function () {
			givenABillingAccountIt(
				'should return a billing info object',
				function () {
					return balena.models.billing
						.getBillingInfo(this.initialOrg.id)
						.then(function (billingInfo) {
							expect(billingInfo).to.not.be.null;
							// this is for local tests
							if (
								(billingInfo as BalenaSdk.CardBillingInfo).card_type === 'Visa'
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
						});
				},
			);
		});

		describe('balena.models.billing.getInvoices()', function () {
			givenABillingAccountIt(
				'should return an array of invoice objects',
				function () {
					return balena.models.billing
						.getInvoices(this.initialOrg.id)
						.then(function (invoices) {
							expect(Array.isArray(invoices)).to.be.true;
							expect(invoices.length).to.not.equal(0);

							const invoice = invoices[0];
							expect(invoice).to.have.property('closed_at').that.is.a('string');
							expect(invoice)
								.to.have.property('created_at')
								.that.is.a('string');
							expect(invoice).to.have.property('due_on').that.is.a('string');
							expect(invoice)
								.to.have.property('invoice_number')
								.that.is.a('string');
							expect(invoice).to.have.property('uuid').that.is.a('string');

							expect(invoice).to.have.property('currency', 'USD');
							expect(invoice).to.have.property('total_in_cents', '0');
							expect(invoice).to.have.property('subtotal_in_cents', '0');
							expect(invoice).to.have.property('state', 'paid');
						});
				},
			);
		});

		describe('balena.models.billing.downloadInvoice()', function () {
			before(function () {
				return balena.models.billing
					.getInvoices(this.initialOrg.id)
					.then((invoices) => {
						this.firstInvoiceNumber = invoices[0]?.invoice_number;
					})
					.catch(_.noop);
			});

			if (IS_BROWSER) {
				givenABillingAccountIt(
					'should be able to download an invoice on the browser',
					function () {
						return balena.models.billing
							.downloadInvoice(this.firstInvoiceNumber, this.initialOrg.id)
							.then(function (result) {
								expect(result).to.be.an.instanceof(Blob);
								const resultBlob = result as Blob;
								expect(resultBlob.size).to.not.equal(0);
								expect(resultBlob.type).to.equal('application/pdf');
							});
					},
				);
			} else {
				/* eslint-disable @typescript-eslint/no-require-imports */
				const rindle = require('rindle');
				const tmp = require('tmp');
				const fs = require('fs') as typeof _fs;
				/* eslint-enable @typescript-eslint/no-require-imports */

				givenABillingAccountIt(
					'should be able to download an invoice on node',
					function () {
						return balena.models.billing
							.downloadInvoice(this.initialOrg.id, this.firstInvoiceNumber)
							.then(function (result) {
								const stream = result as Exclude<typeof result, Blob>;
								expect(stream.mime).to.equal('application/pdf');

								const tmpFile = tmp.tmpNameSync();
								return rindle
									.wait(stream.pipe(fs.createWriteStream(tmpFile)))
									.then(() => fs.promises.stat(tmpFile))
									.then((stat: _fs.Stats) => expect(stat.size).to.not.equal(0))
									.finally(() => fs.promises.unlink(tmpFile));
							});
					},
				);
			}
		});
	});
});
