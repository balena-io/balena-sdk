# config
<code>balena.models.config</code> : <code>object</code>

**Kind**: static namespace  

* * *

## getAll
<code>balena.models.config.getAll()</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get all configuration  
**Access**: public  
**Fulfil**: <code>Object</code> - configuration  
**Example**  
```js
balena.models.config.getAll().then(function(config) {
	console.log(config);
});
```

* * *

## getConfigVarSchema
<code>balena.models.config.getConfigVarSchema(deviceType)</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get configuration variables schema for a device type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - configuration options  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.config.getConfigVarSchema('raspberry-pi').then(function(options) {
	console.log(options);
});
```

* * *

## getDeviceOptions
<code>balena.models.config.getDeviceOptions(deviceType)</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get configuration/initialization options for a device type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - configuration options  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
	console.log(options);
});
```

* * *

## getDeviceTypeManifestBySlug
<del><code>balena.models.config.getDeviceTypeManifestBySlug(slugOrName)</code> ⇒ <code>Promise</code></del>

***use balena.models.deviceType.getBySlugOrName***

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get a device type manifest by slug  
**Access**: public  
**Fulfil**: <code>Object</code> - device type manifest  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrName</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.config.getDeviceTypeManifestBySlug('raspberry-pi').then(function(manifest) {
	console.log(manifest);
});
```

* * *

## getDeviceTypes
<del><code>balena.models.config.getDeviceTypes()</code> ⇒ <code>Promise</code></del>

***use balena.models.deviceType.getAll***

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get device types  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  
**Example**  
```js
balena.models.config.getDeviceTypes().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```

* * *

