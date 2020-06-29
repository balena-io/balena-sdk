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

import * as Promise from 'bluebird';
import { BalenaRequestStreamResult } from '../../typings/balena-request';
import {
	BillingAccountInfo,
	BillingInfo,
	BillingPlanInfo,
	InvoiceInfo,
	TokenBillingSubmitInfo,
} from '../../typings/balena-sdk';
import { InjectedDependenciesParam, InjectedOptionsParam } from '..';

const getBillingModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { request } = deps;
	const { apiUrl, isBrowser } = opts;

	exports = {};
	/**
	 * @summary Get the user's billing account
	 * @name getAccount
	 * @public
	 * @function
	 * @memberof balena.models.billing
	 *
	 * @fulfil {Object} - billing account
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.billing.getAccount().then(function(billingAccount) {
	 * 	console.log(billingAccount);
	 * });
	 *
	 * @example
	 * balena.models.billing.getAccount(function(error, billingAccount) {
	 * 	if (error) throw error;
	 * 	console.log(billingAccount);
	 * });
	 */
	exports.getAccount = (): Promise<BillingAccountInfo> =>
		request
			.send({
				method: 'GET',
				url: '/user/billing/account',
				baseUrl: apiUrl,
			})
			.get('body');

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
	 * @example
	 * balena.models.billing.getPlan().then(function(billingPlan) {
	 * 	console.log(billingPlan);
	 * });
	 *
	 * @example
	 * balena.models.billing.getPlan(function(error, billingPlan) {
	 * 	if (error) throw error;
	 * 	console.log(billingPlan);
	 * });
	 */
	exports.getPlan = (): Promise<BillingPlanInfo> =>
		request
			.send({
				method: 'GET',
				url: '/user/billing/plan',
				baseUrl: apiUrl,
			})
			.get('body');

	/**
	 * @summary Get the current billing information
	 * @name getBillingInfo
	 * @public
	 * @function
	 * @memberof balena.models.billing
	 *
	 * @fulfil {Object} - billing information
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.billing.getBillingInfo().then(function(billingInfo) {
	 * 	console.log(billingInfo);
	 * });
	 *
	 * @example
	 * balena.models.billing.getBillingInfo(function(error, billingInfo) {
	 * 	if (error) throw error;
	 * 	console.log(billingInfo);
	 * });
	 */
	exports.getBillingInfo = (): Promise<BillingInfo> =>
		request
			.send({
				method: 'GET',
				url: '/user/billing/info',
				baseUrl: apiUrl,
			})
			.get('body');

	/**
	 * @summary Update the current billing information
	 * @name updateBillingInfo
	 * @public
	 * @function
	 * @memberof balena.models.billing
	 *
	 * @param {Object} billingInfo - an object containing a billing info token_id
	 * @param {String} billingInfo.token_id - the token id generated for the billing info form
	 * @param {(String|undefined)} [billingInfo.'g-recaptcha-response'] - the captcha response
	 * @fulfil {Object} - billing information
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.billing.updateBillingInfo({ token_id: 'xxxxxxx' }).then(function(billingInfo) {
	 * 	console.log(billingInfo);
	 * });
	 *
	 * @example
	 * balena.models.billing.updateBillingInfo({ token_id: 'xxxxxxx' }, function(error, billingInfo) {
	 * 	if (error) throw error;
	 * 	console.log(billingInfo);
	 * });
	 */
	exports.updateBillingInfo = (
		billingInfo: TokenBillingSubmitInfo,
	): Promise<BillingInfo> =>
		request
			.send({
				method: 'POST',
				url: '/user/billing/info',
				baseUrl: apiUrl,
				body: billingInfo,
			})
			.get('body');

	/**
	 * @summary Get the available invoices
	 * @name getInvoices
	 * @public
	 * @function
	 * @memberof balena.models.billing
	 *
	 * @fulfil {Object} - invoices
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.billing.getInvoices().then(function(invoices) {
	 * 	console.log(invoices);
	 * });
	 *
	 * @example
	 * balena.models.billing.getInvoices(function(error, invoices) {
	 * 	if (error) throw error;
	 * 	console.log(invoices);
	 * });
	 */
	exports.getInvoices = (): Promise<InvoiceInfo[]> =>
		request
			.send({
				method: 'GET',
				url: '/user/billing/invoices',
				baseUrl: apiUrl,
			})
			.get('body');

	/**
	 * @summary Download a specific invoice
	 * @name downloadInvoice
	 * @public
	 * @function
	 * @memberof balena.models.billing
	 *
	 * @param {String} - an invoice number
	 * @fulfil {Blob|ReadableStream} - blob on the browser, download stream on node
	 * @returns {Promise}
	 *
	 * @example
	 * # Browser
	 * balena.models.billing.downloadInvoice('0000').then(function(blob) {
	 * 	console.log(blob);
	 * });
	 * # Node
	 * balena.models.billing.downloadInvoice('0000').then(function(stream) {
	 * 	stream.pipe(fs.createWriteStream('foo/bar/invoice-0000.pdf'));
	 * });
	 */
	exports.downloadInvoice = function (
		invoiceNumber: string,
	): Promise<Blob | BalenaRequestStreamResult> {
		const url = `/user/billing/invoices/${invoiceNumber}/download`;

		if (!isBrowser) {
			return request.stream({
				method: 'GET',
				url,
				baseUrl: apiUrl,
			});
		}

		return request
			.send({
				method: 'GET',
				url,
				baseUrl: apiUrl,
				responseFormat: 'blob',
			})
			.get('body');
	};

	return exports;
};

export default getBillingModel;
