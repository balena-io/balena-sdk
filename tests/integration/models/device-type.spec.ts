import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena, givenLoggedInUser } from '../setup';
import { assertExists, timeSuite } from '../../util';
import type { Contract } from '../../../es2017';

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

	describe('balena.models.deviceType.getAll()', function () {
		it('should get all device types', async function () {
			const deviceTypes = await balena.models.deviceType.getAll();
			expect(deviceTypes).to.be.an('Array');
			expect(deviceTypes).to.not.have.length(0);
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
			const deviceType =
				await balena.models.deviceType.get(RPI2_DEVICE_TYPE_ID);
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
			expect(partials.partials?.bootDevice[0]).to.equal(
				'Connect power to the Raspberry Pi 2',
			);
		});
	});

	parallel('balena.models.deviceType.getInstructions()', function () {
		(
			[
				[
					RPI2_DEVICE_TYPE_SLUG,
					[
						'Insert the SD card to the host machine.',
						'Write the balenaOS file you downloaded to the SD card. We recommend using [Etcher](https://etcher.balena.io/).',
						'Wait for writing of balenaOS to complete.',
						'Remove the SD card from the host machine.',
						'Insert the freshly flashed SD card into the Raspberry Pi 2.',
						'Connect power to the Raspberry Pi 2 to boot the device.',
					],
				],
				[
					RADXA_ZERO_DEVICE_TYPE_SLUG,
					[
						"Use the [maskrom mode](https://wiki.radxa.com/Zero/dev/maskrom#Enable_maskrom) instructions provided by the vendor and make sure the board's USB2 port is used for provisioning.",
						'Install on your PC the [tools](https://wiki.radxa.com/Zero/dev/maskrom#Install_required_tools) required for flashing.',
						'Clear eMMC and set it in UMS mode. Make sure to use [this loader](https://dl.radxa.com/zero/images/loader/radxa-zero-erase-emmc.bin) when following the [sideloading instructions](https://wiki.radxa.com/Zero/dev/maskrom#Side_loading_binaries).',
						'Write the OS to the internal eMMC storage device. We recommend using [Etcher](http://www.etcher.io).',
						'Once the OS has been written to the eMMC you need to repower your board.',
					],
				],
				[
					'intel-nuc',
					[
						'Insert the USB key to the host machine.',
						'Write the balenaOS file you downloaded to the USB key. We recommend using [Etcher](https://etcher.balena.io/).',
						'Wait for writing of balenaOS to complete.',
						'Remove the USB key from the host machine.',
						'Insert the freshly flashed USB key into the Intel NUC.',
						'<strong role="alert">Warning!</strong> This will also completely erase internal storage medium, so please make a backup first.',
						'Ensure there are no other USB keys are inserted. Power on the Intel NUC with a keyboard connected. Press the F10 key while BIOS is loading to enter the boot menu. Select the USB key from the boot menu.',
						'Wait for the Intel NUC to finish flashing and shutdown. Please wait until all LEDs are off.',
						'Remove the USB key from the Intel NUC.',
						'Power up the Intel NUC to boot the device.',
					],
				],
				[
					'jetson-nano',
					[
						'To provision Nvidia Jetson Nano SD-CARD, follow the instructions using our [Jetson Flash tool](https://github.com/balena-os/jetson-flash/blob/master/docs/jetson-nano.md) to make the process more streamlined.',
					],
				],
			] as const
		).forEach(([deviceTypeSlug, instructions]) => {
			it(`should get just the full instructions for installing BalenaOS for ${deviceTypeSlug} with templates strings resolved when passing the slug`, async function () {
				const result =
					await balena.models.deviceType.getInstructions(deviceTypeSlug);
				expect(result).to.be.an('Array');
				expect(result).to.not.have.length(0);
				expect(result).to.eql(instructions);
			});

			it(`should get just the full instructions for installing BalenaOS for ${deviceTypeSlug} with templates strings resolved when passing the contract `, async function () {
				const { contract } = await balena.models.deviceType.get(
					deviceTypeSlug,
					{ $select: 'contract' },
				);
				assertExists(contract);
				// @ts-expect-error - parsed contract will be a Contract
				const $contract = contract as Contract;
				const result =
					await balena.models.deviceType.getInstructions($contract);
				expect(result).to.be.an('Array');
				expect(result).to.not.have.length(0);
				expect(result).to.eql(instructions);
			});
		});

		it('should return an array of strings or a dictionary of arrays of strings', async function () {
			const dts = await balena.models.deviceType.getAll({
				$select: ['slug', 'contract'],
			});
			for (const dt of dts) {
				if (!dt.contract) {
					return;
				}
				const instructions = await balena.models.deviceType.getInstructions(
					// @ts-expect-error - parsed contract will be a Contract
					dt.contract as Contract,
				);
				if (instructions == null) {
					return;
				}
				if (Array.isArray(instructions)) {
					instructions.forEach((instruction) =>
						expect(instruction).to.be.a('string'),
					);
				} else {
					expect(instructions)
						.to.be.an('object')
						.that.has.keys(['Linux', 'MacOS', 'Windows']);
					for (const osInstructions of Object.values(instructions)) {
						expect(osInstructions).to.be.an('array');
						osInstructions.forEach((instruction) =>
							expect(instruction).to.be.a('string'),
						);
					}
				}
			}
		});
	});

	parallel('balena.models.deviceType.getInstallMethod()', function () {
		(
			[
				[RPI2_DEVICE_TYPE_SLUG, RPI2_DEVICE_TYPE_INSTALL_METHOD],
				[RADXA_ZERO_DEVICE_TYPE_SLUG, RADXA_ZERO_DEVICE_TYPE_INSTALL_METHOD],
			] as const
		).forEach(([deviceTypeSlug, installationMethod]) => {
			it(`should get device type installation method for ${deviceTypeSlug}`, async function () {
				const result =
					await balena.models.deviceType.getInstallMethod(deviceTypeSlug);
				expect(result).to.equal(installationMethod);
			});
		});
	});
});
