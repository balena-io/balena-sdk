Resin SDK
=========

> The official JavaScript [Resin.io](https://resin.io/) SDK.

[![npm version](https://badge.fury.io/js/resin-sdk.svg)](http://badge.fury.io/js/resin-sdk)
[![dependencies](https://david-dm.org/resin-io/resin-sdk.svg)](https://david-dm.org/resin-io/resin.sdk.svg)
[![Build Status](https://travis-ci.org/resin-io/resin-sdk.svg?branch=master)](https://travis-ci.org/resin-io/resin-sdk)
[![Build status](https://ci.appveyor.com/api/projects/status/qbsivehgnq0vyrrb/branch/master?svg=true)](https://ci.appveyor.com/project/resin-io/resin-sdk/branch/master)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/resin-io/chat)

Role
----

The intention of this module is to provide developers a nice API to integrate their JavaScript applications with Resin.io.

Installation
------------

Install the Resin SDK by running:

```sh
$ npm install --save resin-sdk
```

Platforms
---------

We currently support NodeJS and the browser.
The following features are node-only:
- OS image streaming download (`resin.models.os.download`),
- resin settings client (`resin.settings`).

In Node you can simply `require('resin-sdk')`, but in the browser things are more complicated. Resin-SDK provides a bundled single file for browsers, which allows you to include a single file with all dependencies included, available as [build/resin-browser.min.js](build/resin-browser.min.js) (or [build/resin-browser.js](build/resin-browser.js) if you'd like the much larger unminified version). This uses the [UMD format](https://github.com/umdjs/umd), and will register itself as either a CommonJS or AMD module called `resin-sdk` if possible, or create a `resinSdk` global if not.

### Bundling for browsers

If you're using webpack, browserify, or a similar tool then you probably want to bundle the Resin SDK into your application yourself, rather than using the pre-built `resin-browser.js` bundle. If you do that, you should be aware that you may pick up some dependencies that are actually unnecessary in the browser, because they're only used in Node environments. You can safely exclude these dependencies, if you're not using them yourself, and significantly reduce the size of your resulting bundle.

In the browser Resin-SDK doesn't use the following dependencies:

* fs
* path
* resin-settings-client
* node-localstorage
* rindle
* zlib
* progress-stream

For the future we're looking at ways to automatically exclude these in downstream bundles. See [#254](https://github.com/resin-io/resin-sdk/issues/254) for more information.

Documentation
-------------

The module exports a single factory function. Use it like this:

```
var resin = require('resin-sdk')({
	apiUrl: "https://api.resin.io/",
	dataDirectory: "/opt/local/resin"
})
```

Where the factory method accepts the following options:
* `apiUrl`, string, *optional*, is the resin.io API url. Defaults to `https://api.resin.io/`,
* `apiVersion`, string, *optional*, is the version of the API to talk to, like `v2`. Defaults to the current stable version: `v2`,
* `apiKey`, string, *optional*, is the API key to make the requests with,
* `imageMakerUrl`, string, *optional*, is the resin.io image maker url. Defaults to `https://img.resin.io/`,
* `dataDirectory`, string, *optional*, *ignored in the browser*, is the directory where the user settings are stored, normally retrieved like `require('resin-settings-client').get('dataDirectory')`. Defaults to `$HOME/.resin`,
* `isBrowser`, boolean, *optional*, is the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value,
* `debug`, boolean, *optional*, when set will print some extra debug information.

See the JSDoc markdown documentation for the returned `resin` object in [DOCUMENTATION.md](https://github.com/resin-io/resin-sdk/blob/master/DOCUMENTATION.md).

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/resin-sdk/issues/new) on GitHub and the Resin.io team will be happy to help.

Tests
-----

In order to run the Resin SDK test suite, set the following environment variables from an account that exists:  
**WARNING: This will delete all applications and public keys of the test user**

- `RESINTEST_EMAIL`: The main account email
- `RESINTEST_PASSWORD`: The main account password
- `RESINTEST_USERNAME`: The main account username.
- `RESINTEST_USERID`: The main account user id.

You also have to provide the following environment variables from an account that doesn't yet exists:

- `RESINTEST_REGISTER_EMAIL`: The email of the account to register.
- `RESINTEST_REGISTER_PASSWORD`: The password of the account to register.
- `RESINTEST_REGISTER_USERNAME`: The username of the account to register.

Run the test suite by doing:

```sh
$ gulp test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io/resin-sdk/issues](https://github.com/resin-io/resin-sdk/issues)
- Source Code: [github.com/resin-io/resin-sdk](https://github.com/resin-io/resin-sdk)

Before submitting a PR, please make sure that you include tests, and that [coffeelint](http://www.coffeelint.org/) runs without any warning:

```sh
$ gulp lint
```

License
-------

The project is licensed under the Apache 2.0 license.
