# billing
balena.models.billing : <code>object</code>

**Note!** The billing methods are available on Balena.io exclusively.

**Kind**: static namespace  

* * *

## changePlan
balena.models.billing.changePlan(organization, planChangeOptions) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Change the current billing plan  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr><tr>
    <td>planChangeOptions</td><td><code>Object</code></td><td><p>an object containing the billing plan change options</p>
</td>
    </tr><tr>
    <td>billingInfo.tier</td><td><code>String</code></td><td><p>the code of the target billing plan</p>
</td>
    </tr><tr>
    <td>billingInfo.cycle</td><td><code>String</code></td><td><p>the billing cycle</p>
</td>
    </tr><tr>
    <td>[billingInfo.planChangeReason]</td><td><code>String</code></td><td><p>the reason for changing the current plan</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.changePlan(orgId, { billingCode: 'prototype-v2', cycle: 'annual' }).then(function() {
	console.log('Plan changed!');
});
```

* * *

## createSetupIntent
balena.models.billing.createSetupIntent(setupIntentParams) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Create a Stripe setup intent required for setting billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - partial stripe setup intent object  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>setupIntentParams</td><td><code>Object</code></td><td><p>an object containing the parameters for the setup intent creation</p>
</td>
    </tr><tr>
    <td>extraParams.organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr><tr>
    <td>[extraParams.'g-recaptcha-response']</td><td><code>String</code> | <code>undefined</code></td><td><p>the captcha response</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.createSetupIntent(orgId).then(function(setupIntent) {
	console.log(setupIntent);
});
```

* * *

## downloadInvoice
balena.models.billing.downloadInvoice(organization) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Download a specific invoice  
**Access**: public  
**Fulfil**: <code>Blob\|ReadableStream</code> - blob on the browser, download stream on node  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr><tr>
    <td></td><td><code>String</code></td><td><p>an invoice number</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
# Browser
balena.models.billing.downloadInvoice(orgId, '0000').then(function(blob) {
	console.log(blob);
});
# Node
balena.models.billing.downloadInvoice(orgId, '0000').then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/invoice-0000.pdf'));
});
```

* * *

## getAccount
balena.models.billing.getAccount(organization) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the user's billing account  
**Access**: public  
**Fulfil**: <code>Object</code> - billing account  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.getAccount(orgId).then(function(billingAccount) {
	console.log(billingAccount);
});
```

* * *

## getBillingInfo
balena.models.billing.getBillingInfo(organization) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.getBillingInfo(orgId).then(function(billingInfo) {
	console.log(billingInfo);
});
```

* * *

## getInvoices
balena.models.billing.getInvoices(organization) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the available invoices  
**Access**: public  
**Fulfil**: <code>Object</code> - invoices  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.getInvoices(orgId).then(function(invoices) {
	console.log(invoices);
});
```

* * *

## getPlan
balena.models.billing.getPlan(organization) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing plan  
**Access**: public  
**Fulfil**: <code>Object</code> - billing plan  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.getPlan(orgId).then(function(billingPlan) {
	console.log(billingPlan);
});
```

* * *

## removeBillingInfo
balena.models.billing.removeBillingInfo(organization) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Remove an organization's billing information  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.removeBillingInfo(orgId).then(function() {
	console.log("Success");
});
```

* * *

## updateAccountInfo
balena.models.billing.updateAccountInfo(organization, accountInfo)

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Update the current billing account information  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr><tr>
    <td>accountInfo</td><td><code>AccountInfo</code></td><td><p>an object containing billing account info</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.updateAccountInfo(orgId, { email: 'hello@balena.io' })
```
**Example**  
```js
balena.models.billing.updateAccountInfo(orgId, { email: 'hello@balena.io' })
```

* * *

## updateBillingInfo
balena.models.billing.updateBillingInfo(organization, billingInfo) ⇒ <code>Promise</code>

**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Update the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr><tr>
    <td>billingInfo</td><td><code>Object</code></td><td><p>an object containing a billing info token_id</p>
</td>
    </tr><tr>
    <td>billingInfo.token_id</td><td><code>String</code></td><td><p>the token id generated for the billing info form</p>
</td>
    </tr><tr>
    <td>[billingInfo.'g-recaptcha-response']</td><td><code>String</code> | <code>undefined</code></td><td><p>the captcha response</p>
</td>
    </tr><tr>
    <td>[billingInfo.token_type]</td><td><code>String</code> | <code>undefined</code></td><td><p>token type</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.billing.updateBillingInfo(orgId, { token_id: 'xxxxxxx' }).then(function(billingInfo) {
	console.log(billingInfo);
});
```

* * *

