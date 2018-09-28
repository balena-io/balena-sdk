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

We currently support NodeJS (6+) and the browser.

The following features are node-only:
- OS image streaming download (`resin.models.os.download`),
- resin settings client (`resin.settings`).

In Node you can simply `require('resin-sdk')`, but in the browser things are more complicated. Resin-SDK provides a bundled single file for browsers, which allows you to include a single file with all dependencies included, available as [resin-browser.min.js](https://unpkg.com/resin-sdk/build/resin-browser.min.js) (or [resin-browser.js](https://unpkg.com/resin-sdk/build/resin-browser.js) if you'd like the much larger unminified version). This uses the [UMD format](https://github.com/umdjs/umd), and will register itself as either a CommonJS or AMD module called `resin-sdk` if possible, or create a `resinSdk` global if not.

### Bundling for browsers

If you're using webpack, browserify, or a similar tool then you probably want to bundle the Resin SDK into your application yourself, rather than using the pre-built `resin-browser.js` bundle. If you do that, you should be aware that you may pick up some dependencies that are actually unnecessary in the browser, because they're only used in Node environments. You can safely exclude these dependencies, if you're not using them yourself, and significantly reduce the size of your resulting bundle.

In the browser Resin-SDK doesn't use the following dependencies:

* fs
* path
* resin-settings-client
* node-localstorage

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

Run the test suite by doing:

```sh
$ npm test
```

### API Url

You can, optionally, set the `RESINTEST_API_URL` environment variable in order to run the tests using a different API backend (eg: `https://api.resinstaging.io`).

### Billing

In order to test the billing methods for a paid account, you have to configure the following environment variables:

- `RESINTEST_PAID_EMAIL`: The email of the paid account.
- `RESINTEST_PAID_PASSWORD`: The password of the account.

*Note: The paid user's `account billing code` should be set to `testdev` so that it's tested against the proper plan.*

### Avoiding rate limiting errors

While developing you might end up in a situation that the API returns rate limiting errors.
That's probably caused by the new user signups that each run of the test suit does.
You can avoid those errors to some extend by specifying a pre-existing **empty** user account to run the suit against.
In order to do so, set the following environment variables for an account that exists and doesn't have a billing account code:  
**WARNING: This will delete all applications and public keys of the test user**

- `RESINTEST_EMAIL`: The test account email
- `RESINTEST_PASSWORD`: The test account password
- `RESINTEST_USERNAME`: The test account username.

### Persisting ENV configuration

You can persist these settings by putting them all into a `.env` file in the root of this repo, in
[dotenv](https://www.npmjs.com/package/dotenv) format (`KEY=VALUE\n`). This will be automatically detected and used in the tests.
Make sure you don't accidentally commit this file (`.env` by default is gitignored, so hopefully this should be difficult).


Contribute
----------

- Issue Tracker: [github.com/resin-io/resin-sdk/issues](https://github.com/resin-io/resin-sdk/issues)
- Source Code: [github.com/resin-io/resin-sdk](https://github.com/resin-io/resin-sdk)

Before submitting a PR, please make sure that you include tests, and that the linter runs without any warning:

```sh
$ npm run lint
```

License
-------

The project is licensed under the Apache 2.0 license.
