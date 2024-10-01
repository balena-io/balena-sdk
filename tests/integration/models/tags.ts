// eslint-disable-next-line no-restricted-imports
import * as _ from 'lodash';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import type * as BalenaSdk from '../../..';
import type { Dictionary } from '../../../typings/utils';
import { getFieldLabel, getParam } from '../utils';

const getAllByResourcePropNameProvider = (resourceName: string) =>
	`getAllBy${_.upperFirst(_.camelCase(resourceName))}`;

const getAllByResourceFactory = function (
	model: TagModelBase,
	resourceName: string,
) {
	const propName = getAllByResourcePropNameProvider(resourceName);
	return function (
		idOrUniqueParam: number | string | Dictionary<unknown>,
		options?: BalenaSdk.PineOptions<BalenaSdk.ResourceTagBase>,
	) {
		return (model as any)[propName](idOrUniqueParam, options) as Promise<
			BalenaSdk.ResourceTagBase[]
		>;
	};
};

const getTagKey = (key: string | { [key: string]: string }) =>
	typeof key === 'string' ? key : Object.keys(key).join('___');

export interface TagModelBase {
	set(
		uuidOrIdOrDict: string | number | Dictionary<unknown>,
		tagKey: string,
		value: string,
	): Promise<void>;
	remove(
		uuidOrIdOrDict: string | number | Dictionary<unknown>,
		tagKey: string,
	): Promise<void>;
}

export interface Options {
	model: TagModelBase;
	modelNamespace: string;
	resourceName: string;
	/** uniquePropertyNames: properties with ids coming from ctx should come first */
	uniquePropertyNames: Array<string | { [key: string]: string }>;
	resourceProvider?: () => { id: number };
	setTagResourceProvider?: () => { id: number };
}

export const itShouldGetAllTagsByResource = function (opts: Options) {
	const { model, resourceName, uniquePropertyNames } = opts;
	const getAllByResource = getAllByResourceFactory(model, resourceName);

	let ctx: Mocha.Context;
	before(function () {
		if (!opts.resourceProvider) {
			throw new Error('A resourceProvider was not provided!');
		}
		this.resource = opts.resourceProvider();
		// used for tag creation in beforeEach
		this.setTagResource = (
			opts.setTagResourceProvider ?? opts.resourceProvider
		)();
		ctx = this;
	});

	parallel('', function () {
		it('should become an empty array by default', async function () {
			const result = await getAllByResource(ctx.resource.id);
			expect(result).to.deep.equal([]);
		});

		it(`should be rejected if the ${resourceName} id does not exist`, function () {
			const promise = getAllByResource(999999);
			return expect(promise).to.be.rejectedWith(
				`${_.startCase(resourceName)} not found: 999999`,
			);
		});

		uniquePropertyNames.forEach((uniquePropertyName) => {
			const uniquePropertyNameLabel = getFieldLabel(uniquePropertyName);
			it(`should be rejected if the ${resourceName} ${uniquePropertyNameLabel} does not exist`, function () {
				let getAllByResourceParam;
				if (uniquePropertyName === 'id') {
					getAllByResourceParam = 123456789;
				} else if (typeof uniquePropertyName === 'object') {
					getAllByResourceParam = {};
					const properties = Object.entries(uniquePropertyName);
					const resources = opts.resourceProvider?.();
					// NOTE: This test only works if the dictionary properties are in order by scope, i.e. application -> release instead of release -> application
					for (let i = 0; i < properties.length; i++) {
						if (i < properties.length - 1) {
							const resource = resources?.[properties[i][0]];
							getAllByResourceParam[properties[i][1]] =
								(typeof resource === 'object' ? resource.__id : resource) ??
								'123456789';
						} else {
							getAllByResourceParam[properties[i][1]] = '123456789';
						}
					}
				} else {
					getAllByResourceParam = '123456789';
				}
				const promise = getAllByResource(getAllByResourceParam);
				return expect(promise).to.be.rejectedWith(
					`${_.startCase(resourceName)} not found: ${
						typeof getAllByResourceParam === 'object'
							? `unique pair ${Object.keys(getAllByResourceParam).join(
									' & ',
								)}: ${Object.values(getAllByResourceParam).join(' & ')}`
							: 123456789
					}`,
				);
			});
		});
	});

	describe('given a tag', function () {
		before(function () {
			ctx = this;
			// we use the tag associated resource id here
			// for cases like device.tags.getAllByApplication()
			// where @setTagResource will be a device and
			// @resource will be an application
			return model.set(this.setTagResource.id, 'EDITOR', 'vim');
		});

		after(function () {
			return model.remove(this.setTagResource.id, 'EDITOR');
		});

		parallel('', function () {
			uniquePropertyNames.forEach((uniquePropertyName) => {
				const uniquePropertyNameLabel = getFieldLabel(uniquePropertyName);
				it(`should retrieve the tag by ${resourceName} ${uniquePropertyNameLabel}`, async function () {
					const getAllByResourceParam = getParam(
						uniquePropertyName,
						ctx.resource,
					);
					const tags = await getAllByResource(getAllByResourceParam);
					expect(tags).to.have.length(1);
					expect(tags[0].tag_key).to.equal('EDITOR');
					expect(tags[0].value).to.equal('vim');
				});
			});
		});
	});
};

