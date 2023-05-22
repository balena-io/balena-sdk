import * as bSemver from 'balena-semver';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	credentials,
	givenAnApplication,
	givenLoggedInUser,
	IS_BROWSER,
	applicationRetrievalFields,
} from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';
import type { Resolvable } from '../../../typings/utils';

const eventuallyExpectProperty = <T>(promise: Promise<T>, prop: string) =>
	expect(promise).to.eventually.have.property(prop);

const {
	_getNormalizedDeviceTypeSlug,
	_getDownloadSize,
	_getMaxSatisfyingVersion,
	_clearDeviceTypesAndOsVersionCaches,
} = balena.models.os as ReturnType<
	typeof import('../../../src/models/os').default
>;

const containsVersion = (
	versions: BalenaSdk.OsVersion[],
	expected: Partial<BalenaSdk.OsVersion>,
) => {
	const os = _.find(versions, expected);
	expect(os).to.not.be.undefined;
};

const itShouldClearMethodCacheFactory = <T>(
	title: string,
	fn: () => Resolvable<T>,
	prepareFn?: (result: T) => T,
) => {
	return (stepFn: () => Resolvable<void>) =>
		it(`should clear the result cache of ${title}`, async function () {
			const p1 = fn();
			let result1 = await p1;
			await stepFn();

			const p2 = fn();
			let result2 = await p2;

			if (prepareFn) {
				// @ts-expect-error
				result1 = prepareFn(result1);
				// @ts-expect-error
				result2 = prepareFn(result2);
			}

			expect(p1).to.not.equal(p2);
			if (!['string', 'number'].includes(typeof result1)) {
				expect(result1).to.not.equal(result2);
			}
			expect(result1).to.deep.equal(result2);
		});
};

const itShouldClear = {
	getAllOsVersions: itShouldClearMethodCacheFactory(
		'balena.models.os.getAllOsVersions()',
		() => balena.models.os.getAllOsVersions('raspberry-pi'),
	),
	getAvailableOsVersions: itShouldClearMethodCacheFactory(
		'balena.models.os.getAvailableOsVersions()',
		() => balena.models.os.getAvailableOsVersions('raspberry-pi'),
	),
	getDeviceTypesCache: itShouldClearMethodCacheFactory(
		'balena.models.os._getNormalizedDeviceTypeSlug()',
		() => _getNormalizedDeviceTypeSlug('raspberrypi'),
	),
	getDownloadSizeCache: itShouldClearMethodCacheFactory(
		'balena.models.os._getDownloadSize()',
		() => _getDownloadSize('raspberry-pi', '1.26.1'),
	),
};

const describeCacheInvalidationChanges = function (
	itFnWithStep: (fn: () => Resolvable<void>) => Mocha.Test,
) {
	describe('cache invalidation', function () {
		describe('when not logged in', function () {
			beforeEach(() => balena.auth.logout());

			describe('balena.auth.logout()', () =>
				itFnWithStep(() => balena.auth.logout()));

			describe('balena.auth.login()', () =>
				itFnWithStep(() =>
					balena.auth.login({
						email: credentials.email,
						password: credentials.password,
					}),
				));

			describe('balena.auth.loginWithToken()', () =>
				itFnWithStep(() =>
					balena.auth
						.authenticate(credentials)
						.then(balena.auth.loginWithToken),
				));
		});

		describe('when logged in with credentials', function () {
			givenLoggedInUser(beforeEach);

			afterEach(() => balena.auth.logout());

			describe('balena.auth.logout()', () =>
				itFnWithStep(() => balena.auth.logout()));

			describe('balena.auth.login()', () =>
				itFnWithStep(() =>
					balena.auth.login({
						email: credentials.email,
						password: credentials.password,
					}),
				));

			describe('balena.auth.loginWithToken()', () =>
				itFnWithStep(() =>
					balena.auth
						.authenticate(credentials)
						.then(balena.auth.loginWithToken),
				));
		});
	});
};

