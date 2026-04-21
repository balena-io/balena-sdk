<a name="balena.interceptors"></a>

## .interceptors : <code>Array.&lt;Interceptor&gt;</code>
The current array of interceptors to use. Interceptors intercept requests made
internally and are executed in the order they appear in this array for requests,
and in the reverse order for responses.

**Kind**: static member  
**Summary**: Array of interceptors  
**Access**: public  
**Example**  
```js
balena.interceptors.push({
	responseError: function (error) {
		console.log(error);
		throw error;
	})
});
```

* * *

<a name="balena.interceptors.Interceptor"></a>

### interceptors.Interceptor : <code>object</code>
An interceptor implements some set of the four interception hook callbacks.
To continue processing, each function should return a value or a promise that
successfully resolves to a value.

To halt processing, each function should throw an error or return a promise that
rejects with an error.

**Kind**: static typedef of [<code>interceptors</code>](#balena.interceptors)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[request]</td><td><code>function</code></td><td><p>Callback invoked before requests are made. Called with
the request options, should return (or resolve to) new request options, or throw/reject.</p>
</td>
    </tr><tr>
    <td>[response]</td><td><code>function</code></td><td><p>Callback invoked before responses are returned. Called with
the response, should return (or resolve to) a new response, or throw/reject.</p>
</td>
    </tr><tr>
    <td>[requestError]</td><td><code>function</code></td><td><p>Callback invoked if an error happens before a request.
Called with the error itself, caused by a preceeding request interceptor rejecting/throwing
an error for the request, or a failing in preflight token validation. Should return (or resolve
to) new request options, or throw/reject.</p>
</td>
    </tr><tr>
    <td>[responseError]</td><td><code>function</code></td><td><p>Callback invoked if an error happens in the response.
Called with the error itself, caused by a preceeding response interceptor rejecting/throwing
an error for the request, a network error, or an error response from the server. Should return
(or resolve to) a new response, or throw/reject.</p>
</td>
    </tr>  </tbody>
</table>


* * *

