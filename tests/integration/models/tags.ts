// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import type * as BalenaSdk from '../../..';
const { expect } = m.chai;

const getAllByResourcePropNameProvider = (resourceName: string) =>
	`getAllBy${_.upperFirst(_.camelCase(resourceName))}`;

const getAllByResourceFactory = function <T extends BalenaSdk.ResourceTagBase>(
	model: TagModelBase<T>,
	resourceName: string,
) {
	const propName = getAllByResourcePropNameProvider(resourceName);
	return function (
		idOrUniqueParam: number | string,
		cb?: (err: Error | null, result?: any) => void,
	) {
		return (model as any)[propName](idOrUniqueParam, cb) as Promise<
			BalenaSdk.ResourceTagBase[]
		>;
	};
};

export interface TagModelBase<T extends BalenaSdk.ResourceTagBase> {
	getAll(
		options?: BalenaSdk.PineOptions<BalenaSdk.ResourceTagBase>,
	): Promise<T[]>;
	set(uuidOrId: string | number, tagKey: string, value: string): Promise<void>;
	remove(uuidOrId: string | number, tagKey: string): Promise<void>;
}

export interface Options<T extends BalenaSdk.ResourceTagBase> {
	model: TagModelBase<T>;
	modelNamespace: string;
	resourceName: string;
	uniquePropertyNames: string[];
	resourceProvider?: () => { id: number };
	setTagResourceProvider?: () => { id: number };
}

export const itShouldGetAllTagsByResource = function <
	T extends BalenaSdk.ResourceTagBase
