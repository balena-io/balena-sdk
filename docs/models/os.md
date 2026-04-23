# os
balena.models.os : <code>object</code>

**Kind**: static namespace  

* * *

## download
balena.models.os.download(options) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Download an OS image  
**Access**: public  
**Fulfil**: <code>ReadableStream</code> - download stream  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>Object</code></td><td></td><td><p>OS image options to use.</p>
</td>
    </tr><tr>
    <td>options.deviceType</td><td><code>String</code></td><td></td><td><p>device type slug</p>
</td>
    </tr><tr>
    <td>[options.version]</td><td><code>String</code></td><td><code>&#x27;latest&#x27;</code></td><td><p>semver-compatible version or &#39;latest&#39;, defaults to &#39;latest&#39;
Unsupported (unpublished) version will result in rejection.
The version <strong>must</strong> be the exact version number.</p>
</td>
    </tr><tr>
    <td>[options.developmentMode]</td><td><code>Boolean</code></td><td></td><td><p>controls development mode for unified balenaOS releases.</p>
</td>
    </tr><tr>
    <td>[options.appId]</td><td><code>Number</code></td><td></td><td><p>the application ID (number).</p>
</td>
    </tr><tr>
    <td>[options.fileType]</td><td><code>String</code></td><td></td><td><p>download file type. One of &#39;.img&#39; or &#39;.zip&#39; or &#39;.gz&#39;.</p>
</td>
    </tr><tr>
    <td>[options.imageType]</td><td><code>String</code></td><td></td><td><p>download file type. One of &#39;raw&#39; or &#39;flasher&#39;</p>
</td>
    </tr><tr>
    <td>[options.appUpdatePollInterval]</td><td><code>Number</code></td><td></td><td><p>how often the OS checks for updates, in minutes.</p>
</td>
    </tr><tr>
    <td>[options.network]</td><td><code>String</code></td><td></td><td><p>the network type that the device will use, one of &#39;ethernet&#39; or &#39;wifi&#39;.</p>
</td>
    </tr><tr>
    <td>[options.wifiKey]</td><td><code>String</code></td><td></td><td><p>the key for the wifi network the device will connect to if network is wifi.</p>
</td>
    </tr><tr>
    <td>[options.wifiSsid]</td><td><code>String</code></td><td></td><td><p>the ssid for the wifi network the device will connect to if network is wifi.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.download({deviceType: 'raspberry-pi'}).then(function(stream) {
	stream.pipe(fs.createWriteStream('foo/bar/image.img'));
});
```

* * *

## getAllOsVersions
balena.models.os.getAllOsVersions(deviceTypes, [options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get all OS versions for the provided device type(s), inlcuding invalidated ones  
**Access**: public  
**Fulfil**: <code>Object[]\|Object</code> - An array of OsVersion objects when a single device type slug is provided,
or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypes</td><td><code>String</code> | <code>Array.&lt;String&gt;</code></td><td></td><td><p>device type slug or array of slugs</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getAllOsVersions('raspberrypi3');
```
**Example**  
```js
balena.models.os.getAllOsVersions(['fincm3', 'raspberrypi3']);
```
**Example**  
```js
balena.models.os.getAllOsVersions(['fincm3', 'raspberrypi3'], { $filter: { is_invalidated: false } });
```

* * *

