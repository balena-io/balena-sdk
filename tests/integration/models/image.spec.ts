import * as m from 'mochainon';
import {
	givenLoggedInUser,
	givenMulticontainerApplication,
	resin,
} from '../setup';
const { expect } = m.chai;

describe('Image Model', function() {
	givenLoggedInUser();

	describe('given an application with no releases', function() {
		beforeEach(function() {
			return resin.models.application
				.create({
					name: 'FooBar',
					applicationType: 'microservices-starter',
					deviceType: 'raspberry-pi',
				})
				.then(application => {
					this.application = application;
				});
		});

		describe('resin.models.image.get()', function() {
			it('should be rejected if the image id does not exist', function() {
				const promise = resin.models.image.get(123);
				return expect(promise).to.be.rejectedWith('Image not found: 123');
			});
		});

		describe('resin.models.image.getLogs()', function() {
			it('should be rejected if the image id does not exist', function() {
				const promise = resin.models.image.getLogs(123);
				return expect(promise).to.be.rejectedWith('Image not found: 123');
			});
		});
	});

	describe('given a multicontainer application with two releases', function() {
		givenMulticontainerApplication();

		describe('resin.models.image.get()', function() {
			it('should get the requested image', function() {
				return resin.models.image.get(this.newWebImage.id).then(image => {
					expect(image).to.deep.match({
						project_type: 'dockerfile',
						status: 'success',
						id: this.newWebImage.id,
					});
					expect(image.build_log).to.be.undefined;
				});
			});
		});

		describe('resin.models.image.getLogs()', function() {
			it('should get the requested image logs', function() {
				return resin.models.image
					.getLogs(this.newWebImage.id)
					.then(logs => expect(logs).to.equal('new web log'));
			});
		});
	});
});
