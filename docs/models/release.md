<a name="balena.models.release"></a>

## .release : <code>object</code>
**Kind**: static namespace  

* [.release](#balena.models.release) : <code>object</code>
    * [.createFromUrl(slugOrUuidOrId, urlDeployOptions)](#balena.models.release.createFromUrl) ⇒ <code>Promise</code>
    * [.finalize(commitOrIdOrRawVersion)](#balena.models.release.finalize) ⇒ <code>Promise</code>
    * [.get(commitOrIdOrRawVersion, [options])](#balena.models.release.get) ⇒ <code>Promise</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.getAllByApplication) ⇒ <code>Promise</code>
    * [.getLatestByApplication(slugOrUuidOrId, [options])](#balena.models.release.getLatestByApplication) ⇒ <code>Promise</code>
    * [.getWithImageDetails(commitOrIdOrRawVersion, [options])](#balena.models.release.getWithImageDetails) ⇒ <code>Promise</code>
    * [.setIsInvalidated(commitOrIdOrRawVersion, isInvalidated)](#balena.models.release.setIsInvalidated) ⇒ <code>Promise</code>
    * [.setKnownIssueList(commitOrIdOrRawVersion, knownIssueListOrNull)](#balena.models.release.setKnownIssueList) ⇒ <code>Promise</code>
    * [.setNote(commitOrIdOrRawVersion, noteOrNull)](#balena.models.release.setNote) ⇒ <code>Promise</code>
    * [.asset](#balena.models.release.asset) : <code>object</code>
        * [.download(id)](#balena.models.release.asset.download) ⇒ <code>Promise</code>
        * [.get(id, [options])](#balena.models.release.asset.get) ⇒ <code>Promise</code>
        * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.asset.getAllByRelease) ⇒ <code>Promise</code>
        * [.remove(id)](#balena.models.release.asset.remove) ⇒ <code>Promise</code>
        * [.upload(uploadParams, [options])](#balena.models.release.asset.upload) ⇒ <code>Promise</code>
    * [.tags](#balena.models.release.tags) : <code>object</code>
        * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
        * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
        * [.remove(commitOrIdOrRawVersion, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
        * [.set(commitOrIdOrRawVersion, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.release.createFromUrl"></a>

### release.createFromUrl(slugOrUuidOrId, urlDeployOptions) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Create a new release built from the source in the provided url  
**Access**: public  
**Fulfil**: <code>number</code> - release ID  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>urlDeployOptions</td><td><code>Object</code></td><td></td><td><p>builder options</p>
</td>
    </tr><tr>
    <td>urlDeployOptions.url</td><td><code>String</code></td><td></td><td><p>a url with a tarball of the project to build</p>
</td>
    </tr><tr>
    <td>[urlDeployOptions.shouldFlatten]</td><td><code>Boolean</code></td><td><code>true</code></td><td><p>Should be true when the tarball includes an extra root folder with all the content</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.createFromUrl('myorganization/myapp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	console.log(releaseId);
});
```
**Example**  
```js
balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	console.log(releaseId);
});
```

* * *

<a name="balena.models.release.finalize"></a>

### release.finalize(commitOrIdOrRawVersion) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Finalizes a draft release  
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
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.finalize(123).then(function() {
	console.log('finalized!');
});
```
**Example**  
```js
balena.models.release.finalize('7cf02a69e4d34c9da573914963cf54fd').then(function() {
	console.log('finalized!');
});
```
**Example**  
```js
balena.models.release.finalize({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log('finalized!');
});
```

* * *

<a name="balena.models.release.get"></a>

### release.get(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release  
**Access**: public  
**Fulfil**: <code>Object</code> - release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.get(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.get('7cf02a69e4d34c9da573914963cf54fd').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.get({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log(release);
});
```

* * *

<a name="balena.models.release.getAllByApplication"></a>

### release.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get all releases from an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - releases  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.getAllByApplication('myorganization/myapp').then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getAllByApplication(123).then(function(releases) {
	console.log(releases);
});
```

* * *

<a name="balena.models.release.getLatestByApplication"></a>

### release.getLatestByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get the latest successful release for an application  
**Access**: public  
**Fulfil**: <code>Object\|undefined</code> - release  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.getLatestByApplication('myorganization/myapp').then(function(releases) {
	console.log(releases);
});
```
**Example**  
```js
balena.models.release.getLatestByApplication(123).then(function(releases) {
	console.log(releases);
});
```

* * *

<a name="balena.models.release.getWithImageDetails"></a>

### release.getWithImageDetails(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
This method does not map exactly to the underlying model: it runs a
larger prebuilt query, and reformats it into an easy to use and
understand format. If you want significantly more control, or to see the
raw model directly, use `release.get(id, options)` instead.

**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Get a specific release with the details of the images built  
**Access**: public  
**Fulfil**: <code>Object</code> - release with image details  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>a map of extra pine options</p>
</td>
    </tr><tr>
    <td>[options.release]</td><td><code>Boolean</code></td><td><code>{}</code></td><td><p>extra pine options for releases</p>
</td>
    </tr><tr>
    <td>[options.image]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options for images</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.getWithImageDetails(123).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails('7cf02a69e4d34c9da573914963cf54fd').then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log(release);
});
```
**Example**  
```js
balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
.then(function(release) {
	console.log(release.images[0].build_log);
});
```

* * *

<a name="balena.models.release.setIsInvalidated"></a>

### release.setIsInvalidated(commitOrIdOrRawVersion, isInvalidated) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Set the is_invalidated property of a release to true or false  
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
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>isInvalidated</td><td><code>Boolean</code></td><td><p>boolean value, true for invalidated, false for validated</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.setIsInvalidated(123, true).then(function() {
	console.log('invalidated!');
});
```
**Example**  
```js
balena.models.release.setIsInvalidated('7cf02a69e4d34c9da573914963cf54fd', true).then(function() {
	console.log('invalidated!');
});
```
**Example**  
```js
balena.models.release.setIsInvalidated({application: 456, raw_version: '0.0.0'}).then(function(release) {
	console.log('invalidated!);
});
```
**Example**  
```js
balena.models.release.setIsInvalidated(123, false).then(function() {
	console.log('validated!');
});
```
**Example**  
```js
balena.models.release.setIsInvalidated('7cf02a69e4d34c9da573914963cf54fd', false).then(function() {
	console.log('validated!');
});
```

* * *

<a name="balena.models.release.setKnownIssueList"></a>

### release.setKnownIssueList(commitOrIdOrRawVersion, knownIssueListOrNull) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Add a known issue list to a release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>knownIssueListOrNull</td><td><code>String</code> | <code>null</code></td><td><p>the known issue list</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.setKnownIssueList('7cf02a69e4d34c9da573914963cf54fd', 'This is an issue');
```
**Example**  
```js
balena.models.release.setKnownIssueList(123, 'This is an issue');
```
**Example**  
```js
balena.models.release.setKnownIssueList({application: 456, rawVersion: '0.0.0'}, 'This is an issue');
```

* * *

<a name="balena.models.release.setNote"></a>

### release.setNote(commitOrIdOrRawVersion, noteOrNull) ⇒ <code>Promise</code>
**Kind**: static method of [<code>release</code>](#balena.models.release)  
**Summary**: Add a note to a release  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>noteOrNull</td><td><code>String</code> | <code>null</code></td><td><p>the note</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.setNote('7cf02a69e4d34c9da573914963cf54fd', 'My useful note');
```
**Example**  
```js
balena.models.release.setNote(123, 'My useful note');
```
**Example**  
```js
balena.models.release.setNote({ application: 456, rawVersion: '0.0.0' }, 'My useful note');
```

* * *

<a name="balena.models.release.asset"></a>

### release.asset : <code>object</code>
**Kind**: static namespace of [<code>release</code>](#balena.models.release)  

* [.asset](#balena.models.release.asset) : <code>object</code>
    * [.download(id)](#balena.models.release.asset.download) ⇒ <code>Promise</code>
    * [.get(id, [options])](#balena.models.release.asset.get) ⇒ <code>Promise</code>
    * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.asset.getAllByRelease) ⇒ <code>Promise</code>
    * [.remove(id)](#balena.models.release.asset.remove) ⇒ <code>Promise</code>
    * [.upload(uploadParams, [options])](#balena.models.release.asset.upload) ⇒ <code>Promise</code>


* * *

<a name="balena.models.release.asset.download"></a>

#### asset.download(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Download a release asset  
**Access**: public  
**Fulfil**: <code>NodeJS.ReadableStream</code> - download stream  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code> | <code>Object</code></td><td><p>release asset ID or object specifying the unique release &amp; asset_key pair</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.asset.download(123).then(function(stream) {
	stream.pipe(fs.createWriteStream('logo.png'));
});
```
**Example**  
```js
balena.models.release.asset.download({
	asset_key: 'logo.png',
	release: 123
}).then(function(stream) {
	stream.pipe(fs.createWriteStream('logo.png'));
});
```

* * *

<a name="balena.models.release.asset.get"></a>

#### asset.get(id, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Get a specific release asset  
**Access**: public  
**Fulfil**: <code>Object</code> - release asset  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code> | <code>Object</code></td><td></td><td><p>release asset ID or object specifying the unique release &amp; asset_key pair</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.asset.get(123).then(function(asset) {
	console.log(asset);
});
```
**Example**  
```js
balena.models.release.asset.get({
	asset_key: 'logo.png',
	release: 123
}).then(function(asset) {
	console.log(asset);
});
```

* * *

<a name="balena.models.release.asset.getAllByRelease"></a>

#### asset.getAllByRelease(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Get all release assets for a release  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release assets  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.asset.getAllByRelease(123).then(function(assets) {
	console.log(assets);
});
```
**Example**  
```js
balena.models.release.asset.getAllByRelease('7cf02a69e4d34c9da573914963cf54fd').then(function(assets) {
	console.log(assets);
});
```
**Example**  
```js
balena.models.release.asset.getAllByRelease({ application: 456, raw_version: '1.2.3' }).then(function(assets) {
	console.log(assets);
});
```

* * *

<a name="balena.models.release.asset.remove"></a>

#### asset.remove(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Remove a release asset  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>Number</code> | <code>Object</code></td><td><p>release asset ID or object specifying the unique release &amp; asset_key pair</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.asset.remove(123);
```
**Example**  
```js
balena.models.release.asset.remove({
	asset_key: 'logo.png',
	release: 123
});
```

* * *

<a name="balena.models.release.asset.upload"></a>

#### asset.upload(uploadParams, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>asset</code>](#balena.models.release.asset)  
**Summary**: Upload a release asset  
**Access**: public  
**Fulfil**: <code>Object</code> - uploaded release asset  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>uploadParams</td><td><code>Object</code></td><td></td><td><p>upload parameters</p>
</td>
    </tr><tr>
    <td>uploadParams.asset</td><td><code>String</code> | <code>File</code></td><td></td><td><p>asset file path (string, Node.js only) or File object (Node.js &amp; browser). For File objects, use new File([content], filename, {type: mimeType})</p>
</td>
    </tr><tr>
    <td>uploadParams.asset_key</td><td><code>String</code></td><td></td><td><p>unique key for the asset within the release</p>
</td>
    </tr><tr>
    <td>uploadParams.release</td><td><code>Number</code></td><td></td><td><p>release ID</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>upload options</p>
</td>
    </tr><tr>
    <td>[options.chunkSize]</td><td><code>Number</code></td><td><code>5242880</code></td><td><p>chunk size for multipart uploads (5MiB default)</p>
</td>
    </tr><tr>
    <td>[options.parallelUploads]</td><td><code>Number</code></td><td><code>5</code></td><td><p>number of parallel uploads for multipart</p>
</td>
    </tr><tr>
    <td>[options.overwrite]</td><td><code>Boolean</code></td><td><code>false</code></td><td><p>whether to overwrite existing asset</p>
</td>
    </tr><tr>
    <td>[options.onUploadProgress]</td><td><code>function</code></td><td></td><td><p>callback for upload progress</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Upload from file path (Node.js)
balena.models.release.asset.upload({
	asset: '/path/to/logo.png',
	asset_key: 'logo.png',
	release: 123
}).then(function(asset) {
	console.log('Asset uploaded:', asset);
});
```
**Example**  
```js
// Upload with File API (Node.js and browser)
const content = Buffer.from('Hello, World!', 'utf-8');
const file = new File([content], 'readme.txt', { type: 'text/plain' });

balena.models.release.asset.upload({
	asset: file,
	asset_key: 'readme.txt',
	release: 123
}).then(function(asset) {
	console.log('Asset uploaded:', asset);
});
```
**Example**  
```js
// Upload large file with File API and progress tracking
const largeContent = new Uint8Array(10 * 1024 * 1024); // 10MB
const largeFile = new File([largeContent], 'data.bin', { type: 'application/octet-stream' });

balena.models.release.asset.upload({
	asset: largeFile,
	asset_key: 'data.bin',
	release: 123
}, {
	chunkSize: 5 * 1024 * 1024, // 5MB chunks
	parallelUploads: 3,
	onUploadProgress: function(progress) {
		const percent = (progress.uploaded / progress.total * 100).toFixed(2);
		console.log(`Upload progress: ${percent}%`);
	}
}).then(function(asset) {
	console.log('Large file uploaded:', asset);
});
```
**Example**  
```js
// Browser: Upload file from input element
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0]; // File object from input

balena.models.release.asset.upload({
	asset: file,
	asset_key: file.name,
	release: 123
}).then(function(asset) {
	console.log('File uploaded from browser:', asset);
});
```
**Example**  
```js
// Upload with overwrite option
balena.models.release.asset.upload({
	asset: '/path/to/logo.png',
	asset_key: 'logo.png',
	release: 123
}, {
	overwrite: true
}).then(function(asset) {
	console.log('Asset uploaded/updated:', asset);
});
```

* * *

<a name="balena.models.release.tags"></a>

### release.tags : <code>object</code>
**Kind**: static namespace of [<code>release</code>](#balena.models.release)  

* [.tags](#balena.models.release.tags) : <code>object</code>
    * [.getAllByApplication(slugOrUuidOrId, [options])](#balena.models.release.tags.getAllByApplication) ⇒ <code>Promise</code>
    * [.getAllByRelease(commitOrIdOrRawVersion, [options])](#balena.models.release.tags.getAllByRelease) ⇒ <code>Promise</code>
    * [.remove(commitOrIdOrRawVersion, tagKey)](#balena.models.release.tags.remove) ⇒ <code>Promise</code>
    * [.set(commitOrIdOrRawVersion, tagKey, value)](#balena.models.release.tags.set) ⇒ <code>Promise</code>


* * *

<a name="balena.models.release.tags.getAllByApplication"></a>

#### tags.getAllByApplication(slugOrUuidOrId, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for an application  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>slugOrUuidOrId</td><td><code>String</code> | <code>Number</code></td><td></td><td><p>application slug (string), uuid (string) or id (number)</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
	console.log(tags);
});
```

* * *

<a name="balena.models.release.tags.getAllByRelease"></a>

#### tags.getAllByRelease(commitOrIdOrRawVersion, [options]) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Get all release tags for a release  
**Access**: public  
**Fulfil**: <code>Object[]</code> - release tags  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>[options]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>extra pine options to use</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.tags.getAllByRelease(123).then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease('7cf02a69e4d34c9da573914963cf54fd').then(function(tags) {
	console.log(tags);
});
```
**Example**  
```js
balena.models.release.tags.getAllByRelease({application: 456, rawVersion: '0.0.0'}).then(function(tags) {
	console.log(tags);
});
```

* * *

<a name="balena.models.release.tags.remove"></a>

#### tags.remove(commitOrIdOrRawVersion, tagKey) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Remove a release tag  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>tagKey</td><td><code>String</code></td><td><p>tag key</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.tags.remove(123, 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove('7cf02a69e4d34c9da573914963cf54fd', 'EDITOR');
```
**Example**  
```js
balena.models.release.tags.remove({application: 456, rawVersion: '0.0.0'}, 'EDITOR');
```

* * *

<a name="balena.models.release.tags.set"></a>

#### tags.set(commitOrIdOrRawVersion, tagKey, value) ⇒ <code>Promise</code>
**Kind**: static method of [<code>tags</code>](#balena.models.release.tags)  
**Summary**: Set a release tag  
**Access**: public  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitOrIdOrRawVersion</td><td><code>String</code> | <code>Number</code> | <code>Object</code></td><td><p>release commit (string) or id (number) or an object with the unique <code>application</code> (number or string) &amp; <code>rawVersion</code> (string) pair of the release</p>
</td>
    </tr><tr>
    <td>tagKey</td><td><code>String</code></td><td><p>tag key</p>
</td>
    </tr><tr>
    <td>value</td><td><code>String</code> | <code>undefined</code></td><td><p>tag value</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
balena.models.release.tags.set(123, 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set('7cf02a69e4d34c9da573914963cf54fd', 'EDITOR', 'vim');
```
**Example**  
```js
balena.models.release.tags.set({application: 456, rawVersion: '0.0.0'}, 'EDITOR', 'vim');
```

* * *

