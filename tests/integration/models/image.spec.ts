import { expect } from 'chai';
import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
} from '../setup';
import { expectError, timeSuite } from '../../util';

describe('Image Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);

	describe('given an application with no releases', function () {
		givenAnApplication(before);

		describe('balena.models.image.get()', function () {
			it('should be rejected if the image id does not exist', async function () {
				await expectError(async () => {
					await balena.models.image.get(123);
				}, 'Image not found: 123');
			});
		});

		describe('balena.models.image.getLogs()', function () {
			it('should be rejected if the image id does not exist', async function () {
				await expectError(async () => {
					await balena.models.image.getLogs(123);
				}, 'Image not found: 123');
			});
		});
	});

	describe('given a multicontainer application with two releases', function () {
		givenMulticontainerApplication(before);

		describe('balena.models.image.get()', function () {
			it('should get the requested image', function () {
				return balena.models.image.get(this.newWebImage.id).then((image) => {
					expect(image).to.deep.match({
						project_type: 'dockerfile',
						status: 'success',
						id: this.newWebImage.id,
					});
					expect(image.build_log).to.be.undefined;
				});
			});
		});

		describe('balena.models.image.getLogs()', function () {
			it('should get the requested image logs', function () {
				return balena.models.image
					.getLogs(this.newWebImage.id)
					.then((logs) => expect(logs).to.equal('new web log'));
			});
		});
	});
});