export const itShouldSetGetAndRemoveTags = function (opts: Options) {
	const { model, resourceName, uniquePropertyNames, modelNamespace } = opts;
	const getAllByResource = getAllByResourceFactory(model, resourceName);

	before(function () {
		if (!opts.resourceProvider) {
			throw new Error('A resourceProvider was not provided!');
		}
		this.resource = opts.resourceProvider();
	});

	uniquePropertyNames.forEach((param) => {
		const uniquePropertyNameLabel = getFieldLabel(param);
		describe(`given a ${resourceName} ${uniquePropertyNameLabel}`, function () {
			const $it = param ? it : it.skip;
			$it(
				`should be rejected if the ${resourceName} id does not exist`,
				function () {
					const promise = model.set(999999, 'EDITOR', 'vim');
					return expect(promise).to.be.rejectedWith(
						`${_.startCase(resourceName)} not found: `,
					);
				},
			);

			$it('should initially have no tags', async function () {
				const getAllByResourceParam = getParam(param, this.resource);
				const tags = await getAllByResource(getAllByResourceParam);
				return expect(tags).to.have.length(0);
			});

			$it('...should be able to create a tag', function () {
				const setParam = getParam(param, this.resource);
				const tagKeyPart = getTagKey(param);
				const promise = model.set(
					setParam,
					`EDITOR_BY_${resourceName}_${tagKeyPart}`,
					'vim',
				);
				return expect(promise).to.not.be.rejected;
			});

			$it(
				'...should be able to retrieve all tags, including the one created',
				async function () {
					const getAllByResourceParam = getParam(param, this.resource);
					const tags = await getAllByResource(getAllByResourceParam);
					expect(tags).to.have.length(1);
					const tag = tags[0];
					expect(tag).to.be.an('object');
					const tagKeyPart = getTagKey(param);
					expect(tag.tag_key).to.equal(
						`EDITOR_BY_${resourceName}_${tagKeyPart}`,
					);
					expect(tag.value).to.equal('vim');
				},
			);

			$it('...should be able to update a tag', async function () {
				const setParam = getParam(param, this.resource);
				const tagKeyPart = getTagKey(param);
				await model.set(
					setParam,
					`EDITOR_BY_${resourceName}_${tagKeyPart}`,
					'nano',
				);
				const tags = await getAllByResource(setParam);
				expect(tags).to.have.length(1);
				const tag = tags[0];
				expect(tag).to.be.an('object');
				expect(tag.tag_key).to.equal(`EDITOR_BY_${resourceName}_${tagKeyPart}`);
				expect(tag.value).to.equal('nano');
			});

			$it('...should be able to remove a tag', async function () {
				const removeParam = getParam(param, this.resource);
				const tagKeyPart = getTagKey(param);
				await model.remove(
					removeParam,
					`EDITOR_BY_${resourceName}_${tagKeyPart}`,
				);
				const tags = await getAllByResource(this.resource.id);
				return expect(tags).to.have.length(0);
			});
		});
	});

	describe(`${modelNamespace}.set()`, function () {
		it('should not allow creating a resin tag', function () {
			const promise = model.set(this.resource.id, 'io.resin.test', 'secret');
			return expect(promise).to.be.rejectedWith(
				'Tag keys beginning with io.resin. are reserved.',
			);
		});

		it('should not allow creating a balena tag', function () {
			const promise = model.set(this.resource.id, 'io.balena.test', 'secret');
			return expect(promise).to.be.rejectedWith(
				'Tag keys beginning with io.balena. are reserved.',
			);
		});

		it('should not allow creating a tag with a name containing a whitespace', function () {
			const promise = model.set(this.resource.id, 'EDITOR 1', 'vim');
			return expect(promise).to.be.rejectedWith(
				/Request error: Tag keys cannot contain whitespace./,
			);
		});

		it('should be rejected if the tag_key is undefined', function () {
			const promise = model.set(this.resource.id, undefined as any, 'vim');
			return expect(promise).to.be.rejected;
		});

		it('should be rejected if the tag_key is null', function () {
			const promise = model.set(this.resource.id, null as any, 'vim');
			return expect(promise).to.be.rejected;
		});

		it('should be able to create a numeric tag', async function () {
			await model.set(this.resource.id, 'EDITOR_NUMERIC', 1 as any);
			const tags = await getAllByResource(this.resource.id);
			expect(tags).to.have.length(1);
			expect(tags[0].tag_key).to.equal('EDITOR_NUMERIC');
			expect(tags[0].value).to.equal('1');
			return model.remove(this.resource.id, 'EDITOR_NUMERIC');
		});
	});

	describe('given two existing tags', function () {
		let ctx: Mocha.Context;
		before(function () {
			ctx = this;
			return Promise.all([
				model.set(this.resource.id, 'EDITOR', 'vim'),
				model.set(this.resource.id, 'LANGUAGE', 'js'),
			]);
		});

		after(function () {
			return Promise.all([
				model.remove(this.resource.id, 'EDITOR'),
				model.remove(this.resource.id, 'LANGUAGE'),
			]);
		});

		const getAllByResourceMethodName =
			getAllByResourcePropNameProvider(resourceName);

		parallel(`${modelNamespace}.${getAllByResourceMethodName}()`, function () {
			it('should retrieve all the tags by ', async function () {
				let tags = await getAllByResource(ctx.resource.id);
				tags = _.sortBy(tags, 'tag_key');
				expect(tags.length).to.be.gte(2);
				// exclude tags that the user can access b/c of public apps
				const tagsOfUsersResource = tags.filter(
					(t) => t[resourceName].__id === ctx.resource.id,
				);
				expect(tagsOfUsersResource[0].tag_key).to.equal('EDITOR');
				expect(tagsOfUsersResource[0].value).to.equal('vim');
				expect(tagsOfUsersResource[1].tag_key).to.equal('LANGUAGE');
				expect(tagsOfUsersResource[1].value).to.equal('js');
			});

			it('should retrieve the filtered tag', async function () {
				const tags = await getAllByResource(ctx.resource.id, {
					$filter: { tag_key: 'EDITOR' },
				});
				expect(tags.length).to.be.gte(1);
				// exclude tags that the user can access b/c of public apps
				const tagsOfUsersResource = tags.filter(
					(t) => t[resourceName].__id === ctx.resource.id,
				);
				expect(tagsOfUsersResource[0].tag_key).to.equal('EDITOR');
				expect(tagsOfUsersResource[0].value).to.equal('vim');
			});
		});

		describe(`${modelNamespace}.set()`, () => {
			it('should be able to update a tag without affecting the rest', async function () {
				await model.set(ctx.resource.id, 'EDITOR', 'emacs');
				let tags = await getAllByResource(ctx.resource.id);
				tags = _.sortBy(tags, 'tag_key');
				expect(tags).to.have.length(2);
				expect(tags[0].tag_key).to.equal('EDITOR');
				expect(tags[0].value).to.equal('emacs');
				expect(tags[1].tag_key).to.equal('LANGUAGE');
				expect(tags[1].value).to.equal('js');
			});
		});
	});
};
