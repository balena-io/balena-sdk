<a name="balena"></a>

## balena : <code>object</code>
Welcome to the Balena SDK documentation.

This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.

If you feel something is missing, not clear or could be improved, please don't hesitate to open an [issue in GitHub](https://github.com/balena-io/balena-sdk/issues/new), we'll be happy to help.

**Kind**: global namespace  

* [balena](#balena) : <code>object</code>
    * [.interceptors](#balena.interceptors) : <code>Array.&lt;Interceptor&gt;</code>
        * [.Interceptor](#balena.interceptors.Interceptor) : <code>object</code>
    * [.request](#balena.request) : <code>Object</code>
    * [.pine](#balena.pine) : <code>Object</code>
    * [.errors](#balena.errors) : <code>Object</code>
    * [.models](#balena.models) : <code>object</code>
        * [.application](#balena.models.application) : <code>object</code>
            * [.tags](#balena.models.application.tags) : <code>object</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
                * [.set(nameOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
                * [.remove(nameOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
            * [.configVar](#balena.models.application.configVar) : <code>object</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(nameOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
                * [.set(nameOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
                * [.remove(nameOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
            * [.envVar](#balena.models.application.envVar) : <code>object</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(nameOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
                * [.set(nameOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
                * [.remove(nameOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.application.getAll) ⇒ <code>Promise</code>
            * [.get(nameOrId, [options])](#balena.models.application.get) ⇒ <code>Promise</code>
            * [.getWithDeviceServiceDetails(nameOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
            * [.getAppByOwner(appName, owner, [options])](#balena.models.application.getAppByOwner) ⇒ <code>Promise</code>
            * [.has(nameOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
            * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
            * [.remove(nameOrId)](#balena.models.application.remove) ⇒ <code>Promise</code>
            * [.restart(nameOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
            * ~~[.generateApiKey(nameOrId)](#balena.models.application.generateApiKey) ⇒ <code>Promise</code>~~
            * [.generateProvisioningKey(nameOrId)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
            * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
            * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
            * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
            * [.enableDeviceUrls(nameOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
            * [.disableDeviceUrls(nameOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
            * [.grantSupportAccess(nameOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
            * [.revokeSupportAccess(nameOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
        * [.device](#balena.models.device) : <code>object</code>
            * [.tags](#balena.models.device.tags) : <code>object</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
                * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
            * [.configVar](#balena.models.device.configVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
            * [.envVar](#balena.models.device.envVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
            * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
            * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
            * [.getAll([options])](#balena.models.device.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByParentDevice(parentUuidOrId, [options])](#balena.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
            * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
            * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
            * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
            * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
            * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
            * ~~[.getApplicationInfo(uuidOrId)](#balena.models.device.getApplicationInfo) ⇒ <code>Promise</code>~~
            * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
            * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
            * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
            * [.remove(uuidOrId)](#balena.models.device.remove) ⇒ <code>Promise</code>
            * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
            * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
            * [.note(uuidOrId, note)](#balena.models.device.note) ⇒ <code>Promise</code>
            * [.setCustomLocation(uuidOrId, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
            * [.unsetCustomLocation(uuidOrId)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
            * [.move(uuidOrId, applicationNameOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
            * ~~[.startApplication(uuidOrId)](#balena.models.device.startApplication) ⇒ <code>Promise</code>~~
            * ~~[.stopApplication(uuidOrId)](#balena.models.device.stopApplication) ⇒ <code>Promise</code>~~
            * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
            * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
            * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
            * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
            * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
            * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
            * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
            * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
            * [.getDisplayName(deviceTypeSlug)](#balena.models.device.getDisplayName) ⇒ <code>Promise</code>
            * [.getDeviceSlug(deviceTypeName)](#balena.models.device.getDeviceSlug) ⇒ <code>Promise</code>
            * [.getSupportedDeviceTypes()](#balena.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
            * [.getManifestBySlug(slug)](#balena.models.device.getManifestBySlug) ⇒ <code>Promise</code>
            * [.getManifestByApplication(nameOrId)](#balena.models.device.getManifestByApplication) ⇒ <code>Promise</code>
            * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
            * [.register(applicationNameOrId, [uuid])](#balena.models.device.register) ⇒ <code>Promise</code>
            * [.generateDeviceKey(uuidOrId)](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
            * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
            * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
            * [.enableDeviceUrl(uuidOrId)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
            * [.disableDeviceUrl(uuidOrId)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
            * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
            * [.getStatus(device)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
            * [.grantSupportAccess(uuidOrId, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
            * [.revokeSupportAccess(uuidOrId)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
            * [.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>
        * [.apiKey](#balena.models.apiKey) : <code>object</code>
            * [.create(name, [description])](#balena.models.apiKey.create) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
            * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>
        * [.key](#balena.models.key) : <code>object</code>
            * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
            * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
            * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
            * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>
        * [.os](#balena.models.os) : <code>object</code>
            * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
            * [.getSupportedVersions(deviceType)](#balena.models.os.getSupportedVersions) ⇒ <code>Promise</code>
            * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
            * [.getLastModified(deviceType, [version])](#balena.models.os.getLastModified) ⇒ <code>Promise</code>
            * [.download(deviceType, [version])](#balena.models.os.download) ⇒ <code>Promise</code>
            * [.getConfig(nameOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
        * [.config](#balena.models.config) : <code>object</code>
            * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
            * [.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>
            * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
        * [.release](#balena.models.release) : <code>object</code>
            * [.tags](#balena.models.release.tags) : <code>object</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByRelease(id, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
                * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
                * [.set(releaseId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
                * [.remove(releaseId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
            * [.get(id, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
            * [.getWithImageDetails(id, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
        * [.service](#balena.models.service) : <code>object</code>
            * [.var](#balena.models.service.var) : <code>object</code>
                * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
                * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
                * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
        * [.image](#balena.models.image) : <code>object</code>
            * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
            * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>
        * [.billing](#balena.models.billing) : <code>object</code>
            * [.getAccount()](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
            * [.getPlan()](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
            * [.getBillingInfo()](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
            * [.updateBillingInfo()](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
            * [.getInvoices()](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
            * [.downloadInvoice()](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>
    * [.auth](#balena.auth) : <code>object</code>
        * [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
            * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
            * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
            * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
        * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
        * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
        * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
        * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
        * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
        * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
        * [.getUserId()](#balena.auth.getUserId) ⇒ <code>Promise</code>
        * [.getEmail()](#balena.auth.getEmail) ⇒ <code>Promise</code>
        * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
        * [.register([credentials])](#balena.auth.register) ⇒ <code>Promise</code>
    * [.logs](#balena.logs) : <code>object</code>
        * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise</code>
        * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
        * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
            * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
            * ["line"](#balena.logs.LogSubscription.event_line)
            * ["error"](#balena.logs.LogSubscription.event_error)
    * [.settings](#balena.settings) : <code>object</code>
        * [.get([key])](#balena.settings.get) ⇒ <code>Promise</code>
        * [.getAll()](#balena.settings.getAll) ⇒ <code>Promise</code>
    * [.setSharedOptions()](#balena.setSharedOptions)
    * [.fromSharedOptions()](#balena.fromSharedOptions)

<a name="balena.interceptors"></a>

### balena.interceptors : <code>Array.&lt;Interceptor&gt;</code>
The current array of interceptors to use. Interceptors intercept requests made
internally and are executed in the order they appear in this array for requests,
and in the reverse order for responses.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Array of interceptors  
**Access**: public  
**Example**  
```js
balena.interceptors.push({
	responseError: function (error) {
		console.log(error);
		throw error;
	})
});
```
<a name="balena.interceptors.Interceptor"></a>

#### interceptors.Interceptor : <code>object</code>
An interceptor implements some set of the four interception hook callbacks.
To continue processing, each function should return a value or a promise that
successfully resolves to a value.

To halt processing, each function should throw an error or return a promise that
rejects with an error.

**Kind**: static typedef of [<code>interceptors</code>](#balena.interceptors)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [request] | <code>function</code> | Callback invoked before requests are made. Called with the request options, should return (or resolve to) new request options, or throw/reject. |
| [response] | <code>function</code> | Callback invoked before responses are returned. Called with the response, should return (or resolve to) a new response, or throw/reject. |
| [requestError] | <code>function</code> | Callback invoked if an error happens before a request. Called with the error itself, caused by a preceeding request interceptor rejecting/throwing an error for the request, or a failing in preflight token validation. Should return (or resolve to) new request options, or throw/reject. |
| [responseError] | <code>function</code> | Callback invoked if an error happens in the response. Called with the error itself, caused by a preceeding response interceptor rejecting/throwing an error for the request, a network error, or an error response from the server. Should return (or resolve to) a new response, or throw/reject. |

<a name="balena.request"></a>

### balena.request : <code>Object</code>
The balena-request instance used internally. This should not be necessary
in normal usage, but can be useful if you want to make an API request directly,
using the same token and hooks as the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena request instance  
**Access**: public  
**Example**  
```js
balena.request.send({ url: 'http://api.balena-cloud.com/ping' });
```
<a name="balena.pine"></a>

### balena.pine : <code>Object</code>
The balena-pine instance used internally. This should not be necessary
in normal usage, but can be useful if you want to directly make pine
queries to the api for some resource that isn't directly supported
in the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena pine instance  
**Access**: public  
**Example**  
```js
balena.pine.get({
	resource: 'release/$count',
	options: {
		$filter: { belongs_to__application: applicationId }
	}
});
```
<a name="balena.errors"></a>

### balena.errors : <code>Object</code>
The balena-errors module used internally. This is provided primarily for
convenience, and to avoid the necessity for separate balena-errors
dependencies. You'll want to use this if you need to match on the specific
type of error thrown by the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena errors module  
**Access**: public  
**Example**  
```js
balena.models.device.get(123).catch(function (error) {
  if (error.code === balena.errors.BalenaDeviceNotFound.code) {
    ...
  } else if (error.code === balena.errors.BalenaRequestError.code) {
    ...
  }
});
```
<a name="balena.models"></a>

### balena.models : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.models](#balena.models) : <code>object</code>
    * [.application](#balena.models.application) : <code>object</code>
        * [.tags](#balena.models.application.tags) : <code>object</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
            * [.set(nameOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
            * [.remove(nameOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
        * [.configVar](#balena.models.application.configVar) : <code>object</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(nameOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
            * [.set(nameOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
            * [.remove(nameOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
        * [.envVar](#balena.models.application.envVar) : <code>object</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(nameOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
            * [.set(nameOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
            * [.remove(nameOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.application.getAll) ⇒ <code>Promise</code>
        * [.get(nameOrId, [options])](#balena.models.application.get) ⇒ <code>Promise</code>
        * [.getWithDeviceServiceDetails(nameOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
        * [.getAppByOwner(appName, owner, [options])](#balena.models.application.getAppByOwner) ⇒ <code>Promise</code>
        * [.has(nameOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
        * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
        * [.remove(nameOrId)](#balena.models.application.remove) ⇒ <code>Promise</code>
        * [.restart(nameOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
        * ~~[.generateApiKey(nameOrId)](#balena.models.application.generateApiKey) ⇒ <code>Promise</code>~~
        * [.generateProvisioningKey(nameOrId)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
        * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
        * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
        * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
        * [.enableDeviceUrls(nameOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
        * [.disableDeviceUrls(nameOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
        * [.grantSupportAccess(nameOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
        * [.revokeSupportAccess(nameOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.device](#balena.models.device) : <code>object</code>
        * [.tags](#balena.models.device.tags) : <code>object</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
            * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
        * [.configVar](#balena.models.device.configVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
        * [.envVar](#balena.models.device.envVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
        * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
        * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
        * [.getAll([options])](#balena.models.device.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByParentDevice(parentUuidOrId, [options])](#balena.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
        * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
        * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
        * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
        * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
        * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
        * ~~[.getApplicationInfo(uuidOrId)](#balena.models.device.getApplicationInfo) ⇒ <code>Promise</code>~~
        * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
        * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
        * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
        * [.remove(uuidOrId)](#balena.models.device.remove) ⇒ <code>Promise</code>
        * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
        * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
        * [.note(uuidOrId, note)](#balena.models.device.note) ⇒ <code>Promise</code>
        * [.setCustomLocation(uuidOrId, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
        * [.unsetCustomLocation(uuidOrId)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
        * [.move(uuidOrId, applicationNameOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
        * ~~[.startApplication(uuidOrId)](#balena.models.device.startApplication) ⇒ <code>Promise</code>~~
        * ~~[.stopApplication(uuidOrId)](#balena.models.device.stopApplication) ⇒ <code>Promise</code>~~
        * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
        * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
        * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
        * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
        * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
        * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
        * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
        * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
        * [.getDisplayName(deviceTypeSlug)](#balena.models.device.getDisplayName) ⇒ <code>Promise</code>
        * [.getDeviceSlug(deviceTypeName)](#balena.models.device.getDeviceSlug) ⇒ <code>Promise</code>
        * [.getSupportedDeviceTypes()](#balena.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
        * [.getManifestBySlug(slug)](#balena.models.device.getManifestBySlug) ⇒ <code>Promise</code>
        * [.getManifestByApplication(nameOrId)](#balena.models.device.getManifestByApplication) ⇒ <code>Promise</code>
        * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
        * [.register(applicationNameOrId, [uuid])](#balena.models.device.register) ⇒ <code>Promise</code>
        * [.generateDeviceKey(uuidOrId)](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
        * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
        * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
        * [.enableDeviceUrl(uuidOrId)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
        * [.disableDeviceUrl(uuidOrId)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
        * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
        * [.getStatus(device)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
        * [.grantSupportAccess(uuidOrId, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
        * [.revokeSupportAccess(uuidOrId)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
        * [.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>
    * [.apiKey](#balena.models.apiKey) : <code>object</code>
        * [.create(name, [description])](#balena.models.apiKey.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
        * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>
    * [.key](#balena.models.key) : <code>object</code>
        * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
        * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
        * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>
    * [.os](#balena.models.os) : <code>object</code>
        * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
        * [.getSupportedVersions(deviceType)](#balena.models.os.getSupportedVersions) ⇒ <code>Promise</code>
        * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
        * [.getLastModified(deviceType, [version])](#balena.models.os.getLastModified) ⇒ <code>Promise</code>
        * [.download(deviceType, [version])](#balena.models.os.download) ⇒ <code>Promise</code>
        * [.getConfig(nameOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
    * [.config](#balena.models.config) : <code>object</code>
        * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
        * [.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>
        * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
    * [.release](#balena.models.release) : <code>object</code>
        * [.tags](#balena.models.release.tags) : <code>object</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByRelease(id, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
            * [.set(releaseId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
            * [.remove(releaseId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
        * [.get(id, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
        * [.getWithImageDetails(id, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
    * [.service](#balena.models.service) : <code>object</code>
        * [.var](#balena.models.service.var) : <code>object</code>
            * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
            * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
            * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
    * [.image](#balena.models.image) : <code>object</code>
        * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
        * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>
    * [.billing](#balena.models.billing) : <code>object</code>
        * [.getAccount()](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
        * [.getPlan()](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
        * [.getBillingInfo()](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
        * [.updateBillingInfo()](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
        * [.getInvoices()](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
        * [.downloadInvoice()](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>

<a name="balena.models.application"></a>

#### models.application : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.application](#balena.models.application) : <code>object</code>
    * [.tags](#balena.models.application.tags) : <code>object</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
        * [.set(nameOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
        * [.remove(nameOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.application.configVar) : <code>object</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(nameOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
        * [.set(nameOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
        * [.remove(nameOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.application.envVar) : <code>object</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(nameOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
        * [.set(nameOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
        * [.remove(nameOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.application.getAll) ⇒ <code>Promise</code>
    * [.get(nameOrId, [options])](#balena.models.application.get) ⇒ <code>Promise</code>
    * [.getWithDeviceServiceDetails(nameOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
    * [.getAppByOwner(appName, owner, [options])](#balena.models.application.getAppByOwner) ⇒ <code>Promise</code>
    * [.has(nameOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
    * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
    * [.remove(nameOrId)](#balena.models.application.remove) ⇒ <code>Promise</code>
    * [.restart(nameOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
    * ~~[.generateApiKey(nameOrId)](#balena.models.application.generateApiKey) ⇒ <code>Promise</code>~~
    * [.generateProvisioningKey(nameOrId)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
    * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
    * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
    * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
    * [.enableDeviceUrls(nameOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
    * [.disableDeviceUrls(nameOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
    * [.grantSupportAccess(nameOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(nameOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>

<a name="balena.models.application.tags"></a>

##### application.tags : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.tags](#balena.models.application.tags) : <code>object</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.application.tags.getAll) ⇒ <code>Promise</code>
    * [.set(nameOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
    * [.remove(nameOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.tags.getAllByApplication"></a>

###### tags.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Get all application tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.tags.getAllByApplication('MyApp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAllByApplication('MyApp', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.application.tags.getAll"></a>

###### tags.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Get all application tags  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.tags.getAll().then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.application.tags.getAll(function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.application.tags.set"></a>

###### tags.set(nameOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Set an application tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.application.tags.set('7cf02a6', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.application.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.application.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.tags.remove"></a>

###### tags.remove(nameOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Remove an application tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.application.tags.remove('7cf02a6', 'EDITOR');
```
**Example**  
```js
balena.models.application.tags.remove('7cf02a6', 'EDITOR', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.configVar"></a>

##### application.configVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.configVar](#balena.models.application.configVar) : <code>object</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(nameOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
    * [.set(nameOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
    * [.remove(nameOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.configVar.getAllByApplication"></a>

###### configVar.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get all config variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.configVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.configVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.configVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.application.configVar.get"></a>

###### configVar.get(nameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get the value of a specific config variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the config variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.application.configVar.get('MyApp', 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.configVar.get(999999, 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.configVar.get('MyApp', 'BALENA_VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.application.configVar.set"></a>

###### configVar.set(nameOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Set the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| key | <code>String</code> | config variable name |
| value | <code>String</code> | config variable value |

**Example**  
```js
balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.set('MyApp', 'BALENA_VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.configVar.remove"></a>

###### configVar.remove(nameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Clear the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.application.configVar.remove('MyApp', 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.remove(999999, 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.configVar.remove('MyApp', 'BALENA_VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.envVar"></a>

##### application.envVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.envVar](#balena.models.application.envVar) : <code>object</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(nameOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
    * [.set(nameOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
    * [.remove(nameOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.envVar.getAllByApplication"></a>

###### envVar.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get all environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.envVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.envVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.application.envVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.application.envVar.get"></a>

###### envVar.get(nameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get the value of a specific environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.application.envVar.get('MyApp', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.envVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.application.envVar.get('MyApp', 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.application.envVar.set"></a>

###### envVar.set(nameOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Set the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| key | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.set('MyApp', 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.envVar.remove"></a>

###### envVar.remove(nameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Clear the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.application.envVar.remove('MyApp', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.application.envVar.remove('MyApp', 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.application.getAll"></a>

##### application.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAll().then(function(applications) {
	console.log(applications);
});
```
**Example**  
```js
balena.models.application.getAll(function(error, applications) {
	if (error) throw error;
	console.log(applications);
});
```
<a name="balena.models.application.get"></a>

##### application.get(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.get('MyApp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.get(123).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.get('MyApp', function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="balena.models.application.getWithDeviceServiceDetails"></a>

##### application.getWithDeviceServiceDetails(nameOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `application.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application and its deives, along with each device's
associated services' essential details  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getWithDeviceServiceDetails('7cf02a6').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.application.getWithDeviceServiceDetails(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.application.getWithDeviceServiceDetails('7cf02a6', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="balena.models.application.getAppByOwner"></a>

##### application.getAppByOwner(appName, owner, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application using the appname and owner's username  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>String</code> |  | application name |
| owner | <code>String</code> |  | The owner's username |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAppByOwner('MyApp', 'MyUser').then(function(application) {
	console.log(application);
});
```
<a name="balena.models.application.has"></a>

##### application.has(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if an application exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has application  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.has('MyApp').then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
balena.models.application.has(123).then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
balena.models.application.has('MyApp', function(error, hasApp) {
	if (error) throw error;
	console.log(hasApp);
});
```
<a name="balena.models.application.hasAny"></a>

##### application.hasAny() ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if the user has any applications  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has any applications  
**Example**  
```js
balena.models.application.hasAny().then(function(hasAny) {
	console.log('Has any?', hasAny);
});
```
**Example**  
```js
balena.models.application.hasAny(function(error, hasAny) {
	if (error) throw error;
	console.log('Has any?', hasAny);
});
```
<a name="balena.models.application.create"></a>

##### application.create(options) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Create an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | application creation parameters |
| options.name | <code>String</code> | application name |
| [options.applicationType] | <code>String</code> | application type slug e.g. microservices-starter |
| options.deviceType | <code>String</code> | device type slug |
| [options.parent] | <code>Number</code> \| <code>String</code> | parent application name or id |

**Example**  
```js
balena.models.application.create({ name: 'My App', applicationType: 'essentials', deviceType: 'raspberry-pi').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My App', applicationType: 'microservices', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My App', applicationType: 'microservices-starter', deviceType: 'raspberry-pi' }, function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="balena.models.application.remove"></a>

##### application.remove(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Remove application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.remove('MyApp');
```
**Example**  
```js
balena.models.application.remove(123);
```
**Example**  
```js
balena.models.application.remove('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.restart"></a>

##### application.restart(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Restart application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.restart('MyApp');
```
**Example**  
```js
balena.models.application.restart(123);
```
**Example**  
```js
balena.models.application.restart('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.generateApiKey"></a>

##### ~~application.generateApiKey(nameOrId) ⇒ <code>Promise</code>~~
***Deprecated***

Generally you shouldn't use this method: if you're provisioning a recent BalenaOS
version (2.4.0+) then generateProvisioningKey should work just as well, but
be more secure.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Generate an API key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - api key  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.generateApiKey('MyApp').then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.application.generateApiKey(123).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.application.generateApiKey('MyApp', function(error, apiKey) {
	if (error) throw error;
	console.log(apiKey);
});
```
<a name="balena.models.application.generateProvisioningKey"></a>

##### application.generateProvisioningKey(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Generate a device provisioning key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - device provisioning key  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.generateProvisioningKey('MyApp').then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.application.generateProvisioningKey(123).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.application.generateProvisioningKey('MyApp', function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="balena.models.application.purge"></a>

##### application.purge(appId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Purge devices by application id  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| appId | <code>Number</code> | application id |

**Example**  
```js
balena.models.application.purge(123);
```
**Example**  
```js
balena.models.application.purge(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.shutdown"></a>

##### application.shutdown(appId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Shutdown devices by application id  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appId | <code>Number</code> |  | application id |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.application.shutdown(123);
```
**Example**  
```js
balena.models.application.shutdown(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.reboot"></a>

##### application.reboot(appId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Reboot devices by application id  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appId | <code>Number</code> |  | application id |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.application.reboot(123);
```
**Example**  
```js
balena.models.application.reboot(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.enableDeviceUrls"></a>

##### application.enableDeviceUrls(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Enable device urls for all devices that belong to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.enableDeviceUrls('MyApp');
```
**Example**  
```js
balena.models.application.enableDeviceUrls(123);
```
**Example**  
```js
balena.models.device.enableDeviceUrls('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.disableDeviceUrls"></a>

##### application.disableDeviceUrls(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Disable device urls for all devices that belong to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.disableDeviceUrls('MyApp');
```
**Example**  
```js
balena.models.application.disableDeviceUrls(123);
```
**Example**  
```js
balena.models.device.disableDeviceUrls('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.grantSupportAccess"></a>

##### application.grantSupportAccess(nameOrId, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Grant support access to an application until a specified time  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| expiryTimestamp | <code>Number</code> | a timestamp in ms for when the support access will expire |

**Example**  
```js
balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.application.grantSupportAccess('MyApp', Date.now() + 3600 * 1000, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.application.revokeSupportAccess"></a>

##### application.revokeSupportAccess(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Revoke support access to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.application.revokeSupportAccess('MyApp');
```
**Example**  
```js
balena.models.application.revokeSupportAccess(123);
```
**Example**  
```js
balena.models.application.revokeSupportAccess('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device"></a>

#### models.device : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.device](#balena.models.device) : <code>object</code>
    * [.tags](#balena.models.device.tags) : <code>object</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
        * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.device.configVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.device.envVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
    * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
    * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
    * [.getAll([options])](#balena.models.device.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByParentDevice(parentUuidOrId, [options])](#balena.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
    * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
    * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
    * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
    * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
    * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
    * ~~[.getApplicationInfo(uuidOrId)](#balena.models.device.getApplicationInfo) ⇒ <code>Promise</code>~~
    * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
    * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
    * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
    * [.remove(uuidOrId)](#balena.models.device.remove) ⇒ <code>Promise</code>
    * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
    * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
    * [.note(uuidOrId, note)](#balena.models.device.note) ⇒ <code>Promise</code>
    * [.setCustomLocation(uuidOrId, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
    * [.unsetCustomLocation(uuidOrId)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
    * [.move(uuidOrId, applicationNameOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
    * ~~[.startApplication(uuidOrId)](#balena.models.device.startApplication) ⇒ <code>Promise</code>~~
    * ~~[.stopApplication(uuidOrId)](#balena.models.device.stopApplication) ⇒ <code>Promise</code>~~
    * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
    * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
    * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
    * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
    * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
    * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
    * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
    * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
    * [.getDisplayName(deviceTypeSlug)](#balena.models.device.getDisplayName) ⇒ <code>Promise</code>
    * [.getDeviceSlug(deviceTypeName)](#balena.models.device.getDeviceSlug) ⇒ <code>Promise</code>
    * [.getSupportedDeviceTypes()](#balena.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
    * [.getManifestBySlug(slug)](#balena.models.device.getManifestBySlug) ⇒ <code>Promise</code>
    * [.getManifestByApplication(nameOrId)](#balena.models.device.getManifestByApplication) ⇒ <code>Promise</code>
    * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
    * [.register(applicationNameOrId, [uuid])](#balena.models.device.register) ⇒ <code>Promise</code>
    * [.generateDeviceKey(uuidOrId)](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
    * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
    * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
    * [.enableDeviceUrl(uuidOrId)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
    * [.disableDeviceUrl(uuidOrId)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
    * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
    * [.getStatus(device)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
    * [.grantSupportAccess(uuidOrId, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(uuidOrId)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>

<a name="balena.models.device.tags"></a>

##### device.tags : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.tags](#balena.models.device.tags) : <code>object</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.device.tags.getAll) ⇒ <code>Promise</code>
    * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.tags.getAllByApplication"></a>

###### tags.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.tags.getAllByApplication('MyApp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByApplication('MyApp', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.device.tags.getAllByDevice"></a>

###### tags.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.tags.getAllByDevice('7cf02a6').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByDevice(123).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAllByDevice('7cf02a6', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.device.tags.getAll"></a>

###### tags.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.tags.getAll().then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.device.tags.getAll(function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.device.tags.set"></a>

###### tags.set(uuidOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Set a device tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.device.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.device.tags.set('7cf02a6', 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.tags.remove"></a>

###### tags.remove(uuidOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Remove a device tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.device.tags.remove('7cf02a6', 'EDITOR');
```
**Example**  
```js
balena.models.device.tags.remove('7cf02a6', 'EDITOR', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.configVar"></a>

##### device.configVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.configVar](#balena.models.device.configVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.configVar.getAllByDevice"></a>

###### configVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all config variables for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.configVar.getAllByDevice('7cf02a6').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByDevice('7cf02a6', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.configVar.getAllByApplication"></a>

###### configVar.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all device config variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.configVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.configVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.configVar.get"></a>

###### configVar.get(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get the value of a specific config variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the config variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.configVar.get(999999, 'BALENA_VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.configVar.get('7cf02a6', 'BALENA_VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.device.configVar.set"></a>

###### configVar.set(uuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Set the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | config variable name |
| value | <code>String</code> | config variable value |

**Example**  
```js
balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.set(999999, 'BALENA_VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.set('7cf02a6', 'BALENA_VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.configVar.remove"></a>

###### configVar.remove(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Clear the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | config variable name |

**Example**  
```js
balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.remove(999999, 'BALENA_VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.configVar.remove('7cf02a6', 'BALENA_VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.envVar"></a>

##### device.envVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.envVar](#balena.models.device.envVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.envVar.getAllByDevice"></a>

###### envVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all environment variables for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.envVar.getAllByDevice('7cf02a6').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByDevice('7cf02a6', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.envVar.getAllByApplication"></a>

###### envVar.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all device environment variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.envVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.envVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.envVar.get"></a>

###### envVar.get(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get the value of a specific environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.device.envVar.get('7cf02a6', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.envVar.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.envVar.get('7cf02a6', 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.device.envVar.set"></a>

###### envVar.set(uuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Set the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.set('7cf02a6', 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.envVar.remove"></a>

###### envVar.remove(uuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Clear the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |

**Example**  
```js
balena.models.device.envVar.remove('7cf02a6', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.envVar.remove('7cf02a6', 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.serviceVar"></a>

##### device.serviceVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, id, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, id, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, id, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.serviceVar.getAllByDevice"></a>

###### serviceVar.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all service variable overrides for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.serviceVar.getAllByDevice('7cf02a6').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByDevice(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByDevice('7cf02a6', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.serviceVar.getAllByApplication"></a>

###### serviceVar.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all device service variable overrides by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.serviceVar.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.device.serviceVar.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.device.serviceVar.get"></a>

###### serviceVar.get(uuidOrId, id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get the overriden value of a service variable on a device  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.device.serviceVar.set"></a>

###### serviceVar.set(uuidOrId, id, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Set the overriden value of a service variable on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |
| value | <code>String</code> | variable value |

**Example**  
```js
balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set('7cf02a6', 123, 'VAR', 'override', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.serviceVar.remove"></a>

###### serviceVar.remove(uuidOrId, id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Clear the overridden value of a service variable on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.getDashboardUrl"></a>

##### device.getDashboardUrl(uuid) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get Dashboard URL for a specific device  
**Returns**: <code>String</code> - - Dashboard URL for the specific device  
**Throws**:

- Exception if the uuid is empty


| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | Device uuid |

**Example**  
```js
dashboardDeviceUrl = balena.models.device.getDashboardUrl('a44b544b8cc24d11b036c659dfeaccd8')
```
<a name="balena.models.device.getAll"></a>

##### device.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getAll().then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAll(function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.getAllByApplication"></a>

##### device.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getAllByApplication('MyApp').then(function(devices) {
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
balena.models.device.getAllByApplication('MyApp', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.getAllByParentDevice"></a>

##### device.getAllByParentDevice(parentUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get all devices by parent device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parentUuidOrId | <code>String</code> \| <code>Number</code> |  | parent device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByParentDevice(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.get"></a>

##### device.get(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device  
**Access**: public  
**Fulfil**: <code>Object</code> - device  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
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
balena.models.device.get('7cf02a6', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="balena.models.device.getWithServiceDetails"></a>

##### device.getWithServiceDetails(uuidOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `device.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device along with its associated services' essential details  
**Access**: public  
**Fulfil**: <code>Object</code> - device with service details  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.device.getWithServiceDetails('7cf02a6').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getWithServiceDetails(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
balena.models.device.getWithServiceDetails('7cf02a6', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="balena.models.device.getByName"></a>

##### device.getByName(name) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get devices by name  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | device name |

**Example**  
```js
balena.models.device.getByName('MyDevice').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
balena.models.device.getByName('MyDevice', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="balena.models.device.getName"></a>

##### device.getName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the name of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device name  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getName('7cf02a6').then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
balena.models.device.getName(123).then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
balena.models.device.getName('7cf02a6', function(error, deviceName) {
	if (error) throw error;
	console.log(deviceName);
});
```
<a name="balena.models.device.getApplicationName"></a>

##### device.getApplicationName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get application name  
**Access**: public  
**Fulfil**: <code>String</code> - application name  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
balena.models.device.getApplicationName(123).then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
balena.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
	if (error) throw error;
	console.log(applicationName);
});
```
<a name="balena.models.device.getApplicationInfo"></a>

##### ~~device.getApplicationInfo(uuidOrId) ⇒ <code>Promise</code>~~
***Deprecated***

This is not supported on multicontainer devices, and will be removed in a future major release

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get application container information  
**Access**: public  
**Fulfil**: <code>Object</code> - application info  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
	console.log(appInfo);
});
```
**Example**  
```js
balena.models.device.getApplicationInfo(123).then(function(appInfo) {
	console.log(appInfo);
});
```
**Example**  
```js
balena.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
	if (error) throw error;
	console.log(appInfo);
});
```
<a name="balena.models.device.has"></a>

##### device.has(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.has('7cf02a6').then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
balena.models.device.has(123).then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
balena.models.device.has('7cf02a6', function(error, hasDevice) {
	if (error) throw error;
	console.log(hasDevice);
});
```
<a name="balena.models.device.isOnline"></a>

##### device.isOnline(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device is online  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is device online  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.isOnline('7cf02a6').then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
balena.models.device.isOnline(123).then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
balena.models.device.isOnline('7cf02a6', function(error, isOnline) {
	if (error) throw error;
	console.log('Is device online?', isOnline);
});
```
<a name="balena.models.device.getLocalIPAddresses"></a>

##### device.getLocalIPAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the local IP addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - local ip addresses  
**Reject**: <code>Error</code> Will reject if the device is offline  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
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
**Example**  
```js
balena.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
	if (error) throw error;

	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
<a name="balena.models.device.remove"></a>

##### device.remove(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Remove device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.remove('7cf02a6');
```
**Example**  
```js
balena.models.device.remove(123);
```
**Example**  
```js
balena.models.device.remove('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.identify"></a>

##### device.identify(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Identify device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.identify('7cf02a6');
```
**Example**  
```js
balena.models.device.identify(123);
```
**Example**  
```js
balena.models.device.identify('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.rename"></a>

##### device.rename(uuidOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Rename device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| newName | <code>String</code> | the device new name |

**Example**  
```js
balena.models.device.rename('7cf02a6', 'NewName');
```
**Example**  
```js
balena.models.device.rename(123, 'NewName');
```
**Example**  
```js
balena.models.device.rename('7cf02a6', 'NewName', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.note"></a>

##### device.note(uuidOrId, note) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Note a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| note | <code>String</code> | the note |

**Example**  
```js
balena.models.device.note('7cf02a6', 'My useful note');
```
**Example**  
```js
balena.models.device.note(123, 'My useful note');
```
**Example**  
```js
balena.models.device.note('7cf02a6', 'My useful note', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.setCustomLocation"></a>

##### device.setCustomLocation(uuidOrId, location) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a custom location for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| location | <code>Object</code> | the location ({ latitude: 123, longitude: 456 }) |

**Example**  
```js
balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
```
**Example**  
```js
balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
```
**Example**  
```js
balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.unsetCustomLocation"></a>

##### device.unsetCustomLocation(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Clear the custom location of a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.unsetCustomLocation('7cf02a6');
```
**Example**  
```js
balena.models.device.unsetCustomLocation(123);
```
**Example**  
```js
balena.models.device.unsetLocation('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.move"></a>

##### device.move(uuidOrId, applicationNameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Move a device to another application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| applicationNameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.device.move('7cf02a6', 'MyApp');
```
**Example**  
```js
balena.models.device.move(123, 'MyApp');
```
**Example**  
```js
balena.models.device.move(123, 456);
```
**Example**  
```js
balena.models.device.move('7cf02a6', 'MyApp', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.startApplication"></a>

##### ~~device.startApplication(uuidOrId) ⇒ <code>Promise</code>~~
***Deprecated***

This is not supported on multicontainer devices, and will be removed in a future major release

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start application on device  
**Access**: public  
**Fulfil**: <code>String</code> - application container id  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.startApplication('7cf02a6').then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.startApplication(123).then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.startApplication('7cf02a6', function(error, containerId) {
	if (error) throw error;
	console.log(containerId);
});
```
<a name="balena.models.device.stopApplication"></a>

##### ~~device.stopApplication(uuidOrId) ⇒ <code>Promise</code>~~
***Deprecated***

This is not supported on multicontainer devices, and will be removed in a future major release

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Stop application on device  
**Access**: public  
**Fulfil**: <code>String</code> - application container id  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.stopApplication('7cf02a6').then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.stopApplication(123).then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
balena.models.device.stopApplication('7cf02a6', function(error, containerId) {
	if (error) throw error;
	console.log(containerId);
});
```
<a name="balena.models.device.restartApplication"></a>

##### device.restartApplication(uuidOrId) ⇒ <code>Promise</code>
This function restarts the Docker container running
the application on the device, but doesn't reboot
the device itself.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Restart application on device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.restartApplication('7cf02a6');
```
**Example**  
```js
balena.models.device.restartApplication(123);
```
**Example**  
```js
balena.models.device.restartApplication('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.startService"></a>

##### device.startService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start a service on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| imageId | <code>Number</code> | id of the image to start |

**Example**  
```js
balena.models.device.startService('7cf02a6', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.startService(1, 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.startService('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.stopService"></a>

##### device.stopService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Stop a service on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| imageId | <code>Number</code> | id of the image to stop |

**Example**  
```js
balena.models.device.stopService('7cf02a6', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.stopService(1, 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.stopService('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.restartService"></a>

##### device.restartService(uuidOrId, imageId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Restart a service on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| imageId | <code>Number</code> | id of the image to restart |

**Example**  
```js
balena.models.device.restartService('7cf02a6', 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.restartService(1, 123).then(function() {
	...
});
```
**Example**  
```js
balena.models.device.restartService('7cf02a6', 123, function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.device.reboot"></a>

##### device.reboot(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Reboot device  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.device.reboot('7cf02a6');
```
**Example**  
```js
balena.models.device.reboot(123);
```
**Example**  
```js
balena.models.device.reboot('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.shutdown"></a>

##### device.shutdown(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Shutdown device  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.device.shutdown('7cf02a6');
```
**Example**  
```js
balena.models.device.shutdown(123);
```
**Example**  
```js
balena.models.device.shutdown('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.purge"></a>

##### device.purge(uuidOrId) ⇒ <code>Promise</code>
This function clears the user application's `/data` directory.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Purge device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.purge('7cf02a6');
```
**Example**  
```js
balena.models.device.purge(123);
```
**Example**  
```js
balena.models.device.purge('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.update"></a>

##### device.update(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Trigger an update check on the supervisor  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
balena.models.device.update('7cf02a6', {
	force: true
});
```
**Example**  
```js
balena.models.device.update(123, {
	force: true
});
```
**Example**  
```js
balena.models.device.update('7cf02a6', {
	force: true
}, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.getDisplayName"></a>

##### device.getDisplayName(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get display name for a device  
**Access**: public  
**Fulfil**: <code>String</code> - device display name  
**See**: [module:balena.models.device.getSupportedDeviceTypes](module:balena.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
**Example**  
```js
balena.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
	if (error) throw error;
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
<a name="balena.models.device.getDeviceSlug"></a>

##### device.getDeviceSlug(deviceTypeName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get device slug  
**Access**: public  
**Fulfil**: <code>String</code> - device slug name  
**See**: [module:balena.models.device.getSupportedDeviceTypes](module:balena.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeName | <code>String</code> | device type name |

**Example**  
```js
balena.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
**Example**  
```js
balena.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
	if (error) throw error;
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
<a name="balena.models.device.getSupportedDeviceTypes"></a>

##### device.getSupportedDeviceTypes() ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get supported device types  
**Access**: public  
**Fulfil**: <code>String[]</code> - supported device types  
**Example**  
```js
balena.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		console.log('Balena supports:', supportedDeviceType);
	});
});
```
**Example**  
```js
balena.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
	if (error) throw error;

	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		console.log('Balena supports:', supportedDeviceType);
	});
});
```
<a name="balena.models.device.getManifestBySlug"></a>

##### device.getManifestBySlug(slug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device manifest by slug  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>String</code> | device slug |

**Example**  
```js
balena.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="balena.models.device.getManifestByApplication"></a>

##### device.getManifestByApplication(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device manifest by application name  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
balena.models.device.getManifestByApplication('MyApp').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.device.getManifestByApplication(123).then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
balena.models.device.getManifestByApplication('MyApp', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="balena.models.device.generateUniqueKey"></a>

##### device.generateUniqueKey() ⇒ <code>String</code>
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
<a name="balena.models.device.register"></a>

##### device.register(applicationNameOrId, [uuid]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Register a new device with a Balena application.  
**Access**: public  
**Fulfil**: <code>Object</code> Device registration info ({ id: "...", uuid: "...", api_key: "..." })  

| Param | Type | Description |
| --- | --- | --- |
| applicationNameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| [uuid] | <code>String</code> | device uuid |

**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register('MyApp', uuid).then(function(registrationInfo) {
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
**Example**  
```js
var uuid = balena.models.device.generateUniqueKey();
balena.models.device.register('MyApp', uuid, function(error, registrationInfo) {
	if (error) throw error;
	console.log(registrationInfo);
});
```
<a name="balena.models.device.generateDeviceKey"></a>

##### device.generateDeviceKey(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Generate a device key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
balena.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
balena.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
	if (error) throw error;
	console.log(deviceApiKey);
});
```
<a name="balena.models.device.hasDeviceUrl"></a>

##### device.hasDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device is web accessible with device utls  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
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
**Example**  
```js
balena.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
	if (error) throw error;

	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
<a name="balena.models.device.getDeviceUrl"></a>

##### device.getDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a device url  
**Access**: public  
**Fulfil**: <code>String</code> - device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getDeviceUrl('7cf02a6').then(function(url) {
	console.log(url);
});
```
**Example**  
```js
balena.models.device.getDeviceUrl(123).then(function(url) {
	console.log(url);
});
```
**Example**  
```js
balena.models.device.getDeviceUrl('7cf02a6', function(error, url) {
	if (error) throw error;
	console.log(url);
});
```
<a name="balena.models.device.enableDeviceUrl"></a>

##### device.enableDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.enableDeviceUrl('7cf02a6');
```
**Example**  
```js
balena.models.device.enableDeviceUrl(123);
```
**Example**  
```js
balena.models.device.enableDeviceUrl('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.disableDeviceUrl"></a>

##### device.disableDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.disableDeviceUrl('7cf02a6');
```
**Example**  
```js
balena.models.device.disableDeviceUrl(123);
```
**Example**  
```js
balena.models.device.disableDeviceUrl('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.ping"></a>

##### device.ping(uuidOrId) ⇒ <code>Promise</code>
This is useful to signal that the supervisor is alive and responding.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Ping a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.ping('7cf02a6');
```
**Example**  
```js
balena.models.device.ping(123);
```
**Example**  
```js
balena.models.device.ping('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.getStatus"></a>

##### device.getStatus(device) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the status of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device status  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.getStatus(device).then(function(status) {
	console.log(status);
});
```
**Example**  
```js
balena.models.device.getStatus(device, function(error, status) {
	if (error) throw error;
	console.log(status);
});
```
<a name="balena.models.device.grantSupportAccess"></a>

##### device.grantSupportAccess(uuidOrId, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Grant support access to a device until a specified time  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| expiryTimestamp | <code>Number</code> | a timestamp in ms for when the support access will expire |

**Example**  
```js
balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.revokeSupportAccess"></a>

##### device.revokeSupportAccess(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Revoke support access to a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.revokeSupportAccess('7cf02a6');
```
**Example**  
```js
balena.models.device.revokeSupportAccess(123);
```
**Example**  
```js
balena.models.device.revokeSupportAccess('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.device.lastOnline"></a>

##### device.lastOnline(device) ⇒ <code>String</code>
If the device has never been online this method returns the string `Connecting...`.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a string showing when a device was last set as online  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	balena.models.device.lastOnline(device);
})
```
<a name="balena.models.apiKey"></a>

#### models.apiKey : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.apiKey](#balena.models.apiKey) : <code>object</code>
    * [.create(name, [description])](#balena.models.apiKey.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
    * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>

<a name="balena.models.apiKey.create"></a>

##### apiKey.create(name, [description]) ⇒ <code>Promise</code>
This method registers a new api key for the current user with the name given.

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Creates a new user API key  
**Access**: public  
**Fulfil**: <code>String</code> - API key  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | the API key name |
| [description] | <code>String</code> | <code></code> | the API key description |

**Example**  
```js
balena.models.apiKey.create(apiKeyName).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.apiKey.create(apiKeyName, apiKeyDescription).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
balena.models.apiKey.create(apiKeyName, function(error, apiKey) {
	if (error) throw error;
	console.log(apiKey);
});
```
<a name="balena.models.apiKey.getAll"></a>

##### apiKey.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all API keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getAll().then(function(apiKeys) {
	console.log(apiKeys);
});
```
**Example**  
```js
balena.models.apiKey.getAll(function(error, apiKeys) {
	if (error) throw error;
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.update"></a>

##### apiKey.update(id, apiKeyInfo) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Update the details of an API key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | API key id |
| apiKeyInfo | <code>Object</code> | an object with the updated name or description |

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
balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' });
```
**Example**  
```js
balena.models.apiKey.update(123, { name: 'updatedName', description: 'updated description' }, function(error, apiKeys) {
	if (error) throw error;
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.revoke"></a>

##### apiKey.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Revoke an API key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | API key id |

**Example**  
```js
balena.models.apiKey.revoke(123);
```
**Example**  
```js
balena.models.apiKey.revoke(123, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.key"></a>

#### models.key : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.key](#balena.models.key) : <code>object</code>
    * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
    * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
    * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>

<a name="balena.models.key.getAll"></a>

##### key.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get all ssh keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - ssh keys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.key.getAll().then(function(keys) {
	console.log(keys);
});
```
**Example**  
```js
balena.models.key.getAll(function(error, keys) {
	if (error) throw error;
	console.log(keys);
});
```
<a name="balena.models.key.get"></a>

##### key.get(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get a single ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | key id |

**Example**  
```js
balena.models.key.get(51).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.key.get(51, function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="balena.models.key.remove"></a>

##### key.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Remove ssh key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | key id |

**Example**  
```js
balena.models.key.remove(51);
```
**Example**  
```js
balena.models.key.remove(51, function(error) {
	if (error) throw error;
});
```
<a name="balena.models.key.create"></a>

##### key.create(title, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Create a ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>String</code> | key title |
| key | <code>String</code> | the public ssh key |

**Example**  
```js
balena.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	console.log(key);
});
```
**Example**  
```js
balena.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="balena.models.os"></a>

#### models.os : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.os](#balena.models.os) : <code>object</code>
    * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
    * [.getSupportedVersions(deviceType)](#balena.models.os.getSupportedVersions) ⇒ <code>Promise</code>
    * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
    * [.getLastModified(deviceType, [version])](#balena.models.os.getLastModified) ⇒ <code>Promise</code>
    * [.download(deviceType, [version])](#balena.models.os.download) ⇒ <code>Promise</code>
    * [.getConfig(nameOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>

<a name="balena.models.os.getDownloadSize"></a>

##### os.getDownloadSize(deviceType, [version]) ⇒ <code>Promise</code>
**Note!** Currently only the raw (uncompressed) size is reported.

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get OS download size estimate  
**Access**: public  
**Fulfil**: <code>Number</code> - OS image download size, in bytes.  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest'. The version **must** be the exact version number. |

**Example**  
```js
balena.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	console.log('The OS download size for raspberry-pi', size);
});

balena.models.os.getDownloadSize('raspberry-pi', function(error, size) {
	if (error) throw error;
	console.log('The OS download size for raspberry-pi', size);
});
```
<a name="balena.models.os.getSupportedVersions"></a>

##### os.getSupportedVersions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get OS supported versions  
**Access**: public  
**Fulfil**: <code>Object</code> - the versions information, of the following structure:
* versions - an array of strings,
containing exact version numbers supported by the current environment
* recommended - the recommended version, i.e. the most recent version
that is _not_ pre-release, can be `null`
* latest - the most recent version, including pre-releases
* default - recommended (if available) or latest otherwise  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	console.log('Supported OS versions for raspberry-pi', osVersions);
});

balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	if (error) throw error;
	console.log('Supported OS versions for raspberry-pi', osVersions);
});
```
<a name="balena.models.os.getMaxSatisfyingVersion"></a>

##### os.getMaxSatisfyingVersion(deviceType, versionOrRange) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the max OS version satisfying the given range  
**Access**: public  
**Fulfil**: <code>String\|null</code> - the version number, or `null` if no matching versions are found  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| versionOrRange | <code>String</code> | can be one of * the exact version number, in which case it is returned if the version is supported, or `null` is returned otherwise, * a [semver](https://www.npmjs.com/package/semver)-compatible range specification, in which case the most recent satisfying version is returned if it exists, or `null` is returned, * `'latest'` in which case the most recent version is returned, including pre-releases, * `'recommended'` in which case the recommended version is returned, i.e. the most recent version excluding pre-releases, which can be `null` if only pre-release versions are available, * `'default'` in which case the recommended version is returned if available, or `latest` is returned otherwise. Defaults to `'latest'`. |

**Example**  
```js
balena.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	console.log('Supported OS versions for raspberry-pi', osVersions);
});

balena.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	if (error) throw error;
	console.log('Supported OS versions for raspberry-pi', osVersions);
});
```
<a name="balena.models.os.getLastModified"></a>

##### os.getLastModified(deviceType, [version]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the OS image last modified date  
**Access**: public  
**Fulfil**: <code>Date</code> - last modified date  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest'. Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
balena.models.os.getLastModified('raspberry-pi').then(function(date) {
	console.log('The raspberry-pi image was last modified in ' + date);
});

balena.models.os.getLastModified('raspberrypi3', '2.0.0').then(function(date) {
	console.log('The raspberry-pi image was last modified in ' + date);
});

balena.models.os.getLastModified('raspberry-pi', function(error, date) {
	if (error) throw error;
	console.log('The raspberry-pi image was last modified in ' + date);
});
```
<a name="balena.models.os.download"></a>

##### os.download(deviceType, [version]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Download an OS image  
**Access**: public  
**Fulfil**: <code>ReadableStream</code> - download stream  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest' Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
balena.models.os.download('raspberry-pi').then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});

balena.models.os.download('raspberry-pi', function(error, stream) {
	if (error) throw error;
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});
```
<a name="balena.models.os.getConfig"></a>

##### os.getConfig(nameOrId, options) ⇒ <code>Promise</code>
Builds the config.json for a device in the given application, with the given
options.

Note that an OS version is required. For versions < 2.7.8, config
generation is only supported when using a session token, not an API key.

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get an applications config.json  
**Access**: public  
**Fulfil**: <code>Object</code> - application configuration as a JSON object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number). |
| options | <code>Object</code> |  | OS configuration options to use. |
| options.version | <code>String</code> |  | Required: the OS version of the image. |
| [options.network] | <code>String</code> | <code>&#x27;ethernet&#x27;</code> | The network type that the device will use, one of 'ethernet' or 'wifi'. |
| [options.appUpdatePollInterval] | <code>Number</code> |  | How often the OS checks for updates, in minutes. |
| [options.wifiKey] | <code>String</code> |  | The key for the wifi network the device will connect to. |
| [options.wifiSsid] | <code>String</code> |  | The ssid for the wifi network the device will connect to. |
| [options.ip] | <code>String</code> |  | static ip address. |
| [options.gateway] | <code>String</code> |  | static ip gateway. |
| [options.netmask] | <code>String</code> |  | static ip netmask. |

**Example**  
```js
balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

balena.models.os.getConfig(123, { version: ''2.12.7+rev1.prod'' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

balena.models.os.getConfig('MyApp', { version: ''2.12.7+rev1.prod'' }, function(error, config) {
	if (error) throw error;
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});
```
<a name="balena.models.config"></a>

#### models.config : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.config](#balena.models.config) : <code>object</code>
    * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
    * [.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>
    * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>

<a name="balena.models.config.getAll"></a>

##### config.getAll() ⇒ <code>Promise</code>
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
**Example**  
```js
balena.models.config.getAll(function(error, config) {
	if (error) throw error;
	console.log(config);
});
```
<a name="balena.models.config.getDeviceTypes"></a>

##### config.getDeviceTypes() ⇒ <code>Promise</code>
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
**Example**  
```js
balena.models.config.getDeviceTypes(function(error, deviceTypes) {
	if (error) throw error;
	console.log(deviceTypes);
})
```
<a name="balena.models.config.getDeviceOptions"></a>

##### config.getDeviceOptions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get configuration/initialization options for a device type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - configuration options  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
balena.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
	console.log(options);
});
```
**Example**  
```js
balena.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
	if (error) throw error;
	console.log(options);
});
```
<a name="balena.models.release"></a>

#### models.release : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.release](#balena.models.release) : <code>object</code>
    * [.tags](#balena.models.release.tags) : <code>object</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByRelease(id, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
        * [.set(releaseId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
        * [.remove(releaseId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
    * [.get(id, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
    * [.getWithImageDetails(id, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>

<a name="balena.models.release.tags"></a>

##### release.tags : <code>object</code>
**Kind**: static namespace of [<code>release</code>](#balena.models.release)  

* [.tags](#balena.models.release.tags) : <code>object</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByRelease(id, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.release.tags.getAll) ⇒ <code>Promise</code>
    * [.set(releaseId, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
    * [.remove(releaseId, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.release.tags.getAllByApplication"></a>

###### tags.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAllByApplication('MyApp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByApplication('MyApp', function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.release.tags.getAllByRelease"></a>

###### tags.getAllByRelease(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for a release  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | release id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAllByRelease(123).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease(123, function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.release.tags.getAll"></a>

###### tags.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAll().then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAll(function(error, tags) {
	if (error) throw error;
	console.log(tags)
});
```
<a name="balena.models.release.tags.set"></a>

###### tags.set(releaseId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Set a release tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| releaseId | <code>Number</code> | release id |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.release.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set(123, 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.release.tags.remove"></a>

###### tags.remove(releaseId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Remove a release tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| releaseId | <code>Number</code> | release id |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.release.tags.remove(123, 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove(123, 'EDITOR', function(error) {
	if (error) throw error;
});
```
<a name="balena.models.release.get"></a>

##### release.get(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release  
**Access**: public  
**Fulfil**: <code>Object</code> - release  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | release id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.get(123).then(function(release) {
		console.log(release);
});
```
**Example**  
```js
balena.models.release.get(123, function(error, release) {
		if (error) throw error;
		console.log(release);
});
```
<a name="balena.models.release.getWithImageDetails"></a>

##### release.getWithImageDetails(id, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want significantly more control, or to see the
raw model directly, use `release.get(id, options)` instead.

**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release with the details of the images built  
**Access**: public  
**Fulfil**: <code>Object</code> - release with image details  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | release id |
| [options] | <code>Object</code> | <code>{}</code> | a map of extra pine options |
| [options.release] | <code>Boolean</code> | <code>{}</code> | extra pine options for releases |
| [options.image] | <code>Object</code> | <code>{}</code> | extra pine options for images |

**Example**  
```js
balena.models.release.getWithImageDetails(123).then(function(release) {
		console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
.then(function(release) {
		console.log(release.images[0].build_log);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails(123, function(error, release) {
		if (error) throw error;
		console.log(release);
});
```
<a name="balena.models.release.getAllByApplication"></a>

##### release.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get all releases from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - releases  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.getAllByApplication('MyApp').then(function(releases) {
		console.log(releases);
});
```
**Example**  
```js
balena.models.release.getAllByApplication(123).then(function(releases) {
		console.log(releases);
});
```
**Example**  
```js
balena.models.release.getAllByApplication('MyApp', function(error, releases) {
		if (error) throw error;
		console.log(releases);
});
```
<a name="balena.models.service"></a>

#### models.service : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.service](#balena.models.service) : <code>object</code>
    * [.var](#balena.models.service.var) : <code>object</code>
        * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
        * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
        * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>

<a name="balena.models.service.var"></a>

##### service.var : <code>object</code>
**Kind**: static namespace of [<code>service</code>](#balena.models.service)  

* [.var](#balena.models.service.var) : <code>object</code>
    * [.getAllByService(id, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(id, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
    * [.set(id, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
    * [.remove(id, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>

<a name="balena.models.service.var.getAllByService"></a>

###### var.getAllByService(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all variables for a service  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | service id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.var.getAllByService(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByService(999999, function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.service.var.getAllByApplication"></a>

###### var.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all service variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.var.getAllByApplication('MyApp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByApplication('MyApp', function(error, vars) {
	if (error) throw error;
	console.log(vars)
});
```
<a name="balena.models.service.var.get"></a>

###### var.get(id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get the value of a specific service variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.service.var.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.service.var.get(999999, 'VAR', function(error, value) {
	if (error) throw error;
	console.log(value)
});
```
<a name="balena.models.service.var.set"></a>

###### var.set(id, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Set the value of a specific service variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |
| value | <code>String</code> | variable value |

**Example**  
```js
balena.models.service.var.set(999999, 'VAR', 'newvalue').then(function() {
	...
});
```
**Example**  
```js
balena.models.service.var.set(999999, 'VAR', 'newvalue', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.service.var.remove"></a>

###### var.remove(id, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Clear the value of a specific service variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | service id |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.service.var.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.service.var.remove(999999, 'VAR', function(error) {
	if (error) throw error;
	...
});
```
<a name="balena.models.service.getAllByApplication"></a>

##### service.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>service</code>](#balena.models.service)  
**Summary**: Get all services from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - services  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.getAllByApplication('MyApp').then(function(services) {
		console.log(services);
});
```
**Example**  
```js
balena.models.service.getAllByApplication(123).then(function(services) {
		console.log(services);
});
```
**Example**  
```js
balena.models.service.getAllByApplication('MyApp', function(error, services) {
		if (error) throw error;
		console.log(services);
});
```
<a name="balena.models.image"></a>

#### models.image : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.image](#balena.models.image) : <code>object</code>
    * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
    * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>

<a name="balena.models.image.get"></a>

##### image.get(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get a specific image  
**Access**: public  
**Fulfil**: <code>Object</code> - image  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | image id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.image.get(123).then(function(image) {
		console.log(image);
});
```
**Example**  
```js
balena.models.image.get(123, function(error, image) {
		if (error) throw error;
		console.log(image);
});
```
<a name="balena.models.image.getLogs"></a>

##### image.getLogs(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get the logs for an image  
**Access**: public  
**Fulfil**: <code>string</code> - logs  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | image id |

**Example**  
```js
balena.models.image.getLogs(123).then(function(logs) {
		console.log(logs);
});
```
**Example**  
```js
balena.models.image.getLogs(123, function(error, logs) {
		if (error) throw error;
		console.log(logs);
});
```
<a name="balena.models.billing"></a>

#### models.billing : <code>object</code>
**Note!** The billing methods are available on Balena.io exclusively.

**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.billing](#balena.models.billing) : <code>object</code>
    * [.getAccount()](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
    * [.getPlan()](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
    * [.getBillingInfo()](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
    * [.updateBillingInfo()](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
    * [.getInvoices()](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
    * [.downloadInvoice()](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>

<a name="balena.models.billing.getAccount"></a>

##### billing.getAccount() ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the user's billing account  
**Access**: public  
**Fulfil**: <code>Object</code> - billing account  
**Example**  
```js
balena.models.billing.getAccount().then(function(billingAccount) {
	console.log(billingAccount);
});
```
**Example**  
```js
balena.models.billing.getAccount(function(error, billingAccount) {
	if (error) throw error;
	console.log(billingAccount);
});
```
<a name="balena.models.billing.getPlan"></a>

##### billing.getPlan() ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing plan  
**Access**: public  
**Fulfil**: <code>Object</code> - billing plan  
**Example**  
```js
balena.models.billing.getPlan().then(function(billingPlan) {
	console.log(billingPlan);
});
```
**Example**  
```js
balena.models.billing.getPlan(function(error, billingPlan) {
	if (error) throw error;
	console.log(billingPlan);
});
```
<a name="balena.models.billing.getBillingInfo"></a>

##### billing.getBillingInfo() ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  
**Example**  
```js
balena.models.billing.getBillingInfo().then(function(billingInfo) {
	console.log(billingInfo);
});
```
**Example**  
```js
balena.models.billing.getBillingInfo(function(error, billingInfo) {
	if (error) throw error;
	console.log(billingInfo);
});
```
<a name="balena.models.billing.updateBillingInfo"></a>

##### billing.updateBillingInfo() ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Update the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  

| Type | Description |
| --- | --- |
| <code>Object</code> | an object containing a billing info token_id |

**Example**  
```js
balena.models.billing.updateBillingInfo({ token_id: 'xxxxxxx' }).then(function(billingInfo) {
	console.log(billingInfo);
});
```
**Example**  
```js
balena.models.billing.updateBillingInfo({ token_id: 'xxxxxxx' }, function(error, billingInfo) {
	if (error) throw error;
	console.log(billingInfo);
});
```
<a name="balena.models.billing.getInvoices"></a>

##### billing.getInvoices() ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the available invoices  
**Access**: public  
**Fulfil**: <code>Object</code> - invoices  
**Example**  
```js
balena.models.billing.getInvoices().then(function(invoices) {
	console.log(invoices);
});
```
**Example**  
```js
balena.models.billing.getInvoices(function(error, invoices) {
	if (error) throw error;
	console.log(invoices);
});
```
<a name="balena.models.billing.downloadInvoice"></a>

##### billing.downloadInvoice() ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Download a specific invoice  
**Access**: public  
**Fulfil**: <code>Blob\|ReadableStream</code> - blob on the browser, download stream on node  

| Type | Description |
| --- | --- |
| <code>String</code> | an invoice number |

**Example**  
```js
# Browser
balena.models.billing.downloadInvoice('0000').then(function(blob) {
	console.log(blob);
});
# Node
balena.models.billing.downloadInvoice('0000').then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/invoice-0000.pdf'));
});
```
<a name="balena.auth"></a>

### balena.auth : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.auth](#balena.auth) : <code>object</code>
    * [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
        * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
        * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
        * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
    * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
    * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
    * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
    * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
    * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
    * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
    * [.getUserId()](#balena.auth.getUserId) ⇒ <code>Promise</code>
    * [.getEmail()](#balena.auth.getEmail) ⇒ <code>Promise</code>
    * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
    * [.register([credentials])](#balena.auth.register) ⇒ <code>Promise</code>

<a name="balena.auth.twoFactor"></a>

#### auth.twoFactor : <code>object</code>
**Kind**: static namespace of [<code>auth</code>](#balena.auth)  

* [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
    * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
    * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
    * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>

<a name="balena.auth.twoFactor.isEnabled"></a>

##### twoFactor.isEnabled() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Check if two factor authentication is enabled  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa is enabled  
**Example**  
```js
balena.auth.twoFactor.isEnabled().then(function(isEnabled) {
	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```
**Example**  
```js
balena.auth.twoFactor.isEnabled(function(error, isEnabled) {
	if (error) throw error;

	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```
<a name="balena.auth.twoFactor.isPassed"></a>

##### twoFactor.isPassed() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Check if two factor authentication challenge was passed  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa challenge was passed  
**Example**  
```js
balena.auth.twoFactor.isPassed().then(function(isPassed) {
	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```
**Example**  
```js
balena.auth.twoFactor.isPassed(function(error, isPassed) {
	if (error) throw error;

	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```
<a name="balena.auth.twoFactor.challenge"></a>

##### twoFactor.challenge(code) ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Challenge two factor authentication  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
balena.auth.twoFactor.challenge('1234');
```
**Example**  
```js
balena.auth.twoFactor.challenge('1234', function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.whoami"></a>

#### auth.whoami() ⇒ <code>Promise</code>
This will only work if you used [module:balena.auth.login](module:balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Return current logged in username  
**Access**: public  
**Fulfil**: <code>(String\|undefined)</code> - username, if it exists  
**Example**  
```js
balena.auth.whoami().then(function(username) {
	if (!username) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My username is:', username);
	}
});
```
**Example**  
```js
balena.auth.whoami(function(error, username) {
	if (error) throw error;

	if (!username) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My username is:', username);
	}
});
```
<a name="balena.auth.authenticate"></a>

#### auth.authenticate(credentials) ⇒ <code>Promise</code>
You should use [module:balena.auth.login](module:balena.auth.login) when possible,
as it takes care of saving the token and email as well.

Notice that if `credentials` contains extra keys, they'll be discarted
by the server automatically.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Authenticate with the server  
**Access**: protected  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of email, password |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
balena.auth.authenticate(credentials).then(function(token) {
	console.log('My token is:', token);
});
```
**Example**  
```js
balena.auth.authenticate(credentials, function(error, token) {
	if (error) throw error;
	console.log('My token is:', token);
});
```
<a name="balena.auth.login"></a>

#### auth.login(credentials) ⇒ <code>Promise</code>
If the login is successful, the token is persisted between sessions.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Login  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of email, password |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
balena.auth.login(credentials);
```
**Example**  
```js
balena.auth.login(credentials, function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.loginWithToken"></a>

#### auth.loginWithToken(authToken) ⇒ <code>Promise</code>
Login to balena with a session token or api key instead of with credentials.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Login with a token or api key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| authToken | <code>String</code> | the auth token |

**Example**  
```js
balena.auth.loginWithToken(authToken);
```
**Example**  
```js
balena.auth.loginWithToken(authToken, function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.isLoggedIn"></a>

#### auth.isLoggedIn() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Check if you're logged in  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is logged in  
**Example**  
```js
balena.auth.isLoggedIn().then(function(isLoggedIn) {
	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```
**Example**  
```js
balena.auth.isLoggedIn(function(error, isLoggedIn) {
	if (error) throw error;

	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```
<a name="balena.auth.getToken"></a>

#### auth.getToken() ⇒ <code>Promise</code>
This will only work if you used [module:balena.auth.login](module:balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's raw API key or session token  
**Access**: public  
**Fulfil**: <code>String</code> - raw API key or session token  
**Example**  
```js
balena.auth.getToken().then(function(token) {
	console.log(token);
});
```
**Example**  
```js
balena.auth.getToken(function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.auth.getUserId"></a>

#### auth.getUserId() ⇒ <code>Promise</code>
This will only work if you used [module:balena.auth.login](module:balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's id  
**Access**: public  
**Fulfil**: <code>Number</code> - user id  
**Example**  
```js
balena.auth.getUserId().then(function(userId) {
	console.log(userId);
});
```
**Example**  
```js
balena.auth.getUserId(function(error, userId) {
	if (error) throw error;
	console.log(userId);
});
```
<a name="balena.auth.getEmail"></a>

#### auth.getEmail() ⇒ <code>Promise</code>
This will only work if you used [module:balena.auth.login](module:balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's email  
**Access**: public  
**Fulfil**: <code>String</code> - user email  
**Example**  
```js
balena.auth.getEmail().then(function(email) {
	console.log(email);
});
```
**Example**  
```js
balena.auth.getEmail(function(error, email) {
	if (error) throw error;
	console.log(email);
});
```
<a name="balena.auth.logout"></a>

#### auth.logout() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Logout  
**Access**: public  
**Example**  
```js
balena.auth.logout();
```
**Example**  
```js
balena.auth.logout(function(error) {
	if (error) throw error;
});
```
<a name="balena.auth.register"></a>

#### auth.register([credentials]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Register a user account  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [credentials] | <code>Object</code> | <code>{}</code> | in the form of username, password and email |
| credentials.email | <code>String</code> |  | the email |
| credentials.password | <code>String</code> |  | the password |

**Example**  
```js
balena.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}).then(function(token) {
	console.log(token);
});
```
**Example**  
```js
balena.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}, function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="balena.logs"></a>

### balena.logs : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.logs](#balena.logs) : <code>object</code>
    * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise</code>
    * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
    * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
        * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
        * ["line"](#balena.logs.LogSubscription.event_line)
        * ["error"](#balena.logs.LogSubscription.event_error)

<a name="balena.logs.subscribe"></a>

#### logs.subscribe(uuidOrId, [options]) ⇒ <code>Promise</code>
Connects to the stream of devices logs, returning a LogSubscription, which
can be used to listen for logs as they appear, line by line.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Subscribe to device logs  
**Access**: public  
**Fulfil**: [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Todo**

- [ ] We should consider making this a readable stream.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.count] | <code>Number</code> \| <code>&#x27;all&#x27;</code> | <code>0</code> | number of historical messages to include (or 'all') |

**Example**  
```js
balena.logs.subscribe('7cf02a6').then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.subscribe(123).then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.subscribe('7cf02a6', function(error, logs) {
	if (error) throw error;

	logs.on('line', function(line) {
		console.log(line);
	});
});
```
<a name="balena.logs.history"></a>

#### logs.history(uuidOrId, [options]) ⇒ <code>Promise</code>
Get an array of the latest log messages for a given device.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Get device logs history  
**Access**: public  
**Fulfil**: <code>Object[]</code> - history lines  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.count] | <code>Number</code> \| <code>&#x27;all&#x27;</code> | <code>1000</code> | number of log messages to return (or 'all') |

**Example**  
```js
balena.logs.history('7cf02a6').then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.history(123).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.history('7cf02a6', { count: 20 }, function(error, lines) {
	if (error) throw error;

	lines.forEach(function(line) {
		console.log(line);
	});
});
```
<a name="balena.logs.LogSubscription"></a>

#### logs.LogSubscription : <code>EventEmitter</code>
The log subscription emits events as log data arrives.
You can get a LogSubscription for a given device by calling `balena.logs.subscribe(deviceId)`

**Kind**: static typedef of [<code>logs</code>](#balena.logs)  

* [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
    * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
    * ["line"](#balena.logs.LogSubscription.event_line)
    * ["error"](#balena.logs.LogSubscription.event_error)

<a name="balena.logs.LogSubscription.unsubscribe"></a>

##### LogSubscription.unsubscribe()
Disconnect from the logs feed and stop receiving any future events on this emitter.

**Kind**: static method of [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Unsubscribe from device logs  
**Access**: public  
**Example**  
```js
logs.unsubscribe();
```
<a name="balena.logs.LogSubscription.event_line"></a>

##### "line"
**Kind**: event emitted by [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Event fired when a new line of log output is available  
**Example**  
```js
logs.on('line', function(line) {
	console.log(line);
});
```
<a name="balena.logs.LogSubscription.event_error"></a>

##### "error"
**Kind**: event emitted by [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Event fired when an error has occured reading the device logs  
**Example**  
```js
logs.on('error', function(error) {
	console.error(error);
});
```
<a name="balena.settings"></a>

### balena.settings : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.settings](#balena.settings) : <code>object</code>
    * [.get([key])](#balena.settings.get) ⇒ <code>Promise</code>
    * [.getAll()](#balena.settings.getAll) ⇒ <code>Promise</code>

<a name="balena.settings.get"></a>

#### settings.get([key]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#balena.settings)  
**Summary**: Get a single setting. **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>\*</code> - setting value  

| Param | Type | Description |
| --- | --- | --- |
| [key] | <code>String</code> | setting key |

**Example**  
```js
balena.settings.get('apiUrl').then(function(apiUrl) {
	console.log(apiUrl);
});
```
**Example**  
```js
balena.settings.get('apiUrl', function(error, apiUrl) {
	if (error) throw error;
	console.log(apiUrl);
});
```
<a name="balena.settings.getAll"></a>

#### settings.getAll() ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#balena.settings)  
**Summary**: Get all settings **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>Object</code> - settings  
**Example**  
```js
balena.settings.getAll().then(function(settings) {
	console.log(settings);
});
```
**Example**  
```js
balena.settings.getAll(function(error, settings) {
	if (error) throw error;
	console.log(settings);
});
```
<a name="balena.setSharedOptions"></a>

### balena.setSharedOptions()
Set options that are used by calls to `balena.fromSharedOptions()`.
The options accepted are the same as those used in the main SDK factory function.
If you use this method, it should be called as soon as possible during app
startup and before any calls to `fromSharedOptions()` are made.

**Kind**: static method of [<code>balena</code>](#balena)  
**Summary**: Set shared default options  
**Access**: public  
**Params**: <code>Object</code> opts - The shared default options  
**Example**  
```js
balena.setSharedOptions({
	apiUrl: 'https://api.balena-cloud.com/',
	imageMakerUrl: 'https://img.balena-cloud.com/',
	isBrowser: true,
});
```
<a name="balena.fromSharedOptions"></a>

### balena.fromSharedOptions()
Create an SDK instance using shared default options set using the `setSharedOptions()` method.
If options have not been set using this method, then this method will use the
same defaults as the main SDK factory function.

**Kind**: static method of [<code>balena</code>](#balena)  
**Summary**: Create an SDK instance using shared default options  
**Access**: public  
**Params**: <code>Object</code> opts - The shared default options  
**Example**  
```js
const sdk = balena.fromSharedOptions();
```
