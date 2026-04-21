<a name="balena.settings"></a>

## .settings : <code>object</code>
**Kind**: static namespace  

* [.settings](#balena.settings) : <code>object</code>
    * [.get([key])](#balena.settings.get) ⇒ <code>Promise</code>
    * [.getAll()](#balena.settings.getAll) ⇒ <code>Promise</code>


* * *

<a name="balena.settings.get"></a>

### settings.get([key]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>settings</code>](#balena.settings)  
**Summary**: Get a single setting. **Only implemented in Node.js**  
**Access**: public  
**Fulfil**: <code>\*</code> - setting value  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[key]</td><td><code>String</code></td><td><p>setting key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.settings.get('apiUrl').then(function(apiUrl) {
	console.log(apiUrl);
});
```

* * *

<a name="balena.settings.getAll"></a>

### settings.getAll() ⇒ <code>Promise</code>
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

* * *