## getAvailableOsVersions
balena.models.os.getAvailableOsVersions(deviceTypes, [pineOptions], [extraOptions]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the supported OS versions for the provided device type(s)  
**Access**: public  
**Fulfil**: <code>Object[]\|Object</code> - An array of OsVersion objects when a single device type slug is provided,
or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceTypes</td><td><code>String</code> | <code>Array.&lt;String&gt;</code></td><td></td><td><p>device type slug or array of slugs</p>
</td>
    </tr><tr>
    <td>[pineOptions]</td><td><code>Object</code></td><td></td><td><p>Extra pine options to use</p>
</td>
    </tr><tr>
    <td>[extraOptions]</td><td><code>Object</code></td><td></td><td><p>Extra convenience options to use</p>
</td>
    </tr><tr>
    <td>[extraOptions.includeDraft]</td><td><code>Boolean</code></td><td><code>false</code></td><td><p>Whether pre-releases should be included in the results</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getAvailableOsVersions('raspberrypi3');
```
**Example**  
```js
balena.models.os.getAvailableOsVersions(['fincm3', 'raspberrypi3']);
```

* * *

## getConfig
balena.models.os.getConfig(slugOrUuidOrId, options) ⇒ <code>Promise</code>

Builds the config.json for a device in the given application, with the given
options.

Note that an OS version is required. For versions < 2.7.8, config
generation is only supported when using a session token, not an API key.

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get an applications config.json  
**Access**: public  
**Fulfil**: <code>Object</code> - application configuration as a JSON object.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application slug (string), uuid (string) or id (number).</p>
</td>
    </tr><tr>
    <td>options</td><td><code>Object</code></td><td></td><td><p>OS configuration options to use.</p>
</td>
    </tr><tr>
    <td>options.version</td><td><code>String</code></td><td></td><td><p>Required: the OS version of the image.</p>
</td>
    </tr><tr>
    <td>[options.network]</td><td><code>String</code></td><td><code>&#x27;ethernet&#x27;</code></td><td><p>The network type that
the device will use, one of &#39;ethernet&#39; or &#39;wifi&#39;.</p>
</td>
    </tr><tr>
    <td>[options.appUpdatePollInterval]</td><td><code>Number</code></td><td></td><td><p>How often the OS checks
for updates, in minutes.</p>
</td>
    </tr><tr>
    <td>[options.provisioningKeyName]</td><td><code>String</code></td><td></td><td><p>Name assigned to API key</p>
</td>
    </tr><tr>
    <td>[options.provisioningKeyExpiryDate]</td><td><code>String</code></td><td></td><td><p>Expiry Date assigned to API key</p>
</td>
    </tr><tr>
    <td>[options.developmentMode]</td><td><code>Boolean</code></td><td></td><td><p>Controls development mode for unified balenaOS releases.</p>
</td>
    </tr><tr>
    <td>[options.wifiKey]</td><td><code>String</code></td><td></td><td><p>The key for the wifi network the
device will connect to.</p>
</td>
    </tr><tr>
    <td>[options.wifiSsid]</td><td><code>String</code></td><td></td><td><p>The ssid for the wifi network the
device will connect to.</p>
</td>
    </tr><tr>
    <td>[options.ip]</td><td><code>String</code></td><td></td><td><p>static ip address.</p>
</td>
    </tr><tr>
    <td>[options.gateway]</td><td><code>String</code></td><td></td><td><p>static ip gateway.</p>
</td>
    </tr><tr>
    <td>[options.netmask]</td><td><code>String</code></td><td></td><td><p>static ip netmask.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getConfig('myorganization/myapp', { version: '2.12.7+rev1.prod' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});

balena.models.os.getConfig(123, { version: '2.12.7+rev1.prod' }).then(function(config) {
	fs.writeFile('foo/bar/config.json', JSON.stringify(config));
});
```

* * *

## getDownloadSize
balena.models.os.getDownloadSize(deviceType, [version]) ⇒ <code>Promise</code>

**Note!** Currently only the raw (uncompressed) size is reported.

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get OS download size estimate  
**Access**: public  
**Fulfil**: <code>Number</code> - OS image download size, in bytes.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr><tr>
    <td>[version]</td><td><code>String</code></td><td><p>semver-compatible version or &#39;latest&#39;, defaults to &#39;latest&#39;.
The version <strong>must</strong> be the exact version number.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getDownloadSize('raspberry-pi').then(function(size) {
	console.log('The OS download size for raspberry-pi', size);
});
```

* * *

## getMaxSatisfyingVersion
balena.models.os.getMaxSatisfyingVersion(deviceType, versionOrRange, [osType]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Get the max OS version satisfying the given range  
**Access**: public  
**Fulfil**: <code>String\|null</code> - the version number, or `null` if no matching versions are found  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr><tr>
    <td>versionOrRange</td><td><code>String</code></td><td><p>can be one of</p>
<ul>
<li>the exact version number,
in which case it is returned if the version is supported,
or <code>null</code> is returned otherwise,</li>
<li>a <a href="https://www.npmjs.com/package/semver">semver</a>-compatible
range specification, in which case the most recent satisfying version is returned
if it exists, or <code>null</code> is returned,</li>
<li><code>&#39;latest&#39;</code> in which case the most recent version is returned, excluding pre-releases,
Defaults to <code>&#39;latest&#39;</code>.</li>
</ul>
</td>
    </tr><tr>
    <td>[osType]</td><td><code>String</code></td><td><p>can be one of &#39;default&#39;, &#39;esr&#39; or null to include all types</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getMaxSatisfyingVersion('raspberry-pi', '^2.11.0').then(function(version) {
	console.log(version);
});
```

* * *

## getOsUpdateType
balena.models.os.getOsUpdateType(deviceType, currentVersion, targetVersion) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the OS update type based on device type, current and target balenaOS versions  
**Access**: public  
**Fulfil**: <code>String</code> - Currently available types are:
  - resinhup11
  - resinhup12
  - balenahup
	 - takeover

 Throws error in any of these cases:
  - Current or target versions are invalid
  - Current or target versions do not match in dev/prod type
  - Current and target versions imply a downgrade operation
  - Action is not supported by device type  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr><tr>
    <td>currentVersion</td><td><code>String</code></td><td><p>semver-compatible version for the starting OS version</p>
</td>
    </tr><tr>
    <td>targetVersion</td><td><code>String</code></td><td><p>semver-compatible version for the target OS version</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getOsUpdateType('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(osUpdateType) {
	console.log(osUpdateType);
});
```

* * *

## getSupervisorReleasesForCpuArchitecture
balena.models.os.getSupervisorReleasesForCpuArchitecture(cpuArchitectureSlugOrId, [options]) ⇒ <code>Promise.&lt;String&gt;</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the Releases of the supervisor for the CPU Architecture  
**Returns**: <code>Promise.&lt;String&gt;</code> - - An array of Release objects that can be used to manage a device as supervisors.  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>cpuArchitectureSlugOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>The slug (string) or id (number) for the CPU Architecture</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const results = balena.models.os.getSupervisorReleasesForCpuArchitecture('aarch64');

const [result] = balena.models.os.getSupervisorReleasesForCpuArchitecture(
	'aarch64',
	{ $filter: { raw_version: '12.11.0' } },
);

const [result] = balena.models.os.getSupervisorReleasesForCpuArchitecture(
	'aarch64',
	{
			$select: ['id', 'raw_version', 'known_issue_list', 'created_at', 'contract'],
			$expand: {
				release_image: {
					$select: 'id',
					$expand: {
						image: {
							$select: 'is_stored_at__image_location',
						},
					},
				},
			},
		$filter: { raw_version: '12.11.0' }
	},
);
```

