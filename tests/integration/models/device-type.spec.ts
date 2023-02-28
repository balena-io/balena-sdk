import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena, givenLoggedInUser } from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';

const RPI2_DEVICE_TYPE_NAME = 'Raspberry Pi 2';
const RPI2_DEVICE_TYPE_SLUG = 'raspberry-pi2';
const RPI2_DEVICE_TYPE_ALIAS = 'raspberrypi2';
const RPI2_DEVICE_TYPE_INSTALL_METHOD = 'externalBoot';
const RPI2_DEVICE_TYPE_ID = 1;

const RADXA_ZERO_DEVICE_TYPE_SLUG = 'radxa-zero';
const RADXA_ZERO_DEVICE_TYPE_INSTALL_METHOD = 'usbMassStorage';

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
			{ titlePart: 'slug', value: RPI2_DEVICE_TYPE_SLUG },
			{ titlePart: 'alias', value: RPI2_DEVICE_TYPE_ALIAS },
		].forEach(({ titlePart, value }) => {
			it(`should get device type by ${titlePart}`, async function () {
				const deviceType = await balena.models.deviceType.get(value);
				expect(deviceType).to.have.property('slug', RPI2_DEVICE_TYPE_SLUG);
			});
		});

		it(`should get device type by id`, async function () {
			const deviceType = await balena.models.deviceType.get(
				RPI2_DEVICE_TYPE_ID,
			);
			expect(deviceType).to.have.property('id', RPI2_DEVICE_TYPE_ID);
		});
	});

	parallel('balena.models.deviceType.getBySlugOrName()', function () {
		[
			{ key: 'name', value: RPI2_DEVICE_TYPE_NAME },
			{ key: 'slug', value: RPI2_DEVICE_TYPE_SLUG },
		].forEach((type) => {
			it(`should get device type by ${type.key}`, async function () {
				const deviceType = await balena.models.deviceType.getBySlugOrName(
					type.value,
				);
				expect(deviceType).to.have.property('slug', RPI2_DEVICE_TYPE_SLUG);
			});
		});
	});

	parallel('balena.models.deviceType.getName()', function () {
		it(`should get device type display name`, async function () {
			const deviceTypes = await balena.models.deviceType.getName(
				RPI2_DEVICE_TYPE_SLUG,
			);
			expect(deviceTypes).to.equal(RPI2_DEVICE_TYPE_NAME);
		});
	});

	parallel('balena.models.deviceType.getSlugByName()', function () {
		it(`should get device type slug`, async function () {
			const slug = await balena.models.deviceType.getSlugByName(
				RPI2_DEVICE_TYPE_NAME,
			);
			expect(slug).to.equal(RPI2_DEVICE_TYPE_SLUG);
		});
	});

	parallel('balena.models.deviceType.getInterpolatedPartials()', function () {
		it(`should get just the device type partials with template strings resolved`, async function () {
			const partials = await balena.models.deviceType.getInterpolatedPartials(
				RPI2_DEVICE_TYPE_NAME,
			);
			expect(partials).to.be.an('object');
			expect(Object.keys(partials)).to.not.have.length(0);
			expect(partials)
				.to.have.property('partials')
				.to.have.property('bootDevice');
			expect(partials?.partials?.bootDevice[0]).to.equal(
				'Connect power to the Raspberry Pi 2',
			);
		});
	});

	parallel('balena.models.deviceType.getInstructions()', function () {
		it(`should get just the full instructions for installing BalenaOS on devices types with templates strings resolved`, async function () {
			const partialsRpi2 = await balena.models.deviceType.getInstructions(
				RPI2_DEVICE_TYPE_SLUG,
			);
			expect(partialsRpi2).to.be.an('Array');
			expect(partialsRpi2).to.not.have.length(0);
			expect(partialsRpi2).to.eql([
				'Insert the sdcard to the host machine.',
				'Write the balenaOS file you downloaded to the sdcard. We recommend using <a href="http://www.etcher.io/">Etcher</a>.',
				'Wait for writing of balenaOS to complete.',
				'Remove the sdcard from the host machine.',
				'Insert the freshly flashed sdcard into the Raspberry Pi 2.',
				'Connect power to the Raspberry Pi 2 to boot the device.',
			]);

			const partialsRadxaZero = await balena.models.deviceType.getInstructions(
				RADXA_ZERO_DEVICE_TYPE_SLUG,
			);
			expect(partialsRadxaZero).to.be.an('Array');
			expect(partialsRadxaZero).to.not.have.length(0);
			expect(partialsRadxaZero).to.eql([
				"Use the <a href=https://wiki.radxa.com/Zero/dev/maskrom#Enable_maskrom>maskrom mode</a> instructions provided by the vendor and make sure the board's USB2 port is used for provisioning. Install on your PC the <a href=https://wiki.radxa.com/Zero/dev/maskrom#Install_required_tools>tools</a> required for flashing. Clear eMMC and set it in UMS mode. Make sure to use <a href=https://dl.radxa.com/zero/images/loader/radxa-zero-erase-emmc.bin>this loader</a> when following the <a href=https://wiki.radxa.com/Zero/dev/maskrom#Side_loading_binaries>sideloading instructions</a>. Write the OS to the internal eMMC storage device. We recommend using <a href=http://www.etcher.io/>Etcher</a>. Once the OS has been written to the eMMC you need to repower your board. ",
			]);
		});
	});

	parallel('balena.models.deviceType.getInstallMethod()', function () {
		it(`should get device type installation method`, async function () {
			const installMethodPi2 = await balena.models.deviceType.getInstallMethod(
				RPI2_DEVICE_TYPE_SLUG,
			);
			const installMethodRadxaZero =
				await balena.models.deviceType.getInstallMethod(
					RADXA_ZERO_DEVICE_TYPE_SLUG,
				);

			expect(installMethodPi2).to.equal(RPI2_DEVICE_TYPE_INSTALL_METHOD);
			expect(installMethodRadxaZero).to.equal(
				RADXA_ZERO_DEVICE_TYPE_INSTALL_METHOD,
			);
		});
	});
});
