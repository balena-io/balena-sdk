<a name="balena.models.creditBundle"></a>

## .creditBundle : <code>object</code>
**Kind**: static namespace  

* [.creditBundle](#balena.models.creditBundle) : <code>object</code>
    * [.create(organization, featureId, creditsToPurchase)](#balena.models.creditBundle.create) ⇒ <code>Promise</code>
    * [.getAllByOrg(organization, [options])](#balena.models.creditBundle.getAllByOrg) ⇒ <code>Promise</code>


* * *

<a name="balena.models.creditBundle.create"></a>

### creditBundle.create(organization, featureId, creditsToPurchase) ⇒ <code>Promise</code>
**Kind**: static method of [<code>creditBundle</code>](#balena.models.creditBundle)  
**Summary**: Purchase a credit bundle for the given feature and org of the given quantity  
**Access**: public  
**Fulfil**: <code>Object[]</code> - credit bundles  
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
    <td>featureId</td><td><code>Number</code></td><td><p>id (number) of the feature for which credits are being purchased.</p>
</td>
    </tr><tr>
    <td>creditsToPurchase</td><td><code>Number</code></td><td><p>number of credits being purchased.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.creditBundle.create(orgId, featureId, creditsToPurchase).then(function(creditBundle) {
	console.log(creditBundle);
});
```

* * *

<a name="balena.models.creditBundle.getAllByOrg"></a>

### creditBundle.getAllByOrg(organization, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>creditBundle</code>](#balena.models.creditBundle)  
**Summary**: Get all of the credit bundles purchased by the given org  
**Access**: public  
**Fulfil**: <code>Object[]</code> - credit bundles  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organization</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>handle (string) or id (number) of the target organization.</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.creditBundle.getAllByOrg(orgId).then(function(creditBundles) {
	console.log(creditBundles);
});
```

* * *

