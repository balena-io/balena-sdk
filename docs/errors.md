# errors
balena.errors : <code>Object</code>

The balena-errors module used internally. This is provided primarily for
convenience, and to avoid the necessity for separate balena-errors
dependencies. You'll want to use this if you need to match on the specific
type of error thrown by the SDK.

**Kind**: static member  
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

* * *

