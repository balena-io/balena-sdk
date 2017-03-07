# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

- Ensure device/application.get (and related methods) return a clear error if given an undefined argument
- Ensure device/application.has returns false if passed undefined

## [6.0.0-beta4] - 2017-02-27

- Add `resin.models.environmentVariables.device.getAllByApplication`
- **Breaking!** Ensure all environmentVariables.device methods return names as `.name`, never `.env_var_name`

## [6.0.0-beta3] - 2017-02-24

### Changed

- Expose the internal resin-request and resin-token instances
- Corrected `environmentVariables.getAll` in documentation to `.getAllByApplication`
- Add support for hooks to intercept requests, responses, and errors.
- Deprecated `resin.models.application.getApiKey()` (use `.generateApiKey()` instead).
- **Breaking!** Removed the (already deprecated) `resin.models.device.restart()` method, in favor of `resin.models.device.restartApplication()`
- Add factory function defaults so all options are optional. Example: `require('resin-sdk')();`
- Allow device & application ids for all methods, in addition to device uuids & application names, if the argument is a number instead of a string.

## [6.0.0-beta2] - 2017-01-13

### Changed

- **Fixed** the issue with `resin-settings-client` not being installed in Node.js
- **Fixed** the issue with where the `settings.get('apiUrl')` was used instead of the provided option.

## [6.0.0-beta1] - 2017-01-11

### Changed

- **Breaking!** Changed `register()` to work with the new device registration flow. `register()` now return device registration information (`{ id: "...", uuid: "...", api_key: "..." }`), but not the full device object.
- **Breaking!** Changed `generateUUID()` to `generateUniqueKey()` to reflect that it should now be used for both generating a uuid and an api key.
- **Breaking!** The error message on timeout has changed from "timeout" to "operation timed out". In addition the error thrown is now a Bluebird Promise.TimeoutError, instead of a raw Error.
- Resin-SDK now works in a browser environment (experimental)
- UMD and UMD-minified builds are now available at `build/resin-browser.js` and `build/resin-browser.min.js`

## [5.4.0] - 2016-10-27

### Added

- Allow passing an optional `force` option to `resin.models.device.reboot()` and `resin.models.device.shutdown()`.

## [5.3.6] - 2016-09-26

### Changed

- Update pine filter expressions to avoid deprecation warnings.
- Return full uuid in `resin.models.device.getDeviceUrl()`.

## [5.3.5] - 2016-07-26

### Changed

- Upgrade `resin-device-logs` to v3.0.0.

## [5.3.4] - 2016-07-06

### Changed

- Make sure device functions expand shorter UUIDs before passing then to `pine`.

## [5.3.3] - 2016-06-15

### Changed

- Fix bug that caused `resin.models.device.move()` to not move devices referenced with shorter uuids.

## [5.3.2] - 2016-06-09

### Changed

- Increase HTTP timeout for requests that result in container actions.

## [5.3.1] - 2016-05-17

### Changed

- Fix a semver issue when checking the supervisor version on supervisor endpoints.

## [5.3.0] - 2016-04-26

### Added

- Implement `resin.models.device.getApplicationInfo()`.
- Implement `resin.models.device.startApplication()`.
- Implement `resin.models.device.stopApplication()`.
- Implement `resin.models.device.ping()`.
- Implement `resin.models.device.update()`.
- Implement `resin.models.device.shutdown()`.
- Implement `resin.models.device.purge()`.
- Implement `resin.models.device.enableTcpPing()`.
- Implement `resin.models.device.disableTcpPing()`.

### Changed

- Rename `resin.models.device.restart()` to `resin.models.device.restartApplication()`.
- Deprecate `resin.models.device.restart()`.

## [5.2.0] - 2016-02-29

### Added

- Support device type aliases.
- Implement `resin.models.build.getAllByApplication()`.
- Implement `resin.models.device.reboot()`.

### Changed

- Upgraded oudated dependencies.

## [5.1.0] - 2016-01-26

### Added

- Implement `resin.models.os.getLastModified()`.
- Implement `resin.models.device.getStatus()`.

### Changed

- Patch device types to be marked as ALPHA and BETA instead of PREVIEW and EXPERIMENTAL.
- Fix exception when fetching a device whose uuid only contains numbers.

