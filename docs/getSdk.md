# getSdk
<code>module:balena-sdk~getSdk()</code>

The module exports a single factory function.

**Kind**: inner function  
**Summary**: Creates a new SDK instance using the default or the provided options.  
**Example**  
```js
// with es6 imports
import { getSdk } from 'balena-sdk';
// or with node require
const { getSdk } = require('balena-sdk');

const balena = getSdk({
	apiUrl: "https://api.balena-cloud.com/",
	dataDirectory: "/opt/local/balena"
});
```

* * *

