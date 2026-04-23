# key
balena.models.key : <code>object</code>

**Kind**: static namespace  

* * *

## create
balena.models.key.create(title, key) ⇒ <code>Promise</code>

**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Create a ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>title</td><td><code>String</code></td><td><p>key title</p>
</td>
    </tr><tr>
    <td>key</td><td><code>String</code></td><td><p>the public ssh key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.key.create('Main', 'ssh-rsa AAAAB....').then(function(key) {
	console.log(key);
});
```

* * *

## get
balena.models.key.get(id) ⇒ <code>Promise</code>

**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get a single ssh key  
**Access**: public  
**Fulfil**: <code>Object</code> - ssh key  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>key id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.key.get(51).then(function(key) {
	console.log(key);
});
```

* * *

## getAll
balena.models.key.getAll([options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Get all ssh keys  
**Access**: public  
**Fulfil**: <code>Object[]</code> - ssh keys  
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
balena.models.key.getAll().then(function(keys) {
	console.log(keys);
});
```

* * *

## remove
balena.models.key.remove(id) ⇒ <code>Promise</code>

**Kind**: static method of [<code>key</code>](#balena.models.key)  
**Summary**: Remove ssh key  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>key id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.key.remove(51);
```

* * *

