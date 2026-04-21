<a name="balena.auth"></a>

## .auth : <code>object</code>
**Kind**: static namespace  

* [.auth](#balena.auth) : <code>object</code>
    * [.authenticate(credentials)](#balena.auth.authenticate) ⇒ <code>Promise</code>
    * [.getActorId()](#balena.auth.getActorId) ⇒ <code>Promise</code>
    * [.getToken()](#balena.auth.getToken) ⇒ <code>Promise</code>
    * [.getUserInfo()](#balena.auth.getUserInfo) ⇒ <code>Promise</code>
    * [.isLoggedIn()](#balena.auth.isLoggedIn) ⇒ <code>Promise</code>
    * [.login(credentials)](#balena.auth.login) ⇒ <code>Promise</code>
    * [.loginWithToken(authToken)](#balena.auth.loginWithToken) ⇒ <code>Promise</code>
    * [.logout()](#balena.auth.logout) ⇒ <code>Promise</code>
    * [.register(credentials)](#balena.auth.register) ⇒ <code>Promise</code>
    * [.requestVerificationEmail()](#balena.auth.requestVerificationEmail) ⇒ <code>Promise</code>
    * [.verifyEmail(verificationPayload)](#balena.auth.verifyEmail) ⇒ <code>Promise</code>
    * [.whoami()](#balena.auth.whoami) ⇒ <code>Promise</code>
    * [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
        * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
        * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>
        * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
        * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
        * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
        * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
        * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>


* * *

<a name="balena.auth.authenticate"></a>

### auth.authenticate(credentials) ⇒ <code>Promise</code>
You should use [login](#balena.auth.login) when possible,
as it takes care of saving the token and email as well.

Notice that if `credentials` contains extra keys, they'll be discarted
by the server automatically.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Authenticate with the server  
**Access**: protected  
**Fulfil**: <code>String</code> - session token  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>credentials</td><td><code>Object</code></td><td><p>in the form of email, password</p>
</td>
    </tr><tr>
    <td>credentials.email</td><td><code>String</code></td><td><p>the email</p>
</td>
    </tr><tr>
    <td>credentials.password</td><td><code>String</code></td><td><p>the password</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.auth.authenticate(credentials).then(function(token) {
	console.log('My token is:', token);
});
```

* * *

<a name="balena.auth.getActorId"></a>

### auth.getActorId() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) or [loginWithToken](#balena.auth.loginWithToken) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in actor id  
**Access**: public  
**Fulfil**: <code>Number</code> - actor id  
**Example**  
```js
balena.auth.getActorId().then(function(actorId) {
	console.log(actorId);
});
```

* * *

<a name="balena.auth.getToken"></a>

### auth.getToken() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's raw API key or session token  
**Access**: public  
**Fulfil**: <code>String</code> - raw API key or session token  
**Example**  
```js
balena.auth.getToken().then(function(token) {
	console.log(token);
});
```

* * *

<a name="balena.auth.getUserInfo"></a>

### auth.getUserInfo() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Get current logged in user's info  
**Access**: public  
**Fulfil**: <code>Object</code> - user info  
**Example**  
```js
balena.auth.getUserInfo().then(function(userInfo) {
	console.log(userInfo);
});
```

* * *

<a name="balena.auth.isLoggedIn"></a>

### auth.isLoggedIn() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Check if you're logged in  
**Access**: public  
**Fulfil**: <code>Boolean</code> - is logged in  
**Example**  
```js
balena.auth.isLoggedIn().then(function(isLoggedIn) {
	if (isLoggedIn) {
		console.log('I\'m in!');
	} else {
		console.log('Too bad!');
	}
});
```

* * *

<a name="balena.auth.login"></a>

### auth.login(credentials) ⇒ <code>Promise</code>
If the login is successful, the token is persisted between sessions.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Login  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>credentials</td><td><code>Object</code></td><td><p>in the form of email, password</p>
</td>
    </tr><tr>
    <td>credentials.email</td><td><code>String</code></td><td><p>the email</p>
</td>
    </tr><tr>
    <td>credentials.password</td><td><code>String</code></td><td><p>the password</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.auth.login(credentials);
```

* * *

<a name="balena.auth.loginWithToken"></a>

### auth.loginWithToken(authToken) ⇒ <code>Promise</code>
Login to balena with a session token or api key instead of with credentials.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Login with a token or api key  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>authToken</td><td><code>String</code></td><td><p>the auth token</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.auth.loginWithToken(authToken);
```

* * *

<a name="balena.auth.logout"></a>

### auth.logout() ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Logout  
**Access**: public  
**Example**  
```js
balena.auth.logout();
```

* * *

<a name="balena.auth.register"></a>

### auth.register(credentials) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Register a user account  
**Access**: public  
**Fulfil**: <code>String</code> - session token  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>credentials</td><td><code>Object</code></td><td><p>in the form of username, password and email</p>
</td>
    </tr><tr>
    <td>credentials.email</td><td><code>String</code></td><td><p>the email</p>
</td>
    </tr><tr>
    <td>credentials.password</td><td><code>String</code></td><td><p>the password</p>
</td>
    </tr><tr>
    <td>[credentials.'g-recaptcha-response']</td><td><code>String</code> | <code>undefined</code></td><td><p>the captcha response</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.auth.register({
	email: 'johndoe@gmail.com',
	password: 'secret'
}).then(function(token) {
	console.log(token);
});
```

* * *

<a name="balena.auth.requestVerificationEmail"></a>

### auth.requestVerificationEmail() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Re-send verification email to the user  
**Access**: public  
**Example**  
```js
balena.auth.requestVerificationEmail().then(function() {
	console.log('Requesting verification email operation complete!');
})
```

* * *

<a name="balena.auth.verifyEmail"></a>

### auth.verifyEmail(verificationPayload) ⇒ <code>Promise</code>
**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Verifies an email  
**Access**: public  
**Fulfil**: <code>String</code> - session token  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>verificationPayload</td><td><code>Object</code></td><td><p>in the form of email, and token</p>
</td>
    </tr><tr>
    <td>verificationPayload.email</td><td><code>String</code></td><td><p>the email</p>
</td>
    </tr><tr>
    <td>verificationPayload.token</td><td><code>String</code></td><td><p>the verification token</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.auth.verifyEmail({
	email: 'johndoe@gmail.com',
	token: '5bb11d90eefb34a70318f06a43ef063f'
}).then(function(jwt) {
	console.log(jwt);
});
```

* * *

<a name="balena.auth.whoami"></a>

### auth.whoami() ⇒ <code>Promise</code>
This will only work if you used [login](#balena.auth.login) or [loginWithToken](#balena.auth.loginWithToken) to log in.

**Kind**: static method of [<code>auth</code>](#balena.auth)  
**Summary**: Return current logged in information  
**Access**: public  
**Fulfil**: <code>(Object\|undefined)</code> - actor information, if it exists  
**Example**  
```js
balena.auth.whoami().then(function(result) {
	if (!result) {
		console.log('I\'m not logged in!');
	} else {
		console.log('My result is:', result);
	}
});
```

* * *

<a name="balena.auth.twoFactor"></a>

### auth.twoFactor : <code>object</code>
**Kind**: static namespace of [<code>auth</code>](#balena.auth)  

* [.twoFactor](#balena.auth.twoFactor) : <code>object</code>
    * [.challenge(code)](#balena.auth.twoFactor.challenge) ⇒ <code>Promise</code>
    * [.disable(password)](#balena.auth.twoFactor.disable) ⇒ <code>Promise</code>
    * [.enable(code)](#balena.auth.twoFactor.enable) ⇒ <code>Promise</code>
    * [.getSetupKey()](#balena.auth.twoFactor.getSetupKey) ⇒ <code>Promise</code>
    * [.isEnabled()](#balena.auth.twoFactor.isEnabled) ⇒ <code>Promise</code>
    * [.isPassed()](#balena.auth.twoFactor.isPassed) ⇒ <code>Promise</code>
    * [.verify(code)](#balena.auth.twoFactor.verify) ⇒ <code>Promise</code>


* * *

<a name="balena.auth.twoFactor.challenge"></a>

#### twoFactor.challenge(code) ⇒ <code>Promise</code>
You should use [login](#balena.auth.login) when possible,
as it takes care of saving the token and email as well.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Challenge two factor authentication and complete login  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>code</td><td><code>String</code></td><td><p>code</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.auth.twoFactor.challenge('1234');
```

* * *

<a name="balena.auth.twoFactor.disable"></a>

#### twoFactor.disable(password) ⇒ <code>Promise</code>
Disables two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Disable two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>password</td><td><code>String</code></td><td><p>password</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const token = balena.auth.twoFactor.disable('1234');
balena.auth.loginWithToken(token);
```

* * *

<a name="balena.auth.twoFactor.enable"></a>

#### twoFactor.enable(code) ⇒ <code>Promise</code>
Enables two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Enable two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>code</td><td><code>String</code></td><td><p>code</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const token = balena.auth.twoFactor.enable('1234');
balena.auth.loginWithToken(token);
```

* * *

<a name="balena.auth.twoFactor.getSetupKey"></a>

#### twoFactor.getSetupKey() ⇒ <code>Promise</code>
Retrieves a setup key for enabling two factor authentication.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Get two factor authentication setup key  
**Access**: public  
**Fulfil**: <code>String</code> - setup key  
**Example**  
```js
const setupKey = balena.auth.twoFactor.getSetupKey();
console.log(setupKey);
```

* * *

<a name="balena.auth.twoFactor.isEnabled"></a>

#### twoFactor.isEnabled() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Check if two factor authentication is enabled  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa is enabled  
**Example**  
```js
balena.auth.twoFactor.isEnabled().then(function(isEnabled) {
	if (isEnabled) {
		console.log('2FA is enabled for this account');
	}
});
```

* * *

<a name="balena.auth.twoFactor.isPassed"></a>

#### twoFactor.isPassed() ⇒ <code>Promise</code>
**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Check if two factor authentication challenge was passed  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether 2fa challenge was passed  
**Example**  
```js
balena.auth.twoFactor.isPassed().then(function(isPassed) {
	if (isPassed) {
		console.log('2FA challenge passed');
	}
});
```

* * *

<a name="balena.auth.twoFactor.verify"></a>

#### twoFactor.verify(code) ⇒ <code>Promise</code>
Verifies two factor authentication.
Note that this method not update the token automatically.
You should use [challenge](#balena.auth.twoFactor.challenge) when possible,
as it takes care of that as well.

**Kind**: static method of [<code>twoFactor</code>](#balena.auth.twoFactor)  
**Summary**: Verify two factor authentication  
**Access**: public  
**Fulfil**: <code>String</code> - session token  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>code</td><td><code>String</code></td><td><p>code</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const token = balena.auth.twoFactor.verify('1234');
balena.auth.loginWithToken(token);
```

* * *

