# team
<code>balena.models.team</code> : <code>object</code>

**Kind**: static namespace  

* * *

## create
<code>balena.models.team.create(organizationSlugOrId, name)</code> ⇒ <code>Promise</code>

This method creates a new team.

**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Creates a new Team  
**Access**: public  
**Fulfil**: <code>Object</code> - Team  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organizationSlugOrId</td><td><code>Number</code></td><td><p>Required: the organization slug or id the team will be part of.</p>
</td>
    </tr><tr>
    <td>name</td><td><code>String</code></td><td><p>Required: the name of the team that will be created.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.create(1239948, 'MyTeam').then(function(team) {
	console.log(team);
});
```
**Example**  
```js
balena.models.team.create('myOrgHandle', 'MyTeam')
.then(function(team) {
  console.log(team);
});
```

* * *

## get
<code>balena.models.team.get(teamId, [options])</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Get a single Team  
**Access**: public  
**Fulfil**: <code>Object</code> - Team  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamId</td><td><code>Number</code></td><td></td><td><p>team id (number).</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.get(123).then(function(team) {
	console.log(team);
});
```

* * *

## getAllByOrganization
<code>balena.models.team.getAllByOrganization(organizationSlugOrId, [options])</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Get all Teams of a specific Organization  
**Access**: public  
**Fulfil**: <code>Object[]</code> - Teams  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>organizationSlugOrId</td><td><code>Number</code></td><td></td><td><p>Required: the organization slug or id the team is part of.</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.getAllByOrganization(123).then(function(teams) {
	console.log(teams);
});
```
**Example**  
```js
balena.models.team.getAllByOrganization('MyOrganizationHandle').then(function(teams) {
	console.log(teams);
});
```

* * *

## remove
<code>balena.models.team.remove(teamId)</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Remove a Team  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamId</td><td><code>Number</code></td><td><p>team id (number).</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.remove(123);
```

* * *

