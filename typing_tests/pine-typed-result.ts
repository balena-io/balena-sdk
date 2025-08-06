/* eslint-disable @typescript-eslint/no-empty-object-type */
/// <reference types="node" />
import type * as BalenaSdk from '..';
import type { AnyObject } from '../typings/utils';

export let aAny: any;
export let aNumber: number;
export let aNumberOrUndefined: number | undefined;
export let aString: string;
export let aStringOrUndefined: string | undefined;
export let anArray: any[];
export let anUndefined: undefined;

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

// $select

{
	type deviceOptionsNoProps = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<BalenaSdk.Device['Read'], {}, number>
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.device_tag;
}

{
	type deviceOptionsNoProps = BalenaSdk.Pine.OptionsToResponse<
		BalenaSdk.Device['Read'],
		{},
		undefined
	>;

	const result: deviceOptionsNoProps[number] = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.is_of__device_type.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.device_tag;
}

{
	type deviceOptionsSelectId = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
			},
			number
		>
	>;

	const result: deviceOptionsSelectId = {} as any;

	aNumber = result.id;

	// @ts-expect-error test case
	aNumber = result.is_of__device_type.__id;
	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectRelease = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'is_of__device_type';
			},
			number
		>
	>;

	const result: deviceOptionsSelectRelease = {} as any;

	aNumber = result.is_of__device_type.__id;

	// @ts-expect-error test case
	aAny = result.is_pinned_on__release;
	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectRelease = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'is_pinned_on__release';
			},
			number
		>
	>;

	const result: deviceOptionsSelectRelease = {} as any;

	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectArray = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: [
					'id',
					'note',
					'device_name',
					'uuid',
					'belongs_to__application',
				];
			},
			number
		>
	>;

	const result: deviceOptionsSelectArray = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumberOrUndefined = result.belongs_to__application?.__id;

	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectActor = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'actor';
			},
			number
		>
	>;

	const result: deviceOptionsSelectActor = {} as any;

	aNumber = result.actor.__id;

	// @ts-expect-error test case
	aAny = result.device_tag;
}

// $expand w/o $select

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$expand: ['is_of__device_type'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.is_of__device_type[0].id;
	aNumber = result.id;
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_of__device_type[1];
	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$expand: ['is_pinned_on__release'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	// TODO: This should fail b/c is_pinned_on__release is a nullable navigation resource
	aNumber = result.is_pinned_on__release[0].id;
	// @ts-expect-error test case
	aAny = result.is_pinned_on__release.__id;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_pinned_on__release[1];
	// TODO: Ideally the prop shouldn't be there at all
	anUndefined = result.device_tag;
}

{
	type deviceOptionsExpandActorString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$expand: ['actor'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandActorString = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.actor[0].id;
}

{
	type deviceOptionsExpandReverseNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$expand: ['device_tag'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandReverseNavigationResourceString = {} as any;

	aNumber = result.device_tag[1].id;
	aNumber = result.id;
	aString = result.device_name;
	aNumberOrUndefined = result.belongs_to__application?.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;
}

// $expand w $select

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'is_of__device_type';
				$expand: ['is_of__device_type'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.is_of__device_type[0].id;
	aString = result.is_of__device_type[0].name;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_of__device_type[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'is_pinned_on__release';
				$expand: ['is_pinned_on__release'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandReverseNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: ['device_tag'];
			},
			number
		>
	>;

	const result: deviceOptionsExpandReverseNavigationResourceString = {} as any;

	aNumber = result.device_tag[1].id;
	aString = result.device_tag[1].tag_key;
	aNumber = result.id;

	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
}

// empty $expand object

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'is_of__device_type';
				$expand: {
					is_of__device_type: {};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.is_of__device_type[0].id;
	aString = result.is_of__device_type[0].name;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_of__device_type[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'is_pinned_on__release';
				$expand: {
					is_pinned_on__release: {};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandReverseNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: {
					device_tag: {};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandReverseNavigationResourceString = {} as any;

	aNumber = result.device_tag[1].id;
	aString = result.device_tag[1].tag_key;
	aNumber = result.id;

	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
}

// $expand object w/ nested options

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: {
					is_of__device_type: {
						$select: 'name';
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	aString = result.is_of__device_type[0].name;

	// @ts-expect-error test case
	aNumber = result.is_of__device_type[0].id;
	// @ts-expect-error test case
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_of__device_type[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: {
					is_pinned_on__release: {
						$select: 'commit';
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;

	// @ts-expect-error test case
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandActorString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$expand: {
					actor: {
						$select: 'id';
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandActorString = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.actor[0].id;
	// @ts-expect-error test case
	aString = result.actor[0].created_at;
}

{
	type deviceOptionsExpandNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			AnyObject,
			{
				$select: 'id';
				$expand: {
					is_pinned_on__release: {
						$select: 'commit';
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	// Errors, since it could be an OptionalNavigationResource
	// TODO: This should fail b/c is_pinned_on__release is a nullable navigation resource
	aStringOrUndefined = result.is_pinned_on__release[0].commit;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;
	// @ts-expect-error test case
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	// This also works, since the typings don't know whether this is Navigation or a Reverse Navigation Resounce
	// TODO: TS should complain about resource[1] since the prop should ideally be a single item tuple
	aAny = result.is_pinned_on__release[1].commit;

	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandReverseNavigationResourceString = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: {
					device_tag: {
						$select: 'tag_key';
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsExpandReverseNavigationResourceString = {} as any;

	aNumber = result.id;
	aString = result.device_tag[1].tag_key;

	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aNumber = result.device_tag[1].id;
	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
}

// $count

{
	type deviceOptionsNoProps = BalenaSdk.Pine.OptionsToResponse<
		BalenaSdk.Device['Read'],
		{ $count: {} },
		undefined
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result;
}

{
	type deviceOptionsNoProps = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: {
					belongs_to__application: {
						$count: {};
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aNumber = result.belongs_to__application;
}

{
	type deviceOptionsNoProps = NonNullable<
		BalenaSdk.Pine.OptionsToResponse<
			BalenaSdk.Device['Read'],
			{
				$select: 'id';
				$expand: {
					device_tag: {
						$count: {};
					};
				};
			},
			number
		>
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aNumber = result.device_tag;
}
