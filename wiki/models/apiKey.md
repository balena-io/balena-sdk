# apiKey
balena.models.apiKey : <code>object</code>

**Kind**: static namespace  

* * *

## create
balena.models.apiKey.create(createApiKeyParams) ⇒ <code>Promise</code>

This method registers a new api key for the current user with the name given.

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Creates a new user API key  
**Access**: public  
**Fulfil**: <code>String</code> - API key  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>createApiKeyParams</td><td><code>Object</code></td><td></td><td><p>an object containing the parameters for the creation of an API key</p>
</td>
    </tr><tr>
    <td>createApiKeyParams.name</td><td><code>String</code></td><td></td><td><p>the API key name</p>
</td>
    </tr><tr>
    <td>createApiKeyParams.expiryDate</td><td><code>String</code></td><td></td><td><p>the API key expiry date</p>
</td>
    </tr><tr>
    <td>[createApiKeyParams.description]</td><td><code>String</code></td><td><code></code></td><td><p>the API key description</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.create({name: apiKeyName, expiryDate: 2030-10-12}).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.apiKey.create({name: apiKeyName, expiryDate: 2030-10-12, description: apiKeyDescription}).then(function(apiKey) {
	console.log(apiKey);
});
```

* * *

## getAll
balena.models.apiKey.getAll([options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all accessible API keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.getAll().then(function(apiKeys) {
	console.log(apiKeys);
});
```

* * *

## getAllNamedUserApiKeys
balena.models.apiKey.getAllNamedUserApiKeys([options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all named user API keys of the current user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.getAllNamedUserApiKeys().then(function(apiKeys) {
	console.log(apiKeys);
});
```

* * *

## getDeviceApiKeysByDevice
balena.models.apiKey.getDeviceApiKeysByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all API keys for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device, uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.getDeviceApiKeysByDevice('7cf02a69e4d34c9da573914963cf54fd').then(function(apiKeys) {
	console.log(apiKeys);
});
```

* * *

## getProvisioningApiKeysByApplication
balena.models.apiKey.getProvisioningApiKeysByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all provisioning API keys for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.getProvisioningApiKeysByApplication('myorganization/myapp').then(function(apiKeys) {
	console.log(apiKeys);
});
```

* * *

## revoke
balena.models.apiKey.revoke(id) ⇒ <code>Promise</code>

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Revoke an API key  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>API key id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.revoke(123);
```

* * *

## update
balena.models.apiKey.update(id, apiKeyInfo) ⇒ <code>Promise</code>

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Update the details of an API key  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>API key id</p>
</td>
    </tr><tr>
    <td>apiKeyInfo</td><td><code>Object</code></td><td><p>an object with the updated name|description|expiryDate</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.apiKey.update(123, { name: 'updatedName' });
```
**Example**  
```js
balena.models.apiKey.update(123, { description: 'updated description' });
```
**Example**  
```js
balena.models.apiKey.update(123, { expiryDate: '2022-04-29' });
```
**Example**  
```js
balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
```

* * *

