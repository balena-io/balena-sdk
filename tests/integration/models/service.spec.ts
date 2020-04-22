import * as Bluebird from 'bluebird';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
} from '../setup';
const { expect } = m.chai;

describe('Service Model', function () {
	givenLoggedInUser(before);

	describe('given an application with no services', function () {
		givenAnApplication(before);

		describe('balena.models.service.getAllByApplication()', function () {
			['id', 'app_name', 'slug'].forEach((prop) => {
				it(`should eventually become an empty array given an application ${prop}`, function () {
					const promise = balena.models.service.getAllByApplication(
						this.application[prop],
					);
					return expect(promise).to.become([]);
				});
			});

			it('should be rejected if the application name does not exist', function () {
				const promise = balena.models.service.getAllByApplication(
					'HelloWorldApp',
				);
				return expect(promise).to.be.rejectedWith(
					'Application not found: HelloWorldApp',
				);
			});

			it('should be rejected if the application id does not exist', function () {
				const promise = balena.models.service.getAllByApplication(999999);
				return expect(promise).to.be.rejectedWith(
					'Application not found: 999999',
				);
			});
		});
	});

	describe('given a multicontainer application with two services', function () {
		givenMulticontainerApplication(before);

		describe('balena.models.service.getAllByApplication()', () =>
			it('should load both services', function () {
				return balena.models.service
					.getAllByApplication(this.application.id)
					.then((services) => {
						expect(services).to.have.lengthOf(2);

						const sortedServices = _.sortBy(
							services,
							(service) => service.service_name,
						);
						expect(sortedServices).to.deep.match([
							{
								service_name: 'db',
								application: { __id: this.application.id },
							},
							{
								service_name: 'web',
								application: { __id: this.application.id },
							},
						]);
					});
			}));

		describe('balena.models.service.var', function () {
			const varModel = balena.models.service.var;

			it('can create a variable', function () {
				const promise = varModel.set(this.webService.id, 'EDITOR', 'vim');
				return expect(promise).to.not.be.rejected;
			});

			it('...can retrieve a created variable', function () {
				return varModel
					.get(this.webService.id, 'EDITOR')
					.then((result) => expect(result).to.equal('vim'));
			});

			it('...can update and retrieve a variable', function () {
				return varModel
					.set(this.webService.id, 'EDITOR', 'emacs')
					.then(() => {
						return varModel.get(this.webService.id, 'EDITOR');
					})
					.then((result) => expect(result).to.equal('emacs'));
			});

			it('...can delete and then fail to retrieve a variable', function () {
				return varModel
					.remove(this.webService.id, 'EDITOR')
					.then(() => {
						return varModel.get(this.webService.id, 'EDITOR');
					})
					.then((result) => expect(result).to.equal(undefined));
			});

			it('can create and then retrieve multiple variables', function () {
				return Bluebird.all([
					varModel.set(this.webService.id, 'A', 'a'),
					varModel.set(this.webService.id, 'B', 'b'),
				])
					.then(() => {
						return varModel.getAllByService(this.webService.id);
					})
					.then((result) => {
						expect(_.find(result, { name: 'A' }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: 'B' }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return Bluebird.all([
							varModel.remove(this.webService.id, 'A'),
							varModel.remove(this.webService.id, 'B'),
						]);
					});
			});

			it('can create and then retrieve multiple variables by application', function () {
				return Bluebird.all([
					varModel.set(this.webService.id, 'A_BY_APPLICATION', 'a'),
					varModel.set(this.webService.id, 'B_BY_APPLICATION', 'b'),
				])
					.then(() => {
						return varModel.getAllByApplication(this.application.id);
					})
					.then((result) => {
						expect(_.find(result, { name: 'A_BY_APPLICATION' }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: 'B_BY_APPLICATION' }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return Bluebird.all([
							varModel.remove(this.webService.id, 'A_BY_APPLICATION'),
							varModel.remove(this.webService.id, 'B_BY_APPLICATION'),
						]);
					});
			});
		});
	});
});
