<a name="balena.models.organization"></a>

## .organization : <code>object</code>
**Kind**: static namespace  

* [.organization](#balena.models.organization) : <code>object</code>
    * [.create(options)](#balena.models.organization.create) ⇒ <code>Promise</code>
    * [.get(handleOrId, [options])](#balena.models.organization.get) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.organization.getAll) ⇒ <code>Promise</code>
    * [.remove(handleOrId)](#balena.models.organization.remove) ⇒ <code>Promise</code>
    * [.invite](#balena.models.organization.invite) : <code>object</code>
        * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
        * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
        * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
        * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>
    * [.membership](#balena.models.organization.membership) : <code>object</code>
        * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
        * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
        * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
        * [.getAllByUser(usernameOrId, [options])](#balena.models.organization.membership.getAllByUser) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>


* * *

<a name="balena.models.organization.create"></a>

### organization.create(options) ⇒ <code>Promise</code>
This method creates a new organization with the current user as an administrator.

**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Creates a new organization  
**Access**: public  
**Fulfil**: <code>String</code> - Organization  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>Object</code></td><td><p>Organization parameters to use.</p>
</td>
    </tr><tr>
    <td>options.name</td><td><code>String</code></td><td><p>Required: the name of the organization that will be created.</p>
</td>
    </tr><tr>
    <td>[options.handle]</td><td><code>String</code></td><td><p>The handle of the organization that will be created.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.create({ name:'MyOrganization' }).then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.create({
  name:'MyOrganization',
  logo_image: new File(
    imageContent,
    'img.jpeg'
  );
})
.then(function(organization) {
  console.log(organization);
});
```

* * *

<a name="balena.models.organization.get"></a>

### organization.get(handleOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Get a single organization  
**Access**: public  
**Fulfil**: <code>Object</code> - organization  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>handleOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>organization handle (string) or id (number).</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.get('myorganization').then(function(organization) {
	console.log(organization);
});
```
**Example**  
```js
balena.models.organization.get(123).then(function(organization) {
	console.log(organization);
});
```

* * *

<a name="balena.models.organization.getAll"></a>

### organization.getAll([options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Get all Organizations  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organizations  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.getAll().then(function(organizations) {
	console.log(organizations);
});
```

* * *

<a name="balena.models.organization.remove"></a>

### organization.remove(handleOrId) ⇒ <code>Promise</code>
**Kind**: static method of [<code>organization</code>](#balena.models.organization)  
**Summary**: Remove an Organization  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>handleOrId</td><td><code>String</code> | <code>Number</code></td><td><p>organization handle (string) or id (number).</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.remove(123);
```

* * *

<a name="balena.models.organization.invite"></a>

### organization.invite : <code>object</code>
**Kind**: static namespace of [<code>organization</code>](#balena.models.organization)  

* [.invite](#balena.models.organization.invite) : <code>object</code>
    * [.accept(invitationToken)](#balena.models.organization.invite.accept) ⇒ <code>Promise</code>
    * [.create(handleOrId, options, [message])](#balena.models.organization.invite.create) ⇒ <code>Promise</code>
    * [.getAll([options])](#balena.models.organization.invite.getAll) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.invite.getAllByOrganization) ⇒ <code>Promise</code>
    * [.revoke(id)](#balena.models.organization.invite.revoke) ⇒ <code>Promise</code>


* * *

<a name="balena.models.organization.invite.accept"></a>

#### invite.accept(invitationToken) ⇒ <code>Promise</code>
This method adds the calling user to the organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Accepts an invite  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>invitationToken</td><td><code>String</code></td><td><p>invite token</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.invite.accept("qwerty-invitation-token");
```

* * *

<a name="balena.models.organization.invite.create"></a>

#### invite.create(handleOrId, options, [message]) ⇒ <code>Promise</code>
This method invites a user by their email to an organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Creates a new invite for an organization  
**Access**: public  
**Fulfil**: <code>String</code> - organization invite  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>handleOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>organization handle (string), or id (number)</p>
</td>
    </tr><tr>
    <td>options</td><td><code>Object</code></td><td></td><td><p>invite creation parameters</p>
</td>
    </tr><tr>
    <td>options.invitee</td><td><code>String</code></td><td></td><td><p>the email of the invitee</p>
</td>
    </tr><tr>
    <td>[options.roleName]</td><td><code>String</code></td><td><code>&quot;developer&quot;</code></td><td><p>the role name to be granted to the invitee</p>
</td>
    </tr><tr>
    <td>[message]</td><td><code>String</code></td><td><code></code></td><td><p>the message to send along with the invite</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.invite.create('MyOrg', { invitee: "invitee@example.org", roleName: "developer", message: "join my org" }).then(function(invite) {
	console.log(invite);
});
```

* * *

<a name="balena.models.organization.invite.getAll"></a>

#### invite.getAll([options]) ⇒ <code>Promise</code>
This method returns all invites.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Get all invites  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.invite.getAll().then(function(invites) {
	console.log(invites);
});
```

* * *

<a name="balena.models.organization.invite.getAllByOrganization"></a>

#### invite.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all invites for a specific organization.

**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Get all invites by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - invites  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>handleOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>organization handle (string), or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.invite.getAllByOrganization('MyOrg').then(function(invites) {
	console.log(invites);
});
```
**Example**  
```js
balena.models.organization.invite.getAllByOrganization(123).then(function(invites) {
	console.log(invites);
});
```

* * *

<a name="balena.models.organization.invite.revoke"></a>

#### invite.revoke(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>invite</code>](#balena.models.organization.invite)  
**Summary**: Revoke an invite  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>organization invite id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.invite.revoke(123);
```

* * *

<a name="balena.models.organization.membership"></a>

### organization.membership : <code>object</code>
**Kind**: static namespace of [<code>organization</code>](#balena.models.organization)  

* [.membership](#balena.models.organization.membership) : <code>object</code>
    * [.changeRole(idOrUniqueKey, roleName)](#balena.models.organization.membership.changeRole) ⇒ <code>Promise</code>
    * [.get(membershipId, [options])](#balena.models.organization.membership.get) ⇒ <code>Promise</code>
    * [.getAllByOrganization(handleOrId, [options])](#balena.models.organization.membership.getAllByOrganization) ⇒ <code>Promise</code>
    * [.getAllByUser(usernameOrId, [options])](#balena.models.organization.membership.getAllByUser) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.organization.membership.remove) ⇒ <code>Promise</code>


* * *

<a name="balena.models.organization.membership.changeRole"></a>

#### membership.changeRole(idOrUniqueKey, roleName) ⇒ <code>Promise</code>
This method changes the role of an organization member.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Changes the role of an organization member  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>idOrUniqueKey</td><td><code>Number</code> | <code>Object</code></td><td><p>the id or an object with the unique <code>user</code> &amp; <code>is_member_of__organization</code> numeric pair of the membership that will be changed</p>
</td>
    </tr><tr>
    <td>roleName</td><td><code>String</code></td><td><p>the role name to be granted to the membership</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.membership.changeRole(123, "member").then(function() {
	console.log('OK');
});
```
**Example**  
```js
balena.models.organization.membership.changeRole({
	user: 123,
	is_member_of__organization: 125,
}, "member").then(function() {
	console.log('OK');
});
```

* * *

<a name="balena.models.organization.membership.get"></a>

#### membership.get(membershipId, [options]) ⇒ <code>Promise</code>
This method returns a single organization membership.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get a single organization membership  
**Access**: public  
**Fulfil**: <code>Object</code> - organization membership  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>membershipId</td><td><code>number</code> | <code>Object</code></td><td></td><td><p>the id or an object with the unique <code>user</code> &amp; <code>is_member_of__organization</code> numeric pair of the membership</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.membership.get(5).then(function(memberships) {
	console.log(memberships);
});
```

* * *

<a name="balena.models.organization.membership.getAllByOrganization"></a>

#### membership.getAllByOrganization(handleOrId, [options]) ⇒ <code>Promise</code>
This method returns all organization memberships for a specific organization.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get all memberships by organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organization memberships  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>handleOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>organization handle (string) or id (number).</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.membership.getAllByOrganization('MyOrg').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAllByOrganization(123).then(function(memberships) {
	console.log(memberships);
});
```

* * *

<a name="balena.models.organization.membership.getAllByUser"></a>

#### membership.getAllByUser(usernameOrId, [options]) ⇒ <code>Promise</code>
This method returns all organization memberships for a specific user.

**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Get all memberships by user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - organization memberships  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>usernameOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>the user&#39;s username (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.membership.getAllByUser('balena_os').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.organization.membership.getAllByUser(123).then(function(memberships) {
	console.log(memberships);
});
```

* * *

<a name="balena.models.organization.membership.remove"></a>

#### membership.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>membership</code>](#balena.models.organization.membership)  
**Summary**: Remove a membership  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code></td><td><p>organization membership id</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.organization.membership.remove(123);
```
**Example**  
```js
balena.models.organization.membership.remove({
	user: 123,
	is_member_of__application: 125,
});
```

* * *