* * *

## getSupportedOsUpdateVersions
balena.models.os.getSupportedOsUpdateVersions(deviceType, currentVersion, [options]) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns the supported OS update targets for the provided device type  
**Access**: public  
**Fulfil**: <code>Object[]\|Object</code> - An array of OsVersion objects when a single device type slug is provided,
or a dictionary of OsVersion objects by device type slug when an array of device type slugs is provided.  
**Fulfil**: <code>Object</code> - the versions information, of the following structure:
* versions - an array of strings,
containing exact version numbers that OS update is supported
* recommended - the recommended version, i.e. the most recent version
that is _not_ pre-release, can be `null`
* current - the provided current version after normalization  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td></td><td><p>device type slug</p>
</td>
    </tr><tr>
    <td>currentVersion</td><td><code>String</code></td><td></td><td><p>semver-compatible version for the starting OS version</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td></td><td><p>Extra options to filter the OS releases by</p>
</td>
    </tr><tr>
    <td>[options.includeDraft]</td><td><code>Boolean</code></td><td><code>false</code></td><td><p>Whether pre-releases should be included in the results</p>
</td>
    </tr><tr>
    <td>[options.osType]</td><td><code>String</code> | <code>null</code></td><td><code></code></td><td><p>Can be one of &#39;default&#39;, &#39;esr&#39; or null which includes all types</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.getSupportedOsUpdateVersions('raspberry-pi', '2.9.6+rev2.prod').then(function(isSupported) {
	console.log(isSupported);
});
```

* * *

## isArchitectureCompatibleWith
balena.models.os.isArchitectureCompatibleWith(osArchitecture, applicationArchitecture) ⇒ <code>Boolean</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns whether the specified OS architecture is compatible with the target architecture  
**Returns**: <code>Boolean</code> - - Whether the specified OS architecture is capable of running
applications build for the target architecture  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>osArchitecture</td><td><code>String</code></td><td><p>The OS&#39;s architecture as specified in its device type</p>
</td>
    </tr><tr>
    <td>applicationArchitecture</td><td><code>String</code></td><td><p>The application&#39;s architecture as specified in its device type</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const result1 = balena.models.os.isArchitectureCompatibleWith('aarch64', 'armv7hf');
console.log(result1);

const result2 = balena.models.os.isArchitectureCompatibleWith('armv7hf', 'amd64');
console.log(result2);
```

* * *

## isSupportedOsUpdate
balena.models.os.isSupportedOsUpdate(deviceType, currentVersion, targetVersion) ⇒ <code>Promise</code>

**Kind**: static method of [<code>os</code>](#balena.models.os)  
**Summary**: Returns whether the provided device type supports OS updates between the provided balenaOS versions  
**Access**: public  
**Fulfil**: <code>Boolean</code> - whether upgrading the OS to the target version is supported  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>deviceType</td><td><code>String</code></td><td><p>device type slug</p>
</td>
    </tr><tr>
    <td>currentVersion</td><td><code>String</code></td><td><p>semver-compatible version for the starting OS version</p>
</td>
    </tr><tr>
    <td>targetVersion</td><td><code>String</code></td><td><p>semver-compatible version for the target OS version</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.os.isSupportedOsUpgrade('raspberry-pi', '2.9.6+rev2.prod', '2.29.2+rev1.prod').then(function(isSupported) {
	console.log(isSupported);
});
```

* * *