## rename
<code>balena.models.team.rename(teamId, newName)</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>team</code>](#balena.models.team)  
**Summary**: Rename Team  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamId</td><td><code>Number</code></td><td><p>team id (number)</p>
</td>
    </tr><tr>
    <td>newName</td><td><code>String</code></td><td><p>new team name (string)</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.rename(123, 'MyNewTeamName');
```

* * *

## applicationAccess
<code>balena.models.team.applicationAccess</code> : <code>object</code>

**Kind**: static namespace of [<code>team</code>](#balena.models.team)  

* * *

### get
<code>balena.models.team.applicationAccess.get(teamApplicationAccessId, [options])</code> ⇒ <code>Promise</code>

This method get specific team application access.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Get team applications access  
**Access**: public  
**Fulfil**: <code>Object</code> - TeamApplicationAccess  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamApplicationAccessId</td><td><code>Number</code></td><td></td><td><p>Required: the team application access id.</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.applicationAccess.get(1239948).then(function(teamApplicationAccess) {
	console.log(teamApplicationAccess);
});
```

* * *

### getAllByTeam
<code>balena.models.team.applicationAccess.getAllByTeam(teamId, [options])</code> ⇒ <code>Promise</code>

This method get all team application access.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Get all team applications access  
**Access**: public  
**Fulfil**: <code>Object[]</code> - team application access  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamId</td><td><code>Number</code></td><td></td><td><p>Required: the team id.</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.applicationAccess.getAllByTeam(1239948).then(function(teamApplicationAccesses) {
	console.log(teamApplicationAccesses);
});
```

* * *

### remove
<code>balena.models.team.applicationAccess.remove(teamApplicationAccessId)</code> ⇒ <code>Promise</code>

This remove a team application access.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Remove team application access  
**Access**: public  
**Fulfil**: <code>void</code>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamApplicationAccessId</td><td><code>Number</code></td><td><p>Required: the team application access id.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.remove(123).then(function(teams) {
	console.log(teams);
});
```

* * *

### update
<code>balena.models.team.applicationAccess.update(teamApplicationAccessId, roleName)</code> ⇒ <code>Promise</code>

This method update a team application access role.

**Kind**: static method of [<code>applicationAccess</code>](#balena.models.team.applicationAccess)  
**Summary**: Update team application access  
**Access**: public  
**Fulfil**: <code>Object</code> - TeamApplicationAccess  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamApplicationAccessId</td><td><code>Number</code></td><td><p>Required: the team application access id.</p>
</td>
    </tr><tr>
    <td>roleName</td><td><code>String</code></td><td><p>Required: The new role to assing (ApplicationMembershipRoles).</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.update(123, 'developer').then(function(teamApplicationAccess) {
	console.log(teamApplicationAccess);
});
```

* * *

## membership
<code>balena.models.team.membership</code> : <code>object</code>

**Kind**: static namespace of [<code>team</code>](#balena.models.team)  

* * *

### create
<code>balena.models.team.membership.create(options)</code> ⇒ <code>Promise</code>

This method adds a user to a team by their username.

**Kind**: static method of [<code>membership</code>](#balena.models.team.membership)  
**Summary**: Creates a new membership for a team  
**Access**: public  
**Fulfil**: <code>Object</code> - team membership  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>Object</code></td><td><p>membership creation parameters</p>
</td>
    </tr><tr>
    <td>options.team</td><td><code>Number</code></td><td><p>team id</p>
</td>
    </tr><tr>
    <td>options.username</td><td><code>String</code></td><td><p>the username of the balena user that will become a member</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.membership.create({ team: 123, username: "user123" }).then(function(membership) {
	console.log(membership);
});
```

* * *

### get
<code>balena.models.team.membership.get(membershipId, [options])</code> ⇒ <code>Promise</code>

This method returns a single team membership.

**Kind**: static method of [<code>membership</code>](#balena.models.team.membership)  
**Summary**: Get a single team membership  
**Access**: public  
**Fulfil**: <code>Object</code> - team membership  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>membershipId</td><td><code>Number</code></td><td></td><td><p>the team membership id</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.membership.get(5).then(function(membership) {
	console.log(membership);
});
```

* * *

### getAllByTeam
<code>balena.models.team.membership.getAllByTeam(teamId, [options])</code> ⇒ <code>Promise</code>

This method returns all team memberships for a specific team.

**Kind**: static method of [<code>membership</code>](#balena.models.team.membership)  
**Summary**: Get all memberships by team  
**Access**: public  
**Fulfil**: <code>Object[]</code> - team memberships  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>teamId</td><td><code>Number</code></td><td></td><td><p>the team id</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.membership.getAllByTeam(123).then(function(memberships) {
	console.log(memberships);
});
```

* * *

### getAllByUser
<code>balena.models.team.membership.getAllByUser(usernameOrId, [options])</code> ⇒ <code>Promise</code>

This method returns all team memberships for a specific user.

**Kind**: static method of [<code>membership</code>](#balena.models.team.membership)  
**Summary**: Get all memberships by user  
**Access**: public  
**Fulfil**: <code>Object[]</code> - team memberships  
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
balena.models.team.membership.getAllByUser('balena_os').then(function(memberships) {
	console.log(memberships);
});
```
**Example**  
```js
balena.models.team.membership.getAllByUser(123).then(function(memberships) {
	console.log(memberships);
});
```

* * *

### remove
<code>balena.models.team.membership.remove(idOrIds)</code> ⇒ <code>Promise</code>

**Kind**: static method of [<code>membership</code>](#balena.models.team.membership)  
**Summary**: Remove a team membership  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>idOrIds</td><td><code>Number</code> | <code>Array.&lt;Number&gt;</code></td><td><p>team membership id or array of team membership ids</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.team.membership.remove(123);
```
**Example**  
```js
balena.models.team.membership.remove([123, 456]);
```

* * *

