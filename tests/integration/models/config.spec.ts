// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena } from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';

const expectDeviceTypeArray = function (
	deviceTypes: BalenaSdk.DeviceTypeJson.DeviceType[],
) {
	expect(deviceTypes).to.be.an('array');
	expect(deviceTypes).to.not.have.length(0);

	for (const deviceType of deviceTypes) {
		expect(deviceType.slug).to.exist;
		expect(deviceType.name).to.exist;
		expect(deviceType.arch).to.exist;
	}
};

type ConfigContext = Mocha.Context & {
	deviceTypes: BalenaSdk.DeviceTypeJson.DeviceType[];
};

const itNormalizesDeviceTypes = function () {
	it('should not have an `instructions` field', function (this: Mocha.Context) {
		for (const deviceType of (this as ConfigContext).deviceTypes) {
			expect(deviceType).to.not.have.property('instructions');
		}
	});
};

describe('Config Model', function () {
	timeSuite(before);
	before(function () {
		return balena.auth.logout();
	});

	describe('balena.models.config.getAll()', function () {
		parallel('', function () {
			it('should return all the configuration', () => {
				return balena.models.config.getAll().then(function (config) {
					expect(_.isPlainObject(config)).to.be.true;
					expect(_.isEmpty(config)).to.be.false;
				});
			});

			it('should include the mixpanel token', () => {
				return balena.models.config.getAll().then(function ({ mixpanelToken }) {
					expect(mixpanelToken).to.be.a('string');
					expect(mixpanelToken).to.equal('balena-main');
				});
			});

			it('should not include the deviceTypes', async function () {
				const config = await balena.models.config.getAll();
				expect(config).to.not.have.property('deviceTypes');
			});
		});
	});

	describe('balena.models.config.getDeviceTypes()', function () {
		it('should become the device types', function () {
			return balena.models.config.getDeviceTypes().then((deviceTypes) => {
				expectDeviceTypeArray(deviceTypes);
			});
		});

		describe('device type normalization', function () {
			before(function () {
				return balena.models.config.getDeviceTypes().then((deviceTypes) => {
					this.deviceTypes = deviceTypes;
				});
			});

			itNormalizesDeviceTypes();
		});
	});

	parallel('balena.models.config.getDeviceTypeManifestBySlug()', function () {
		it('should become the manifest if the slug is valid', async () => {
			const manifest =
				await balena.models.config.getDeviceTypeManifestBySlug('raspberry-pi');
			expect(_.isPlainObject(manifest)).to.be.true;
			expect(manifest.slug).to.exist;
			expect(manifest.name).to.exist;
			return expect(manifest.options).to.exist;
		});

		it('should be rejected if the device slug is invalid', function () {
			const promise =
				balena.models.config.getDeviceTypeManifestBySlug('foobar');
			return expect(promise).to.be.rejectedWith('Invalid device type: foobar');
		});

		it('should become the manifest given a device type alias', async () => {
			const manifest =
				await balena.models.config.getDeviceTypeManifestBySlug('raspberrypi');
			return expect(manifest.slug).to.equal('raspberry-pi');
		});
	});

	describe('balena.models.config.getConfigVarSchema()', function () {
		it('Fetching config var schema without deviceType', async function () {
			const result = await balena.models.config.getConfigVarSchema();
			expect(result).to.be.an('object');
			expect(result).to.have.property('reservedNames').that.is.an('array');
			expect(result).to.have.property('reservedNamespaces').that.is.an('array');
			expect(result).to.have.property('whiteListedNames').that.is.an('array');
			expect(result)
				.to.have.property('whiteListedNamespaces')
				.that.is.an('array');
			expect(result).to.have.property('blackListedNames').that.is.an('array');
			expect(result)
				.to.have.property('configVarSchema')
				.that.has.property('properties')
				.that.has.property('BALENA_SUPERVISOR_HARDWARE_METRICS')
				.that.is.an('object');
			expect(result)
				.to.have.property('configVarSchema')
				.that.has.property('properties')
				.that.does.not.have.property('BALENA_HOST_CONFIG_hdmi_mode');
		});

		it('Fetching config var schema with deviceType', async function () {
			const result =
				await balena.models.config.getConfigVarSchema('raspberry-pi');
			expect(result).to.be.an('object');
			expect(result).to.have.property('reservedNames').that.is.an('array');
			expect(result).to.have.property('reservedNamespaces').that.is.an('array');
			expect(result).to.have.property('whiteListedNames').that.is.an('array');
			expect(result)
				.to.have.property('whiteListedNamespaces')
				.that.is.an('array');
			expect(result).to.have.property('blackListedNames').that.is.an('array');
			expect(result)
				.to.have.property('configVarSchema')
				.that.has.property('properties')
				.that.has.property('BALENA_SUPERVISOR_HARDWARE_METRICS')
				.that.is.an('object');
			expect(result)
				.to.have.property('configVarSchema')
				.that.has.property('properties')
				.that.has.property('BALENA_HOST_CONFIG_hdmi_mode')
				.that.is.an('object');
		});
	});

	parallel('balena.models.config.getDeviceOptions()', function () {
		it('should become the device options', () => {
			return balena.models.config
				.getDeviceOptions('raspberry-pi')
				.then((options) => expect(Array.isArray(options)).to.be.true);
		});

		it('should become the device options given a device type alias', () => {
			return balena.models.config
				.getDeviceOptions('raspberrypi')
				.then((options) => expect(Array.isArray(options)).to.be.true);
		});

		it('should reject if device type is invalid', function () {
			const promise = balena.models.config.getDeviceOptions('foobarbaz');
			return expect(promise).to.be.rejectedWith(
				'Invalid device type: foobarbaz',
			);
		});
	});
});
