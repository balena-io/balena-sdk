import * as Bluebird from 'bluebird';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import { BalenaSdk } from '../setup';
const { expect } = m.chai;

const getAllByResourcePropNameProvider = (resourceName: string) =>
	`getAllBy${_.startCase(resourceName)}`;

const getAllByResourceFactory = function (
	model: TagModelBase,
	resourceName: string,
) {
	const propName = getAllByResourcePropNameProvider(resourceName);
	return (idOrUniqueParam: number | string) =>
		(model as any)[propName](idOrUniqueParam) as Bluebird<
			BalenaSdk.ResourceTagBase[]
		>;
};

interface TagModelBase {
	getAll(
		options?: BalenaSdk.PineOptionsFor<BalenaSdk.ResourceTagBase>,
	): Promise<BalenaSdk.ResourceTagBase[]>;
	set(uuidOrId: string | number, tagKey: string, value: string): Promise<void>;
	remove(uuidOrId: string | number, tagKey: string): Promise<void>;
}

export interface Options {
	model: TagModelBase;
	modelNamespace: string;
	resourceName: string;
	uniquePropertyNames: string[];
	resourceProvider: () => { id: number };
	setTagResourceProvider: () => { id: number };
}

exports.itShouldGetAllTagsByResource = function (opts: Options) {
	const { model, resourceName, uniquePropertyNames = [] } = opts;
	const getAllByResource = getAllByResourceFactory(model, resourceName);

	beforeEach(function () {
		this.resource = opts.resourceProvider();
		// used for tag creation in beforeEach
		return (this.setTagResource = (
			opts.setTagResourceProvider || opts.resourceProvider
		)());
	});

	it('should become an empty array by default', function () {
		const promise = getAllByResource(this.resource.id);
		return expect(promise).to.become([]);
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

		it(`should retrieve the tag by ${resourceName} id`, function () {
			return getAllByResource(this.resource.id).then(function (tags) {
				expect(tags).to.have.length(1);
				expect(tags[0].tag_key).to.equal('EDITOR');
				expect(tags[0].value).to.equal('vim');
			});
		});

		uniquePropertyNames.forEach((uniquePropertyName) => {
			it(`should retrieve the tag by ${resourceName} ${uniquePropertyName}`, function () {
				return getAllByResource(this.resource[uniquePropertyName]).then(
					function (tags) {
						expect(tags).to.have.length(1);
						expect(tags[0].tag_key).to.equal('EDITOR');
						expect(tags[0].value).to.equal('vim');
					},
				);
			});
		});
	});
};

exports.itShouldSetGetAndRemoveTags = function (opts: Options) {
	const {
		model,
		resourceName,
		uniquePropertyNames = [],
		modelNamespace,
	} = opts;
	const getAllByResource = getAllByResourceFactory(model, resourceName);

	beforeEach(function () {
		return (this.resource = opts.resourceProvider());
	});

	['id', ...uniquePropertyNames].forEach((param) =>
		describe(`given a ${resourceName} ${param}`, function () {
			it(`should be rejected if the ${resourceName} id does not exist`, function () {
				if (!param) {
					return this.skip();
				}
				const resourceUniqueKey = param === 'id' ? 999999 : '123456789';
				const promise = model.set(resourceUniqueKey, 'EDITOR', 'vim');
				return expect(promise).to.be.rejectedWith(
					`${_.startCase(resourceName)} not found: ${resourceUniqueKey}`,
				);
			});

			it('should initially have no tags', function () {
				if (!param) {
					return this.skip();
				}
				return getAllByResource(this.resource[param]).then((tags) =>
					expect(tags).to.have.length(0),
				);
			});

			it('...should be able to create a tag', function () {
				if (!param) {
					return this.skip();
				}
				const promise = model.set(
					this.resource[param],
					`EDITOR_BY_${resourceName}_${param}`,
					'vim',
				);
				return expect(promise).to.not.be.rejected;
			});

			it('...should be able to retrieve all tags, including the one created', function () {
				if (!param) {
					return this.skip();
				}
				return getAllByResource(this.resource[param]).then(function (tags) {
					expect(tags).to.have.length(1);
					const tag = tags[0];
					expect(tag).to.be.an('object');
					expect(tag.tag_key).to.equal(`EDITOR_BY_${resourceName}_${param}`);
					expect(tag.value).to.equal('vim');
				});
			});

			it('...should be able to update a tag', function () {
				if (!param) {
					return this.skip();
				}
				return model
					.set(
						this.resource[param],
						`EDITOR_BY_${resourceName}_${param}`,
						'nano',
					)
					.then(() => {
						return getAllByResource(this.resource[param]);
					})
					.then(function (tags) {
						expect(tags).to.have.length(1);
						const tag = tags[0];
						expect(tag).to.be.an('object');
						expect(tag.tag_key).to.equal(`EDITOR_BY_${resourceName}_${param}`);
						expect(tag.value).to.equal('nano');
					});
			});

			it('...should be able to remove a tag', function () {
				if (!param) {
					return this.skip();
				}
				return model
					.remove(this.resource[param], `EDITOR_BY_${resourceName}_${param}`)
					.then(() => {
						return getAllByResource(this.resource.id);
					})
					.then((tags) => expect(tags).to.have.length(0));
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

		it('should be able to create a numeric tag', function () {
			return model
				.set(this.resource.id, 'EDITOR_NUMERIC', 1 as any)
				.then(() => {
					return getAllByResource(this.resource.id);
				})
				.then((tags) => {
					expect(tags).to.have.length(1);
					expect(tags[0].tag_key).to.equal('EDITOR_NUMERIC');
					expect(tags[0].value).to.equal('1');
					return model.remove(this.resource.id, 'EDITOR_NUMERIC');
				});
		});
	});

	describe('given two existing tags', function () {
		before(function () {
			return Bluebird.all([
				model.set(this.resource.id, 'EDITOR', 'vim'),
				model.set(this.resource.id, 'LANGUAGE', 'js'),
			]);
		});

		after(function () {
			return Bluebird.all([
				model.remove(this.resource.id, 'EDITOR'),
				model.remove(this.resource.id, 'LANGUAGE'),
			]);
		});

		describe(`${modelNamespace}.getAll()`, function () {
			it('should retrieve all the tags', function () {
				return model.getAll().then((tags) => {
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
			});

			it('should retrieve the filtered tag', function () {
				return model.getAll({ $filter: { tag_key: 'EDITOR' } }).then((tags) => {
					expect(tags.length).to.be.gte(1);
					// exclude tags that the user can access b/c of public apps
					const tagsOfUsersResource = tags.filter(
						(t) => t[resourceName].__id === this.resource.id,
					);
					expect(tagsOfUsersResource[0].tag_key).to.equal('EDITOR');
					expect(tagsOfUsersResource[0].value).to.equal('vim');
				});
			});
		});

		describe(`${modelNamespace}.set()`, () =>
			it('should be able to update a tag without affecting the rest', function () {
				return model
					.set(this.resource.id, 'EDITOR', 'emacs')
					.then(() => getAllByResource(this.resource.id))
					.then(function (tags) {
						tags = _.sortBy(tags, 'tag_key');
						expect(tags).to.have.length(2);
						expect(tags[0].tag_key).to.equal('EDITOR');
						expect(tags[0].value).to.equal('emacs');
						expect(tags[1].tag_key).to.equal('LANGUAGE');
						expect(tags[1].value).to.equal('js');
					});
			}));
	});
};
