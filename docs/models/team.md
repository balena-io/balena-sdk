# team
balena.models.team : <code>object</code>

**Kind**: static namespace  

* * *

## create
balena.models.team.create(organizationSlugOrId, name) ⇒ <code>Promise</code>

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
balena.models.team.get(teamId, [options]) ⇒ <code>Promise</code>

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
balena.models.team.getAllByOrganization(organizationSlugOrId, [options]) ⇒ <code>Promise</code>

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
balena.models.team.remove(teamId) ⇒ <code>Promise</code>

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
balena.models.team.rename(teamId, newName) ⇒ <code>Promise</code>

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
balena.models.team.applicationAccess : <code>object</code>

**Kind**: static namespace of [<code>team</code>](#balena.models.team)  

* * *

### get
balena.models.team.applicationAccess.get(teamApplicationAccessId, [options]) ⇒ <code>Promise</code>

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
balena.models.team.applicationAccess.getAllByTeam(teamId, [options]) ⇒ <code>Promise</code>

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
balena.models.team.applicationAccess.remove(teamApplicationAccessId) ⇒ <code>Promise</code>

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
balena.models.team.applicationAccess.update(teamApplicationAccessId, roleName) ⇒ <code>Promise</code>

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

