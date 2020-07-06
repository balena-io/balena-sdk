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

import * as Bluebird from 'bluebird';
import once = require('lodash/once');
import type { BalenaRequestStreamResult } from '../../typings/balena-request';
import type {
	BillingAccountInfo,
	BillingInfo,
	BillingPlanInfo,
	Organization,
	InvoiceInfo,
	TokenBillingSubmitInfo,
} from '../..';
import { InjectedDependenciesParam, InjectedOptionsParam } from '..';

const getBillingModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { request } = deps;
	const { apiUrl, isBrowser } = opts;

	const organizationModel = once(() =>
		(require('./organization') as typeof import('./organization')).default(
			deps,
		),
	);

	const exports = {
		/**
		 * @summary Get the user's billing account
		 * @name getAccount
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} [organization] - handle (string) or id (number) of the target organization.
		 * Not specifying an organization is deprecated and will be dropped in a future release.
		 *
		 * @fulfil {Object} - billing account
		 * @returns {Bluebird}
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

		getAccount: (
			organization?: string | number,
		): Bluebird<BillingAccountInfo> =>
			Bluebird.try(() => {
				if (organization == null) {
					return '/user/billing/account';
				}

				return organizationModel()
					.get(organization, { $select: 'id' })
					.then(
						({ id }: Pick<Organization, 'id'>) => `/billing/v1/account/${id}`,
					);
			})
				.then((url) =>
					request.send({
						method: 'GET',
						url,
						baseUrl: apiUrl,
					}),
				)
				.then(({ body }) => body),

		/**
		 * @summary Get the current billing plan
		 * @name getPlan
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @fulfil {Object} - billing plan
		 * @returns {Bluebird}
		 *
		 * @param {(String|Number)} [organization] - handle (string) or id (number) of the target organization.
		 * Not specifying an organization is deprecated and will be dropped in a future release.
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
		getPlan: (organization?: string | number): Bluebird<BillingPlanInfo> =>
			Bluebird.try(() => {
				if (organization == null) {
					return '/user/billing/plan';
				}

				return organizationModel()
					.get(organization, { $select: 'id' })
					.then(
						({ id }: Pick<Organization, 'id'>) =>
							`/billing/v1/account/${id}/plan`,
					);
			})
				.then((url) =>
					request.send({
						method: 'GET',
						url,
						baseUrl: apiUrl,
					}),
				)
				.then(({ body }) => body),

		/**
		 * @summary Get the current billing information
		 * @name getBillingInfo
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} [organization] - handle (string) or id (number) of the target organization.
		 * Not specifying an organization is deprecated and will be dropped in a future release.
		 *
		 * @fulfil {Object} - billing information
		 * @returns {Bluebird}
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
		getBillingInfo: (organization?: string | number): Bluebird<BillingInfo> =>
			Bluebird.try(() => {
				if (organization == null) {
					return '/user/billing/info';
				}

				return organizationModel()
					.get(organization, { $select: 'id' })
					.then(
						({ id }: Pick<Organization, 'id'>) =>
							`/billing/v1/account/${id}/info`,
					);
			})
				.then((url) =>
					request.send({
						method: 'GET',
						url,
						baseUrl: apiUrl,
					}),
				)
				.then(({ body }) => body),

		/**
		 * @summary Update the current billing information
		 * @name updateBillingInfo
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {Object} billingInfo - an object containing a billing info token_id
		 * @param {(String|Number)} [organization] - handle (string) or id (number) of the target organization.
		 * Not specifying an organization is deprecated and will be dropped in a future release.
		 *
		 * @param {String} billingInfo.token_id - the token id generated for the billing info form
		 * @param {(String|undefined)} [billingInfo.'g-recaptcha-response'] - the captcha response
		 * @fulfil {Object} - billing information
		 * @returns {Bluebird}
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
		updateBillingInfo: (
			billingInfo: TokenBillingSubmitInfo,
			organization?: string | number,
		): Bluebird<BillingInfo> => {
			if (organization == null) {
				return request
					.send({
						method: 'POST',
						url: '/user/billing/info',
						baseUrl: apiUrl,
						body: billingInfo,
					})
					.then(({ body }) => body);
			}

			return organizationModel()
				.get(organization, { $select: 'id' })
				.then(
					({ id }: Pick<Organization, 'id'>) =>
						`/billing/v1/account/${id}/info`,
				)
				.then((url) =>
					request.send({
						method: 'PATCH',
						url,
						baseUrl: apiUrl,
						body: billingInfo,
					}),
				)
				.then(({ body }) => body);
		},

		/**
		 * @summary Get the available invoices
		 * @name getInvoices
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {(String|Number)} [organization] - handle (string) or id (number) of the target organization.
		 * Not specifying an organization is deprecated and will be dropped in a future release.
		 *
		 * @fulfil {Object} - invoices
		 * @returns {Bluebird}
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
		getInvoices: (organization?: string | number): Bluebird<InvoiceInfo[]> =>
			Bluebird.try(() => {
				if (organization == null) {
					return '/user/billing/invoices';
				}

				return organizationModel()
					.get(organization, { $select: 'id' })
					.then(
						({ id }: Pick<Organization, 'id'>) =>
							`/billing/v1/account/${id}/invoices`,
					);
			})
				.then((url) =>
					request.send({
						method: 'GET',
						url,
						baseUrl: apiUrl,
					}),
				)
				.then(({ body }) => body),

		/**
		 * @summary Download a specific invoice
		 * @name downloadInvoice
		 * @public
		 * @function
		 * @memberof balena.models.billing
		 *
		 * @param {String} - an invoice number
		 * @param {(String|Number)} [organization] - handle (string) or id (number) of the target organization.
		 * Not specifying an organization is deprecated and will be dropped in a future release.
		 *
		 * @fulfil {Blob|ReadableStream} - blob on the browser, download stream on node
		 * @returns {Bluebird}
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
		downloadInvoice(
			invoiceNumber: string,
			organization?: string | number,
		): Bluebird<Blob | BalenaRequestStreamResult> {
			return Bluebird.try(() => {
				if (organization == null) {
					return '`/user/billing/invoices/${invoiceNumber}/download`';
				}

				return organizationModel()
					.get(organization, { $select: 'id' })
					.then(
						({ id }: Pick<Organization, 'id'>) =>
							`/billing/v1/account/${id}/invoices/${invoiceNumber}/download`,
					);
			}).then((url) => {
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
					.then(({ body }) => body);
			});
		},
	};

	return exports;
};

export default getBillingModel;
