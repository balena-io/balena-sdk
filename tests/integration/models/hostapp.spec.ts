// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena } from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';
const { expect } = m.chai;

const containsVersion = (
	versions: BalenaSdk.OsVersion[],
	expected: Partial<BalenaSdk.OsVersion>,
) => {
	const os = _.find(versions, expected);
	expect(os).to.not.be.undefined;
};

describe('Hostapp model', function () {
	timeSuite(before);
	parallel('balena.models.hostapp.getAllOsVersions()', function () {
		it('should contain both balenaOS and balenaOS ESR OS types [string device type argument]', async () => {
			const res = await balena.models.hostapp.getAllOsVersions('fincm3');
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
			const res = await balena.models.hostapp.getAllOsVersions(['fincm3']);
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
			const res = await balena.models.hostapp.getAllOsVersions([
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
			const res = await balena.models.hostapp.getAllOsVersions(['blahbleh']);

			expect(res).to.deep.equal({});
		});

		it('should cache the results when not providing extra options', async () => {
			const firstRes = await balena.models.hostapp.getAllOsVersions([
				'raspberrypi3',
			]);
			const secondRes = await balena.models.hostapp.getAllOsVersions([
				'raspberrypi3',
			]);
			expect(firstRes).to.equal(secondRes);
		});

		it('should not cache the results when providing extra options', async () => {
			const firstRes = await balena.models.hostapp.getAllOsVersions(
				['raspberrypi3'],
				{ $filter: { is_invalidated: false } },
			);
			const secondRes = await balena.models.hostapp.getAllOsVersions(
				['raspberrypi3'],
				{ $filter: { is_invalidated: false } },
			);
			expect(firstRes).to.not.equal(secondRes);
		});
	});

	parallel('balena.models.hostapp.getAvailableOsVersions()', function () {
		it('should contain both balenaOS and balenaOS ESR OS types [string device type argument]', async () => {
			const res = await balena.models.hostapp.getAvailableOsVersions('fincm3');
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
			const res = await balena.models.hostapp.getAvailableOsVersions([
				'fincm3',
			]);
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
			const res = await balena.models.hostapp.getAvailableOsVersions([
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
			const res = await balena.models.hostapp.getAvailableOsVersions([
				'blahbleh',
			]);

			expect(res).to.deep.equal({});
		});

		it('should cache the results', async () => {
			const firstRes = await balena.models.hostapp.getAvailableOsVersions([
				'raspberrypi3',
			]);
			const secondRes = await balena.models.hostapp.getAvailableOsVersions([
				'raspberrypi3',
			]);
			expect(firstRes).to.equal(secondRes);
		});
	});
});
