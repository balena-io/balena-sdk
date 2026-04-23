# request
balena.request : <code>Object</code>

The balena-request instance used internally. This should not be necessary
in normal usage, but can be useful if you want to make an API request directly,
using the same token and hooks as the SDK.

**Kind**: static member  
**Summary**: Balena request instance  
**Access**: public  
**Example**  
```js
balena.request.send({ url: 'http://api.balena-cloud.com/ping' });
```

* * *

