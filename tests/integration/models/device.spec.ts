// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import * as superagent from 'superagent';
import { subYears } from 'date-fns/subYears';
import { subDays } from 'date-fns/subDays';
import { addDays } from 'date-fns/addDays';

import {
	balena,
	deviceUniqueFields,
	givenADevice,
	givenASupervisorRelease,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
	givenInitialOrganization,
	sdkOpts,
	IS_BROWSER,
	applicationRetrievalFields,
	organizationRetrievalFields,
	testDeviceOsInfo,
	TEST_APPLICATION_NAME_PREFIX,
} from '../setup';
import { timeSuite } from '../../util';
import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';
import type * as tagsHelper from './tags';
import type * as BalenaSdk from '../../..';

const makeRequest = async (url) => {
	try {
		const res = await superagent.get(url);
		return {
			status: res.status,
			isError: false,
			response: res.text,
		};
	} catch (err) {
		return {
			status: err.status,
			isError: true,
			response: err.response?.text,
		};
	}
};

describe('Device Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	describe('given an application', function () {
		givenAnApplication(before);

		describe('given no device [contained scenario]', function () {
			describe('[read operations]', function () {
				let ctx: Mocha.Context;

				before(function () {
					ctx = this;
				});

				describe('balena.models.device.getAllByApplication()', () => {
					it('should become an empty array', async function () {
						const result = await balena.models.device.getAllByApplication(
							ctx.application.id,
						);
						expect(result).to.deep.equal([]);
					});
				});

				describe('balena.models.device.getAllByOrganization()', () => {
					it('should become an empty array', async function () {
						const result = await balena.models.device.getAllByOrganization(
							ctx.initialOrg.id,
						);
						expect(result).to.deep.equal([]);
					});
				});

				parallel('balena.models.device.generateUniqueKey()', function () {
					it('should generate a valid uuid', function () {
						const uuid = balena.models.device.generateUniqueKey();

						expect(uuid).to.be.a('string');
						expect(uuid).to.have.length(32);
						return expect(uuid).to.match(/^[a-z0-9]{32}$/);
					});

					it('should generate different uuids', function () {
						const one = balena.models.device.generateUniqueKey();
						const two = balena.models.device.generateUniqueKey();
						const three = balena.models.device.generateUniqueKey();

						expect(one).to.not.equal(two);
						return expect(two).to.not.equal(three);
					});
				});
			});

			describe('balena.models.device.register()', function () {
				it(`should be rejected if the application slug does not exist`, async function () {
					const uuid = balena.models.device.generateUniqueKey();
					const promise = balena.models.device.register(
						`${this.initialOrg.handle}/helloworldapp`,
						uuid,
					);
					await expect(promise).to.be.rejectedWith(
						`Application not found: ${this.initialOrg.handle}/helloworldapp`,
					);
				});

				it('should be rejected if the application id does not exist', async function () {
					const uuid = balena.models.device.generateUniqueKey();
					const promise = balena.models.device.register(999999, uuid);
					await expect(promise).to.be.rejectedWith(
						'Application not found: 999999',
					);
				});

				it('should be rejected if the provided device type does not exist', async function () {
					const uuid = balena.models.device.generateUniqueKey();
					const promise = balena.models.device.register(
						this.application.id,
						uuid,
						'foobarbaz',
					);
					await expect(promise).to.be.rejectedWith(
						'Invalid device type: foobarbaz',
					);
				});

				it('should be rejected when providing a device type incompatible with the application', async function () {
					const uuid = balena.models.device.generateUniqueKey();
					const promise = balena.models.device.register(
						this.application.id,
						uuid,
						'intel-nuc',
					);
					await expect(promise).to.be.rejectedWith(
						`Incompatible device type: intel-nuc`,
					);
				});

				describe('[mutating operations]', function () {
					after(async function () {
						await balena.pine.delete({
							resource: 'device',
							options: {
								$filter: {
									belongs_to__application: this.application.id,
								},
							},
						});
					});

					applicationRetrievalFields.forEach((prop, i) => {
						it(`should be able to register a device to a valid application ${prop}`, async function () {
							const uuid = balena.models.device.generateUniqueKey();
							await balena.models.device.register(this.application[prop], uuid);
							const apps = await balena.models.device.getAllByApplication(
								this.application.slug,
							);
							expect(apps).to.have.length(i + 1);
						});
					});

					it('should become valid device registration info', async function () {
						const uuid = balena.models.device.generateUniqueKey();
						const deviceInfo = await balena.models.device.register(
							this.application.id,
							uuid,
						);
						expect(deviceInfo.uuid).to.equal(uuid);
						expect(deviceInfo.api_key).to.be.a('string');
					});

					it(`should be able to register a device with a different device type than the application`, async function () {
						const compatibleDeviceTypeSlug = 'raspberrypi3';
						const application = await balena.models.application.get(
							this.application.id,
							{
								$select: 'is_for__device_type',
								$expand: { is_for__device_type: { $select: 'slug' } },
							},
						);
						expect(application)
							.to.have.nested.property('is_for__device_type[0].slug')
							.that.is.not.equal(compatibleDeviceTypeSlug);

						const uuid = balena.models.device.generateUniqueKey();
						const deviceInfo = await balena.models.device.register(
							this.application.id,
							uuid,
							compatibleDeviceTypeSlug,
						);
						expect(deviceInfo.uuid).to.equal(uuid);
						expect(deviceInfo.api_key).to.be.a('string');
						const device = await balena.models.device.get(uuid, {
							$select: 'uuid',
							$expand: { is_of__device_type: { $select: 'slug' } },
						});
						expect(device).to.have.property('uuid', uuid);
						expect(device).to.have.nested.property(
							'is_of__device_type[0].slug',
							compatibleDeviceTypeSlug,
						);
					});
				});
			});
		});

		describe('given a single offline device', function () {
			describe('[read operations]', function () {
				givenADevice(before);

				let ctx: Mocha.Context;
				before(function () {
					ctx = this;
				});

				parallel('balena.models.device.getAllByApplication()', function () {
					applicationRetrievalFields.forEach((prop) => {
						it(`should get the device given the right application ${prop}`, async function () {
							const devices = await balena.models.device.getAllByApplication(
								ctx.application[prop],
							);
							expect(devices).to.have.length(1);
							return expect(devices[0].id).to.equal(ctx.device.id);
						});
					});

					it('should be rejected if the application slug does not exist', function () {
						const promise = balena.models.device.getAllByApplication(
							`${ctx.initialOrg.handle}/helloworldapp`,
						);
						return expect(promise).to.be.rejectedWith(
							`Application not found: ${ctx.initialOrg.handle}/helloworldapp`,
						);
					});

					it('should be rejected if the application id does not exist', function () {
						const promise = balena.models.device.getAllByApplication(999999);
						return expect(promise).to.be.rejectedWith(
							'Application not found: 999999',
						);
					});

					it('should support arbitrary pinejs options', async function () {
						const [device] = await balena.models.device.getAllByApplication(
							ctx.application.id,
							{ $select: ['id'] },
						);
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});

					it('should be able to retrieve computed terms', async function () {
						const [device] = await balena.models.device.getAllByApplication(
							ctx.application.id,
							{
								$select: ['overall_status', 'overall_progress'],
							},
						);
						return expect(device).to.deep.match({
							overall_status: 'inactive',
							overall_progress: null,
						});
					});
				});

				parallel('balena.models.device.getAllByOrganization()', function () {
					organizationRetrievalFields.forEach((prop) => {
						it(`should get the device given the right organization ${prop}`, async function () {
							const devices = await balena.models.device.getAllByOrganization(
								ctx.initialOrg[prop],
							);
							expect(devices).to.have.length(1);
							return expect(devices[0].id).to.equal(ctx.device.id);
						});
					});

					it('should be rejected if the organization slug does not exist', function () {
						const promise = balena.models.device.getAllByOrganization(
							'A handle that can not exist',
						);
						return expect(promise).to.be.rejectedWith(
							`Organization not found: A handle that can not exist`,
						);
					});

					it('should be rejected if the organization id does not exist', function () {
						const promise = balena.models.device.getAllByOrganization(999999);
						return expect(promise).to.be.rejectedWith(
							'Organization not found: 999999',
						);
					});

					it('should support arbitrary pinejs options', async function () {
						const [device] = await balena.models.device.getAllByOrganization(
							ctx.initialOrg.id,
							{ $select: ['id'] },
						);
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});

					it('should be able to retrieve computed terms', async function () {
						const [device] = await balena.models.device.getAllByOrganization(
							ctx.initialOrg.id,
							{
								$select: ['overall_status', 'overall_progress'],
							},
						);
						return expect(device).to.deep.match({
							overall_status: 'inactive',
							overall_progress: null,
						});
					});
				});

				parallel('balena.models.device.get()', function () {
					it('should be able to get the device by uuid', async function () {
						const device = await balena.models.device.get(ctx.device.uuid);
						return expect(device.id).to.equal(ctx.device.id);
					});

					it('should be able to get the device by id', async function () {
						const device = await balena.models.device.get(ctx.device.id);
						return expect(device.id).to.equal(ctx.device.id);
					});

					it('should be rejected if the device name does not exist', function () {
						const promise = balena.models.device.get('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.get(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					it('should be able to use a shorter uuid', async function () {
						const device = await balena.models.device.get(
							ctx.device.uuid.slice(0, 8),
						);
						return expect(device.id).to.equal(ctx.device.id);
					});

					it('should support arbitrary pinejs options', async function () {
						const device = await balena.models.device.get(ctx.device.id, {
							$select: ['id'],
						});
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});

					it('should be able to retrieve computed terms', async function () {
						const device = await balena.models.device.get(ctx.device.uuid, {
							$select: ['overall_status', 'overall_progress'],
						});
						return expect(device).to.deep.match({
							overall_status: 'inactive',
							overall_progress: null,
						});
					});
				});

				parallel('balena.models.device.getByName()', function () {
					it('should be able to get the device', async function () {
						const devices = await balena.models.device.getByName(
							ctx.device.device_name,
						);
						expect(devices).to.have.length(1);
						return expect(devices[0].id).to.equal(ctx.device.id);
					});

					it('should be rejected if the device does not exist', function () {
						const promise = balena.models.device.getByName('HelloWorldDevice');
						return expect(promise).to.be.rejectedWith(
							'Device not found: HelloWorldDevice',
						);
					});

					it('should support arbitrary pinejs options', async function () {
						const [device] = await balena.models.device.getByName(
							ctx.device.device_name,
							{ $select: ['id'] },
						);
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});
				});

				parallel('balena.models.device.getName()', function () {
					it('should get the correct name by uuid', async function () {
						const name = await balena.models.device.getName(ctx.device.uuid);
						return expect(name).to.equal(ctx.device.device_name);
					});

					it('should get the correct name by id', async function () {
						const name = await balena.models.device.getName(ctx.device.id);
						return expect(name).to.equal(ctx.device.device_name);
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.getName('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getName(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.getApplicationName()', function () {
					['id', 'uuid'].forEach((prop) => {
						it(`should get the correct application name from a device ${prop}`, async function () {
							const result = await balena.models.device.getApplicationName(
								ctx.device[prop],
							);
							expect(result).to.equal(ctx.application.app_name);
						});
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise =
							balena.models.device.getApplicationName('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getApplicationName(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.has()', function () {
					['id', 'uuid'].forEach((prop) => {
						it(`should eventually be true if the device ${prop} exists`, async function () {
							const result = await balena.models.device.has(ctx.device[prop]);
							expect(result).to.be.true;
						});
					});

					it('should return false if the device id is undefined', async function () {
						// @ts-expect-error invalid parameter
						const result = await balena.models.application.has(undefined);
						expect(result).to.be.false;
					});

					it('should eventually be false if the device uuid does not exist', async function () {
						const result = await balena.models.device.has('asdfghjkl');
						expect(result).to.be.false;
					});

					it('should eventually be false if the device id does not exist', async function () {
						const result = await balena.models.device.has(999999);
						expect(result).to.be.false;
					});
				});

				parallel('balena.models.device.isOnline()', function () {
					['id', 'uuid'].forEach((prop) => {
						it(`should eventually be false if the device ${prop} is offline`, async function () {
							const result = await balena.models.device.isOnline(
								ctx.device[prop],
							);
							expect(result).to.be.false;
						});
					});

					it('should be rejected if the device uuid does not exist', async function () {
						const promise = balena.models.device.isOnline('asdfghjkl');
						await expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', async function () {
						const promise = balena.models.device.isOnline(999999);
						await expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.getLocalIPAddresses()', function () {
					['id', 'uuid'].forEach((prop) => {
						it(`should be rejected with an offline error if the device ${prop} is offline`, async function () {
							const promise = balena.models.device.getLocalIPAddresses(
								ctx.device[prop],
							);
							await expect(promise).to.be.rejectedWith(
								`The device is offline: ${ctx.device[prop]}`,
							);
						});
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise =
							balena.models.device.getLocalIPAddresses('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getLocalIPAddresses(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.getMACAddresses()', function () {
					it('should be rejected if the device uuid does not exist', async function () {
						const promise = balena.models.device.getMACAddresses('asdfghjkl');
						await expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', async function () {
						const promise = balena.models.device.getMACAddresses(999999);
						await expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					deviceUniqueFields.forEach((field) => {
						it(`should retrieve a empty list of mac addresses by ${field}`, async function () {
							const result = await balena.models.device.getMACAddresses(
								ctx.device[field],
							);
							expect(result).to.deep.equal([]);
						});
					});
				});

				parallel('balena.models.device.getMetrics()', function () {
					it('should be rejected if the device uuid does not exist', async function () {
						const promise = balena.models.device.getMetrics('asdfghjkl');
						await expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', async function () {
						const promise = balena.models.device.getMetrics(999999);
						await expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					deviceUniqueFields.forEach((field) => {
						it(`should retrieve an empty device metrics object by ${field}`, async function () {
							const result = await balena.models.device.getMetrics(
								ctx.device[field],
							);
							expect(result).to.deep.equal({
								memory_usage: null,
								memory_total: null,
								storage_block_device: null,
								storage_usage: null,
								storage_total: null,
								cpu_usage: null,
								cpu_temp: null,
								cpu_id: null,
								is_undervolted: false,
							});
						});
					});
				});

				describe('balena.models.device.getMACAddresses()', function () {
					givenADevice(before, {
						mac_address: '00:11:22:33:44:55 66:77:88:99:AA:BB',
					});

					before(function () {
						ctx = this;
					});

					parallel('', function () {
						deviceUniqueFields.forEach((field) => {
							it(`should be able to retrieve the device mac addresses by ${field}`, async function () {
								const result = await balena.models.device.getMACAddresses(
									ctx.device[field],
								);
								expect(result).to.deep.equal([
									'00:11:22:33:44:55',
									'66:77:88:99:AA:BB',
								]);
							});
						});
					});
				});

				describe('balena.models.device.getMetrics()', function () {
					givenADevice(before, {
						cpu_usage: 34,
						memory_usage: 1000, // 1GB in MiB
						memory_total: 4000, // 4GB in MiB
						storage_block_device: '/dev/mmcblk0',
						storage_usage: 1000, // 1GB in MiB
						storage_total: 64000, // 64GB in MiB
						cpu_temp: 56,
						is_undervolted: true,
						cpu_id: 'a CPU string',
					});

					before(function () {
						ctx = this;
					});

					parallel('', function () {
						deviceUniqueFields.forEach((field) => {
							it(`should be able to retrieve the device metrics by ${field}`, async function () {
								const result = await balena.models.device.getMetrics(
									ctx.device[field],
								);
								expect(result).to.deep.equal({
									cpu_usage: 34,
									memory_usage: 1000, // 1GB in MiB
									memory_total: 4000, // 4GB in MiB
									storage_block_device: '/dev/mmcblk0',
									storage_usage: 1000, // 1GB in MiB
									storage_total: 64000, // 64GB in MiB
									cpu_temp: 56,
									is_undervolted: true,
									cpu_id: 'a CPU string',
								});
							});
						});
					});
				});
			});

			describe('[contained scenario]', function () {
				givenADevice(before);

				describe('balena.models.device.rename()', function () {
					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.rename('asdfghjkl', 'Foo Bar');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.rename(999999, 'Foo Bar');
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					describe('[contained scenario]', function () {
						it('should be able to rename the device by uuid', async function () {
							await balena.models.device.rename(
								this.device.uuid,
								'FooBarDeviceByUuid',
							);
							const name = await balena.models.device.getName(this.device.uuid);
							return expect(name).to.equal('FooBarDeviceByUuid');
						});

						it('should be able to rename the device by id', async function () {
							await balena.models.device.rename(
								this.device.id,
								'FooBarDeviceById',
							);
							const name = await balena.models.device.getName(this.device.id);
							return expect(name).to.equal('FooBarDeviceById');
						});

						it('should be able to rename the device using a shorter uuid', async function () {
							await balena.models.device.rename(
								this.device.uuid.slice(0, 7),
								'FooBarDeviceByShortUuid',
							);
							const name = await balena.models.device.getName(this.device.uuid);
							return expect(name).to.equal('FooBarDeviceByShortUuid');
						});
					});
				});

				describe('balena.models.device.setCustomLocation()', function () {
					it('should be able to set the location of a device by uuid', async function () {
						await balena.models.device.setCustomLocation(this.device.uuid, {
							latitude: 41.383333,
							longitude: 2.183333,
						});
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('41.383333');
						return expect(device.custom_longitude).to.equal('2.183333');
					});

					it('should be able to set the location of a device by id', async function () {
						await balena.models.device.setCustomLocation(this.device.id, {
							latitude: 42.383333,
							longitude: 2.283333,
						});
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('42.383333');
						return expect(device.custom_longitude).to.equal('2.283333');
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.setCustomLocation(
							'asdfghjkl',
							{
								latitude: 43.383333,
								longitude: 2.383333,
							},
						);
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.setCustomLocation(999999, {
							latitude: 44.383333,
							longitude: 2.483333,
						});
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				describe('balena.models.device.unsetCustomLocation()', function () {
					beforeEach(function () {
						return balena.models.device.setCustomLocation(this.device.id, {
							latitude: 41.383333,
							longitude: 2.183333,
						});
					});

					it('should be able to unset the location of a device by uuid', async function () {
						await balena.models.device.unsetCustomLocation(this.device.uuid);
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('');
						return expect(device.custom_longitude).to.equal('');
					});

					it('should be able to unset the location of a device by id', async function () {
						await balena.models.device.unsetCustomLocation(this.device.id);
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('');
						return expect(device.custom_longitude).to.equal('');
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise =
							balena.models.device.unsetCustomLocation('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.unsetCustomLocation(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				describe('balena.models.device.setNote()', function () {
					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.setNote(
							'asdfghjkl',
							'My note',
						);
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.setNote(999999, 'My note');
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					describe('[contained scenario]', function () {
						it('should be able to note a device by uuid', async function () {
							await balena.models.device.setNote(
								this.device.uuid,
								'What you do today can improve all your tomorrows by uuid',
							);
							const device = await balena.models.device.get(this.device.uuid);
							return expect(device.note).to.equal(
								'What you do today can improve all your tomorrows by uuid',
							);
						});

						it('should be able to note a device by id', async function () {
							await balena.models.device.setNote(
								this.device.id,
								'What you do today can improve all your tomorrows by id',
							);
							const device = await balena.models.device.get(this.device.id);
							return expect(device.note).to.equal(
								'What you do today can improve all your tomorrows by id',
							);
						});
					});
				});

				describe('balena.models.device.grantSupportAccess()', function () {
					it('should throw an error if the expiry time stamp is in the past', function () {
						const expiryTimestamp = Date.now() - 3600 * 1000;

						return expect(
							balena.models.device.grantSupportAccess(
								this.device.id,
								expiryTimestamp,
							),
						).to.be.rejected;
					});

					it('should throw an error if the expiry time stamp is undefined', function () {
						return expect(
							// @ts-expect-error missing parameter
							balena.models.device.grantSupportAccess(this.device.id),
						).to.be.rejected;
					});

					it('should grant support access for the correct amount of time', async function () {
						const expiryTimestamp = Date.now() + 3600 * 1000;
						await balena.models.device.grantSupportAccess(
							this.device.id,
							expiryTimestamp,
						);
						const { is_accessible_by_support_until__date } =
							await balena.models.device.get(this.device.id, {
								$select: 'is_accessible_by_support_until__date',
							});
						return expect(
							Date.parse(is_accessible_by_support_until__date ?? '0'),
						).to.equal(expiryTimestamp);
					});
				});

				describe('balena.models.device.revokeSupportAccess()', function () {
					before(async function () {
						const { is_accessible_by_support_until__date } =
							await balena.models.device.get(this.device.id, {
								$select: 'is_accessible_by_support_until__date',
							});
						expect(is_accessible_by_support_until__date).to.not.be.null;
					});

					it('...should revoke support access', async function () {
						await balena.models.device.revokeSupportAccess(this.device.id);
						const { is_accessible_by_support_until__date } =
							await balena.models.device.get(this.device.id, {
								$select: 'is_accessible_by_support_until__date',
							});
						return expect(is_accessible_by_support_until__date).to.be.null;
					});
				});

				describe('balena.models.device.generateDeviceKey()', function () {
					it('should be able to generate a device key by uuid', async function () {
						const deviceApiKey = await balena.models.device.generateDeviceKey(
							this.device.uuid,
						);
						expect(deviceApiKey).to.be.a('string');
						return expect(deviceApiKey).to.have.length(32);
					});

					it('should be able to generate a device key by id', async function () {
						const deviceApiKey = await balena.models.device.generateDeviceKey(
							this.device.id,
						);
						expect(deviceApiKey).to.be.a('string');
						return expect(deviceApiKey).to.have.length(32);
					});

					it(`should be able to generate a device key with name and description`, async function () {
						const deviceApiKey =
							await balena.models.apiKey.getDeviceApiKeysByDevice(
								this.device.id,
							);

						const key = await balena.models.device.generateDeviceKey(
							this.device.id,
							'device_key',
							`Device key generated for device ${this.device.id}`,
						);

						expect(key).to.be.a('string');
						expect(key).to.have.length(32);
						const updatedDeviceKeys =
							await balena.models.apiKey.getDeviceApiKeysByDevice(
								this.device.id,
							);

						const deviceKeys = _.differenceWith(
							updatedDeviceKeys,
							deviceApiKey,
							_.isEqual,
						);

						expect(deviceKeys).to.have.lengthOf(1);
						expect(deviceKeys[0]).to.have.property('name', 'device_key');
						expect(deviceKeys[0]).to.have.property(
							'description',
							`Device key generated for device ${this.device.id}`,
						);
					});

					it(`should be able to generate a device key with name, description and expiryDate`, async function () {
						const tomorrowDate = new Date(Date.now() + 86400000).toISOString(); // one day in future
						const deviceApiKey =
							await balena.models.apiKey.getDeviceApiKeysByDevice(
								this.device.id,
							);

						const key = await balena.models.device.generateDeviceKey(
							this.device.id,
							'device_key_with_expiry',
							`Device key generated for device ${this.device.id}`,
							tomorrowDate,
						);

						expect(key).to.be.a('string');
						expect(key).to.have.length(32);
						const updatedDeviceKeys =
							await balena.models.apiKey.getDeviceApiKeysByDevice(
								this.device.id,
							);

						const deviceKeys = _.differenceWith(
							updatedDeviceKeys,
							deviceApiKey,
							_.isEqual,
						);

						expect(deviceKeys).to.have.lengthOf(1);
						expect(deviceKeys[0]).to.have.property(
							'name',
							'device_key_with_expiry',
						);
						expect(deviceKeys[0]).to.have.property('expiry_date', tomorrowDate);
					});

					it('should be rejected if the device name does not exist', function () {
						const promise = balena.models.device.generateDeviceKey('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.generateDeviceKey(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					it('should be able to use a shorter uuid', async function () {
						const deviceApiKey = await balena.models.device.generateDeviceKey(
							this.device.uuid.slice(0, 8),
						);
						expect(deviceApiKey).to.be.a('string');
						return expect(deviceApiKey).to.have.length(32);
					});
				});
			});

			describe('balena.models.device.remove()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.remove('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.remove(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('[mutating operations]', function () {
					givenADevice(beforeEach);

					it('should be able to remove the device by uuid', async function () {
						await balena.models.device.remove(this.device.uuid);
						const devices = await balena.models.device.getAllByApplication(
							this.application.id,
						);
						return expect(devices).to.deep.equal([]);
					});

					it('should be able to remove the device by id', async function () {
						await balena.models.device.remove(this.device.id);
						const devices = await balena.models.device.getAllByApplication(
							this.application.id,
						);
						return expect(devices).to.deep.equal([]);
					});

					it('should be able to remove the device using a shorter uuid', async function () {
						await balena.models.device.remove(this.device.uuid.slice(0, 7));
						const devices = await balena.models.device.getAllByApplication(
							this.application.id,
						);
						return expect(devices).to.deep.equal([]);
					});
				});
			});

			describe('balena.models.device.hasDeviceUrl()', function () {
				givenADevice(before);

				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.hasDeviceUrl('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.hasDeviceUrl(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('given device url is disabled', function () {
					['id', 'uuid'].forEach((prop) => {
						it(`should eventually be false given a device ${prop}`, async function () {
							const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
								this.device[prop],
							);
							expect(hasDeviceUrl).to.be.false;
						});
					});
				});

				describe('given device url is enabled', function () {
					before(function () {
						return balena.models.device.enableDeviceUrl(this.device.id);
					});

					['id', 'uuid'].forEach((prop) => {
						it(`should eventually be true given a device ${prop}`, async function () {
							const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
								this.device[prop],
							);
							expect(hasDeviceUrl).to.be.true;
						});
					});
				});
			});

			describe('balena.models.device.getDeviceUrl()', function () {
				givenADevice(before);

				describe('given a newly created device', function () {
					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.getDeviceUrl('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getDeviceUrl(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				describe('given device url is disabled', function () {
					['id', 'uuid'].forEach((prop) => {
						it(`should be rejected with an error given a device ${prop}`, async function () {
							const promise = balena.models.device.getDeviceUrl(
								this.device[prop],
							);
							await expect(promise).to.be.rejectedWith(
								`Device is not web accessible: ${this.device[prop]}`,
							);
						});
					});
				});

				describe('given device url is enabled', function () {
					before(function () {
						return balena.models.device.enableDeviceUrl(this.device.id);
					});

					it('should eventually return the correct device url given a shorter uuid', async function () {
						const deviceUrl = await balena.models.device.getDeviceUrl(
							this.device.uuid.slice(0, 7),
						);
						return expect(deviceUrl).to.match(/[a-z0-9]{32}/);
					});

					it('should eventually return the correct device url given an id', async function () {
						const deviceUrl = await balena.models.device.getDeviceUrl(
							this.device.id,
						);
						return expect(deviceUrl).to.match(/[a-z0-9]{32}/);
					});

					it('should eventually be an absolute url given a uuid', async function () {
						const url = await balena.models.device.getDeviceUrl(
							this.device.uuid,
						);
						const response = await makeRequest(url);
						expect(response.isError).to.equal(true);
						// in the browser we don't get the details
						// honestly it's unclear why, as it works for other services
						if (IS_BROWSER) {
							return;
						}
						// Because the device is not online
						expect(response.status).to.equal(503);
						return expect(response.response).to.match(/Device Public URLs/);
					});
				});
			});

			describe('balena.models.device.enableDeviceUrl()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.enableDeviceUrl('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.enableDeviceUrl(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('given the device url is disabled', function () {
					givenADevice(beforeEach);

					['id', 'uuid'].forEach((prop) => {
						it(`should be able to enable web access using a ${prop}`, async function () {
							await balena.models.device.enableDeviceUrl(this.device[prop]);
							const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
								this.device.id,
							);
							expect(hasDeviceUrl).to.be.true;
						});
					});

					it('should be able to enable web access using a shorter uuid', async function () {
						await balena.models.device.enableDeviceUrl(
							this.device.uuid.slice(0, 7),
						);
						const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
							this.device.id,
						);
						expect(hasDeviceUrl).to.be.true;
					});
				});
			});

			describe('balena.models.device.disableDeviceUrl()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.disableDeviceUrl('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.disableDeviceUrl(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('given device url is enabled', function () {
					givenADevice(before);

					beforeEach(async function () {
						await balena.models.device.enableDeviceUrl(this.device.id);
						const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
							this.device.id,
						);
						expect(hasDeviceUrl).to.be.true;
					});

					it('should be able to disable web access using a uuid', async function () {
						await balena.models.device.disableDeviceUrl(this.device.uuid);
						const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
							this.device.id,
						);
						expect(hasDeviceUrl).to.be.false;
					});

					it('should be able to disable web access using an id', async function () {
						await balena.models.device.disableDeviceUrl(this.device.id);
						const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
							this.device.id,
						);
						expect(hasDeviceUrl).to.be.false;
					});

					it('should be able to disable web access using a shorter uuid', async function () {
						await balena.models.device.disableDeviceUrl(
							this.device.uuid.slice(0, 7),
						);
						const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
							this.device.id,
						);
						expect(hasDeviceUrl).to.be.false;
					});
				});
			});

			describe('Given a device with a production image', function () {
				givenADevice(before, {
					is_online: true,
					...testDeviceOsInfo,
					os_variant: 'prod',
					last_connectivity_event: '2019-05-13T16:14',
				});

				describe('balena.models.device.getLocalModeSupport()', () => {
					it('should identify the device as not supported', function () {
						return expect(
							balena.models.device.getLocalModeSupport(this.device),
						).to.deep.equal({
							supported: false,
							message:
								'Local mode is only supported on development OS versions',
						});
					});
				});

				describe('balena.models.device.isInLocalMode()', function () {
					it('should be false by default for a device retrieved by uuid', async function () {
						const isInLocalMode = await balena.models.device.isInLocalMode(
							this.device.uuid,
						);
						return expect(isInLocalMode).to.be.false;
					});

					it('should be false by default for a device retrieved by id', async function () {
						const isInLocalMode = await balena.models.device.isInLocalMode(
							this.device.id,
						);
						return expect(isInLocalMode).to.be.false;
					});
				});

				describe('balena.models.device.enableLocalMode()', function () {
					it('should not be able to enable local mode by uuid', function () {
						const promise = balena.models.device.enableLocalMode(
							this.device.uuid,
						);
						return expect(promise).to.be.rejectedWith(
							'Local mode is only supported on development OS versions',
						);
					});

					it('should not be able to enable local mode by id', function () {
						const promise = balena.models.device.enableLocalMode(
							this.device.id,
						);
						return expect(promise).to.be.rejectedWith(
							'Local mode is only supported on development OS versions',
						);
					});
				});
			});

			describe('Given a device with a development image', function () {
				givenADevice(before, {
					is_online: true,
					...testDeviceOsInfo,
					os_variant: 'dev',
					last_connectivity_event: '2019-05-13T16:14',
				});

				describe('balena.models.device.getLocalModeSupport()', () => {
					it('should identify the device as supported', function () {
						return expect(
							balena.models.device.getLocalModeSupport(this.device),
						).to.deep.equal({
							supported: true,
							message: 'Supported',
						});
					});
				});

				describe('[mutating operations]', () => {
					deviceUniqueFields.forEach(function (deviceParam) {
						describe('balena.models.device.isInLocalMode()', function () {
							it(`should be false by default for a device retrieved by ${deviceParam}`, async function () {
								const isInLocalMode = await balena.models.device.isInLocalMode(
									this.device[deviceParam],
								);
								return expect(isInLocalMode).to.be.false;
							});

							it(`should be rejected if a device with that ${deviceParam} does not exist`, function () {
								const deviceParamValue =
									deviceParam === 'id' ? 999999 : 'asdfghjkl';
								const promise =
									balena.models.device.isInLocalMode(deviceParamValue);
								return expect(promise).to.be.rejectedWith(
									`Device not found: ${deviceParamValue}`,
								);
							});
						});

						describe('balena.models.device.enableLocalMode()', function () {
							it(`should be able to enable local mode by ${deviceParam}`, async function () {
								await balena.models.device.enableLocalMode(
									this.device[deviceParam],
								);
								const isInLocalMode = await balena.models.device.isInLocalMode(
									this.device[deviceParam],
								);
								return expect(isInLocalMode).to.be.true;
							});

							it(`should be rejected if a device with that ${deviceParam} does not exist`, function () {
								const deviceParamValue =
									deviceParam === 'id' ? 999999 : 'asdfghjkl';
								const promise =
									balena.models.device.enableLocalMode(deviceParamValue);
								return expect(promise).to.be.rejectedWith(
									`Device not found: ${deviceParamValue}`,
								);
							});
						});

						describe('balena.models.device.disableLocalMode()', function () {
							it(`should be able to disable local mode by ${deviceParam}`, async function () {
								await balena.models.device.disableLocalMode(
									this.device[deviceParam],
								);
								const isInLocalMode = await balena.models.device.isInLocalMode(
									this.device[deviceParam],
								);
								return expect(isInLocalMode).to.be.false;
							});

							it(`should be rejected if a device with that ${deviceParam} does not exist`, function () {
								const deviceParamValue =
									deviceParam === 'id' ? 999999 : 'asdfghjkl';
								const promise =
									balena.models.device.disableLocalMode(deviceParamValue);
								return expect(promise).to.be.rejectedWith(
									`Device not found: ${deviceParamValue}`,
								);
							});
						});
					});
				});
			});

			describe('balena.models.device.hasLockOverride()', function () {
				givenADevice(before);

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`should be false by default for a device retrieved by ${deviceParam}`, async function () {
						const hasLockOverride = await balena.models.device.hasLockOverride(
							this.device[deviceParam],
						);
						return expect(hasLockOverride).to.be.false;
					});
				});

				const OVERRIDE_LOCK_ENV_VAR = 'RESIN_OVERRIDE_LOCK';

				it('should be true for a device that has the device config var set to 0 and no app config var', async function () {
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.false;
				});

				it('should be true for a device that has the device config var set to 1 and no app config var', async function () {
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.true;
				});

				it('should be true for a device that has the app config var set to 0 and no device config var', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					await balena.models.device.configVar.remove(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.false;
				});

				it('should be true for a device that has the app config var set to 1 and no device config var', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					await balena.models.device.configVar.remove(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.true;
				});

				it('should be false for a device that has the app config var set to 1 and the device config var set to 0', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.false;
				});

				it('should be true for a device that has the app config var set to 0 and the device config var set to 1', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.true;
				});
			});

			describe('balena.models.device.enableLockOverride()', function () {
				givenADevice(beforeEach);

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`should be able to enable lock override by ${deviceParam}`, async function () {
						await balena.models.device.enableLockOverride(
							this.device[deviceParam],
						);
						const hasLockOverride = await balena.models.device.hasLockOverride(
							this.device[deviceParam],
						);
						return expect(hasLockOverride).to.be.true;
					});
				});
			});

			describe('balena.models.device.disableLockOverride()', function () {
				givenADevice(before);

				beforeEach(async function () {
					await balena.models.device.enableLockOverride(this.device.uuid);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					expect(hasLockOverride).to.be.true;
				});

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`should be able to disable lock override by ${deviceParam}`, async function () {
						await balena.models.device.disableLockOverride(
							this.device[deviceParam],
						);
						const hasLockOverride = await balena.models.device.hasLockOverride(
							this.device[deviceParam],
						);
						return expect(hasLockOverride).to.be.false;
					});
				});
			});

			describe('balena.models.device.getOsUpdateStatus()', function () {
				givenADevice(before);

				it('should be able to get the current OS update status', async function () {
					const status = await balena.models.device.getOsUpdateStatus(
						this.device.uuid,
					);
					return expect(status).to.deep.match({
						status: 'idle',
					});
				});

				it('should be rejected if the device does not exist', function () {
					const promise = balena.models.device.getOsUpdateStatus('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});
			});

			['single uuid', 'array of uuids'].forEach((paramType) => {
				describe(`balena.models.device.startOsUpdate() called with ${paramType}`, function () {
					givenADevice(before);
					describe('given an offline device w/o os info', function () {
						it('should be rejected if the device does not exist and using using short uuid', async function () {
							const promise =
								paramType === 'array of uuids'
									? balena.models.device.startOsUpdate(
											['asdfghjkl'],
											'2.29.2+rev1.prod',
										)
									: balena.models.device.startOsUpdate(
											'asdfghjkl',
											'2.29.2+rev1.prod',
										);
							await expect(promise).to.be.rejectedWith(
								paramType === 'array of uuids'
									? `Invalid parameter: asdfghjkl is not a valid value for parameter 'uuidOrIdOrArray'`
									: 'Device not found: asdfghjkl',
							);
						});

						it('should be rejected if the device does not exist and using using full uuid', async function () {
							const promise =
								paramType === 'array of uuids'
									? balena.models.device.startOsUpdate(
											['asdfghjkld8047d2ae2546389241ea0a'],
											'2.29.2+rev1.prod',
										)
									: balena.models.device.startOsUpdate(
											'asdfghjkld8047d2ae2546389241ea0a',
											'2.29.2+rev1.prod',
										);
							await expect(promise).to.be.rejectedWith(
								'Device not found: asdfghjkld8047d2ae2546389241ea0a',
							);
						});

						it('should not be able to start an OS update without providing a targetOsVersion parameter', async function () {
							const promise =
								paramType === 'array of uuids'
									? // @ts-expect-error missing parameter
										balena.models.device.startOsUpdate([this.device.uuid])
									: // @ts-expect-error missing parameter
										balena.models.device.startOsUpdate(this.device.uuid);
							await expect(promise).to.be.rejected.and.eventually.have.property(
								'code',
								'BalenaInvalidParameterError',
							);
						});

						it('should not be able to start an OS update for an offline device', async function () {
							const promise =
								paramType === 'array of uuids'
									? balena.models.device.startOsUpdate(
											[this.device.uuid],
											'2.29.2+rev1.prod',
										)
									: balena.models.device.startOsUpdate(
											this.device.uuid,
											'2.29.2+rev1.prod',
										);
							await expect(promise).to.be.rejectedWith(
								`The device is offline: ${this.device.uuid}`,
							);
						});
					});

					describe('given an online device w/o os info', function () {
						before(async function () {
							await balena.pine.patch({
								resource: 'device',
								id: this.device.id,
								body: { is_online: true },
							});
						});

						it('should not be able to start an OS update for a device that has not yet reported its current version', async function () {
							const promise =
								paramType === 'array of uuids'
									? balena.models.device.startOsUpdate(
											[this.device.uuid],
											'2.29.2+rev1.prod',
										)
									: balena.models.device.startOsUpdate(
											this.device.uuid,
											'2.29.2+rev1.prod',
										);
							await expect(promise).to.be.rejectedWith(
								`The current os version of the device is not available: ${this.device.uuid}`,
							);
						});
					});

					describe('given an online device with os info', function () {
						before(async function () {
							await balena.pine.patch({
								resource: 'device',
								id: this.device.id,
								body: {
									is_online: true,
									...testDeviceOsInfo,
								},
							});
						});

						it('should not be able to start an OS update when the target os version is not specified', async function () {
							// @ts-expect-error missing parameter
							const promise = balena.models.device.startOsUpdate(
								paramType === 'array of uuids'
									? [this.device.uuid]
									: this.device.uuid,
							);
							await expect(promise)
								.to.be.rejectedWith(
									"undefined is not a valid value for parameter 'targetOsVersion'",
								)
								.and.eventually.have.property(
									'code',
									'BalenaInvalidParameterError',
								);
						});

						it('should not be able to start an OS update when the target os version does not exist', async function () {
							const promise = balena.models.device.startOsUpdate(
								paramType === 'array of uuids'
									? [this.device.uuid]
									: this.device.uuid,
								'2.49.0+rev1.prod',
							);
							await expect(promise)
								.to.be.rejectedWith(
									"2.49.0+rev1.prod is not a valid value for parameter 'targetOsVersion'",
								)
								.and.eventually.have.property(
									'code',
									'BalenaInvalidParameterError',
								);
						});

						// just to confirm that the above checks do not give false positives,
						// allow the request to reach the actions server and document the current error
						it('should not be able to start an OS update for a fake device', async function () {
							const promise = balena.models.device.startOsUpdate(
								paramType === 'array of uuids'
									? [this.device.uuid]
									: this.device.uuid,
								'2.54.2+rev1.prod',
							);
							await expect(promise).to.be.rejected.then(function (error) {
								expect(error).to.have.property('statusCode', 500);
								expect(error).to.have.property(
									'message',
									'Request error: Device is not online',
								);
								expect(error.code).to.not.equal('BalenaInvalidParameterError');
							});
						});
					});
				});
			});

			describe('balena.models.device.tags', function () {
				givenADevice(before);

				const appTagTestOptions: tagsHelper.Options = {
					model: balena.models.device.tags,
					modelNamespace: 'balena.models.device.tags',
					resourceName: 'application',
					uniquePropertyNames: applicationRetrievalFields,
				};

				const deviceTagTestOptions: tagsHelper.Options = {
					model: balena.models.device.tags,
					modelNamespace: 'balena.models.device.tags',
					resourceName: 'device',
					uniquePropertyNames: deviceUniqueFields,
				};

				before(function () {
					appTagTestOptions.resourceProvider = () => this.application;
					deviceTagTestOptions.resourceProvider = () => this.device;
					// used for tag creation during the
					// device.tags.getAllByApplication() test
					appTagTestOptions.setTagResourceProvider = () => this.device;
				});

				itShouldSetGetAndRemoveTags(deviceTagTestOptions);

				describe('balena.models.device.tags.getAllByApplication()', function () {
					itShouldGetAllTagsByResource(appTagTestOptions);
				});

				describe('balena.models.device.tags.getAllByDevice()', function () {
					itShouldGetAllTagsByResource(deviceTagTestOptions);
				});
			});

			describe('balena.models.device.configVar', function () {
				givenADevice(before);

				const configVarModel = balena.models.device.configVar;

				deviceUniqueFields.forEach(function (deviceParam) {
					const deviceParamUpper = deviceParam.toUpperCase();

					it(`can create a variable by ${deviceParam}`, function () {
						const promise = configVarModel.set(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
							'vim',
						);
						return expect(promise).to.not.be.rejected;
					});

					it(`...can retrieve a created variable by ${deviceParam}`, async function () {
						const result = await configVarModel.get(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						return expect(result).to.equal('vim');
					});

					it(`...can update and retrieve a variable by ${deviceParam}`, async function () {
						await configVarModel.set(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
							'emacs',
						);
						const result = await configVarModel.get(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						return expect(result).to.equal('emacs');
					});

					it(`...can delete and then fail to retrieve a variable by ${deviceParam}`, async function () {
						await configVarModel.remove(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						const result = await configVarModel.get(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						return expect(result).to.equal(undefined);
					});

					it(`can create and then retrieve multiple variables by ${deviceParamUpper}`, async function () {
						await Promise.all([
							configVarModel.set(
								this.device[deviceParam],
								`BALENA_A_${deviceParamUpper}`,
								'a',
							),
							configVarModel.set(
								this.device[deviceParam],
								`BALENA_B_${deviceParamUpper}`,
								'b',
							),
						]);
						const result = await configVarModel.getAllByDevice(
							this.device[deviceParam],
						);
						expect(_.find(result, { name: `BALENA_A_${deviceParamUpper}` }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: `BALENA_B_${deviceParamUpper}` }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return await Promise.all([
							configVarModel.remove(
								this.device[deviceParam],
								`BALENA_A_${deviceParamUpper}`,
							),
							configVarModel.remove(
								this.device[deviceParam],
								`BALENA_B_${deviceParamUpper}`,
							),
						]);
					});
				});

				it('can create and then retrieve multiple variables by application', async function () {
					await Promise.all([
						configVarModel.set(this.device.id, 'BALENA_A_BY_APPLICATION', 'a'),
						configVarModel.set(this.device.id, 'BALENA_B_BY_APPLICATION', 'b'),
					]);
					const result = await configVarModel.getAllByApplication(
						this.application.id,
					);
					expect(_.find(result, { name: 'BALENA_A_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'a');
					expect(_.find(result, { name: 'BALENA_B_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'b');
					return await Promise.all([
						configVarModel.remove(this.device.id, 'BALENA_A_BY_APPLICATION'),
						configVarModel.remove(this.device.id, 'BALENA_B_BY_APPLICATION'),
					]);
				});
			});

			describe('balena.models.device.envVar', function () {
				givenADevice(before);

				const envVarModel = balena.models.device.envVar;

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`can create a variable by ${deviceParam}`, function () {
						const promise = envVarModel.set(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
							'vim',
						);
						return expect(promise).to.not.be.rejected;
					});

					it(`...can retrieve a created variable by ${deviceParam}`, async function () {
						const result = await envVarModel.get(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal('vim');
					});

					it(`...can update and retrieve a variable by ${deviceParam}`, async function () {
						await envVarModel.set(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
							'emacs',
						);
						const result = await envVarModel.get(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal('emacs');
					});

					it(`...can delete and then fail to retrieve a variable by ${deviceParam}`, async function () {
						await envVarModel.remove(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						const result = await envVarModel.get(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal(undefined);
					});

					it(`can create and then retrieve multiple variables by ${deviceParam}`, async function () {
						await Promise.all([
							envVarModel.set(
								this.device[deviceParam],
								`A_BY_${deviceParam}`,
								'a',
							),
							envVarModel.set(
								this.device[deviceParam],
								`B_BY_${deviceParam}`,
								'b',
							),
						]);
						const result = await envVarModel.getAllByDevice(
							this.device[deviceParam],
						);
						expect(_.find(result, { name: `A_BY_${deviceParam}` }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: `B_BY_${deviceParam}` }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return await Promise.all([
							envVarModel.remove(
								this.device[deviceParam],
								`A_BY_${deviceParam}`,
							),
							envVarModel.remove(
								this.device[deviceParam],
								`B_BY_${deviceParam}`,
							),
						]);
					});
				});

				it('can create and then retrieve multiple variables by application', async function () {
					await Promise.all([
						envVarModel.set(this.device.id, 'A_BY_APPLICATION', 'a'),
						envVarModel.set(this.device.id, 'B_BY_APPLICATION', 'b'),
					]);
					const result = await envVarModel.getAllByApplication(
						this.application.id,
					);
					expect(_.find(result, { name: 'A_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'a');
					expect(_.find(result, { name: 'B_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'b');
					return await Promise.all([
						envVarModel.remove(this.device.id, 'A_BY_APPLICATION'),
						envVarModel.remove(this.device.id, 'B_BY_APPLICATION'),
					]);
				});
			});

			describe('balena.models.device.getSupervisorTargetState()', function () {
				givenADevice(before);

				it('should be rejected if the device does not exist', function () {
					const promise =
						balena.models.device.getSupervisorTargetState('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it(`should reflect the device's target state`, async function () {
					const state = await balena.models.device.getSupervisorTargetState(
						this.device.id,
					);
					// first, check the name
					expect(state.local.name).to.be.a('string');
					expect(state.local.name).to.equal(this.device.device_name);

					// next, check application types and some values
					expect(state.local.apps).to.be.an('object');
					expect(state.local.apps[this.application.id].name).to.equal(
						this.application.app_name,
					);
					expect(state.local.apps[this.application.id].name).to.be.a('string');
					expect(state.local.apps[this.application.id].services).to.be.an(
						'object',
					);
					expect(state.local.apps[this.application.id].volumes).to.be.an(
						'object',
					);
					expect(state.local.apps[this.application.id].networks).to.be.an(
						'object',
					);

					// finally, check configuration type and values
					expect(state.local.config).to.be.an('object');
					expect(state.local.config['RESIN_SUPERVISOR_NATIVE_LOGGER']).to.equal(
						'true',
					);
					expect(state.local.config['RESIN_SUPERVISOR_POLL_INTERVAL']).to.equal(
						'900000',
					);
				});

				it(`should return a state v3 if version is set to 3`, async function () {
					const state = await balena.models.device.getSupervisorTargetState(
						this.device.id,
						3,
					);
					// basic check for v3 format
					expect(state[this.device.uuid].apps[this.application.uuid]).to.be.an(
						'object',
					);
				});
			});

			describe('balena.models.device.getSupervisorTargetStateForApp()', function () {
				givenADevice(before);

				it('should be rejected if the fleet does not exist', function () {
					const promise =
						balena.models.device.getSupervisorTargetStateForApp('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Application not found: asdfghjkl',
					);
				});

				it(`should give a device's target state (v3) for a _generic_ device of a fleet`, async function () {
					const state =
						await balena.models.device.getSupervisorTargetStateForApp(
							this.application.uuid,
						);

					// basic check for v3 format
					expect(
						state[this.application.uuid].apps[this.application.uuid],
					).to.be.an('object');

					// check the name
					expect(state[this.application.uuid].name).to.be.a('string');
					expect(state[this.application.uuid].name).to.equal(
						this.application.app_name,
					);

					// and the structure
					expect(state[this.application.uuid].apps).to.be.an('object');

					// finally, check configuration type and values
					expect(state[this.application.uuid].config).to.be.an('object');
					expect(
						state[this.application.uuid].config[
							'RESIN_SUPERVISOR_NATIVE_LOGGER'
						],
					).to.equal('true');
					expect(
						state[this.application.uuid].config[
							'RESIN_SUPERVISOR_POLL_INTERVAL'
						],
					).to.equal('900000');
				});

				it.skip(`should give a device's target state (v3) for a _generic_ device of a fleet and a specific release`, async function () {
					// Due to the complexity of setting up a release for the fleet to test here, this one is currently skipped.
					// Will be revisited later when the value of the test is greater than it's cost
				});
			});

			describe('balena.models.device.getSupervisorState()', function () {
				givenADevice(before);

				it('should be rejected if the device does not exist', function () {
					const promise = balena.models.device.getSupervisorState('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device exists but is inaccessible', function () {
					const promise = balena.models.device.getSupervisorState(
						this.device.id,
					);
					return expect(promise).to.be.rejectedWith(
						'No online device(s) found',
					);
				});
			});

			describe('balena.models.device.getStatus()', function () {
				givenADevice(before);

				// This tests that we give a sensible error for users of older SDK versions
				// that haven't migrated their code.
				it('should throw when passing an object as a parameter', async function () {
					const device = await balena.models.device.get(this.device.id);
					return expect(
						// @ts-expect-error invalid parameter
						balena.models.device.getStatus(device),
					).to.be.rejectedWith(
						"[object Object] is not a valid value for parameter 'uuidOrId'",
					);
				});

				describe('Given an inactive device', () => {
					deviceUniqueFields.forEach((prop) => {
						it(`should return inactive when retrieving by ${prop}`, async function () {
							const status = await balena.models.device.getStatus(
								this.device[prop],
							);
							expect(status).to.equal('inactive');
						});
					});
				});

				describe('Given an online device', function () {
					before(function () {
						return balena.pine.patch({
							resource: 'device',
							id: this.device.id,
							body: {
								// this also activates the device
								is_online: true,
							},
						});
					});

					deviceUniqueFields.forEach((prop) => {
						it(`should return idle when retrieving by ${prop}`, async function () {
							const status = await balena.models.device.getStatus(
								this.device[prop],
							);
							expect(status).to.equal('idle');
						});
					});
				});

				describe('Given an offline device', function () {
					before(function () {
						return balena.pine.patch({
							resource: 'device',
							id: this.device.id,
							body: {
								is_online: false,
							},
						});
					});

					deviceUniqueFields.forEach((prop) => {
						it(`should return offline when retrieving by ${prop}`, async function () {
							const status = await balena.models.device.getStatus(
								this.device[prop],
							);
							expect(status).to.equal('offline');
						});
					});
				});
			});
		});

		describe('given an online device', function () {
			givenADevice(before, {
				is_online: true,
				...testDeviceOsInfo,
			});

			describe('balena.models.device.get()', function () {
				it('should be able to retrieve computed terms', async function () {
					const device = await balena.models.device.get(this.device.uuid, {
						$select: ['overall_status', 'overall_progress'],
					});
					return expect(device).to.deep.match({
						overall_status: 'idle',
						overall_progress: null,
					});
				});
			});

			describe('balena.models.device.deactivate()', function () {
				it('should be rejected if the device is online with statusCode 400', function () {
					const promise = balena.models.device.deactivate(this.device.uuid);
					return expect(promise).to.be.rejected.then(function (error) {
						expect(error).to.have.property('statusCode', 400);
						return expect(error).to.have.property(
							'message',
							'Request error: Devices must be offline in order to be deactivated.',
						);
					});
				});
			});
		});

		describe('given a device id whose shorter uuid is only numbers', function () {
			before(async function () {
				// Preceeding 1 is so that this can't start with a 0, so we get reversible parsing later
				this.shortUuid = '1' + Date.now().toString().slice(-6);
				const uuid =
					this.shortUuid + balena.models.device.generateUniqueKey().slice(7);
				const deviceInfo = await balena.models.device.register(
					this.application.slug,
					uuid,
				);
				return (this.deviceInfo = deviceInfo);
			});

			describe('balena.models.device.get()', function () {
				it('should return the device given the shorter uuid as a string', async function () {
					const device = await balena.models.device.get(this.shortUuid);
					return expect(device.id).to.equal(this.deviceInfo.id);
				});

				it('should fail to find the device given the shorter uuid as a number', function () {
					const promise = balena.models.device.get(
						parseInt(this.shortUuid, 10),
					);
					return expect(promise).to.be.rejectedWith(
						`Device not found: ${this.shortUuid}`,
					);
				});
			});
		});

		describe('given two offline devices that share the same uuid root', function () {
			before(function () {
				this.uuidRoot = 'aaaaaaaaaaaaaaaa';
				const uuid1 =
					this.uuidRoot + balena.models.device.generateUniqueKey().slice(16);
				const uuid2 =
					this.uuidRoot + balena.models.device.generateUniqueKey().slice(16);

				return Promise.all([
					balena.models.device.register(this.application.slug, uuid1),
					balena.models.device.register(this.application.slug, uuid2),
				]);
			});

			describe('balena.models.device.get()', () => {
				it('should be rejected with an error if there is an ambiguation between shorter uuids', async function () {
					const promise = balena.models.device.get(this.uuidRoot);

					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousDevice',
					);
				});
			});

			describe('balena.models.device.has()', () => {
				it('should be rejected with an error for an ambiguous shorter uuid', async function () {
					const promise = balena.models.device.has(this.uuidRoot);

					await expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousDevice',
					);
				});
			});
		});
	});

	describe('given a multicontainer application', function () {
		givenMulticontainerApplication(before);

		describe('given a single offline device', function () {
			givenADevice(before);

			describe('balena.models.device.getWithServiceDetails()', function () {
				it('should be rejected if the device name does not exist', async function () {
					const promise =
						balena.models.device.getWithServiceDetails('asdfghjkl');
					await expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', async function () {
					const promise = balena.models.device.getWithServiceDetails(999999);
					await expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				it('should be able to use a shorter uuid', async function () {
					const device = await balena.models.device.getWithServiceDetails(
						this.device.uuid.slice(0, 8),
					);
					expect(device.id).to.equal(this.device.id);
				});

				['id', 'uuid'].forEach((prop) => {
					it(`should be able to get the device by ${prop}`, async function () {
						const device = await balena.models.device.getWithServiceDetails(
							this.device[prop],
						);
						expect(device.id).to.equal(this.device.id);
					});
				});

				it('should retrieve the current service details', async function () {
					const deviceDetails =
						await balena.models.device.getWithServiceDetails(this.device.id);
					expect(deviceDetails).to.deep.match({
						device_name: this.device.device_name,
						uuid: this.device.uuid,
						is_running__release: {
							__id: this.currentRelease.id,
						},
						current_services: {
							web: [
								{
									id: this.newWebInstall.id,
									service_id: this.webService.id,
									image_id: this.newWebImage.id,
									commit: 'new-release-commit',
									status: 'Downloading',
									download_progress: 50,
								},
								{
									id: this.oldWebInstall.id,
									service_id: this.webService.id,
									image_id: this.oldWebImage.id,
									commit: 'old-release-commit',
									status: 'Running',
									download_progress: null,
								},
							],
							db: [
								{
									id: this.newDbInstall.id,
									service_id: this.dbService.id,
									image_id: this.newDbImage.id,
									commit: 'new-release-commit',
									status: 'Running',
									download_progress: null,
								},
							],
						},
					});

					// Should include the Device model properties
					expect(deviceDetails.image_install).to.have.lengthOf(3);

					// Just to make TS happy, since we already checked its length.
					const imageInstalls = deviceDetails.image_install ?? [];
					imageInstalls.forEach((imageInstall) => {
						expect(imageInstall)
							.to.have.property('id')
							.that.is.oneOf([
								this.oldWebInstall.id,
								this.newWebInstall.id,
								this.newDbInstall.id,
							]);
						expect(imageInstall)
							.to.have.property('download_progress')
							.that.is.oneOf([50, null]);
						expect(imageInstall).to.have.property('image').that.has.length(1);
						expect(imageInstall)
							.to.have.property('is_provided_by__release')
							.that.has.length(1);
						expect(imageInstall)
							.to.have.property('install_date')
							.that.is.a('string');
						expect(imageInstall).to.have.property('status').that.is.a('string');
						expect(imageInstall).to.not.have.property('service_id');
						expect(imageInstall).to.not.have.property('image_id');
						expect(imageInstall).to.not.have.property('commit');
						expect(imageInstall).to.not.have.property('raw_version');
					});

					// Augmented properties
					// Should filter out deleted image installs
					expect(deviceDetails.current_services.db).to.have.lengthOf(1);
					const currentServices =
						_.flatten(Object.values(deviceDetails.current_services)) ?? [];
					currentServices.forEach((currentService) => {
						expect(currentService).to.have.property('commit');
						expect(currentService).to.have.property('raw_version');
						expect(currentService).to.have.property('release_id');
					});
				});

				it('should allow options to change the device fields returned', async function () {
					const deviceDetails =
						await balena.models.device.getWithServiceDetails(this.device.id, {
							$select: deviceUniqueFields,
							$expand: {
								belongs_to__application: {
									$select: ['id', 'app_name'],
								},
							},
						});
					expect(deviceDetails.device_name).to.be.undefined;
					expect(deviceDetails.current_services).not.to.be.undefined;
					return expect(deviceDetails.belongs_to__application[0]).to.deep.match(
						{
							id: this.application.id,
							app_name: this.application.app_name,
						},
					);
				});
			});

			describe('balena.models.device.serviceVar', function () {
				const varModel = balena.models.device.serviceVar;
				const serviceParams = ['id', 'service_name'] satisfies Array<
					keyof BalenaSdk.Service
				>;

				deviceUniqueFields.forEach(function (deviceParam) {
					serviceParams.forEach(function (serviceParam) {
						it(`can create a variable by device ${deviceParam} & service ${serviceParam}`, function () {
							const promise = varModel.set(
								this.device[deviceParam],
								this.webService[serviceParam],
								`EDITOR_BY_${deviceParam}_${serviceParam}`,
								'vim',
							);
							return expect(promise).to.not.be.rejected;
						});

						it(`...can retrieve a created variable by device ${deviceParam} & service ${serviceParam}`, async function () {
							const result = await varModel.get(
								this.device[deviceParam],
								this.webService[serviceParam],
								`EDITOR_BY_${deviceParam}_${serviceParam}`,
							);
							return expect(result).to.equal('vim');
						});

						it(`...can update and retrieve a variable by device ${deviceParam} & service ${serviceParam}`, async function () {
							await varModel.set(
								this.device[deviceParam],
								this.webService[serviceParam],
								`EDITOR_BY_${deviceParam}_${serviceParam}`,
								'emacs',
							);
							const result = await varModel.get(
								this.device[deviceParam],
								this.webService[serviceParam],
								`EDITOR_BY_${deviceParam}_${serviceParam}`,
							);
							return expect(result).to.equal('emacs');
						});

						it(`...can delete and then fail to retrieve a variable by device ${deviceParam} & service ${serviceParam}`, async function () {
							await varModel.remove(
								this.device[deviceParam],
								this.webService[serviceParam],
								`EDITOR_BY_${deviceParam}_${serviceParam}`,
							);
							const result = await varModel.get(
								this.device[deviceParam],
								this.webService[serviceParam],
								`EDITOR_BY_${deviceParam}_${serviceParam}`,
							);
							return expect(result).to.equal(undefined);
						});

						it(`can create and then retrieve multiple variables by device ${deviceParam} & service ${serviceParam}`, async function () {
							await Promise.all([
								varModel.set(
									this.device[deviceParam],
									this.webService[serviceParam],
									`A_BY_${deviceParam}_${serviceParam}`,
									'a',
								),
								varModel.set(
									this.device[deviceParam],
									this.dbService.id,
									`B_BY_${deviceParam}_${serviceParam}`,
									'b',
								),
							]);
							const result = await varModel.getAllByDevice(
								this.device[deviceParam],
							);
							expect(
								_.find(result, { name: `A_BY_${deviceParam}_${serviceParam}` }),
							)
								.to.be.an('object')
								.that.has.property('value', 'a');
							expect(
								_.find(result, { name: `B_BY_${deviceParam}_${serviceParam}` }),
							)
								.to.be.an('object')
								.that.has.property('value', 'b');
							return await Promise.all([
								varModel.remove(
									this.device[deviceParam],
									this.webService[serviceParam],
									`A_BY_${deviceParam}_${serviceParam}`,
								),
								varModel.remove(
									this.device[deviceParam],
									this.dbService.id,
									`B_BY_${deviceParam}_${serviceParam}`,
								),
							]);
						});
					});
				});

				it('can create and then retrieve multiple variables by application', async function () {
					await Promise.all([
						varModel.set(
							this.device.id,
							this.webService.id,
							'A_BY_APPLICATION',
							'a',
						),
						varModel.set(
							this.device.id,
							this.dbService.id,
							'B_BY_APPLICATION',
							'b',
						),
					]);
					const result = await varModel.getAllByApplication(
						this.application.id,
					);
					expect(_.find(result, { name: 'A_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'a');
					expect(_.find(result, { name: 'B_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'b');
					return await Promise.all([
						varModel.remove(
							this.device.id,
							this.webService.id,
							'A_BY_APPLICATION',
						),
						varModel.remove(
							this.device.id,
							this.dbService.id,
							'B_BY_APPLICATION',
						),
					]);
				});

				it('can set and then retrieve a device service var by short uuid', async function () {
					const shortUUID = this.device['uuid'].slice(0, 6);
					await varModel.set(
						shortUUID,
						this.webService.id,
						'EDITOR_BY_SHORT_UUID',
						'vim',
					);
					const result = await varModel.get(
						shortUUID,
						this.webService.id,
						'EDITOR_BY_SHORT_UUID',
					);
					return expect(result).to.equal('vim');
				});
			});

			describe('balena.models.device.isTrackingApplicationRelease()', function () {
				['id', 'uuid'].forEach((prop) => {
					it(`should be tracking the latest release, using the device ${prop}`, async function () {
						const isTracking =
							await balena.models.device.isTrackingApplicationRelease(
								this.device[prop],
							);
						expect(isTracking).to.be.true;
					});
				});
			});

			describe('balena.models.device.getTargetReleaseHash()', function () {
				['id', 'uuid'].forEach((prop) => {
					it(`should retrieve the commit hash of the tracked application release, using the device ${prop}`, async function () {
						const hash = await balena.models.device.getTargetReleaseHash(
							this.device[prop],
						);
						expect(hash).to.equal('new-release-commit');
					});
				});
			});

			describe('balena.models.device.deactivate()', function () {
				it('should be rejected if the device uuid does not exist', async function () {
					const promise = balena.models.device.deactivate('asdfghjkl');
					await expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', async function () {
					const promise = balena.models.device.deactivate(999999);
					await expect(promise).to.be.rejectedWith('Device not found: 999999');
				});
			});

			describe('balena.models.device.history', function () {
				const historyModel = balena.models.device.history;

				const testDeviceHistory = (entries, application, device) => {
					expect(
						entries.filter((entry) => entry.end_timestamp == null),
					).to.have.length(1);
					expect(
						entries.filter((entry) => entry.end_timestamp != null),
					).to.have.length.greaterThanOrEqual(1);
					entries.map((entry) => {
						expect(entry.belongs_to__application.__id).to.equal(application.id);
						expect(entry.tracks__device.__id).to.equal(device.id);
						expect(entry.uuid).to.equal(device.uuid);
					});
				};

				for (const identifier of ['id', 'uuid', 'slug']) {
					it(`should retrieve multiple device history entries by application ${identifier}`, async function () {
						const result = await historyModel.getAllByApplication(
							this.application[identifier],
						);
						testDeviceHistory(result, this.application, this.device);
					});
				}

				for (const identifier of ['id', 'uuid']) {
					it(`should retrieve multiple device history entries by device ${identifier}`, async function () {
						const result = await historyModel.getAllByDevice(
							this.device[identifier],
							{},
						);
						testDeviceHistory(result, this.application, this.device);
					});
				}

				for (const testSet of [
					{
						method: 'getAllByApplication',
						model: 'application',
					},
					{ method: 'getAllByDevice', model: 'device' },
				]) {
					it(`should retrieve device history by ${testSet.model} within specific time frame`, async function () {
						const result = await historyModel[testSet.method](
							this[testSet.model]['id'],
							{
								fromDate: subDays(new Date(), 1),
								toDate: addDays(new Date(), 1),
							},
						);
						testDeviceHistory(result, this.application, this.device);
					});

					it(`should retrieve exactly one device history entry by ${testSet.model} within specific time frame`, async function () {
						const result = await historyModel[testSet.method](
							this[testSet.model]['id'],
							{
								fromDate: subDays(new Date(), 1),
								toDate: addDays(new Date(), 1),
								$top: 1,
							},
						);
						expect(result).to.be.an('array').to.have.length(1);
					});

					it(`should retrieve empty device history by ${testSet.model} for time frame too far in the past `, async function () {
						const result = await historyModel[testSet.method](
							this[testSet.model]['id'],
							{
								fromDate: subYears(new Date(), 2),
								toDate: subYears(new Date(), 1),
							},
						);
						expect(result).to.be.empty;
					});

					it(`should expand actor attributes when getting device history by ${testSet.model}`, async function () {
						const result = await historyModel[testSet.method](
							this[testSet.model]['id'],
							{
								fromDate: subDays(new Date(), 1),
								toDate: addDays(new Date(), 1),
								$top: 1,
								$expand: {
									is_ended_by__actor: {
										$expand: { is_of__user: { $select: 'username' } },
									},
								},
								$orderby: 'created_at asc',
							},
						);
						expect(result).to.be.an('array').to.have.length(1);
					});

					it(`should throw an error when getting device history by ${testSet.model}, when providing invalid fromDate filter option`, async function () {
						for (const invalidParam of [1, 'invalid', {}, []]) {
							await expect(
								historyModel[testSet.method](this[testSet.model]['id'], {
									fromDate: invalidParam,
								}),
							).to.be.rejected;
						}
					});

					it(`should throw an error when getting device history by ${testSet.model}, when providing invalid toDate filter option`, async function () {
						for (const invalidParam of [1, 'invalid', {}, []]) {
							await expect(
								historyModel[testSet.method](this[testSet.model]['id'], {
									toDate: invalidParam,
								}),
							).to.be.rejected;
						}
					});
				}
				it(`should throw an error when getting device history entries for an invalid device uuid`, async function () {
					await expect(
						historyModel.getAllByDevice(
							this.device.uuid + 'invalidExtraDigits',
						),
					).to.be.rejected;

					await expect(
						historyModel.getAllByDevice(this.device.uuid.slice(0, 7)),
					).to.be.rejected;
				});
			});
		});

		describe('given a single online device on the downloading state', function () {
			givenADevice(before, {
				is_online: true,
				...testDeviceOsInfo,
				last_connectivity_event: '2019-05-13T16:14',
			});

			describe('balena.models.device.getStatus()', () => {
				it('should properly retrieve the status', async function () {
					const status = await balena.models.device.getStatus(this.device.uuid);
					expect(status).to.equal('updating');
				});
			});

			describe('balena.models.device.getProgress()', () => {
				it('should properly retrieve the progress', async function () {
					const result = await balena.models.device.getProgress(
						this.device.uuid,
					);
					expect(result).to.be.a('number');
					expect(result).to.equal(75);
				});
			});
		});

		describe('given a newly registered offline device', function () {
			givenADevice(beforeEach);

			describe('balena.models.device.pinToRelease()', function () {
				it('should set the device to a specific release, using the device id & release commit', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						'old-release-commit',
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					expect(isTracking).to.be.false;
				});

				it('should set the device to a specific release, using the device id & release id', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						this.oldRelease.id,
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					expect(isTracking).to.be.false;
				});

				it('should set the device to a specific release, using the device uuid & release commit', async function () {
					await balena.models.device.pinToRelease(
						this.device.uuid,
						'old-release-commit',
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					expect(isTracking).to.be.false;
				});

				it('should set the device to a specific release, using the device uuid & release id', async function () {
					await balena.models.device.pinToRelease(
						this.device.uuid,
						this.oldRelease.id,
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					expect(isTracking).to.be.false;
				});
			});

			describe('balena.models.device.trackApplicationRelease()', function () {
				it('should set the device to track the current application release, using the device id', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						'old-release-commit',
					);
					await balena.models.device.trackApplicationRelease(this.device.id);
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					expect(isTracking).to.be.true;
				});

				it('should set the device to track the current application release, using the device uuid', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						'old-release-commit',
					);
					await balena.models.device.trackApplicationRelease(this.device.uuid);
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					expect(isTracking).to.be.true;
				});
			});
		});

		const BATCH_DEVICE_COUNT =
			typeof sdkOpts.requestBatchingChunkSize === 'number'
				? Math.ceil(sdkOpts.requestBatchingChunkSize * 1.5)
				: 55;
		describe(`given ${BATCH_DEVICE_COUNT} registered offline device`, function () {
			before(async function () {
				this.devices = [];
				const REGISTRATION_CHUNK_SIZE = 10;
				for (let i = 0; i < BATCH_DEVICE_COUNT; i += REGISTRATION_CHUNK_SIZE) {
					this.devices.push(
						...(await Promise.all(
							_.times(
								Math.min(BATCH_DEVICE_COUNT - i, REGISTRATION_CHUNK_SIZE),
							).map(async () => {
								const uuid = balena.models.device.generateUniqueKey();
								const deviceInfo = await balena.models.device.register(
									this.application.id,
									uuid,
								);
								return deviceInfo;
							}),
						)),
					);
				}
			});

			['id', 'uuid'].forEach((prop) => {
				describe('balena.models.device.pinToRelease()', function () {
					it(`should set the batch of devices to a specific release using an array of ${prop}s`, async function () {
						await balena.models.device.pinToRelease(
							this.devices.map((d) => d[prop]),
							'old-release-commit',
						);
						await Promise.all(
							this.devices.map(async (d) => {
								const releaseHash =
									await balena.models.device.getTargetReleaseHash(d.id);
								expect(releaseHash).to.equal('old-release-commit');
								const isTracking =
									await balena.models.device.isTrackingApplicationRelease(d.id);
								expect(isTracking).to.be.false;
							}),
						);
					});
				});

				describe('balena.models.device.trackApplicationRelease()', function () {
					it(`should set the batch of devices to track the current application release using an array of ${prop}s`, async function () {
						await balena.models.device.trackApplicationRelease(
							this.devices.map((d) => d[prop]),
						);

						await Promise.all(
							this.devices.map(async (d) => {
								const isTracking =
									await balena.models.device.isTrackingApplicationRelease(d.id);
								expect(isTracking).to.be.true;
							}),
						);
					});
				});
			});

			describe('balena.models.device.setSupervisorRelease()', function () {
				before(async function () {
					const [oldSupervisorRelease] = await balena.pine.get({
						resource: 'supervisor_release',
						options: {
							$select: 'id',
							$filter: {
								supervisor_version: 'v11.12.3',
								is_for__device_type: this.application.is_for__device_type.__id,
							},
						},
					});
					// Set all devices to a supervisor release so that the service installs are already set.
					// We shouldn't need to do this.
					for (const d of this.devices) {
						await balena.models.device.setSupervisorRelease(
							d.id,
							oldSupervisorRelease.id,
						);
					}
				});
				givenASupervisorRelease(before, 'v11.12.4');

				['supervisor_version', 'id'].forEach((svReleaseProp) => {
					it(`should set the batch of devices to a specific supervisor release using the supervisor releases's ${svReleaseProp}`, async function () {
						await balena.models.device.setSupervisorRelease(
							this.devices.map((d) => d.id),
							this.supervisorRelease[svReleaseProp],
						);
						await Promise.all(
							this.devices.map(async (d) => {
								const device = await balena.models.device.get(d.id);
								expect(
									device.should_be_managed_by__release,
								).to.have.deep.property('__id', this.supervisorRelease.id);
							}),
						);
					});
				});

				it('should fail to set the batch of devices to a specific non-existent supervisor release', async function () {
					const badRelease = 'nonexistent-supervisor-version';
					const promise = balena.models.device.setSupervisorRelease(
						this.devices.map((d) => d.id),
						badRelease,
					);
					await expect(promise).to.be.rejectedWith(
						`Release not found: ${badRelease}`,
					);
				});
			});
		});

		describe('given a device that supports multicontainer', function () {
			givenADevice(beforeEach, {
				...testDeviceOsInfo,
			});

			describe('balena.models.device.setSupervisorRelease()', function () {
				givenASupervisorRelease(before);

				it('should set the device to a specific supervisor release, using the device id & target version', async function () {
					await balena.models.device.setSupervisorRelease(
						this.device.id,
						this.supervisorRelease.supervisor_version,
					);
					const device = await balena.models.device.get(this.device.id);
					expect(device.should_be_managed_by__release).to.have.deep.property(
						'__id',
						this.supervisorRelease.id,
					);
				});

				it('should set the device to a specific supervisor release, using the device id & supervisor release id', async function () {
					await balena.models.device.setSupervisorRelease(
						this.device.id,
						this.supervisorRelease.id,
					);
					const device = await balena.models.device.get(this.device.id);
					expect(device.should_be_managed_by__release).to.have.deep.property(
						'__id',
						this.supervisorRelease.id,
					);
				});

				it('should fail to set the device to a specific non-existent supervisor release', async function () {
					const badRelease = 'nonexistent-supervisor-version';
					const promise = balena.models.device.setSupervisorRelease(
						this.device.id,
						badRelease,
					);
					await expect(promise).to.be.rejectedWith(
						`Release not found: ${badRelease}`,
					);
				});
			});
		});

		describe('given a device that does not support multicontainer', function () {
			const hostOS = 'Resin OS 2.7.8+rev1';
			givenADevice(before, {
				os_version: hostOS,
			});

			describe('balena.models.device.setSupervisorRelease()', function () {
				givenASupervisorRelease(before);

				it('should fail to set the target supervisor for a pre-multicontainer device', async function () {
					const promise = balena.models.device.setSupervisorRelease(
						this.device.id,
						this.supervisorRelease.id,
					);
					await expect(promise).to.be.rejectedWith(
						`Incompatible host OS version: ${hostOS} - must be >= 2.12.0`,
					);
				});
			});
		});

		describe('given services with weird names', function () {
			before(function () {
				return Promise.all([
					balena.pine.patch({
						resource: 'service',
						id: this.webService.id,
						body: {
							service_name: 'hasOwnProperty',
						},
					}),
					balena.pine.patch({
						resource: 'service',
						id: this.dbService.id,
						body: {
							service_name: '__proto__',
						},
					}),
				]);
			});

			describe('given a single offline device', function () {
				givenADevice(before);

				describe('balena.models.device.getWithServiceDetails()', () => {
					it('should retrieve the current service details', async function () {
						const deviceDetails =
							await balena.models.device.getWithServiceDetails(this.device.id);
						expect(deviceDetails).to.deep.match({
							device_name: this.device.device_name,
							uuid: this.device.uuid,
							is_running__release: {
								__id: this.currentRelease.id,
							},
						});

						expect(
							Object.keys(deviceDetails.current_services).sort(),
						).to.deep.equal(['__proto__', 'hasOwnProperty']);

						// it seems that deep.match doesn't work with objects with a custom __proto__ property
						expect(deviceDetails.current_services.hasOwnProperty).to.deep.match(
							[
								{
									id: this.newWebInstall.id,
									service_id: this.webService.id,
									image_id: this.newWebImage.id,
									commit: 'new-release-commit',
									status: 'Downloading',
									download_progress: 50,
								},
								{
									id: this.oldWebInstall.id,
									service_id: this.webService.id,
									image_id: this.oldWebImage.id,
									commit: 'old-release-commit',
									status: 'Running',
									download_progress: null,
								},
							],
						);

						return expect(
							deviceDetails.current_services.__proto__,
						).to.deep.match([
							{
								id: this.newDbInstall.id,
								service_id: this.dbService.id,
								image_id: this.newDbImage.id,
								commit: 'new-release-commit',
								status: 'Running',
								download_progress: null,
							},
						]);
					});
				});
			});
		});
	});

	describe('given three compatible & one incompatible applications and a single device', function () {
		before(async function () {
			const [
				application1,
				applicationSameDT,
				applicationCompatibleDT,
				applicationIncompatibleDT,
			] = await Promise.all([
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar`,
					deviceType: 'raspberrypi3',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_BarBaz`,
					deviceType: 'raspberrypi3',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_BazFoo`,
					deviceType: 'raspberry-pi2',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_BarBazNuc`,
					deviceType: 'intel-nuc',
					organization: this.initialOrg.id,
				}),
			]);
			this.application1 = application1;
			this.applicationSameDT = applicationSameDT;
			this.applicationCompatibleDT = applicationCompatibleDT;
			this.applicationIncompatibleDT = applicationIncompatibleDT;

			const uuid = balena.models.device.generateUniqueKey();
			this.deviceInfo = await balena.models.device.register(
				this.application1.slug,
				uuid,
			);
		});

		after(function () {
			return balena.pine.delete({
				resource: 'application',
				options: {
					$filter: {
						id: {
							$in: [
								this.application1.id,
								this.applicationSameDT.id,
								this.applicationCompatibleDT.id,
								this.applicationIncompatibleDT.id,
							],
						},
					},
				},
			});
		});

		afterEach(async function () {
			await balena.models.device.move(this.deviceInfo.id, this.application1.id);
		});

		describe('balena.models.device.move()', function () {
			describe('when trying to move between applications of the same device type', function () {
				applicationRetrievalFields.forEach((prop) => {
					it(`should be able to move a device by device uuid and application ${prop}`, async function () {
						await balena.models.device.move(
							this.deviceInfo.uuid,
							this.applicationSameDT[prop],
						);
						const applicationName =
							await balena.models.device.getApplicationName(
								this.deviceInfo.uuid,
							);
						return expect(applicationName).to.equal(
							this.applicationSameDT.app_name,
						);
					});
				});

				it('should be able to move a device using shorter uuids', async function () {
					await balena.models.device.move(
						this.deviceInfo.uuid.slice(0, 7),
						this.applicationSameDT.id,
					);
					const applicationName = await balena.models.device.getApplicationName(
						this.deviceInfo.id,
					);
					return expect(applicationName).to.equal(
						this.applicationSameDT.app_name,
					);
				});
			});

			it('should be able to move a device to an application of the same architecture', async function () {
				await balena.models.device.move(
					this.deviceInfo.id,
					this.applicationCompatibleDT.id,
				);
				const applicationName = await balena.models.device.getApplicationName(
					this.deviceInfo.id,
				);
				return expect(applicationName).to.equal(
					this.applicationCompatibleDT.app_name,
				);
			});

			describe('when trying to move to an incompatible application', function () {
				it('should be rejected with an incompatibility error', function () {
					const promise = balena.models.device.move(
						this.deviceInfo.uuid,
						this.applicationIncompatibleDT.slug,
					);
					return expect(promise).to.be.rejectedWith(
						`Incompatible application: ${this.applicationIncompatibleDT.slug}`,
					);
				});
			});
		});
	});

	describe('given applications of different architectures with a device on each', function () {
		before(async function () {
			const apps = await Promise.all([
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_FooBarArmv6`,
					deviceType: 'raspberry-pi',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_FooBar32`,
					deviceType: 'raspberrypi3',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: `${TEST_APPLICATION_NAME_PREFIX}_BarBaz64`,
					deviceType: 'raspberrypi3-64',
					organization: this.initialOrg.id,
				}),
			]);
			this.apps = {
				rpi: apps[0],
				armv7hf: apps[1],
				aarch64: apps[2],
			};

			const devices = await Promise.all(
				apps.map((app) =>
					balena.models.device.register(
						app.id,
						balena.models.device.generateUniqueKey(),
					),
				),
			);
			this.devices = {
				rpi: devices[0],
				armv7hf: devices[1],
				aarch64: devices[2],
			};
		});

		after(function () {
			return balena.pine.delete({
				resource: 'application',
				options: {
					$filter: {
						id: {
							$in: _.map(this.apps, 'id'),
						},
					},
				},
			});
		});

		describe('balena.models.device.move()', function () {
			[
				['rpi', 'armv7hf'],
				['rpi', 'aarch64'],
				['armv7hf', 'aarch64'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should be rejected with an incompatibility error when trying to move an ${deviceArch} device to an ${appArch} application`, function () {
					const device = this.devices[deviceArch];
					const app = this.apps[appArch];
					const promise = balena.models.device.move(device.uuid, app.slug);
					return expect(promise).to.be.rejectedWith(
						`Incompatible application: ${app.slug}`,
					);
				});
			});

			[
				['aarch64', 'armv7hf'],
				['aarch64', 'rpi'],
				['armv7hf', 'rpi'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should be able to move an ${deviceArch} device to an ${appArch} application`, async function () {
					const device = this.devices[deviceArch];
					const app = this.apps[appArch];
					await balena.models.device.move(device.id, app.id);
					const applicationName = await balena.models.device.getApplicationName(
						device.id,
					);
					expect(applicationName).to.equal(app.app_name);
				});
			});
		});
	});

	describe('helpers', function () {
		describe('balena.models.device.getDashboardUrl()', function () {
			it('should return the respective DashboardUrl when a device uuid is provided', function () {
				const dashboardUrl = sdkOpts.apiUrl!.replace(/api/, 'dashboard');
				return expect(
					balena.models.device.getDashboardUrl(
						'af1150f1b1734c428fb1606a4cddec6c',
					),
				).to.equal(
					`${dashboardUrl}/devices/af1150f1b1734c428fb1606a4cddec6c/summary`,
				);
			});

			it('should throw when a device uuid is not a string', () => {
				expect(() =>
					// @ts-expect-error invalid parameter
					balena.models.device.getDashboardUrl(1234567),
				).to.throw();
			});

			it('should throw when a device uuid is not provided', () => {
				// @ts-expect-error invalid parameter
				expect(() => balena.models.device.getDashboardUrl()).to.throw();
			});
		});

		describe('balena.models.device.lastOnline()', function () {
			it('should return the string "Connecting..." if the device has no `last_connectivity_event`', () => {
				expect(
					balena.models.device.lastOnline({
						last_connectivity_event: null,
						is_online: false,
					}),
				).to.equal('Connecting...');
			});

			it('should return the correct time string if the device is online', function () {
				const mockDevice = {
					last_connectivity_event: new Date(
						Date.now() - 1000 * 60 * 5,
					).toUTCString(),
					is_online: true,
				};

				return expect(balena.models.device.lastOnline(mockDevice)).to.equal(
					'Online (for 5 minutes)',
				);
			});

			it('should return the correct time string if the device is offline', function () {
				const mockDevice = {
					last_connectivity_event: new Date(
						Date.now() - 1000 * 60 * 5,
					).toUTCString(),
					is_online: false,
				};

				return expect(balena.models.device.lastOnline(mockDevice)).to.equal(
					'5 minutes ago',
				);
			});
		});

		describe('balena.models.device.getLocalModeSupport()', function () {
			it('should identify a device w/o a supervisor_version as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device is not yet fully provisioned',
				});
			});

			it('should identify a device w/o a last_connectivity_event as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: null,
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device is not yet fully provisioned',
				});
			});

			it('should identify a device w/o an os_version as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: null,
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device OS version does not support local mode',
				});
			});

			it('should identify a device with an invalid os_version as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'ResinOS 2.7.8.9+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device OS version does not support local mode',
				});
			});

			it('should identify a device with a v1 OS as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: '',
						os_version: 'Resin OS 1.26.0',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device OS version does not support local mode',
				});
			});

			it('should identify a device with an old supervisor as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.0.0+rev1',
						supervisor_version: '3.99.99',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device supervisor version does not support local mode',
				});
			});

			it('should identify a device w/o an os_variant as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: '',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Local mode is only supported on development OS versions',
				});
			});

			it('should identify a device with a production image as not supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'prod',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Local mode is only supported on development OS versions',
				});
			});

			it('should identify a device with a development image as supported', () => {
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: true,
					message: 'Supported',
				});
			});
		});

		describe('balena.models.device.getOsVersion()', function () {
			it('should not parse invalid semver versions', () => {
				_.forEach(
					[
						['Resin OS ', 'dev'],
						['Resin OS ', 'prod'],
						['Resin OS 2.0-beta.8', ''],
					],
					function ([osVersion, osVariant]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(null);
					},
				);
			});

			it('should parse plain os versions w/o variant', () => {
				_.forEach(
					[
						['Resin OS 1.2.1', '', '1.2.1'],
						['Resin OS 1.6.0', '', '1.6.0'],
						['Resin OS 2.0.0-beta.1', '', '2.0.0-beta.1'],
						['Resin OS 2.0.0-beta.3', '', '2.0.0-beta.3'],
						['Resin OS 2.0.0-beta11.rev1', '', '2.0.0-beta11.rev1'],
						['Resin OS 2.0.0-beta.8', '', '2.0.0-beta.8'],
						['Resin OS 2.0.0-rc1.rev1', '', '2.0.0-rc1.rev1'],
						['Resin OS 2.0.0-rc1.rev2', '', '2.0.0-rc1.rev2'],
						['Resin OS 2.0.1-beta.4', '', '2.0.1-beta.4'],
						['Resin OS 2.0.1.rev1', '', '2.0.1+rev1'],
						['Resin OS 2.0.2-beta.2', '', '2.0.2-beta.2'],
						['Resin OS 2.0.2-beta.7', '', '2.0.2-beta.7'],
						['Resin OS 2.0.2+rev2', '', '2.0.2+rev2'],
						['Resin OS 2.0.6+rev2', '', '2.0.6+rev2'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				);
			});

			it('should properly combine the plain os version & variant', () => {
				_.forEach(
					[
						['Resin OS 2.0.0-beta.8', 'prod', '2.0.0-beta.8+prod'],
						['balenaOS 2.0.0-beta12.rev1', 'prod', '2.0.0-beta12.rev1+prod'],
						['Resin OS 2.0.0-rc1.rev2', 'prod', '2.0.0-rc1.rev2+prod'],
						['Resin OS 2.0.0+rev2', 'prod', '2.0.0+rev2.prod'],
						['Resin OS 2.0.0+rev3', 'prod', '2.0.0+rev3.prod'],
						['Resin OS 2.0.2+rev2', 'dev', '2.0.2+rev2.dev'],
						['Resin OS 2.0.3+rev1', 'dev', '2.0.3+rev1.dev'],
						['Resin OS 2.0.3+rev1', 'prod', '2.0.3+rev1.prod'],
						['Resin OS 2.0.4+rev1', 'dev', '2.0.4+rev1.dev'],
						['Resin OS 2.0.4+rev1', 'prod', '2.0.4+rev1.prod'],
						['Resin OS 2.0.4+rev2', 'prod', '2.0.4+rev2.prod'],
						['Resin OS 2.0.5', 'dev', '2.0.5+dev'],
						['Resin OS 2.0.5+rev1', 'dev', '2.0.5+rev1.dev'],
						['Resin OS 2.0.5+rev1', 'prod', '2.0.5+rev1.prod'],
						['Resin OS 2.0.6+rev1', 'dev', '2.0.6+rev1.dev'],
						['Resin OS 2.0.6+rev1', 'prod', '2.0.6+rev1.prod'],
						['Resin OS 2.0.6+rev2', 'dev', '2.0.6+rev2.dev'],
						['Resin OS 2.0.6+rev2', 'prod', '2.0.6+rev2.prod'],
						['Resin OS 2.1.0+rev1', 'dev', '2.1.0+rev1.dev'],
						['Resin OS 2.1.0+rev1', 'prod', '2.1.0+rev1.prod'],
						['Resin OS 2.2.0+rev1', 'dev', '2.2.0+rev1.dev'],
						['Resin OS 2.2.0+rev1', 'prod', '2.2.0+rev1.prod'],
						['Resin OS 2.9.0-multi1+rev1', 'dev', '2.9.0-multi1+rev1.dev'],
						['Resin OS 2.9.7+rev1', 'dev', '2.9.7+rev1.dev'],
						['Resin OS 2.9.7+rev1', 'prod', '2.9.7+rev1.prod'],
						['Resin OS 2.12.0+rev1', 'dev', '2.12.0+rev1.dev'],
						['Resin OS 2.12.0+rev1', 'prod', '2.12.0+rev1.prod'],
						['Resin OS 2.12.1+rev1', 'dev', '2.12.1+rev1.dev'],
						['Resin OS 2.12.1+rev1', 'prod', '2.12.1+rev1.prod'],
						['Resin OS 2.12.3', 'dev', '2.12.3+dev'],
						['Resin OS 2.12.3+rev1', 'dev', '2.12.3+rev1.dev'],
						['balenaOS 2.26.0', 'dev', '2.26.0+dev'],
						['balenaOS 2.26.0+rev1', 'dev', '2.26.0+rev1.dev'],
						['balenaOS 2.26.0+rev1', 'prod', '2.26.0+rev1.prod'],
						['balenaOS 2.28.0-beta1.rev1', 'prod', '2.28.0-beta1.rev1+prod'],
						['balenaOS 2.28.0+rev1', 'dev', '2.28.0+rev1.dev'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				);
			});

			it('should properly parse the os_version with variant suffix w/o os_variant', () => {
				_.forEach(
					[
						['Resin OS 2.0.0-rc6.rev1 (prod)', '', '2.0.0-rc6.rev1+prod'],
						['Resin OS 2.0.0.rev1 (prod)', '', '2.0.0+rev1.prod'],
						['Resin OS 2.0.0+rev2 (prod)', '', '2.0.0+rev2.prod'],
						['Resin OS 2.0.0+rev3 (dev)', '', '2.0.0+rev3.dev'],
						['Resin OS 2.0.0+rev3 (prod)', '', '2.0.0+rev3.prod'],
						['Resin OS 2.0.0+rev4 (prod)', '', '2.0.0+rev4.prod'],
						['Resin OS 2.0.0+rev5 (dev)', '', '2.0.0+rev5.dev'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				);
			});

			it('should properly combine the os_version with variant suffix & os_variant', () => {
				_.forEach(
					[
						['Resin OS 2.0.0.rev1 (prod)', 'prod', '2.0.0+rev1.prod'],
						['Resin OS 2.0.0+rev2 (prod)', 'prod', '2.0.0+rev2.prod'],
						['Resin OS 2.0.0+rev3 (dev)', 'dev', '2.0.0+rev3.dev'],
						['Resin OS 2.0.0+rev3 (prod)', 'prod', '2.0.0+rev3.prod'],
						['Resin OS 2.0.0+rev4 (prod)', 'prod', '2.0.0+rev4.prod'],
						['Resin OS 2.0.0+rev5 (prod)', 'prod', '2.0.0+rev5.prod'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				);
			});
		});

		describe('balena.models.device._checkOsUpdateTarget()', function () {
			// The OS versions in here are not necessarily real and are just picked in a way
			// to confirm all checks that `device._checkOsUpdateTarget()` is supposed
			// to be doing are working.
			const uuid = balena.models.device.generateUniqueKey();

			const { _checkOsUpdateTarget } = balena.models.device;

			it('should throw when the current os version is invalid', () => {
				[
					['Resin OS ', 'dev'],
					['Resin OS ', 'prod'],
					['Resin OS 2.0-beta.8', ''],
				].forEach(function ([osVersion, osVariant]) {
					return expect(() => {
						_checkOsUpdateTarget(
							{
								uuid,
								is_of__device_type: [{ slug: 'raspberrypi3' }],
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							},
							'2.29.2+rev1.prod',
						);
					}).to.throw('Invalid current balenaOS version');
				});
			});

			it('should throw when the device is offline', () => {
				[
					['Resin OS 1.21.0', '', '1.28.0'],
					['Resin OS 1.30.1', '', '2.5.0+rev1'],
					['balenaOS 2.26.0+rev1', 'prod', '2.29.2+rev1.prod'],
				].forEach(function ([osVersion, osVariant, targetOsVersion]) {
					return expect(() => {
						_checkOsUpdateTarget(
							{
								uuid,
								is_of__device_type: [{ slug: 'raspberrypi3' }],
								is_online: false,
								os_version: osVersion,
								os_variant: osVariant,
							},
							targetOsVersion,
						);
					}).to.throw('The device is offline');
				});
			});

			it('should throw for upgrades from prod -> dev', () => {
				[
					['Resin OS 2.0.0+rev3 (prod)', 'prod'],
					['Resin OS 2.0.0+rev3 (prod)', ''],
					['Resin OS 2.0.4+rev1', 'prod'],
					['Resin OS 2.0.5', 'prod'],
					['Resin OS 2.12.1+rev1', 'prod'],
					['Resin OS 2.12.3', 'prod'],
					['Resin OS 2.12.3+rev1', 'prod'],
					['balenaOS 2.26.0', 'prod'],
					['balenaOS 2.28.0+rev1', 'prod'],
				].forEach(function ([osVersion, osVariant]) {
					return expect(() => {
						_checkOsUpdateTarget(
							{
								uuid,
								is_of__device_type: [{ slug: 'raspberrypi3' }],
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							},
							'2.29.2+rev1.dev',
						);
					}).to.throw(
						'Updates cannot be performed between development and production balenaOS variants',
					);
				});
			});

			it('should throw for upgrades from dev -> prod', () => {
				[
					['Resin OS 2.0.0+rev3 (dev)', 'dev'],
					['Resin OS 2.0.0+rev5 (dev)', ''],
					['Resin OS 2.0.4+rev1', 'dev'],
					['Resin OS 2.0.5', 'dev'],
					['Resin OS 2.0.5+rev1', 'dev'],
					['Resin OS 2.0.6+rev2', 'dev'],
					['Resin OS 2.9.7+rev1', 'dev'],
					['Resin OS 2.12.0+rev1', 'dev'],
					['Resin OS 2.12.1+rev1', 'dev'],
					['Resin OS 2.12.3', 'dev'],
					['balenaOS 2.26.0', 'dev'],
					['balenaOS 2.26.0+rev1', 'dev'],
					['balenaOS 2.28.0+rev1', 'dev'],
				].forEach(function ([osVersion, osVariant]) {
					return expect(() => {
						_checkOsUpdateTarget(
							{
								uuid,
								is_of__device_type: [{ slug: 'raspberrypi3' }],
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							},
							'2.29.2+rev1.prod',
						);
					}).to.throw(
						'Updates cannot be performed between development and production balenaOS variants',
					);
				});
			});

			describe('v1 -> v1 hup', () => {
				['raspberrypi3', 'intel-nuc'].forEach((deviceType) => {
					describe(`given a ${deviceType}`, function () {
						it('should throw when current os version is < 1.8.0', () => {
							[
								['Resin OS 1.2.1', ''],
								['Resin OS 1.6.0', ''],
								['Resin OS 1.7.2', ''],
							].forEach(function ([osVersion, osVariant]) {
								return expect(() => {
									_checkOsUpdateTarget(
										{
											uuid,
											is_of__device_type: [{ slug: deviceType }],
											is_online: true,
											os_version: osVersion,
											os_variant: osVariant,
										},
										'1.26.0',
									);
								}).to.throw('Current OS version must be >= 1.8.0');
							});
						});

						it('should throw when the target os version is below the min supported v1 version', () => {
							[
								['Resin OS 1.8.0', ''],
								['Resin OS 1.10.0', ''],
								['Resin OS 1.19.0', ''],
								['Resin OS 1.21.0', ''],
							].forEach(function ([osVersion, osVariant]) {
								return expect(() => {
									_checkOsUpdateTarget(
										{
											uuid,
											is_of__device_type: [{ slug: deviceType }],
											is_online: true,
											os_version: osVersion,
											os_variant: osVariant,
										},
										'1.25.0',
									);
								}).to.throw('Target OS version must be >= 1.26.0');
							});
						});

						it('should not throw when it is a valid v1 -> v1 hup', () => {
							[
								['Resin OS 1.8.0', ''],
								['Resin OS 1.10.0', ''],
								['Resin OS 1.19.0', ''],
								['Resin OS 1.21.0', ''],
							].forEach(function ([osVersion, osVariant]) {
								return expect(() => {
									_checkOsUpdateTarget(
										{
											uuid,
											is_of__device_type: [{ slug: deviceType }],
											is_online: true,
											os_version: osVersion,
											os_variant: osVariant,
										},
										'1.28.0',
									);
								}).to.not.throw();
							});
						});
					});
				});
			});

			describe('v1 -> v2 hup', function () {
				describe('given a raspberrypi3', function () {
					it('should throw when current os version is < 1.8.0', () => {
						[
							['Resin OS 1.2.1', ''],
							['Resin OS 1.6.0', ''],
							['Resin OS 1.7.2', ''],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'raspberrypi3' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.5.0+rev1',
								);
							}).to.throw('Current OS version must be >= 1.8.0');
						});
					});

					it('should not throw when it is a valid v1 -> v2 hup', () => {
						[
							['Resin OS 1.8.0', ''],
							['Resin OS 1.10.0', ''],
							['Resin OS 1.19.0', ''],
							['Resin OS 1.21.0', ''],
							['Resin OS 1.26.1', ''],
							['Resin OS 1.30.1', ''],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'raspberrypi3' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.5.0+rev1',
								);
							}).to.not.throw();
						});
					});
				});

				describe('given a beaglebone-black', function () {
					it('should throw when current os version is < 1.30.1', () => {
						[
							['Resin OS 1.2.1', ''],
							['Resin OS 1.6.0', ''],
							['Resin OS 1.7.2', ''],
							['Resin OS 1.8.0', ''],
							['Resin OS 1.10.0', ''],
							['Resin OS 1.19.0', ''],
							['Resin OS 1.21.0', ''],
							['Resin OS 1.26.1', ''],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'beaglebone-black' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.5.0+rev1',
								);
							}).to.throw('Current OS version must be >= 1.30.1');
						});
					});

					it('should not throw when it is a valid v1 -> v2 hup', () => {
						[['Resin OS 1.30.1', '']].forEach(function ([
							osVersion,
							osVariant,
						]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'beaglebone-black' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.5.0+rev1',
								);
							}).to.not.throw();
						});
					});
				});
			});

			describe('v2 -> v2 hup', function () {
				describe('given a raspberrypi3', function () {
					it('should throw when current os version is < 2.0.0+rev1', () => {
						[['Resin OS 2.0.0.rev0 (prod)', 'prod']].forEach(function ([
							osVersion,
							osVariant,
						]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'raspberrypi3' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.1.0+rev1.prod',
								);
							}).to.throw('Current OS version must be >= 2.0.0+rev1');
						});
					});

					it('should not throw when it is a valid v2 -> v2 hup', () => {
						[
							['Resin OS 2.0.0.rev1 (prod)', 'prod'],
							['Resin OS 2.0.0.rev1 (prod)', ''],
							['Resin OS 2.0.0+rev2', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', ''],
							['Resin OS 2.0.0+rev3', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', ''],
							['Resin OS 2.0.0+rev4 (prod)', 'prod'],
							['Resin OS 2.0.0+rev4 (prod)', ''],
							['Resin OS 2.0.0+rev5 (prod)', 'prod'],
							['Resin OS 2.0.1.rev1', ''],
							['Resin OS 2.0.2+rev2', ''],
							['Resin OS 2.0.3+rev1', 'prod'],
							['Resin OS 2.0.4+rev1', 'prod'],
							['Resin OS 2.0.4+rev2', 'prod'],
							['Resin OS 2.0.5+rev1', 'prod'],
							['Resin OS 2.0.6+rev1', 'prod'],
							['Resin OS 2.0.6+rev2', 'prod'],
							['Resin OS 2.0.6+rev2', ''],
							['Resin OS 2.1.0+rev1', 'prod'],
							['Resin OS 2.2.0+rev1', 'prod'],
							['Resin OS 2.9.7+rev1', 'prod'],
							['Resin OS 2.12.0+rev1', 'prod'],
							['Resin OS 2.12.1+rev1', 'prod'],
							['balenaOS 2.26.0+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'raspberrypi3' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.29.2+rev1.prod',
								);
							}).to.not.throw();
						});
					});

					it('should throw when updating to a pre-release version with an older server', () => {
						[
							['balenaOS 2.29.2-1704382618288+rev1', 'prod'],
							['balenaOS 2.29.2+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'raspberrypi3' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.28.0-1704382553234+rev1.prod',
								);
							}).to.throw('OS downgrades are not allowed');
						});
					});

					it('should not throw when updating to a pre-release version with a newer base server', () => {
						expect(() => {
							_checkOsUpdateTarget(
								{
									uuid,
									is_of__device_type: [{ slug: 'raspberrypi3' }],
									is_online: true,
									os_version: 'balenaOS 2.28.0+rev1',
									os_variant: 'prod',
								},
								'2.29.2-1704382618288+rev1.prod',
							);
						}).to.not.throw();
					});

					it('should not throw when updating a device that is running a pre-release version to a version with a newer base server', () => {
						expect(() => {
							_checkOsUpdateTarget(
								{
									uuid,
									is_of__device_type: [{ slug: 'raspberrypi3' }],
									is_online: true,
									os_version: 'balenaOS 2.28.0-1704382553234',
									os_variant: 'prod',
								},
								'2.29.2+rev1.prod',
							);
						}).to.not.throw();
					});

					it('should not throw when updating a device that is running a pre-release version updating to a pre-release version with a newer base server', () => {
						expect(() => {
							_checkOsUpdateTarget(
								{
									uuid,
									is_of__device_type: [{ slug: 'raspberrypi3' }],
									is_online: true,
									os_version: 'balenaOS 2.28.0-1704382553234',
									os_variant: 'prod',
								},
								'2.29.2-1704382618288+rev1.prod',
							);
						}).to.not.throw();
					});
				});

				describe('given a jetson-tx2', function () {
					it('should throw when current os version is < 2.7.4', () => {
						[
							['Resin OS 2.0.0.rev1 (prod)', 'prod'],
							['Resin OS 2.0.0.rev1 (prod)', ''],
							['Resin OS 2.0.0+rev2', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', ''],
							['Resin OS 2.0.0.rev1 (prod)', 'prod'],
							['Resin OS 2.0.0.rev1 (prod)', ''],
							['Resin OS 2.0.0+rev2', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', ''],
							['Resin OS 2.0.0+rev3', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', ''],
							['Resin OS 2.0.0+rev4 (prod)', 'prod'],
							['Resin OS 2.0.0+rev4 (prod)', ''],
							['Resin OS 2.0.0+rev5 (prod)', 'prod'],
							['Resin OS 2.0.1.rev1', ''],
							['Resin OS 2.0.2+rev2', ''],
							['Resin OS 2.0.3+rev1', 'prod'],
							['Resin OS 2.0.4+rev1', 'prod'],
							['Resin OS 2.0.4+rev2', 'prod'],
							['Resin OS 2.0.5+rev1', 'prod'],
							['Resin OS 2.0.6+rev1', 'prod'],
							['Resin OS 2.0.6+rev2', 'prod'],
							['Resin OS 2.0.6+rev2', ''],
							['Resin OS 2.1.0+rev1', 'prod'],
							['Resin OS 2.2.0+rev1', 'prod'],
							['Resin OS 2.3.0+rev1', 'prod'],
							['Resin OS 2.3.0+rev2', 'prod'],
							['Resin OS 2.4.1+rev1', 'prod'],
							['Resin OS 2.4.2+rev1', 'prod'],
							['Resin OS 2.6.0+rev1', 'prod'],
							['Resin OS 2.7.2+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'jetson-tx2' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.29.2+rev1.prod',
								);
							}).to.throw('Current OS version must be >= 2.7.4');
						});
					});

					it('should not throw when it is a valid v2 -> v2 prod variant hup', () => {
						[
							['Resin OS 2.7.4+rev1', 'prod'],
							['Resin OS 2.7.4+rev2', 'prod'],
							['Resin OS 2.7.5+rev1', 'prod'],
							['Resin OS 2.7.5+rev2', 'prod'],
							['Resin OS 2.7.6+rev1', 'prod'],
							['Resin OS 2.7.8+rev1', 'prod'],
							['Resin OS 2.7.8+rev2', 'prod'],
							['Resin OS 2.9.7+rev1', 'prod'],
							['Resin OS 2.12.0+rev1', 'prod'],
							['Resin OS 2.12.1+rev1', 'prod'],
							['balenaOS 2.26.0+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'jetson-tx2' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.29.2+rev1.prod',
								);
							}).to.not.throw();
						});
					});

					it('should not throw when it is a valid v2 -> v2 dev variant hup', () => {
						[
							['Resin OS 2.7.4+rev1.dev', 'dev'],
							['Resin OS 2.9.7+rev2.dev', 'dev'],
							['balenaOS 2.26.0+rev1.dev', 'dev'],
						].forEach(function ([osVersion, osVariant]) {
							return expect(() => {
								_checkOsUpdateTarget(
									{
										uuid,
										is_of__device_type: [{ slug: 'jetson-tx2' }],
										is_online: true,
										os_version: osVersion,
										os_variant: osVariant,
									},
									'2.29.2+rev1.dev',
								);
							}).to.not.throw();
						});
					});
				});
			});
		});
	});
});
