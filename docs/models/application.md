<a name="balena.models.application"></a>

## .application : <code>object</code>
**Kind**: static namespace  

* [.application](#balena.models.application) : <code>object</code>
    * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
    * [.disableDeviceUrls(slugOrUuidOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
    * [.enableDeviceUrls(slugOrUuidOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
    * [.generateProvisioningKey(generateProvisioningKeyParams)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
    * [.get(slugOrUuidOrId, [options], [context])](#balena.models.application.get) ⇒ <code>Promise</code>
    * [.getAll([options], [context])](#balena.models.application.getAll) ⇒ <code>Promise</code>
    * [.getAllByOrganization(orgHandleOrId, [options])](#balena.models.application.getAllByOrganization) ⇒ <code>Promise</code>
    * [.getAllDirectlyAccessible([options])](#balena.models.application.getAllDirectlyAccessible) ⇒ <code>Promise</code>
    * [.getAppByName(appName, [options], [context])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
    * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
    * [.getDirectlyAccessible(slugOrUuidOrId, [options])](#balena.models.application.getDirectlyAccessible) ⇒ <code>Promise</code>
    * [.getTargetReleaseHash(slugOrUuidOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
    * [.getWithDeviceServiceDetails(slugOrUuidOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
    * [.grantSupportAccess(slugOrUuidOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
    * [.has(slugOrUuidOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
    * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
    * [.isTrackingLatestRelease(slugOrUuidOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
    * [.pinToRelease(slugOrUuidOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
    * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
    * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrIdOrIds)](#balena.models.application.remove) ⇒ <code>Promise</code>
    * [.rename(slugOrUuidOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
    * [.restart(slugOrUuidOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(slugOrUuidOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
    * [.trackLatestRelease(slugOrUuidOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
    * [.willTrackNewReleases(slugOrUuidOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
    * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
        * [.get(slugOrUuidOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.application.configVar) : <code>object</code>
        * [.get(slugOrUuidOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.application.envVar) : <code>object</code>
        * [.get(slugOrUuidOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
    * [.invite](#balena.models.application.invite) : <code>object</code>
        * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
        * [.create(slugOrUuidOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
    * [.membership](#balena.models.application.membership) : <code>object</code>
        * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
        * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByUser(usernameOrId, [options])](#balena.models.application.membership.getAllByUser) ⇒ <code>Promise</code>
        * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
    * [.tags](#balena.models.application.tags) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.create"></a>

### application.create(options) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Create an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>Object</code></td><td><p>application creation parameters</p>
</td>
    </tr><tr>
    <td>options.name</td><td><code>String</code></td><td><p>application name</p>
</td>
    </tr><tr>
    <td>options.organization</td><td><code>String</code> | <code>Number</code></td><td><p>handle (string) or id (number) of the organization that the application will belong to or null</p>
</td>
    </tr><tr>
    <td>[options.uuid]</td><td><code>String</code></td><td><p>application uuid</p>
</td>
    </tr><tr>
    <td>[options.applicationClass]</td><td><code>String</code></td><td><p>application class: &#39;app&#39; | &#39;fleet&#39; | &#39;block&#39;</p>
</td>
    </tr><tr>
    <td>options.deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.create({ name: 'My App', organization: 'myorganization', deviceType: 'raspberry-pi' }).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My Block', organization: 'myorganization', applicationClass: 'block', deviceType: 'raspberry-pi' }).then(function(application) {
	console.log(application);
});
```

* * *

<a name="balena.models.application.disableDeviceUrls"></a>

### application.disableDeviceUrls(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Disable device urls for all devices that belong to an application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.disableDeviceUrls('myorganization/myapp');
```
**Example**  
```js
balena.models.application.disableDeviceUrls(123);
```

* * *

<a name="balena.models.application.enableDeviceUrls"></a>

### application.enableDeviceUrls(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Enable device urls for all devices that belong to an application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.enableDeviceUrls('myorganization/myapp');
```
**Example**  
```js
balena.models.application.enableDeviceUrls(123);
```

* * *

<a name="balena.models.application.generateProvisioningKey"></a>

### application.generateProvisioningKey(generateProvisioningKeyParams) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Generate a device provisioning key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - device provisioning key  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>generateProvisioningKeyParams</td><td><code>Object</code></td><td><p>an object containing the parameters for the provisioning key generation</p>
</td>
    </tr><tr>
    <td>generateProvisioningKeyParams.slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>generateProvisioningKeyParams.keyExpiryDate</td><td><code>String</code></td><td><p>Expiry Date for provisioning key</p>
</td>
    </tr><tr>
    <td>[generateProvisioningKeyParams.keyName]</td><td><code>String</code></td><td><p>Provisioning key name</p>
</td>
    </tr><tr>
    <td>[generateProvisioningKeyParams.keyDescription]</td><td><code>String</code></td><td><p>Description for provisioning key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.generateProvisioningKey({slugOrUuidOrId: 'myorganization/myapp', keyExpiryDate: '2030-10-12'}).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.application.generateProvisioningKey({slugOrUuidOrId: 123, keyExpiryDate: '2030-10-12'}).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.application.generateProvisioningKey({slugOrUuidOrId: 123, keyExpiryDate: '2030-10-12', keyName: 'api key name', keyDescription: 'api key long description'}).then(function(key) {
	console.log(key);
});
```

* * *

<a name="balena.models.application.get"></a>

### application.get(slugOrUuidOrId, [options], [context]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  
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
    </tr><tr>
    <td>[context]</td><td><code>String</code></td><td></td><td><p>extra access filters, undefined or &#39;directly_accessible&#39;</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.get('myorganization/myapp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.get('1bf99a68cf9e4266986e6dec7a6e8f46').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.get(123).then(function(application) {
	console.log(application);
});
```

* * *

<a name="balena.models.application.getAll"></a>

### application.getAll([options], [context]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  
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
    </tr><tr>
    <td>[context]</td><td><code>String</code></td><td></td><td><p>extra access filters, undefined or &#39;directly_accessible&#39;</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.getAll().then(function(applications) {
	console.log(applications);
});
```

* * *

<a name="balena.models.application.getAllByOrganization"></a>

### application.getAllByOrganization(orgHandleOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications of an organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>orgHandleOrId</td><td><code>Number</code> | <code>String</code></td><td></td><td><p>organization handle (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.getAllByOrganization('myorganization').then(function(applications) {
	console.log(applications);
});
```
**Example**  
```js
const applications = await sdk.models.application.getAllByOrganization('myorganization', {
		$select: ['app_name', 'slug'],
		$expand: {
			owns__device: {
				$select: ['uuid', 'overall_status', 'is_connected_to_vpn', 'api_heartbeat_state'],
			},
		},
	});
```

* * *

<a name="balena.models.application.getAllDirectlyAccessible"></a>

### application.getAllDirectlyAccessible([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications directly accessible by the user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  
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
balena.models.application.getAllDirectlyAccessible().then(function(applications) {
	console.log(applications);
});
```

* * *

<a name="balena.models.application.getAppByName"></a>

### application.getAppByName(appName, [options], [context]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application using the appname and the handle of the owning organization  
**Access**: public  
**Fulfil**: <code>Object</code> - application  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>appName</td><td><code>String</code></td><td></td><td><p>application name</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr><tr>
    <td>[context]</td><td><code>String</code></td><td></td><td><p>extra access filters, undefined or &#39;directly_accessible&#39;</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.getAppByName('MyApp').then(function(application) {
	console.log(application);
});
```

* * *

<a name="balena.models.application.getDashboardUrl"></a>

### application.getDashboardUrl(id) ⇒ <code>String</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get Dashboard URL for a specific application  
**Returns**: <code>String</code> - - Dashboard URL for the specific application  
**Throws**:

- Exception if the id is not a finite number

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>Application id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.get('myorganization/myapp').then(function(application) {
	const dashboardApplicationUrl = balena.models.application.getDashboardUrl(application.id);
	console.log(dashboardApplicationUrl);
});
```

* * *

<a name="balena.models.application.getDirectlyAccessible"></a>

### application.getDirectlyAccessible(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application directly accessible by the user  
**Access**: public  
**Fulfil**: <code>Object</code> - application  
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
balena.models.application.getDirectlyAccessible('myorganization/myapp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.getDirectlyAccessible(123).then(function(application) {
	console.log(application);
});
```

* * *

<a name="balena.models.application.getTargetReleaseHash"></a>

### application.getTargetReleaseHash(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get the hash of the current release for a specific application  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - The release hash of the current release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.getTargetReleaseHash('myorganization/myapp').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.application.getTargetReleaseHash(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.application.getTargetReleaseHash('myorganization/myapp', function(release) {
	console.log(release);
});
```

* * *

<a name="balena.models.application.getWithDeviceServiceDetails"></a>

### application.getWithDeviceServiceDetails(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `application.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application and its devices, along with each device's
associated services' essential details  
**Access**: public  
**Fulfil**: <code>Object</code> - application  
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
balena.models.application.getWithDeviceServiceDetails('myorganization/myapp').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
	console.log(device);
})
```

* * *

<a name="balena.models.application.grantSupportAccess"></a>

### application.grantSupportAccess(slugOrUuidOrId, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Grant support access to an application until a specified time  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>expiryTimestamp</td><td><code>Number</code></td><td><p>a timestamp in ms for when the support access will expire</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.grantSupportAccess('myorganization/myapp', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
```

* * *

<a name="balena.models.application.has"></a>

### application.has(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if an application exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has application  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.has('myorganization/myapp').then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
balena.models.application.has(123).then(function(hasApp) {
	console.log(hasApp);
});
```

* * *

<a name="balena.models.application.hasAny"></a>

### application.hasAny() ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if the user has access to any applications  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has any applications  
**Example**  
```js
balena.models.application.hasAny().then(function(hasAny) {
	console.log('Has any?', hasAny);
});
```

* * *

<a name="balena.models.application.isTrackingLatestRelease"></a>

### application.isTrackingLatestRelease(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get whether the application is up to date and is tracking the latest finalized release for updates  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the latest release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.isTrackingLatestRelease('myorganization/myapp').then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.application.isTrackingLatestRelease(123).then(function(isEnabled) {
	console.log(isEnabled);
});
```

* * *

<a name="balena.models.application.pinToRelease"></a>

### application.pinToRelease(slugOrUuidOrId, fullReleaseHash) ⇒ <code>Promise</code>
Configures the application to run a particular release
and not get updated when the latest release changes.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Set a specific application to run a particular release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>fullReleaseHash</td><td><code>String</code></td><td><p>the hash of a successful release (string)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.pinToRelease('myorganization/myapp', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```

* * *

<a name="balena.models.application.purge"></a>

### application.purge(appId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Purge devices by application id  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>appId</td><td><code>Number</code></td><td><p>application id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.purge(123);
```

* * *

<a name="balena.models.application.reboot"></a>

### application.reboot(appId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Reboot devices by application id  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>appId</td><td><code>Number</code></td><td></td><td><p>application id</p>
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
balena.models.application.reboot(123);
```

* * *

<a name="balena.models.application.remove"></a>

### application.remove(slugOrUuidOrIdOrIds) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Remove application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrIdOrIds</td><td><code>String</code> | <code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>application slug (string), uuid (string) or id (number) or array of ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.remove('myorganization/myapp');
```
**Example**  
```js
balena.models.application.remove(123);
```

* * *

<a name="balena.models.application.rename"></a>

### application.rename(slugOrUuidOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Rename application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>newName</td><td><code>String</code></td><td><p>new application name (string)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.rename('myorganization/myapp', 'MyRenamedApp');
```
**Example**  
```js
balena.models.application.rename(123, 'MyRenamedApp');
```

* * *

<a name="balena.models.application.restart"></a>

### application.restart(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Restart application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.restart('myorganization/myapp');
```
**Example**  
```js
balena.models.application.restart(123);
```

* * *

<a name="balena.models.application.revokeSupportAccess"></a>

### application.revokeSupportAccess(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Revoke support access to an application  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.revokeSupportAccess('myorganization/myapp');
```
**Example**  
```js
balena.models.application.revokeSupportAccess(123);
```

* * *

<a name="balena.models.application.shutdown"></a>

### application.shutdown(appId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Shutdown devices by application id  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>appId</td><td><code>Number</code></td><td></td><td><p>application id</p>
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
balena.models.application.shutdown(123);
```

* * *

<a name="balena.models.application.trackLatestRelease"></a>

### application.trackLatestRelease(slugOrUuidOrId) ⇒ <code>Promise</code>
The application's current release will be updated with each new successfully built release.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Configure a specific application to track the latest finalized available release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.trackLatestRelease('myorganization/myapp').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.trackLatestRelease(123).then(function() {
	...
});
```

* * *

<a name="balena.models.application.willTrackNewReleases"></a>

### application.willTrackNewReleases(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get whether the application is configured to receive updates whenever a new release is available  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the latest release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.willTrackNewReleases('myorganization/myapp').then(function(isEnabled) {
	console.log(isEnabled);
});
```
**Example**  
```js
balena.models.application.willTrackNewReleases(123).then(function(isEnabled) {
	console.log(isEnabled);
});
```

* * *

<a name="balena.models.application.buildVar"></a>

### application.buildVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.buildVar](#balena.models.application.buildVar) : <code>object</code>
    * [.get(slugOrUuidOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.buildVar.get"></a>

#### buildVar.get(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Get the value of a specific build environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the build environment variable value (or undefined)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>build environment variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.buildVar.get('myorganization/myapp', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.buildVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```

* * *

<a name="balena.models.application.buildVar.getAllByApplication"></a>

#### buildVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Get all build environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application build environment variables  
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
balena.models.application.buildVar.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.buildVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.application.buildVar.remove"></a>

#### buildVar.remove(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Clear the value of a specific build environment variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>build environment variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.buildVar.remove('myorganization/myapp', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.buildVar.remove(999999, 'VAR').then(function() {
	...
});
```

* * *

<a name="balena.models.application.buildVar.set"></a>

#### buildVar.set(slugOrUuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Set the value of a specific build environment variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>build environment variable name</p>
</td>
    </tr><tr>
    <td>value</td><td><code>String</code></td><td><p>build environment variable value</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.buildVar.set('myorganization/myapp', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.buildVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```

* * *

<a name="balena.models.application.configVar"></a>

### application.configVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.configVar](#balena.models.application.configVar) : <code>object</code>
    * [.get(slugOrUuidOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.configVar.get"></a>

#### configVar.get(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
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
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>config variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.configVar.get('myorganization/myapp', 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```

* * *

<a name="balena.models.application.configVar.getAllByApplication"></a>

#### configVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get all config variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application config variables  
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
balena.models.application.configVar.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.application.configVar.remove"></a>

#### configVar.remove(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
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
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>config variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.configVar.remove('myorganization/myapp', 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
	...
});
```

* * *

<a name="balena.models.application.configVar.set"></a>

#### configVar.set(slugOrUuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
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
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
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
balena.models.application.configVar.set('myorganization/myapp', 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```

* * *

<a name="balena.models.application.envVar"></a>

### application.envVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.envVar](#balena.models.application.envVar) : <code>object</code>
    * [.get(slugOrUuidOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.envVar.get"></a>

#### envVar.get(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
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
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>environment variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.envVar.get('myorganization/myapp', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```

* * *

<a name="balena.models.application.envVar.getAllByApplication"></a>

#### envVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get all environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application environment variables  
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
balena.models.application.envVar.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```

* * *

<a name="balena.models.application.envVar.remove"></a>

#### envVar.remove(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
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
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>environment variable name</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.envVar.remove('myorganization/myapp', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.remove(999999, 'VAR').then(function() {
	...
});
```

* * *

<a name="balena.models.application.envVar.set"></a>

#### envVar.set(slugOrUuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
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
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
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
balena.models.application.envVar.set('myorganization/myapp', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```

* * *

<a name="balena.models.application.invite"></a>

### application.invite : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.invite](#balena.models.application.invite) : <code>object</code>
    * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
    * [.create(slugOrUuidOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.invite.accept"></a>

#### invite.accept(invitationToken) ⇒ <code>Promise</code>
This method adds the calling user to the application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Accepts an invite  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>invitationToken</td><td><code>String</code></td><td><p>invite token</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.invite.accept("qwerty-invitation-token");
```

* * *

<a name="balena.models.application.invite.create"></a>

#### invite.create(slugOrUuidOrId, options, [message]) ⇒ <code>Promise</code>
This method invites a user by their email to an application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Creates a new invite for an application  
**Access**: public  
**Fulfil**: <code>String</code> - application invite  
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
    <td>options</td><td><code>Object</code></td><td></td><td><p>invite creation parameters</p>
</td>
    </tr><tr>
    <td>options.invitee</td><td><code>String</code></td><td></td><td><p>the email of the invitee</p>
</td>
    </tr><tr>
    <td>[options.roleName]</td><td><code>String</code></td><td><code>&quot;developer&quot;</code></td><td><p>the role name to be granted to the invitee</p>
</td>
    </tr><tr>
    <td>[message]</td><td><code>String</code></td><td><code></code></td><td><p>the message to send along with the invite</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.invite.create('myorganization/myapp', { invitee: "invitee@example.org", roleName: "developer", message: "join my app" }).then(function(invite) {
	console.log(invite);
});
```

* * *

<a name="balena.models.application.invite.getAll"></a>

#### invite.getAll([options]) ⇒ <code>Promise</code>
This method returns all invites.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Get all invites  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  
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
balena.models.application.invite.getAll().then(function(invites) {
	console.log(invites);
});
```

* * *

<a name="balena.models.application.invite.getAllByApplication"></a>

#### invite.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method returns all invites for a specific application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Get all invites by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  
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
balena.models.application.invite.getAllByApplication('myorganization/myapp').then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.application.invite.getAllByApplication(123).then(function(invites) {
	console.log(invites);
});
```

* * *

<a name="balena.models.application.invite.revoke"></a>

#### invite.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Revoke an invite  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>application invite id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.invite.revoke(123);
```

* * *

<a name="balena.models.application.membership"></a>

### application.membership : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.membership](#balena.models.application.membership) : <code>object</code>
    * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
    * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByUser(usernameOrId, [options])](#balena.models.application.membership.getAllByUser) ⇒ <code>Promise</code>
    * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.membership.changeRole"></a>

#### membership.changeRole(idOrUniqueKey, roleName) ⇒ <code>Promise</code>
This method changes the role of an application member.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Changes the role of an application member  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>idOrUniqueKey</td><td><code>Number</code> | <code>Object</code></td><td><p>the id or an object with the unique <code>user</code> &amp; <code>is_member_of__application</code> numeric pair of the membership that will be changed</p>
</td>
    </tr><tr>
    <td>roleName</td><td><code>String</code></td><td><p>the role name to be granted to the membership</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.membership.changeRole(123, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.application.membership.changeRole({
	user: 123,
	is_member_of__application: 125,
}, "member").then(function() {
	console.log('OK');
});
```

* * *

<a name="balena.models.application.membership.create"></a>

#### membership.create(options) ⇒ <code>Promise</code>
This method adds a user to an application by their username if they are a member of the organization.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Creates a new membership for an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application membership  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>Object</code></td><td></td><td><p>membership creation parameters</p>
</td>
    </tr><tr>
    <td>options.application</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application handle (string), or id (number)</p>
</td>
    </tr><tr>
    <td>options.username</td><td><code>String</code></td><td></td><td><p>the username of the balena user that will become a member</p>
</td>
    </tr><tr>
    <td>[options.roleName]</td><td><code>String</code></td><td><code>&quot;member&quot;</code></td><td><p>the role name to be granted to the membership</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.membership.create({ application: "myApp", username: "user123", roleName: "member" }).then(function(membership) {
	console.log(membership);
});
```

* * *

<a name="balena.models.application.membership.get"></a>

#### membership.get(membershipId, [options]) ⇒ <code>Promise</code>
This method returns a single application membership.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get a single application membership  
**Access**: public  
**Fulfil**: <code>Object</code> - application membership  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>membershipId</td><td><code>number</code> | <code>Object</code></td><td></td><td><p>the id or an object with the unique <code>user</code> &amp; <code>is_member_of__application</code> numeric pair of the membership</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.membership.get(5).then(function(memberships) {
	console.log(memberships);
});
```

* * *

<a name="balena.models.application.membership.getAllByApplication"></a>

#### membership.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method returns all application memberships for a specific application.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get all memberships by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application memberships  
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
balena.models.application.membership.getAllByApplication('myorganization/myapp').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.application.membership.getAllByApplication(123).then(function(memberships) {
	console.log(memberships);
});
```

* * *

<a name="balena.models.application.membership.getAllByUser"></a>

#### membership.getAllByUser(usernameOrId, [options]) ⇒ <code>Promise</code>
This method returns all application memberships for a specific user.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get all memberships by user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application memberships  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>usernameOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>the user&#39;s username (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.membership.getAllByUser('balena_os').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.application.membership.getAllByUser(123).then(function(memberships) {
	console.log(memberships);
});
```

* * *

<a name="balena.models.application.membership.remove"></a>

#### membership.remove(idOrUniqueKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Remove a membership  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>idOrUniqueKey</td><td><code>Number</code> | <code>Object</code></td><td><p>the id or an object with the unique <code>user</code> &amp; <code>is_member_of__application</code> numeric pair of the membership that will be removed</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.membership.remove(123);
```
**Example**  
```js
balena.models.application.membership.remove({
	user: 123,
	is_member_of__application: 125,
});
```

* * *

<a name="balena.models.application.tags"></a>

### application.tags : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.tags](#balena.models.application.tags) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.application.tags.getAllByApplication"></a>

#### tags.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Get all application tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application tags  
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
balena.models.application.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```

* * *

<a name="balena.models.application.tags.remove"></a>

#### tags.remove(slugOrUuidOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Remove an application tag  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>tagKey</td><td><code>String</code></td><td><p>tag key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.application.tags.remove('myorganization/myapp', 'EDITOR');
```

* * *

<a name="balena.models.application.tags.set"></a>

#### tags.set(slugOrUuidOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Set an application tag  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td><p>application slug (string), uuid (string) or id (number)</p>
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
balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.application.tags.set(123, 'EDITOR', 'vim');
```

* * *

