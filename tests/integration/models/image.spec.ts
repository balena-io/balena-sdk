import * as m from 'mochainon';
import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
} from '../setup';
const { expect } = m.chai;

describe('Image Model', function () {
	givenLoggedInUser(before);

	describe('given an application with no releases', function () {
		givenAnApplication(before);

		describe('balena.models.image.get()', function () {
			it('should be rejected if the image id does not exist', function () {
				const promise = balena.models.image.get(123);
				return expect(promise).to.be.rejectedWith('Image not found: 123');
			});
		});

		describe('balena.models.image.getLogs()', function () {
			it('should be rejected if the image id does not exist', function () {
				const promise = balena.models.image.getLogs(123);
				return expect(promise).to.be.rejectedWith('Image not found: 123');
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
