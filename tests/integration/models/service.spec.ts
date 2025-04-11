// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
	applicationRetrievalFields,
} from '../setup';
import { expectError, timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';

describe('Service Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);

	describe('given an application with no services', function () {
		givenAnApplication(before);

		let ctx: Mocha.Context;
		before(function () {
			ctx = this;
		});

		parallel('balena.models.service.getAllByApplication()', function () {
			applicationRetrievalFields.forEach((prop) => {
				it(`should eventually become an empty array given an application ${prop}`, async function () {
					const result = await balena.models.service.getAllByApplication(
						ctx.application[prop],
					);
					expect(result).to.deep.equal([]);
				});
			});

			it('should be rejected if the application name does not exist', async function () {
				await expectError(async () => {
					await balena.models.service.getAllByApplication('HelloWorldApp');
				}, 'Application not found: HelloWorldApp');
			});

			it('should be rejected if the application id does not exist', async function () {
				await expectError(async () => {
					await balena.models.service.getAllByApplication(999999);
				}, 'Application not found: 999999');
			});
		});
	});

	describe('given a multicontainer application with two services', function () {
		givenMulticontainerApplication(before);

		describe('balena.models.service.getAllByApplication()', () => {
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
			});
		});

		describe('balena.models.service.var', function () {
			const varModel = balena.models.service.var;
			const serviceParams = [
				'id',
				'service_name & application id',
				'service_name & application slug',
			] as const;

			function getParam(
				service: BalenaSdk.PinePostResult<BalenaSdk.Service>,
				paramName: (typeof serviceParams)[number],
			) {
				if (paramName === 'service_name & application id') {
					return {
						application: service.application.__id,
						service_name: service.service_name,
					};
				}
				if (paramName === 'service_name & application slug') {
					return {
						application: this.application.slug,
						service_name: service.service_name,
					};
				}
				return service[paramName];
			}

			serviceParams.forEach(function (serviceParam) {
				const serviceParamSlug = serviceParam.replace(/[ &]/g, '_');

				it(`can create a variable by service ${serviceParam}`, async function () {
					const param = getParam.call(this, this.webService, serviceParam);
					await varModel.set(
						param,
						`EDITOR_${serviceParamSlug}`,
						`vim_${serviceParamSlug}`,
					);
				});

				it(`...can retrieve a created variable by service ${serviceParam}`, async function () {
					const param = getParam.call(this, this.webService, serviceParam);
					const result = await varModel.get(
						param,
						`EDITOR_${serviceParamSlug}`,
					);
					expect(result).to.equal(`vim_${serviceParamSlug}`);
				});

				it(`...can update and retrieve a variable by service ${serviceParam}`, async function () {
					const param = getParam.call(this, this.webService, serviceParam);
					await varModel.set(
						param,
						`EDITOR_${serviceParamSlug}`,
						`emacs_${serviceParamSlug}`,
					);
					const result = await varModel.get(
						param,
						`EDITOR_${serviceParamSlug}`,
					);
					expect(result).to.equal(`emacs_${serviceParamSlug}`);
				});

				it(`...can delete and then fail to retrieve a variable by service ${serviceParam}`, async function () {
					const param = getParam.call(this, this.webService, serviceParam);
					await varModel.remove(param, `EDITOR_${serviceParamSlug}`);
					const result = await varModel.get(
						param,
						`EDITOR_${serviceParamSlug}`,
					);
					expect(result).to.equal(undefined);
				});

				it(`can create and then retrieve multiple variables by service ${serviceParam}`, async function () {
					const param = getParam.call(this, this.webService, serviceParam);
					await Promise.all([
						varModel.set(
							param,
							`A_${serviceParamSlug}`,
							`a_${serviceParamSlug}`,
						),
						varModel.set(
							param,
							`B_${serviceParamSlug}`,
							`b_${serviceParamSlug}`,
						),
					]);
					const result = await varModel.getAllByService(param);
					expect(_.find(result, { name: `A_${serviceParamSlug}` }))
						.to.be.an('object')
						.that.has.property('value', `a_${serviceParamSlug}`);
					expect(_.find(result, { name: `B_${serviceParamSlug}` }))
						.to.be.an('object')
						.that.has.property('value', `b_${serviceParamSlug}`);
					await Promise.all([
						varModel.remove(param, `A_${serviceParamSlug}`),
						varModel.remove(param, `B_${serviceParamSlug}`),
					]);
				});

				it(`can create and then retrieve multiple variables by application by service ${serviceParam}`, async function () {
					const param = getParam.call(this, this.webService, serviceParam);
					await Promise.all([
						varModel.set(
							param,
							`A_BY_APPLICATION_${serviceParamSlug}`,
							`a_${serviceParamSlug}`,
						),
						varModel.set(
							param,
							`B_BY_APPLICATION_${serviceParamSlug}`,
							`b_${serviceParamSlug}`,
						),
					]);
					const result = await varModel.getAllByApplication(
						this.application.id,
					);
					expect(
						_.find(result, { name: `A_BY_APPLICATION_${serviceParamSlug}` }),
					)
						.to.be.an('object')
						.that.has.property('value', `a_${serviceParamSlug}`);
					expect(
						_.find(result, { name: `B_BY_APPLICATION_${serviceParamSlug}` }),
					)
						.to.be.an('object')
						.that.has.property('value', `b_${serviceParamSlug}`);
					await Promise.all([
						varModel.remove(param, `A_BY_APPLICATION_${serviceParamSlug}`),
						varModel.remove(param, `B_BY_APPLICATION_${serviceParamSlug}`),
					]);
				});
			});
		});
	});
});
