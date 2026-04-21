# service
balena.models.service : <code>object</code>

**Kind**: static namespace  

* * *

## getAllByApplication
balena.models.service.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>

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

## var
balena.models.service.var : <code>object</code>

**Kind**: static namespace of [<code>service</code>](#balena.models.service)  

* * *

### get
balena.models.service.var.get(serviceIdOrNaturalKey, key) ⇒ <code>Promise</code>

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

### getAllByApplication
balena.models.service.var.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>

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

### getAllByService
balena.models.service.var.getAllByService(serviceIdOrNaturalKey, [options]) ⇒ <code>Promise</code>

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

### remove
balena.models.service.var.remove(serviceIdOrNaturalKey, key) ⇒ <code>Promise</code>

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

### set
balena.models.service.var.set(serviceIdOrNaturalKey, key, value) ⇒ <code>Promise</code>

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

