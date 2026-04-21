<a name="balena.logs"></a>

## .logs : <code>object</code>
**Kind**: static namespace  

* [.logs](#balena.logs) : <code>object</code>
    * [.history(uuidOrId, [options])](#balena.logs.history) ⇒ <code>Promise</code>
    * [.subscribe(uuidOrId, [options])](#balena.logs.subscribe) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
    * [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
        * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
        * ["error"](#balena.logs.LogSubscription.event_error)
        * ["line"](#balena.logs.LogSubscription.event_line)


* * *

<a name="balena.logs.history"></a>

### logs.history(uuidOrId, [options]) ⇒ <code>Promise</code>
Get an array of the latest log messages for a given device.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Get device logs history  
**Access**: public  
**Fulfil**: <code>Object[]</code> - history lines  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>options</p>
</td>
    </tr><tr>
    <td>[options.count]</td><td><code>Number</code> | <code>&#x27;all&#x27;</code></td><td><code>1000</code></td><td><p>number of log messages to return (or &#39;all&#39;)</p>
</td>
    </tr><tr>
    <td>[options.start]</td><td><code>Number</code> | <code>String</code></td><td></td><td><p>the timestamp or ISO Date string after which to retrieve historical messages</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.logs.history('7cf02a69e4d34c9da573914963cf54fd').then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.history(123).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
const oneDayAgoTimestamp = Date.now() - 24*60*60*1000;
balena.logs.history('7cf02a69e4d34c9da573914963cf54fd', { start: oneDayAgoTimestamp }).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
const oneDayAgoIsoDateString = new Date(Date.now() - 24*60*60*1000).toISOString();
balena.logs.history('7cf02a69e4d34c9da573914963cf54fd', { start: oneDayAgoIsoDateString }).then(function(lines) {
	lines.forEach(function(line) {
		console.log(line);
	});
});
```

* * *

<a name="balena.logs.subscribe"></a>

### logs.subscribe(uuidOrId, [options]) ⇒ <code>Promise.&lt;LogSubscription&gt;</code>
Connects to the stream of devices logs, returning a LogSubscription, which
can be used to listen for logs as they appear, line by line.

**Kind**: static method of [<code>logs</code>](#balena.logs)  
**Summary**: Subscribe to device logs  
**Access**: public  
**Fulfil**: [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>device uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>options</p>
</td>
    </tr><tr>
    <td>[options.count]</td><td><code>Number</code> | <code>&#x27;all&#x27;</code></td><td><code>0</code></td><td><p>number of historical messages to include (or &#39;all&#39;)</p>
</td>
    </tr><tr>
    <td>[options.start]</td><td><code>Number</code> | <code>String</code></td><td></td><td><p>the timestamp or ISO Date string after which to retrieve historical messages. When specified, the count parameter needs to also be provided.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.logs.subscribe('7cf02a69e4d34c9da573914963cf54fd').then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
});
```
**Example**  
```js
balena.logs.subscribe(123).then(function(logs) {
	logs.on('line', function(line) {
		console.log(line);
	});
});
```

* * *

<a name="balena.logs.LogSubscription"></a>

### logs.LogSubscription : <code>EventEmitter</code>
The log subscription emits events as log data arrives.
You can get a LogSubscription for a given device by calling `balena.logs.subscribe(deviceId)`

**Kind**: static typedef of [<code>logs</code>](#balena.logs)  

* [.LogSubscription](#balena.logs.LogSubscription) : <code>EventEmitter</code>
    * [.unsubscribe()](#balena.logs.LogSubscription.unsubscribe)
    * ["error"](#balena.logs.LogSubscription.event_error)
    * ["line"](#balena.logs.LogSubscription.event_line)


* * *

<a name="balena.logs.LogSubscription.unsubscribe"></a>

#### LogSubscription.unsubscribe()
Disconnect from the logs feed and stop receiving any future events on this emitter.

**Kind**: static method of [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Unsubscribe from device logs  
**Access**: public  
**Example**  
```js
logs.unsubscribe();
```

* * *

<a name="balena.logs.LogSubscription.event_error"></a>

#### "error"
**Kind**: event emitted by [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Event fired when an error has occured reading the device logs  
**Example**  
```js
logs.on('error', function(error) {
	console.error(error);
});
```

* * *

<a name="balena.logs.LogSubscription.event_line"></a>

#### "line"
**Kind**: event emitted by [<code>LogSubscription</code>](#balena.logs.LogSubscription)  
**Summary**: Event fired when a new line of log output is available  
**Example**  
```js
logs.on('line', function(line) {
	console.log(line);
});
```

* * *

