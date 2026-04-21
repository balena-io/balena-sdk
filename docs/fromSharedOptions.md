# fromSharedOptions
<code>module:balena-sdk~fromSharedOptions()</code>

Create an SDK instance using shared default options set using the `setSharedOptions()` method.
If options have not been set using this method, then this method will use the
same defaults as the main SDK factory function.

**Kind**: inner function  
**Summary**: Create an SDK instance using shared default options  
**Access**: public  
**Example**  
```js
import { fromSharedOptions } from 'balena-sdk';
const sdk = fromSharedOptions();
```

* * *

