/*
Copyright 2016 Balena

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import type { BalenaRequestStreamResult } from 'balena-request';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';

export interface BillingAccountAddressInfo {
	address1: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	phone: string;
}

export interface BillingAccountInfo {
	account_state: string;
	first_name: string;
	last_name: string;
	company_name: string;
	email: string;
	cc_emails: string;
	vat_number: string;
	address: BillingAccountAddressInfo;
}

export type BillingInfoType =
	| 'bank_account'
	| 'credit_card'
	| 'paypal'
	| 'card'
	| 'link'
	| 'cashapp'
	| 'sepa_debit'
	| 'us_bank_account';

export interface BillingInfo {
	full_name: string;

	first_name: string;
	last_name: string;
	company: string;
	vat_number: string;
	address1: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	phone: string;

	type?: BillingInfoType;
}

export interface CardBillingInfo extends BillingInfo {
	card_type: string;
	year: string;
	month: string;
	first_one: string;
	last_four: string;
}

export interface BankAccountBillingInfo extends BillingInfo {
	account_type: string;
	last_four: string;
	name_on_account: string;
	routing_number: string;
}

export interface TokenBillingSubmitInfo {
	token_id: string;
	'g-recaptcha-response'?: string;
	token_type?: 'payment_method' | 'setup_intent';
}

export interface BillingPlanInfo {
	name: string;
	title: string;
	code: string;
	tier: string;
	currentPeriodEndDate?: string;
	intervalUnit?: string;
	intervalLength?: string;
	addonPlan?: BillingAddonPlanInfo;
	billing: BillingPlanBillingInfo;
	support: {
		name: string;
		title: string;
	};
}

export interface BillingAddonPlanInfo {
	code: string;
	currentPeriodEndDate?: string;
	billing: BillingPlanBillingInfo;

	addOns: Array<{
		code: string;
		unitCostCents?: string;
		quantity?: string;
	}>;
}

export interface BillingPlanBillingInfo {
	currency: string;
	totalCostCents: string;

	charges: Array<{
		itemType: string;
		name: string;
		code: string;
		unitCostCents: string;
		quantity: string;
		isQuantifiable?: boolean;
	}>;
}

type BillingV1InvoiceState =
	| 'pending'
	| 'paid'
	| 'failed'
	| 'past_due'
	| 'open'
	| 'closed'
	| 'voided'
	| 'processing';
type BillingV2InvoiceState =
	| 'draft'
	| 'open'
	| 'paid'
	| 'uncollectible'
	| 'void';

export interface InvoiceInfo {
	closed_at: string;
	created_at: string;
	due_on: string;
	currency: string;
	invoice_number: string;
	subtotal_in_cents: string;
	total_in_cents: string;
	uuid: string;
	state: BillingV1InvoiceState | BillingV2InvoiceState;
}

export interface PlanChangeOptions {
	tier: string;
	cycle: 'monthly' | 'annual';
	planChangeReason?: string;
}

const getBillingModel = function (
	{
		request,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	}: InjectedDependenciesParam,
	{ apiUrl, isBrowser }: InjectedOptionsParam,
) {
	const getOrgId = async (organization: string | number): Promise<number> => {
		const { id } = await sdkInstance.models.organization.get(organization, {
			$select: 'id',
		});
		return id;
	};

	const exports = {
		/**
		 * @summary Get the user's billing account
		 * @name getAccount
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 *
		 * @fulfil {Object} - billing account
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.getAccount(orgId).then(function(billingAccount) {
		 * 	console.log(billingAccount);
		 * });
		 */

		getAccount: async (
			organization: string | number,
		): Promise<BillingAccountInfo> => {
			const orgId = await getOrgId(organization);
			const { body } = await request.send({
				method: 'GET',
				url: `/billing/v1/account/${orgId}`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Get the current billing plan
		 * @name getPlan
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @fulfil {Object} - billing plan
		 * @returns {Promise}
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 *
		 * @example
		 * balena.models.billing.getPlan(orgId).then(function(billingPlan) {
		 * 	console.log(billingPlan);
		 * });
		 */
		getPlan: async (
			organization: string | number,
		): Promise<BillingPlanInfo> => {
			const orgId = await getOrgId(organization);

			const { body } = await request.send({
				method: 'GET',
				url: `/billing/v1/account/${orgId}/plan`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Get the current billing information
		 * @name getBillingInfo
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 *
		 * @fulfil {Object} - billing information
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.getBillingInfo(orgId).then(function(billingInfo) {
		 * 	console.log(billingInfo);
		 * });
		 */
		getBillingInfo: async (
			organization: string | number,
		): Promise<BillingInfo> => {
			const orgId = await getOrgId(organization);

			const { body } = await request.send({
				method: 'GET',
				url: `/billing/v1/account/${orgId}/info`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Create a Stripe setup intent required for setting billing information
		 * @name createSetupIntent
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {Object} setupIntentParams - an object containing the parameters for the setup intent creation
		 * @param {(String|Number)} extraParams.organization - handle (string) or id (number) of the target organization.
		 * @param {(String|undefined)} [extraParams.'g-recaptcha-response'] - the captcha response
		 *
		 * @fulfil {Object} - partial stripe setup intent object
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.createSetupIntent(orgId).then(function(setupIntent) {
		 * 	console.log(setupIntent);
		 * });
		 */
		createSetupIntent: async ({
			organization,
			...extraParams
		}: {
			organization: string | number;
			'g-recaptcha-response'?: string;
		}): Promise<{
			id: string;
			client_secret: string;
		}> => {
			const orgId = await getOrgId(organization);

			const { body } = await request.send({
				method: 'POST',
				url: `/billing/v1/account/${orgId}/setup-intent`,
				baseUrl: apiUrl,
				body: extraParams,
			});
			return body;
		},

		/**
		 * @summary Update the current billing information
		 * @name updateBillingInfo
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 * @param {Object} billingInfo - an object containing a billing info token_id
		 *
		 * @param {String} billingInfo.token_id - the token id generated for the billing info form
		 * @param {(String|undefined)} [billingInfo.'g-recaptcha-response'] - the captcha response
		 * @param {(String|undefined)} [billingInfo.token_type] - token type
		 * @fulfil {Object} - billing information
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.updateBillingInfo(orgId, { token_id: 'xxxxxxx' }).then(function(billingInfo) {
		 * 	console.log(billingInfo);
		 * });
		 */
		updateBillingInfo: async (
			organization: string | number,
			billingInfo: TokenBillingSubmitInfo,
		): Promise<BillingInfo> => {
			const orgId = await getOrgId(organization);

			const { body } = await request.send({
				method: 'PATCH',
				url: `/billing/v1/account/${orgId}/info`,
				baseUrl: apiUrl,
				body: billingInfo,
			});
			return body;
		},

		/**
		 * @summary Remove an organization's billing information
		 * @name removeBillingInfo
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.removeBillingInfo(orgId).then(function() {
		 * 	console.log("Success");
		 * });
		 */
		removeBillingInfo: async (
			organization: string | number,
		): Promise<BillingInfo> => {
			const orgId = await getOrgId(organization);

			const { body } = await request.send({
				method: 'DELETE',
				url: `/billing/v1/account/${orgId}/info`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Update the current billing account information
		 * @name updateAccountInfo
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 * @param {Partial<Pick<BillingAccountInfo, 'email' | 'cc_emails'>>} accountInfo - an object containing billing account info
		 *
		 * @example
		 * balena.models.billing.updateAccountInfo(orgId, { email: 'hello@balena.io' })
		 *
		 * @example
		 * balena.models.billing.updateAccountInfo(orgId, { email: 'hello@balena.io' })
		 */
		updateAccountInfo: async (
			organization: string | number,
			accountInfo: Partial<Pick<BillingAccountInfo, 'email' | 'cc_emails'>>,
		): Promise<void> => {
			const orgId = await getOrgId(organization);

			await request.send({
				method: 'PATCH',
				url: `/billing/v1/account/${orgId}`,
				baseUrl: apiUrl,
				body: accountInfo,
			});
		},

		/**
		 * @summary Change the current billing plan
		 * @name changePlan
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 * @param {Object} planChangeOptions - an object containing the billing plan change options
		 *
		 * @param {String} billingInfo.tier - the code of the target billing plan
		 * @param {String} billingInfo.cycle - the billing cycle
		 * @param {String} [billingInfo.planChangeReason] - the reason for changing the current plan
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.changePlan(orgId, { billingCode: 'prototype-v2', cycle: 'annual' }).then(function() {
		 * 	console.log('Plan changed!');
		 * });
		 */
		changePlan: async (
			organization: string | number,
			{ cycle, ...restPlanChangeOptions }: PlanChangeOptions,
		): Promise<void> => {
			const orgId = await getOrgId(organization);

			await request.send({
				method: 'PATCH',
				url: `/billing/v1/account/${orgId}/plan`,
				baseUrl: apiUrl,
				body: {
					annual: cycle === 'annual',
					...restPlanChangeOptions,
				},
			});
		},

		/**
		 * @summary Get the available invoices
		 * @name getInvoices
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 *
		 * @fulfil {Object} - invoices
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.billing.getInvoices(orgId).then(function(invoices) {
		 * 	console.log(invoices);
		 * });
		 */
		getInvoices: async (
			organization: string | number,
		): Promise<InvoiceInfo[]> => {
			const orgId = await getOrgId(organization);
			const { body } = await request.send({
				method: 'GET',
				url: `/billing/v1/account/${orgId}/invoices`,
				baseUrl: apiUrl,
			});
			return body;
		},

		/**
		 * @summary Download a specific invoice
		 * @name downloadInvoice
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} organization - handle (string) or id (number) of the target organization.
		 * @param {String} - an invoice number
		 *
		 * @fulfil {Blob|ReadableStream} - blob on the browser, download stream on node
		 * @returns {Promise}
		 *
		 * @example
		 * # Browser
		 * balena.models.billing.downloadInvoice(orgId, '0000').then(function(blob) {
		 * 	console.log(blob);
		 * });
		 * # Node
		 * balena.models.billing.downloadInvoice(orgId, '0000').then(function(stream) {
		 * 	stream.pipe(fs.createWriteStream('foo/bar/invoice-0000.pdf'));
		 * });
		 */
		async downloadInvoice(
			organization: string | number,
			invoiceNumber: string,
		): Promise<Blob | BalenaRequestStreamResult> {
			const orgId = await getOrgId(organization);
			const url = `/billing/v1/account/${orgId}/invoices/${invoiceNumber}/download`;

			if (!isBrowser) {
				return request.stream({
					method: 'GET',
					url,
					baseUrl: apiUrl,
				});
			}

			const { body } = await request.send({
				method: 'GET',
				url,
				baseUrl: apiUrl,
				responseFormat: 'blob',
			});
			return body;
		},
	};

	return exports;
};

export default getBillingModel;
