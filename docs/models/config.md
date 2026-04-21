<a name="balena.models.config"></a>

## .config : <code>object</code>
**Kind**: static namespace  

* [.config](#balena.models.config) : <code>object</code>
    * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
    * [.getConfigVarSchema(deviceType)](#balena.models.config.getConfigVarSchema) ⇒ <code>Promise</code>
    * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
    * <del>[.getDeviceTypeManifestBySlug(slugOrName)](#balena.models.config.getDeviceTypeManifestBySlug) ⇒ <code>Promise</code></del>
    * <del>[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code></del>


* * *

<a name="balena.models.config.getAll"></a>

### config.getAll() ⇒ <code>Promise</code>
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

<a name="balena.models.config.getConfigVarSchema"></a>

### config.getConfigVarSchema(deviceType) ⇒ <code>Promise</code>
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

<a name="balena.models.config.getDeviceOptions"></a>

### config.getDeviceOptions(deviceType) ⇒ <code>Promise</code>
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

<a name="balena.models.config.getDeviceTypeManifestBySlug"></a>

### <del>config.getDeviceTypeManifestBySlug(slugOrName) ⇒ <code>Promise</code></del>
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

<a name="balena.models.config.getDeviceTypes"></a>

### <del>config.getDeviceTypes() ⇒ <code>Promise</code></del>
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

