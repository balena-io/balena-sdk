<a name="balena.models.deviceType"></a>

## .deviceType : <code>object</code>
**Kind**: static namespace  

* [.deviceType](#balena.models.deviceType) : <code>object</code>
    * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
    * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
    * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
    * [.getInstallMethod(deviceTypeSlug)](#balena.models.deviceType.getInstallMethod) ⇒ <code>Promise</code>
    * [.getInstructions(deviceTypeSlugOrContract)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
    * [.getInterpolatedPartials(deviceTypeSlug)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
    * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
    * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>


* * *

<a name="balena.models.deviceType.get"></a>

### deviceType.get(idOrSlug, [options]) ⇒ <code>Promise</code>
This method returns a single device type.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a single deviceType  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>idOrSlug</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device type slug (string) or alias (string) or id</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.get('raspberry-pi').then(function(deviceType) {
	console.log(deviceType);
});
```
**Example**  
```js
balena.models.deviceType.get('raspberrypi').then(function(deviceType) {
	console.log('resolved alias:', deviceType);
});
```

* * *

<a name="balena.models.deviceType.getAll"></a>

### deviceType.getAll([options]) ⇒ <code>Promise</code>
This method returns all device types.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get all deviceTypes  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  
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
balena.models.deviceType.getAll().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```
**Example**  
```js
balena.models.deviceType.getAll({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
	console.log(deviceTypes);
})
```

* * *

<a name="balena.models.deviceType.getAllSupported"></a>

### deviceType.getAllSupported([options]) ⇒ <code>Promise</code>
This method returns all supported device types.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get all supported deviceTypes  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  
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
balena.models.deviceType.getAllSupported().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```
**Example**  
```js
balena.models.deviceType.getAllSupported({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
	console.log(deviceTypes);
})
```

* * *

<a name="balena.models.deviceType.getBySlugOrName"></a>

### deviceType.getBySlugOrName(slugOrName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a deviceType by slug or name  
**Access**: public  
**Fulfil**: <code>Object</code> - device type  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrName</td><td><code>String</code></td><td><p>deviceType slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.getBySlugOrName('raspberry-pi').then(function(deviceType) {
	console.log(deviceType);
});
```

* * *

<a name="balena.models.deviceType.getInstallMethod"></a>

### deviceType.getInstallMethod(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get installation method on a given device type  
**Access**: public  
**Fulfil**: <code>String</code> - the installation method supported for the given device type slug  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypeSlug</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.getInstallMethod('raspberry-pi').then(function(method) {
	console.log(method);
 // externalBoot
});
```

* * *

<a name="balena.models.deviceType.getInstructions"></a>

### deviceType.getInstructions(deviceTypeSlugOrContract) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get instructions for installing a host OS on a given device type  
**Access**: public  
**Fulfil**: <code>Object \| String[]</code> - step by step instructions for installing the host OS to the device  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypeSlugOrContract</td><td><code>String</code> | <code>Object</code></td><td><p>device type slug or contract</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.getInstructions('raspberry-pi').then(function(instructions) {
 for (let instruction of instructions.values()) {
	 console.log(instruction);
 }
 // Insert the sdcard to the host machine.
 // Write the BalenaOS file you downloaded to the sdcard. We recommend using <a href="https://etcher.balena.io/">Etcher</a>.
 // Wait for writing of BalenaOS to complete.
 // Remove the sdcard from the host machine.
 // Insert the freshly flashed sdcard into the Raspberry Pi (v1 / Zero / Zero W).
 // Connect power to the Raspberry Pi (v1 / Zero / Zero W) to boot the device.
});
```

* * *

<a name="balena.models.deviceType.getInterpolatedPartials"></a>

### deviceType.getInterpolatedPartials(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a contract with resolved partial templates  
**Access**: public  
**Fulfil**: <code>Contract</code> - device type contract with resolved partials  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypeSlug</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.getInterpolatedPartials('raspberry-pi').then(function(contract) {
 for (const partial in contract.partials) {
 	console.log(`${partial}: ${contract.partials[partial]}`);
 }
	// bootDevice: ["Connect power to the Raspberry Pi (v1 / Zero / Zero W)"]
});
```

* * *

<a name="balena.models.deviceType.getName"></a>

### deviceType.getName(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get display name for a device  
**Access**: public  
**Fulfil**: <code>String</code> - device display name  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypeSlug</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.getName('raspberry-pi').then(function(deviceTypeName) {
	console.log(deviceTypeName);
	// Raspberry Pi
});
```

* * *

<a name="balena.models.deviceType.getSlugByName"></a>

### deviceType.getSlugByName(deviceTypeName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get device slug  
**Access**: public  
**Fulfil**: <code>String</code> - device slug name  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypeName</td><td><code>String</code></td><td><p>device type name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.deviceType.getSlugByName('Raspberry Pi').then(function(deviceTypeSlug) {
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```

* * *

