# image
balena.models.image : <code>object</code>

**Kind**: static namespace  

* * *

## get
balena.models.image.get(id, [options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get a specific image  
**Access**: public  
**Fulfil**: <code>Object</code> - image  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td></td><td><p>image id</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.image.get(123).then(function(image) {
	console.log(image);
});
```

* * *

## getLogs
balena.models.image.getLogs(id) ⇒ <code>Promise</code>

**Kind**: static method of [<code>image</code>](#balena.models.image)  
**Summary**: Get the logs for an image  
**Access**: public  
**Fulfil**: <code>string \| null</code> - logs  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>image id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.image.getLogs(123).then(function(logs) {
	console.log(logs);
});
```

* * *

