# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
