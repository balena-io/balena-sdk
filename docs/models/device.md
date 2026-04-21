<a name="balena.models.device"></a>

## .device : <code>object</code>
**Kind**: static namespace  

* [.device](#balena.models.device) : <code>object</code>
    * [.deactivate(uuidOrIdOrArray)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
    * [.disableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
    * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
    * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
    * [.enableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
    * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
    * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
    * [.generateDeviceKey(uuidOrId, [keyName], [keyDescription])](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
    * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
    * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.device.getAllByOrganization) ⇒ <code>Promise</code>
    * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
    * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
    * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
    * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
    * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
    * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
    * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
    * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
    * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
    * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
    * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
    * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
    * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
    * [.getSupervisorTargetState(uuidOrId, version)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
    * [.getSupervisorTargetStateForApp(uuidOrId, release)](#balena.models.device.getSupervisorTargetStateForApp) ⇒ <code>Promise</code>
    * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
    * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
    * [.grantSupportAccess(uuidOrIdOrArray, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
    * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
    * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
    * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
    * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
    * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
    * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
    * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
    * [.move(uuidOrIdOrArray, applicationSlugOrUuidOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
    * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
    * [.pinToOsRelease(uuidOrIdOrArray, osVersionOrId)](#balena.models.device.pinToOsRelease) ⇒ <code>Promise</code>
    * [.pinToRelease(uuidOrIdOrArray, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
    * [.pinToSupervisorRelease(uuidOrIdOrArray, supervisorVersionOrId)](#balena.models.device.pinToSupervisorRelease) ⇒ <code>Promise</code>
    * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
    * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
    * [.register(applicationSlugOrUuidOrId, uuid, [deviceTypeSlug])](#balena.models.device.register) ⇒ <code>Promise</code>
    * [.remove(uuidOrIdOrArray)](#balena.models.device.remove) ⇒ <code>Promise</code>
    * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
    * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
    * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(uuidOrIdOrArray)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.setCustomLocation(uuidOrIdOrArray, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
    * [.setNote(uuidOrIdOrArray, note)](#balena.models.device.setNote) ⇒ <code>Promise</code>
    * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
    * [.startOsUpdate(uuidOrUuids, targetOsVersion, [options])](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
    * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
    * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
    * [.trackApplicationRelease(uuidOrIdOrArray)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
    * [.unsetCustomLocation(uuidOrIdOrArray)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
    * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.device.configVar) : <code>object</code>
        * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.device.envVar) : <code>object</code>
        * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
    * [.history](#balena.models.device.history) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.history.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.history.getAllByDevice) ⇒ <code>Promise</code>
    * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
        * [.get(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
        * [.set(uuidOrId, serviceNameOrId, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
    * [.tags](#balena.models.device.tags) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
        * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.device.deactivate"></a>

### device.deactivate(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Deactivate device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.deactivate('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.deactivate(123);
```

* * *

<a name="balena.models.device.disableDeviceUrl"></a>

### device.disableDeviceUrl(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable device url for a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.disableDeviceUrl('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.disableDeviceUrl(123);
```

* * *

<a name="balena.models.device.disableLocalMode"></a>

### device.disableLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable local mode  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.disableLocalMode('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.disableLocalMode(123);
```

* * *

<a name="balena.models.device.disableLockOverride"></a>

### device.disableLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable lock override  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.disableLockOverride('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.disableLockOverride(123);
```

* * *

<a name="balena.models.device.enableDeviceUrl"></a>

### device.enableDeviceUrl(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable device url for a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.enableDeviceUrl('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.enableDeviceUrl(123);
```

* * *

<a name="balena.models.device.enableLocalMode"></a>

### device.enableLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable local mode  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.enableLocalMode('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.enableLocalMode(123);
```

* * *

<a name="balena.models.device.enableLockOverride"></a>

### device.enableLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable lock override  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.enableLockOverride('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.enableLockOverride(123);
```

* * *

<a name="balena.models.device.generateDeviceKey"></a>

### device.generateDeviceKey(uuidOrId, [keyName], [keyDescription]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Generate a device key  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[keyName]</td><td><code>String</code></td><td><p>Device key name</p>
</td>
    </tr><tr>
    <td>[keyDescription]</td><td><code>String</code></td><td><p>Description for device key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.generateDeviceKey('7cf02a69e4d34c9da573914963cf54fd').then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
balena.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```

* * *

<a name="balena.models.device.generateUniqueKey"></a>

### device.generateUniqueKey() ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Generate a random key, useful for both uuid and api key.  
**Returns**: <code>String</code> - A generated key  
**Access**: public  
**Example**  
```js
randomKey = balena.models.device.generateUniqueKey();
// randomKey is a randomly generated key that can be used as either a uuid or an api key
console.log(randomKey);
```

* * *

<a name="balena.models.device.get"></a>

### device.get(uuidOrId, [options]) ⇒ <code>Promise</code>
This method returns a single device by id or uuid.
In order to have the following computed properties in the result
you have to explicitly define them in a `$select` in the extra options:
* `overall_status`
* `overall_progress`
* `should_be_running__release`

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device  
**Access**: public  
**Fulfil**: <code>Object</code> - device  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.get('7cf02a69e4d34c9da573914963cf54fd').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.get(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.get('7cf02a69e4d34c9da573914963cf54fd', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```

* * *

<a name="balena.models.device.getAllByApplication"></a>

### device.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method returns all devices of a specific application.
In order to have the following computed properties in the result
you have to explicitly define them in a `$select` in the extra options:
* `overall_status`
* `overall_progress`
* `should_be_running__release`

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  
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
balena.models.device.getAllByApplication('myorganization/myapp').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByApplication(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByApplication('myorganization/myapp', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```

* * *

<a name="balena.models.device.getAllByOrganization"></a>

### device.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all devices of a specific application.
In order to have the following computed properties in the result
you have to explicitly define them in a `$select` in the extra options:
* `overall_status`
* `overall_progress`
* `should_be_running__release`

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>handleOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>organization handle (string) or id (number).</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getAllByOrganization('myorganization').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByOrganization(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByOrganization('myorganization', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```

* * *

<a name="balena.models.device.getApplicationName"></a>

### device.getApplicationName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get application name  
**Access**: public  
**Fulfil**: <code>String</code> - application name  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getApplicationName('7cf02a69e4d34c9da573914963cf54fd').then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
balena.models.device.getApplicationName(123).then(function(applicationName) {
	console.log(applicationName);
});
```

* * *

<a name="balena.models.device.getByName"></a>

### device.getByName(name) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get devices by name  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>name</td><td><code>String</code></td><td><p>device name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getByName('MyDevice').then(function(devices) {
	console.log(devices);
});
```

* * *

<a name="balena.models.device.getDashboardUrl"></a>

### device.getDashboardUrl(uuid) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get Dashboard URL for a specific device  
**Returns**: <code>String</code> - - Dashboard URL for the specific device  
**Throws**:

- Exception if the uuid is empty

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuid</td><td><code>String</code></td><td><p>Device uuid</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
dashboardDeviceUrl = balena.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
```

* * *

<a name="balena.models.device.getDeviceUrl"></a>

### device.getDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device url  
**Access**: public  
**Fulfil**: <code>String</code> - device url  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getDeviceUrl('7cf02a69e4d34c9da573914963cf54fd').then(function(url) {
	console.log(url);
});
```
**Example**  
```js
balena.models.device.getDeviceUrl(123).then(function(url) {
	console.log(url);
});
```

* * *

<a name="balena.models.device.getLocalIPAddresses"></a>

### device.getLocalIPAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the local IP addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - local ip addresses  
**Reject**: <code>Error</code> Will reject if the device is offline  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getLocalIPAddresses('7cf02a69e4d34c9da573914963cf54fd').then(function(localIPAddresses) {
	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
**Example**  
```js
balena.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```

* * *

<a name="balena.models.device.getLocalModeSupport"></a>

### device.getLocalModeSupport(device) ⇒ <code>Object</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Returns whether local mode is supported along with a message describing the reason why local mode is not supported.  
**Returns**: <code>Object</code> - Local mode support info ({ supported: true/false, message: "..." })  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>device</td><td><code>Object</code></td><td><p>A device object</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.get('7cf02a69e4d34c9da573914963cf54fd').then(function(device) {
	balena.models.device.getLocalModeSupport(device);
})
```

* * *

<a name="balena.models.device.getMACAddresses"></a>

### device.getMACAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the MAC addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - mac addresses  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getMACAddresses('7cf02a69e4d34c9da573914963cf54fd').then(function(macAddresses) {
	macAddresses.forEach(function(mac) {
		console.log(mac);
	});
});
```
**Example**  
```js
balena.models.device.getMACAddresses(123).then(function(macAddresses) {
	macAddresses.forEach(function(mac) {
		console.log(mac);
	});
});
```

* * *

<a name="balena.models.device.getMetrics"></a>

### device.getMetrics(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the metrics related information for a device  
**Access**: public  
**Fulfil**: <code>Object</code> - device metrics  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getMetrics('7cf02a69e4d34c9da573914963cf54fd').then(function(deviceMetrics) {
	console.log(deviceMetrics);
});
```
**Example**  
```js
balena.models.device.getMetrics(123).then(function(deviceMetrics) {
	console.log(deviceMetrics);
});
```

* * *

<a name="balena.models.device.getName"></a>

### device.getName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the name of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device name  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getName('7cf02a69e4d34c9da573914963cf54fd').then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
balena.models.device.getName(123).then(function(deviceName) {
	console.log(deviceName);
});
```

* * *

<a name="balena.models.device.getOsVersion"></a>

### device.getOsVersion(device) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the OS version (version number and variant combined) running on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>device</td><td><code>Object</code></td><td><p>A device object</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.get('7cf02a69e4d34c9da573914963cf54fd').then(function(device) {
	console.log(device.os_version); // => 'balenaOS 2.26.0+rev1'
	console.log(device.os_variant); // => 'prod'
	balena.models.device.getOsVersion(device); // => '2.26.0+rev1.prod'
})
```

* * *

<a name="balena.models.device.getProgress"></a>

### device.getProgress(uuidOrId) ⇒ <code>Promise</code>
Convenience method for getting the overall progress of a device.
It's recommended to use `balena.models.device.get()` instead,
in case that you need to retrieve more device fields than just the progress.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the progress of a device  
**Access**: public  
**Fulfil**: <code>Number\|null</code> - device progress  
**See**: [get](#balena.models.device.get) for an example on selecting the `overall_progress` field.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getProgress('7cf02a69e4d34c9da573914963cf54fd').then(function(progress) {
	console.log(progress);
});
```
**Example**  
```js
balena.models.device.getProgress(123).then(function(progress) {
	console.log(progress);
});
```

* * *

<a name="balena.models.device.getStatus"></a>

### device.getStatus(uuidOrId) ⇒ <code>Promise</code>
Convenience method for getting the overall status of a device.
It's recommended to use `balena.models.device.get()` instead,
in case that you need to retrieve more device fields than just the status.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the status of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device status  
**See**: [get](#balena.models.device.get) for an example on selecting the `overall_status` field.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getStatus('7cf02a69e4d34c9da573914963cf54fd').then(function(status) {
	console.log(status);
});
```
**Example**  
```js
balena.models.device.getStatus(123).then(function(status) {
	console.log(status);
});
```

* * *

<a name="balena.models.device.getSupervisorState"></a>

### device.getSupervisorState(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the supervisor state on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getSupervisorState('7cf02a69e4d34c9da573914963cf54fd').then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorState(123).then(function(state) {
	console.log(state);
});
```

* * *

<a name="balena.models.device.getSupervisorTargetState"></a>

### device.getSupervisorTargetState(uuidOrId, version) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the target supervisor state on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>version</td><td><code>Number</code></td><td><p>(optional) target state version (2 or 3), default to 2</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getSupervisorTargetState('7cf02a69e4d34c9da573914963cf54fd').then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorTargetState(123).then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorTargetState(123, 3).then(function(state) {
	console.log(state);
});
```

* * *

<a name="balena.models.device.getSupervisorTargetStateForApp"></a>

### device.getSupervisorTargetStateForApp(uuidOrId, release) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the target supervisor state on a "generic" device on a fleet  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>fleet uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>release</td><td><code>String</code></td><td><p>(optional) release uuid (default tracked)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getSupervisorTargetStateForApp('7cf02a69e4d34c9da573914963cf54fd').then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorTargetStateForApp(123).then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorTargetStateForApp(123, '7cf02a69e4d34c9da573914963cf54fd').then(function(state) {
	console.log(state);
});
```

* * *

<a name="balena.models.device.getTargetReleaseHash"></a>

### device.getTargetReleaseHash(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the hash of the currently tracked release for a specific device  
**Access**: public  
**Fulfil**: <code>String</code> - The release hash of the currently tracked release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getTargetReleaseHash('7cf02a69e4d34c9da573914963cf54fd').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.device.getTargetReleaseHash('7cf02a69e4d34c9da573914963cf54fd', function(release) {
	console.log(release);
});
```

* * *

<a name="balena.models.device.getWithServiceDetails"></a>

### device.getWithServiceDetails(uuidOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `device.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device along with its associated services' details,
including their associated commit  
**Access**: public  
**Fulfil**: <code>Object</code> - device with service details  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.getWithServiceDetails('7cf02a69e4d34c9da573914963cf54fd').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getWithServiceDetails(123).then(function(device) {
	console.log(device);
})
```

* * *

<a name="balena.models.device.grantSupportAccess"></a>

### device.grantSupportAccess(uuidOrIdOrArray, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Grant support access to a device until a specified time  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>expiryTimestamp</td><td><code>Number</code></td><td><p>a timestamp in ms for when the support access will expire</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.grantSupportAccess('7cf02a69e4d34c9da573914963cf54fd', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
```

* * *

<a name="balena.models.device.has"></a>

### device.has(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.has('7cf02a69e4d34c9da573914963cf54fd').then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
balena.models.device.has(123).then(function(hasDevice) {
	console.log(hasDevice);
});
```

* * *

<a name="balena.models.device.hasDeviceUrl"></a>

### device.hasDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device is web accessible with device utls  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.hasDeviceUrl('7cf02a69e4d34c9da573914963cf54fd').then(function(hasDeviceUrl) {
	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
**Example**  
```js
balena.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```

* * *

<a name="balena.models.device.hasLockOverride"></a>

### device.hasLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device has the lock override enabled  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.hasLockOverride('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.hasLockOverride(123);
```

* * *

<a name="balena.models.device.identify"></a>

### device.identify(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Identify device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.identify('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.identify(123);
```

* * *

<a name="balena.models.device.isInLocalMode"></a>

### device.isInLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if local mode is enabled on the device  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.isInLocalMode('7cf02a69e4d34c9da573914963cf54fd').then(function(isInLocalMode) {
	if (isInLocalMode) {
		console.log('The device has local mode enabled');
	}
});
```
**Example**  
```js
balena.models.device.isInLocalMode(123).then(function(isInLocalMode) {
	if (isInLocalMode) {
		console.log('The device has local mode enabled');
	}
});
```

* * *

<a name="balena.models.device.isOnline"></a>

### device.isOnline(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device is online  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is device online  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.isOnline('7cf02a69e4d34c9da573914963cf54fd').then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
balena.models.device.isOnline(123).then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```

* * *

<a name="balena.models.device.isTrackingApplicationRelease"></a>

### device.isTrackingApplicationRelease(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get whether the device is configured to track the current application release  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the current application release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.isTrackingApplicationRelease('7cf02a69e4d34c9da573914963cf54fd').then(function(isEnabled) {
	console.log(isEnabled);
});
```

* * *

<a name="balena.models.device.move"></a>

### device.move(uuidOrIdOrArray, applicationSlugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Move a device to another application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>applicationSlugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.move('7cf02a69e4d34c9da573914963cf54fd', 'myorganization/myapp');
```
**Example**  
```js
balena.models.device.move(123, 'myorganization/myapp');
```
**Example**  
```js
balena.models.device.move(123, 456);
```

* * *

<a name="balena.models.device.ping"></a>

### device.ping(uuidOrId) ⇒ <code>Promise</code>
This is useful to signal that the supervisor is alive and responding.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Ping a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.ping('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.ping(123);
```

* * *

<a name="balena.models.device.pinToOsRelease"></a>

### device.pinToOsRelease(uuidOrIdOrArray, osVersionOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Mark a specific device to be updated to a particular OS release  
**Access**: public  
**Experimental**:   
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>osVersionOrId</td><td><code>String</code></td><td><p>the raw version of a OS release (string) or id (number)
Unsupported (unpublished) version will result in rejection.
The version <strong>must</strong> be the exact version number, a &quot;prod&quot; variant and greater than or equal to the one running on the device.
To resolve compatible update targets for a device use <code>balena.models.os.getSupportedOsUpdateVersions</code>.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
await balena.models.device.pinToOsRelease('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod');
```

* * *

<a name="balena.models.device.pinToRelease"></a>

### device.pinToRelease(uuidOrIdOrArray, fullReleaseHashOrId) ⇒ <code>Promise</code>
Configures the device to run a particular release
and not get updated when the current application release changes.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a specific device to run a particular release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>fullReleaseHashOrId</td><td><code>String</code> | <code>Number</code></td><td><p>the hash of a successful release (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.pinToRelease('7cf02a69e4d34c9da573914963cf54fd', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```

* * *

<a name="balena.models.device.pinToSupervisorRelease"></a>

### device.pinToSupervisorRelease(uuidOrIdOrArray, supervisorVersionOrId) ⇒ <code>Promise</code>
Configures the device to run a particular supervisor release.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a specific device to run a particular supervisor release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>supervisorVersionOrId</td><td><code>String</code> | <code>Number</code></td><td><p>the raw version of a supervisor release (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.pinToSupervisorRelease('7cf02a69e4d34c9da573914963cf54fd', '10.8.0').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.pinToSupervisorRelease(123, '11.4.14').then(function() {
	...
});
```

* * *

<a name="balena.models.device.purge"></a>

### device.purge(uuidOrId) ⇒ <code>Promise</code>
This function clears the user application's `/data` directory.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Purge device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.purge('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.purge(123);
```

* * *

<a name="balena.models.device.reboot"></a>

### device.reboot(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Reboot device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>options</p>
</td>
    </tr><tr>
    <td>[options.force]</td><td><code>Boolean</code></td><td><code>false</code></td><td><p>override update lock</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.reboot('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.reboot(123);
```

* * *

<a name="balena.models.device.register"></a>

### device.register(applicationSlugOrUuidOrId, uuid, [deviceTypeSlug]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Register a new device with a Balena application.  
**Access**: public  
**Fulfil**: <code>Object</code> Device registration info ({ id: "...", uuid: "...", api_key: "..." })  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>applicationSlugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>uuid</td><td><code>String</code></td><td><p>device uuid</p>
</td>
    </tr><tr>
    <td>[deviceTypeSlug]</td><td><code>String</code></td><td><p>device type slug (string) or alias (string)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register('myorganization/myapp', uuid).then(function(registrationInfo) {
	console.log(registrationInfo);
});
```
**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register('myorganization/myapp', uuid, 'raspberry-pi').then(function(registrationInfo) {
	console.log(registrationInfo);
});
```
**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register(123, uuid).then(function(registrationInfo) {
	console.log(registrationInfo);
});
```

* * *

<a name="balena.models.device.remove"></a>

### device.remove(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Remove device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.remove('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.remove(123);
```

* * *

<a name="balena.models.device.rename"></a>

### device.rename(uuidOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Rename device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>newName</td><td><code>String</code></td><td><p>the device new name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.rename('7cf02a69e4d34c9da573914963cf54fd', 'NewName');
```
**Example**  
```js
balena.models.device.rename(123, 'NewName');
```

* * *

<a name="balena.models.device.restartApplication"></a>

### device.restartApplication(uuidOrId) ⇒ <code>Promise</code>
This function restarts the Docker container running
the application on the device, but doesn't reboot
the device itself.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Restart application on device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.restartApplication('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.restartApplication(123);
```

* * *

<a name="balena.models.device.restartService"></a>

### device.restartService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Restart a service on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>imageId</td><td><code>Number</code></td><td><p>id of the image to restart</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.restartService('7cf02a69e4d34c9da573914963cf54fd', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.restartService(1, 123).then(function() {
	...
});
```

* * *

<a name="balena.models.device.revokeSupportAccess"></a>

### device.revokeSupportAccess(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Revoke support access to a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.revokeSupportAccess('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.revokeSupportAccess(123);
```

* * *

<a name="balena.models.device.setCustomLocation"></a>

### device.setCustomLocation(uuidOrIdOrArray, location) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a custom location for a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>location</td><td><code>Object</code></td><td><p>the location ({ latitude: 123, longitude: 456 })</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.setCustomLocation('7cf02a69e4d34c9da573914963cf54fd', { latitude: 123, longitude: 456 });
```
**Example**  
```js
balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
```

* * *

<a name="balena.models.device.setNote"></a>

### device.setNote(uuidOrIdOrArray, note) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Note a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr><tr>
    <td>note</td><td><code>String</code></td><td><p>the note</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.setNote('7cf02a69e4d34c9da573914963cf54fd', 'My useful note');
```
**Example**  
```js
balena.models.device.setNote(123, 'My useful note');
```

* * *

<a name="balena.models.device.shutdown"></a>

### device.shutdown(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Shutdown device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>options</p>
</td>
    </tr><tr>
    <td>[options.force]</td><td><code>Boolean</code></td><td><code>false</code></td><td><p>override update lock</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.shutdown('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.shutdown(123);
```

* * *

<a name="balena.models.device.startOsUpdate"></a>

### device.startOsUpdate(uuidOrUuids, targetOsVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start an OS update on a device  
**Access**: public  
**Fulfil**: <code>Object</code> - action response  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrUuids</td><td><code>String</code> | <code>Array.&lt;String&gt;</code></td><td><p>full device uuid or array of full uuids</p>
</td>
    </tr><tr>
    <td>targetOsVersion</td><td><code>String</code></td><td><p>semver-compatible version for the target device
Unsupported (unpublished) version will result in rejection.
The version <strong>must</strong> be the exact version number, a &quot;prod&quot; variant and greater than the one running on the device.
To resolve the semver-compatible range use <code>balena.model.os.getMaxSatisfyingVersion</code>.</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><p>options</p>
</td>
    </tr><tr>
    <td>[options.runDetached]</td><td><code>Boolean</code></td><td><p>run the update in detached mode. True by default</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod').then(function(status) {
	console.log(result.status);
});
```

* * *

<a name="balena.models.device.startService"></a>

### device.startService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start a service on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>imageId</td><td><code>Number</code></td><td><p>id of the image to start</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.startService('7cf02a69e4d34c9da573914963cf54fd', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.startService(1, 123).then(function() {
	...
});
```

* * *

<a name="balena.models.device.stopService"></a>

### device.stopService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Stop a service on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>imageId</td><td><code>Number</code></td><td><p>id of the image to stop</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.stopService('7cf02a69e4d34c9da573914963cf54fd', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.stopService(1, 123).then(function() {
	...
});
```

* * *

<a name="balena.models.device.trackApplicationRelease"></a>

### device.trackApplicationRelease(uuidOrIdOrArray) ⇒ <code>Promise</code>
The device's current release will be updated with each new successfully built release.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Configure a specific device to track the current application release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.trackApplicationRelease('7cf02a69e4d34c9da573914963cf54fd').then(function() {
	...
});
```

* * *

<a name="balena.models.device.unsetCustomLocation"></a>

### device.unsetCustomLocation(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Clear the custom location of a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrIdOrArray</td><td><code>String</code> | <code>Array.&lt;String&gt;</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>device uuid (string) or id (number) or array of full uuids or ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.unsetCustomLocation('7cf02a69e4d34c9da573914963cf54fd');
```
**Example**  
```js
balena.models.device.unsetCustomLocation(123);
```

* * *

<a name="balena.models.device.update"></a>

### device.update(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Trigger an update check on the supervisor  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>options</p>
</td>
    </tr><tr>
    <td>[options.force]</td><td><code>Boolean</code></td><td><code>false</code></td><td><p>override update lock</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.update('7cf02a69e4d34c9da573914963cf54fd', {
	force: true
});
```
**Example**  
```js
balena.models.device.update(123, {
	force: true
});
```

* * *

<a name="balena.models.device.configVar"></a>

### device.configVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.configVar](#balena.models.device.configVar) : <code>object</code>
    * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
    * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.device.configVar.get"></a>

#### configVar.get(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get the value of a specific config variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the config variable value (or undefined)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>config variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.configVar.get('7cf02a69e4d34c9da573914963cf54fd', 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.configVar.get(999999, 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```

* * *

<a name="balena.models.device.configVar.getAllByApplication"></a>

#### configVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all device config variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  
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
balena.models.device.configVar.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.device.configVar.getAllByDevice"></a>

#### configVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all config variables for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.configVar.getAllByDevice('7cf02a69e4d34c9da573914963cf54fd').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.device.configVar.remove"></a>

#### configVar.remove(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Clear the value of a specific config variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>config variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.configVar.remove('7cf02a69e4d34c9da573914963cf54fd', 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.remove(999999, 'BALENA_VAR').then(function() {
	...
});
```

* * *

<a name="balena.models.device.configVar.set"></a>

#### configVar.set(uuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Set the value of a specific config variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>config variable name</p>
</td>
    </tr><tr>
    <td>value</td><td><code>String</code></td><td><p>config variable value</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.configVar.set('7cf02a69e4d34c9da573914963cf54fd', 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```

* * *

<a name="balena.models.device.envVar"></a>

### device.envVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.envVar](#balena.models.device.envVar) : <code>object</code>
    * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
    * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.device.envVar.get"></a>

#### envVar.get(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get the value of a specific environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the environment variable value (or undefined)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>environment variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.envVar.get('7cf02a69e4d34c9da573914963cf54fd', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.envVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```

* * *

<a name="balena.models.device.envVar.getAllByApplication"></a>

#### envVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all device environment variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  
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
balena.models.device.envVar.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.device.envVar.getAllByDevice"></a>

#### envVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all environment variables for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.envVar.getAllByDevice('7cf02a69e4d34c9da573914963cf54fd').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.device.envVar.remove"></a>

#### envVar.remove(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Clear the value of a specific environment variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>environment variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.envVar.remove('7cf02a69e4d34c9da573914963cf54fd', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.remove(999999, 'VAR').then(function() {
	...
});
```

* * *

<a name="balena.models.device.envVar.set"></a>

#### envVar.set(uuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Set the value of a specific environment variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>environment variable name</p>
</td>
    </tr><tr>
    <td>value</td><td><code>String</code></td><td><p>environment variable value</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.envVar.set('7cf02a69e4d34c9da573914963cf54fd', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```

* * *

<a name="balena.models.device.history"></a>

### device.history : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.history](#balena.models.device.history) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.history.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.history.getAllByDevice) ⇒ <code>Promise</code>


* * *

<a name="balena.models.device.history.getAllByApplication"></a>

#### history.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>history</code>](#balena.models.device.history)  
**Summary**: Get all device history entries by application with time frame  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device history  
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
    <td>[dateFilter.fromDate]</td><td><code>Date</code></td><td><code>subDays(new Date(), 7)</code></td><td><p>history entries older or equal to this date - default now() - 7 days</p>
</td>
    </tr><tr>
    <td>[dateFilter.toDate]</td><td><code>Date</code></td><td></td><td><p>history entries younger or equal to this date</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.history.getAllByApplication('myorganization/myapp').then(function(entries) {
	console.log(entries);
});
```
**Example**  
```js
balena.models.device.history.getAllByApplication(999999).then(function(entries) {
	console.log(entries);
});

 
```
**Example**  
```js
// get all device history entries between now - 20 days and now - 10 days
balena.models.device.history.getAllByApplication(999999, { fromDate: subDays(new Date(), 20), toDate: subDays(new Date(), 10)})
```
**Example**  
```js
// get all device history entries between now - 20 days and now - 10 days
balena.models.device.history.getAllByApplication(
  999999,
  { fromDate: subDays(new Date(), 20), toDate: subDays(new Date(), 10),
  { $top: 10, $orderby: { id: 'desc' }}
});
```

* * *

<a name="balena.models.device.history.getAllByDevice"></a>

#### history.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>history</code>](#balena.models.device.history)  
**Summary**: Get all history entries for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device history  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (32 / 62 digits string) or id (number)</p>
</td>
    </tr><tr>
    <td>[dateFilter.fromDate]</td><td><code>Date</code></td><td><code>subDays(new Date(), 7)</code></td><td><p>history entries older or equal to this date - default now() - 7 days</p>
</td>
    </tr><tr>
    <td>[dateFilter.toDate]</td><td><code>Date</code></td><td></td><td><p>history entries younger or equal to this date</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.history.getAllByDevice('7cf02a687b74206f92cb455969cf8e98').then(function(entries) {
	console.log(entries);
});
```
**Example**  
```js
balena.models.device.history.getAllByDevice(999999).then(function(entries) {
	console.log(entries);
});
```
**Example**  
```js
// get all device history entries between now - 20 days and now - 10 days
balena.models.device.history.getAllByDevice(999999, { fromDate: subDays(new Date(), 20), toDate: subDays(new Date(), 10)})
```
**Example**  
```js
// get all device history entries between now - 20 days and now - 10 days
balena.models.device.history.getAllByDevice(
 999999,
 { fromDate: subDays(new Date(), 20), toDate: subDays(new Date(), 10)},
 { $top: 10, $orderby: { id: 'desc' }}
)
```

* * *

<a name="balena.models.device.serviceVar"></a>

### device.serviceVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
    * [.get(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
    * [.set(uuidOrId, serviceNameOrId, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.device.serviceVar.get"></a>

#### serviceVar.get(uuidOrId, serviceNameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get the overriden value of a service variable on a device  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>serviceNameOrId</td><td><code>String</code> | <code>Number</code></td><td><p>service name (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.serviceVar.get('7cf02a69e4d34c9da573914963cf54fd', 123, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get('7cf02a69e4d34c9da573914963cf54fd', 'myservice', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
	console.log(value);
});
```

* * *

<a name="balena.models.device.serviceVar.getAllByApplication"></a>

#### serviceVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all device service variable overrides by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  
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
balena.models.device.serviceVar.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.device.serviceVar.getAllByDevice"></a>

#### serviceVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all service variable overrides for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.serviceVar.getAllByDevice('7cf02a69e4d34c9da573914963cf54fd').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.device.serviceVar.remove"></a>

#### serviceVar.remove(uuidOrId, serviceNameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Clear the overridden value of a service variable on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>serviceNameOrId</td><td><code>String</code> | <code>Number</code></td><td><p>service name (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a69e4d34c9da573914963cf54fd', 123, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a69e4d34c9da573914963cf54fd', 'myservice', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
	...
});
```

* * *

<a name="balena.models.device.serviceVar.set"></a>

#### serviceVar.set(uuidOrId, serviceNameOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Set the overriden value of a service variable on a device  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>serviceNameOrId</td><td><code>String</code> | <code>Number</code></td><td><p>service name (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>variable name</p>
</td>
    </tr><tr>
    <td>value</td><td><code>String</code></td><td><p>variable value</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.serviceVar.set('7cf02a69e4d34c9da573914963cf54fd', 123, 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set('7cf02a69e4d34c9da573914963cf54fd', 'myservice', 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
	...
});
```

* * *

<a name="balena.models.device.tags"></a>

### device.tags : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.tags](#balena.models.device.tags) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
    * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.device.tags.getAllByApplication"></a>

#### tags.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  
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
balena.models.device.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```

* * *

<a name="balena.models.device.tags.getAllByDevice"></a>

#### tags.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.tags.getAllByDevice('7cf02a69e4d34c9da573914963cf54fd').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByDevice(123).then(function(tags) {
	console.log(tags);
});
```

* * *

<a name="balena.models.device.tags.remove"></a>

#### tags.remove(uuidOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Remove a device tag  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>tagKey</td><td><code>String</code></td><td><p>tag key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.tags.remove('7cf02a69e4d34c9da573914963cf54fd', 'EDITOR');
```

* * *

<a name="balena.models.device.tags.set"></a>

#### tags.set(uuidOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Set a device tag  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>tagKey</td><td><code>String</code></td><td><p>tag key</p>
</td>
    </tr><tr>
    <td>value</td><td><code>String</code> | <code>undefined</code></td><td><p>tag value</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.device.tags.set('7cf02a69e4d34c9da573914963cf54fd', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.device.tags.set(123, 'EDITOR', 'vim');
```

* * *

