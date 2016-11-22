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

**Note.** This module expects [`fetch`](https://developer.mozilla.org/en/docs/Web/API/Fetch_API)
and [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
to be available in the global scope.
The easiest way to get `fetch` is to use `isomorphic-fetch` npm module.

Documentation
-------------

We generate JSDoc markdown documentation in [DOCUMENTATION.md](https://github.com/resin-io/resin-sdk/blob/master/DOCUMENTATION.md).

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
