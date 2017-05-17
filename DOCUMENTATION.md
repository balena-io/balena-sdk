<a name="resin"></a>

## resin : <code>object</code>
Welcome to the Resin SDK documentation.

This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.

If you feel something is missing, not clear or could be improved, please don't hesitate to open an [issue in GitHub](https://github.com/resin-io/resin-sdk/issues/new), we'll be happy to help.

**Kind**: global namespace  

* [resin](#resin) : <code>object</code>
    * [.interceptors](#resin.interceptors) : <code>Array.&lt;Interceptor&gt;</code>
        * [.Interceptor](#resin.interceptors.Interceptor) : <code>object</code>
    * [.request](#resin.request) : <code>Object</code>
    * [.token](#resin.token) : <code>Object</code>
    * [.pine](#resin.pine) : <code>Object</code>
    * [.models](#resin.models) : <code>object</code>
        * [.application](#resin.models.application) : <code>object</code>
            * [.getAll([options])](#resin.models.application.getAll) ⇒ <code>Promise</code>
            * [.get(nameOrId, [options])](#resin.models.application.get) ⇒ <code>Promise</code>
            * [.has(nameOrId)](#resin.models.application.has) ⇒ <code>Promise</code>
            * [.hasAny()](#resin.models.application.hasAny) ⇒ <code>Promise</code>
            * ~~[.getById(id)](#resin.models.application.getById) ⇒ <code>Promise</code>~~
            * [.create(name, deviceType, [parentNameOrId])](#resin.models.application.create) ⇒ <code>Promise</code>
            * [.remove(nameOrId)](#resin.models.application.remove) ⇒ <code>Promise</code>
            * [.restart(nameOrId)](#resin.models.application.restart) ⇒ <code>Promise</code>
            * [.generateApiKey(nameOrId)](#resin.models.application.generateApiKey) ⇒ <code>Promise</code>
            * ~~[.getApiKey(nameOrId)](#resin.models.application.getApiKey) ⇒ <code>Promise</code>~~
        * [.device](#resin.models.device) : <code>object</code>
            * [.getDashboardUrl(options)](#resin.models.device.getDashboardUrl) ⇒ <code>String</code>
            * [.getAll([options])](#resin.models.device.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#resin.models.device.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByParentDevice(parentUuidOrId, [options])](#resin.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
            * [.get(uuidOrId, [options])](#resin.models.device.get) ⇒ <code>Promise</code>
            * [.getByName(name)](#resin.models.device.getByName) ⇒ <code>Promise</code>
            * [.getName(uuidOrId)](#resin.models.device.getName) ⇒ <code>Promise</code>
            * [.getApplicationName(uuidOrId)](#resin.models.device.getApplicationName) ⇒ <code>Promise</code>
            * [.getApplicationInfo(uuidOrId)](#resin.models.device.getApplicationInfo) ⇒ <code>Promise</code>
            * [.has(uuidOrId)](#resin.models.device.has) ⇒ <code>Promise</code>
            * [.isOnline(uuidOrId)](#resin.models.device.isOnline) ⇒ <code>Promise</code>
            * [.getLocalIPAddresses(uuidOrId)](#resin.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
            * [.remove(uuidOrId)](#resin.models.device.remove) ⇒ <code>Promise</code>
            * [.identify(uuidOrId)](#resin.models.device.identify) ⇒ <code>Promise</code>
            * [.rename(uuidOrId, newName)](#resin.models.device.rename) ⇒ <code>Promise</code>
            * [.note(uuidOrId, note)](#resin.models.device.note) ⇒ <code>Promise</code>
            * [.setCustomLocation(uuidOrId, location)](#resin.models.device.setCustomLocation) ⇒ <code>Promise</code>
            * [.unsetCustomLocation(uuidOrId)](#resin.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
            * [.move(uuidOrId, applicationNameOrId)](#resin.models.device.move) ⇒ <code>Promise</code>
            * [.startApplication(uuidOrId)](#resin.models.device.startApplication) ⇒ <code>Promise</code>
            * [.stopApplication(uuidOrId)](#resin.models.device.stopApplication) ⇒ <code>Promise</code>
            * [.restartApplication(uuidOrId)](#resin.models.device.restartApplication) ⇒ <code>Promise</code>
            * [.reboot(uuidOrId, [options])](#resin.models.device.reboot) ⇒ <code>Promise</code>
            * [.shutdown(uuidOrId, [options])](#resin.models.device.shutdown) ⇒ <code>Promise</code>
            * [.purge(uuidOrId)](#resin.models.device.purge) ⇒ <code>Promise</code>
            * [.update(uuidOrId, options)](#resin.models.device.update) ⇒ <code>Promise</code>
            * [.getDisplayName(deviceTypeSlug)](#resin.models.device.getDisplayName) ⇒ <code>Promise</code>
            * [.getDeviceSlug(deviceTypeName)](#resin.models.device.getDeviceSlug) ⇒ <code>Promise</code>
            * [.getSupportedDeviceTypes()](#resin.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
            * [.getManifestBySlug(slug)](#resin.models.device.getManifestBySlug) ⇒ <code>Promise</code>
            * [.getManifestByApplication(nameOrId)](#resin.models.device.getManifestByApplication) ⇒ <code>Promise</code>
            * [.generateUniqueKey()](#resin.models.device.generateUniqueKey) ⇒ <code>String</code>
            * [.register(applicationNameOrId, uuid)](#resin.models.device.register) ⇒ <code>Promise</code>
            * [.generateDeviceKey(uuidOrId)](#resin.models.device.generateDeviceKey) ⇒ <code>Promise</code>
            * [.hasDeviceUrl(uuidOrId)](#resin.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
            * [.getDeviceUrl(uuidOrId)](#resin.models.device.getDeviceUrl) ⇒ <code>Promise</code>
            * [.enableDeviceUrl(uuidOrId)](#resin.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
            * [.disableDeviceUrl(uuidOrId)](#resin.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
            * [.enableTcpPing(uuidOrId)](#resin.models.device.enableTcpPing) ⇒ <code>Promise</code>
            * [.disableTcpPing(uuidOrId)](#resin.models.device.disableTcpPing) ⇒ <code>Promise</code>
            * [.ping(uuidOrId)](#resin.models.device.ping) ⇒ <code>Promise</code>
            * [.getStatus(device)](#resin.models.device.getStatus) ⇒ <code>Promise</code>
        * [.key](#resin.models.key) : <code>object</code>
            * [.getAll([options])](#resin.models.key.getAll) ⇒ <code>Promise</code>
            * [.get(id)](#resin.models.key.get) ⇒ <code>Promise</code>
            * [.remove(id)](#resin.models.key.remove) ⇒ <code>Promise</code>
            * [.create(title, key)](#resin.models.key.create) ⇒ <code>Promise</code>
        * [.environment-variables](#resin.models.environment-variables) : <code>object</code>
            * [.device](#resin.models.environment-variables.device) : <code>object</code>
                * [.getAll(uuidOrId)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
                * [.getAllByApplication(nameOrId)](#resin.models.environment-variables.device.getAllByApplication) ⇒ <code>Promise</code>
                * [.create(uuidOrId, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
                * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
                * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>
            * [.getAllByApplication(applicationNameOrId)](#resin.models.environment-variables.getAllByApplication) ⇒ <code>Promise</code>
            * [.create(applicationNameOrId, name, value)](#resin.models.environment-variables.create) ⇒ <code>Promise</code>
            * [.update(id, value)](#resin.models.environment-variables.update) ⇒ <code>Promise</code>
            * [.remove(id)](#resin.models.environment-variables.remove) ⇒ <code>Promise</code>
            * [.isSystemVariable(variable)](#resin.models.environment-variables.isSystemVariable) ⇒ <code>Boolean</code>
        * [.os](#resin.models.os) : <code>object</code>
            * [.getDownloadSize(deviceType, [version])](#resin.models.os.getDownloadSize) ⇒ <code>Promise</code>
            * [.getSupportedVersions(deviceType)](#resin.models.os.getSupportedVersions) ⇒ <code>Promise</code>
            * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#resin.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
            * [.getLastModified(deviceType, [version])](#resin.models.os.getLastModified) ⇒ <code>Promise</code>
            * [.download(deviceType, [version])](#resin.models.os.download) ⇒ <code>Promise</code>
            * [.getConfig(nameOrId, [options])](#resin.models.os.getConfig) ⇒ <code>Promise</code>
        * [.config](#resin.models.config) : <code>object</code>
            * [.getAll()](#resin.models.config.getAll) ⇒ <code>Promise</code>
            * [.getDeviceTypes()](#resin.models.config.getDeviceTypes) ⇒ <code>Promise</code>
            * [.getDeviceOptions(deviceType)](#resin.models.config.getDeviceOptions) ⇒ <code>Promise</code>
        * [.build](#resin.models.build) : <code>object</code>
            * [.get(id, [options])](#resin.models.build.get) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId, [options])](#resin.models.build.getAllByApplication) ⇒ <code>Promise</code>
    * [.auth](#resin.auth) : <code>object</code>
        * [.twoFactor](#resin.auth.twoFactor) : <code>object</code>
            * [.isEnabled()](#resin.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
            * [.isPassed()](#resin.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
            * [.challenge(code)](#resin.auth.twoFactor.challenge) ⇒ <code>Promise</code>
        * [.whoami()](#resin.auth.whoami) ⇒ <code>Promise</code>
        * [.authenticate(credentials)](#resin.auth.authenticate) ⇒ <code>Promise</code>
        * [.login(credentials)](#resin.auth.login) ⇒ <code>Promise</code>
        * [.loginWithToken(token)](#resin.auth.loginWithToken) ⇒ <code>Promise</code>
        * [.isLoggedIn()](#resin.auth.isLoggedIn) ⇒ <code>Promise</code>
        * [.getToken()](#resin.auth.getToken) ⇒ <code>Promise</code>
        * [.getUserId()](#resin.auth.getUserId) ⇒ <code>Promise</code>
        * [.getEmail()](#resin.auth.getEmail) ⇒ <code>Promise</code>
        * [.logout()](#resin.auth.logout) ⇒ <code>Promise</code>
        * [.register([credentials])](#resin.auth.register) ⇒ <code>Promise</code>
    * [.logs](#resin.logs) : <code>object</code>
        * [.subscribe(uuidOrId)](#resin.logs.subscribe) ⇒ <code>Promise</code>
        * [.history(uuidOrId, [options])](#resin.logs.history) ⇒ <code>Promise</code>
        * [.historySinceLastClear(uuidOrId, [options])](#resin.logs.historySinceLastClear) ⇒ <code>Promise</code>
        * [.clear(uuidOrId)](#resin.logs.clear) ⇒ <code>Promise</code>
        * [.LogSubscription](#resin.logs.LogSubscription) : <code>EventEmitter</code>
            * [.unsubscribe()](#resin.logs.LogSubscription.unsubscribe)
            * ["line"](#resin.logs.LogSubscription.event_line)
            * ["clear"](#resin.logs.LogSubscription.event_clear)
            * ["error"](#resin.logs.LogSubscription.event_error)
    * [.settings](#resin.settings) : <code>object</code>
        * [.get([key])](#resin.settings.get) ⇒ <code>Promise</code>
        * [.getAll()](#resin.settings.getAll) ⇒ <code>Promise</code>

<a name="resin.interceptors"></a>

### resin.interceptors : <code>Array.&lt;Interceptor&gt;</code>
The current array of interceptors to use. Interceptors intercept requests made
internally and are executed in the order they appear in this array for requests,
and in the reverse order for responses.

**Kind**: static property of [<code>resin</code>](#resin)  
**Summary**: Array of interceptors  
**Access**: public  
**Example**  
```js
resin.interceptors.push({
	responseError: function (error) {
		console.log(error);
		throw error;
	})
});
```
<a name="resin.interceptors.Interceptor"></a>

#### interceptors.Interceptor : <code>object</code>
An interceptor implements some set of the four interception hook callbacks.
To continue processing, each function should return a value or a promise that
successfully resolves to a value.

To halt processing, each function should throw an error or return a promise that
rejects with an error.

**Kind**: static typedef of [<code>interceptors</code>](#resin.interceptors)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>function</code> | Callback invoked before requests are made. Called with the request options, should return (or resolve to) new request options, or throw/reject. |
| response | <code>function</code> | Callback invoked before responses are returned. Called with the response, should return (or resolve to) a new response, or throw/reject. |
| requestError | <code>function</code> | Callback invoked if an error happens before a request. Called with the error itself, caused by a preceeding request interceptor rejecting/throwing an error for the request, or a failing in preflight token validation. Should return (or resolve to) new request options, or throw/reject. |
| responseError | <code>function</code> | Callback invoked if an error happens in the response. Called with the error itself, caused by a preceeding response interceptor rejecting/throwing an error for the request, a network error, or an error response from the server. Should return (or resolve to) a new response, or throw/reject. |

<a name="resin.request"></a>

### resin.request : <code>Object</code>
The resin-request instance used internally. This should not be necessary
in normal usage, but can be useful if you want to make an API request directly,
using the same token and hooks as the SDK.

**Kind**: static property of [<code>resin</code>](#resin)  
**Summary**: Resin request instance  
**Access**: public  
**Example**  
```js
resin.request.send({ url: 'http://api.resin.io/ping' });
```
<a name="resin.token"></a>

### resin.token : <code>Object</code>
The resin-token instance used internally. This should not be necessary
in normal usage, but can be useful if you want to directly get or set
the auth token that the SDK will use.

**Kind**: static property of [<code>resin</code>](#resin)  
**Summary**: Resin token instance  
**Access**: public  
**Example**  
```js
resin.token.set('abcdef...');
```
<a name="resin.pine"></a>

### resin.pine : <code>Object</code>
The resin-pine instance used internally. This should not be necessary
in normal usage, but can be useful if you want to directly make pine
queries to the api for some resource that isn't directly supported
in the SDK.

**Kind**: static property of [<code>resin</code>](#resin)  
**Summary**: Resin pine instance  
**Access**: public  
**Example**  
```js
resin.pine.get({
	resource: 'build/$count',
	options: {
		filter: { application: applicationId }
	}
});
```
<a name="resin.models"></a>

### resin.models : <code>object</code>
**Kind**: static namespace of [<code>resin</code>](#resin)  

* [.models](#resin.models) : <code>object</code>
    * [.application](#resin.models.application) : <code>object</code>
        * [.getAll([options])](#resin.models.application.getAll) ⇒ <code>Promise</code>
        * [.get(nameOrId, [options])](#resin.models.application.get) ⇒ <code>Promise</code>
        * [.has(nameOrId)](#resin.models.application.has) ⇒ <code>Promise</code>
        * [.hasAny()](#resin.models.application.hasAny) ⇒ <code>Promise</code>
        * ~~[.getById(id)](#resin.models.application.getById) ⇒ <code>Promise</code>~~
        * [.create(name, deviceType, [parentNameOrId])](#resin.models.application.create) ⇒ <code>Promise</code>
        * [.remove(nameOrId)](#resin.models.application.remove) ⇒ <code>Promise</code>
        * [.restart(nameOrId)](#resin.models.application.restart) ⇒ <code>Promise</code>
        * [.generateApiKey(nameOrId)](#resin.models.application.generateApiKey) ⇒ <code>Promise</code>
        * ~~[.getApiKey(nameOrId)](#resin.models.application.getApiKey) ⇒ <code>Promise</code>~~
    * [.device](#resin.models.device) : <code>object</code>
        * [.getDashboardUrl(options)](#resin.models.device.getDashboardUrl) ⇒ <code>String</code>
        * [.getAll([options])](#resin.models.device.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#resin.models.device.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByParentDevice(parentUuidOrId, [options])](#resin.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
        * [.get(uuidOrId, [options])](#resin.models.device.get) ⇒ <code>Promise</code>
        * [.getByName(name)](#resin.models.device.getByName) ⇒ <code>Promise</code>
        * [.getName(uuidOrId)](#resin.models.device.getName) ⇒ <code>Promise</code>
        * [.getApplicationName(uuidOrId)](#resin.models.device.getApplicationName) ⇒ <code>Promise</code>
        * [.getApplicationInfo(uuidOrId)](#resin.models.device.getApplicationInfo) ⇒ <code>Promise</code>
        * [.has(uuidOrId)](#resin.models.device.has) ⇒ <code>Promise</code>
        * [.isOnline(uuidOrId)](#resin.models.device.isOnline) ⇒ <code>Promise</code>
        * [.getLocalIPAddresses(uuidOrId)](#resin.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
        * [.remove(uuidOrId)](#resin.models.device.remove) ⇒ <code>Promise</code>
        * [.identify(uuidOrId)](#resin.models.device.identify) ⇒ <code>Promise</code>
        * [.rename(uuidOrId, newName)](#resin.models.device.rename) ⇒ <code>Promise</code>
        * [.note(uuidOrId, note)](#resin.models.device.note) ⇒ <code>Promise</code>
        * [.setCustomLocation(uuidOrId, location)](#resin.models.device.setCustomLocation) ⇒ <code>Promise</code>
        * [.unsetCustomLocation(uuidOrId)](#resin.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
        * [.move(uuidOrId, applicationNameOrId)](#resin.models.device.move) ⇒ <code>Promise</code>
        * [.startApplication(uuidOrId)](#resin.models.device.startApplication) ⇒ <code>Promise</code>
        * [.stopApplication(uuidOrId)](#resin.models.device.stopApplication) ⇒ <code>Promise</code>
        * [.restartApplication(uuidOrId)](#resin.models.device.restartApplication) ⇒ <code>Promise</code>
        * [.reboot(uuidOrId, [options])](#resin.models.device.reboot) ⇒ <code>Promise</code>
        * [.shutdown(uuidOrId, [options])](#resin.models.device.shutdown) ⇒ <code>Promise</code>
        * [.purge(uuidOrId)](#resin.models.device.purge) ⇒ <code>Promise</code>
        * [.update(uuidOrId, options)](#resin.models.device.update) ⇒ <code>Promise</code>
        * [.getDisplayName(deviceTypeSlug)](#resin.models.device.getDisplayName) ⇒ <code>Promise</code>
        * [.getDeviceSlug(deviceTypeName)](#resin.models.device.getDeviceSlug) ⇒ <code>Promise</code>
        * [.getSupportedDeviceTypes()](#resin.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
        * [.getManifestBySlug(slug)](#resin.models.device.getManifestBySlug) ⇒ <code>Promise</code>
        * [.getManifestByApplication(nameOrId)](#resin.models.device.getManifestByApplication) ⇒ <code>Promise</code>
        * [.generateUniqueKey()](#resin.models.device.generateUniqueKey) ⇒ <code>String</code>
        * [.register(applicationNameOrId, uuid)](#resin.models.device.register) ⇒ <code>Promise</code>
        * [.generateDeviceKey(uuidOrId)](#resin.models.device.generateDeviceKey) ⇒ <code>Promise</code>
        * [.hasDeviceUrl(uuidOrId)](#resin.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
        * [.getDeviceUrl(uuidOrId)](#resin.models.device.getDeviceUrl) ⇒ <code>Promise</code>
        * [.enableDeviceUrl(uuidOrId)](#resin.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
        * [.disableDeviceUrl(uuidOrId)](#resin.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
        * [.enableTcpPing(uuidOrId)](#resin.models.device.enableTcpPing) ⇒ <code>Promise</code>
        * [.disableTcpPing(uuidOrId)](#resin.models.device.disableTcpPing) ⇒ <code>Promise</code>
        * [.ping(uuidOrId)](#resin.models.device.ping) ⇒ <code>Promise</code>
        * [.getStatus(device)](#resin.models.device.getStatus) ⇒ <code>Promise</code>
    * [.key](#resin.models.key) : <code>object</code>
        * [.getAll([options])](#resin.models.key.getAll) ⇒ <code>Promise</code>
        * [.get(id)](#resin.models.key.get) ⇒ <code>Promise</code>
        * [.remove(id)](#resin.models.key.remove) ⇒ <code>Promise</code>
        * [.create(title, key)](#resin.models.key.create) ⇒ <code>Promise</code>
    * [.environment-variables](#resin.models.environment-variables) : <code>object</code>
        * [.device](#resin.models.environment-variables.device) : <code>object</code>
            * [.getAll(uuidOrId)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(nameOrId)](#resin.models.environment-variables.device.getAllByApplication) ⇒ <code>Promise</code>
            * [.create(uuidOrId, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
            * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
            * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>
        * [.getAllByApplication(applicationNameOrId)](#resin.models.environment-variables.getAllByApplication) ⇒ <code>Promise</code>
        * [.create(applicationNameOrId, name, value)](#resin.models.environment-variables.create) ⇒ <code>Promise</code>
        * [.update(id, value)](#resin.models.environment-variables.update) ⇒ <code>Promise</code>
        * [.remove(id)](#resin.models.environment-variables.remove) ⇒ <code>Promise</code>
        * [.isSystemVariable(variable)](#resin.models.environment-variables.isSystemVariable) ⇒ <code>Boolean</code>
    * [.os](#resin.models.os) : <code>object</code>
        * [.getDownloadSize(deviceType, [version])](#resin.models.os.getDownloadSize) ⇒ <code>Promise</code>
        * [.getSupportedVersions(deviceType)](#resin.models.os.getSupportedVersions) ⇒ <code>Promise</code>
        * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#resin.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
        * [.getLastModified(deviceType, [version])](#resin.models.os.getLastModified) ⇒ <code>Promise</code>
        * [.download(deviceType, [version])](#resin.models.os.download) ⇒ <code>Promise</code>
        * [.getConfig(nameOrId, [options])](#resin.models.os.getConfig) ⇒ <code>Promise</code>
    * [.config](#resin.models.config) : <code>object</code>
        * [.getAll()](#resin.models.config.getAll) ⇒ <code>Promise</code>
        * [.getDeviceTypes()](#resin.models.config.getDeviceTypes) ⇒ <code>Promise</code>
        * [.getDeviceOptions(deviceType)](#resin.models.config.getDeviceOptions) ⇒ <code>Promise</code>
    * [.build](#resin.models.build) : <code>object</code>
        * [.get(id, [options])](#resin.models.build.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId, [options])](#resin.models.build.getAllByApplication) ⇒ <code>Promise</code>

<a name="resin.models.application"></a>

#### models.application : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.application](#resin.models.application) : <code>object</code>
    * [.getAll([options])](#resin.models.application.getAll) ⇒ <code>Promise</code>
    * [.get(nameOrId, [options])](#resin.models.application.get) ⇒ <code>Promise</code>
    * [.has(nameOrId)](#resin.models.application.has) ⇒ <code>Promise</code>
    * [.hasAny()](#resin.models.application.hasAny) ⇒ <code>Promise</code>
    * ~~[.getById(id)](#resin.models.application.getById) ⇒ <code>Promise</code>~~
    * [.create(name, deviceType, [parentNameOrId])](#resin.models.application.create) ⇒ <code>Promise</code>
    * [.remove(nameOrId)](#resin.models.application.remove) ⇒ <code>Promise</code>
    * [.restart(nameOrId)](#resin.models.application.restart) ⇒ <code>Promise</code>
    * [.generateApiKey(nameOrId)](#resin.models.application.generateApiKey) ⇒ <code>Promise</code>
    * ~~[.getApiKey(nameOrId)](#resin.models.application.getApiKey) ⇒ <code>Promise</code>~~

<a name="resin.models.application.getAll"></a>

##### application.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Get all applications  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.application.getAll().then(function(applications) {
	console.log(applications);
});
```
**Example**  
```js
resin.models.application.getAll(function(error, applications) {
	if (error) throw error;
	console.log(applications);
});
```
<a name="resin.models.application.get"></a>

##### application.get(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Get a single application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.application.get('MyApp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
resin.models.application.get(123).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
resin.models.application.get('MyApp', function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="resin.models.application.has"></a>

##### application.has(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Check if an application exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has application  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.application.has('MyApp').then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
resin.models.application.has(123).then(function(hasApp) {
	console.log(hasApp);
});
```
**Example**  
```js
resin.models.application.has('MyApp', function(error, hasApp) {
	if (error) throw error;
	console.log(hasApp);
});
```
<a name="resin.models.application.hasAny"></a>

##### application.hasAny() ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Check if the user has any applications  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has any applications  
**Example**  
```js
resin.models.application.hasAny().then(function(hasAny) {
	console.log('Has any?', hasAny);
});
```
**Example**  
```js
resin.models.application.hasAny(function(error, hasAny) {
	if (error) throw error;
	console.log('Has any?', hasAny);
});
```
<a name="resin.models.application.getById"></a>

##### ~~application.getById(id) ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Get a single application by id  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> \| <code>String</code> | application id |

**Example**  
```js
resin.models.application.getById(89).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
resin.models.application.getById(89, function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="resin.models.application.create"></a>

##### application.create(name, deviceType, [parentNameOrId]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Create an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |
| deviceType | <code>String</code> | device type slug |
| [parentNameOrId] | <code>Number</code> \| <code>String</code> | parent application name or id |

**Example**  
```js
resin.models.application.create('My App', 'raspberry-pi').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
resin.models.application.create('My App', 'raspberry-pi', 'ParentApp').then(function(application) {
	console.log(application);
});
```
**Example**  
```js
resin.models.application.create('My App', 'raspberry-pi', function(error, application) {
	if (error) throw error;
	console.log(application);
});
```
<a name="resin.models.application.remove"></a>

##### application.remove(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Remove application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.application.remove('MyApp');
```
**Example**  
```js
resin.models.application.remove(123);
```
**Example**  
```js
resin.models.application.remove('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.application.restart"></a>

##### application.restart(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Restart application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.application.restart('MyApp');
```
**Example**  
```js
resin.models.application.restart(123);
```
**Example**  
```js
resin.models.application.restart('MyApp', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.application.generateApiKey"></a>

##### application.generateApiKey(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Generate an API key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - api key  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.application.generateApiKey('MyApp').then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
resin.models.application.generateApiKey(123).then(function(apiKey) {
	console.log(apiKey);
});
```
**Example**  
```js
resin.models.application.generateApiKey('MyApp', function(error, apiKey) {
	if (error) throw error;
	console.log(apiKey);
});
```
<a name="resin.models.application.getApiKey"></a>

##### ~~application.getApiKey(nameOrId) ⇒ <code>Promise</code>~~
***Deprecated***

**Kind**: static method of [<code>application</code>](#resin.models.application)  
**Summary**: Get an API key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - api key  
**See**: [generateApiKey](#resin.models.application.generateApiKey)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

<a name="resin.models.device"></a>

#### models.device : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.device](#resin.models.device) : <code>object</code>
    * [.getDashboardUrl(options)](#resin.models.device.getDashboardUrl) ⇒ <code>String</code>
    * [.getAll([options])](#resin.models.device.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#resin.models.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByParentDevice(parentUuidOrId, [options])](#resin.models.device.getAllByParentDevice) ⇒ <code>Promise</code>
    * [.get(uuidOrId, [options])](#resin.models.device.get) ⇒ <code>Promise</code>
    * [.getByName(name)](#resin.models.device.getByName) ⇒ <code>Promise</code>
    * [.getName(uuidOrId)](#resin.models.device.getName) ⇒ <code>Promise</code>
    * [.getApplicationName(uuidOrId)](#resin.models.device.getApplicationName) ⇒ <code>Promise</code>
    * [.getApplicationInfo(uuidOrId)](#resin.models.device.getApplicationInfo) ⇒ <code>Promise</code>
    * [.has(uuidOrId)](#resin.models.device.has) ⇒ <code>Promise</code>
    * [.isOnline(uuidOrId)](#resin.models.device.isOnline) ⇒ <code>Promise</code>
    * [.getLocalIPAddresses(uuidOrId)](#resin.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
    * [.remove(uuidOrId)](#resin.models.device.remove) ⇒ <code>Promise</code>
    * [.identify(uuidOrId)](#resin.models.device.identify) ⇒ <code>Promise</code>
    * [.rename(uuidOrId, newName)](#resin.models.device.rename) ⇒ <code>Promise</code>
    * [.note(uuidOrId, note)](#resin.models.device.note) ⇒ <code>Promise</code>
    * [.setCustomLocation(uuidOrId, location)](#resin.models.device.setCustomLocation) ⇒ <code>Promise</code>
    * [.unsetCustomLocation(uuidOrId)](#resin.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
    * [.move(uuidOrId, applicationNameOrId)](#resin.models.device.move) ⇒ <code>Promise</code>
    * [.startApplication(uuidOrId)](#resin.models.device.startApplication) ⇒ <code>Promise</code>
    * [.stopApplication(uuidOrId)](#resin.models.device.stopApplication) ⇒ <code>Promise</code>
    * [.restartApplication(uuidOrId)](#resin.models.device.restartApplication) ⇒ <code>Promise</code>
    * [.reboot(uuidOrId, [options])](#resin.models.device.reboot) ⇒ <code>Promise</code>
    * [.shutdown(uuidOrId, [options])](#resin.models.device.shutdown) ⇒ <code>Promise</code>
    * [.purge(uuidOrId)](#resin.models.device.purge) ⇒ <code>Promise</code>
    * [.update(uuidOrId, options)](#resin.models.device.update) ⇒ <code>Promise</code>
    * [.getDisplayName(deviceTypeSlug)](#resin.models.device.getDisplayName) ⇒ <code>Promise</code>
    * [.getDeviceSlug(deviceTypeName)](#resin.models.device.getDeviceSlug) ⇒ <code>Promise</code>
    * [.getSupportedDeviceTypes()](#resin.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
    * [.getManifestBySlug(slug)](#resin.models.device.getManifestBySlug) ⇒ <code>Promise</code>
    * [.getManifestByApplication(nameOrId)](#resin.models.device.getManifestByApplication) ⇒ <code>Promise</code>
    * [.generateUniqueKey()](#resin.models.device.generateUniqueKey) ⇒ <code>String</code>
    * [.register(applicationNameOrId, uuid)](#resin.models.device.register) ⇒ <code>Promise</code>
    * [.generateDeviceKey(uuidOrId)](#resin.models.device.generateDeviceKey) ⇒ <code>Promise</code>
    * [.hasDeviceUrl(uuidOrId)](#resin.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
    * [.getDeviceUrl(uuidOrId)](#resin.models.device.getDeviceUrl) ⇒ <code>Promise</code>
    * [.enableDeviceUrl(uuidOrId)](#resin.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
    * [.disableDeviceUrl(uuidOrId)](#resin.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
    * [.enableTcpPing(uuidOrId)](#resin.models.device.enableTcpPing) ⇒ <code>Promise</code>
    * [.disableTcpPing(uuidOrId)](#resin.models.device.disableTcpPing) ⇒ <code>Promise</code>
    * [.ping(uuidOrId)](#resin.models.device.ping) ⇒ <code>Promise</code>
    * [.getStatus(device)](#resin.models.device.getStatus) ⇒ <code>Promise</code>

<a name="resin.models.device.getDashboardUrl"></a>

##### device.getDashboardUrl(options) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get Dashboard URL for a specific device  
**Returns**: <code>String</code> - - Dashboard URL for the specific device  
**Throws**:

- Exception if either appId or deviceId are empty


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | options |
| options.appId | <code>Number</code> | Application id |
| options.deviceId | <code>Number</code> | Device id |

**Example**  
```js
dashboardDeviceUrl = resin.models.device.getDashboardUrl({ appId: 123, deviceId: 456 })
```
<a name="resin.models.device.getAll"></a>

##### device.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get all devices  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.device.getAll().then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
resin.models.device.getAll(function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="resin.models.device.getAllByApplication"></a>

##### device.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get all devices by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.device.getAllByApplication('MyApp').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
resin.models.device.getAllByApplication(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
resin.models.device.getAllByApplication('MyApp', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="resin.models.device.getAllByParentDevice"></a>

##### device.getAllByParentDevice(parentUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get all devices by parent device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parentUuidOrId | <code>String</code> \| <code>Number</code> |  | parent device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.device.getAllByParentDevice('7cf02a6').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
resin.models.device.getAllByParentDevice(123).then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
resin.models.device.getAllByParentDevice('7cf02a6', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="resin.models.device.get"></a>

##### device.get(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get a single device  
**Access**: public  
**Fulfil**: <code>Object</code> - device  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.device.get('7cf02a6').then(function(device) {
	console.log(device);
})
```
**Example**  
```js
resin.models.device.get(123).then(function(device) {
	console.log(device);
})
```
**Example**  
```js
resin.models.device.get('7cf02a6', function(error, device) {
	if (error) throw error;
	console.log(device);
});
```
<a name="resin.models.device.getByName"></a>

##### device.getByName(name) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get devices by name  
**Access**: public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | device name |

**Example**  
```js
resin.models.device.getByName('MyDevice').then(function(devices) {
	console.log(devices);
});
```
**Example**  
```js
resin.models.device.getByName('MyDevice', function(error, devices) {
	if (error) throw error;
	console.log(devices);
});
```
<a name="resin.models.device.getName"></a>

##### device.getName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get the name of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device name  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.getName('7cf02a6').then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
resin.models.device.getName(123).then(function(deviceName) {
	console.log(deviceName);
});
```
**Example**  
```js
resin.models.device.getName('7cf02a6', function(error, deviceName) {
	if (error) throw error;
	console.log(deviceName);
});
```
<a name="resin.models.device.getApplicationName"></a>

##### device.getApplicationName(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get application name  
**Access**: public  
**Fulfil**: <code>String</code> - application name  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.getApplicationName('7cf02a6').then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
resin.models.device.getApplicationName(123).then(function(applicationName) {
	console.log(applicationName);
});
```
**Example**  
```js
resin.models.device.getApplicationName('7cf02a6', function(error, applicationName) {
	if (error) throw error;
	console.log(applicationName);
});
```
<a name="resin.models.device.getApplicationInfo"></a>

##### device.getApplicationInfo(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get application container information  
**Access**: public  
**Fulfil**: <code>Object</code> - application info  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.getApplicationInfo('7cf02a6').then(function(appInfo) {
	console.log(appInfo);
});
```
**Example**  
```js
resin.models.device.getApplicationInfo(123).then(function(appInfo) {
	console.log(appInfo);
});
```
**Example**  
```js
resin.models.device.getApplicationInfo('7cf02a6', function(error, appInfo) {
	if (error) throw error;
	console.log(appInfo);
});
```
<a name="resin.models.device.has"></a>

##### device.has(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Check if a device exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.has('7cf02a6').then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
resin.models.device.has(123).then(function(hasDevice) {
	console.log(hasDevice);
});
```
**Example**  
```js
resin.models.device.has('7cf02a6', function(error, hasDevice) {
	if (error) throw error;
	console.log(hasDevice);
});
```
<a name="resin.models.device.isOnline"></a>

##### device.isOnline(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Check if a device is online  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is device online  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.isOnline('7cf02a6').then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
resin.models.device.isOnline(123).then(function(isOnline) {
	console.log('Is device online?', isOnline);
});
```
**Example**  
```js
resin.models.device.isOnline('7cf02a6', function(error, isOnline) {
	if (error) throw error;
	console.log('Is device online?', isOnline);
});
```
<a name="resin.models.device.getLocalIPAddresses"></a>

##### device.getLocalIPAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get the local IP addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - local ip addresses  
**Reject**: <code>Error</code> Will reject if the device is offline  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.getLocalIPAddresses('7cf02a6').then(function(localIPAddresses) {
	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
**Example**  
```js
resin.models.device.getLocalIPAddresses(123).then(function(localIPAddresses) {
	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
**Example**  
```js
resin.models.device.getLocalIPAddresses('7cf02a6', function(error, localIPAddresses) {
	if (error) throw error;

	localIPAddresses.forEach(function(localIP) {
		console.log(localIP);
	});
});
```
<a name="resin.models.device.remove"></a>

##### device.remove(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Remove device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.remove('7cf02a6');
```
**Example**  
```js
resin.models.device.remove(123);
```
**Example**  
```js
resin.models.device.remove('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.identify"></a>

##### device.identify(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Identify device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.identify('7cf02a6');
```
**Example**  
```js
resin.models.device.identify(123);
```
**Example**  
```js
resin.models.device.identify('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.rename"></a>

##### device.rename(uuidOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Rename device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| newName | <code>String</code> | the device new name |

**Example**  
```js
resin.models.device.rename('7cf02a6', 'NewName');
```
**Example**  
```js
resin.models.device.rename(123, 'NewName');
```
**Example**  
```js
resin.models.device.rename('7cf02a6', 'NewName', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.note"></a>

##### device.note(uuidOrId, note) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Note a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| note | <code>String</code> | the note |

**Example**  
```js
resin.models.device.note('7cf02a6', 'My useful note');
```
**Example**  
```js
resin.models.device.note(123, 'My useful note');
```
**Example**  
```js
resin.models.device.note('7cf02a6', 'My useful note', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.setCustomLocation"></a>

##### device.setCustomLocation(uuidOrId, location) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Set a custom location for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| location | <code>Object</code> | the location ({ latitude: 123, longitude: 456 }) |

**Example**  
```js
resin.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
```
**Example**  
```js
resin.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
```
**Example**  
```js
resin.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 }, function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.unsetCustomLocation"></a>

##### device.unsetCustomLocation(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Clear the custom location of a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.unsetCustomLocation('7cf02a6');
```
**Example**  
```js
resin.models.device.unsetCustomLocation(123);
```
**Example**  
```js
resin.models.device.unsetLocation('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.move"></a>

##### device.move(uuidOrId, applicationNameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Move a device to another application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| applicationNameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.device.move('7cf02a6', 'MyApp');
```
**Example**  
```js
resin.models.device.move(123, 'MyApp');
```
**Example**  
```js
resin.models.device.move(123, 456);
```
**Example**  
```js
resin.models.device.move('7cf02a6', 'MyApp', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.startApplication"></a>

##### device.startApplication(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Start application on device  
**Access**: public  
**Fulfil**: <code>String</code> - application container id  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.startApplication('7cf02a6').then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
resin.models.device.startApplication(123).then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
resin.models.device.startApplication('7cf02a6', function(error, containerId) {
	if (error) throw error;
	console.log(containerId);
});
```
<a name="resin.models.device.stopApplication"></a>

##### device.stopApplication(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Stop application on device  
**Access**: public  
**Fulfil**: <code>String</code> - application container id  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.stopApplication('7cf02a6').then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
resin.models.device.stopApplication(123).then(function(containerId) {
	console.log(containerId);
});
```
**Example**  
```js
resin.models.device.stopApplication('7cf02a6', function(error, containerId) {
	if (error) throw error;
	console.log(containerId);
});
```
<a name="resin.models.device.restartApplication"></a>

##### device.restartApplication(uuidOrId) ⇒ <code>Promise</code>
This function restarts the Docker container running
the application on the device, but doesn't reboot
the device itself.

**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Restart application on device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.restartApplication('7cf02a6');
```
**Example**  
```js
resin.models.device.restartApplication(123);
```
**Example**  
```js
resin.models.device.restartApplication('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.reboot"></a>

##### device.reboot(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Reboot device  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
resin.models.device.reboot('7cf02a6');
```
**Example**  
```js
resin.models.device.reboot(123);
```
**Example**  
```js
resin.models.device.reboot('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.shutdown"></a>

##### device.shutdown(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Shutdown device  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
resin.models.device.shutdown('7cf02a6');
```
**Example**  
```js
resin.models.device.shutdown(123);
```
**Example**  
```js
resin.models.device.shutdown('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.purge"></a>

##### device.purge(uuidOrId) ⇒ <code>Promise</code>
This function clears the user application's `/data` directory.

**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Purge device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.purge('7cf02a6');
```
**Example**  
```js
resin.models.device.purge(123);
```
**Example**  
```js
resin.models.device.purge('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.update"></a>

##### device.update(uuidOrId, options) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Trigger an update check on the supervisor  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| options | <code>Object</code> |  | options |
| [options.force] | <code>Boolean</code> | <code>false</code> | override update lock |

**Example**  
```js
resin.models.device.update('7cf02a6', {
	force: true
});
```
**Example**  
```js
resin.models.device.update(123, {
	force: true
});
```
**Example**  
```js
resin.models.device.update('7cf02a6', {
	force: true
}, function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.getDisplayName"></a>

##### device.getDisplayName(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get display name for a device  
**Access**: public  
**Fulfil**: <code>String</code> - device display name  
**See**: [module:resin.models.device.getSupportedDeviceTypes](module:resin.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
resin.models.device.getDisplayName('raspberry-pi').then(function(deviceTypeName) {
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
**Example**  
```js
resin.models.device.getDisplayName('raspberry-pi', function(error, deviceTypeName) {
	if (error) throw error;
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
<a name="resin.models.device.getDeviceSlug"></a>

##### device.getDeviceSlug(deviceTypeName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get device slug  
**Access**: public  
**Fulfil**: <code>String</code> - device slug name  
**See**: [module:resin.models.device.getSupportedDeviceTypes](module:resin.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeName | <code>String</code> | device type name |

**Example**  
```js
resin.models.device.getDeviceSlug('Raspberry Pi').then(function(deviceTypeSlug) {
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
**Example**  
```js
resin.models.device.getDeviceSlug('Raspberry Pi', function(error, deviceTypeSlug) {
	if (error) throw error;
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
<a name="resin.models.device.getSupportedDeviceTypes"></a>

##### device.getSupportedDeviceTypes() ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get supported device types  
**Access**: public  
**Fulfil**: <code>String[]</code> - supported device types  
**Example**  
```js
resin.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		console.log('Resin supports:', supportedDeviceType);
	});
});
```
**Example**  
```js
resin.models.device.getSupportedDeviceTypes(function(error, supportedDeviceTypes) {
	if (error) throw error;

	supportedDeviceTypes.forEach(function(supportedDeviceType) {
		console.log('Resin supports:', supportedDeviceType);
	});
});
```
<a name="resin.models.device.getManifestBySlug"></a>

##### device.getManifestBySlug(slug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get a device manifest by slug  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>String</code> | device slug |

**Example**  
```js
resin.models.device.getManifestBySlug('raspberry-pi').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
resin.models.device.getManifestBySlug('raspberry-pi', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="resin.models.device.getManifestByApplication"></a>

##### device.getManifestByApplication(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get a device manifest by application name  
**Access**: public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.device.getManifestByApplication('MyApp').then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
resin.models.device.getManifestByApplication(123).then(function(manifest) {
	console.log(manifest);
});
```
**Example**  
```js
resin.models.device.getManifestByApplication('MyApp', function(error, manifest) {
	if (error) throw error;
	console.log(manifest);
});
```
<a name="resin.models.device.generateUniqueKey"></a>

##### device.generateUniqueKey() ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Generate a random key, useful for both uuid and api key.  
**Returns**: <code>String</code> - A generated key  
**Access**: public  
**Example**  
```js
randomKey = resin.models.device.generateUniqueKey();
// randomKey is a randomly generated key that can be used as either a uuid or an api key
console.log(randomKey);
```
<a name="resin.models.device.register"></a>

##### device.register(applicationNameOrId, uuid) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Register a new device with a Resin.io application.  
**Access**: public  
**Fulfil**: <code>Object</code> Device registration info ({ id: "...", uuid: "...", api_key: "..." })  

| Param | Type | Description |
| --- | --- | --- |
| applicationNameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
var uuid = resin.models.device.generateUniqueKey();
resin.models.device.register('MyApp', uuid).then(function(registrationInfo) {
	console.log(registrationInfo);
});
```
**Example**  
```js
var uuid = resin.models.device.generateUniqueKey();
resin.models.device.register(123, uuid).then(function(registrationInfo) {
	console.log(registrationInfo);
});
```
**Example**  
```js
var uuid = resin.models.device.generateUniqueKey();
resin.models.device.register('MyApp', uuid, function(error, registrationInfo) {
	if (error) throw error;
	console.log(registrationInfo);
});
```
<a name="resin.models.device.generateDeviceKey"></a>

##### device.generateDeviceKey(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Generate a device key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.generateDeviceKey('7cf02a6').then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
resin.models.device.generateDeviceKey(123).then(function(deviceApiKey) {
	console.log(deviceApiKey);
});
```
**Example**  
```js
resin.models.device.generateDeviceKey('7cf02a6', function(error, deviceApiKey) {
	if (error) throw error;
	console.log(deviceApiKey);
});
```
<a name="resin.models.device.hasDeviceUrl"></a>

##### device.hasDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Check if a device is web accessible with device utls  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.hasDeviceUrl('7cf02a6').then(function(hasDeviceUrl) {
	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
**Example**  
```js
resin.models.device.hasDeviceUrl(123).then(function(hasDeviceUrl) {
	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
**Example**  
```js
resin.models.device.hasDeviceUrl('7cf02a6', function(error, hasDeviceUrl) {
	if (error) throw error;

	if (hasDeviceUrl) {
		console.log('The device has device URL enabled');
	}
});
```
<a name="resin.models.device.getDeviceUrl"></a>

##### device.getDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get a device url  
**Access**: public  
**Fulfil**: <code>String</code> - device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.getDeviceUrl('7cf02a6').then(function(url) {
	console.log(url);
});
```
**Example**  
```js
resin.models.device.getDeviceUrl(123).then(function(url) {
	console.log(url);
});
```
**Example**  
```js
resin.models.device.getDeviceUrl('7cf02a6', function(error, url) {
	if (error) throw error;
	console.log(url);
});
```
<a name="resin.models.device.enableDeviceUrl"></a>

##### device.enableDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Enable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.enableDeviceUrl('7cf02a6');
```
**Example**  
```js
resin.models.device.enableDeviceUrl(123);
```
**Example**  
```js
resin.models.device.enableDeviceUrl('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.disableDeviceUrl"></a>

##### device.disableDeviceUrl(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Disable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.disableDeviceUrl('7cf02a6');
```
**Example**  
```js
resin.models.device.disableDeviceUrl(123);
```
**Example**  
```js
resin.models.device.disableDeviceUrl('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.enableTcpPing"></a>

##### device.enableTcpPing(uuidOrId) ⇒ <code>Promise</code>
When the device's connection to the Resin VPN is down, by default
the device performs a TCP ping heartbeat to check for connectivity.
This is enabled by default.

**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Enable TCP ping for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.enableTcpPing('7cf02a6');
```
**Example**  
```js
resin.models.device.enableTcpPing(123);
```
**Example**  
```js
resin.models.device.enableTcpPing('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.disableTcpPing"></a>

##### device.disableTcpPing(uuidOrId) ⇒ <code>Promise</code>
When the device's connection to the Resin VPN is down, by default
the device performs a TCP ping heartbeat to check for connectivity.

**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Disable TCP ping for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.disableTcpPing('7cf02a6');
```
**Example**  
```js
resin.models.device.disableTcpPing(123);
```
**Example**  
```js
resin.models.device.disableTcpPing('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.ping"></a>

##### device.ping(uuidOrId) ⇒ <code>Promise</code>
This is useful to signal that the supervisor is alive and responding.

**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Ping a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.device.ping('7cf02a6');
```
**Example**  
```js
resin.models.device.ping(123);
```
**Example**  
```js
resin.models.device.ping('7cf02a6', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.device.getStatus"></a>

##### device.getStatus(device) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.device)  
**Summary**: Get the status of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device status  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
resin.models.device.getStatus(device).then(function(status) {
	console.log(status);
});
```
**Example**  
```js
resin.models.device.getStatus(device, function(error, status) {
	if (error) throw error;
	console.log(status);
});
```
<a name="resin.models.key"></a>

#### models.key : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.key](#resin.models.key) : <code>object</code>
    * [.getAll([options])](#resin.models.key.getAll) ⇒ <code>Promise</code>
    * [.get(id)](#resin.models.key.get) ⇒ <code>Promise</code>
    * [.remove(id)](#resin.models.key.remove) ⇒ <code>Promise</code>
    * [.create(title, key)](#resin.models.key.create) ⇒ <code>Promise</code>

<a name="resin.models.key.getAll"></a>

##### key.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#resin.models.key)  
**Summary**: Get all ssh keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - ssh keys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.key.getAll().then(function(keys) {
	console.log(keys);
});
```
**Example**  
```js
resin.models.key.getAll(function(error, keys) {
	if (error) throw error;
	console.log(keys);
});
```
<a name="resin.models.key.get"></a>

##### key.get(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#resin.models.key)  
**Summary**: Get a single ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | key id |

**Example**  
```js
resin.models.key.get(51).then(function(key) {
	console.log(key);
});
```
**Example**  
```js
resin.models.key.get(51, function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="resin.models.key.remove"></a>

##### key.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#resin.models.key)  
**Summary**: Remove ssh key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | key id |

**Example**  
```js
resin.models.key.remove(51);
```
**Example**  
```js
resin.models.key.remove(51, function(error) {
	if (error) throw error;
});
```
<a name="resin.models.key.create"></a>

##### key.create(title, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#resin.models.key)  
**Summary**: Create a ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>String</code> | key title |
| key | <code>String</code> | the public ssh key |

**Example**  
```js
resin.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	console.log(key);
});
```
**Example**  
```js
resin.models.key.create('Main', 'ssh-rsa AAAAB....', function(error, key) {
	if (error) throw error;
	console.log(key);
});
```
<a name="resin.models.environment-variables"></a>

#### models.environment-variables : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.environment-variables](#resin.models.environment-variables) : <code>object</code>
    * [.device](#resin.models.environment-variables.device) : <code>object</code>
        * [.getAll(uuidOrId)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(nameOrId)](#resin.models.environment-variables.device.getAllByApplication) ⇒ <code>Promise</code>
        * [.create(uuidOrId, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
        * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
        * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>
    * [.getAllByApplication(applicationNameOrId)](#resin.models.environment-variables.getAllByApplication) ⇒ <code>Promise</code>
    * [.create(applicationNameOrId, name, value)](#resin.models.environment-variables.create) ⇒ <code>Promise</code>
    * [.update(id, value)](#resin.models.environment-variables.update) ⇒ <code>Promise</code>
    * [.remove(id)](#resin.models.environment-variables.remove) ⇒ <code>Promise</code>
    * [.isSystemVariable(variable)](#resin.models.environment-variables.isSystemVariable) ⇒ <code>Boolean</code>

<a name="resin.models.environment-variables.device"></a>

##### environment-variables.device : <code>object</code>
**Kind**: static namespace of [<code>environment-variables</code>](#resin.models.environment-variables)  

* [.device](#resin.models.environment-variables.device) : <code>object</code>
    * [.getAll(uuidOrId)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId)](#resin.models.environment-variables.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.create(uuidOrId, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
    * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
    * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>

<a name="resin.models.environment-variables.device.getAll"></a>

###### device.getAll(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.environment-variables.device)  
**Summary**: Get all device environment variables  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.models.environmentVariables.device.getAll('7cf02a6').then(function(environmentVariables) {
	console.log(environmentVariables);
});
```
**Example**  
```js
resin.models.environmentVariables.device.getAll(123).then(function(environmentVariables) {
	console.log(environmentVariables);
});
```
**Example**  
```js
resin.models.environmentVariables.device.getAll('7cf02a6', function(error, environmentVariables) {
	if (error) throw error;
	console.log(environmentVariables)
});
```
<a name="resin.models.environment-variables.device.getAllByApplication"></a>

###### device.getAllByApplication(nameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.environment-variables.device)  
**Summary**: Get all device environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Description |
| --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.environmentVariables.device.getAllByApplication('MyApp').then(function(environmentVariables) {
	console.log(environmentVariables);
});
```
**Example**  
```js
resin.models.environmentVariables.device.getAllByApplication(999999).then(function(environmentVariables) {
	console.log(environmentVariables);
});
```
**Example**  
```js
resin.models.environmentVariables.device.getAllByApplication('MyApp', function(error, environmentVariables) {
	if (error) throw error;
	console.log(environmentVariables)
});
```
<a name="resin.models.environment-variables.device.create"></a>

###### device.create(uuidOrId, name, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.environment-variables.device)  
**Summary**: Create a device environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| name | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.device.create('7cf02a6', 'EDITOR', 'vim');
```
**Example**  
```js
resin.models.environmentVariables.device.create(123, 'EDITOR', 'vim');
```
**Example**  
```js
resin.models.environmentVariables.device.create('7cf02a6', 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.environment-variables.device.update"></a>

###### device.update(id, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.environment-variables.device)  
**Summary**: Update a device environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | environment variable id |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.device.update(2, 'emacs');
```
**Example**  
```js
resin.models.environmentVariables.device.update(2, 'emacs', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.environment-variables.device.remove"></a>

###### device.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#resin.models.environment-variables.device)  
**Summary**: Remove a device environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | environment variable id |

**Example**  
```js
resin.models.environmentVariables.device.remove(2);
```
**Example**  
```js
resin.models.environmentVariables.device.remove(2, function(error) {
	if (error) throw error;
});
```
<a name="resin.models.environment-variables.getAllByApplication"></a>

##### environment-variables.getAllByApplication(applicationNameOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>environment-variables</code>](#resin.models.environment-variables)  
**Summary**: Get all environment variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - environment variables  

| Param | Type | Description |
| --- | --- | --- |
| applicationNameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |

**Example**  
```js
resin.models.environmentVariables.getAllByApplication('MyApp').then(function(environmentVariables) {
	console.log(environmentVariables);
});
```
**Example**  
```js
resin.models.environmentVariables.getAllByApplication(123).then(function(environmentVariables) {
	console.log(environmentVariables);
});
```
**Example**  
```js
resin.models.environmentVariables.getAllByApplication('MyApp', function(error, environmentVariables) {
	if (error) throw error;
	console.log(environmentVariables);
});
```
<a name="resin.models.environment-variables.create"></a>

##### environment-variables.create(applicationNameOrId, name, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>environment-variables</code>](#resin.models.environment-variables)  
**Summary**: Create an environment variable for an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| applicationNameOrId | <code>String</code> \| <code>Number</code> | application name (string) or id (number) |
| name | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim');
```
**Example**  
```js
resin.models.environmentVariables.create(123, 'EDITOR', 'vim');
```
**Example**  
```js
resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.environment-variables.update"></a>

##### environment-variables.update(id, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>environment-variables</code>](#resin.models.environment-variables)  
**Summary**: Update an environment variable value from an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | environment variable id |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.update(317, 'vim');
```
**Example**  
```js
resin.models.environmentVariables.update(317, 'vim', function(error) {
	if (error) throw error;
});
```
<a name="resin.models.environment-variables.remove"></a>

##### environment-variables.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>environment-variables</code>](#resin.models.environment-variables)  
**Summary**: Remove environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | environment variable id |

**Example**  
```js
resin.models.environmentVariables.remove(51);
```
**Example**  
```js
resin.models.environmentVariables.remove(51, function(error) {
	if (error) throw error;
});
```
<a name="resin.models.environment-variables.isSystemVariable"></a>

##### environment-variables.isSystemVariable(variable) ⇒ <code>Boolean</code>
**Kind**: static method of [<code>environment-variables</code>](#resin.models.environment-variables)  
**Summary**: Check is a variable is system specific  
**Returns**: <code>Boolean</code> - Whether a variable is system specific or not  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>Object</code> | environment variable |

**Example**  
```js
resin.models.environmentVariables.isSystemVariable({
	name: 'RESIN_SUPERVISOR'
});
> true
```
**Example**  
```js
resin.models.environmentVariables.isSystemVariable({
	name: 'EDITOR'
});
> false
```
<a name="resin.models.os"></a>

#### models.os : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.os](#resin.models.os) : <code>object</code>
    * [.getDownloadSize(deviceType, [version])](#resin.models.os.getDownloadSize) ⇒ <code>Promise</code>
    * [.getSupportedVersions(deviceType)](#resin.models.os.getSupportedVersions) ⇒ <code>Promise</code>
    * [.getMaxSatisfyingVersion(deviceType, versionOrRange)](#resin.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
    * [.getLastModified(deviceType, [version])](#resin.models.os.getLastModified) ⇒ <code>Promise</code>
    * [.download(deviceType, [version])](#resin.models.os.download) ⇒ <code>Promise</code>
    * [.getConfig(nameOrId, [options])](#resin.models.os.getConfig) ⇒ <code>Promise</code>

<a name="resin.models.os.getDownloadSize"></a>

##### os.getDownloadSize(deviceType, [version]) ⇒ <code>Promise</code>
**Note!** Currently only the raw (uncompressed) size is reported.

**Kind**: static method of [<code>os</code>](#resin.models.os)  
**Summary**: Get OS download size estimate  
**Access**: public  
**Fulfil**: <code>Number</code> - OS image download size, in bytes.  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest'. The version **must** be the exact version number. |

**Example**  
```js
resin.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	console.log('The OS download size for raspberry-pi', size);
});

resin.models.os.getDownloadSize('raspberry-pi', function(error, size) {
	if (error) throw error;
	console.log('The OS download size for raspberry-pi', size);
});
```
<a name="resin.models.os.getSupportedVersions"></a>

##### os.getSupportedVersions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#resin.models.os)  
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
resin.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	console.log('Supported OS versions for raspberry-pi', osVersions);
});

resin.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	if (error) throw error;
	console.log('Supported OS versions for raspberry-pi', osVersions);
});
```
<a name="resin.models.os.getMaxSatisfyingVersion"></a>

##### os.getMaxSatisfyingVersion(deviceType, versionOrRange) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#resin.models.os)  
**Summary**: Get the max OS version satisfying the given range  
**Access**: public  
**Fulfil**: <code>String\|null</code> - the version number, or `null` if no matching versions are found  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| versionOrRange | <code>String</code> | can be one of * the exact version number, in which case it is returned if the version is supported, or `null` is returned otherwise, * a [semver](https://www.npmjs.com/package/semver)-compatible range specification, in which case the most recent satisfying version is returned if it exists, or `null` is returned, * `'latest'` in which case the most recent version is returned, including pre-releases, * `'recommended'` in which case the recommended version is returned, i.e. the most recent version excluding pre-releases, which can be `null` if only pre-release versions are available, * `'default'` in which case the recommended version is returned if available, or `latest` is returned otherwise. Defaults to `'latest'`. |

**Example**  
```js
resin.models.os.getSupportedVersions('raspberry-pi').then(function(osVersions) {
	console.log('Supported OS versions for raspberry-pi', osVersions);
});

resin.models.os.getSupportedVersions('raspberry-pi', function(error, osVersions) {
	if (error) throw error;
	console.log('Supported OS versions for raspberry-pi', osVersions);
});
```
<a name="resin.models.os.getLastModified"></a>

##### os.getLastModified(deviceType, [version]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#resin.models.os)  
**Summary**: Get the OS image last modified date  
**Access**: public  
**Fulfil**: <code>Date</code> - last modified date  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest'. Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. To resolve the semver-compatible range use `resin.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
resin.models.os.getLastModified('raspberry-pi').then(function(date) {
	console.log('The raspberry-pi image was last modified in ' + date);
});

resin.models.os.getLastModified('raspberrypi3', '2.0.0').then(function(date) {
	console.log('The raspberry-pi image was last modified in ' + date);
});

resin.models.os.getLastModified('raspberry-pi', function(error, date) {
	if (error) throw error;
	console.log('The raspberry-pi image was last modified in ' + date);
});
```
<a name="resin.models.os.download"></a>

##### os.download(deviceType, [version]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#resin.models.os)  
**Summary**: Download an OS image  
**Access**: public  
**Fulfil**: <code>ReadableStream</code> - download stream  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| [version] | <code>String</code> | semver-compatible version or 'latest', defaults to 'latest' Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. To resolve the semver-compatible range use `resin.model.os.getMaxSatisfyingVersion`. |

**Example**  
```js
resin.models.os.download('raspberry-pi').then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});

resin.models.os.download('raspberry-pi', function(error, stream) {
	if (error) throw error;
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});
```
<a name="resin.models.os.getConfig"></a>

##### os.getConfig(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#resin.models.os)  
**Summary**: Get an applications config.json  
**Access**: public  
**Fulfil**: <code>Object</code> - application configuration as a JSON object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number). |
| [options] | <code>Object</code> | <code>{}</code> | OS configuration options to use. |
| [options.network] | <code>String</code> | <code>&#x27;ethernet&#x27;</code> | The network type that the device will use, one of 'ethernet' or 'wifi'. |
| [options.appUpdatePollInterval] | <code>Number</code> |  | How often the OS checks for updates, in minutes. |
| [options.wifiKey] | <code>String</code> |  | The key for the wifi network the device will connect to. |
| [options.wifiSsid] | <code>String</code> |  | The ssid for the wifi network the device will connect to. |
| [options.ip] | <code>String</code> |  | static ip address. |
| [options.gateway] | <code>String</code> |  | static ip gateway. |
| [options.netmask] | <code>String</code> |  | static ip netmask. |
| [options.version] | <code>String</code> |  | The OS version of the image. |

**Example**  
```js
resin.models.os.getConfig('MyApp').then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

resin.models.os.getConfig(123).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

resin.models.os.getConfig('MyApp', function(error, config) {
	if (error) throw error;
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});
```
<a name="resin.models.config"></a>

#### models.config : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.config](#resin.models.config) : <code>object</code>
    * [.getAll()](#resin.models.config.getAll) ⇒ <code>Promise</code>
    * [.getDeviceTypes()](#resin.models.config.getDeviceTypes) ⇒ <code>Promise</code>
    * [.getDeviceOptions(deviceType)](#resin.models.config.getDeviceOptions) ⇒ <code>Promise</code>

<a name="resin.models.config.getAll"></a>

##### config.getAll() ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#resin.models.config)  
**Summary**: Get all configuration  
**Access**: public  
**Fulfil**: <code>Object</code> - configuration  
**Example**  
```js
resin.models.config.getAll().then(function(config) {
	console.log(config);
});
```
**Example**  
```js
resin.models.config.getAll(function(error, config) {
	if (error) throw error;
	console.log(config);
});
```
<a name="resin.models.config.getDeviceTypes"></a>

##### config.getDeviceTypes() ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#resin.models.config)  
**Summary**: Get device types  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  
**Example**  
```js
resin.models.config.getDeviceTypes().then(function(deviceTypes) {
	console.log(deviceTypes);
});
```
**Example**  
```js
resin.models.config.getDeviceTypes(function(error, deviceTypes) {
	if (error) throw error;
	console.log(deviceTypes);
})
```
<a name="resin.models.config.getDeviceOptions"></a>

##### config.getDeviceOptions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#resin.models.config)  
**Summary**: Get configuration/initialization options for a device type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - configuration options  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
resin.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
	console.log(options);
});
```
**Example**  
```js
resin.models.config.getDeviceOptions('raspberry-pi', function(error, options) {
	if (error) throw error;
	console.log(options);
});
```
<a name="resin.models.build"></a>

#### models.build : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#resin.models)  

* [.build](#resin.models.build) : <code>object</code>
    * [.get(id, [options])](#resin.models.build.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(nameOrId, [options])](#resin.models.build.getAllByApplication) ⇒ <code>Promise</code>

<a name="resin.models.build.get"></a>

##### build.get(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>build</code>](#resin.models.build)  
**Summary**: Get a specific build  
**Access**: public  
**Fulfil**: <code>Object</code> - build  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> |  | build id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.build.get(123).then(function(build) {
		console.log(build);
});
```
**Example**  
```js
resin.models.build.get(123, function(error, build) {
		if (error) throw error;
		console.log(build);
});
```
<a name="resin.models.build.getAllByApplication"></a>

##### build.getAllByApplication(nameOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>build</code>](#resin.models.build)  
**Summary**: Get all builds from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - builds  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| nameOrId | <code>String</code> \| <code>Number</code> |  | application name (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
resin.models.build.getAllByApplication('MyApp').then(function(builds) {
		console.log(builds);
});
```
**Example**  
```js
resin.models.build.getAllByApplication(123).then(function(builds) {
		console.log(builds);
});
```
**Example**  
```js
resin.models.build.getAllByApplication('MyApp', function(error, builds) {
		if (error) throw error;
		console.log(builds);
});
```
<a name="resin.auth"></a>

### resin.auth : <code>object</code>
**Kind**: static namespace of [<code>resin</code>](#resin)  

* [.auth](#resin.auth) : <code>object</code>
    * [.twoFactor](#resin.auth.twoFactor) : <code>object</code>
        * [.isEnabled()](#resin.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
        * [.isPassed()](#resin.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
        * [.challenge(code)](#resin.auth.twoFactor.challenge) ⇒ <code>Promise</code>
    * [.whoami()](#resin.auth.whoami) ⇒ <code>Promise</code>
    * [.authenticate(credentials)](#resin.auth.authenticate) ⇒ <code>Promise</code>
    * [.login(credentials)](#resin.auth.login) ⇒ <code>Promise</code>
    * [.loginWithToken(token)](#resin.auth.loginWithToken) ⇒ <code>Promise</code>
    * [.isLoggedIn()](#resin.auth.isLoggedIn) ⇒ <code>Promise</code>
    * [.getToken()](#resin.auth.getToken) ⇒ <code>Promise</code>
    * [.getUserId()](#resin.auth.getUserId) ⇒ <code>Promise</code>
    * [.getEmail()](#resin.auth.getEmail) ⇒ <code>Promise</code>
    * [.logout()](#resin.auth.logout) ⇒ <code>Promise</code>
    * [.register([credentials])](#resin.auth.register) ⇒ <code>Promise</code>

<a name="resin.auth.twoFactor"></a>

#### auth.twoFactor : <code>object</code>
**Kind**: static namespace of [<code>auth</code>](#resin.auth)  

* [.twoFactor](#resin.auth.twoFactor) : <code>object</code>
    * [.isEnabled()](#resin.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
    * [.isPassed()](#resin.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
    * [.challenge(code)](#resin.auth.twoFactor.challenge) ⇒ <code>Promise</code>

<a name="resin.auth.twoFactor.isEnabled"></a>

##### twoFactor.isEnabled() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#resin.auth.twoFactor)  
**Summary**: Check if two factor authentication is enabled  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa is enabled  
**Example**  
```js
resin.auth.twoFactor.isEnabled().then(function(isEnabled) {
	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```
**Example**  
```js
resin.auth.twoFactor.isEnabled(function(error, isEnabled) {
	if (error) throw error;

	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```
<a name="resin.auth.twoFactor.isPassed"></a>

##### twoFactor.isPassed() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#resin.auth.twoFactor)  
**Summary**: Check if two factor authentication challenge was passed  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa challenge was passed  
**Example**  
```js
resin.auth.twoFactor.isPassed().then(function(isPassed) {
	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```
**Example**  
```js
resin.auth.twoFactor.isPassed(function(error, isPassed) {
	if (error) throw error;

	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```
<a name="resin.auth.twoFactor.challenge"></a>

##### twoFactor.challenge(code) ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#resin.auth.twoFactor)  
**Summary**: Challenge two factor authentication  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
resin.auth.twoFactor.challenge('1234');
```
**Example**  
```js
resin.auth.twoFactor.challenge('1234', function(error) {
	if (error) throw error;
});
```
<a name="resin.auth.whoami"></a>

#### auth.whoami() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Return current logged in username  
**Access**: public  
**Fulfil**: <code>(String\|undefined)</code> - username, if it exists  
**Example**  
```js
resin.auth.whoami().then(function(username) {
	if (!username) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My username is:', username);
	}
});
```
**Example**  
```js
resin.auth.whoami(function(error, username) {
	if (error) throw error;

	if (!username) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My username is:', username);
	}
});
```
<a name="resin.auth.authenticate"></a>

#### auth.authenticate(credentials) ⇒ <code>Promise</code>
You should use [module:resin.auth.login](module:resin.auth.login) when possible,
as it takes care of saving the token and email as well.

Notice that if `credentials` contains extra keys, they'll be discarted
by the server automatically.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
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
resin.auth.authenticate(credentials).then(function(token) {
	console.log('My token is:', token);
});
```
**Example**  
```js
resin.auth.authenticate(credentials, function(error, token) {
	if (error) throw error;
	console.log('My token is:', token);
});
```
<a name="resin.auth.login"></a>

#### auth.login(credentials) ⇒ <code>Promise</code>
If the login is successful, the token is persisted between sessions.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Login to Resin.io  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of email, password |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
resin.auth.login(credentials);
```
**Example**  
```js
resin.auth.login(credentials, function(error) {
	if (error) throw error;
});
```
<a name="resin.auth.loginWithToken"></a>

#### auth.loginWithToken(token) ⇒ <code>Promise</code>
Login to resin with a session token instead of with credentials.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Login to Resin.io with a token  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | the auth token |

**Example**  
```js
resin.auth.loginWithToken(token);
```
**Example**  
```js
resin.auth.loginWithToken(token, function(error) {
	if (error) throw error;
});
```
<a name="resin.auth.isLoggedIn"></a>

#### auth.isLoggedIn() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Check if you're logged in  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is logged in  
**Example**  
```js
resin.auth.isLoggedIn().then(function(isLoggedIn) {
	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```
**Example**  
```js
resin.auth.isLoggedIn(function(error, isLoggedIn) {
	if (error) throw error;

	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```
<a name="resin.auth.getToken"></a>

#### auth.getToken() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Get current logged in user's token  
**Access**: public  
**Fulfil**: <code>String</code> - session token  
**Example**  
```js
resin.auth.getToken().then(function(token) {
	console.log(token);
});
```
**Example**  
```js
resin.auth.getToken(function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="resin.auth.getUserId"></a>

#### auth.getUserId() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Get current logged in user's id  
**Access**: public  
**Fulfil**: <code>Number</code> - user id  
**Example**  
```js
resin.auth.getUserId().then(function(userId) {
	console.log(userId);
});
```
**Example**  
```js
resin.auth.getUserId(function(error, userId) {
	if (error) throw error;
	console.log(userId);
});
```
<a name="resin.auth.getEmail"></a>

#### auth.getEmail() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Get current logged in user's email  
**Access**: public  
**Fulfil**: <code>String</code> - user email  
**Example**  
```js
resin.auth.getEmail().then(function(email) {
	console.log(email);
});
```
**Example**  
```js
resin.auth.getEmail(function(error, email) {
	if (error) throw error;
	console.log(email);
});
```
<a name="resin.auth.logout"></a>

#### auth.logout() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Logout from Resin.io  
**Access**: public  
**Example**  
```js
resin.auth.logout();
```
**Example**  
```js
resin.auth.logout(function(error) {
	if (error) throw error;
});
```
<a name="resin.auth.register"></a>

#### auth.register([credentials]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#resin.auth)  
**Summary**: Register to Resin.io  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [credentials] | <code>Object</code> | <code>{}</code> | in the form of username, password and email |
| credentials.email | <code>String</code> |  | the email |
| credentials.password | <code>String</code> |  | the password |

**Example**  
```js
resin.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}).then(function(token) {
	console.log(token);
});
```
**Example**  
```js
resin.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}, function(error, token) {
	if (error) throw error;
	console.log(token);
});
```
<a name="resin.logs"></a>

### resin.logs : <code>object</code>
**Kind**: static namespace of [<code>resin</code>](#resin)  

* [.logs](#resin.logs) : <code>object</code>
    * [.subscribe(uuidOrId)](#resin.logs.subscribe) ⇒ <code>Promise</code>
    * [.history(uuidOrId, [options])](#resin.logs.history) ⇒ <code>Promise</code>
    * [.historySinceLastClear(uuidOrId, [options])](#resin.logs.historySinceLastClear) ⇒ <code>Promise</code>
    * [.clear(uuidOrId)](#resin.logs.clear) ⇒ <code>Promise</code>
    * [.LogSubscription](#resin.logs.LogSubscription) : <code>EventEmitter</code>
        * [.unsubscribe()](#resin.logs.LogSubscription.unsubscribe)
        * ["line"](#resin.logs.LogSubscription.event_line)
        * ["clear"](#resin.logs.LogSubscription.event_clear)
        * ["error"](#resin.logs.LogSubscription.event_error)

<a name="resin.logs.subscribe"></a>

#### logs.subscribe(uuidOrId) ⇒ <code>Promise</code>
Connects to the stream of devices logs, returning a LogSubscription, which
can be used to listen for logs as they appear, line by line.

**Kind**: static method of [<code>logs</code>](#resin.logs)  
**Summary**: Subscribe to device logs  
**Access**: public  
**Fulfil**: [<code>LogSubscription</code>](#resin.logs.LogSubscription)  
**Todo**

- [ ] We should consider making this a readable stream.


| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.logs.subscribe('7cf02a6').then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
	logs.on('clear', function() {
		console.clear();
	});
});
```
**Example**  
```js
resin.logs.subscribe(123).then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
	logs.on('clear', function() {
		console.clear();
	});
});
```
**Example**  
```js
resin.logs.subscribe('7cf02a6', function(error, logs) {
	if (error) throw error;

	logs.on('line', function(line) {
		console.log(line);
	});
});
```
<a name="resin.logs.history"></a>

#### logs.history(uuidOrId, [options]) ⇒ <code>Promise</code>
**Note**: the default number of logs retrieved is 100.
To get a different number pass the `{ count: N }` to the options param.
Also note that the actual number of log lines can be bigger as the
Resin.io supervisor can combine lines sent in a short time interval

**Kind**: static method of [<code>logs</code>](#resin.logs)  
**Summary**: Get device logs history  
**Access**: public  
**Fulfil**: <code>Object[]</code> - history lines  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| [options] | <code>Object</code> | any options supported by https://www.pubnub.com/docs/nodejs-javascript/api-reference#history |

**Example**  
```js
resin.logs.history('7cf02a6').then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
resin.logs.history(123).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
resin.logs.history('7cf02a6', { count: 20 }, function(error, lines) {
	if (error) throw error;

	lines.forEach(function(line) {
		console.log(line);
	});
});
```
<a name="resin.logs.historySinceLastClear"></a>

#### logs.historySinceLastClear(uuidOrId, [options]) ⇒ <code>Promise</code>
**Note**: the default number of logs retrieved is 200.
To get a different number pass the `{ count: N }` to the options param.
Also note that the actual number of log lines can be bigger as the
Resin.io supervisor can combine lines sent in a short time interval

**Kind**: static method of [<code>logs</code>](#resin.logs)  
**Summary**: Get device logs history after the most recent clear request  
**Access**: public  
**Fulfil**: <code>Object[]</code> - history lines  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| [options] | <code>Object</code> | any options supported by https://www.pubnub.com/docs/nodejs-javascript/api-reference#history |

**Example**  
```js
resin.logs.historySinceLastClear('7cf02a6', { count: 20 }).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
resin.logs.historySinceLastClear(123).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
resin.logs.historySinceLastClear('7cf02a6', function(error, lines) {
	if (error) throw error;

	lines.forEach(function(line) {
		console.log(line);
	});
});
```
<a name="resin.logs.clear"></a>

#### logs.clear(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>logs</code>](#resin.logs)  
**Summary**: Clear device logs history  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
resin.logs.clear('7cf02a6').then(function() {
	console.log('OK');
});
```
**Example**  
```js
resin.logs.clear(123).then(function() {
	console.log('OK');
});
```
<a name="resin.logs.LogSubscription"></a>

#### logs.LogSubscription : <code>EventEmitter</code>
The log subscription emits events as log data arrives.
You can get a LogSubscription for a given device by calling `resin.logs.subscribe(deviceId)`

**Kind**: static typedef of [<code>logs</code>](#resin.logs)  

* [.LogSubscription](#resin.logs.LogSubscription) : <code>EventEmitter</code>
    * [.unsubscribe()](#resin.logs.LogSubscription.unsubscribe)
    * ["line"](#resin.logs.LogSubscription.event_line)
    * ["clear"](#resin.logs.LogSubscription.event_clear)
    * ["error"](#resin.logs.LogSubscription.event_error)

<a name="resin.logs.LogSubscription.unsubscribe"></a>

##### LogSubscription.unsubscribe()
Disconnect from the logs feed and stop receiving any future events on this emitter.

**Kind**: static method of [<code>LogSubscription</code>](#resin.logs.LogSubscription)  
**Summary**: Unsubscribe from device logs  
**Access**: public  
**Example**  
```js
logs.unsubscribe();
```
<a name="resin.logs.LogSubscription.event_line"></a>

##### "line"
**Kind**: event emitted by [<code>LogSubscription</code>](#resin.logs.LogSubscription)  
**Summary**: Event fired when a new line of log output is available  
**Example**  
```js
logs.on('line', function(line) {
	console.log(line);
});
```
<a name="resin.logs.LogSubscription.event_clear"></a>

##### "clear"
**Kind**: event emitted by [<code>LogSubscription</code>](#resin.logs.LogSubscription)  
**Summary**: Event fired when the logs have been cleared  
**Example**  
```js
logs.on('clear', function() {
	console.clear();
});
```
<a name="resin.logs.LogSubscription.event_error"></a>

##### "error"
**Kind**: event emitted by [<code>LogSubscription</code>](#resin.logs.LogSubscription)  
**Summary**: Event fired when an error has occured reading the device logs  
**Example**  
```js
logs.on('error', function(error) {
	console.error(error);
});
```
<a name="resin.settings"></a>

### resin.settings : <code>object</code>
**Kind**: static namespace of [<code>resin</code>](#resin)  

* [.settings](#resin.settings) : <code>object</code>
    * [.get([key])](#resin.settings.get) ⇒ <code>Promise</code>
    * [.getAll()](#resin.settings.getAll) ⇒ <code>Promise</code>

<a name="resin.settings.get"></a>

#### settings.get([key]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#resin.settings)  
**Summary**: Get a single setting. **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>\*</code> - setting value  

| Param | Type | Description |
| --- | --- | --- |
| [key] | <code>String</code> | setting key |

**Example**  
```js
resin.settings.get('apiUrl').then(function(apiUrl) {
	console.log(apiUrl);
});
```
**Example**  
```js
resin.settings.get('apiUrl', function(error, apiUrl) {
	if (error) throw error;
	console.log(apiUrl);
});
```
<a name="resin.settings.getAll"></a>

#### settings.getAll() ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#resin.settings)  
**Summary**: Get all settings **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>Object</code> - settings  
**Example**  
```js
resin.settings.getAll().then(function(settings) {
	console.log(settings);
});
```
**Example**  
```js
resin.settings.getAll(function(error, settings) {
	if (error) throw error;
	console.log(settings);
});
```
