# pine
balena.pine : <code>Object</code>

The pinejs-client instance used internally. This should not be necessary
in normal usage, but can be useful if you want to directly make pine
queries to the api for some resource that isn't directly supported
in the SDK.

**Kind**: static member  
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

* * *

