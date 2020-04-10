// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import { balena, BalenaSdk } from '../setup';
const { expect } = m.chai;

const expectDeviceTypeArray = function(deviceTypes: BalenaSdk.DeviceType[]) {
	expect(deviceTypes).to.be.an('array');
	expect(deviceTypes).to.not.have.length(0);

	for (const deviceType of deviceTypes) {
		expect(deviceType.slug).to.exist;
		expect(deviceType.name).to.exist;
		expect(deviceType.arch).to.exist;
	}
};

const REPLACED_STATES = ['PREVIEW', 'EXPERIMENTAL'];

const REPLACED_NAME_SUFFIXES = ['(PREVIEW)', '(EXPERIMENTAL)', '(BETA)'];

const itNormalizesDeviceTypes = function() {
	it('changes old device type states', function(this: Mocha.Context & {
		deviceTypes: BalenaSdk.DeviceType[];
	}) {
		for (const deviceType of this.deviceTypes) {
			expect(deviceType.state).to.satisfy((dtState: string) =>
				_.every(REPLACED_STATES, replacedState => dtState !== replacedState),
			);
		}
	});

	it('changes old device type name suffixes', function(this: Mocha.Context & {
		deviceTypes: BalenaSdk.DeviceType[];
	}) {
		for (const deviceType of this.deviceTypes) {
			expect(deviceType.name).to.satisfy((dtName: string) =>
				_.every(
					REPLACED_NAME_SUFFIXES,
					replacedSuffix => !_.endsWith(dtName, replacedSuffix),
				),
			);
		}
	});

	return it('properly replaces the names of device types with old states', function(this: Mocha.Context & {
		deviceTypes: BalenaSdk.DeviceType[];
	}) {
		for (const deviceType of this.deviceTypes) {
			if (deviceType.state === 'PREVIEW') {
				expect(deviceType.name).to.satisfy((dtName: string) =>
					_.endsWith(dtName, '(ALPHA)'),
				);
			}

			if (deviceType.state === 'BETA') {
				expect(deviceType.name).to.satisfy((dtName: string) =>
					_.endsWith(dtName, '(NEW)'),
				);
			}
		}
	});
};

describe('Config Model', function() {
	before(function() {
		return balena.auth.logout();
	});

	describe('balena.models.config.getAll()', function() {
		it('should return all the configuration', () =>
			balena.models.config.getAll().then(function(config) {
				expect(_.isPlainObject(config)).to.be.true;
				expect(_.isEmpty(config)).to.be.false;
			}));

		it('should include the pubnub keys', () =>
			balena.models.config
				.getAll()
				.get('pubnub')
				.then(function(pubnubKeys) {
					expect(pubnubKeys.publish_key)
						.to.be.a('string')
						.that.has.length(0);
					expect(pubnubKeys.subscribe_key)
						.to.be.a('string')
						.that.has.length(0);
				}));

		it('should include the mixpanel token', () =>
			balena.models.config
				.getAll()
				.get('mixpanelToken')
				.then(function(mixpanelToken) {
					expect(mixpanelToken).to.be.a('string');
					expect(mixpanelToken).to.equal('balena-main');
				}));

		it('should include the deviceTypes', () =>
			balena.models.config
				.getAll()
				.get('deviceTypes')
				.then(deviceTypes => expectDeviceTypeArray(deviceTypes)));

		describe('device type normalization', function() {
			before(function() {
				return balena.models.config
					.getAll()
					.get('deviceTypes')
					.then(deviceTypes => {
						this.deviceTypes = deviceTypes;
					});
			});

			itNormalizesDeviceTypes();
		});
	});

	describe('balena.models.config.getDeviceTypes()', function() {
		it('should become the device types', function() {
			return balena.models.config
				.getDeviceTypes()
				.then(deviceTypes => expectDeviceTypeArray(deviceTypes));
		});

		describe('device type normalization', function() {
			before(function() {
				return balena.models.config.getDeviceTypes().then(deviceTypes => {
					this.deviceTypes = deviceTypes;
				});
			});

			itNormalizesDeviceTypes();
		});
	});

	describe('balena.models.config.getDeviceOptions()', function() {
		it('should become the device options', () =>
			balena.models.config
				.getDeviceOptions('raspberry-pi')
				.then(options => expect(Array.isArray(options)).to.be.true));

		it('should become the device options given a device type alias', () =>
			balena.models.config
				.getDeviceOptions('raspberrypi')
				.then(options => expect(Array.isArray(options)).to.be.true));

		it('should reject if device type is invalid', function() {
			const promise = balena.models.config.getDeviceOptions('foobarbaz');
			return expect(promise).to.be.rejectedWith(
				'Invalid device type: foobarbaz',
			);
		});
	});
});
