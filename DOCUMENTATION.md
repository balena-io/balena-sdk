<a name="resin"></a>
## resin : <code>object</code>
Welcome to the Resin SDK documentation.

This document aims to describe all the functions supported by the SDK, as well as showing examples of their expected usage.

If you feel something is missing, not clear or could be improved, please don't hesitate to open an [issue in GitHub](https://github.com/resin-io/resin-sdk/issues/new), we'll be happy to help.

**Kind**: global namespace  

* [resin](#resin) : <code>object</code>
  * [.models](#resin.models) : <code>object</code>
    * [.application](#resin.models.application) : <code>object</code>
      * [.getAll()](#resin.models.application.getAll) ⇒ <code>Promise</code>
      * [.get(name)](#resin.models.application.get) ⇒ <code>Promise</code>
      * [.has(name)](#resin.models.application.has) ⇒ <code>Promise</code>
      * [.hasAny()](#resin.models.application.hasAny) ⇒ <code>Promise</code>
      * [.getById(id)](#resin.models.application.getById) ⇒ <code>Promise</code>
      * [.create(name, deviceType)](#resin.models.application.create) ⇒ <code>Promise</code>
      * [.remove(name)](#resin.models.application.remove) ⇒ <code>Promise</code>
      * [.restart(name)](#resin.models.application.restart) ⇒ <code>Promise</code>
      * [.getApiKey(name)](#resin.models.application.getApiKey) ⇒ <code>Promise</code>
    * [.device](#resin.models.device) : <code>object</code>
      * [.getAll()](#resin.models.device.getAll) ⇒ <code>Promise</code>
      * [.getAllByApplication(name)](#resin.models.device.getAllByApplication) ⇒ <code>Promise</code>
      * [.get(uuid)](#resin.models.device.get) ⇒ <code>Promise</code>
      * [.getByName(name)](#resin.models.device.getByName) ⇒ <code>Promise</code>
      * [.getName(uuid)](#resin.models.device.getName) ⇒ <code>Promise</code>
      * [.getApplicationName(uuid)](#resin.models.device.getApplicationName) ⇒ <code>Promise</code>
      * [.has(uuid)](#resin.models.device.has) ⇒ <code>Promise</code>
      * [.isOnline(uuid)](#resin.models.device.isOnline) ⇒ <code>Promise</code>
      * [.getLocalIPAddresses(uuid)](#resin.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
      * [.remove(uuid)](#resin.models.device.remove) ⇒ <code>Promise</code>
      * [.identify(uuid)](#resin.models.device.identify) ⇒ <code>Promise</code>
      * [.rename(uuid, newName)](#resin.models.device.rename) ⇒ <code>Promise</code>
      * [.note(uuid, note)](#resin.models.device.note) ⇒ <code>Promise</code>
      * [.restart(uuid)](#resin.models.device.restart) ⇒ <code>Promise</code>
      * [.getDisplayName(deviceTypeSlug)](#resin.models.device.getDisplayName) ⇒ <code>Promise</code>
      * [.getDeviceSlug(deviceTypeName)](#resin.models.device.getDeviceSlug) ⇒ <code>Promise</code>
      * [.getSupportedDeviceTypes()](#resin.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
      * [.getManifestBySlug(slug)](#resin.models.device.getManifestBySlug) ⇒ <code>Promise</code>
      * [.getManifestByApplication(applicationName)](#resin.models.device.getManifestByApplication) ⇒ <code>Promise</code>
      * [.generateUUID()](#resin.models.device.generateUUID) ⇒ <code>Promise</code>
      * [.register(applicationName, uuid)](#resin.models.device.register) ⇒ <code>Promise</code>
      * [.hasDeviceUrl(uuid)](#resin.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
      * [.getDeviceUrl(uuid)](#resin.models.device.getDeviceUrl) ⇒ <code>Promise</code>
      * [.enableDeviceUrl(uuid)](#resin.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
      * [.disableDeviceUrl(uuid)](#resin.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
    * [.key](#resin.models.key) : <code>object</code>
      * [.getAll()](#resin.models.key.getAll) ⇒ <code>Promise</code>
      * [.get(id)](#resin.models.key.get) ⇒ <code>Promise</code>
      * [.remove(id)](#resin.models.key.remove) ⇒ <code>Promise</code>
      * [.create(title, key)](#resin.models.key.create) ⇒ <code>Promise</code>
    * [.environment-variables](#resin.models.environment-variables) : <code>object</code>
      * [.device](#resin.models.environment-variables.device) : <code>object</code>
        * [.getAll(uuid)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
        * [.create(uuid, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
        * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
        * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>
      * [.getAll(applicationName)](#resin.models.environment-variables.getAll) ⇒ <code>Promise</code>
      * [.create(applicationName, name, value)](#resin.models.environment-variables.create) ⇒ <code>Promise</code>
      * [.update(id, value)](#resin.models.environment-variables.update) ⇒ <code>Promise</code>
      * [.remove(id)](#resin.models.environment-variables.remove) ⇒ <code>Promise</code>
      * [.isSystemVariable(variable)](#resin.models.environment-variables.isSystemVariable) ⇒ <code>Boolean</code>
    * [.os](#resin.models.os) : <code>object</code>
      * [.download(parameters)](#resin.models.os.download) ⇒ <code>Promise</code>
    * [.config](#resin.models.config) : <code>object</code>
      * [.getAll()](#resin.models.config.getAll) ⇒ <code>Promise</code>
      * [.getDeviceTypes()](#resin.models.config.getDeviceTypes) ⇒ <code>Promise</code>
      * [.getDeviceOptions(deviceType)](#resin.models.config.getDeviceOptions) ⇒ <code>Promise</code>
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
    * [.subscribe(uuid)](#resin.logs.subscribe) ⇒ <code>Promise</code>
    * [.history(uuid)](#resin.logs.history) ⇒ <code>Promise</code>
  * [.settings](#resin.settings) : <code>object</code>
    * [.get([key])](#resin.settings.get) ⇒ <code>Promise</code>
    * [.getAll()](#resin.settings.getAll) ⇒ <code>Promise</code>

<a name="resin.models"></a>
### resin.models : <code>object</code>
**Kind**: static namespace of <code>[resin](#resin)</code>  

* [.models](#resin.models) : <code>object</code>
  * [.application](#resin.models.application) : <code>object</code>
    * [.getAll()](#resin.models.application.getAll) ⇒ <code>Promise</code>
    * [.get(name)](#resin.models.application.get) ⇒ <code>Promise</code>
    * [.has(name)](#resin.models.application.has) ⇒ <code>Promise</code>
    * [.hasAny()](#resin.models.application.hasAny) ⇒ <code>Promise</code>
    * [.getById(id)](#resin.models.application.getById) ⇒ <code>Promise</code>
    * [.create(name, deviceType)](#resin.models.application.create) ⇒ <code>Promise</code>
    * [.remove(name)](#resin.models.application.remove) ⇒ <code>Promise</code>
    * [.restart(name)](#resin.models.application.restart) ⇒ <code>Promise</code>
    * [.getApiKey(name)](#resin.models.application.getApiKey) ⇒ <code>Promise</code>
  * [.device](#resin.models.device) : <code>object</code>
    * [.getAll()](#resin.models.device.getAll) ⇒ <code>Promise</code>
    * [.getAllByApplication(name)](#resin.models.device.getAllByApplication) ⇒ <code>Promise</code>
    * [.get(uuid)](#resin.models.device.get) ⇒ <code>Promise</code>
    * [.getByName(name)](#resin.models.device.getByName) ⇒ <code>Promise</code>
    * [.getName(uuid)](#resin.models.device.getName) ⇒ <code>Promise</code>
    * [.getApplicationName(uuid)](#resin.models.device.getApplicationName) ⇒ <code>Promise</code>
    * [.has(uuid)](#resin.models.device.has) ⇒ <code>Promise</code>
    * [.isOnline(uuid)](#resin.models.device.isOnline) ⇒ <code>Promise</code>
    * [.getLocalIPAddresses(uuid)](#resin.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
    * [.remove(uuid)](#resin.models.device.remove) ⇒ <code>Promise</code>
    * [.identify(uuid)](#resin.models.device.identify) ⇒ <code>Promise</code>
    * [.rename(uuid, newName)](#resin.models.device.rename) ⇒ <code>Promise</code>
    * [.note(uuid, note)](#resin.models.device.note) ⇒ <code>Promise</code>
    * [.restart(uuid)](#resin.models.device.restart) ⇒ <code>Promise</code>
    * [.getDisplayName(deviceTypeSlug)](#resin.models.device.getDisplayName) ⇒ <code>Promise</code>
    * [.getDeviceSlug(deviceTypeName)](#resin.models.device.getDeviceSlug) ⇒ <code>Promise</code>
    * [.getSupportedDeviceTypes()](#resin.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
    * [.getManifestBySlug(slug)](#resin.models.device.getManifestBySlug) ⇒ <code>Promise</code>
    * [.getManifestByApplication(applicationName)](#resin.models.device.getManifestByApplication) ⇒ <code>Promise</code>
    * [.generateUUID()](#resin.models.device.generateUUID) ⇒ <code>Promise</code>
    * [.register(applicationName, uuid)](#resin.models.device.register) ⇒ <code>Promise</code>
    * [.hasDeviceUrl(uuid)](#resin.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
    * [.getDeviceUrl(uuid)](#resin.models.device.getDeviceUrl) ⇒ <code>Promise</code>
    * [.enableDeviceUrl(uuid)](#resin.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
    * [.disableDeviceUrl(uuid)](#resin.models.device.disableDeviceUrl) ⇒ <code>Promise</code>
  * [.key](#resin.models.key) : <code>object</code>
    * [.getAll()](#resin.models.key.getAll) ⇒ <code>Promise</code>
    * [.get(id)](#resin.models.key.get) ⇒ <code>Promise</code>
    * [.remove(id)](#resin.models.key.remove) ⇒ <code>Promise</code>
    * [.create(title, key)](#resin.models.key.create) ⇒ <code>Promise</code>
  * [.environment-variables](#resin.models.environment-variables) : <code>object</code>
    * [.device](#resin.models.environment-variables.device) : <code>object</code>
      * [.getAll(uuid)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
      * [.create(uuid, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
      * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
      * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>
    * [.getAll(applicationName)](#resin.models.environment-variables.getAll) ⇒ <code>Promise</code>
    * [.create(applicationName, name, value)](#resin.models.environment-variables.create) ⇒ <code>Promise</code>
    * [.update(id, value)](#resin.models.environment-variables.update) ⇒ <code>Promise</code>
    * [.remove(id)](#resin.models.environment-variables.remove) ⇒ <code>Promise</code>
    * [.isSystemVariable(variable)](#resin.models.environment-variables.isSystemVariable) ⇒ <code>Boolean</code>
  * [.os](#resin.models.os) : <code>object</code>
    * [.download(parameters)](#resin.models.os.download) ⇒ <code>Promise</code>
  * [.config](#resin.models.config) : <code>object</code>
    * [.getAll()](#resin.models.config.getAll) ⇒ <code>Promise</code>
    * [.getDeviceTypes()](#resin.models.config.getDeviceTypes) ⇒ <code>Promise</code>
    * [.getDeviceOptions(deviceType)](#resin.models.config.getDeviceOptions) ⇒ <code>Promise</code>

<a name="resin.models.application"></a>
#### models.application : <code>object</code>
**Kind**: static namespace of <code>[models](#resin.models)</code>  

* [.application](#resin.models.application) : <code>object</code>
  * [.getAll()](#resin.models.application.getAll) ⇒ <code>Promise</code>
  * [.get(name)](#resin.models.application.get) ⇒ <code>Promise</code>
  * [.has(name)](#resin.models.application.has) ⇒ <code>Promise</code>
  * [.hasAny()](#resin.models.application.hasAny) ⇒ <code>Promise</code>
  * [.getById(id)](#resin.models.application.getById) ⇒ <code>Promise</code>
  * [.create(name, deviceType)](#resin.models.application.create) ⇒ <code>Promise</code>
  * [.remove(name)](#resin.models.application.remove) ⇒ <code>Promise</code>
  * [.restart(name)](#resin.models.application.restart) ⇒ <code>Promise</code>
  * [.getApiKey(name)](#resin.models.application.getApiKey) ⇒ <code>Promise</code>

<a name="resin.models.application.getAll"></a>
##### application.getAll() ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Get all applications  
**Access:** public  
**Fulfil**: <code>Object[]</code> - applications  
**Example**  
```js
resin.models.application.getAll().then (applications) ->
	console.log(applications)
```
**Example**  
```js
resin.models.application.getAll (error, applications) ->
	throw error if error?
	console.log(applications)
```
<a name="resin.models.application.get"></a>
##### application.get(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Get a single application  
**Access:** public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |

**Example**  
```js
resin.models.application.get('MyApp').then (application) ->
	console.log(application)
```
**Example**  
```js
resin.models.application.get 'MyApp', (error, application) ->
	throw error if error?
	console.log(application)
```
<a name="resin.models.application.has"></a>
##### application.has(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Check if an application exist  
**Access:** public  
**Fulfil**: <code>Boolean</code> - has application  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |

**Example**  
```js
resin.models.application.has('MyApp').then (hasApp) ->
	console.log(hasApp)
```
**Example**  
```js
resin.models.application.has 'MyApp', (error, hasApp) ->
	throw error if error?
	console.log(hasApp)
```
<a name="resin.models.application.hasAny"></a>
##### application.hasAny() ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Check if the user has any applications  
**Access:** public  
**Fulfil**: <code>Boolean</code> - has any applications  
**Example**  
```js
resin.models.application.hasAny().then (hasAny) ->
	console.log("Has any? #{hasAny}")
```
**Example**  
```js
resin.models.application.hasAny (error, hasAny) ->
	throw error if error?
	console.log("Has any? #{hasAny}")
```
<a name="resin.models.application.getById"></a>
##### application.getById(id) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Get a single application by id  
**Access:** public  
**Fulfil**: <code>Object</code> - application  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> &#124; <code>String</code> | application id |

**Example**  
```js
resin.models.application.getById(89).then (application) ->
	console.log(application)
```
**Example**  
```js
resin.models.application.getById 89, (error, application) ->
	throw error if error?
	console.log(application)
```
<a name="resin.models.application.create"></a>
##### application.create(name, deviceType) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Create an application  
**Access:** public  
**Fulfil**: <code>Number</code> - application id  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
resin.models.application.create('My App', 'raspberry-pi').then (id) ->
	console.log(id)
```
**Example**  
```js
resin.models.application.create 'My App', 'raspberry-pi', (error, id) ->
	throw error if error?
	console.log(id)
```
<a name="resin.models.application.remove"></a>
##### application.remove(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Remove application  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |

**Example**  
```js
resin.models.application.remove('MyApp')
```
**Example**  
```js
resin.models.application.remove 'MyApp', (error) ->
	throw error if error?
```
<a name="resin.models.application.restart"></a>
##### application.restart(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Restart application  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |

**Example**  
```js
resin.models.application.restart('MyApp')
```
**Example**  
```js
resin.models.application.restart 'MyApp', (error) ->
	throw error if error?
```
<a name="resin.models.application.getApiKey"></a>
##### application.getApiKey(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[application](#resin.models.application)</code>  
**Summary**: Get the API key for a specific application  
**Access:** public  
**Fulfil**: <code>String</code> - api key  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |

**Example**  
```js
resin.models.application.getApiKey('MyApp').then (apiKey) ->
	console.log(apiKey)
```
**Example**  
```js
resin.models.application.getApiKey 'MyApp', (error, apiKey) ->
	throw error if error?
	console.log(apiKey)
```
<a name="resin.models.device"></a>
#### models.device : <code>object</code>
**Kind**: static namespace of <code>[models](#resin.models)</code>  

* [.device](#resin.models.device) : <code>object</code>
  * [.getAll()](#resin.models.device.getAll) ⇒ <code>Promise</code>
  * [.getAllByApplication(name)](#resin.models.device.getAllByApplication) ⇒ <code>Promise</code>
  * [.get(uuid)](#resin.models.device.get) ⇒ <code>Promise</code>
  * [.getByName(name)](#resin.models.device.getByName) ⇒ <code>Promise</code>
  * [.getName(uuid)](#resin.models.device.getName) ⇒ <code>Promise</code>
  * [.getApplicationName(uuid)](#resin.models.device.getApplicationName) ⇒ <code>Promise</code>
  * [.has(uuid)](#resin.models.device.has) ⇒ <code>Promise</code>
  * [.isOnline(uuid)](#resin.models.device.isOnline) ⇒ <code>Promise</code>
  * [.getLocalIPAddresses(uuid)](#resin.models.device.getLocalIPAddresses) ⇒ <code>Promise</code>
  * [.remove(uuid)](#resin.models.device.remove) ⇒ <code>Promise</code>
  * [.identify(uuid)](#resin.models.device.identify) ⇒ <code>Promise</code>
  * [.rename(uuid, newName)](#resin.models.device.rename) ⇒ <code>Promise</code>
  * [.note(uuid, note)](#resin.models.device.note) ⇒ <code>Promise</code>
  * [.restart(uuid)](#resin.models.device.restart) ⇒ <code>Promise</code>
  * [.getDisplayName(deviceTypeSlug)](#resin.models.device.getDisplayName) ⇒ <code>Promise</code>
  * [.getDeviceSlug(deviceTypeName)](#resin.models.device.getDeviceSlug) ⇒ <code>Promise</code>
  * [.getSupportedDeviceTypes()](#resin.models.device.getSupportedDeviceTypes) ⇒ <code>Promise</code>
  * [.getManifestBySlug(slug)](#resin.models.device.getManifestBySlug) ⇒ <code>Promise</code>
  * [.getManifestByApplication(applicationName)](#resin.models.device.getManifestByApplication) ⇒ <code>Promise</code>
  * [.generateUUID()](#resin.models.device.generateUUID) ⇒ <code>Promise</code>
  * [.register(applicationName, uuid)](#resin.models.device.register) ⇒ <code>Promise</code>
  * [.hasDeviceUrl(uuid)](#resin.models.device.hasDeviceUrl) ⇒ <code>Promise</code>
  * [.getDeviceUrl(uuid)](#resin.models.device.getDeviceUrl) ⇒ <code>Promise</code>
  * [.enableDeviceUrl(uuid)](#resin.models.device.enableDeviceUrl) ⇒ <code>Promise</code>
  * [.disableDeviceUrl(uuid)](#resin.models.device.disableDeviceUrl) ⇒ <code>Promise</code>

<a name="resin.models.device.getAll"></a>
##### device.getAll() ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get all devices  
**Access:** public  
**Fulfil**: <code>Object[]</code> - devices  
**Example**  
```js
resin.models.device.getAll().then (devices) ->
	console.log(devices)
```
**Example**  
```js
resin.models.device.getAll (error, devices) ->
	throw error if error?
	console.log(devices)
```
<a name="resin.models.device.getAllByApplication"></a>
##### device.getAllByApplication(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get all devices by application  
**Access:** public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | application name |

**Example**  
```js
resin.models.device.getAllByApplication('MyApp').then (devices) ->
	console.log(devices)
```
**Example**  
```js
resin.models.device.getAllByApplication 'MyApp', (error, devices) ->
	throw error if error?
	console.log(devices)
```
<a name="resin.models.device.get"></a>
##### device.get(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get a single device  
**Access:** public  
**Fulfil**: <code>Object</code> - device  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.get('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (device) ->
	console.log(device)
```
**Example**  
```js
resin.models.device.get '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, device) ->
	throw error if error?
	console.log(device)
```
<a name="resin.models.device.getByName"></a>
##### device.getByName(name) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get devices by name  
**Access:** public  
**Fulfil**: <code>Object[]</code> - devices  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | device name |

**Example**  
```js
resin.models.device.getByName('MyDevice').then (devices) ->
	console.log(devices)
```
**Example**  
```js
resin.models.device.getByName 'MyDevice', (error, devices) ->
	throw error if error?
	console.log(devices)
```
<a name="resin.models.device.getName"></a>
##### device.getName(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get the name of a device  
**Access:** public  
**Fulfil**: <code>String</code> - device name  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.getName('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (deviceName) ->
	console.log(deviceName)
```
**Example**  
```js
resin.models.device.getName '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, deviceName) ->
	throw error if error?
	console.log(deviceName)
```
<a name="resin.models.device.getApplicationName"></a>
##### device.getApplicationName(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get application name  
**Access:** public  
**Fulfil**: <code>String</code> - application name  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.getApplicationName('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (applicationName) ->
	console.log(applicationName)
```
**Example**  
```js
resin.models.device.getApplicationName '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, applicationName) ->
	throw error if error?
	console.log(applicationName)
```
<a name="resin.models.device.has"></a>
##### device.has(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Check if a device exists  
**Access:** public  
**Fulfil**: <code>Boolean</code> - has device  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.has('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (hasDevice) ->
	console.log(hasDevice)
```
**Example**  
```js
resin.models.device.has '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, hasDevice) ->
	throw error if error?
	console.log(hasDevice)
```
<a name="resin.models.device.isOnline"></a>
##### device.isOnline(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Check if a device is online  
**Access:** public  
**Fulfil**: <code>Boolean</code> - is device online  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.isOnline('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (isOnline) ->
	console.log("Is device online? #{isOnline}")
```
**Example**  
```js
resin.models.device.isOnline '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, isOnline) ->
	throw error if error?
	console.log("Is device online? #{isOnline}")
```
<a name="resin.models.device.getLocalIPAddresses"></a>
##### device.getLocalIPAddresses(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get the local IP addresses of a device  
**Access:** public  
**Fulfil**: <code>String[]</code> - local ip addresses  
**Reject**: <code>Error</code> Will reject if the device is offline  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.getLocalIPAddresses('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (localIPAddresses) ->
	for localIP in localIPAddresses
		console.log(localIP)
```
**Example**  
```js
resin.models.device.getLocalIPAddresses '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, localIPAddresses) ->
	throw error if error?
	for localIP in localIPAddresses
		console.log(localIP)
```
<a name="resin.models.device.remove"></a>
##### device.remove(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Remove device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.remove('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
```
**Example**  
```js
resin.models.device.remove '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error) ->
	throw error if error?
```
<a name="resin.models.device.identify"></a>
##### device.identify(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Identify device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.identify('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
```
**Example**  
```js
resin.models.device.identify '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error) ->
	throw error if error?
```
<a name="resin.models.device.rename"></a>
##### device.rename(uuid, newName) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Rename device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |
| newName | <code>String</code> | the device new name |

**Example**  
```js
resin.models.device.rename('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'NewName')
```
**Example**  
```js
resin.models.device.rename '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'NewName', (error) ->
	throw error if error?
```
<a name="resin.models.device.note"></a>
##### device.note(uuid, note) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Note a device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |
| note | <code>String</code> | the note |

**Example**  
```js
resin.models.device.note('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'My useful note')
```
**Example**  
```js
resin.models.device.note '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'My useful note', (error) ->
	throw error if error?
```
<a name="resin.models.device.restart"></a>
##### device.restart(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Restart device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.restart('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
```
**Example**  
```js
resin.models.device.restart '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error) ->
	throw error if error?
```
<a name="resin.models.device.getDisplayName"></a>
##### device.getDisplayName(deviceTypeSlug) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get display name for a device  
**Access:** public  
**Fulfil**: <code>String</code> - device display name  
**See**: [module:resin.models.device.getSupportedDeviceTypes](module:resin.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeSlug | <code>String</code> | device type slug |

**Example**  
```js
resin.models.device.getDisplayName('raspberry-pi').then (deviceTypeName) ->
	console.log(deviceTypeName)
	# Raspberry Pi
```
**Example**  
```js
resin.models.device.getDisplayName 'raspberry-pi', (error, deviceTypeName) ->
	throw error if error?
	console.log(deviceTypeName)
	# Raspberry Pi
```
<a name="resin.models.device.getDeviceSlug"></a>
##### device.getDeviceSlug(deviceTypeName) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get device slug  
**Access:** public  
**Fulfil**: <code>String</code> - device slug name  
**See**: [module:resin.models.device.getSupportedDeviceTypes](module:resin.models.device.getSupportedDeviceTypes) for a list of supported devices  

| Param | Type | Description |
| --- | --- | --- |
| deviceTypeName | <code>String</code> | device type name |

**Example**  
```js
resin.models.device.getDeviceSlug('Raspberry Pi').then (deviceTypeSlug) ->
	console.log(deviceTypeSlug)
	# raspberry-pi
```
**Example**  
```js
resin.models.device.getDeviceSlug 'Raspberry Pi', (error, deviceTypeSlug) ->
	throw error if error?
	console.log(deviceTypeSlug)
	# raspberry-pi
```
<a name="resin.models.device.getSupportedDeviceTypes"></a>
##### device.getSupportedDeviceTypes() ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get supported device types  
**Access:** public  
**Fulfil**: <code>String[]</code> - supported device types  
**Example**  
```js
resin.models.device.getSupportedDeviceTypes().then (supportedDeviceTypes) ->
	for supportedDeviceType in supportedDeviceTypes
		console.log("Resin supports: #{supportedDeviceType}")
```
**Example**  
```js
resin.models.device.getSupportedDeviceTypes (error, supportedDeviceTypes) ->
	throw error if error?
	for supportedDeviceType in supportedDeviceTypes
		console.log("Resin supports: #{supportedDeviceType}")
```
<a name="resin.models.device.getManifestBySlug"></a>
##### device.getManifestBySlug(slug) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get a device manifest by slug  
**Access:** public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>String</code> | device slug |

**Example**  
```js
resin.models.device.getManifestBySlug('raspberry-pi').then (manifest) ->
	console.log(manifest)
```
**Example**  
```js
resin.models.device.getManifestBySlug 'raspberry-pi', (error, manifest) ->
	throw error if error?
	console.log(manifest)
```
<a name="resin.models.device.getManifestByApplication"></a>
##### device.getManifestByApplication(applicationName) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get a device manifest by application name  
**Access:** public  
**Fulfil**: <code>Object</code> - device manifest  

| Param | Type | Description |
| --- | --- | --- |
| applicationName | <code>String</code> | application name |

**Example**  
```js
resin.models.device.getManifestByApplication('MyApp').then (manifest) ->
	console.log(manifest)
```
**Example**  
```js
resin.models.device.getManifestByApplication 'MyApp', (error, manifest) ->
	throw error if error?
	console.log(manifest)
```
<a name="resin.models.device.generateUUID"></a>
##### device.generateUUID() ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Generate a random device UUID  
**Access:** public  
**Fulfil**: <code>String</code> - a generated UUID  
**Example**  
```js
resin.models.device.generateUUID().then (uuid) ->
	console.log(uuid)
```
<a name="resin.models.device.register"></a>
##### device.register(applicationName, uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Register a new device with a Resin.io application  
**Access:** public  
**Fulfil**: <code>Object</code> - device  

| Param | Type | Description |
| --- | --- | --- |
| applicationName | <code>String</code> | application name |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.generateUUID().then (uuid) ->
	resin.models.device.register('MyApp', uuid).then (device) ->
		console.log(device)
```
**Example**  
```js
resin.models.device.generateUUID (error, uuid) ->
	throw error if error?

	resin.models.device.register 'MyApp', uuid, (error, device) ->
		throw error if error?
		console.log(device)
```
<a name="resin.models.device.hasDeviceUrl"></a>
##### device.hasDeviceUrl(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Check if a device is web accessible with device utls  
**Access:** public  
**Fulfil**: <code>Boolean</code> - has device url  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.hasDeviceUrl('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
```
**Example**  
```js
resin.models.device.hasDeviceUrl '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error) ->
	throw error if error?
```
<a name="resin.models.device.getDeviceUrl"></a>
##### device.getDeviceUrl(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Get a device url  
**Access:** public  
**Fulfil**: <code>String</code> - device url  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.getDeviceUrl('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (url) ->
	console.log(url)
```
**Example**  
```js
resin.models.device.getDeviceUrl '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, url) ->
	console.log(url)
	throw error if error?
```
<a name="resin.models.device.enableDeviceUrl"></a>
##### device.enableDeviceUrl(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Enable device url for a device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.enableDeviceUrl('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
```
**Example**  
```js
resin.models.device.enableDeviceUrl '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error) ->
	throw error if error?
```
<a name="resin.models.device.disableDeviceUrl"></a>
##### device.disableDeviceUrl(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.device)</code>  
**Summary**: Disable device url for a device  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.device.disableDeviceUrl('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9')
```
**Example**  
```js
resin.models.device.disableDeviceUrl '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error) ->
	throw error if error?
```
<a name="resin.models.key"></a>
#### models.key : <code>object</code>
**Kind**: static namespace of <code>[models](#resin.models)</code>  

* [.key](#resin.models.key) : <code>object</code>
  * [.getAll()](#resin.models.key.getAll) ⇒ <code>Promise</code>
  * [.get(id)](#resin.models.key.get) ⇒ <code>Promise</code>
  * [.remove(id)](#resin.models.key.remove) ⇒ <code>Promise</code>
  * [.create(title, key)](#resin.models.key.create) ⇒ <code>Promise</code>

<a name="resin.models.key.getAll"></a>
##### key.getAll() ⇒ <code>Promise</code>
**Kind**: static method of <code>[key](#resin.models.key)</code>  
**Summary**: Get all ssh keys  
**Access:** public  
**Fulfil**: <code>Object[]</code> - ssh keys  
**Example**  
```js
resin.models.key.getAll().then (keys) ->
	console.log(keys)
```
**Example**  
```js
resin.models.key.getAll (error, keys) ->
	throw error if error?
	console.log(keys)
```
<a name="resin.models.key.get"></a>
##### key.get(id) ⇒ <code>Promise</code>
**Kind**: static method of <code>[key](#resin.models.key)</code>  
**Summary**: Get a single ssh key  
**Access:** public  
**Fulfil**: <code>Object</code> - ssh key  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> &#124; <code>Number</code> | key id |

**Example**  
```js
resin.models.key.get(51).then (key) ->
	console.log(key)
```
**Example**  
```js
resin.models.key.get 51, (error, key) ->
	throw error if error?
	console.log(key)
```
<a name="resin.models.key.remove"></a>
##### key.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of <code>[key](#resin.models.key)</code>  
**Summary**: Remove ssh key  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> &#124; <code>Number</code> | key id |

**Example**  
```js
resin.models.key.remove(51)
```
**Example**  
```js
resin.models.key.remove 51, (error) ->
	throw error if error?
```
<a name="resin.models.key.create"></a>
##### key.create(title, key) ⇒ <code>Promise</code>
**Kind**: static method of <code>[key](#resin.models.key)</code>  
**Summary**: Create a ssh key  
**Access:** public  
**Fulfil**: <code>Number</code> - ssh key id  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>String</code> | key title |
| key | <code>String</code> | the public ssh key |

**Example**  
```js
resin.models.key.create('Main', 'ssh-rsa AAAAB....').then (id) ->
	console.log(id)
```
**Example**  
```js
resin.models.key.create 'Main', 'ssh-rsa AAAAB....', (error, id) ->
	throw error if error?
	console.log(id)
```
<a name="resin.models.environment-variables"></a>
#### models.environment-variables : <code>object</code>
**Kind**: static namespace of <code>[models](#resin.models)</code>  

* [.environment-variables](#resin.models.environment-variables) : <code>object</code>
  * [.device](#resin.models.environment-variables.device) : <code>object</code>
    * [.getAll(uuid)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
    * [.create(uuid, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
    * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
    * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>
  * [.getAll(applicationName)](#resin.models.environment-variables.getAll) ⇒ <code>Promise</code>
  * [.create(applicationName, name, value)](#resin.models.environment-variables.create) ⇒ <code>Promise</code>
  * [.update(id, value)](#resin.models.environment-variables.update) ⇒ <code>Promise</code>
  * [.remove(id)](#resin.models.environment-variables.remove) ⇒ <code>Promise</code>
  * [.isSystemVariable(variable)](#resin.models.environment-variables.isSystemVariable) ⇒ <code>Boolean</code>

<a name="resin.models.environment-variables.device"></a>
##### environment-variables.device : <code>object</code>
**Kind**: static namespace of <code>[environment-variables](#resin.models.environment-variables)</code>  

* [.device](#resin.models.environment-variables.device) : <code>object</code>
  * [.getAll(uuid)](#resin.models.environment-variables.device.getAll) ⇒ <code>Promise</code>
  * [.create(uuid, name, value)](#resin.models.environment-variables.device.create) ⇒ <code>Promise</code>
  * [.update(id, value)](#resin.models.environment-variables.device.update) ⇒ <code>Promise</code>
  * [.remove(id)](#resin.models.environment-variables.device.remove) ⇒ <code>Promise</code>

<a name="resin.models.environment-variables.device.getAll"></a>
###### device.getAll(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.environment-variables.device)</code>  
**Summary**: Get all device environment variables  
**Access:** public  
**Fulfil**: <code>Object[]</code> - device environment variables  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.models.environmentVariables.device.getAll('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (environmentVariables) ->
	console.log(environmentVariables)
```
**Example**  
```js
resin.models.environmentVariables.device.getAll '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, environmentVariables) ->
	throw error if error?
	console.log(environmentVariables)
```
<a name="resin.models.environment-variables.device.create"></a>
###### device.create(uuid, name, value) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.environment-variables.device)</code>  
**Summary**: Create a device environment variable  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |
| name | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.device.create('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'EDITOR', 'vim')
```
**Example**  
```js
resin.models.environmentVariables.device.create '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', 'EDITOR', 'vim', (error) ->
	throw error if error?
```
<a name="resin.models.environment-variables.device.update"></a>
###### device.update(id, value) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.environment-variables.device)</code>  
**Summary**: Update a device environment variable  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> &#124; <code>Number</code> | environment variable id |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.device.update(2, 'emacs')
```
**Example**  
```js
resin.models.environmentVariables.device.update 2, 'emacs', (error) ->
	throw error if error?
```
<a name="resin.models.environment-variables.device.remove"></a>
###### device.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of <code>[device](#resin.models.environment-variables.device)</code>  
**Summary**: Remove a device environment variable  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> &#124; <code>Number</code> | environment variable id |

**Example**  
```js
resin.models.environmentVariables.device.remove(2)
```
**Example**  
```js
resin.models.environmentVariables.device.remove 2, (error) ->
	throw error if error?
```
<a name="resin.models.environment-variables.getAll"></a>
##### environment-variables.getAll(applicationName) ⇒ <code>Promise</code>
**Kind**: static method of <code>[environment-variables](#resin.models.environment-variables)</code>  
**Summary**: Get all environment variables by application  
**Access:** public  
**Fulfil**: <code>Object[]</code> - environment variables  

| Param | Type | Description |
| --- | --- | --- |
| applicationName | <code>String</code> | application name |

**Example**  
```js
resin.models.environmentVariables.getAllByApplication('MyApp').then (environmentVariables) ->
	console.log(environmentVariables)
```
**Example**  
```js
resin.models.environmentVariables.getAllByApplication 'MyApp', (error, environmentVariables) ->
	throw error if error?
	console.log(environmentVariables)
```
<a name="resin.models.environment-variables.create"></a>
##### environment-variables.create(applicationName, name, value) ⇒ <code>Promise</code>
**Kind**: static method of <code>[environment-variables](#resin.models.environment-variables)</code>  
**Summary**: Create an environment variable for an application  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| applicationName | <code>String</code> | application name |
| name | <code>String</code> | environment variable name |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.create('MyApp', 'EDITOR', 'vim')
```
**Example**  
```js
resin.models.environmentVariables.create 'MyApp', 'EDITOR', 'vim', (error) ->
	throw error if error?
```
<a name="resin.models.environment-variables.update"></a>
##### environment-variables.update(id, value) ⇒ <code>Promise</code>
**Kind**: static method of <code>[environment-variables](#resin.models.environment-variables)</code>  
**Summary**: Update an environment variable value from an application  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> &#124; <code>Number</code> | environment variable id |
| value | <code>String</code> | environment variable value |

**Example**  
```js
resin.models.environmentVariables.update(317, 'vim')
```
**Example**  
```js
resin.models.environmentVariables.update 317, 'vim', (error) ->
	throw error if error?
```
<a name="resin.models.environment-variables.remove"></a>
##### environment-variables.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of <code>[environment-variables](#resin.models.environment-variables)</code>  
**Summary**: Remove environment variable  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> &#124; <code>Number</code> | environment variable id |

**Example**  
```js
resin.models.environmentVariables.remove(51)
```
**Example**  
```js
resin.models.environmentVariables.remove 51, (error) ->
	throw error if error?
```
<a name="resin.models.environment-variables.isSystemVariable"></a>
##### environment-variables.isSystemVariable(variable) ⇒ <code>Boolean</code>
**Kind**: static method of <code>[environment-variables](#resin.models.environment-variables)</code>  
**Summary**: Check is a variable is system specific  
**Returns**: <code>Boolean</code> - Whether a variable is system specific or not  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>Object</code> | environment variable |

**Example**  
```js
resin.models.environmentVariables.isSystemVariable(name: 'RESIN_SUPERVISOR')
> true
```
**Example**  
```js
resin.models.environmentVariables.isSystemVariable(name: 'EDITOR')
> false
```
<a name="resin.models.os"></a>
#### models.os : <code>object</code>
**Kind**: static namespace of <code>[models](#resin.models)</code>  
<a name="resin.models.os.download"></a>
##### os.download(parameters) ⇒ <code>Promise</code>
**Kind**: static method of <code>[os](#resin.models.os)</code>  
**Summary**: Download an OS image  
**Access:** public  
**Fulfil**: <code>ReadableStream</code> - download stream  
**Todo**

- [ ] In the future this function should only require a device type slug.


| Param | Type | Description |
| --- | --- | --- |
| parameters | <code>Object</code> | os parameters |

**Example**  
```js
parameters =
	network: 'ethernet'
	appId: 91

resin.models.os.download(parameters).then (stream) ->
	stream.pipe(fs.createWriteStream('foo/bar/image.img'))
```
**Example**  
```js
parameters =
	network: 'ethernet'
	appId: 91

resin.models.os.download parameters, (error, stream) ->
	throw error if error?
	stream.pipe(fs.createWriteStream('foo/bar/image.img'))
```
<a name="resin.models.config"></a>
#### models.config : <code>object</code>
**Kind**: static namespace of <code>[models](#resin.models)</code>  

* [.config](#resin.models.config) : <code>object</code>
  * [.getAll()](#resin.models.config.getAll) ⇒ <code>Promise</code>
  * [.getDeviceTypes()](#resin.models.config.getDeviceTypes) ⇒ <code>Promise</code>
  * [.getDeviceOptions(deviceType)](#resin.models.config.getDeviceOptions) ⇒ <code>Promise</code>

<a name="resin.models.config.getAll"></a>
##### config.getAll() ⇒ <code>Promise</code>
**Kind**: static method of <code>[config](#resin.models.config)</code>  
**Summary**: Get all configuration  
**Access:** public  
**Fulfil**: <code>Object</code> - configuration  
**Example**  
```js
resin.models.config.getAll().then (config) ->
	console.log(config)
```
**Example**  
```js
resin.models.config.getAll (error, config) ->
	throw error if error?
	console.log(config)
```
<a name="resin.models.config.getDeviceTypes"></a>
##### config.getDeviceTypes() ⇒ <code>Promise</code>
**Kind**: static method of <code>[config](#resin.models.config)</code>  
**Summary**: Get device types  
**Access:** public  
**Fulfil**: <code>Object[]</code> - device types  
**Example**  
```js
resin.models.config.getDeviceTypes().then (deviceTypes) ->
	console.log(deviceTypes)
```
**Example**  
```js
resin.models.config.getDeviceTypes (error, deviceTypes) ->
	throw error if error?
	console.log(deviceTypes)
```
<a name="resin.models.config.getDeviceOptions"></a>
##### config.getDeviceOptions(deviceType) ⇒ <code>Promise</code>
**Kind**: static method of <code>[config](#resin.models.config)</code>  
**Summary**: Get configuration/initialization options for a device type  
**Access:** public  
**Fulfil**: <code>Object[]</code> - configuration options  

| Param | Type | Description |
| --- | --- | --- |
| deviceType | <code>String</code> | device type slug |

**Example**  
```js
resin.models.config.getDeviceOptions('raspberry-pi').then (options) ->
	console.log(options)
```
**Example**  
```js
resin.models.config.getDeviceOptions 'raspberry-pi', (error, options) ->
	throw error if error?
	console.log(options)
```
<a name="resin.auth"></a>
### resin.auth : <code>object</code>
**Kind**: static namespace of <code>[resin](#resin)</code>  

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
**Kind**: static namespace of <code>[auth](#resin.auth)</code>  

* [.twoFactor](#resin.auth.twoFactor) : <code>object</code>
  * [.isEnabled()](#resin.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
  * [.isPassed()](#resin.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
  * [.challenge(code)](#resin.auth.twoFactor.challenge) ⇒ <code>Promise</code>

<a name="resin.auth.twoFactor.isEnabled"></a>
##### twoFactor.isEnabled() ⇒ <code>Promise</code>
**Kind**: static method of <code>[twoFactor](#resin.auth.twoFactor)</code>  
**Summary**: Check if two factor authentication is enabled  
**Access:** public  
**Fulfil**: <code>Boolean</code> - whether 2fa is enabled  
**Example**  
```js
resin.auth.twoFactor.isEnabled().then (isEnabled) ->
	if isEnabled
		console.log('2FA is enabled for this account')
```
**Example**  
```js
resin.auth.twoFactor.isEnabled (error, isEnabled) ->
	throw error if error?

	if isEnabled
		console.log('2FA is enabled for this account')
```
<a name="resin.auth.twoFactor.isPassed"></a>
##### twoFactor.isPassed() ⇒ <code>Promise</code>
**Kind**: static method of <code>[twoFactor](#resin.auth.twoFactor)</code>  
**Summary**: Check if two factor authentication challenge was passed  
**Access:** public  
**Fulfil**: <code>Boolean</code> - whether 2fa challenge was passed  
**Example**  
```js
resin.auth.twoFactor.isPassed().then (isPassed) ->
	if isPassed
		console.log('2FA challenge passed')
```
**Example**  
```js
resin.auth.twoFactor.isPassed (error, isPassed) ->
	throw error if error?

	if isPassed
		console.log('2FA challenge passed')
```
<a name="resin.auth.twoFactor.challenge"></a>
##### twoFactor.challenge(code) ⇒ <code>Promise</code>
**Kind**: static method of <code>[twoFactor](#resin.auth.twoFactor)</code>  
**Summary**: Challenge two factor authentication  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>String</code> | code |

**Example**  
```js
resin.auth.twoFactor.challenge('1234')
```
**Example**  
```js
resin.auth.twoFactor.challenge '1234', (error) ->
	throw error if error?
```
<a name="resin.auth.whoami"></a>
#### auth.whoami() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Return current logged in username  
**Access:** public  
**Fulfil**: <code>(String\|undefined)</code> - username, if it exists  
**Example**  
```js
resin.auth.whoami().then (username) ->
	if not username?
		console.log('I\'m not logged in!')
	else
		console.log("My username is: #{username}")
```
**Example**  
```js
resin.auth.whoami (error, username) ->
	throw error if error?

	if not username?
		console.log('I\'m not logged in!')
	else
		console.log("My username is: #{username}")
```
<a name="resin.auth.authenticate"></a>
#### auth.authenticate(credentials) ⇒ <code>Promise</code>
You should use [module:resin.auth.login](module:resin.auth.login) when possible,
as it takes care of saving the token and username as well.

Notice that if `credentials` contains extra keys, they'll be discarted
by the server automatically.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Authenticate with the server  
**Access:** protected  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of username, password |
| credentials.username | <code>String</code> | the username |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
resin.auth.authenticate(credentials).then (token) ->
	console.log("My token is: #{token}")
```
**Example**  
```js
resin.auth.authenticate credentials, (error, token) ->
	throw error if error?
	console.log("My token is: #{token}")
```
<a name="resin.auth.login"></a>
#### auth.login(credentials) ⇒ <code>Promise</code>
If the login is successful, the token is persisted between sessions.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Login to Resin.io  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>Object</code> | in the form of username, password |
| credentials.username | <code>String</code> | the username |
| credentials.password | <code>String</code> | the password |

**Example**  
```js
resin.auth.login(credentials)
```
**Example**  
```js
resin.auth.login credentials, (error) ->
	throw error if error?
```
<a name="resin.auth.loginWithToken"></a>
#### auth.loginWithToken(token) ⇒ <code>Promise</code>
Login to resin with a session token instead of with credentials.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Login to Resin.io with a token  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | the auth token |

**Example**  
```js
resin.auth.loginWithToken(token)
```
**Example**  
```js
resin.auth.loginWithToken token, (error) ->
	throw error if error?
```
<a name="resin.auth.isLoggedIn"></a>
#### auth.isLoggedIn() ⇒ <code>Promise</code>
**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Check if you&#x27;re logged in  
**Access:** public  
**Fulfil**: <code>Boolean</code> - is logged in  
**Example**  
```js
resin.auth.isLoggedIn().then (isLoggedIn) ->
	if isLoggedIn
		console.log('I\'m in!')
	else
		console.log('Too bad!')
```
**Example**  
```js
resin.auth.isLoggedIn (error, isLoggedIn) ->
	throw error if error?

	if isLoggedIn
		console.log('I\'m in!')
	else
		console.log('Too bad!')
```
<a name="resin.auth.getToken"></a>
#### auth.getToken() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Get current logged in user&#x27;s token  
**Access:** public  
**Fulfil**: <code>String</code> - session token  
**Example**  
```js
resin.auth.getToken().then (token) ->
	console.log(token)
```
**Example**  
```js
resin.auth.getToken (error, token) ->
	throw error if error?
	console.log(token)
```
<a name="resin.auth.getUserId"></a>
#### auth.getUserId() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Get current logged in user&#x27;s id  
**Access:** public  
**Fulfil**: <code>Number</code> - user id  
**Example**  
```js
resin.auth.getUserId().then (userId) ->
	console.log(userId)
```
**Example**  
```js
resin.auth.getUserId (error, userId) ->
	throw error if error?
	console.log(userId)
```
<a name="resin.auth.getEmail"></a>
#### auth.getEmail() ⇒ <code>Promise</code>
This will only work if you used [module:resin.auth.login](module:resin.auth.login) to log in.

**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Get current logged in user&#x27;s email  
**Access:** public  
**Fulfil**: <code>String</code> - user email  
**Example**  
```js
resin.auth.getEmail().then (email) ->
	console.log(email)
```
<a name="resin.auth.logout"></a>
#### auth.logout() ⇒ <code>Promise</code>
**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Logout from Resin.io  
**Access:** public  
**Example**  
```js
resin.auth.logout()
```
**Example**  
```js
resin.auth.logout (error) ->
	throw error if error?
```
<a name="resin.auth.register"></a>
#### auth.register([credentials]) ⇒ <code>Promise</code>
**Kind**: static method of <code>[auth](#resin.auth)</code>  
**Summary**: Register to Resin.io  
**Access:** public  
**Fulfil**: <code>String</code> - session token  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [credentials] | <code>Object</code> | <code>{}</code> | in the form of username, password and email |
| credentials.email | <code>String</code> |  | the email |
| credentials.password | <code>String</code> |  | the password |

**Example**  
```js
resin.auth.register
	email: 'johndoe@gmail.com'
	password: 'secret'
.then (token) ->
	console.log(token)
```
**Example**  
```js
resin.auth.register
	email: 'johndoe@gmail.com'
	password: 'secret'
, (error, token) ->
	throw error if error?
	console.log(token)
```
<a name="resin.logs"></a>
### resin.logs : <code>object</code>
**Kind**: static namespace of <code>[resin](#resin)</code>  

* [.logs](#resin.logs) : <code>object</code>
  * [.subscribe(uuid)](#resin.logs.subscribe) ⇒ <code>Promise</code>
  * [.history(uuid)](#resin.logs.history) ⇒ <code>Promise</code>

<a name="resin.logs.subscribe"></a>
#### logs.subscribe(uuid) ⇒ <code>Promise</code>
The `logs` object yielded by this function emits the following events:

- `line`: when a log line is received.
- `error`: when an error happens.

**Kind**: static method of <code>[logs](#resin.logs)</code>  
**Summary**: Subscribe to device logs  
**Access:** public  
**Fulfil**: <code>EventEmitter</code> - logs  
**Todo**

- [ ] We should consider making this a readable stream.


| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.logs.subscribe('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (logs) ->
	logs.on 'line', (line) ->
		console.log(line)
```
**Example**  
```js
resin.logs.subscribe '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, logs) ->
	throw error if error?
	logs.on 'line', (line) ->
		console.log(line)
```
<a name="resin.logs.history"></a>
#### logs.history(uuid) ⇒ <code>Promise</code>
**Kind**: static method of <code>[logs](#resin.logs)</code>  
**Summary**: Get device logs history  
**Access:** public  
**Fulfil**: <code>String[]</code> - history lines  

| Param | Type | Description |
| --- | --- | --- |
| uuid | <code>String</code> | device uuid |

**Example**  
```js
resin.logs.history('7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9').then (lines) ->
	for line in lines
		console.log(line)
```
**Example**  
```js
resin.logs.history '7cf02a62a3a84440b1bb5579a3d57469148943278630b17e7fc6c4f7b465c9', (error, lines) ->
	throw error if error?
	for line in lines
		console.log(line)
```
<a name="resin.settings"></a>
### resin.settings : <code>object</code>
**Kind**: static namespace of <code>[resin](#resin)</code>  

* [.settings](#resin.settings) : <code>object</code>
  * [.get([key])](#resin.settings.get) ⇒ <code>Promise</code>
  * [.getAll()](#resin.settings.getAll) ⇒ <code>Promise</code>

<a name="resin.settings.get"></a>
#### settings.get([key]) ⇒ <code>Promise</code>
**Kind**: static method of <code>[settings](#resin.settings)</code>  
**Summary**: Get a single setting  
**Access:** public  
**Fulfil**: <code>\*</code> - setting value  

| Param | Type | Description |
| --- | --- | --- |
| [key] | <code>String</code> | setting key |

**Example**  
```js
resin.settings.get('apiUrl').then (apiUrl) ->
	console.log(apiUrl)
```
**Example**  
```js
resin.settings.get 'apiUrl', (error, apiUrl) ->
	throw error if error?
	console.log(apiUrl)
```
<a name="resin.settings.getAll"></a>
#### settings.getAll() ⇒ <code>Promise</code>
**Kind**: static method of <code>[settings](#resin.settings)</code>  
**Summary**: Get all settings  
**Access:** public  
**Fulfil**: <code>Object</code> - settings  
**Example**  
```js
resin.settings.getAll().then (settings) ->
	console.log(settings)
```
**Example**  
```js
resin.settings.getAll (error, settings) ->
	throw error if error?
	console.log(settings)
```
