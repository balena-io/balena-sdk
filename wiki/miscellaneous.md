# Miscellaneous

## Functions

<dl>
<dt><a href="#listImagesFromTargetState">listImagesFromTargetState(targetState)</a> ⇒</dt>
<dd></dd>
</dl>

## listImagesFromTargetState
listImagesFromTargetState(targetState) ⇒

**Kind**: global function  
**Returns**: array containing all images for all services for all releases for all apps for the device  
<table>
  <thead>
    <tr>
      <th>Param</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>targetState</td>
    </tr>  </tbody>
</table>


* * *

## fromSharedOptions
module:balena-sdk~fromSharedOptions()

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

## getSdk
module:balena-sdk~getSdk()

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

## setSharedOptions
module:balena-sdk~setSharedOptions(options)

Set options that are used by calls to `fromSharedOptions()`.
The options accepted are the same as those used in the main SDK factory function.
If you use this method, it should be called as soon as possible during app
startup and before any calls to `fromSharedOptions()` are made.

**Kind**: inner function  
**Summary**: Set shared default options  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>Object</code></td><td></td><td><p>The shared default options</p>
</td>
    </tr><tr>
    <td>[options.apiUrl]</td><td><code>String</code></td><td><code>&#x27;https://api.balena-cloud.com/&#x27;</code></td><td><p>the balena API url to use.</p>
</td>
    </tr><tr>
    <td>[options.builderUrl]</td><td><code>String</code></td><td><code>&#x27;https://builder.balena-cloud.com/&#x27;</code></td><td><p>the balena builder url to use.</p>
</td>
    </tr><tr>
    <td>[options.deviceUrlsBase]</td><td><code>String</code></td><td><code>&#x27;balena-devices.com&#x27;</code></td><td><p>the base balena device API url to use.</p>
</td>
    </tr><tr>
    <td>[options.requestLimit]</td><td><code>Number</code></td><td></td><td><p>the number of requests per requestLimitInterval that the SDK should respect.</p>
</td>
    </tr><tr>
    <td>[options.requestLimitInterval]</td><td><code>Number</code></td><td><code>60000</code></td><td><p>the timespan that the requestLimit should apply to in milliseconds, defaults to 60000 (1 minute).</p>
</td>
    </tr><tr>
    <td>[options.retryRateLimitedRequests]</td><td><code>Boolean</code> | <code>function</code></td><td><code>false</code></td><td><p>Determines whether to automatically retry requests that are failing with a 429 Too Many Requests status code and that include a numeric Retry-After response header.</p>
<ul>
<li>If <code>false</code>, rate-limited requests will not be retried, and the rate limit error will be propagated.</li>
<li>If <code>true</code>, all rate-limited requests will be retried after the duration specified by the <code>Retry-After</code> header.</li>
<li>If a function <code>(retryAfterMs: number) =&gt; boolean</code> is provided, it will be called with the retry duration in ms and the request will be retried only when <code>true</code> is returned.</li>
</ul>
</td>
    </tr><tr>
    <td>[options.dataDirectory]</td><td><code>String</code> | <code>False</code></td><td><code>&#x27;$HOME/.balena&#x27;</code></td><td><p><em>ignored in the browser unless false</em>, the directory where the user settings are stored, normally retrieved like <code>require(&#39;balena-settings-client&#39;).get(&#39;dataDirectory&#39;)</code>. Providing <code>false</code> creates an isolated in-memory instance.</p>
</td>
    </tr><tr>
    <td>[options.isBrowser]</td><td><code>Boolean</code></td><td></td><td><p>the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global <code>window</code> value.</p>
</td>
    </tr><tr>
    <td>[options.debug]</td><td><code>Boolean</code></td><td></td><td><p>when set will print some extra debug information.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
import { setSharedOptions } from 'balena-sdk';
setSharedOptions({
	apiUrl: 'https://api.balena-cloud.com/',
	builderUrl: 'https://builder.balena-cloud.com/',
	isBrowser: true,
});
```

* * *