describe('OS model', function () {
	timeSuite(before);
	before(function () {
		return balena.auth.logout();
	});

	describe('balena.models.os.getAllOsVersions()', function () {
		parallel('', function () {
			it('should contain both balenaOS and balenaOS ESR OS types [string device type argument]', async () => {
				const res = await balena.models.os.getAllOsVersions('fincm3');
				expect(res).to.be.an('array');

				containsVersion(res, {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res, {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res, {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res, {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});
			});

			it('should contain both balenaOS and balenaOS ESR OS types [array of single device type]', async () => {
				const res = await balena.models.os.getAllOsVersions(['fincm3']);
				expect(res).to.be.an('object');
				expect(res).to.have.property('fincm3');
				expect(res).to.not.have.property('raspberrypi3');

				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});
			});

			it('should contain both balenaOS and balenaOS ESR OS types [multiple device types]', async () => {
				const res = await balena.models.os.getAllOsVersions([
					'fincm3',
					'raspberrypi3',
				]);
				expect(res).to.be.an('object');
				expect(res).to.have.property('fincm3');
				expect(res).to.have.property('raspberrypi3');

				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});

				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});
			});

			const variantRegex = /\.(dev|prod)$/;
			it('should have the correct variant for all non-unified OS releases', async () => {
				const osVersions = await balena.models.os.getAvailableOsVersions(
					'fincm3',
				);
				expect(osVersions).to.be.an('array');
				for (const osVersion of osVersions) {
					const variant = variantRegex.exec(osVersion.raw_version)?.[1];
					if (variant) {
						expect(osVersion).to.have.property('variant', variant);
					}
				}
			});

			it('should have an empty variant for all unified OS releases', async () => {
				const osVersions = await balena.models.os.getAvailableOsVersions(
					'fincm3',
				);
				expect(osVersions).to.be.an('array');
				for (const osVersion of osVersions) {
					const variant = variantRegex.exec(osVersion.raw_version)?.[1];
					if (!variant) {
						expect(osVersion).to.have.property('variant', '');
					}
				}
			});

			it('should return an empty object for non-existent DTs', async () => {
				const res = await balena.models.os.getAllOsVersions(['blahbleh']);

				expect(res).to.deep.equal({});
			});

			it('should cache the results when not providing extra options', async () => {
				const firstRes = await balena.models.os.getAllOsVersions([
					'raspberrypi3',
				]);
				const secondRes = await balena.models.os.getAllOsVersions([
					'raspberrypi3',
				]);
				expect(firstRes).to.equal(secondRes);
			});

			it('should not cache the results when providing extra options', async () => {
				const firstRes = await balena.models.os.getAllOsVersions(
					['raspberrypi3'],
					{ $filter: { is_invalidated: false } },
				);
				const secondRes = await balena.models.os.getAllOsVersions(
					['raspberrypi3'],
					{ $filter: { is_invalidated: false } },
				);
				expect(firstRes).to.not.equal(secondRes);
			});
		});

		describeCacheInvalidationChanges(itShouldClear.getAllOsVersions);
	});

	describe('balena.models.os.getAvailableOsVersions()', function () {
		parallel('', function () {
			it('should contain both balenaOS and balenaOS ESR OS types [string device type argument]', async () => {
				const res = await balena.models.os.getAvailableOsVersions('fincm3');
				expect(res).to.be.an('array');

				containsVersion(res, {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res, {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res, {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res, {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});
			});

			it('should contain both balenaOS and balenaOS ESR OS types [array of single device type]', async () => {
				const res = await balena.models.os.getAvailableOsVersions(['fincm3']);
				expect(res).to.be.an('object');
				expect(res).to.have.property('fincm3');
				expect(res).to.not.have.property('raspberrypi3');

				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});
			});

			it('should contain both balenaOS and balenaOS ESR OS types [multiple device types]', async () => {
				const res = await balena.models.os.getAvailableOsVersions([
					'fincm3',
					'raspberrypi3',
				]);
				expect(res).to.be.an('object');
				expect(res).to.have.property('fincm3');
				expect(res).to.have.property('raspberrypi3');

				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res['fincm3'], {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});

				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'dev',
				});
				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2.29.0+rev1',
					variant: 'prod',
				});
				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2020.04.0',
					variant: 'dev',
				});
				containsVersion(res['raspberrypi3'], {
					strippedVersion: '2020.04.0',
					variant: 'prod',
				});
			});

			it('should return an empty object for non-existent DTs', async () => {
				const res = await balena.models.os.getAvailableOsVersions(['blahbleh']);

				expect(res).to.deep.equal({});
			});

			it('should cache the results', async () => {
				const firstRes = await balena.models.os.getAvailableOsVersions([
					'raspberrypi3',
				]);
				const secondRes = await balena.models.os.getAvailableOsVersions([
					'raspberrypi3',
				]);
				expect(firstRes).to.equal(secondRes);
			});
		});

		describeCacheInvalidationChanges(itShouldClear.getAvailableOsVersions);
	});

	describe('balena.models.os._getMaxSatisfyingVersion()', function () {
		const esrOsVersions = [
			{
				raw_version: '2021.10.2.prod',
				isRecommended: true,
			},
			{ raw_version: '2021.10.2.dev' },
			{ raw_version: '2021.07.1.prod' },
			{ raw_version: '2021.07.1.dev' },
			{ raw_version: '2021.04.0.prod' },
			{ raw_version: '2021.04.0.dev' },
			{ raw_version: '2021.01.0.prod' },
			{ raw_version: '2021.01.0.dev' },
			{ raw_version: '2020.07.2.prod' },
			{ raw_version: '2020.07.2.dev' },
			{ raw_version: '2020.07.1.prod' },
			{ raw_version: '2020.07.1.dev' },
			{ raw_version: '2020.07.0.prod' },
			{ raw_version: '2020.07.0.dev' },
			{ raw_version: '2020.04.1.prod' },
			{ raw_version: '2020.04.1.dev' },
			{ raw_version: '2020.04.0.prod' },
			{ raw_version: '2020.04.0.dev' },
		];
		const defaultOsVersions = [
			{
				raw_version: '2.85.2+rev3.prod',
				isRecommended: true,
			},
			{ raw_version: '2.85.2+rev3.dev' },
			{ raw_version: '2.83.10+rev1.prod' },
			{ raw_version: '2.83.10+rev1.dev' },
			{ raw_version: '2.80.5+rev1.prod' },
			{ raw_version: '2.80.5+rev1.dev' },
			{ raw_version: '2.80.3+rev1.prod' },
			{ raw_version: '2.80.3+rev1.dev' },
			{ raw_version: '2.75.0+rev1.prod' },
			{ raw_version: '2.75.0+rev1.dev' },
			{ raw_version: '2.73.1+rev1.prod' },
			{ raw_version: '2.73.1+rev1.dev' },
			{ raw_version: '2.0.0.rev1.prod' },
			{ raw_version: '2.0.0.rev1.dev' },
		];

		const osVersions = [...esrOsVersions, ...defaultOsVersions];

		it("should support 'latest'", () =>
			expect(_getMaxSatisfyingVersion('latest', osVersions)).to.equal(
				'2021.10.2.prod',
			));

		it("should support 'latest' with among default OS versions", () =>
			expect(_getMaxSatisfyingVersion('latest', defaultOsVersions)).to.equal(
				'2.85.2+rev3.prod',
			));

		it("should support 'latest' with among esr OS versions", () =>
			expect(_getMaxSatisfyingVersion('latest', esrOsVersions)).to.equal(
				'2021.10.2.prod',
			));

		it("should support 'recommended'", () =>
			expect(
				_getMaxSatisfyingVersion('recommended', defaultOsVersions),
			).to.equal('2.85.2+rev3.prod'));

		it("should support 'default'", () =>
			expect(_getMaxSatisfyingVersion('default', defaultOsVersions)).to.equal(
				'2.85.2+rev3.prod',
			));

		it('should support exact version', () =>
			expect(_getMaxSatisfyingVersion('2.73.1+rev1.prod', osVersions)).to.equal(
				'2.73.1+rev1.prod',
			));

		it('should support stripped version', () =>
			expect(_getMaxSatisfyingVersion('2.73.1', osVersions)).to.equal(
				'2.73.1+rev1.prod',
			));

		it('should support exact non-semver version', () =>
			expect(_getMaxSatisfyingVersion('2.0.0.rev1', osVersions)).to.equal(
				'2.0.0.rev1.prod',
			));

		it('should return an exact match, if it exists, when given a specific version', () =>
			// Concern here is that semver says .dev is equivalent to .prod, but
			// we want provide an exact version and use _exactly_ that version.
			expect(_getMaxSatisfyingVersion('2.73.1+rev1.dev', osVersions)).to.equal(
				'2.73.1+rev1.dev',
			));

		it('should return an exact match, if it exists, when given a specific ESR version', () =>
			expect(_getMaxSatisfyingVersion('2020.07.2.dev', osVersions)).to.equal(
				'2020.07.2.dev',
			));

		it('should return an equivalent result, if no exact result exists, when given a specific version', () =>
			expect(_getMaxSatisfyingVersion('2.73.1+rev1', osVersions)).to.equal(
				'2.73.1+rev1.prod',
			));

		it('should support ^ semver ranges in default OS releases', () =>
			expect(_getMaxSatisfyingVersion('^2.0.1', osVersions)).to.equal(
				'2.85.2+rev3.prod',
			));

		it('should support ~ semver ranges in default OS releases', () =>
			expect(_getMaxSatisfyingVersion('~2.80.3', osVersions)).to.equal(
				'2.80.5+rev1.prod',
			));

		it('should support > semver ranges in default OS releases', () => {
			expect(_getMaxSatisfyingVersion('>2.80.3', defaultOsVersions)).to.equal(
				'2.85.2+rev3.prod',
			);
			expect(
				_getMaxSatisfyingVersion('>2.80.3+rev1.prod', defaultOsVersions),
			).to.equal('2.85.2+rev3.prod');
			expect(_getMaxSatisfyingVersion('>2.80.3', osVersions)).to.equal(
				'2021.10.2.prod',
			);
		});

		it('should support ^ semver ranges in ESR OS releases', () =>
			expect(_getMaxSatisfyingVersion('^2020.04.0', osVersions)).to.equal(
				'2020.07.2.prod',
			));

		it('should support ~ semver ranges in ESR OS releases', () =>
			expect(_getMaxSatisfyingVersion('~2020.04.0', osVersions)).to.equal(
				'2020.04.1.prod',
			));

		it('should support > semver ranges in ESR OS releases', () => {
			expect(_getMaxSatisfyingVersion('>2020.04.0', esrOsVersions)).to.equal(
				'2021.10.2.prod',
			);
			expect(
				_getMaxSatisfyingVersion('>2020.04.0.prod', esrOsVersions),
			).to.equal('2021.10.2.prod');
			expect(_getMaxSatisfyingVersion('>2020.04.0', osVersions)).to.equal(
				'2021.10.2.prod',
			);
		});

		it('should support non-semver version ranges', () =>
			expect(_getMaxSatisfyingVersion('^2020.04.0', osVersions)).to.equal(
				'2020.07.2.prod',
			));

		it('should drop unsupported exact versions', () => {
			expect(_getMaxSatisfyingVersion('2.8.8+rev8.prod', osVersions)).to.equal(
				null,
			);
			expect(_getMaxSatisfyingVersion('2.8.8', osVersions)).to.equal(null);
		});

		it('should drop unsupported semver ranges', () => {
			expect(_getMaxSatisfyingVersion('~2.8.8', osVersions)).to.equal(null);
			expect(_getMaxSatisfyingVersion('^2.999.0', osVersions)).to.equal(null);
		});
	});

	describe('balena.models.os._getNormalizedDeviceTypeSlug()', function () {
		it('should cache the results', async function () {
			const p1 = _getNormalizedDeviceTypeSlug('raspberrypi');
			const p2 = _getNormalizedDeviceTypeSlug('raspberrypi');
			expect(p1).to.equal(p2);
			// wait for the promises to resolve before starting the new request
			await p1;
			await p2;
			const p3 = _getNormalizedDeviceTypeSlug('raspberrypi');
			expect(p1).to.equal(p3);
		});

		describeCacheInvalidationChanges(itShouldClear.getDeviceTypesCache);
	});

	describe('balena.models.os.getDownloadSize()', function () {
		parallel('given a valid device slug', function () {
			it('should eventually be a valid number', function () {
				const promise = balena.models.os.getDownloadSize('raspberry-pi');
				return expect(promise).to.eventually.be.a('number');
			});

			it('should eventually be a valid number if passing a device type alias', function () {
				const promise = balena.models.os.getDownloadSize('raspberrypi');
				return expect(promise).to.eventually.be.a('number');
			});
		});

		parallel('given a specific OS version', function () {
			it('should get a result for ResinOS v1', function () {
				const promise = balena.models.os.getDownloadSize(
					'raspberry-pi',
					'1.26.1',
				);
				return expect(promise).to.eventually.be.a('number');
			});

			it('should get a result for ResinOS v2', function () {
				const promise = balena.models.os.getDownloadSize(
					'raspberry-pi',
					'2.0.6+rev3.prod',
				);
				return expect(promise).to.eventually.be.a('number');
			});

			it('should cache the results', () =>
				balena.models.os
					.getDownloadSize('raspberry-pi', '1.26.1')
					.then((result1) =>
						balena.models.os
							.getDownloadSize('raspberry-pi', '1.26.1')
							.then((result2) => expect(result1).to.equal(result2)),
					));

			it('should cache download sizes independently for each version', () =>
				Promise.all([
					balena.models.os.getDownloadSize('raspberry-pi', '1.26.1'),
					balena.models.os.getDownloadSize('raspberry-pi', '2.0.6+rev3.prod'),
				]).then(function ([os1Size, os2Size]) {
					expect(os1Size).not.to.equal(os2Size);
				}));
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getDownloadSize('foo-bar-baz');
				return expect(promise).to.be.rejectedWith(
					'Invalid device type: foo-bar-baz',
				);
			}));
	});

	describe('balena.models.os._getDownloadSize()', function () {
		it('should cache the results', function () {
			const p1 = _getDownloadSize('raspberry-pi', '1.26.1');
			return p1.then(function (result1) {
				const p2 = _getDownloadSize('raspberry-pi', '1.26.1');
				return p2.then(function (result2) {
					expect(result1).to.equal(result2);
					expect(p1).to.equal(p2);
				});
			});
		});

		describeCacheInvalidationChanges(itShouldClear.getDownloadSizeCache);
	});

	describe('balena.models.os._clearDeviceTypesAndOsVersionCaches()', function () {
		itShouldClear.getDeviceTypesCache(() =>
			_clearDeviceTypesAndOsVersionCaches(),
		);
		itShouldClear.getDownloadSizeCache(() =>
			_clearDeviceTypesAndOsVersionCaches(),
		);
		itShouldClear.getAllOsVersions(() => _clearDeviceTypesAndOsVersionCaches());
		itShouldClear.getAvailableOsVersions(() =>
			_clearDeviceTypesAndOsVersionCaches(),
		);
	});

	describe('balena.models.os.getLastModified()', function () {
		parallel('given a valid device slug', function () {
			it('should eventually be a valid Date instance', function () {
				const promise = balena.models.os.getLastModified('raspberry-pi');
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});

			it('should eventually be a valid Date instance if passing a device type alias', function () {
				const promise = balena.models.os.getLastModified('raspberrypi');
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});

			it('should be able to query for a specific version', function () {
				const promise = balena.models.os.getLastModified(
					'raspberrypi',
					'1.26.1',
				);
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});

			it('should be able to query for a version containing a plus', function () {
				const promise = balena.models.os.getLastModified(
					'raspberrypi',
					'2.0.6+rev3.prod',
				);
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getLastModified('foo-bar-baz');
				return expect(promise).to.be.rejectedWith(
					'Invalid device type: foo-bar-baz',
				);
			}));
	});

	describe('balena.models.os.download()', function () {
		if (IS_BROWSER) {
			return;
		}

		const rindle = require('rindle');
		const tmp = require('tmp');
		const fs = require('fs') as typeof import('fs');

		describe('given a valid device slug', function () {
			it('should contain a valid mime property', () =>
				balena.models.os
					.download({ deviceType: 'raspberry-pi' })
					.then((stream) =>
						expect(stream.mime).to.equal('application/octet-stream'),
					));

			it('should contain a valid mime property if passing a device type alias', () =>
				balena.models.os
					.download({ deviceType: 'raspberrypi' })
					.then((stream) =>
						expect(stream.mime).to.equal('application/octet-stream'),
					));

			it('should be able to download the image', function () {
				const tmpFile = tmp.tmpNameSync();
				return balena.models.os
					.download({ deviceType: 'raspberry-pi' })
					.then((stream) => stream.pipe(fs.createWriteStream(tmpFile)))
					.then(rindle.wait)
					.then(() => fs.promises.stat(tmpFile))
					.then((stat) => expect(stat.size).to.not.equal(0))
					.finally(() => fs.promises.unlink(tmpFile));
			});
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.download({
					deviceType: 'foo-bar-baz',
				});
				return expect(promise).to.be.rejectedWith(
					'Invalid device type: foo-bar-baz',
				);
			}));
	});

	describe('balena.models.os.isSupportedOsUpdate()', function () {
		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.isSupportedOsUpdate(
					'foo-bar-baz',
					'2.0.0+rev1.prod',
					'2.29.2+rev1.prod',
				);
				return expect(promise).to.be.rejectedWith(
					'Invalid device type: foo-bar-baz',
				);
			}));

		describe('given a valid device slug', function () {
			describe('given a unsupported low starting version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev0.prod',
							'2.2.0+rev2.prod',
						),
					).to.eventually.equal(false)));

			describe('given a unsupported low target version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.prod',
							'2.1.0+rev1.prod',
						),
					).to.eventually.equal(false)));

			describe('given a dev starting version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.dev',
							'2.2.0+rev2.prod',
						),
					).to.eventually.equal(false)));

			describe('given a dev target version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.prod',
							'2.1.0+rev1.dev',
						),
					).to.eventually.equal(false)));

			describe('given a supported os update path', () => {
				[
					['2.0.0+rev1.prod', '2.2.0+rev2.prod'],
					['2.8.0+rev1.dev', '2.10.0+rev2.dev'],
					['2.2.0+rev2.prod', '2.88.4'],
					['2.2.0+rev2.dev', '2.88.4'],
				].forEach(([current, target]) => {
					it(`should return true when updating ${current} -> ${target}`, async () => {
						expect(
							await balena.models.os.isSupportedOsUpdate(
								'raspberrypi3',
								current,
								target,
							),
						).to.equal(true);
					});
				});
			});
		});
	});

	describe('balena.models.os.getSupportedOsUpdateVersions()', function () {
		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getSupportedOsUpdateVersions(
					'foo-bar-baz',
					'2.9.6+rev1.prod',
				);
				return expect(promise).to.be.rejectedWith(
					'Invalid device type: foo-bar-baz',
				);
			}));

		describe('given a valid device slug', () =>
			it('should return the list of supported hup targets', () =>
				balena.models.os
					.getSupportedOsUpdateVersions('raspberrypi3', '2.9.6+rev1.prod')
					.then(function ({ current, recommended, versions }) {
						expect(current).to.equal('2.9.6+rev1.prod');
						expect(recommended).to.be.a('string');
						expect(versions).to.be.an('array');
						expect(versions).to.not.have.length(0);
						_.each(versions, function (v) {
							expect(v).to.be.a('string');
							expect(bSemver.gte(v, current)).to.be.true;
						});

						expect(versions.length > 2).to.be.true;
						const sortedVersions = versions.slice().sort(bSemver.rcompare);
						expect(versions).to.deep.equal(sortedVersions);
					})));
	});

	describe('when logged in as a user with a single application', function () {
		givenLoggedInUser(before);
		givenAnApplication(before);

		let ctx: Mocha.Context;
		before(function () {
			ctx = this;
		});

		parallel('balena.models.os.getConfig()', function () {
			const DEFAULT_OS_VERSION = '2.12.7+rev1.prod';

			it('should fail if no version option is provided', function () {
				return expect(
					(balena.models.os.getConfig as any)(ctx.application.id),
				).to.be.rejectedWith(
					'An OS version is required when calling os.getConfig',
				);
			});

			applicationRetrievalFields.forEach((prop) => {
				it(`should be able to get an application config by ${prop}`, function () {
					const promise = balena.models.os.getConfig(ctx.application[prop], {
						version: DEFAULT_OS_VERSION,
					});
					return Promise.all([
						eventuallyExpectProperty(promise, 'applicationId'),
						eventuallyExpectProperty(promise, 'apiKey'),
						eventuallyExpectProperty(promise, 'userId'),
						eventuallyExpectProperty(promise, 'deviceType'),
						eventuallyExpectProperty(promise, 'apiEndpoint'),
						eventuallyExpectProperty(promise, 'registryEndpoint'),
						eventuallyExpectProperty(promise, 'vpnEndpoint'),
						eventuallyExpectProperty(promise, 'listenPort'),
					]);
				});
			});

			it('should be rejected if the version is invalid', function () {
				const promise = balena.models.os.getConfig(ctx.application.id, {
					version: 'v1+foo',
				});
				return expect(promise).to.be.rejected.then((error) => {
					expect(error).to.have.property('message');
					expect(error.message.replace('&lt;', '<')).to.contain(
						'balenaOS versions <= 1.2.0 are no longer supported, please update',
					);
				});
			});

			it('should be rejected if the version is <= 1.2.0', function () {
				const promise = balena.models.os.getConfig(ctx.application.id, {
					version: '1.2.0',
				});
				return expect(promise).to.be.rejected.then((error) => {
					expect(error).to.have.property('message');
					expect(error.message.replace('&lt;', '<')).to.contain(
						'balenaOS versions <= 1.2.0 are no longer supported, please update',
					);
				});
			});

			it('should be able to configure v1 image parameters', function () {
				const configOptions = {
					appUpdatePollInterval: 72,
					network: 'wifi' as const,
					wifiKey: 'foobar',
					wifiSsid: 'foobarbaz',
					ip: '1.2.3.4',
					gateway: '5.6.7.8',
					netmask: '9.10.11.12',
					version: '1.26.1',
				};
				return balena.models.os
					.getConfig(ctx.application.id, configOptions)
					.then(function (config) {
						expect(config).to.deep.match({
							// NOTE: the interval is converted to ms in the config object
							appUpdatePollInterval:
								configOptions.appUpdatePollInterval * 60 * 1000,
							wifiKey: configOptions.wifiKey,
							wifiSsid: configOptions.wifiSsid,
						});
						expect(config)
							.to.have.property('files')
							.that.has.property('network/network.config')
							.that.includes(
								`${configOptions.ip}/${configOptions.netmask}/${configOptions.gateway}`,
							);
					});
			});

			it('should be able to configure v2 image parameters', function () {
				const configOptions = {
					appUpdatePollInterval: 72,
					network: 'wifi' as const,
					wifiKey: 'foobar',
					wifiSsid: 'foobarbaz',
					ip: '1.2.3.4',
					gateway: '5.6.7.8',
					netmask: '9.10.11.12',
					version: '2.0.8+rev1.prod',
				};
				return balena.models.os
					.getConfig(ctx.application.id, configOptions)
					.then(function (config) {
						expect(config).to.deep.match({
							// NOTE: the interval is converted to ms in the config object
							appUpdatePollInterval:
								configOptions.appUpdatePollInterval * 60 * 1000,
							wifiKey: configOptions.wifiKey,
							wifiSsid: configOptions.wifiSsid,
						});
						expect(config).to.not.have.property('files');
					});
			});

			it('should be able to configure v2 image with a provisioning key name', async function () {
				const provisioningKeyName = `provision-key-${Date.now()}`;
				const configOptions = {
					appUpdatePollInterval: 72,
					network: 'wifi' as const,
					wifiKey: 'foobar',
					wifiSsid: 'foobarbaz',
					ip: '1.2.3.4',
					gateway: '5.6.7.8',
					netmask: '9.10.11.12',
					version: '2.11.8+rev1.prod',
					provisioningKeyName,
				};

				await balena.models.os.getConfig(ctx.application.id, configOptions);

				const provisioningKeys =
					await balena.models.apiKey.getProvisioningApiKeysByApplication(
						ctx.application.id,
						{ $filter: { name: provisioningKeyName } },
					);

				expect(provisioningKeys).to.be.an('array');
				expect(provisioningKeys.length).is.equal(1);
				expect(provisioningKeys[0])
					.to.have.property('name')
					.to.be.equal(provisioningKeyName);
			});

			it('should be able to configure v2 image with a provisioning key expiry date', async function () {
				const provisioningKeyExpiryDate = new Date().toISOString();
				const configOptions = {
					appUpdatePollInterval: 72,
					network: 'wifi' as const,
					wifiKey: 'foobar',
					wifiSsid: 'foobarbaz',
					ip: '1.2.3.4',
					gateway: '5.6.7.8',
					netmask: '9.10.11.12',
					version: '2.11.8+rev1.prod',
					provisioningKeyExpiryDate,
				};

				await balena.models.os.getConfig(ctx.application.id, configOptions);

				const provisioningKeys =
					await balena.models.apiKey.getProvisioningApiKeysByApplication(
						ctx.application.id,
						{ $filter: { expiry_date: provisioningKeyExpiryDate } },
					);

				expect(provisioningKeys).to.be.an('array');
				expect(provisioningKeys.length).is.equal(1);
				expect(provisioningKeys[0])
					.to.have.property('expiry_date')
					.to.be.equal(provisioningKeyExpiryDate);
			});

			it('should be rejected if the application id does not exist', function () {
				const promise = balena.models.os.getConfig(999999, {
					version: DEFAULT_OS_VERSION,
				});
				return expect(promise).to.be.rejectedWith(
					'Application not found: 999999',
				);
			});

			it('should be rejected if the application name does not exist', function () {
				const promise = balena.models.os.getConfig('foobarbaz', {
					version: DEFAULT_OS_VERSION,
				});
				return expect(promise).to.be.rejectedWith(
					'Application not found: foobarbaz',
				);
			});
		});
	});

	describe('helpers', () =>
		describe('balena.models.os.isArchitectureCompatibleWith()', function () {
			[
				['armv7hf', 'i386'],
				['aarch64', 'i386'],
				['i386', 'armv7hf'],
				['i386', 'aarch64'],
				['armv7hf', 'amd64'],
				['aarch64', 'amd64'],
				['amd64', 'armv7hf'],
				['amd64', 'aarch64'],
				['amd64', 'i386'],
				['i386', 'amd64'],
				// arm architectures
				['armv5e', 'rpi'],
				['armv5e', 'armv7hf'],
				['armv5e', 'aarch64'],
				['rpi', 'armv5e'],
				['rpi', 'armv7hf'],
				['rpi', 'aarch64'],
				['armv7hf', 'armv5e'],
				['armv7hf', 'aarch64'],
				['aarch64', 'armv5e'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should return false when comparing ${deviceArch} and ${appArch} architectures`, () => expect(balena.models.os.isArchitectureCompatibleWith(deviceArch, appArch)).to.equal(false));
			});

			it('should return true when comparing the same architecture slugs', function () {
				expect(
					balena.models.os.isArchitectureCompatibleWith('rpi', 'rpi'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('armv5e', 'armv5e'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('armv7hf', 'armv7hf'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('aarch64', 'aarch64'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('i386', 'i386'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('i386-nlp', 'i386-nlp'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('amd64', 'amd64'),
				).to.equal(true);
			});

			return [
				['aarch64', 'armv7hf'],
				['aarch64', 'rpi'],
				['armv7hf', 'rpi'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should return true when comparing ${deviceArch} and ${appArch} architectures`, () => expect(balena.models.os.isArchitectureCompatibleWith(deviceArch, appArch)).to.equal(true));
			});
		}));
});
