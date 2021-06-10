import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena, givenLoggedInUser } from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';

const DEVICE_TYPE_NAME = 'Raspberry Pi 2';
const DEVICE_TYPE_SLUG = 'raspberry-pi2';
const DEVICE_TYPE_ALIAS = 'raspberrypi2';
const DEVICE_TYPE_INSTALL_METHOD = 'externalBoot';
const DEVICE_TYPE_ID = 1;

describe('Device Type model', function () {
	timeSuite(before);
	givenLoggedInUser(before);

	parallel('balena.models.deviceType.getAll()', function () {
		it('should get all device types', async function () {
			const deviceTypes = await balena.models.deviceType.getAll();
			expect(deviceTypes).to.be.an('Array');
			expect(deviceTypes).to.not.have.length(0);
		});

		it('should support a callback', function (done) {
			(
				balena.models.deviceType.getAll as (...args: any[]) => any
			)(function (_err: Error, deviceTypes: BalenaSdk.DeviceType[]) {
				try {
					expect(deviceTypes).to.be.an('Array');
					expect(deviceTypes).to.not.have.length(0);
					done();
				} catch (err) {
					done(err);
				}
			});
		});
	});

	parallel('balena.models.deviceType.getAllSupported()', function () {
		it('should get all supported device types', async function () {
			const deviceTypes = await balena.models.deviceType.getAllSupported();
			expect(deviceTypes).to.be.an('Array');
			expect(deviceTypes).to.not.have.length(0);
		});
	});

	parallel('balena.models.deviceType.get()', function () {
		[
			{ titlePart: 'slug', value: DEVICE_TYPE_SLUG },
			{ titlePart: 'alias', value: DEVICE_TYPE_ALIAS },
		].forEach(({ titlePart, value }) => {
			it(`should get device type by ${titlePart}`, async function () {
				const deviceType = await balena.models.deviceType.get(value);
				expect(deviceType).to.have.property('slug', DEVICE_TYPE_SLUG);
			});
		});

		it(`should get device type by id`, async function () {
			const deviceType = await balena.models.deviceType.get(DEVICE_TYPE_ID);
			expect(deviceType).to.have.property('id', DEVICE_TYPE_ID);
		});
	});

	parallel('balena.models.deviceType.getBySlugOrName()', function () {
		[
			{ key: 'name', value: DEVICE_TYPE_NAME },
			{ key: 'slug', value: DEVICE_TYPE_SLUG },
		].forEach((type) => {
			it(`should get device type by ${type.key}`, async function () {
				const deviceType = await balena.models.deviceType.getBySlugOrName(
					type.value,
				);
				expect(deviceType).to.have.property('slug', DEVICE_TYPE_SLUG);
			});
		});
	});

	parallel('balena.models.deviceType.getName()', function () {
		it(`should get device type display name`, async function () {
			const deviceTypes = await balena.models.deviceType.getName(
				DEVICE_TYPE_SLUG,
			);
			expect(deviceTypes).to.equal(DEVICE_TYPE_NAME);
		});
	});

	parallel('balena.models.deviceType.getSlugByName()', function () {
		it(`should get device type slug`, async function () {
			const slug = await balena.models.deviceType.getSlugByName(
				DEVICE_TYPE_NAME,
			);
			expect(slug).to.equal(DEVICE_TYPE_SLUG);
		});
	});

	parallel('balena.models.deviceType.getInterpolatedPartials()', function () {
		it(`should get just the device type partials with template strings resolved`, async function () {
			const partials = await balena.models.deviceType.getInterpolatedPartials(
				DEVICE_TYPE_NAME,
			);
			expect(partials).to.be.an('object');
			expect(Object.keys(partials)).to.not.have.length(0);
		});
	});

	parallel('balena.models.deviceType.getInstructions()', function () {
		it(`should get just the full instructions for installing BalenaOS on a device type with templates strings resolved`, async function () {
			const partials = await balena.models.deviceType.getInstructions(
				DEVICE_TYPE_NAME,
			);
			expect(partials).to.be.an('Array');
			expect(partials).to.not.have.length(0);
		});
	});

	parallel('balena.models.deviceType.getInstallMethod()', function () {
		it(`should get device type installation method`, async function () {
			const installMethod = await balena.models.deviceType.getInstallMethod(
				DEVICE_TYPE_NAME,
			);
			expect(installMethod).to.equal(DEVICE_TYPE_INSTALL_METHOD);
		});
	});
});
