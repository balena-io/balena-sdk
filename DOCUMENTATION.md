Welcome to the Balena SDK documentation. This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.

## Installation

Install the balena SDK by running:

```sh
$ npm install --save balena-sdk
```

### Bundling for browsers

If you're using webpack, browserify, or a similar tool then you probably want to bundle the balena SDK into your application yourself, rather than using the pre-built `balena-browser.min.js` bundle. 

If you intend to do that, be sure to remove the following dependencies that are actually unnecessary in the browser, because they're only used in Node environments. This will significantly reduce the size of your resulting bundle:

* fs
* path
* balena-settings-client
* node-localstorage
* fs/promises
* mime

### Bundling with pkg

The balena SDK includes builds for various ECMAScript versions that are
dynamically selected at runtime (using 
[@balena/es-version](https://github.com/balena-io-modules/balena-es-version)).
For this reason, packagers like [pkg](https://github.com/vercel/pkg) are not
able to automatically detect which assets to include in the output package. The
following sample `pkg` section should be added to your application's
`package.json` file to instruct `pkg` to bundle the required assets:

```json
  "pkg": {
    "scripts": [
      "node_modules/balena-sdk/**/*.js"
    ],
    "assets": [
      "node_modules/pinejs-client-core/**/*"
    ]
  }
```

For more information, please refer to the respective
[documentation from the `pkg` project](https://github.com/vercel/pkg#config).

## Trying balenaSDK in the browser

BalenaSDK is widely utilized in the [balenaCloud dashboard](https://dashboard.balena-cloud.com/) to perform operations. The SDK has been made available in the browser console by default to test balenaSDK queries on the go. 
To use it, head to the [balenaCloud dashboard](https://dashboard.balena-cloud.com/) and open the [browser developer console](https://support.monday.com/hc/en-us/articles/360002197259-How-to-Open-the-Developer-Console). There, you will find balenaSDK initialized in the console and ready to run SDK queries.

![](https://user-images.githubusercontent.com/22801822/157650701-d47ee5bc-28e4-4ca9-9aba-e208d47698c3.png)


If you feel something is missing, not clear or could be improved, please don't hesitate to open an
[issue in GitHub](https://github.com/balena-io/balena-sdk/issues/new), we'll be happy to help.


## Modules

<dl>
<dt><a href="#module_balena-sdk">balena-sdk</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#balena">balena</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#listImagesFromTargetState">listImagesFromTargetState(targetState)</a> ⇒</dt>
<dd></dd>
</dl>

<a name="module_balena-sdk"></a>

## balena-sdk

* [balena-sdk](#module_balena-sdk)
    * [~getSdk()](#module_balena-sdk..getSdk)
    * [~setSharedOptions(options)](#module_balena-sdk..setSharedOptions)
    * [~fromSharedOptions()](#module_balena-sdk..fromSharedOptions)

<a name="module_balena-sdk..getSdk"></a>

### balena-sdk~getSdk()
The module exports a single factory function.

**Kind**: inner method of [<code>balena-sdk</code>](#module_balena-sdk)  
**Summary**: Creates a new SDK instance using the default or the provided options.  
**Example**  
```js
// with es6 imports
import { getSdk } from 'balena-sdk';
// or with node require
const { getSdk } = require('balena-sdk');

const balena = getSdk({
	apiUrl: "https://api.balena-cloud.com/",
	dataDirectory: "/opt/local/balena"
});
```
<a name="module_balena-sdk..setSharedOptions"></a>

### balena-sdk~setSharedOptions(options)
Set options that are used by calls to `fromSharedOptions()`.
The options accepted are the same as those used in the main SDK factory function.
If you use this method, it should be called as soon as possible during app
startup and before any calls to `fromSharedOptions()` are made.

**Kind**: inner method of [<code>balena-sdk</code>](#module_balena-sdk)  
**Summary**: Set shared default options  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | The shared default options |
| [options.apiUrl] | <code>String</code> | <code>&#x27;https://api.balena-cloud.com/&#x27;</code> | the balena API url to use. |
| [options.builderUrl] | <code>String</code> | <code>&#x27;https://builder.balena-cloud.com/&#x27;</code> | the balena builder url to use. |
| [options.deviceUrlsBase] | <code>String</code> | <code>&#x27;balena-devices.com&#x27;</code> | the base balena device API url to use. |
| [options.requestLimit] | <code>Number</code> |  | the number of requests per requestLimitInterval that the SDK should respect. |
| [options.requestLimitInterval] | <code>Number</code> | <code>60000</code> | the timespan that the requestLimit should apply to in milliseconds, defaults to 60000 (1 minute). |
| [options.retryRateLimitedRequests] | <code>Boolean</code> \| <code>function</code> | <code>false</code> | Determines whether to automatically retry requests that are failing with a 429 Too Many Requests status code and that include a numeric Retry-After response header. - If `false`, rate-limited requests will not be retried, and the rate limit error will be propagated. - If `true`, all rate-limited requests will be retried after the duration specified by the `Retry-After` header. - If a function `(retryAfterMs: number) => boolean` is provided, it will be called with the retry duration in ms and the request will be retried only when `true` is returned. |
| [options.dataDirectory] | <code>String</code> \| <code>False</code> | <code>&#x27;$HOME/.balena&#x27;</code> | *ignored in the browser unless false*, the directory where the user settings are stored, normally retrieved like `require('balena-settings-client').get('dataDirectory')`. Providing `false` creates an isolated in-memory instance. |
| [options.isBrowser] | <code>Boolean</code> |  | the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value. |
| [options.debug] | <code>Boolean</code> |  | when set will print some extra debug information. |

**Example**  
```js
import { setSharedOptions } from 'balena-sdk';
setSharedOptions({
	apiUrl: 'https://api.balena-cloud.com/',
	builderUrl: 'https://builder.balena-cloud.com/',
	isBrowser: true,
});
```
<a name="module_balena-sdk..fromSharedOptions"></a>

### balena-sdk~fromSharedOptions()
Create an SDK instance using shared default options set using the `setSharedOptions()` method.
If options have not been set using this method, then this method will use the
same defaults as the main SDK factory function.

**Kind**: inner method of [<code>balena-sdk</code>](#module_balena-sdk)  
**Summary**: Create an SDK instance using shared default options  
**Access**: public  
**Example**  
```js
import { fromSharedOptions } from 'balena-sdk';
const sdk = fromSharedOptions();
```
<a name="balena"></a>

## balena : <code>object</code>
**Kind**: global namespace  

* [balena](#balena) : <code>object</code>
    * [.interceptors](#balena.interceptors) : <code>Array.&lt;Interceptor&gt;</code>
        * [.Interceptor](#balena.interceptors.Interceptor) : <code>object</code>
    * [.utils](#balena.utils) : <code>Object</code>
    * [.request](#balena.request) : <code>Object</code>
    * [.pine](#balena.pine) : <code>Object</code>
    * [.errors](#balena.errors) : <code>Object</code>
    * [.models](#balena.models) : <code>object</code>
        * [.application](#balena.models.application) : <code>object</code>
            * [.tags](#balena.models.application.tags) : <code>object</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.set(slugOrUuidOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
                * [.remove(slugOrUuidOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
            * [.configVar](#balena.models.application.configVar) : <code>object</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(slugOrUuidOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
                * [.set(slugOrUuidOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
                * [.remove(slugOrUuidOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
            * [.envVar](#balena.models.application.envVar) : <code>object</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(slugOrUuidOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
                * [.set(slugOrUuidOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
                * [.remove(slugOrUuidOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
            * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(slugOrUuidOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
                * [.set(slugOrUuidOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
                * [.remove(slugOrUuidOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
            * [.membership](#balena.models.application.membership) : <code>object</code>
                * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByUser(usernameOrId, [options])](#balena.models.application.membership.getAllByUser) ⇒ <code>Promise</code>
                * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
                * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
                * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
            * [.invite](#balena.models.application.invite) : <code>object</code>
                * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
                * [.create(slugOrUuidOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
                * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
                * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
            * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
            * [.getAll([options], [context])](#balena.models.application.getAll) ⇒ <code>Promise</code>
            * [.getAllDirectlyAccessible([options])](#balena.models.application.getAllDirectlyAccessible) ⇒ <code>Promise</code>
            * [.getAllByOrganization(orgHandleOrId, [options])](#balena.models.application.getAllByOrganization) ⇒ <code>Promise</code>
            * [.get(slugOrUuidOrId, [options], [context])](#balena.models.application.get) ⇒ <code>Promise</code>
            * [.getDirectlyAccessible(slugOrUuidOrId, [options])](#balena.models.application.getDirectlyAccessible) ⇒ <code>Promise</code>
            * [.getWithDeviceServiceDetails(slugOrUuidOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
            * [.getAppByName(appName, [options], [context])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
            * [.has(slugOrUuidOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
            * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
            * [.remove(slugOrUuidOrIdOrIds)](#balena.models.application.remove) ⇒ <code>Promise</code>
            * [.rename(slugOrUuidOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
            * [.restart(slugOrUuidOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
            * [.generateProvisioningKey(generateProvisioningKeyParams)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
            * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
            * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
            * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
            * [.willTrackNewReleases(slugOrUuidOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
            * [.isTrackingLatestRelease(slugOrUuidOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
            * [.pinToRelease(slugOrUuidOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
            * [.getTargetReleaseHash(slugOrUuidOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
            * [.trackLatestRelease(slugOrUuidOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
            * [.enableDeviceUrls(slugOrUuidOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
            * [.disableDeviceUrls(slugOrUuidOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
            * [.grantSupportAccess(slugOrUuidOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
            * [.revokeSupportAccess(slugOrUuidOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
        * [.device](#balena.models.device) : <code>object</code>
            * [.tags](#balena.models.device.tags) : <code>object</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
                * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
            * [.configVar](#balena.models.device.configVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
            * [.envVar](#balena.models.device.envVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
            * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
                * [.set(uuidOrId, serviceNameOrId, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
                * [.remove(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
            * [.history](#balena.models.device.history) : <code>object</code>
                * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.history.getAllByDevice) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.history.getAllByApplication) ⇒ <code>Promise</code>
            * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByOrganization(handleOrId, [options])](#balena.models.device.getAllByOrganization) ⇒ <code>Promise</code>
            * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
            * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
            * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
            * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
            * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
            * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
            * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
            * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
            * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
            * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
            * [.remove(uuidOrIdOrArray)](#balena.models.device.remove) ⇒ <code>Promise</code>
            * [.deactivate(uuidOrIdOrArray)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
            * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
            * [.setNote(uuidOrIdOrArray, note)](#balena.models.device.setNote) ⇒ <code>Promise</code>
            * [.setCustomLocation(uuidOrIdOrArray, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
            * [.unsetCustomLocation(uuidOrIdOrArray)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
            * [.move(uuidOrIdOrArray, applicationSlugOrUuidOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
            * [.getSupervisorTargetState(uuidOrId, version)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
            * [.getSupervisorTargetStateForApp(uuidOrId, release)](#balena.models.device.getSupervisorTargetStateForApp) ⇒ <code>Promise</code>
            * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
            * [.register(applicationSlugOrUuidOrId, uuid, [deviceTypeSlug])](#balena.models.device.register) ⇒ <code>Promise</code>
            * [.generateDeviceKey(uuidOrId, [keyName], [keyDescription])](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
            * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
            * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
            * [.enableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
            * [.disableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
            * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
            * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
            * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
            * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
            * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
            * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
            * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
            * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
            * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
            * [.grantSupportAccess(uuidOrIdOrArray, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
            * [.revokeSupportAccess(uuidOrIdOrArray)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
            * ~~[.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>~~
            * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
            * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
            * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
            * [.pinToRelease(uuidOrIdOrArray, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
            * [.trackApplicationRelease(uuidOrIdOrArray)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
            * [.setSupervisorRelease(uuidOrIdOrArray, supervisorVersionOrId)](#balena.models.device.setSupervisorRelease) ⇒ <code>Promise</code>
            * [.startOsUpdate(uuidOrUuids, targetOsVersion, [options])](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
            * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
            * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
            * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
            * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
            * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
            * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
            * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
            * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
            * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
            * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
            * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
        * [.deviceType](#balena.models.deviceType) : <code>object</code>
            * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
            * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
            * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
            * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
            * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>
            * [.getInterpolatedPartials(deviceTypeSlug)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
            * [.getInstructions(deviceTypeSlugOrContract)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
            * [.getInstallMethod(deviceTypeSlug)](#balena.models.deviceType.getInstallMethod) ⇒ <code>Promise</code>
        * [.apiKey](#balena.models.apiKey) : <code>object</code>
            * [.create(createApiKeyParams)](#balena.models.apiKey.create) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
            * [.getAllNamedUserApiKeys([options])](#balena.models.apiKey.getAllNamedUserApiKeys) ⇒ <code>Promise</code>
            * [.getProvisioningApiKeysByApplication(slugOrUuidOrId, [options])](#balena.models.apiKey.getProvisioningApiKeysByApplication) ⇒ <code>Promise</code>
            * [.getDeviceApiKeysByDevice(uuidOrId, [options])](#balena.models.apiKey.getDeviceApiKeysByDevice) ⇒ <code>Promise</code>
            * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>
        * [.key](#balena.models.key) : <code>object</code>
            * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
            * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
            * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
            * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>
        * [.organization](#balena.models.organization) : <code>object</code>
            * [.membership](#balena.models.organization.membership) : <code>object</code>
                * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
                * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
                * [.getAllByUser(usernameOrId, [options])](#balena.models.organization.membership.getAllByUser) ⇒ <code>Promise</code>
                * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
                * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>
            * [.invite](#balena.models.organization.invite) : <code>object</code>
                * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
                * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
                * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
                * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
                * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
            * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
            * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
            * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>
        * [.team](#balena.models.team) : <code>object</code>
            * [.applicationAccess](#balena.models.team.applicationAccess) : <code>object</code>
                * [.getAllByTeam(teamId, [options])](#balena.models.team.applicationAccess.getAllByTeam) ⇒ <code>Promise</code>
                * [.get(teamApplicationAccessId, [options])](#balena.models.team.applicationAccess.get) ⇒ <code>Promise</code>
                * [.update(teamApplicationAccessId, roleName)](#balena.models.team.applicationAccess.update) ⇒ <code>Promise</code>
                * [.remove(teamApplicationAccessId)](#balena.models.team.applicationAccess.remove) ⇒ <code>Promise</code>
            * [.create(organizationSlugOrId, name)](#balena.models.team.create) ⇒ <code>Promise</code>
            * [.getAllByOrganization(organizationSlugOrId, [options])](#balena.models.team.getAllByOrganization) ⇒ <code>Promise</code>
            * [.get(teamId, [options])](#balena.models.team.get) ⇒ <code>Promise</code>
            * [.rename(teamId, newName)](#balena.models.team.rename) ⇒ <code>Promise</code>
            * [.remove(teamId)](#balena.models.team.remove) ⇒ <code>Promise</code>
        * [.os](#balena.models.os) : <code>object</code>
            * [.getAvailableOsVersions(deviceTypes, [options])](#balena.models.os.getAvailableOsVersions) ⇒ <code>Promise</code>
            * [.getAllOsVersions(deviceTypes, [options])](#balena.models.os.getAllOsVersions) ⇒ <code>Promise</code>
            * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
            * [.getMaxSatisfyingVersion(deviceType, versionOrRange, [osType])](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
            * [.download(options)](#balena.models.os.download) ⇒ <code>Promise</code>
            * [.getConfig(slugOrUuidOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
            * [.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)](#balena.models.os.isSupportedOsUpdate) ⇒ <code>Promise</code>
            * [.getOsUpdateType(deviceType, currentVersion, targetVersion)](#balena.models.os.getOsUpdateType) ⇒ <code>Promise</code>
            * [.getSupportedOsUpdateVersions(deviceType, currentVersion, [options])](#balena.models.os.getSupportedOsUpdateVersions) ⇒ <code>Promise</code>
            * [.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture)](#balena.models.os.isArchitectureCompatibleWith) ⇒ <code>Boolean</code>
            * [.getSupervisorReleasesForCpuArchitecture(cpuArchitectureSlugOrId, [options])](#balena.models.os.getSupervisorReleasesForCpuArchitecture) ⇒ <code>Promise.&lt;String&gt;</code>
        * [.config](#balena.models.config) : <code>object</code>
            * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
            * ~~[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>~~
            * ~~[.getDeviceTypeManifestBySlug(slugOrName)](#balena.models.config.getDeviceTypeManifestBySlug) ⇒ <code>Promise</code>~~
            * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
            * [.getConfigVarSchema(deviceType)](#balena.models.config.getConfigVarSchema) ⇒ <code>Promise</code>
        * [.release](#balena.models.release) : <code>object</code>
            * [.tags](#balena.models.release.tags) : <code>object</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
                * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
                * [.set(commitOrIdOrRawVersion, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
                * [.remove(commitOrIdOrRawVersion, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
            * [.asset](#balena.models.release.asset) : <code>object</code>
                * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.asset.getAllByRelease) ⇒ <code>Promise</code>
                * [.get(id, [options])](#balena.models.release.asset.get) ⇒ <code>Promise</code>
                * [.download(id)](#balena.models.release.asset.download) ⇒ <code>Promise</code>
                * [.upload(uploadParams, [options])](#balena.models.release.asset.upload) ⇒ <code>Promise</code>
                * [.remove(id)](#balena.models.release.asset.remove) ⇒ <code>Promise</code>
            * [.get(commitOrIdOrRawVersion, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
            * [.getWithImageDetails(commitOrIdOrRawVersion, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
            * [.getLatestByApplication(slugOrUuidOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
            * [.createFromUrl(slugOrUuidOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>
            * [.finalize(commitOrIdOrRawVersion)](#balena.models.release.finalize) ⇒ <code>Promise</code>
            * [.setIsInvalidated(commitOrIdOrRawVersion, isInvalidated)](#balena.models.release.setIsInvalidated) ⇒ <code>Promise</code>
            * [.setNote(commitOrIdOrRawVersion, noteOrNull)](#balena.models.release.setNote) ⇒ <code>Promise</code>
            * [.setKnownIssueList(commitOrIdOrRawVersion, knownIssueListOrNull)](#balena.models.release.setKnownIssueList) ⇒ <code>Promise</code>
        * [.service](#balena.models.service) : <code>object</code>
            * [.var](#balena.models.service.var) : <code>object</code>
                * [.getAllByService(serviceIdOrNaturalKey, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
                * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
                * [.get(serviceIdOrNaturalKey, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
                * [.set(serviceIdOrNaturalKey, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
                * [.remove(serviceIdOrNaturalKey, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
        * [.image](#balena.models.image) : <code>object</code>
            * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
            * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>
        * [.creditBundle](#balena.models.creditBundle) : <code>object</code>
            * [.getAllByOrg(organization, [options])](#balena.models.creditBundle.getAllByOrg) ⇒ <code>Promise</code>
            * [.create(organization, featureId, creditsToPurchase)](#balena.models.creditBundle.create) ⇒ <code>Promise</code>
        * [.billing](#balena.models.billing) : <code>object</code>
            * [.getAccount(organization)](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
            * [.getPlan(organization)](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
            * [.getBillingInfo(organization)](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
            * [.createSetupIntent(setupIntentParams)](#balena.models.billing.createSetupIntent) ⇒ <code>Promise</code>
            * [.updateBillingInfo(organization, billingInfo)](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
            * [.removeBillingInfo(organization)](#balena.models.billing.removeBillingInfo) ⇒ <code>Promise</code>
            * [.updateAccountInfo(organization, accountInfo)](#balena.models.billing.updateAccountInfo)
            * [.changePlan(organization, planChangeOptions)](#balena.models.billing.changePlan) ⇒ <code>Promise</code>
            * [.getInvoices(organization)](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
            * [.downloadInvoice(organization)](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>
    * [.auth](#balena.auth) : <code>object</code>
        * [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
            * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
            * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
            * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>
            * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
            * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
            * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
            * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>
        * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
        * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
        * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
        * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
        * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
        * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
        * [.getUserInfo()](#balena.auth.getUserInfo) ⇒ <code>Promise</code>
        * [.getActorId()](#balena.auth.getActorId) ⇒ <code>Promise</code>
        * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
        * [.register(credentials)](#balena.auth.register) ⇒ <code>Promise</code>
        * [.verifyEmail(verificationPayload)](#balena.auth.verifyEmail) ⇒ <code>Promise</code>
        * [.requestVerificationEmail()](#balena.auth.requestVerificationEmail) ⇒ <code>Promise</code>
    * [.logs](#balena.logs) : <code>object</code>
        * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
        * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
        * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
            * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
            * ["line"](#balena.logs.LogSubscription.event_line)
            * ["error"](#balena.logs.LogSubscription.event_error)
    * [.settings](#balena.settings) : <code>object</code>
        * [.get([key])](#balena.settings.get) ⇒ <code>Promise</code>
        * [.getAll()](#balena.settings.getAll) ⇒ <code>Promise</code>
    * [.utils](#balena.utils) : <code>object</code>

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

<a name="balena.utils"></a>

### balena.utils : <code>Object</code>
The utils instance offers some convenient features for clients.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena utils instance  
**Access**: public  
**Example**  
```js
balena.utils.mergePineOptions(
 { $expand: { device: { $select: ['id'] } } },
 { $expand: { device: { $select: ['name'] } } },
);
```
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
The pinejs-client instance used internally. This should not be necessary
in normal usage, but can be useful if you want to directly make pine
queries to the api for some resource that isn't directly supported
in the SDK.

**Kind**: static property of [<code>balena</code>](#balena)  
**Summary**: Balena pine instance  
**Access**: public  
**Example**  
```js
balena.pine.get({
	resource: 'release',
	options: {
		$count: {
			$filter: { belongs_to__application: applicationId }
		}
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
  if (error.code === balena.errors.BalenaDeviceNotFound.prototype.code) {
    ...
  } else if (error.code === balena.errors.BalenaRequestError.prototype.code) {
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
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.set(slugOrUuidOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
            * [.remove(slugOrUuidOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
        * [.configVar](#balena.models.application.configVar) : <code>object</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(slugOrUuidOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
            * [.set(slugOrUuidOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
            * [.remove(slugOrUuidOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
        * [.envVar](#balena.models.application.envVar) : <code>object</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(slugOrUuidOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
            * [.set(slugOrUuidOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
            * [.remove(slugOrUuidOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
        * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(slugOrUuidOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
            * [.set(slugOrUuidOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
            * [.remove(slugOrUuidOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
        * [.membership](#balena.models.application.membership) : <code>object</code>
            * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByUser(usernameOrId, [options])](#balena.models.application.membership.getAllByUser) ⇒ <code>Promise</code>
            * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
            * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
            * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
        * [.invite](#balena.models.application.invite) : <code>object</code>
            * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
            * [.create(slugOrUuidOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
            * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
        * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
        * [.getAll([options], [context])](#balena.models.application.getAll) ⇒ <code>Promise</code>
        * [.getAllDirectlyAccessible([options])](#balena.models.application.getAllDirectlyAccessible) ⇒ <code>Promise</code>
        * [.getAllByOrganization(orgHandleOrId, [options])](#balena.models.application.getAllByOrganization) ⇒ <code>Promise</code>
        * [.get(slugOrUuidOrId, [options], [context])](#balena.models.application.get) ⇒ <code>Promise</code>
        * [.getDirectlyAccessible(slugOrUuidOrId, [options])](#balena.models.application.getDirectlyAccessible) ⇒ <code>Promise</code>
        * [.getWithDeviceServiceDetails(slugOrUuidOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
        * [.getAppByName(appName, [options], [context])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
        * [.has(slugOrUuidOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
        * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrIdOrIds)](#balena.models.application.remove) ⇒ <code>Promise</code>
        * [.rename(slugOrUuidOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
        * [.restart(slugOrUuidOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
        * [.generateProvisioningKey(generateProvisioningKeyParams)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
        * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
        * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
        * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
        * [.willTrackNewReleases(slugOrUuidOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
        * [.isTrackingLatestRelease(slugOrUuidOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
        * [.pinToRelease(slugOrUuidOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
        * [.getTargetReleaseHash(slugOrUuidOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
        * [.trackLatestRelease(slugOrUuidOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
        * [.enableDeviceUrls(slugOrUuidOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
        * [.disableDeviceUrls(slugOrUuidOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
        * [.grantSupportAccess(slugOrUuidOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
        * [.revokeSupportAccess(slugOrUuidOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>
    * [.device](#balena.models.device) : <code>object</code>
        * [.tags](#balena.models.device.tags) : <code>object</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
            * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
        * [.configVar](#balena.models.device.configVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
        * [.envVar](#balena.models.device.envVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
        * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
            * [.set(uuidOrId, serviceNameOrId, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
            * [.remove(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
        * [.history](#balena.models.device.history) : <code>object</code>
            * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.history.getAllByDevice) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.history.getAllByApplication) ⇒ <code>Promise</code>
        * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.device.getAllByOrganization) ⇒ <code>Promise</code>
        * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
        * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
        * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
        * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
        * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
        * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
        * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
        * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
        * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
        * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
        * [.remove(uuidOrIdOrArray)](#balena.models.device.remove) ⇒ <code>Promise</code>
        * [.deactivate(uuidOrIdOrArray)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
        * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
        * [.setNote(uuidOrIdOrArray, note)](#balena.models.device.setNote) ⇒ <code>Promise</code>
        * [.setCustomLocation(uuidOrIdOrArray, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
        * [.unsetCustomLocation(uuidOrIdOrArray)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
        * [.move(uuidOrIdOrArray, applicationSlugOrUuidOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
        * [.getSupervisorTargetState(uuidOrId, version)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
        * [.getSupervisorTargetStateForApp(uuidOrId, release)](#balena.models.device.getSupervisorTargetStateForApp) ⇒ <code>Promise</code>
        * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
        * [.register(applicationSlugOrUuidOrId, uuid, [deviceTypeSlug])](#balena.models.device.register) ⇒ <code>Promise</code>
        * [.generateDeviceKey(uuidOrId, [keyName], [keyDescription])](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
        * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
        * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
        * [.enableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
        * [.disableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
        * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
        * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
        * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
        * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
        * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
        * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
        * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
        * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
        * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
        * [.grantSupportAccess(uuidOrIdOrArray, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
        * [.revokeSupportAccess(uuidOrIdOrArray)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
        * ~~[.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>~~
        * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
        * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
        * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
        * [.pinToRelease(uuidOrIdOrArray, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
        * [.trackApplicationRelease(uuidOrIdOrArray)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
        * [.setSupervisorRelease(uuidOrIdOrArray, supervisorVersionOrId)](#balena.models.device.setSupervisorRelease) ⇒ <code>Promise</code>
        * [.startOsUpdate(uuidOrUuids, targetOsVersion, [options])](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
        * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
        * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
        * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
        * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
        * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
        * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
        * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
        * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
        * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
        * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
        * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>
    * [.deviceType](#balena.models.deviceType) : <code>object</code>
        * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
        * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
        * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
        * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
        * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>
        * [.getInterpolatedPartials(deviceTypeSlug)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
        * [.getInstructions(deviceTypeSlugOrContract)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
        * [.getInstallMethod(deviceTypeSlug)](#balena.models.deviceType.getInstallMethod) ⇒ <code>Promise</code>
    * [.apiKey](#balena.models.apiKey) : <code>object</code>
        * [.create(createApiKeyParams)](#balena.models.apiKey.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
        * [.getAllNamedUserApiKeys([options])](#balena.models.apiKey.getAllNamedUserApiKeys) ⇒ <code>Promise</code>
        * [.getProvisioningApiKeysByApplication(slugOrUuidOrId, [options])](#balena.models.apiKey.getProvisioningApiKeysByApplication) ⇒ <code>Promise</code>
        * [.getDeviceApiKeysByDevice(uuidOrId, [options])](#balena.models.apiKey.getDeviceApiKeysByDevice) ⇒ <code>Promise</code>
        * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>
    * [.key](#balena.models.key) : <code>object</code>
        * [.getAll([options])](#balena.models.key.getAll) ⇒ <code>Promise</code>
        * [.get(id)](#balena.models.key.get) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.key.remove) ⇒ <code>Promise</code>
        * [.create(title, key)](#balena.models.key.create) ⇒ <code>Promise</code>
    * [.organization](#balena.models.organization) : <code>object</code>
        * [.membership](#balena.models.organization.membership) : <code>object</code>
            * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
            * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
            * [.getAllByUser(usernameOrId, [options])](#balena.models.organization.membership.getAllByUser) ⇒ <code>Promise</code>
            * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
            * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>
        * [.invite](#balena.models.organization.invite) : <code>object</code>
            * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
            * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
            * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
            * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
            * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
        * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
        * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>
    * [.team](#balena.models.team) : <code>object</code>
        * [.applicationAccess](#balena.models.team.applicationAccess) : <code>object</code>
            * [.getAllByTeam(teamId, [options])](#balena.models.team.applicationAccess.getAllByTeam) ⇒ <code>Promise</code>
            * [.get(teamApplicationAccessId, [options])](#balena.models.team.applicationAccess.get) ⇒ <code>Promise</code>
            * [.update(teamApplicationAccessId, roleName)](#balena.models.team.applicationAccess.update) ⇒ <code>Promise</code>
            * [.remove(teamApplicationAccessId)](#balena.models.team.applicationAccess.remove) ⇒ <code>Promise</code>
        * [.create(organizationSlugOrId, name)](#balena.models.team.create) ⇒ <code>Promise</code>
        * [.getAllByOrganization(organizationSlugOrId, [options])](#balena.models.team.getAllByOrganization) ⇒ <code>Promise</code>
        * [.get(teamId, [options])](#balena.models.team.get) ⇒ <code>Promise</code>
        * [.rename(teamId, newName)](#balena.models.team.rename) ⇒ <code>Promise</code>
        * [.remove(teamId)](#balena.models.team.remove) ⇒ <code>Promise</code>
    * [.os](#balena.models.os) : <code>object</code>
        * [.getAvailableOsVersions(deviceTypes, [options])](#balena.models.os.getAvailableOsVersions) ⇒ <code>Promise</code>
        * [.getAllOsVersions(deviceTypes, [options])](#balena.models.os.getAllOsVersions) ⇒ <code>Promise</code>
        * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
        * [.getMaxSatisfyingVersion(deviceType, versionOrRange, [osType])](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
        * [.download(options)](#balena.models.os.download) ⇒ <code>Promise</code>
        * [.getConfig(slugOrUuidOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
        * [.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)](#balena.models.os.isSupportedOsUpdate) ⇒ <code>Promise</code>
        * [.getOsUpdateType(deviceType, currentVersion, targetVersion)](#balena.models.os.getOsUpdateType) ⇒ <code>Promise</code>
        * [.getSupportedOsUpdateVersions(deviceType, currentVersion, [options])](#balena.models.os.getSupportedOsUpdateVersions) ⇒ <code>Promise</code>
        * [.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture)](#balena.models.os.isArchitectureCompatibleWith) ⇒ <code>Boolean</code>
        * [.getSupervisorReleasesForCpuArchitecture(cpuArchitectureSlugOrId, [options])](#balena.models.os.getSupervisorReleasesForCpuArchitecture) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.config](#balena.models.config) : <code>object</code>
        * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
        * ~~[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>~~
        * ~~[.getDeviceTypeManifestBySlug(slugOrName)](#balena.models.config.getDeviceTypeManifestBySlug) ⇒ <code>Promise</code>~~
        * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
        * [.getConfigVarSchema(deviceType)](#balena.models.config.getConfigVarSchema) ⇒ <code>Promise</code>
    * [.release](#balena.models.release) : <code>object</code>
        * [.tags](#balena.models.release.tags) : <code>object</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
            * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
            * [.set(commitOrIdOrRawVersion, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
            * [.remove(commitOrIdOrRawVersion, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
        * [.asset](#balena.models.release.asset) : <code>object</code>
            * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.asset.getAllByRelease) ⇒ <code>Promise</code>
            * [.get(id, [options])](#balena.models.release.asset.get) ⇒ <code>Promise</code>
            * [.download(id)](#balena.models.release.asset.download) ⇒ <code>Promise</code>
            * [.upload(uploadParams, [options])](#balena.models.release.asset.upload) ⇒ <code>Promise</code>
            * [.remove(id)](#balena.models.release.asset.remove) ⇒ <code>Promise</code>
        * [.get(commitOrIdOrRawVersion, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
        * [.getWithImageDetails(commitOrIdOrRawVersion, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
        * [.getLatestByApplication(slugOrUuidOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
        * [.createFromUrl(slugOrUuidOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>
        * [.finalize(commitOrIdOrRawVersion)](#balena.models.release.finalize) ⇒ <code>Promise</code>
        * [.setIsInvalidated(commitOrIdOrRawVersion, isInvalidated)](#balena.models.release.setIsInvalidated) ⇒ <code>Promise</code>
        * [.setNote(commitOrIdOrRawVersion, noteOrNull)](#balena.models.release.setNote) ⇒ <code>Promise</code>
        * [.setKnownIssueList(commitOrIdOrRawVersion, knownIssueListOrNull)](#balena.models.release.setKnownIssueList) ⇒ <code>Promise</code>
    * [.service](#balena.models.service) : <code>object</code>
        * [.var](#balena.models.service.var) : <code>object</code>
            * [.getAllByService(serviceIdOrNaturalKey, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
            * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
            * [.get(serviceIdOrNaturalKey, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
            * [.set(serviceIdOrNaturalKey, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
            * [.remove(serviceIdOrNaturalKey, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
    * [.image](#balena.models.image) : <code>object</code>
        * [.get(id, [options])](#balena.models.image.get) ⇒ <code>Promise</code>
        * [.getLogs(id)](#balena.models.image.getLogs) ⇒ <code>Promise</code>
    * [.creditBundle](#balena.models.creditBundle) : <code>object</code>
        * [.getAllByOrg(organization, [options])](#balena.models.creditBundle.getAllByOrg) ⇒ <code>Promise</code>
        * [.create(organization, featureId, creditsToPurchase)](#balena.models.creditBundle.create) ⇒ <code>Promise</code>
    * [.billing](#balena.models.billing) : <code>object</code>
        * [.getAccount(organization)](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
        * [.getPlan(organization)](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
        * [.getBillingInfo(organization)](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
        * [.createSetupIntent(setupIntentParams)](#balena.models.billing.createSetupIntent) ⇒ <code>Promise</code>
        * [.updateBillingInfo(organization, billingInfo)](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
        * [.removeBillingInfo(organization)](#balena.models.billing.removeBillingInfo) ⇒ <code>Promise</code>
        * [.updateAccountInfo(organization, accountInfo)](#balena.models.billing.updateAccountInfo)
        * [.changePlan(organization, planChangeOptions)](#balena.models.billing.changePlan) ⇒ <code>Promise</code>
        * [.getInvoices(organization)](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
        * [.downloadInvoice(organization)](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>

<a name="balena.models.application"></a>

#### models.application : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.application](#balena.models.application) : <code>object</code>
    * [.tags](#balena.models.application.tags) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.application.configVar) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(slugOrUuidOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.application.envVar) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(slugOrUuidOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>
    * [.buildVar](#balena.models.application.buildVar) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(slugOrUuidOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
        * [.set(slugOrUuidOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
        * [.remove(slugOrUuidOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>
    * [.membership](#balena.models.application.membership) : <code>object</code>
        * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByUser(usernameOrId, [options])](#balena.models.application.membership.getAllByUser) ⇒ <code>Promise</code>
        * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
        * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
        * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>
    * [.invite](#balena.models.application.invite) : <code>object</code>
        * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
        * [.create(slugOrUuidOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
        * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>
    * [.getDashboardUrl(id)](#balena.models.application.getDashboardUrl) ⇒ <code>String</code>
    * [.getAll([options], [context])](#balena.models.application.getAll) ⇒ <code>Promise</code>
    * [.getAllDirectlyAccessible([options])](#balena.models.application.getAllDirectlyAccessible) ⇒ <code>Promise</code>
    * [.getAllByOrganization(orgHandleOrId, [options])](#balena.models.application.getAllByOrganization) ⇒ <code>Promise</code>
    * [.get(slugOrUuidOrId, [options], [context])](#balena.models.application.get) ⇒ <code>Promise</code>
    * [.getDirectlyAccessible(slugOrUuidOrId, [options])](#balena.models.application.getDirectlyAccessible) ⇒ <code>Promise</code>
    * [.getWithDeviceServiceDetails(slugOrUuidOrId, [options])](#balena.models.application.getWithDeviceServiceDetails) ⇒ <code>Promise</code>
    * [.getAppByName(appName, [options], [context])](#balena.models.application.getAppByName) ⇒ <code>Promise</code>
    * [.has(slugOrUuidOrId)](#balena.models.application.has) ⇒ <code>Promise</code>
    * [.hasAny()](#balena.models.application.hasAny) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.application.create) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrIdOrIds)](#balena.models.application.remove) ⇒ <code>Promise</code>
    * [.rename(slugOrUuidOrId, newName)](#balena.models.application.rename) ⇒ <code>Promise</code>
    * [.restart(slugOrUuidOrId)](#balena.models.application.restart) ⇒ <code>Promise</code>
    * [.generateProvisioningKey(generateProvisioningKeyParams)](#balena.models.application.generateProvisioningKey) ⇒ <code>Promise</code>
    * [.purge(appId)](#balena.models.application.purge) ⇒ <code>Promise</code>
    * [.shutdown(appId, [options])](#balena.models.application.shutdown) ⇒ <code>Promise</code>
    * [.reboot(appId, [options])](#balena.models.application.reboot) ⇒ <code>Promise</code>
    * [.willTrackNewReleases(slugOrUuidOrId)](#balena.models.application.willTrackNewReleases) ⇒ <code>Promise</code>
    * [.isTrackingLatestRelease(slugOrUuidOrId)](#balena.models.application.isTrackingLatestRelease) ⇒ <code>Promise</code>
    * [.pinToRelease(slugOrUuidOrId, fullReleaseHash)](#balena.models.application.pinToRelease) ⇒ <code>Promise</code>
    * [.getTargetReleaseHash(slugOrUuidOrId)](#balena.models.application.getTargetReleaseHash) ⇒ <code>Promise</code>
    * [.trackLatestRelease(slugOrUuidOrId)](#balena.models.application.trackLatestRelease) ⇒ <code>Promise</code>
    * [.enableDeviceUrls(slugOrUuidOrId)](#balena.models.application.enableDeviceUrls) ⇒ <code>Promise</code>
    * [.disableDeviceUrls(slugOrUuidOrId)](#balena.models.application.disableDeviceUrls) ⇒ <code>Promise</code>
    * [.grantSupportAccess(slugOrUuidOrId, expiryTimestamp)](#balena.models.application.grantSupportAccess) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(slugOrUuidOrId)](#balena.models.application.revokeSupportAccess) ⇒ <code>Promise</code>

<a name="balena.models.application.tags"></a>

##### application.tags : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.tags](#balena.models.application.tags) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, tagKey, value)](#balena.models.application.tags.set) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, tagKey)](#balena.models.application.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.tags.getAllByApplication"></a>

###### tags.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Get all application tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.tags.set"></a>

###### tags.set(slugOrUuidOrId, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Set an application tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.application.tags.set('myorganization/myapp', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.application.tags.set(123, 'EDITOR', 'vim');
```
<a name="balena.models.application.tags.remove"></a>

###### tags.remove(slugOrUuidOrId, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.application.tags)  
**Summary**: Remove an application tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.application.tags.remove('myorganization/myapp', 'EDITOR');
```
<a name="balena.models.application.configVar"></a>

##### application.configVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.configVar](#balena.models.application.configVar) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.configVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(slugOrUuidOrId, key)](#balena.models.application.configVar.get) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, key, value)](#balena.models.application.configVar.set) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, key)](#balena.models.application.configVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.configVar.getAllByApplication"></a>

###### configVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get all config variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.configVar.get"></a>

###### configVar.get(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Get the value of a specific config variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the config variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | config variable name |

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
<a name="balena.models.application.configVar.set"></a>

###### configVar.set(slugOrUuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Set the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | config variable name |
| value | <code>String</code> | config variable value |

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
<a name="balena.models.application.configVar.remove"></a>

###### configVar.remove(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.application.configVar)  
**Summary**: Clear the value of a specific config variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | config variable name |

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
<a name="balena.models.application.envVar"></a>

##### application.envVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.envVar](#balena.models.application.envVar) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.envVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(slugOrUuidOrId, key)](#balena.models.application.envVar.get) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, key, value)](#balena.models.application.envVar.set) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, key)](#balena.models.application.envVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.envVar.getAllByApplication"></a>

###### envVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get all environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.envVar.get"></a>

###### envVar.get(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Get the value of a specific environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |

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
<a name="balena.models.application.envVar.set"></a>

###### envVar.set(slugOrUuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Set the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

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
<a name="balena.models.application.envVar.remove"></a>

###### envVar.remove(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.application.envVar)  
**Summary**: Clear the value of a specific environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | environment variable name |

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
<a name="balena.models.application.buildVar"></a>

##### application.buildVar : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.buildVar](#balena.models.application.buildVar) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.buildVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(slugOrUuidOrId, key)](#balena.models.application.buildVar.get) ⇒ <code>Promise</code>
    * [.set(slugOrUuidOrId, key, value)](#balena.models.application.buildVar.set) ⇒ <code>Promise</code>
    * [.remove(slugOrUuidOrId, key)](#balena.models.application.buildVar.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.buildVar.getAllByApplication"></a>

###### buildVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Get all build environment variables for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application build environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.buildVar.get"></a>

###### buildVar.get(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Get the value of a specific build environment variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the build environment variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | build environment variable name |

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
<a name="balena.models.application.buildVar.set"></a>

###### buildVar.set(slugOrUuidOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Set the value of a specific build environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | build environment variable name |
| value | <code>String</code> | build environment variable value |

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
<a name="balena.models.application.buildVar.remove"></a>

###### buildVar.remove(slugOrUuidOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>buildVar</code>](#balena.models.application.buildVar)  
**Summary**: Clear the value of a specific build environment variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| key | <code>String</code> | build environment variable name |

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
<a name="balena.models.application.membership"></a>

##### application.membership : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.membership](#balena.models.application.membership) : <code>object</code>
    * [.get(membershipId, [options])](#balena.models.application.membership.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.membership.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByUser(usernameOrId, [options])](#balena.models.application.membership.getAllByUser) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.application.membership.create) ⇒ <code>Promise</code>
    * [.changeRole(idOrUniqueKey, roleName)](#balena.models.application.membership.changeRole) ⇒ <code>Promise</code>
    * [.remove(idOrUniqueKey)](#balena.models.application.membership.remove) ⇒ <code>Promise</code>

<a name="balena.models.application.membership.get"></a>

###### membership.get(membershipId, [options]) ⇒ <code>Promise</code>
This method returns a single application membership.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get a single application membership  
**Access**: public  
**Fulfil**: <code>Object</code> - application membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| membershipId | <code>number</code> \| <code>Object</code> |  | the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.membership.get(5).then(function(memberships) {
	console.log(memberships);
});
```
<a name="balena.models.application.membership.getAllByApplication"></a>

###### membership.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method returns all application memberships for a specific application.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get all memberships by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.membership.getAllByUser"></a>

###### membership.getAllByUser(usernameOrId, [options]) ⇒ <code>Promise</code>
This method returns all application memberships for a specific user.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Get all memberships by user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - application memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| usernameOrId | <code>String</code> \| <code>Number</code> |  | the user's username (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.membership.create"></a>

###### membership.create(options) ⇒ <code>Promise</code>
This method adds a user to an application by their username if they are a member of the organization.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Creates a new membership for an application  
**Access**: public  
**Fulfil**: <code>Object</code> - application membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | membership creation parameters |
| options.application | <code>String</code> \| <code>Number</code> |  | application handle (string), or id (number) |
| options.username | <code>String</code> |  | the username of the balena user that will become a member |
| [options.roleName] | <code>String</code> | <code>&quot;member&quot;</code> | the role name to be granted to the membership |

**Example**  
```js
balena.models.application.membership.create({ application: "myApp", username: "user123", roleName: "member" }).then(function(membership) {
	console.log(membership);
});
```
<a name="balena.models.application.membership.changeRole"></a>

###### membership.changeRole(idOrUniqueKey, roleName) ⇒ <code>Promise</code>
This method changes the role of an application member.

**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Changes the role of an application member  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idOrUniqueKey | <code>Number</code> \| <code>Object</code> | the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership that will be changed |
| roleName | <code>String</code> | the role name to be granted to the membership |

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
<a name="balena.models.application.membership.remove"></a>

###### membership.remove(idOrUniqueKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>membership</code>](#balena.models.application.membership)  
**Summary**: Remove a membership  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idOrUniqueKey | <code>Number</code> \| <code>Object</code> | the id or an object with the unique `user` & `is_member_of__application` numeric pair of the membership that will be removed |

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
<a name="balena.models.application.invite"></a>

##### application.invite : <code>object</code>
**Kind**: static namespace of [<code>application</code>](#balena.models.application)  

* [.invite](#balena.models.application.invite) : <code>object</code>
    * [.getAll([options])](#balena.models.application.invite.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.application.invite.getAllByApplication) ⇒ <code>Promise</code>
    * [.create(slugOrUuidOrId, options, [message])](#balena.models.application.invite.create) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.application.invite.revoke) ⇒ <code>Promise</code>
    * [.accept(invitationToken)](#balena.models.application.invite.accept) ⇒ <code>Promise</code>

<a name="balena.models.application.invite.getAll"></a>

###### invite.getAll([options]) ⇒ <code>Promise</code>
This method returns all invites.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Get all invites  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.invite.getAll().then(function(invites) {
	console.log(invites);
});
```
<a name="balena.models.application.invite.getAllByApplication"></a>

###### invite.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method returns all invites for a specific application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Get all invites by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.invite.create"></a>

###### invite.create(slugOrUuidOrId, options, [message]) ⇒ <code>Promise</code>
This method invites a user by their email to an application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Creates a new invite for an application  
**Access**: public  
**Fulfil**: <code>String</code> - application invite  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| options | <code>Object</code> |  | invite creation parameters |
| options.invitee | <code>String</code> |  | the email of the invitee |
| [options.roleName] | <code>String</code> | <code>&quot;developer&quot;</code> | the role name to be granted to the invitee |
| [message] | <code>String</code> | <code></code> | the message to send along with the invite |

**Example**  
```js
balena.models.application.invite.create('myorganization/myapp', { invitee: "invitee@example.org", roleName: "developer", message: "join my app" }).then(function(invite) {
	console.log(invite);
});
```
<a name="balena.models.application.invite.revoke"></a>

###### invite.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Revoke an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | application invite id |

**Example**  
```js
balena.models.application.invite.revoke(123);
```
<a name="balena.models.application.invite.accept"></a>

###### invite.accept(invitationToken) ⇒ <code>Promise</code>
This method adds the calling user to the application.

**Kind**: static method of [<code>invite</code>](#balena.models.application.invite)  
**Summary**: Accepts an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| invitationToken | <code>String</code> | invite token |

**Example**  
```js
balena.models.application.invite.accept("qwerty-invitation-token");
```
<a name="balena.models.application.getDashboardUrl"></a>

##### application.getDashboardUrl(id) ⇒ <code>String</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get Dashboard URL for a specific application  
**Returns**: <code>String</code> - - Dashboard URL for the specific application  
**Throws**:

- Exception if the id is not a finite number


| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Application id |

**Example**  
```js
balena.models.application.get('myorganization/myapp').then(function(application) {
	const dashboardApplicationUrl = balena.models.application.getDashboardUrl(application.id);
	console.log(dashboardApplicationUrl);
});
```
<a name="balena.models.application.getAll"></a>

##### application.getAll([options], [context]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |
| [context] | <code>String</code> |  | extra access filters, undefined or 'directly_accessible' |

**Example**  
```js
balena.models.application.getAll().then(function(applications) {
	console.log(applications);
});
```
<a name="balena.models.application.getAllDirectlyAccessible"></a>

##### application.getAllDirectlyAccessible([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications directly accessible by the user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAllDirectlyAccessible().then(function(applications) {
	console.log(applications);
});
```
<a name="balena.models.application.getAllByOrganization"></a>

##### application.getAllByOrganization(orgHandleOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get all applications of an organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - applications  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| orgHandleOrId | <code>Number</code> \| <code>String</code> |  | organization handle (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.application.getAllByOrganization().then(function(applications) {
	console.log(applications);
});
```
<a name="balena.models.application.get"></a>

##### application.get(slugOrUuidOrId, [options], [context]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |
| [context] | <code>String</code> |  | extra access filters, undefined or 'directly_accessible' |

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
<a name="balena.models.application.getDirectlyAccessible"></a>

##### application.getDirectlyAccessible(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application directly accessible by the user  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.getWithDeviceServiceDetails"></a>

##### application.getWithDeviceServiceDetails(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `application.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application and its devices, along with each device's
associated services' essential details  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.application.getAppByName"></a>

##### application.getAppByName(appName, [options], [context]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get a single application using the appname and the handle of the owning organization  
**Access**: public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>String</code> |  | application name |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |
| [context] | <code>String</code> |  | extra access filters, undefined or 'directly_accessible' |

**Example**  
```js
balena.models.application.getAppByName('MyApp').then(function(application) {
	console.log(application);
});
```
<a name="balena.models.application.has"></a>

##### application.has(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Check if an application exists  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has application  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

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
<a name="balena.models.application.hasAny"></a>

##### application.hasAny() ⇒ <code>Promise</code>
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
| [options.uuid] | <code>String</code> | application uuid |
| [options.applicationClass] | <code>String</code> | application class: 'app' | 'fleet' | 'block' |
| options.deviceType | <code>String</code> | device type slug |
| options.organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the organization that the application will belong to or null |

**Example**  
```js
balena.models.application.create({ name: 'My App', deviceType: 'raspberry-pi' }).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My Block', applicationClass: 'block', deviceType: 'raspberry-pi' }).then(function(application) {
	console.log(application);
});
```
**Example**  
```js
balena.models.application.create({ name: 'My App', deviceType: 'raspberry-pi', parent: 'ParentApp' }).then(function(application) {
	console.log(application);
});
```
<a name="balena.models.application.remove"></a>

##### application.remove(slugOrUuidOrIdOrIds) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Remove application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrIdOrIds | <code>String</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | application slug (string), uuid (string) or id (number) or array of ids |

**Example**  
```js
balena.models.application.remove('myorganization/myapp');
```
**Example**  
```js
balena.models.application.remove(123);
```
<a name="balena.models.application.rename"></a>

##### application.rename(slugOrUuidOrId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Rename application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| newName | <code>String</code> | new application name (string) |

**Example**  
```js
balena.models.application.rename('myorganization/myapp', 'MyRenamedApp');
```
**Example**  
```js
balena.models.application.rename(123, 'MyRenamedApp');
```
<a name="balena.models.application.restart"></a>

##### application.restart(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Restart application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

**Example**  
```js
balena.models.application.restart('myorganization/myapp');
```
**Example**  
```js
balena.models.application.restart(123);
```
<a name="balena.models.application.generateProvisioningKey"></a>

##### application.generateProvisioningKey(generateProvisioningKeyParams) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Generate a device provisioning key for a specific application  
**Access**: public  
**Fulfil**: <code>String</code> - device provisioning key  

| Param | Type | Description |
| --- | --- | --- |
| generateProvisioningKeyParams | <code>Object</code> | an object containing the parameters for the provisioning key generation |
| generateProvisioningKeyParams.slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| generateProvisioningKeyParams.keyExpiryDate | <code>String</code> | Expiry Date for provisioning key |
| [generateProvisioningKeyParams.keyName] | <code>String</code> | Provisioning key name |
| [generateProvisioningKeyParams.keyDescription] | <code>String</code> | Description for provisioning key |

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
<a name="balena.models.application.willTrackNewReleases"></a>

##### application.willTrackNewReleases(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get whether the application is configured to receive updates whenever a new release is available  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the latest release  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

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
<a name="balena.models.application.isTrackingLatestRelease"></a>

##### application.isTrackingLatestRelease(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get whether the application is up to date and is tracking the latest finalized release for updates  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the latest release  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

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
<a name="balena.models.application.pinToRelease"></a>

##### application.pinToRelease(slugOrUuidOrId, fullReleaseHash) ⇒ <code>Promise</code>
Configures the application to run a particular release
and not get updated when the latest release changes.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Set a specific application to run a particular release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| fullReleaseHash | <code>String</code> | the hash of a successful release (string) |

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
<a name="balena.models.application.getTargetReleaseHash"></a>

##### application.getTargetReleaseHash(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Get the hash of the current release for a specific application  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - The release hash of the current release  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

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
<a name="balena.models.application.trackLatestRelease"></a>

##### application.trackLatestRelease(slugOrUuidOrId) ⇒ <code>Promise</code>
The application's current release will be updated with each new successfully built release.

**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Configure a specific application to track the latest finalized available release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

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
<a name="balena.models.application.enableDeviceUrls"></a>

##### application.enableDeviceUrls(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Enable device urls for all devices that belong to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

**Example**  
```js
balena.models.application.enableDeviceUrls('myorganization/myapp');
```
**Example**  
```js
balena.models.application.enableDeviceUrls(123);
```
<a name="balena.models.application.disableDeviceUrls"></a>

##### application.disableDeviceUrls(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Disable device urls for all devices that belong to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

**Example**  
```js
balena.models.application.disableDeviceUrls('myorganization/myapp');
```
**Example**  
```js
balena.models.application.disableDeviceUrls(123);
```
<a name="balena.models.application.grantSupportAccess"></a>

##### application.grantSupportAccess(slugOrUuidOrId, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Grant support access to an application until a specified time  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| expiryTimestamp | <code>Number</code> | a timestamp in ms for when the support access will expire |

**Example**  
```js
balena.models.application.grantSupportAccess('myorganization/myapp', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.application.grantSupportAccess(123, Date.now() + 3600 * 1000);
```
<a name="balena.models.application.revokeSupportAccess"></a>

##### application.revokeSupportAccess(slugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>application</code>](#balena.models.application)  
**Summary**: Revoke support access to an application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

**Example**  
```js
balena.models.application.revokeSupportAccess('myorganization/myapp');
```
**Example**  
```js
balena.models.application.revokeSupportAccess(123);
```
<a name="balena.models.device"></a>

#### models.device : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.device](#balena.models.device) : <code>object</code>
    * [.tags](#balena.models.device.tags) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
        * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>
    * [.configVar](#balena.models.device.configVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, key)](#balena.models.device.configVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.configVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.configVar.remove) ⇒ <code>Promise</code>
    * [.envVar](#balena.models.device.envVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, key)](#balena.models.device.envVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, key, value)](#balena.models.device.envVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, key)](#balena.models.device.envVar.remove) ⇒ <code>Promise</code>
    * [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
        * [.set(uuidOrId, serviceNameOrId, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
        * [.remove(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>
    * [.history](#balena.models.device.history) : <code>object</code>
        * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.history.getAllByDevice) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.history.getAllByApplication) ⇒ <code>Promise</code>
    * [.getDashboardUrl(uuid)](#balena.models.device.getDashboardUrl) ⇒ <code>String</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.device.getAllByOrganization) ⇒ <code>Promise</code>
    * [.get(uuidOrId, [options])](#balena.models.device.get) ⇒ <code>Promise</code>
    * [.getWithServiceDetails(uuidOrId, [options])](#balena.models.device.getWithServiceDetails) ⇒ <code>Promise</code>
    * [.getByName(name)](#balena.models.device.getByName) ⇒ <code>Promise</code>
    * [.getName(uuidOrId)](#balena.models.device.getName) ⇒ <code>Promise</code>
    * [.getApplicationName(uuidOrId)](#balena.models.device.getApplicationName) ⇒ <code>Promise</code>
    * [.has(uuidOrId)](#balena.models.device.has) ⇒ <code>Promise</code>
    * [.isOnline(uuidOrId)](#balena.models.device.isOnline) ⇒ <code>Promise</code>
    * [.getLocalIPAddresses(uuidOrId)](#balena.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
    * [.getMACAddresses(uuidOrId)](#balena.models.device.getMACAddresses) ⇒ <code>Promise</code>
    * [.getMetrics(uuidOrId)](#balena.models.device.getMetrics) ⇒ <code>Promise</code>
    * [.remove(uuidOrIdOrArray)](#balena.models.device.remove) ⇒ <code>Promise</code>
    * [.deactivate(uuidOrIdOrArray)](#balena.models.device.deactivate) ⇒ <code>Promise</code>
    * [.rename(uuidOrId, newName)](#balena.models.device.rename) ⇒ <code>Promise</code>
    * [.setNote(uuidOrIdOrArray, note)](#balena.models.device.setNote) ⇒ <code>Promise</code>
    * [.setCustomLocation(uuidOrIdOrArray, location)](#balena.models.device.setCustomLocation) ⇒ <code>Promise</code>
    * [.unsetCustomLocation(uuidOrIdOrArray)](#balena.models.device.unsetCustomLocation) ⇒ <code>Promise</code>
    * [.move(uuidOrIdOrArray, applicationSlugOrUuidOrId)](#balena.models.device.move) ⇒ <code>Promise</code>
    * [.getSupervisorTargetState(uuidOrId, version)](#balena.models.device.getSupervisorTargetState) ⇒ <code>Promise</code>
    * [.getSupervisorTargetStateForApp(uuidOrId, release)](#balena.models.device.getSupervisorTargetStateForApp) ⇒ <code>Promise</code>
    * [.generateUniqueKey()](#balena.models.device.generateUniqueKey) ⇒ <code>String</code>
    * [.register(applicationSlugOrUuidOrId, uuid, [deviceTypeSlug])](#balena.models.device.register) ⇒ <code>Promise</code>
    * [.generateDeviceKey(uuidOrId, [keyName], [keyDescription])](#balena.models.device.generateDeviceKey) ⇒ <code>Promise</code>
    * [.hasDeviceUrl(uuidOrId)](#balena.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
    * [.getDeviceUrl(uuidOrId)](#balena.models.device.getDeviceUrl) ⇒ <code>Promise</code>
    * [.enableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
    * [.disableDeviceUrl(uuidOrIdOrArray)](#balena.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
    * [.enableLocalMode(uuidOrId)](#balena.models.device.enableLocalMode) ⇒ <code>Promise</code>
    * [.disableLocalMode(uuidOrId)](#balena.models.device.disableLocalMode) ⇒ <code>Promise</code>
    * [.isInLocalMode(uuidOrId)](#balena.models.device.isInLocalMode) ⇒ <code>Promise</code>
    * [.getLocalModeSupport(device)](#balena.models.device.getLocalModeSupport) ⇒ <code>Object</code>
    * [.enableLockOverride(uuidOrId)](#balena.models.device.enableLockOverride) ⇒ <code>Promise</code>
    * [.disableLockOverride(uuidOrId)](#balena.models.device.disableLockOverride) ⇒ <code>Promise</code>
    * [.hasLockOverride(uuidOrId)](#balena.models.device.hasLockOverride) ⇒ <code>Promise</code>
    * [.getStatus(uuidOrId)](#balena.models.device.getStatus) ⇒ <code>Promise</code>
    * [.getProgress(uuidOrId)](#balena.models.device.getProgress) ⇒ <code>Promise</code>
    * [.grantSupportAccess(uuidOrIdOrArray, expiryTimestamp)](#balena.models.device.grantSupportAccess) ⇒ <code>Promise</code>
    * [.revokeSupportAccess(uuidOrIdOrArray)](#balena.models.device.revokeSupportAccess) ⇒ <code>Promise</code>
    * ~~[.lastOnline(device)](#balena.models.device.lastOnline) ⇒ <code>String</code>~~
    * [.getOsVersion(device)](#balena.models.device.getOsVersion) ⇒ <code>String</code>
    * [.isTrackingApplicationRelease(uuidOrId)](#balena.models.device.isTrackingApplicationRelease) ⇒ <code>Promise</code>
    * [.getTargetReleaseHash(uuidOrId)](#balena.models.device.getTargetReleaseHash) ⇒ <code>Promise</code>
    * [.pinToRelease(uuidOrIdOrArray, fullReleaseHashOrId)](#balena.models.device.pinToRelease) ⇒ <code>Promise</code>
    * [.trackApplicationRelease(uuidOrIdOrArray)](#balena.models.device.trackApplicationRelease) ⇒ <code>Promise</code>
    * [.setSupervisorRelease(uuidOrIdOrArray, supervisorVersionOrId)](#balena.models.device.setSupervisorRelease) ⇒ <code>Promise</code>
    * [.startOsUpdate(uuidOrUuids, targetOsVersion, [options])](#balena.models.device.startOsUpdate) ⇒ <code>Promise</code>
    * [.ping(uuidOrId)](#balena.models.device.ping) ⇒ <code>Promise</code>
    * [.identify(uuidOrId)](#balena.models.device.identify) ⇒ <code>Promise</code>
    * [.restartApplication(uuidOrId)](#balena.models.device.restartApplication) ⇒ <code>Promise</code>
    * [.reboot(uuidOrId, [options])](#balena.models.device.reboot) ⇒ <code>Promise</code>
    * [.shutdown(uuidOrId, [options])](#balena.models.device.shutdown) ⇒ <code>Promise</code>
    * [.purge(uuidOrId)](#balena.models.device.purge) ⇒ <code>Promise</code>
    * [.update(uuidOrId, [options])](#balena.models.device.update) ⇒ <code>Promise</code>
    * [.getSupervisorState(uuidOrId)](#balena.models.device.getSupervisorState) ⇒ <code>Promise</code>
    * [.startService(uuidOrId, imageId)](#balena.models.device.startService) ⇒ <code>Promise</code>
    * [.stopService(uuidOrId, imageId)](#balena.models.device.stopService) ⇒ <code>Promise</code>
    * [.restartService(uuidOrId, imageId)](#balena.models.device.restartService) ⇒ <code>Promise</code>

<a name="balena.models.device.tags"></a>

##### device.tags : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.tags](#balena.models.device.tags) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.tags.getAllByDevice) ⇒ <code>Promise</code>
    * [.set(uuidOrId, tagKey, value)](#balena.models.device.tags.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, tagKey)](#balena.models.device.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.device.tags.getAllByApplication"></a>

###### tags.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.device.tags)  
**Summary**: Get all device tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.device.configVar"></a>

##### device.configVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.configVar](#balena.models.device.configVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.configVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.configVar.getAllByApplication) ⇒ <code>Promise</code>
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
<a name="balena.models.device.configVar.getAllByApplication"></a>

###### configVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>configVar</code>](#balena.models.device.configVar)  
**Summary**: Get all device config variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device config variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.device.envVar"></a>

##### device.envVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.envVar](#balena.models.device.envVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.envVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.envVar.getAllByApplication) ⇒ <code>Promise</code>
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
<a name="balena.models.device.envVar.getAllByApplication"></a>

###### envVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>envVar</code>](#balena.models.device.envVar)  
**Summary**: Get all device environment variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.device.serviceVar"></a>

##### device.serviceVar : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.serviceVar](#balena.models.device.serviceVar) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.serviceVar.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.serviceVar.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.get) ⇒ <code>Promise</code>
    * [.set(uuidOrId, serviceNameOrId, key, value)](#balena.models.device.serviceVar.set) ⇒ <code>Promise</code>
    * [.remove(uuidOrId, serviceNameOrId, key)](#balena.models.device.serviceVar.remove) ⇒ <code>Promise</code>

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
<a name="balena.models.device.serviceVar.getAllByApplication"></a>

###### serviceVar.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get all device service variable overrides by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.device.serviceVar.get"></a>

###### serviceVar.get(uuidOrId, serviceNameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Get the overriden value of a service variable on a device  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| serviceNameOrId | <code>String</code> \| <code>Number</code> | service name (string) or id (number) |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.device.serviceVar.get('7cf02a6', 123, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get('7cf02a6', 'myservice', 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.device.serviceVar.get(999999, 123, 'VAR').then(function(value) {
	console.log(value);
});
```
<a name="balena.models.device.serviceVar.set"></a>

###### serviceVar.set(uuidOrId, serviceNameOrId, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Set the overriden value of a service variable on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| serviceNameOrId | <code>String</code> \| <code>Number</code> | service name (string) or id (number) |
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
balena.models.device.serviceVar.set('7cf02a6', 'myservice', 'VAR', 'override').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.set(999999, 123, 'VAR', 'override').then(function() {
	...
});
```
<a name="balena.models.device.serviceVar.remove"></a>

###### serviceVar.remove(uuidOrId, serviceNameOrId, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>serviceVar</code>](#balena.models.device.serviceVar)  
**Summary**: Clear the overridden value of a service variable on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| serviceNameOrId | <code>String</code> \| <code>Number</code> | service name (string) or id (number) |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a6', 123, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove('7cf02a6', 'myservice', 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.serviceVar.remove(999999, 123, 'VAR').then(function() {
	...
});
```
<a name="balena.models.device.history"></a>

##### device.history : <code>object</code>
**Kind**: static namespace of [<code>device</code>](#balena.models.device)  

* [.history](#balena.models.device.history) : <code>object</code>
    * [.getAllByDevice(uuidOrId, [options])](#balena.models.device.history.getAllByDevice) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.device.history.getAllByApplication) ⇒ <code>Promise</code>

<a name="balena.models.device.history.getAllByDevice"></a>

###### history.getAllByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>history</code>](#balena.models.device.history)  
**Summary**: Get all history entries for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device history  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (32 / 62 digits string) or id (number) |
| [dateFilter.fromDate] | <code>Date</code> | <code>subDays(new Date(), 7)</code> | history entries older or equal to this date - default now() - 7 days |
| [dateFilter.toDate] | <code>Date</code> |  | history entries younger or equal to this date |
| [options] | <code>Object</code> |  | extra pine options to use |

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
<a name="balena.models.device.history.getAllByApplication"></a>

###### history.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>history</code>](#balena.models.device.history)  
**Summary**: Get all device history entries by application with time frame  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device history  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [dateFilter.fromDate] | <code>Date</code> | <code>subDays(new Date(), 7)</code> | history entries older or equal to this date - default now() - 7 days |
| [dateFilter.toDate] | <code>Date</code> |  | history entries younger or equal to this date |
| [options] | <code>Object</code> |  | extra pine options to use |

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
<a name="balena.models.device.getAllByApplication"></a>

##### device.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
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

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.device.getAllByOrganization"></a>

##### device.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
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

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string) or id (number). |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.device.get"></a>

##### device.get(uuidOrId, [options]) ⇒ <code>Promise</code>
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
balena.models.device.get('7cf02a6', { $select: ['overall_status', 'overall_progress'] }).then(function(device) {
	console.log(device);
})
```
<a name="balena.models.device.getWithServiceDetails"></a>

##### device.getWithServiceDetails(uuidOrId, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want more control, or to see the raw model
directly, use `device.get(uuidOrId, options)` instead.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get a single device along with its associated services' details,
including their associated commit  
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
<a name="balena.models.device.getMACAddresses"></a>

##### device.getMACAddresses(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the MAC addresses of a device  
**Access**: public  
**Fulfil**: <code>String[]</code> - mac addresses  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getMACAddresses('7cf02a6').then(function(macAddresses) {
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
<a name="balena.models.device.getMetrics"></a>

##### device.getMetrics(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the metrics related information for a device  
**Access**: public  
**Fulfil**: <code>Object</code> - device metrics  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getMetrics('7cf02a6').then(function(deviceMetrics) {
	console.log(deviceMetrics);
});
```
**Example**  
```js
balena.models.device.getMetrics(123).then(function(deviceMetrics) {
	console.log(deviceMetrics);
});
```
<a name="balena.models.device.remove"></a>

##### device.remove(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Remove device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.remove('7cf02a6');
```
**Example**  
```js
balena.models.device.remove(123);
```
<a name="balena.models.device.deactivate"></a>

##### device.deactivate(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Deactivate device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.deactivate('7cf02a6');
```
**Example**  
```js
balena.models.device.deactivate(123);
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
<a name="balena.models.device.setNote"></a>

##### device.setNote(uuidOrIdOrArray, note) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Note a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |
| note | <code>String</code> | the note |

**Example**  
```js
balena.models.device.setNote('7cf02a6', 'My useful note');
```
**Example**  
```js
balena.models.device.setNote(123, 'My useful note');
```
<a name="balena.models.device.setCustomLocation"></a>

##### device.setCustomLocation(uuidOrIdOrArray, location) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a custom location for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |
| location | <code>Object</code> | the location ({ latitude: 123, longitude: 456 }) |

**Example**  
```js
balena.models.device.setCustomLocation('7cf02a6', { latitude: 123, longitude: 456 });
```
**Example**  
```js
balena.models.device.setCustomLocation(123, { latitude: 123, longitude: 456 });
```
<a name="balena.models.device.unsetCustomLocation"></a>

##### device.unsetCustomLocation(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Clear the custom location of a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.unsetCustomLocation('7cf02a6');
```
**Example**  
```js
balena.models.device.unsetCustomLocation(123);
```
<a name="balena.models.device.move"></a>

##### device.move(uuidOrIdOrArray, applicationSlugOrUuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Move a device to another application  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |
| applicationSlugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |

**Example**  
```js
balena.models.device.move('7cf02a6', 'myorganization/myapp');
```
**Example**  
```js
balena.models.device.move(123, 'myorganization/myapp');
```
**Example**  
```js
balena.models.device.move(123, 456);
```
<a name="balena.models.device.getSupervisorTargetState"></a>

##### device.getSupervisorTargetState(uuidOrId, version) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the target supervisor state on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| version | <code>Number</code> | (optional) target state version (2 or 3), default to 2 |

**Example**  
```js
balena.models.device.getSupervisorTargetState('7cf02a6').then(function(state) {
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
<a name="balena.models.device.getSupervisorTargetStateForApp"></a>

##### device.getSupervisorTargetStateForApp(uuidOrId, release) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the target supervisor state on a "generic" device on a fleet  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | fleet uuid (string) or id (number) |
| release | <code>String</code> | (optional) release uuid (default tracked) |

**Example**  
```js
balena.models.device.getSupervisorTargetStateForApp('7cf02a6').then(function(state) {
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
balena.models.device.getSupervisorTargetStateForApp(123, '7cf02a6').then(function(state) {
	console.log(state);
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

##### device.register(applicationSlugOrUuidOrId, uuid, [deviceTypeSlug]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Register a new device with a Balena application.  
**Access**: public  
**Fulfil**: <code>Object</code> Device registration info ({ id: "...", uuid: "...", api_key: "..." })  

| Param | Type | Description |
| --- | --- | --- |
| applicationSlugOrUuidOrId | <code>String</code> \| <code>Number</code> | application slug (string), uuid (string) or id (number) |
| uuid | <code>String</code> | device uuid |
| [deviceTypeSlug] | <code>String</code> | device type slug (string) or alias (string) |

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
<a name="balena.models.device.generateDeviceKey"></a>

##### device.generateDeviceKey(uuidOrId, [keyName], [keyDescription]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Generate a device key  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |
| [keyName] | <code>String</code> | Device key name |
| [keyDescription] | <code>String</code> | Description for device key |

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
<a name="balena.models.device.enableDeviceUrl"></a>

##### device.enableDeviceUrl(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.enableDeviceUrl('7cf02a6');
```
**Example**  
```js
balena.models.device.enableDeviceUrl(123);
```
<a name="balena.models.device.disableDeviceUrl"></a>

##### device.disableDeviceUrl(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable device url for a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.disableDeviceUrl('7cf02a6');
```
**Example**  
```js
balena.models.device.disableDeviceUrl(123);
```
<a name="balena.models.device.enableLocalMode"></a>

##### device.enableLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable local mode  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.enableLocalMode('7cf02a6');
```
**Example**  
```js
balena.models.device.enableLocalMode(123);
```
<a name="balena.models.device.disableLocalMode"></a>

##### device.disableLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable local mode  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.disableLocalMode('7cf02a6');
```
**Example**  
```js
balena.models.device.disableLocalMode(123);
```
<a name="balena.models.device.isInLocalMode"></a>

##### device.isInLocalMode(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if local mode is enabled on the device  
**Access**: public  
**Fulfil**: <code>Boolean</code> - has device url  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.isInLocalMode('7cf02a6').then(function(isInLocalMode) {
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
<a name="balena.models.device.getLocalModeSupport"></a>

##### device.getLocalModeSupport(device) ⇒ <code>Object</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Returns whether local mode is supported along with a message describing the reason why local mode is not supported.  
**Returns**: <code>Object</code> - Local mode support info ({ supported: true/false, message: "..." })  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	balena.models.device.getLocalModeSupport(device);
})
```
<a name="balena.models.device.enableLockOverride"></a>

##### device.enableLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Enable lock override  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.enableLockOverride('7cf02a6');
```
**Example**  
```js
balena.models.device.enableLockOverride(123);
```
<a name="balena.models.device.disableLockOverride"></a>

##### device.disableLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Disable lock override  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.disableLockOverride('7cf02a6');
```
**Example**  
```js
balena.models.device.disableLockOverride(123);
```
<a name="balena.models.device.hasLockOverride"></a>

##### device.hasLockOverride(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Check if a device has the lock override enabled  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.hasLockOverride('7cf02a6');
```
**Example**  
```js
balena.models.device.hasLockOverride(123);
```
<a name="balena.models.device.getStatus"></a>

##### device.getStatus(uuidOrId) ⇒ <code>Promise</code>
Convenience method for getting the overall status of a device.
It's recommended to use `balena.models.device.get()` instead,
in case that you need to retrieve more device fields than just the status.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the status of a device  
**Access**: public  
**Fulfil**: <code>String</code> - device status  
**See**: [get](#balena.models.device.get) for an example on selecting the `overall_status` field.  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getStatus('7cf02a6').then(function(status) {
	console.log(status);
});
```
**Example**  
```js
balena.models.device.getStatus(123).then(function(status) {
	console.log(status);
});
```
<a name="balena.models.device.getProgress"></a>

##### device.getProgress(uuidOrId) ⇒ <code>Promise</code>
Convenience method for getting the overall progress of a device.
It's recommended to use `balena.models.device.get()` instead,
in case that you need to retrieve more device fields than just the progress.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the progress of a device  
**Access**: public  
**Fulfil**: <code>Number\|Null</code> - device progress  
**See**: [get](#balena.models.device.get) for an example on selecting the `overall_progress` field.  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getProgress('7cf02a6').then(function(progress) {
	console.log(progress);
});
```
**Example**  
```js
balena.models.device.getProgress(123).then(function(progress) {
	console.log(progress);
});
```
<a name="balena.models.device.grantSupportAccess"></a>

##### device.grantSupportAccess(uuidOrIdOrArray, expiryTimestamp) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Grant support access to a device until a specified time  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |
| expiryTimestamp | <code>Number</code> | a timestamp in ms for when the support access will expire |

**Example**  
```js
balena.models.device.grantSupportAccess('7cf02a6', Date.now() + 3600 * 1000);
```
**Example**  
```js
balena.models.device.grantSupportAccess(123, Date.now() + 3600 * 1000);
```
<a name="balena.models.device.revokeSupportAccess"></a>

##### device.revokeSupportAccess(uuidOrIdOrArray) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Revoke support access to a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.revokeSupportAccess('7cf02a6');
```
**Example**  
```js
balena.models.device.revokeSupportAccess(123);
```
<a name="balena.models.device.lastOnline"></a>

##### ~~device.lastOnline(device) ⇒ <code>String</code>~~
***Will be dropped in the next major***

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
<a name="balena.models.device.getOsVersion"></a>

##### device.getOsVersion(device) ⇒ <code>String</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the OS version (version number and variant combined) running on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| device | <code>Object</code> | A device object |

**Example**  
```js
balena.models.device.get('7cf02a6').then(function(device) {
	console.log(device.os_version); // => 'balenaOS 2.26.0+rev1'
	console.log(device.os_variant); // => 'prod'
	balena.models.device.getOsVersion(device); // => '2.26.0+rev1.prod'
})
```
<a name="balena.models.device.isTrackingApplicationRelease"></a>

##### device.isTrackingApplicationRelease(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get whether the device is configured to track the current application release  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is tracking the current application release  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.isTrackingApplicationRelease('7cf02a6').then(function(isEnabled) {
	console.log(isEnabled);
});
```
<a name="balena.models.device.getTargetReleaseHash"></a>

##### device.getTargetReleaseHash(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the hash of the currently tracked release for a specific device  
**Access**: public  
**Fulfil**: <code>String</code> - The release hash of the currently tracked release  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getTargetReleaseHash('7cf02a6').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.device.getTargetReleaseHash('7cf02a6', function(release) {
	console.log(release);
});
```
<a name="balena.models.device.pinToRelease"></a>

##### device.pinToRelease(uuidOrIdOrArray, fullReleaseHashOrId) ⇒ <code>Promise</code>
Configures the device to run a particular release
and not get updated when the current application release changes.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a specific device to run a particular release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |
| fullReleaseHashOrId | <code>String</code> \| <code>Number</code> | the hash of a successful release (string) or id (number) |

**Example**  
```js
balena.models.device.pinToRelease('7cf02a6', 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.pinToRelease(123, 'f7caf4ff80114deeaefb7ab4447ad9c661c50847').then(function() {
	...
});
```
<a name="balena.models.device.trackApplicationRelease"></a>

##### device.trackApplicationRelease(uuidOrIdOrArray) ⇒ <code>Promise</code>
The device's current release will be updated with each new successfully built release.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Configure a specific device to track the current application release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |

**Example**  
```js
balena.models.device.trackApplicationRelease('7cf02a6').then(function() {
	...
});
```
<a name="balena.models.device.setSupervisorRelease"></a>

##### device.setSupervisorRelease(uuidOrIdOrArray, supervisorVersionOrId) ⇒ <code>Promise</code>
Configures the device to run a particular supervisor release.

**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Set a specific device to run a particular supervisor release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrIdOrArray | <code>String</code> \| <code>Array.&lt;String&gt;</code> \| <code>Number</code> \| <code>Array.&lt;Number&gt;</code> | device uuid (string) or id (number) or array of full uuids or ids |
| supervisorVersionOrId | <code>String</code> \| <code>Number</code> | the raw version of a supervisor release (string) or id (number) |

**Example**  
```js
balena.models.device.setSupervisorRelease('7cf02a6', '10.8.0').then(function() {
	...
});
```
**Example**  
```js
balena.models.device.setSupervisorRelease(123, '11.4.14').then(function() {
	...
});
```
<a name="balena.models.device.startOsUpdate"></a>

##### device.startOsUpdate(uuidOrUuids, targetOsVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Start an OS update on a device  
**Access**: public  
**Fulfil**: <code>Object</code> - action response  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrUuids | <code>String</code> \| <code>Array.&lt;String&gt;</code> | full device uuid or array of full uuids |
| targetOsVersion | <code>String</code> | semver-compatible version for the target device Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number, a "prod" variant and greater than the one running on the device. To resolve the semver-compatible range use `balena.model.os.getMaxSatisfyingVersion`. |
| [options] | <code>Object</code> | options |
| [options.runDetached] | <code>Boolean</code> | run the update in detached mode. True by default |

**Example**  
```js
balena.models.device.startOsUpdate('7cf02a687b74206f92cb455969cf8e98', '2.29.2+rev1.prod').then(function(status) {
	console.log(result.status);
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
<a name="balena.models.device.getSupervisorState"></a>

##### device.getSupervisorState(uuidOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>device</code>](#balena.models.device)  
**Summary**: Get the supervisor state on a device  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> | device uuid (string) or id (number) |

**Example**  
```js
balena.models.device.getSupervisorState('7cf02a6').then(function(state) {
	console.log(state);
});
```
**Example**  
```js
balena.models.device.getSupervisorState(123).then(function(state) {
	console.log(state);
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
<a name="balena.models.deviceType"></a>

#### models.deviceType : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.deviceType](#balena.models.deviceType) : <code>object</code>
    * [.get(idOrSlug, [options])](#balena.models.deviceType.get) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.deviceType.getAll) ⇒ <code>Promise</code>
    * [.getAllSupported([options])](#balena.models.deviceType.getAllSupported) ⇒ <code>Promise</code>
    * [.getBySlugOrName(slugOrName)](#balena.models.deviceType.getBySlugOrName) ⇒ <code>Promise</code>
    * [.getName(deviceTypeSlug)](#balena.models.deviceType.getName) ⇒ <code>Promise</code>
    * [.getSlugByName(deviceTypeName)](#balena.models.deviceType.getSlugByName) ⇒ <code>Promise</code>
    * [.getInterpolatedPartials(deviceTypeSlug)](#balena.models.deviceType.getInterpolatedPartials) ⇒ <code>Promise</code>
    * [.getInstructions(deviceTypeSlugOrContract)](#balena.models.deviceType.getInstructions) ⇒ <code>Promise</code>
    * [.getInstallMethod(deviceTypeSlug)](#balena.models.deviceType.getInstallMethod) ⇒ <code>Promise</code>

<a name="balena.models.deviceType.get"></a>

##### deviceType.get(idOrSlug, [options]) ⇒ <code>Promise</code>
This method returns a single device type.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a single deviceType  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| idOrSlug | <code>String</code> \| <code>Number</code> |  | device type slug (string) or alias (string) or id |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.deviceType.getAll"></a>

##### deviceType.getAll([options]) ⇒ <code>Promise</code>
This method returns all device types.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get all deviceTypes  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.deviceType.getAllSupported"></a>

##### deviceType.getAllSupported([options]) ⇒ <code>Promise</code>
This method returns all supported device types.

**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get all supported deviceTypes  
**Access**: public  
**Fulfil**: <code>Object[]</code> - device types  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

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
<a name="balena.models.deviceType.getBySlugOrName"></a>

##### deviceType.getBySlugOrName(slugOrName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a deviceType by slug or name  
**Access**: public  
**Fulfil**: <code>Object</code> - device type  

| Param | Type | Description |
| --- | --- | --- |
| slugOrName | <code>String</code> | deviceType slug |

**Example**  
```js
balena.models.deviceType.getBySlugOrName('raspberry-pi').then(function(deviceType) {
	console.log(deviceType);
});
```
<a name="balena.models.deviceType.getName"></a>

##### deviceType.getName(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get display name for a device  
**Access**: public  
**Fulfil**: <code>String</code> - device display name  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.deviceType.getName('raspberry-pi').then(function(deviceTypeName) {
	console.log(deviceTypeName);
	// Raspberry Pi
});
```
<a name="balena.models.deviceType.getSlugByName"></a>

##### deviceType.getSlugByName(deviceTypeName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get device slug  
**Access**: public  
**Fulfil**: <code>String</code> - device slug name  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeName | <code>String</code> | device type name |

**Example**  
```js
balena.models.deviceType.getSlugByName('Raspberry Pi').then(function(deviceTypeSlug) {
	console.log(deviceTypeSlug);
	// raspberry-pi
});
```
<a name="balena.models.deviceType.getInterpolatedPartials"></a>

##### deviceType.getInterpolatedPartials(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get a contract with resolved partial templates  
**Access**: public  
**Fulfil**: <code>Contract</code> - device type contract with resolved partials  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.deviceType.getInterpolatedPartials('raspberry-pi').then(function(contract) {
 for (const partial in contract.partials) {
 	console.log(`${partial}: ${contract.partials[partial]}`);
 }
	// bootDevice: ["Connect power to the Raspberry Pi (v1 / Zero / Zero W)"]
});
```
<a name="balena.models.deviceType.getInstructions"></a>

##### deviceType.getInstructions(deviceTypeSlugOrContract) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get instructions for installing a host OS on a given device type  
**Access**: public  
**Fulfil**: <code>Object \| String[]</code> - step by step instructions for installing the host OS to the device  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlugOrContract | <code>String</code> \| <code>Object</code> | device type slug or contract |

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
<a name="balena.models.deviceType.getInstallMethod"></a>

##### deviceType.getInstallMethod(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>deviceType</code>](#balena.models.deviceType)  
**Summary**: Get installation method on a given device type  
**Access**: public  
**Fulfil**: <code>String</code> - the installation method supported for the given device type slug  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
balena.models.deviceType.getInstallMethod('raspberry-pi').then(function(method) {
	console.log(method);
 // externalBoot
});
```
<a name="balena.models.apiKey"></a>

#### models.apiKey : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.apiKey](#balena.models.apiKey) : <code>object</code>
    * [.create(createApiKeyParams)](#balena.models.apiKey.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.apiKey.getAll) ⇒ <code>Promise</code>
    * [.getAllNamedUserApiKeys([options])](#balena.models.apiKey.getAllNamedUserApiKeys) ⇒ <code>Promise</code>
    * [.getProvisioningApiKeysByApplication(slugOrUuidOrId, [options])](#balena.models.apiKey.getProvisioningApiKeysByApplication) ⇒ <code>Promise</code>
    * [.getDeviceApiKeysByDevice(uuidOrId, [options])](#balena.models.apiKey.getDeviceApiKeysByDevice) ⇒ <code>Promise</code>
    * [.update(id, apiKeyInfo)](#balena.models.apiKey.update) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.apiKey.revoke) ⇒ <code>Promise</code>

<a name="balena.models.apiKey.create"></a>

##### apiKey.create(createApiKeyParams) ⇒ <code>Promise</code>
This method registers a new api key for the current user with the name given.

**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Creates a new user API key  
**Access**: public  
**Fulfil**: <code>String</code> - API key  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| createApiKeyParams | <code>Object</code> |  | an object containing the parameters for the creation of an API key |
| createApiKeyParams.name | <code>String</code> |  | the API key name |
| createApiKeyParams.expiryDate | <code>String</code> |  | the API key expiry date |
| [createApiKeyParams.description] | <code>String</code> | <code></code> | the API key description |

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
<a name="balena.models.apiKey.getAll"></a>

##### apiKey.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all accessible API keys  
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
<a name="balena.models.apiKey.getAllNamedUserApiKeys"></a>

##### apiKey.getAllNamedUserApiKeys([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all named user API keys of the current user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getAllNamedUserApiKeys().then(function(apiKeys) {
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.getProvisioningApiKeysByApplication"></a>

##### apiKey.getProvisioningApiKeysByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all provisioning API keys for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getProvisioningApiKeysByApplication('myorganization/myapp').then(function(apiKeys) {
	console.log(apiKeys);
});
```
<a name="balena.models.apiKey.getDeviceApiKeysByDevice"></a>

##### apiKey.getDeviceApiKeysByDevice(uuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>apiKey</code>](#balena.models.apiKey)  
**Summary**: Get all API keys for a device  
**Access**: public  
**Fulfil**: <code>Object[]</code> - apiKeys  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device, uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.apiKey.getDeviceApiKeysByDevice('7cf02a6').then(function(apiKeys) {
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
| apiKeyInfo | <code>Object</code> | an object with the updated name|description|expiryDate |

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
<a name="balena.models.key.get"></a>

##### key.get(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get a single ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | key id |

**Example**  
```js
balena.models.key.get(51).then(function(key) {
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
| id | <code>Number</code> | key id |

**Example**  
```js
balena.models.key.remove(51);
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
<a name="balena.models.organization"></a>

#### models.organization : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.organization](#balena.models.organization) : <code>object</code>
    * [.membership](#balena.models.organization.membership) : <code>object</code>
        * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
        * [.getAllByUser(usernameOrId, [options])](#balena.models.organization.membership.getAllByUser) ⇒ <code>Promise</code>
        * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>
    * [.invite](#balena.models.organization.invite) : <code>object</code>
        * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
        * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
        * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
    * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
    * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
    * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>

<a name="balena.models.organization.membership"></a>

##### organization.membership : <code>object</code>
**Kind**: static namespace of [<code>organization</code>](#balena.models.organization)  

* [.membership](#balena.models.organization.membership) : <code>object</code>
    * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
    * [.getAllByUser(usernameOrId, [options])](#balena.models.organization.membership.getAllByUser) ⇒ <code>Promise</code>
    * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>

<a name="balena.models.organization.membership.get"></a>

###### membership.get(membershipId, [options]) ⇒ <code>Promise</code>
This method returns a single organization membership.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get a single organization membership  
**Access**: public  
**Fulfil**: <code>Object</code> - organization membership  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| membershipId | <code>number</code> \| <code>Object</code> |  | the id or an object with the unique `user` & `is_member_of__organization` numeric pair of the membership |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.membership.get(5).then(function(memberships) {
	console.log(memberships);
});
```
<a name="balena.models.organization.membership.getAllByOrganization"></a>

###### membership.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all organization memberships for a specific organization.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get all memberships by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organization memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string) or id (number). |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.membership.getAllByOrganization('MyOrg').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAllByOrganization(123).then(function(memberships) {
	console.log(memberships);
});
```
<a name="balena.models.organization.membership.getAllByUser"></a>

###### membership.getAllByUser(usernameOrId, [options]) ⇒ <code>Promise</code>
This method returns all organization memberships for a specific user.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get all memberships by user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organization memberships  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| usernameOrId | <code>String</code> \| <code>Number</code> |  | the user's username (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.membership.getAllByUser('balena_os').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAllByUser(123).then(function(memberships) {
	console.log(memberships);
});
```
<a name="balena.models.organization.membership.changeRole"></a>

###### membership.changeRole(idOrUniqueKey, roleName) ⇒ <code>Promise</code>
This method changes the role of an organization member.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Changes the role of an organization member  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| idOrUniqueKey | <code>Number</code> \| <code>Object</code> | the id or an object with the unique `user` & `is_member_of__organization` numeric pair of the membership that will be changed |
| roleName | <code>String</code> | the role name to be granted to the membership |

**Example**  
```js
balena.models.organization.membership.changeRole(123, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.organization.membership.changeRole({
	user: 123,
	is_member_of__organization: 125,
}, "member").then(function() {
	console.log('OK');
});
```
<a name="balena.models.organization.membership.remove"></a>

###### membership.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Remove a membership  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | organization membership id |

**Example**  
```js
balena.models.organization.membership.remove(123);
```
**Example**  
```js
balena.models.organization.membership.remove({
	user: 123,
	is_member_of__application: 125,
});
```
<a name="balena.models.organization.invite"></a>

##### organization.invite : <code>object</code>
**Kind**: static namespace of [<code>organization</code>](#balena.models.organization)  

* [.invite](#balena.models.organization.invite) : <code>object</code>
    * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
    * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
    * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>

<a name="balena.models.organization.invite.getAll"></a>

###### invite.getAll([options]) ⇒ <code>Promise</code>
This method returns all invites.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Get all invites  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.invite.getAll().then(function(invites) {
	console.log(invites);
});
```
<a name="balena.models.organization.invite.getAllByOrganization"></a>

###### invite.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all invites for a specific organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Get all invites by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string), or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.invite.getAllByOrganization('MyOrg').then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.organization.invite.getAllByOrganization(123).then(function(invites) {
	console.log(invites);
});
```
<a name="balena.models.organization.invite.create"></a>

###### invite.create(handleOrId, options, [message]) ⇒ <code>Promise</code>
This method invites a user by their email to an organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Creates a new invite for an organization  
**Access**: public  
**Fulfil**: <code>String</code> - organization invite  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string), or id (number) |
| options | <code>Object</code> |  | invite creation parameters |
| options.invitee | <code>String</code> |  | the email of the invitee |
| [options.roleName] | <code>String</code> | <code>&quot;developer&quot;</code> | the role name to be granted to the invitee |
| [message] | <code>String</code> | <code></code> | the message to send along with the invite |

**Example**  
```js
balena.models.organization.invite.create('MyOrg', { invitee: "invitee@example.org", roleName: "developer", message: "join my org" }).then(function(invite) {
	console.log(invite);
});
```
<a name="balena.models.organization.invite.revoke"></a>

###### invite.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Revoke an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | organization invite id |

**Example**  
```js
balena.models.organization.invite.revoke(123);
```
<a name="balena.models.organization.invite.accept"></a>

###### invite.accept(invitationToken) ⇒ <code>Promise</code>
This method adds the calling user to the organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Accepts an invite  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| invitationToken | <code>String</code> | invite token |

**Example**  
```js
balena.models.organization.invite.accept("qwerty-invitation-token");
```
<a name="balena.models.organization.create"></a>

##### organization.create(options) ⇒ <code>Promise</code>
This method creates a new organization with the current user as an administrator.

**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Creates a new organization  
**Access**: public  
**Fulfil**: <code>String</code> - Organization  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Organization parameters to use. |
| options.name | <code>String</code> | Required: the name of the organization that will be created. |
| [options.handle] | <code>String</code> | The handle of the organization that will be created. |

**Example**  
```js
balena.models.organization.create({ name:'MyOrganization' }).then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.create({
  name:'MyOrganization',
  logo_image: new File(
    imageContent,
    'img.jpeg'
  );
})
.then(function(organization) {
  console.log(organization);
});
```
<a name="balena.models.organization.getAll"></a>

##### organization.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Get all Organizations  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organizations  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.getAll().then(function(organizations) {
	console.log(organizations);
});
```
<a name="balena.models.organization.get"></a>

##### organization.get(handleOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Get a single organization  
**Access**: public  
**Fulfil**: <code>Object</code> - organization  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> |  | organization handle (string) or id (number). |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.organization.get('myorganization').then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.get(123).then(function(organization) {
	console.log(organization);
});
```
<a name="balena.models.organization.remove"></a>

##### organization.remove(handleOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Remove an Organization  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| handleOrId | <code>String</code> \| <code>Number</code> | organization handle (string) or id (number). |

**Example**  
```js
balena.models.organization.remove(123);
```
<a name="balena.models.team"></a>

#### models.team : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.team](#balena.models.team) : <code>object</code>
    * [.applicationAccess](#balena.models.team.applicationAccess) : <code>object</code>
        * [.getAllByTeam(teamId, [options])](#balena.models.team.applicationAccess.getAllByTeam) ⇒ <code>Promise</code>
        * [.get(teamApplicationAccessId, [options])](#balena.models.team.applicationAccess.get) ⇒ <code>Promise</code>
        * [.update(teamApplicationAccessId, roleName)](#balena.models.team.applicationAccess.update) ⇒ <code>Promise</code>
        * [.remove(teamApplicationAccessId)](#balena.models.team.applicationAccess.remove) ⇒ <code>Promise</code>
    * [.create(organizationSlugOrId, name)](#balena.models.team.create) ⇒ <code>Promise</code>
    * [.getAllByOrganization(organizationSlugOrId, [options])](#balena.models.team.getAllByOrganization) ⇒ <code>Promise</code>
    * [.get(teamId, [options])](#balena.models.team.get) ⇒ <code>Promise</code>
    * [.rename(teamId, newName)](#balena.models.team.rename) ⇒ <code>Promise</code>
    * [.remove(teamId)](#balena.models.team.remove) ⇒ <code>Promise</code>

<a name="balena.models.team.applicationAccess"></a>

##### team.applicationAccess : <code>object</code>
**Kind**: static namespace of [<code>team</code>](#balena.models.team)  

* [.applicationAccess](#balena.models.team.applicationAccess) : <code>object</code>
    * [.getAllByTeam(teamId, [options])](#balena.models.team.applicationAccess.getAllByTeam) ⇒ <code>Promise</code>
    * [.get(teamApplicationAccessId, [options])](#balena.models.team.applicationAccess.get) ⇒ <code>Promise</code>
    * [.update(teamApplicationAccessId, roleName)](#balena.models.team.applicationAccess.update) ⇒ <code>Promise</code>
    * [.remove(teamApplicationAccessId)](#balena.models.team.applicationAccess.remove) ⇒ <code>Promise</code>

<a name="balena.models.team.applicationAccess.getAllByTeam"></a>

###### applicationAccess.getAllByTeam(teamId, [options]) ⇒ <code>Promise</code>
This method get all team application access.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Get all team applications access  
**Access**: public  
**Fulfil**: <code>Object[]</code> - team application access  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| teamId | <code>Number</code> |  | Required: the team id. |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.team.applicationAccess.getAllByTeam(1239948).then(function(teamApplicationAccesses) {
	console.log(teamApplicationAccesses);
});
```
<a name="balena.models.team.applicationAccess.get"></a>

###### applicationAccess.get(teamApplicationAccessId, [options]) ⇒ <code>Promise</code>
This method get specific team application access.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Get team applications access  
**Access**: public  
**Fulfil**: <code>Object</code> - TeamApplicationAccess  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| teamApplicationAccessId | <code>Number</code> |  | Required: the team application access id. |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.team.applicationAccess.get(1239948).then(function(teamApplicationAccess) {
	console.log(teamApplicationAccess);
});
```
<a name="balena.models.team.applicationAccess.update"></a>

###### applicationAccess.update(teamApplicationAccessId, roleName) ⇒ <code>Promise</code>
This method update a team application access role.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Update team application access  
**Access**: public  
**Fulfil**: <code>Object</code> - TeamApplicationAccess  

| Param | Type | Description |
| --- | --- | --- |
| teamApplicationAccessId | <code>Number</code> | Required: the team application access id. |
| roleName | <code>String</code> | Required: The new role to assing (ApplicationMembershipRoles). |

**Example**  
```js
balena.models.team.update(123, 'developer').then(function(teamApplicationAccess) {
	console.log(teamApplicationAccess);
});
```
<a name="balena.models.team.applicationAccess.remove"></a>

###### applicationAccess.remove(teamApplicationAccessId) ⇒ <code>Promise</code>
This remove a team application access.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Remove team application access  
**Access**: public  
**Fulfil**: <code>void</code>  

| Param | Type | Description |
| --- | --- | --- |
| teamApplicationAccessId | <code>Number</code> | Required: the team application access id. |

**Example**  
```js
balena.models.team.remove(123).then(function(teams) {
	console.log(teams);
});
```
<a name="balena.models.team.create"></a>

##### team.create(organizationSlugOrId, name) ⇒ <code>Promise</code>
This method creates a new team.

**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Creates a new Team  
**Access**: public  
**Fulfil**: <code>Object</code> - Team  

| Param | Type | Description |
| --- | --- | --- |
| organizationSlugOrId | <code>Number</code> | Required: the organization slug or id the team will be part of. |
| name | <code>String</code> | Required: the name of the team that will be created. |

**Example**  
```js
balena.models.team.create(1239948, 'MyTeam').then(function(team) {
	console.log(team);
});
```
**Example**  
```js
balena.models.team.create('myOrgHandle', 'MyTeam')
.then(function(team) {
  console.log(team);
});
```
<a name="balena.models.team.getAllByOrganization"></a>

##### team.getAllByOrganization(organizationSlugOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Get all Teams of a specific Organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - Teams  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| organizationSlugOrId | <code>Number</code> |  | Required: the organization slug or id the team is part of. |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.team.getAllByOrganization(123).then(function(teams) {
	console.log(teams);
});
```
**Example**  
```js
balena.models.team.getAllByOrganization('MyOrganizationHandle').then(function(teams) {
	console.log(teams);
});
```
<a name="balena.models.team.get"></a>

##### team.get(teamId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Get a single Team  
**Access**: public  
**Fulfil**: <code>Object</code> - Team  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| teamId | <code>Number</code> |  | team id (number). |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.team.get(123).then(function(team) {
	console.log(team);
});
```
<a name="balena.models.team.rename"></a>

##### team.rename(teamId, newName) ⇒ <code>Promise</code>
**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Rename Team  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| teamId | <code>Number</code> | team id (number) |
| newName | <code>String</code> | new team name (string) |

**Example**  
```js
balena.models.team.rename(123, 'MyNewTeamName');
```
<a name="balena.models.team.remove"></a>

##### team.remove(teamId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Remove a Team  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| teamId | <code>Number</code> | team id (number). |

**Example**  
```js
balena.models.team.remove(123);
```
<a name="balena.models.os"></a>

#### models.os : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.os](#balena.models.os) : <code>object</code>
    * [.getAvailableOsVersions(deviceTypes, [options])](#balena.models.os.getAvailableOsVersions) ⇒ <code>Promise</code>
    * [.getAllOsVersions(deviceTypes, [options])](#balena.models.os.getAllOsVersions) ⇒ <code>Promise</code>
    * [.getDownloadSize(deviceType, [version])](#balena.models.os.getDownloadSize) ⇒ <code>Promise</code>
    * [.getMaxSatisfyingVersion(deviceType, versionOrRange, [osType])](#balena.models.os.getMaxSatisfyingVersion) ⇒ <code>Promise</code>
    * [.download(options)](#balena.models.os.download) ⇒ <code>Promise</code>
    * [.getConfig(slugOrUuidOrId, options)](#balena.models.os.getConfig) ⇒ <code>Promise</code>
    * [.isSupportedOsUpdate(deviceType, currentVersion, targetVersion)](#balena.models.os.isSupportedOsUpdate) ⇒ <code>Promise</code>
    * [.getOsUpdateType(deviceType, currentVersion, targetVersion)](#balena.models.os.getOsUpdateType) ⇒ <code>Promise</code>
    * [.getSupportedOsUpdateVersions(deviceType, currentVersion, [options])](#balena.models.os.getSupportedOsUpdateVersions) ⇒ <code>Promise</code>
    * [.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture)](#balena.models.os.isArchitectureCompatibleWith) ⇒ <code>Boolean</code>
    * [.getSupervisorReleasesForCpuArchitecture(cpuArchitectureSlugOrId, [options])](#balena.models.os.getSupervisorReleasesForCpuArchitecture) ⇒ <code>Promise.&lt;String&gt;</code>

<a name="balena.models.os.getAvailableOsVersions"></a>

##### os.getAvailableOsVersions(deviceTypes, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the supported OS versions for the provided device type(s)  
**Access**: public  
**Fulfil**: <code>Object[]\|Object</code> - An array of OsVersion objects when a single device type slug is provided,
or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| deviceTypes | <code>String</code> \| <code>Array.&lt;String&gt;</code> |  | device type slug or array of slugs |
| [options] | <code>Object</code> |  | Extra pine options & draft filter to use |
| [options.includeDraft] | <code>Boolean</code> | <code>false</code> | Whether pre-releases should be included in the results |

**Example**  
```js
balena.models.os.getAvailableOsVersions('raspberrypi3');
```
**Example**  
```js
balena.models.os.getAvailableOsVersions(['fincm3', 'raspberrypi3']);
```
<a name="balena.models.os.getAllOsVersions"></a>

##### os.getAllOsVersions(deviceTypes, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get all OS versions for the provided device type(s), inlcuding invalidated ones  
**Access**: public  
**Fulfil**: <code>Object[]\|Object</code> - An array of OsVersion objects when a single device type slug is provided,
or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| deviceTypes | <code>String</code> \| <code>Array.&lt;String&gt;</code> |  | device type slug or array of slugs |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.os.getAllOsVersions('raspberrypi3');
```
**Example**  
```js
balena.models.os.getAllOsVersions(['fincm3', 'raspberrypi3']);
```
**Example**  
```js
balena.models.os.getAllOsVersions(['fincm3', 'raspberrypi3'], { $filter: { is_invalidated: false } });
```
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
```
<a name="balena.models.os.getMaxSatisfyingVersion"></a>

##### os.getMaxSatisfyingVersion(deviceType, versionOrRange, [osType]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the max OS version satisfying the given range  
**Access**: public  
**Fulfil**: <code>String\|null</code> - the version number, or `null` if no matching versions are found  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| versionOrRange | <code>String</code> | can be one of * the exact version number, in which case it is returned if the version is supported, or `null` is returned otherwise, * a [semver](https://www.npmjs.com/package/semver)-compatible range specification, in which case the most recent satisfying version is returned if it exists, or `null` is returned, * `'latest'/'default'` in which case the most recent version is returned, excluding pre-releases, Defaults to `'latest'`. |
| [osType] | <code>String</code> | can be one of 'default', 'esr' or null to include all types |

**Example**  
```js
balena.models.os.getMaxSatisfyingVersion('raspberry-pi', '^2.11.0').then(function(version) {
	console.log(version);
});
```
<a name="balena.models.os.download"></a>

##### os.download(options) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Download an OS image  
**Access**: public  
**Fulfil**: <code>ReadableStream</code> - download stream  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | OS image options to use. |
| options.deviceType | <code>String</code> |  | device type slug |
| [options.version] | <code>String</code> | <code>&#x27;latest&#x27;</code> | semver-compatible version or 'latest', defaults to 'latest' Unsupported (unpublished) version will result in rejection. The version **must** be the exact version number. |
| [options.developmentMode] | <code>Boolean</code> |  | controls development mode for unified balenaOS releases. |
| [options.appId] | <code>Number</code> |  | the application ID (number). |
| [options.fileType] | <code>String</code> |  | download file type. One of '.img' or '.zip' or '.gz'. |
| [options.imageType] | <code>String</code> |  | download file type. One of 'raw' or 'flasher' |
| [options.appUpdatePollInterval] | <code>Number</code> |  | how often the OS checks for updates, in minutes. |
| [options.network] | <code>String</code> |  | the network type that the device will use, one of 'ethernet' or 'wifi'. |
| [options.wifiKey] | <code>String</code> |  | the key for the wifi network the device will connect to if network is wifi. |
| [options.wifiSsid] | <code>String</code> |  | the ssid for the wifi network the device will connect to if network is wifi. |

**Example**  
```js
balena.models.os.download({deviceType: 'raspberry-pi'}).then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});
```
<a name="balena.models.os.getConfig"></a>

##### os.getConfig(slugOrUuidOrId, options) ⇒ <code>Promise</code>
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
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number). |
| options | <code>Object</code> |  | OS configuration options to use. |
| options.version | <code>String</code> |  | Required: the OS version of the image. |
| [options.network] | <code>String</code> | <code>&#x27;ethernet&#x27;</code> | The network type that the device will use, one of 'ethernet' or 'wifi'. |
| [options.appUpdatePollInterval] | <code>Number</code> |  | How often the OS checks for updates, in minutes. |
| [options.provisioningKeyName] | <code>String</code> |  | Name assigned to API key |
| [options.provisioningKeyExpiryDate] | <code>String</code> |  | Expiry Date assigned to API key |
| [options.developmentMode] | <code>Boolean</code> |  | Controls development mode for unified balenaOS releases. |
| [options.wifiKey] | <code>String</code> |  | The key for the wifi network the device will connect to. |
| [options.wifiSsid] | <code>String</code> |  | The ssid for the wifi network the device will connect to. |
| [options.ip] | <code>String</code> |  | static ip address. |
| [options.gateway] | <code>String</code> |  | static ip gateway. |
| [options.netmask] | <code>String</code> |  | static ip netmask. |

**Example**  
```js
balena.models.os.getConfig('myorganization/myapp', { version: '2.12.7+rev1.prod' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

balena.models.os.getConfig(123, { version: '2.12.7+rev1.prod' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});
```
<a name="balena.models.os.isSupportedOsUpdate"></a>

##### os.isSupportedOsUpdate(deviceType, currentVersion, targetVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns whether the provided device type supports OS updates between the provided balenaOS versions  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether upgrading the OS to the target version is supported  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| currentVersion | <code>String</code> | semver-compatible version for the starting OS version |
| targetVersion | <code>String</code> | semver-compatible version for the target OS version |

**Example**  
```js
balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(isSupported) {
	console.log(isSupported);
});
```
<a name="balena.models.os.getOsUpdateType"></a>

##### os.getOsUpdateType(deviceType, currentVersion, targetVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the OS update type based on device type, current and target balenaOS versions  
**Access**: public  
**Fulfil**: <code>String</code> - Currently available types are:
  - resinhup11
  - resinhup12
  - balenahup
	 - takeover

 Throws error in any of these cases:
  - Current or target versions are invalid
  - Current or target versions do not match in dev/prod type
  - Current and target versions imply a downgrade operation
  - Action is not supported by device type  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |
| currentVersion | <code>String</code> | semver-compatible version for the starting OS version |
| targetVersion | <code>String</code> | semver-compatible version for the target OS version |

**Example**  
```js
balena.models.os.getOsUpdateType('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(osUpdateType) {
	console.log(osUpdateType);
});
```
<a name="balena.models.os.getSupportedOsUpdateVersions"></a>

##### os.getSupportedOsUpdateVersions(deviceType, currentVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the supported OS update targets for the provided device type  
**Access**: public  
**Fulfil**: <code>Object[]\|Object</code> - An array of OsVersion objects when a single device type slug is provided,
or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.  
**Fulfil**: <code>Object</code> - the versions information, of the following structure:
* versions - an array of strings,
containing exact version numbers that OS update is supported
* recommended - the recommended version, i.e. the most recent version
that is _not_ pre-release, can be `null`
* current - the provided current version after normalization  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| deviceType | <code>String</code> |  | device type slug |
| currentVersion | <code>String</code> |  | semver-compatible version for the starting OS version |
| [options] | <code>Object</code> |  | Extra options to filter the OS releases by |
| [options.includeDraft] | <code>Boolean</code> | <code>false</code> | Whether pre-releases should be included in the results |
| [options.osType] | <code>Boolean</code> \| <code>Null</code> | <code>&#x27;default&#x27;</code> | Can be one of 'default', 'esr' or null to include all types |

**Example**  
```js
balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod').then(function(isSupported) {
	console.log(isSupported);
});
```
<a name="balena.models.os.isArchitectureCompatibleWith"></a>

##### os.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture) ⇒ <code>Boolean</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns whether the specified OS architecture is compatible with the target architecture  
**Returns**: <code>Boolean</code> - - Whether the specified OS architecture is capable of running
applications build for the target architecture  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| osArchitecture | <code>String</code> | The OS's architecture as specified in its device type |
| applicationArchitecture | <code>String</code> | The application's architecture as specified in its device type |

**Example**  
```js
const result1 = balena.models.os.isArchitectureCompatibleWith('aarch64', 'armv7hf');
console.log(result1);

const result2 = balena.models.os.isArchitectureCompatibleWith('armv7hf', 'amd64');
console.log(result2);
```
<a name="balena.models.os.getSupervisorReleasesForCpuArchitecture"></a>

##### os.getSupervisorReleasesForCpuArchitecture(cpuArchitectureSlugOrId, [options]) ⇒ <code>Promise.&lt;String&gt;</code>
**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the Releases of the supervisor for the CPU Architecture  
**Returns**: <code>Promise.&lt;String&gt;</code> - - An array of Release objects that can be used to manage a device as supervisors.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cpuArchitectureSlugOrId | <code>String</code> \| <code>Number</code> |  | The slug (string) or id (number) for the CPU Architecture |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
const results = balena.models.os.getSupervisorReleasesForCpuArchitecture('aarch64');

const [result] = balena.models.os.getSupervisorReleasesForCpuArchitecture(
	'aarch64',
	{ $filter: { raw_version: '12.11.0' } },
);

const [result] = balena.models.os.getSupervisorReleasesForCpuArchitecture(
	'aarch64',
	{
			$select: ['id', 'raw_version', 'known_issue_list', 'created_at', 'contract'],
			$expand: {
				release_image: {
					$select: 'id',
					$expand: {
						image: {
							$select: 'is_stored_at__image_location',
						},
					},
				},
			},
		$filter: { raw_version: '12.11.0' }
	},
);
```
<a name="balena.models.config"></a>

#### models.config : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.config](#balena.models.config) : <code>object</code>
    * [.getAll()](#balena.models.config.getAll) ⇒ <code>Promise</code>
    * ~~[.getDeviceTypes()](#balena.models.config.getDeviceTypes) ⇒ <code>Promise</code>~~
    * ~~[.getDeviceTypeManifestBySlug(slugOrName)](#balena.models.config.getDeviceTypeManifestBySlug) ⇒ <code>Promise</code>~~
    * [.getDeviceOptions(deviceType)](#balena.models.config.getDeviceOptions) ⇒ <code>Promise</code>
    * [.getConfigVarSchema(deviceType)](#balena.models.config.getConfigVarSchema) ⇒ <code>Promise</code>

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
<a name="balena.models.config.getDeviceTypes"></a>

##### ~~config.getDeviceTypes() ⇒ <code>Promise</code>~~
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
<a name="balena.models.config.getDeviceTypeManifestBySlug"></a>

##### ~~config.getDeviceTypeManifestBySlug(slugOrName) ⇒ <code>Promise</code>~~
***use balena.models.deviceType.getBySlugOrName***

**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get a device type manifest by slug  
**Access**: public  
**Fulfil**: <code>Object</code> - device type manifest  

| Param | Type | Description |
| --- | --- | --- |
| slugOrName | <code>String</code> | device type slug |

**Example**  
```js
balena.models.config.getDeviceTypeManifestBySlug('raspberry-pi').then(function(manifest) {
	console.log(manifest);
});
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
<a name="balena.models.config.getConfigVarSchema"></a>

##### config.getConfigVarSchema(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of [<code>config</code>](#balena.models.config)  
**Summary**: Get configuration variables schema for a device type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - configuration options  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
balena.models.config.getConfigVarSchema('raspberry-pi').then(function(options) {
	console.log(options);
});
```
<a name="balena.models.release"></a>

#### models.release : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.release](#balena.models.release) : <code>object</code>
    * [.tags](#balena.models.release.tags) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
        * [.set(commitOrIdOrRawVersion, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
        * [.remove(commitOrIdOrRawVersion, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
    * [.asset](#balena.models.release.asset) : <code>object</code>
        * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.asset.getAllByRelease) ⇒ <code>Promise</code>
        * [.get(id, [options])](#balena.models.release.asset.get) ⇒ <code>Promise</code>
        * [.download(id)](#balena.models.release.asset.download) ⇒ <code>Promise</code>
        * [.upload(uploadParams, [options])](#balena.models.release.asset.upload) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.release.asset.remove) ⇒ <code>Promise</code>
    * [.get(commitOrIdOrRawVersion, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
    * [.getWithImageDetails(commitOrIdOrRawVersion, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
    * [.getLatestByApplication(slugOrUuidOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
    * [.createFromUrl(slugOrUuidOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>
    * [.finalize(commitOrIdOrRawVersion)](#balena.models.release.finalize) ⇒ <code>Promise</code>
    * [.setIsInvalidated(commitOrIdOrRawVersion, isInvalidated)](#balena.models.release.setIsInvalidated) ⇒ <code>Promise</code>
    * [.setNote(commitOrIdOrRawVersion, noteOrNull)](#balena.models.release.setNote) ⇒ <code>Promise</code>
    * [.setKnownIssueList(commitOrIdOrRawVersion, knownIssueListOrNull)](#balena.models.release.setKnownIssueList) ⇒ <code>Promise</code>

<a name="balena.models.release.tags"></a>

##### release.tags : <code>object</code>
**Kind**: static namespace of [<code>release</code>](#balena.models.release)  

* [.tags](#balena.models.release.tags) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
    * [.set(commitOrIdOrRawVersion, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>
    * [.remove(commitOrIdOrRawVersion, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>

<a name="balena.models.release.tags.getAllByApplication"></a>

###### tags.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```
<a name="balena.models.release.tags.getAllByRelease"></a>

###### tags.getAllByRelease(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for a release  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> |  | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.tags.getAllByRelease(123).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease('7cf02a6').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease({application: 456, rawVersion: '0.0.0'}).then(function(tags) {
	console.log(tags);
});
```
<a name="balena.models.release.tags.set"></a>

###### tags.set(commitOrIdOrRawVersion, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Set a release tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| tagKey | <code>String</code> | tag key |
| value | <code>String</code> \| <code>undefined</code> | tag value |

**Example**  
```js
balena.models.release.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set('7cf02a6', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set({application: 456, rawVersion: '0.0.0'}, 'EDITOR', 'vim');
```
<a name="balena.models.release.tags.remove"></a>

###### tags.remove(commitOrIdOrRawVersion, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Remove a release tag  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| tagKey | <code>String</code> | tag key |

**Example**  
```js
balena.models.release.tags.remove(123, 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove('7cf02a6', 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove({application: 456, rawVersion: '0.0.0'}, 'EDITOR');
```
<a name="balena.models.release.asset"></a>

##### release.asset : <code>object</code>
**Kind**: static namespace of [<code>release</code>](#balena.models.release)  

* [.asset](#balena.models.release.asset) : <code>object</code>
    * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.asset.getAllByRelease) ⇒ <code>Promise</code>
    * [.get(id, [options])](#balena.models.release.asset.get) ⇒ <code>Promise</code>
    * [.download(id)](#balena.models.release.asset.download) ⇒ <code>Promise</code>
    * [.upload(uploadParams, [options])](#balena.models.release.asset.upload) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.release.asset.remove) ⇒ <code>Promise</code>

<a name="balena.models.release.asset.getAllByRelease"></a>

###### asset.getAllByRelease(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Get all release assets for a release  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release assets  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> |  | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.asset.getAllByRelease(123).then(function(assets) {
	console.log(assets);
});
```
**Example**  
```js
balena.models.release.asset.getAllByRelease('7cf02a6').then(function(assets) {
	console.log(assets);
});
```
**Example**  
```js
balena.models.release.asset.getAllByRelease({ application: 456, raw_version: '1.2.3' }).then(function(assets) {
	console.log(assets);
});
```
<a name="balena.models.release.asset.get"></a>

###### asset.get(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Get a specific release asset  
**Access**: public  
**Fulfil**: <code>Object</code> - release asset  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>Number</code> \| <code>Object</code> |  | release asset ID or object specifying the unique release & asset_key pair |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.asset.get(123).then(function(asset) {
	console.log(asset);
});
```
**Example**  
```js
balena.models.release.asset.get({
	asset_key: 'logo.png',
	release: 123
}).then(function(asset) {
	console.log(asset);
});
```
<a name="balena.models.release.asset.download"></a>

###### asset.download(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Download a release asset  
**Access**: public  
**Fulfil**: <code>NodeJS.ReadableStream</code> - download stream  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> \| <code>Object</code> | release asset ID or object specifying the unique release & asset_key pair |

**Example**  
```js
balena.models.release.asset.download(123).then(function(stream) {
	stream.pipe(fs.createWriteStream('logo.png'));
});
```
**Example**  
```js
balena.models.release.asset.download({
	asset_key: 'logo.png',
	release: 123
}).then(function(stream) {
	stream.pipe(fs.createWriteStream('logo.png'));
});
```
<a name="balena.models.release.asset.upload"></a>

###### asset.upload(uploadParams, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Upload a release asset  
**Access**: public  
**Fulfil**: <code>Object</code> - uploaded release asset  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uploadParams | <code>Object</code> |  | upload parameters |
| uploadParams.asset | <code>String</code> \| <code>File</code> |  | asset file path (string, Node.js only) or File object (Node.js & browser). For File objects, use new File([content], filename, {type: mimeType}) |
| uploadParams.asset_key | <code>String</code> |  | unique key for the asset within the release |
| uploadParams.release | <code>Number</code> |  | release ID |
| [options] | <code>Object</code> | <code>{}</code> | upload options |
| [options.chunkSize] | <code>Number</code> | <code>5242880</code> | chunk size for multipart uploads (5MiB default) |
| [options.parallelUploads] | <code>Number</code> | <code>5</code> | number of parallel uploads for multipart |
| [options.overwrite] | <code>Boolean</code> | <code>false</code> | whether to overwrite existing asset |
| [options.onUploadProgress] | <code>function</code> |  | callback for upload progress |

**Example**  
```js
// Upload from file path (Node.js)
balena.models.release.asset.upload({
	asset: '/path/to/logo.png',
	asset_key: 'logo.png',
	release: 123
}).then(function(asset) {
	console.log('Asset uploaded:', asset);
});
```
**Example**  
```js
// Upload with File API (Node.js and browser)
const content = Buffer.from('Hello, World!', 'utf-8');
const file = new File([content], 'readme.txt', { type: 'text/plain' });

balena.models.release.asset.upload({
	asset: file,
	asset_key: 'readme.txt',
	release: 123
}).then(function(asset) {
	console.log('Asset uploaded:', asset);
});
```
**Example**  
```js
// Upload large file with File API and progress tracking
const largeContent = new Uint8Array(10 * 1024 * 1024); // 10MB
const largeFile = new File([largeContent], 'data.bin', { type: 'application/octet-stream' });

balena.models.release.asset.upload({
	asset: largeFile,
	asset_key: 'data.bin',
	release: 123
}, {
	chunkSize: 5 * 1024 * 1024, // 5MB chunks
	parallelUploads: 3,
	onUploadProgress: function(progress) {
		const percent = (progress.uploaded / progress.total * 100).toFixed(2);
		console.log(`Upload progress: ${percent}%`);
	}
}).then(function(asset) {
	console.log('Large file uploaded:', asset);
});
```
**Example**  
```js
// Browser: Upload file from input element
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0]; // File object from input

balena.models.release.asset.upload({
	asset: file,
	asset_key: file.name,
	release: 123
}).then(function(asset) {
	console.log('File uploaded from browser:', asset);
});
```
**Example**  
```js
// Upload with overwrite option
balena.models.release.asset.upload({
	asset: '/path/to/logo.png',
	asset_key: 'logo.png',
	release: 123
}, {
	overwrite: true
}).then(function(asset) {
	console.log('Asset uploaded/updated:', asset);
});
```
<a name="balena.models.release.asset.remove"></a>

###### asset.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Remove a release asset  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> \| <code>Object</code> | release asset ID or object specifying the unique release & asset_key pair |

**Example**  
```js
balena.models.release.asset.remove(123);
```
**Example**  
```js
balena.models.release.asset.remove({
	asset_key: 'logo.png',
	release: 123
});
```
<a name="balena.models.release.get"></a>

##### release.get(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release  
**Access**: public  
**Fulfil**: <code>Object</code> - release  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> |  | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.get(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.get('7cf02a6').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.get({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log(release);
});
```
<a name="balena.models.release.getWithImageDetails"></a>

##### release.getWithImageDetails(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
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
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> |  | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
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
balena.models.release.getWithImageDetails('7cf02a6').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails({application: 456, raw_version: '0.0.0'}).then(function(release) {
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
<a name="balena.models.release.getAllByApplication"></a>

##### release.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get all releases from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - releases  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.getAllByApplication('myorganization/myapp').then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getAllByApplication(123).then(function(releases) {
	console.log(releases);
});
```
<a name="balena.models.release.getLatestByApplication"></a>

##### release.getLatestByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get the latest successful release for an application  
**Access**: public  
**Fulfil**: <code>Object\|undefined</code> - release  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.release.getLatestByApplication('myorganization/myapp').then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getLatestByApplication(123).then(function(releases) {
	console.log(releases);
});
```
<a name="balena.models.release.createFromUrl"></a>

##### release.createFromUrl(slugOrUuidOrId, urlDeployOptions) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Create a new release built from the source in the provided url  
**Access**: public  
**Fulfil**: <code>number</code> - release ID  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| urlDeployOptions | <code>Object</code> |  | builder options |
| urlDeployOptions.url | <code>String</code> |  | a url with a tarball of the project to build |
| [urlDeployOptions.shouldFlatten] | <code>Boolean</code> | <code>true</code> | Should be true when the tarball includes an extra root folder with all the content |

**Example**  
```js
balena.models.release.createFromUrl('myorganization/myapp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	console.log(releaseId);
});
```
**Example**  
```js
balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	console.log(releaseId);
});
```
<a name="balena.models.release.finalize"></a>

##### release.finalize(commitOrIdOrRawVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Finalizes a draft release  
**Access**: public  
**Fulfil**: <code>void</code>  

| Param | Type | Description |
| --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |

**Example**  
```js
balena.models.release.finalize(123).then(function() {
	console.log('finalized!');
});
```
**Example**  
```js
balena.models.release.finalize('7cf02a6').then(function() {
	console.log('finalized!');
});
```
**Example**  
```js
balena.models.release.finalize({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log('finalized!');
});
```
<a name="balena.models.release.setIsInvalidated"></a>

##### release.setIsInvalidated(commitOrIdOrRawVersion, isInvalidated) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Set the is_invalidated property of a release to true or false  
**Access**: public  
**Fulfil**: <code>void</code>  

| Param | Type | Description |
| --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| isInvalidated | <code>Boolean</code> | boolean value, true for invalidated, false for validated |

**Example**  
```js
balena.models.release.setIsInvalidated(123, true).then(function() {
	console.log('invalidated!');
});
```
**Example**  
```js
balena.models.release.setIsInvalidated('7cf02a6', true).then(function() {
	console.log('invalidated!');
});
```
**Example**  
```js
balena.models.release.setIsInvalidated({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log('invalidated!);
});
```
**Example**  
```js
balena.models.release.setIsInvalidated(123, false).then(function() {
	console.log('validated!');
});
```
**Example**  
```js
balena.models.release.setIsInvalidated('7cf02a6', false).then(function() {
	console.log('validated!');
});
```
<a name="balena.models.release.setNote"></a>

##### release.setNote(commitOrIdOrRawVersion, noteOrNull) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Add a note to a release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| noteOrNull | <code>String</code> \| <code>Null</code> | the note |

**Example**  
```js
balena.models.release.setNote('7cf02a6', 'My useful note');
```
**Example**  
```js
balena.models.release.setNote(123, 'My useful note');
```
**Example**  
```js
balena.models.release.setNote({ application: 456, rawVersion: '0.0.0' }, 'My useful note');
```
<a name="balena.models.release.setKnownIssueList"></a>

##### release.setKnownIssueList(commitOrIdOrRawVersion, knownIssueListOrNull) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Add a known issue list to a release  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| commitOrIdOrRawVersion | <code>String</code> \| <code>Number</code> \| <code>Object</code> | release commit (string) or id (number) or an object with the unique `application` (number or string) & `rawVersion` (string) pair of the release |
| knownIssueListOrNull | <code>String</code> \| <code>Null</code> | the known issue list |

**Example**  
```js
balena.models.release.setKnownIssueList('7cf02a6', 'This is an issue');
```
**Example**  
```js
balena.models.release.setKnownIssueList(123, 'This is an issue');
```
**Example**  
```js
balena.models.release.setKnownIssueList({application: 456, rawVersion: '0.0.0'}, 'This is an issue');
```
<a name="balena.models.service"></a>

#### models.service : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.service](#balena.models.service) : <code>object</code>
    * [.var](#balena.models.service.var) : <code>object</code>
        * [.getAllByService(serviceIdOrNaturalKey, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
        * [.get(serviceIdOrNaturalKey, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
        * [.set(serviceIdOrNaturalKey, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
        * [.remove(serviceIdOrNaturalKey, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>

<a name="balena.models.service.var"></a>

##### service.var : <code>object</code>
**Kind**: static namespace of [<code>service</code>](#balena.models.service)  

* [.var](#balena.models.service.var) : <code>object</code>
    * [.getAllByService(serviceIdOrNaturalKey, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(serviceIdOrNaturalKey, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
    * [.set(serviceIdOrNaturalKey, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>
    * [.remove(serviceIdOrNaturalKey, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>

<a name="balena.models.service.var.getAllByService"></a>

###### var.getAllByService(serviceIdOrNaturalKey, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all variables for a service  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| serviceIdOrNaturalKey | <code>Number</code> \| <code>Object</code> |  | service id (number) or appliation-service_name pair |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.var.getAllByService(999999).then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByService({ application: 'myorganization/myapp', service_name: 'myservice' }).then(function(vars) {
	console.log(vars);
});
```
<a name="balena.models.service.var.getAllByApplication"></a>

###### var.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all service variables by application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - service variables  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.var.getAllByApplication('myorganization/myapp').then(function(vars) {
	console.log(vars);
});
```
**Example**  
```js
balena.models.service.var.getAllByApplication(999999).then(function(vars) {
	console.log(vars);
});
```
<a name="balena.models.service.var.get"></a>

###### var.get(serviceIdOrNaturalKey, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get the value of a specific service variable  
**Access**: public  
**Fulfil**: <code>String\|undefined</code> - the variable value (or undefined)  

| Param | Type | Description |
| --- | --- | --- |
| serviceIdOrNaturalKey | <code>Number</code> \| <code>Object</code> | service id (number) or appliation-service_name pair |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.service.var.get(999999, 'VAR').then(function(value) {
	console.log(value);
});
```
**Example**  
```js
balena.models.service.var.get({ application: 'myorganization/myapp', service_name: 'myservice' }, 'VAR').then(function(value) {
	console.log(value);
});
```
<a name="balena.models.service.var.set"></a>

###### var.set(serviceIdOrNaturalKey, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Set the value of a specific service variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| serviceIdOrNaturalKey | <code>Number</code> \| <code>Object</code> | service id (number) or appliation-service_name pair |
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
balena.models.service.var.set({ application: 'myorganization/myapp', service_name: 'myservice' }, 'VAR', 'newvalue').then(function() {
	...
});
```
<a name="balena.models.service.var.remove"></a>

###### var.remove(serviceIdOrNaturalKey, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Clear the value of a specific service variable  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| serviceIdOrNaturalKey | <code>Number</code> \| <code>Object</code> | service id (number) or appliation-service_name pair |
| key | <code>String</code> | variable name |

**Example**  
```js
balena.models.service.var.remove(999999, 'VAR').then(function() {
	...
});
```
**Example**  
```js
balena.models.service.var.remove({ application: 'myorganization/myapp', service_name: 'myservice' }, 'VAR').then(function() {
	...
});
```
<a name="balena.models.service.getAllByApplication"></a>

##### service.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>service</code>](#balena.models.service)  
**Summary**: Get all services from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - services  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slugOrUuidOrId | <code>String</code> \| <code>Number</code> |  | application slug (string), uuid (string) or id (number) |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.service.getAllByApplication('myorganization/myapp').then(function(services) {
	console.log(services);
});
```
**Example**  
```js
balena.models.service.getAllByApplication(123).then(function(services) {
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
<a name="balena.models.image.getLogs"></a>

##### image.getLogs(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get the logs for an image  
**Access**: public  
**Fulfil**: <code>string \| null</code> - logs  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | image id |

**Example**  
```js
balena.models.image.getLogs(123).then(function(logs) {
	console.log(logs);
});
```
<a name="balena.models.creditBundle"></a>

#### models.creditBundle : <code>object</code>
**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.creditBundle](#balena.models.creditBundle) : <code>object</code>
    * [.getAllByOrg(organization, [options])](#balena.models.creditBundle.getAllByOrg) ⇒ <code>Promise</code>
    * [.create(organization, featureId, creditsToPurchase)](#balena.models.creditBundle.create) ⇒ <code>Promise</code>

<a name="balena.models.creditBundle.getAllByOrg"></a>

##### creditBundle.getAllByOrg(organization, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>creditBundle</code>](#balena.models.creditBundle)  
**Summary**: Get all of the credit bundles purchased by the given org  
**Access**: public  
**Fulfil**: <code>Object[]</code> - credit bundles  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> |  | handle (string) or id (number) of the target organization. |
| [options] | <code>Object</code> | <code>{}</code> | extra pine options to use |

**Example**  
```js
balena.models.creditBundle.getAllByOrg(orgId).then(function(creditBundles) {
	console.log(creditBundles);
});
```
<a name="balena.models.creditBundle.create"></a>

##### creditBundle.create(organization, featureId, creditsToPurchase) ⇒ <code>Promise</code>
**Kind**: static method of [<code>creditBundle</code>](#balena.models.creditBundle)  
**Summary**: Purchase a credit bundle for the given feature and org of the given quantity  
**Access**: public  
**Fulfil**: <code>Object[]</code> - credit bundles  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| featureId | <code>Number</code> | id (number) of the feature for which credits are being purchased. |
| creditsToPurchase | <code>Number</code> | number of credits being purchased. |

**Example**  
```js
balena.models.creditBundle.create(orgId, featureId, creditsToPurchase).then(function(creditBundle) {
	console.log(creditBundle);
});
```
<a name="balena.models.billing"></a>

#### models.billing : <code>object</code>
**Note!** The billing methods are available on Balena.io exclusively.

**Kind**: static namespace of [<code>models</code>](#balena.models)  

* [.billing](#balena.models.billing) : <code>object</code>
    * [.getAccount(organization)](#balena.models.billing.getAccount) ⇒ <code>Promise</code>
    * [.getPlan(organization)](#balena.models.billing.getPlan) ⇒ <code>Promise</code>
    * [.getBillingInfo(organization)](#balena.models.billing.getBillingInfo) ⇒ <code>Promise</code>
    * [.createSetupIntent(setupIntentParams)](#balena.models.billing.createSetupIntent) ⇒ <code>Promise</code>
    * [.updateBillingInfo(organization, billingInfo)](#balena.models.billing.updateBillingInfo) ⇒ <code>Promise</code>
    * [.removeBillingInfo(organization)](#balena.models.billing.removeBillingInfo) ⇒ <code>Promise</code>
    * [.updateAccountInfo(organization, accountInfo)](#balena.models.billing.updateAccountInfo)
    * [.changePlan(organization, planChangeOptions)](#balena.models.billing.changePlan) ⇒ <code>Promise</code>
    * [.getInvoices(organization)](#balena.models.billing.getInvoices) ⇒ <code>Promise</code>
    * [.downloadInvoice(organization)](#balena.models.billing.downloadInvoice) ⇒ <code>Promise</code>

<a name="balena.models.billing.getAccount"></a>

##### billing.getAccount(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the user's billing account  
**Access**: public  
**Fulfil**: <code>Object</code> - billing account  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getAccount(orgId).then(function(billingAccount) {
	console.log(billingAccount);
});
```
<a name="balena.models.billing.getPlan"></a>

##### billing.getPlan(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing plan  
**Access**: public  
**Fulfil**: <code>Object</code> - billing plan  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getPlan(orgId).then(function(billingPlan) {
	console.log(billingPlan);
});
```
<a name="balena.models.billing.getBillingInfo"></a>

##### billing.getBillingInfo(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getBillingInfo(orgId).then(function(billingInfo) {
	console.log(billingInfo);
});
```
<a name="balena.models.billing.createSetupIntent"></a>

##### billing.createSetupIntent(setupIntentParams) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Create a Stripe setup intent required for setting billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - partial stripe setup intent object  

| Param | Type | Description |
| --- | --- | --- |
| setupIntentParams | <code>Object</code> | an object containing the parameters for the setup intent creation |
| extraParams.organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| [extraParams.'g-recaptcha-response'] | <code>String</code> \| <code>undefined</code> | the captcha response |

**Example**  
```js
balena.models.billing.createSetupIntent(orgId).then(function(setupIntent) {
	console.log(setupIntent);
});
```
<a name="balena.models.billing.updateBillingInfo"></a>

##### billing.updateBillingInfo(organization, billingInfo) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Update the current billing information  
**Access**: public  
**Fulfil**: <code>Object</code> - billing information  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| billingInfo | <code>Object</code> | an object containing a billing info token_id |
| billingInfo.token_id | <code>String</code> | the token id generated for the billing info form |
| [billingInfo.'g-recaptcha-response'] | <code>String</code> \| <code>undefined</code> | the captcha response |
| [billingInfo.token_type] | <code>String</code> \| <code>undefined</code> | token type |

**Example**  
```js
balena.models.billing.updateBillingInfo(orgId, { token_id: 'xxxxxxx' }).then(function(billingInfo) {
	console.log(billingInfo);
});
```
<a name="balena.models.billing.removeBillingInfo"></a>

##### billing.removeBillingInfo(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Remove an organization's billing information  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.removeBillingInfo(orgId).then(function() {
	console.log("Success");
});
```
<a name="balena.models.billing.updateAccountInfo"></a>

##### billing.updateAccountInfo(organization, accountInfo)
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Update the current billing account information  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| accountInfo | <code>AccountInfo</code> | an object containing billing account info |

**Example**  
```js
balena.models.billing.updateAccountInfo(orgId, { email: 'hello@balena.io' })
```
**Example**  
```js
balena.models.billing.updateAccountInfo(orgId, { email: 'hello@balena.io' })
```
<a name="balena.models.billing.changePlan"></a>

##### billing.changePlan(organization, planChangeOptions) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Change the current billing plan  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
| planChangeOptions | <code>Object</code> | an object containing the billing plan change options |
| billingInfo.tier | <code>String</code> | the code of the target billing plan |
| billingInfo.cycle | <code>String</code> | the billing cycle |
| [billingInfo.planChangeReason] | <code>String</code> | the reason for changing the current plan |

**Example**  
```js
balena.models.billing.changePlan(orgId, { billingCode: 'prototype-v2', cycle: 'annual' }).then(function() {
	console.log('Plan changed!');
});
```
<a name="balena.models.billing.getInvoices"></a>

##### billing.getInvoices(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Get the available invoices  
**Access**: public  
**Fulfil**: <code>Object</code> - invoices  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |

**Example**  
```js
balena.models.billing.getInvoices(orgId).then(function(invoices) {
	console.log(invoices);
});
```
<a name="balena.models.billing.downloadInvoice"></a>

##### billing.downloadInvoice(organization) ⇒ <code>Promise</code>
**Kind**: static method of [<code>billing</code>](#balena.models.billing)  
**Summary**: Download a specific invoice  
**Access**: public  
**Fulfil**: <code>Blob\|ReadableStream</code> - blob on the browser, download stream on node  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>String</code> \| <code>Number</code> | handle (string) or id (number) of the target organization. |
|  | <code>String</code> | an invoice number |

**Example**  
```js
# Browser
balena.models.billing.downloadInvoice(orgId, '0000').then(function(blob) {
	console.log(blob);
});
# Node
balena.models.billing.downloadInvoice(orgId, '0000').then(function(stream) {
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
        * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>
        * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
        * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
        * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
        * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>
    * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
    * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
    * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
    * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
    * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
    * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
    * [.getUserInfo()](#balena.auth.getUserInfo) ⇒ <code>Promise</code>
    * [.getActorId()](#balena.auth.getActorId) ⇒ <code>Promise</code>
    * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
    * [.register(credentials)](#balena.auth.register) ⇒ <code>Promise</code>
    * [.verifyEmail(verificationPayload)](#balena.auth.verifyEmail) ⇒ <code>Promise</code>
    * [.requestVerificationEmail()](#balena.auth.requestVerificationEmail) ⇒ <code>Promise</code>

<a name="balena.auth.twoFactor"></a>

#### auth.twoFactor : <code>object</code>
**Kind**: static namespace of [<code>auth</code>](#balena.auth)  

* [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
    * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
    * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
    * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>
    * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
    * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
    * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
    * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>

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
<a name="balena.auth.twoFactor.verify"></a>

##### twoFactor.verify(code) ⇒ <code>Promise</code>
Verifies two factor authentication.
Note that this method not update the token automatically.
You should use [challenge](#balena.auth.twoFactor.challenge) when possible,
as it takes care of that as well.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Verify two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
const token = balena.auth.twoFactor.verify('1234');
balena.auth.loginWithToken(token);
```
<a name="balena.auth.twoFactor.getSetupKey"></a>

##### twoFactor.getSetupKey() ⇒ <code>Promise</code>
Retrieves a setup key for enabling two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Get two factor authentication setup key  
**Access**: public  
**Fulfil**: <code>String</code> - setup key  
**Example**  
```js
const setupKey = balena.auth.twoFactor.getSetupKey();
console.log(setupKey);
```
<a name="balena.auth.twoFactor.enable"></a>

##### twoFactor.enable(code) ⇒ <code>Promise</code>
Enables two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Enable two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
const token = balena.auth.twoFactor.enable('1234');
balena.auth.loginWithToken(token);
```
<a name="balena.auth.twoFactor.challenge"></a>

##### twoFactor.challenge(code) ⇒ <code>Promise</code>
You should use [login](#balena.auth.login) when possible,
as it takes care of saving the token and email as well.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Challenge two factor authentication and complete login  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
balena.auth.twoFactor.challenge('1234');
```
<a name="balena.auth.twoFactor.disable"></a>

##### twoFactor.disable(password) ⇒ <code>Promise</code>
Disables two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Disable two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>String</code> | password |

**Example**  
```js
const token = balena.auth.twoFactor.disable('1234');
balena.auth.loginWithToken(token);
```
<a name="balena.auth.whoami"></a>

#### auth.whoami() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) or [loginWithToken](#balena.auth.loginWithToken) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Return current logged in information  
**Access**: public  
**Fulfil**: <code>(Object\|undefined)</code> - actor information, if it exists  
**Example**  
```js
balena.auth.whoami().then(function(result) {
	if (!result) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My result is:', result);
	}
});
```
<a name="balena.auth.authenticate"></a>

#### auth.authenticate(credentials) ⇒ <code>Promise</code>
You should use [login](#balena.auth.login) when possible,
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
<a name="balena.auth.getToken"></a>

#### auth.getToken() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

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
<a name="balena.auth.getUserInfo"></a>

#### auth.getUserInfo() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's info  
**Access**: public  
**Fulfil**: <code>Object</code> - user info  
**Example**  
```js
balena.auth.getUserInfo().then(function(userInfo) {
	console.log(userInfo);
});
```
<a name="balena.auth.getActorId"></a>

#### auth.getActorId() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) or [loginWithToken](#balena.auth.loginWithToken) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in actor id  
**Access**: public  
**Fulfil**: <code>Number</code> - actor id  
**Example**  
```js
balena.auth.getActorId().then(function(actorId) {
	console.log(actorId);
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
<a name="balena.auth.register"></a>

#### auth.register(credentials) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Register a user account  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of username, password and email |
| credentials.email | <code>String</code> | the email |
| credentials.password | <code>String</code> | the password |
| [credentials.'g-recaptcha-response'] | <code>String</code> \| <code>undefined</code> | the captcha response |

**Example**  
```js
balena.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}).then(function(token) {
	console.log(token);
});
```
<a name="balena.auth.verifyEmail"></a>

#### auth.verifyEmail(verificationPayload) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Verifies an email  
**Access**: public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| verificationPayload | <code>Object</code> | in the form of email, and token |
| verificationPayload.email | <code>String</code> | the email |
| verificationPayload.token | <code>String</code> | the verification token |

**Example**  
```js
balena.auth.verifyEmail({
	email: 'johndoe@gmail.com',
	token: '5bb11d90eefb34a70318f06a43ef063f'
}).then(function(jwt) {
	console.log(jwt);
});
```
<a name="balena.auth.requestVerificationEmail"></a>

#### auth.requestVerificationEmail() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Re-send verification email to the user  
**Access**: public  
**Example**  
```js
balena.auth.requestVerificationEmail().then(function() {
	console.log('Requesting verification email operation complete!');
})
```
<a name="balena.logs"></a>

### balena.logs : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  

* [.logs](#balena.logs) : <code>object</code>
    * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
    * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
    * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
        * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
        * ["line"](#balena.logs.LogSubscription.event_line)
        * ["error"](#balena.logs.LogSubscription.event_error)

<a name="balena.logs.subscribe"></a>

#### logs.subscribe(uuidOrId, [options]) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
Connects to the stream of devices logs, returning a LogSubscription, which
can be used to listen for logs as they appear, line by line.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Subscribe to device logs  
**Access**: public  
**Fulfil**: [<code>LogSubscription</code>](#balena.logs.LogSubscription)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| uuidOrId | <code>String</code> \| <code>Number</code> |  | device uuid (string) or id (number) |
| [options] | <code>Object</code> |  | options |
| [options.count] | <code>Number</code> \| <code>&#x27;all&#x27;</code> | <code>0</code> | number of historical messages to include (or 'all') |
| [options.start] | <code>Number</code> \| <code>String</code> |  | the timestamp or ISO Date string after which to retrieve historical messages. When specified, the count parameter needs to also be provided. |

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
| [options.start] | <code>Number</code> \| <code>String</code> |  | the timestamp or ISO Date string after which to retrieve historical messages |

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
const oneDayAgoTimestamp = Date.now() - 24*60*60*1000;
balena.logs.history('7cf02a6', { start: oneDayAgoTimestamp }).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
const oneDayAgoIsoDateString = new Date(Date.now() - 24*60*60*1000).toISOString();
balena.logs.history('7cf02a6', { start: oneDayAgoIsoDateString }).then(function(lines) {
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
<a name="balena.utils"></a>

### balena.utils : <code>object</code>
**Kind**: static namespace of [<code>balena</code>](#balena)  
<a name="listImagesFromTargetState"></a>

## listImagesFromTargetState(targetState) ⇒
**Kind**: global function  
**Returns**: array containing all images for all services for all releases for all apps for the device  

| Param |
| --- |
| targetState | 

