###
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

getBillingModel = (deps, opts) ->
	{ request } = deps
	{ apiUrl, isBrowser } = opts

	###*
	# @summary Get the user's billing account
	# @name getAccount
	# @public
	# @function
	# @memberof resin.models.billing
	#
	# @fulfil {Object} - billing account
	# @returns {Promise}
	#
	# @example
	# resin.models.billing.getAccount().then(function(billingAccount) {
	# 	console.log(billingAccount);
	# });
	#
	# @example
	# resin.models.billing.getAccount(function(error, billingAccount) {
	# 	if (error) throw error;
	# 	console.log(billingAccount);
	# });
	###
	exports.getAccount = (callback) ->
		request.send
			method: 'GET'
			url: '/user/billing/account'
			baseUrl: apiUrl
		.get('body')
		.asCallback(callback)

	###*
	# @summary Get the current billing plan
	# @name getPlan
	# @public
	# @function
	# @memberof resin.models.billing
	#
	# @fulfil {Object} - billing plan
	# @returns {Promise}
	#
	# @example
	# resin.models.billing.getPlan().then(function(billingPlan) {
	# 	console.log(billingPlan);
	# });
	#
	# @example
	# resin.models.billing.getPlan(function(error, billingPlan) {
	# 	if (error) throw error;
	# 	console.log(billingPlan);
	# });
	###
	exports.getPlan = (callback) ->
		request.send
			method: 'GET'
			url: '/user/billing/plan'
			baseUrl: apiUrl
		.get('body')
		.asCallback(callback)

	###*
	# @summary Get the current billing information
	# @name getBillingInfo
	# @public
	# @function
	# @memberof resin.models.billing
	#
	# @fulfil {Object} - billing information
	# @returns {Promise}
	#
	# @example
	# resin.models.billing.getBillingInfo().then(function(billingInfo) {
	# 	console.log(billingInfo);
	# });
	#
	# @example
	# resin.models.billing.getBillingInfo(function(error, billingInfo) {
	# 	if (error) throw error;
	# 	console.log(billingInfo);
	# });
	###
	exports.getBillingInfo = (callback) ->
		request.send
			method: 'GET'
			url: '/user/billing/info'
			baseUrl: apiUrl
		.get('body')
		.asCallback(callback)

	###*
	# @summary Update the current billing information
	# @name updateBillingInfo
	# @public
	# @function
	# @memberof resin.models.billing
	#
	# @param {Object} - an object containing a billing info token_id
	# @fulfil {Object} - billing information
	# @returns {Promise}
	#
	# @example
	# resin.models.billing.updateBillingInfo({ token_id: 'xxxxxxx' }).then(function(billingInfo) {
	# 	console.log(billingInfo);
	# });
	#
	# @example
	# resin.models.billing.updateBillingInfo({ token_id: 'xxxxxxx' }, function(error, billingInfo) {
	# 	if (error) throw error;
	# 	console.log(billingInfo);
	# });
	###
	exports.updateBillingInfo = (billingInfo, callback) ->
		request.send
			method: 'POST'
			url: '/user/billing/info'
			baseUrl: apiUrl
			body: billingInfo
		.get('body')
		.asCallback(callback)

	###*
	# @summary Get the available invoices
	# @name getInvoices
	# @public
	# @function
	# @memberof resin.models.billing
	#
	# @fulfil {Object} - invoices
	# @returns {Promise}
	#
	# @example
	# resin.models.billing.getInvoices().then(function(invoices) {
	# 	console.log(invoices);
	# });
	#
	# @example
	# resin.models.billing.getInvoices(function(error, invoices) {
	# 	if (error) throw error;
	# 	console.log(invoices);
	# });
	###
	exports.getInvoices = (callback) ->
		request.send
			method: 'GET'
			url: '/user/billing/invoices'
			baseUrl: apiUrl
		.get('body')
		.asCallback(callback)

	###*
	# @summary Download a specific invoice
	# @name downloadInvoice
	# @public
	# @function
	# @memberof resin.models.billing
	#
	# @param {String} - an invoice number
	# @fulfil {Blob|ReadableStream} - blob on the browser, download stream on node
	# @returns {Promise}
	#
	# @example
	# # Browser
	# resin.models.billing.downloadInvoice('0000').then(function(blob) {
	# 	console.log(blob);
	# });
	# # Node
	# resin.models.billing.downloadInvoice('0000').then(function(stream) {
	# 	stream.pipe(fs.createWriteStream('foo/bar/invoice-0000.pdf'));
	# });
	###
	exports.downloadInvoice = (invoiceNumber, callback) ->
		url = "/user/billing/invoices/#{invoiceNumber}/download"

		if not isBrowser
			return request.stream
				method: 'GET'
				url: url
				baseUrl: apiUrl
			.asCallback(callback)

		request.send
			method: 'GET'
			url: url
			baseUrl: apiUrl
			responseFormat: 'blob'
		.get('body')
		.asCallback(callback)

	return exports

module.exports = getBillingModel