## [5.0.1] - 2016-01-21

### Changed

- Upgrade `resin-request` to v4.0.0.

## [5.0.0] - 2016-01-20

### Added

- Implement integration tests.
- Support shorter uuids in all device functions.

### Changed

- Only return applications that belong to current user.
- Change license to Apache 2.0.
- Serve static unconfigured images.
- Ensure environment variable values are strings.

## [4.1.3] - 2015-11-24

- Upgrade `resin-device-logs` to v2.0.1.

## [4.1.2] - 2015-11-15

### Changed

- Fix bug in `resin.settings.getAll()` that caused the function to throw an error.

## [4.1.1] - 2015-11-12

### Changed

- Validate application device type before moving a device.

## [4.1.0] - 2015-11-11

### Added

- Implement `resin.models.device.move()`.

### Changed

- Port all documentation examples to JavaScript.

## [4.0.0] - 2015-10-21

### Added

- Implement `resin.auth.twoFactor.isEnabled()`.
- Implement `resin.auth.twoFactor.isPassed()`.
- Implement `resin.auth.twoFactor.challenge()`.

### Changed

- Require an `email` instead of `username` in `resin.auth.login()` and `resin.auth.authenticate()`.
- Support searching a device type slug by a slug.

## [3.0.0] - 2015-10-12

### Changed

- Make `resin.models.device.generateUUID()` async.

## [2.8.1] - 2015-10-12

### Changed

- Make `resin.models.config.getPubNubKeys()` and `resin.models.config.getMixpanelToken()` private.
- Fix `resin.models.device.generateUUID()` examples.

## [2.8.0] - 2015-09-24

### Added

- Implement `resin.models.device.restart()`.

## [2.7.3] - 2015-09-07

### Changed

- Upgrade Resin Settings Client to v3.1.0.

## [2.7.2] - 2015-09-07

### Changed

- Upgrade Resin Token to v2.4.2.

## [2.7.1] - 2015-09-07

### Changed

- Upgrade Resin Settings Client to v3.0.0.

## [2.7.0] - 2015-09-01

### Added

- Implement `resin.models.config.getMixpanelToken()`.

### Changed

- Reuse `resin-register-device` to provide device registration and uuid generation.

## [2.6.2] - 2015-08-28

### Changed

- Update Resin Request to v2.3.1.
- Fix bug that caused `authenticate()` to fail even with valid credentials.

## [2.6.1] - 2015-08-25

### Changed

- Update Resin Request to v2.3.0.

## [2.6.0] - 2015-08-25

### Added

- Implement `resin.models.config.getDeviceOptions()`.

### Changed

- Improve `resin.models.application.create()` documentation.

## [2.5.0] - 2015-08-24

### Added

- Set `RESIN` and `USER` as system environment variables.
- Make use of `@fulfil` and `@reject` JSDoc tags to document promises.

### Changed

- Upgrade Resin Request to v2.2.4.

## [2.4.1] - 2015-08-17

### Changed

- Upgrade Resin Settings Client to v2.1.0.
- Request GET /whoami to determine if a user is logged in `resin.auth.isLoggedIn()`.  
- Fix bug that caused device environment variables to not have a `name` property.

## [2.4.0] - 2015-08-10

### Added

- Implement `resin.models.device.getManifestByApplication()`.
- Implement `resin.models.device.register()`.
- Check that device/application exists before attempting to remove.

### Changed

- Fix environment variables documentation.
- Fix `resin.models.key.get()` `undefined` issue.
- Fix `resin.models.key.create()` bug that caused no key to be created.
- Fix `resin.models.application.create()` example issue with device slugs.
- Upgrade `resin-errors` to v2.0.0.
- Upgrade `resin-request` to v2.2.3.
- Upgrade `resin-token` to v2.4.1.

## [2.3.1] - 2015-07-29

### Changed

- Fix undefined Authorization header issue.
- Fix HTTP request body issue in auth module.

## [2.3.0] - 2015-07-27

### Added

- Refresh token in an interval.

### Removed

- Remove deprecated `device.register()`.

## [2.2.0] - 2015-07-03

### Added

