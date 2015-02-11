Resin SDK
---------

[![npm version](https://badge.fury.io/js/resin-sdk.svg)](http://badge.fury.io/js/resin-sdk)
[![dependencies](https://david-dm.org/resin-io/resin-sdk.png)](https://david-dm.org/resin-io/resin.sdk.png)
[![Build Status](https://travis-ci.org/resin-io/resin-sdk.svg?branch=master)](https://travis-ci.org/resin-io/resin-sdk)

The SDK to make [Resin.io](https://resin.io/) powered JavaScript applications.

Installation
------------

Install the Resin SDK by running:

```sh
$ npm install --save resin-sdk
```

Platforms
---------

We currently only support NodeJS, but there are plans to make the SDK available in the browser as well.

Documentation
-------------

Open [doc/](https://github.com/resin-io/resin-sdk/blob/master/doc) in a web browser to view a detailed documentation of the capabilities offered by the SDK. Notice this is a work in progress and we plan to host the documentation online soon.

You can regenerate the documentation with:

```sh
$ gulp jsdoc
```

Tests
-----

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

In order to get a nice development workflow where every asset is recompiled automatically on every change, the tests and the linter is ran, run:

```sh
$ gulp watch
```

Documentation is regenerated when releasing a new version, so if you decide to contribute, you don't need to worry about that.

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/resin-sdk/issues/new) on GitHub.

License
-------

The project is licensed under the MIT license.
