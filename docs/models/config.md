# config
balena.models.config : <code>object</code>

**Kind**: static namespace  

* * *

## getAll
balena.models.config.getAll() ⇒ <code>Promise</code>

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
balena.models.config.getConfigVarSchema(deviceType) ⇒ <code>Promise</code>

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
balena.models.config.getDeviceOptions(deviceType) ⇒ <code>Promise</code>

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
balena.models.config.getDeviceTypeManifestBySlug<del>(slugOrName) ⇒ <code>Promise</code></del>

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
balena.models.config.getDeviceTypes<del>() ⇒ <code>Promise</code></del>

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