>(opts: Options<T>) {
	const { model, resourceName, uniquePropertyNames = [] } = opts;
	const getAllByResource = getAllByResourceFactory(model, resourceName);

	beforeEach(function () {
		if (!opts.resourceProvider) {
			throw new Error('A resourceProvider was not provided!');
		}
		this.resource = opts.resourceProvider();
		// used for tag creation in beforeEach
		this.setTagResource = (
			opts.setTagResourceProvider || opts.resourceProvider
		)();
	});

	it('should become an empty array by default [Promise]', function () {
		const promise = getAllByResource(this.resource.id);
		return expect(promise).to.become([]);
	});

	it('should become an empty array by default [callback]', function (done) {
		getAllByResource(this.resource.id, function (err, tags) {
			try {
				expect(err).to.be.null;
				expect(tags).to.deep.equal([]);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	it(`should be rejected if the ${resourceName} id does not exist`, function () {
		const promise = getAllByResource(999999);
		return expect(promise).to.be.rejectedWith(
			`${_.startCase(resourceName)} not found: 999999`,
		);
	});

	uniquePropertyNames.forEach((uniquePropertyName) => {
		it(`should be rejected if the ${resourceName} ${uniquePropertyName} does not exist`, function () {
			const promise = getAllByResource('123456789');
			return expect(promise).to.be.rejectedWith(
				`${_.startCase(resourceName)} not found: 123456789`,
			);
		});
	});

	describe('given a tag', function () {
		before(function () {
			// we use the tag associated resource id here
			// for cases like device.tags.getAllByApplication()
			// where @setTagResource will be a device and
			// @resource will be an application
			return model.set(this.setTagResource.id, 'EDITOR', 'vim');
		});

		after(function () {
			return model.remove(this.setTagResource.id, 'EDITOR');
		});

		['id', ...uniquePropertyNames].forEach((uniquePropertyName) => {
			it(`should retrieve the tag by ${resourceName} ${uniquePropertyName}`, async function () {
				const tags = await getAllByResource(this.resource[uniquePropertyName]);
				expect(tags).to.have.length(1);
				expect(tags[0].tag_key).to.equal('EDITOR');
				expect(tags[0].value).to.equal('vim');
			});
		});

		it(`should retrieve the tag by ${resourceName} id [callback]`, function (done) {
			getAllByResource(this.resource.id, function (err, tags) {
				try {
					expect(err).to.be.null;
					expect(tags).to.have.length(1);
					expect(tags[0].tag_key).to.equal('EDITOR');
					expect(tags[0].value).to.equal('vim');
					done();
				} catch (err) {
					done(err);
				}
			});
		});
	});
};

export const itShouldSetGetAndRemoveTags = function <
	T extends BalenaSdk.ResourceTagBase
>(opts: Options<T>) {
	const {
		model,
		resourceName,
		uniquePropertyNames = [],
		modelNamespace,
	} = opts;
	const getAllByResource = getAllByResourceFactory(model, resourceName);

	beforeEach(function () {
		if (!opts.resourceProvider) {
			throw new Error('A resourceProvider was not provided!');
		}
		return (this.resource = opts.resourceProvider());
	});

	['id', ...uniquePropertyNames].forEach((param) =>
		describe(`given a ${resourceName} ${param}`, function () {
			const $it = param ? it : it.skip;
			$it(
				`should be rejected if the ${resourceName} id does not exist`,
				function () {
					const resourceUniqueKey = param === 'id' ? 999999 : '123456789';
					const promise = model.set(resourceUniqueKey, 'EDITOR', 'vim');
					return expect(promise).to.be.rejectedWith(
						`${_.startCase(resourceName)} not found: ${resourceUniqueKey}`,
					);
				},
			);

			$it('should initially have no tags', async function () {
				const tags = await getAllByResource(this.resource[param]);
				return expect(tags).to.have.length(0);
			});

			$it('...should be able to create a tag', function () {
				const promise = model.set(
					this.resource[param],
					`EDITOR_BY_${resourceName}_${param}`,
					'vim',
				);
				return expect(promise).to.not.be.rejected;
			});

			$it(
				'...should be able to retrieve all tags, including the one created',
				async function () {
					const tags = await getAllByResource(this.resource[param]);
					expect(tags).to.have.length(1);
					const tag = tags[0];
					expect(tag).to.be.an('object');
					expect(tag.tag_key).to.equal(`EDITOR_BY_${resourceName}_${param}`);
					expect(tag.value).to.equal('vim');
				},
			);

			$it('...should be able to update a tag', async function () {
				await model.set(
					this.resource[param],
					`EDITOR_BY_${resourceName}_${param}`,
					'nano',
				);
				const tags = await getAllByResource(this.resource[param]);
				expect(tags).to.have.length(1);
				const tag = tags[0];
				expect(tag).to.be.an('object');
				expect(tag.tag_key).to.equal(`EDITOR_BY_${resourceName}_${param}`);
				expect(tag.value).to.equal('nano');
			});

			$it('...should be able to remove a tag', async function () {
				await model.remove(
					this.resource[param],
					`EDITOR_BY_${resourceName}_${param}`,
				);
				const tags = await getAllByResource(this.resource.id);
				return expect(tags).to.have.length(0);
			});
		}),
	);

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
		before(function () {
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

		describe(`${modelNamespace}.getAll()`, function () {
			it('should retrieve all the tags', async function () {
				let tags = await model.getAll();
				tags = _.sortBy(tags, 'tag_key');
				expect(tags.length).to.be.gte(2);
				// exclude tags that the user can access b/c of public apps
				const tagsOfUsersResource = tags.filter(
					(t) => t[resourceName].__id === this.resource.id,
				);
				expect(tagsOfUsersResource[0].tag_key).to.equal('EDITOR');
				expect(tagsOfUsersResource[0].value).to.equal('vim');
				expect(tagsOfUsersResource[1].tag_key).to.equal('LANGUAGE');
				expect(tagsOfUsersResource[1].value).to.equal('js');
			});

			it('should retrieve the filtered tag', async function () {
				const tags = await model.getAll({ $filter: { tag_key: 'EDITOR' } });
				expect(tags.length).to.be.gte(1);
				// exclude tags that the user can access b/c of public apps
				const tagsOfUsersResource = tags.filter(
					(t) => t[resourceName].__id === this.resource.id,
				);
				expect(tagsOfUsersResource[0].tag_key).to.equal('EDITOR');
				expect(tagsOfUsersResource[0].value).to.equal('vim');
			});
		});

		describe(`${modelNamespace}.set()`, () =>
			it('should be able to update a tag without affecting the rest', async function () {
				await model.set(this.resource.id, 'EDITOR', 'emacs');
				let tags = await getAllByResource(this.resource.id);
				tags = _.sortBy(tags, 'tag_key');
				expect(tags).to.have.length(2);
				expect(tags[0].tag_key).to.equal('EDITOR');
				expect(tags[0].value).to.equal('emacs');
				expect(tags[1].tag_key).to.equal('LANGUAGE');
				expect(tags[1].value).to.equal('js');
			}));
	});
};