- Implement `resin.models.device.getLocalIPAddresses()`.

## [2.1.0] - 2015-07-01

### Changed

- Upgrade `resin-settings-client` to v1.4.0.

## [2.0.0] - 2015-06-29

### Added

- Implement `resin.logs.history()`.
- Implement `resin.models.device.register()`.
- Implement `resin.settings`.
- Start making use of a CHANGELOG.
- Improve unit testing.
- Add promise support.
- Check that a device exists before attempting `rename` operation.
- Reference devices by `uuid` instead of by name.
- Markdown JSDoc documentation in `DOCUMENTATION.md`.

### Changed

- Change interface and internal workings of `resin.logs.subscribe()`.
- "get all" functions now return an empty array if no resources instead of yielding an error.
- Update JSDoc annotations to use promises.

### Removed

- Remove HTML generated JSDoc documentation.

[6.0.0-beta4]: https://github.com/resin-io/resin-sdk/compare/v6.0.0-beta3...v6.0.0-beta4
[6.0.0-beta3]: https://github.com/resin-io/resin-sdk/compare/v6.0.0-beta2...v6.0.0-beta3
[6.0.0-beta2]: https://github.com/resin-io/resin-sdk/compare/v6.0.0-beta1...v6.0.0-beta2
[6.0.0-beta1]: https://github.com/resin-io/resin-sdk/compare/v5.4.0...v6.0.0-beta1
[5.4.0]: https://github.com/resin-io/resin-sdk/compare/v5.3.6...v5.4.0
[5.3.6]: https://github.com/resin-io/resin-sdk/compare/v5.3.5...v5.3.6
[5.3.5]: https://github.com/resin-io/resin-sdk/compare/v5.3.4...v5.3.5
[5.3.4]: https://github.com/resin-io/resin-sdk/compare/v5.3.3...v5.3.4
[5.3.3]: https://github.com/resin-io/resin-sdk/compare/v5.3.2...v5.3.3
[5.3.2]: https://github.com/resin-io/resin-sdk/compare/v5.3.1...v5.3.2
[5.3.1]: https://github.com/resin-io/resin-sdk/compare/v5.3.0...v5.3.1
[5.3.0]: https://github.com/resin-io/resin-sdk/compare/v5.2.0...v5.3.0
[5.2.0]: https://github.com/resin-io/resin-sdk/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/resin-io/resin-sdk/compare/v5.0.1...v5.1.0
[5.0.1]: https://github.com/resin-io/resin-sdk/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/resin-io/resin-sdk/compare/v4.1.3...v5.0.0
[4.1.3]: https://github.com/resin-io/resin-sdk/compare/v4.1.2...v4.1.3
[4.1.2]: https://github.com/resin-io/resin-sdk/compare/v4.1.1...v4.1.2
[4.1.1]: https://github.com/resin-io/resin-sdk/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/resin-io/resin-sdk/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/resin-io/resin-sdk/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/resin-io/resin-sdk/compare/v2.8.1...v3.0.0
[2.8.1]: https://github.com/resin-io/resin-sdk/compare/v2.8.0...v2.8.1
[2.8.0]: https://github.com/resin-io/resin-sdk/compare/v2.7.3...v2.8.0
[2.7.3]: https://github.com/resin-io/resin-sdk/compare/v2.7.2...v2.7.3
[2.7.2]: https://github.com/resin-io/resin-sdk/compare/v2.7.1...v2.7.2
[2.7.1]: https://github.com/resin-io/resin-sdk/compare/v2.7.0...v2.7.1
[2.7.0]: https://github.com/resin-io/resin-sdk/compare/v2.6.2...v2.7.0
[2.6.2]: https://github.com/resin-io/resin-sdk/compare/v2.6.1...v2.6.2
[2.6.1]: https://github.com/resin-io/resin-sdk/compare/v2.6.0...v2.6.1
[2.6.0]: https://github.com/resin-io/resin-sdk/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/resin-io/resin-sdk/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/resin-io/resin-sdk/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/resin-io/resin-sdk/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/resin-io/resin-sdk/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/resin-io/resin-sdk/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/resin-io/resin-sdk/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/resin-io/resin-sdk/compare/v1.8.0...v2.0.0
