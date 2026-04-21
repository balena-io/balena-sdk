<a name="balena.models.service"></a>

## .service : <code>object</code>
**Kind**: static namespace  

* [.service](#balena.models.service) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.getAllByApplication) ⇒ <code>Promise</code>
    * [.var](#balena.models.service.var) : <code>object</code>
        * [.get(serviceIdOrNaturalKey, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByService(serviceIdOrNaturalKey, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
        * [.remove(serviceIdOrNaturalKey, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
        * [.set(serviceIdOrNaturalKey, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.service.getAllByApplication"></a>

### service.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>service</code>](#balena.models.service)  
**Summary**: Get all services from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - services  
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

* * *

<a name="balena.models.service.var"></a>

### service.var : <code>object</code>
**Kind**: static namespace of [<code>service</code>](#balena.models.service)  

* [.var](#balena.models.service.var) : <code>object</code>
    * [.get(serviceIdOrNaturalKey, key)](#balena.models.service.var.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.service.var.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByService(serviceIdOrNaturalKey, [options])](#balena.models.service.var.getAllByService) ⇒ <code>Promise</code>
    * [.remove(serviceIdOrNaturalKey, key)](#balena.models.service.var.remove) ⇒ <code>Promise</code>
    * [.set(serviceIdOrNaturalKey, key, value)](#balena.models.service.var.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.service.var.get"></a>

#### var.get(serviceIdOrNaturalKey, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get the value of a specific service variable  
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
    <td>serviceIdOrNaturalKey</td><td><code>Number</code> | <code>Object</code></td><td><p>service id (number) or appliation-service_name pair</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>variable name</p>
</td>
    </tr>  </tbody>
</table>

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

* * *

<a name="balena.models.service.var.getAllByApplication"></a>

#### var.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all service variables by application  
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

* * *

<a name="balena.models.service.var.getAllByService"></a>

#### var.getAllByService(serviceIdOrNaturalKey, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Get all variables for a service  
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
    <td>serviceIdOrNaturalKey</td><td><code>Number</code> | <code>Object</code></td><td></td><td><p>service id (number) or appliation-service_name pair</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

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

* * *

<a name="balena.models.service.var.remove"></a>

#### var.remove(serviceIdOrNaturalKey, key) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Clear the value of a specific service variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>serviceIdOrNaturalKey</td><td><code>Number</code> | <code>Object</code></td><td><p>service id (number) or appliation-service_name pair</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>variable name</p>
</td>
    </tr>  </tbody>
</table>

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

* * *

<a name="balena.models.service.var.set"></a>

#### var.set(serviceIdOrNaturalKey, key, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>var</code>](#balena.models.service.var)  
**Summary**: Set the value of a specific service variable  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>serviceIdOrNaturalKey</td><td><code>Number</code> | <code>Object</code></td><td><p>service id (number) or appliation-service_name pair</p>
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

* * *

