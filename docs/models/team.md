<a name="balena.models.team"></a>

## .team : <code>object</code>
**Kind**: static namespace  

* [.team](#balena.models.team) : <code>object</code>
    * [.create(organizationSlugOrId, name)](#balena.models.team.create) ⇒ <code>Promise</code>
    * [.get(teamId, [options])](#balena.models.team.get) ⇒ <code>Promise</code>
    * [.getAllByOrganization(organizationSlugOrId, [options])](#balena.models.team.getAllByOrganization) ⇒ <code>Promise</code>
    * [.remove(teamId)](#balena.models.team.remove) ⇒ <code>Promise</code>
    * [.rename(teamId, newName)](#balena.models.team.rename) ⇒ <code>Promise</code>
    * [.applicationAccess](#balena.models.team.applicationAccess) : <code>object</code>
        * [.get(teamApplicationAccessId, [options])](#balena.models.team.applicationAccess.get) ⇒ <code>Promise</code>
        * [.getAllByTeam(teamId, [options])](#balena.models.team.applicationAccess.getAllByTeam) ⇒ <code>Promise</code>
        * [.remove(teamApplicationAccessId)](#balena.models.team.applicationAccess.remove) ⇒ <code>Promise</code>
        * [.update(teamApplicationAccessId, roleName)](#balena.models.team.applicationAccess.update) ⇒ <code>Promise</code>


* * *

<a name="balena.models.team.create"></a>

### team.create(organizationSlugOrId, name) ⇒ <code>Promise</code>
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

<a name="balena.models.team.get"></a>

### team.get(teamId, [options]) ⇒ <code>Promise</code>
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

<a name="balena.models.team.getAllByOrganization"></a>

### team.getAllByOrganization(organizationSlugOrId, [options]) ⇒ <code>Promise</code>
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

<a name="balena.models.team.remove"></a>

### team.remove(teamId) ⇒ <code>Promise</code>
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

<a name="balena.models.team.rename"></a>

### team.rename(teamId, newName) ⇒ <code>Promise</code>
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

<a name="balena.models.team.applicationAccess"></a>

### team.applicationAccess : <code>object</code>
**Kind**: static namespace of [<code>team</code>](#balena.models.team)  

* [.applicationAccess](#balena.models.team.applicationAccess) : <code>object</code>
    * [.get(teamApplicationAccessId, [options])](#balena.models.team.applicationAccess.get) ⇒ <code>Promise</code>
    * [.getAllByTeam(teamId, [options])](#balena.models.team.applicationAccess.getAllByTeam) ⇒ <code>Promise</code>
    * [.remove(teamApplicationAccessId)](#balena.models.team.applicationAccess.remove) ⇒ <code>Promise</code>
    * [.update(teamApplicationAccessId, roleName)](#balena.models.team.applicationAccess.update) ⇒ <code>Promise</code>


* * *

<a name="balena.models.team.applicationAccess.get"></a>

#### applicationAccess.get(teamApplicationAccessId, [options]) ⇒ <code>Promise</code>
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

<a name="balena.models.team.applicationAccess.getAllByTeam"></a>

#### applicationAccess.getAllByTeam(teamId, [options]) ⇒ <code>Promise</code>
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

<a name="balena.models.team.applicationAccess.remove"></a>

#### applicationAccess.remove(teamApplicationAccessId) ⇒ <code>Promise</code>
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

<a name="balena.models.team.applicationAccess.update"></a>

#### applicationAccess.update(teamApplicationAccessId, roleName) ⇒ <code>Promise</code>
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

