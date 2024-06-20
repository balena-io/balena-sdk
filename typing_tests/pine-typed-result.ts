/// <reference types="node" />
import type * as BalenaSdk from '..';
import type { AnyObject } from '../typings/utils';
import type * as PineClient from '../typings/pinejs-client-core';

export let aAny: any;
export let aNumber: number;
export let aNumberOrUndefined: number | undefined;
export let aString: string;
export let aStringOrUndefined: string | undefined;

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

// $select

{
	type deviceOptionsNoProps = PineClient.TypedResult<
		BalenaSdk.Device,
		undefined
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsNoProps = PineClient.TypedResult<BalenaSdk.Device, object>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectAsterisk = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: '*';
		}
	>;

	const result: deviceOptionsSelectAsterisk = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;

	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectId = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'id';
		}
	>;

	const result: deviceOptionsSelectId = {} as any;

	aNumber = result.id;

	// @ts-expect-error test case
	aNumber = result.belongs_to__application.__id;
	// @ts-expect-error test case
	aNumber = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectRelease = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'belongs_to__application';
		}
	>;

	const result: deviceOptionsSelectRelease = {} as any;

	aNumber = result.belongs_to__application.__id;

	// @ts-expect-error test case
	aAny = result.is_pinned_on__release;
	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectRelease = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'is_pinned_on__release';
		}
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
	type deviceOptionsSelectArray = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: ['id', 'note', 'device_name', 'uuid', 'belongs_to__application'];
		}
	>;

	const result: deviceOptionsSelectArray = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;

	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsSelectActor = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'actor';
		}
	>;

	const result: deviceOptionsSelectActor = {} as any;

	aNumber = result.actor;

	// @ts-expect-error test case
	aAny = result.device_tag;
}

// $expand w/o $select

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$expand: 'belongs_to__application';
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.belongs_to__application[0].id;
	aNumber = result.id;
	aString = result.device_name;

	// @ts-expect-error test case
	aAny = result.belongs_to__application[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$expand: 'is_pinned_on__release';
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;

	// @ts-expect-error test case
	aAny = result.is_pinned_on__release[0].id;
	// @ts-expect-error test case
	aAny = result.is_pinned_on__release.__id;
	// @ts-expect-error test case
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandActorString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$expand: 'actor';
		}
	>;

	const result: deviceOptionsExpandActorString = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.actor[0].id;
	aString = result.actor[0].created_at;
}

{
	type deviceOptionsExpandReverseNavigationResourceString =
		PineClient.TypedResult<
			BalenaSdk.Device,
			{
				$expand: 'device_tag';
			}
		>;

	const result: deviceOptionsExpandReverseNavigationResourceString = {} as any;

	aNumber = result.device_tag[1].id;
	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.belongs_to__application.__id;
	aNumberOrUndefined = result.is_pinned_on__release?.__id;
}

// $expand w $select

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'belongs_to__application';
			$expand: 'belongs_to__application';
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.belongs_to__application[0].id;
	aString = result.belongs_to__application[0].app_name;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.belongs_to__application[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'is_pinned_on__release';
			$expand: 'is_pinned_on__release';
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandReverseNavigationResourceString =
		PineClient.TypedResult<
			BalenaSdk.Device,
			{
				$select: 'id';
				$expand: 'device_tag';
			}
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
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'belongs_to__application';
			$expand: {
				belongs_to__application: {}; // eslint-disable-line @typescript-eslint/ban-types
			};
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.belongs_to__application[0].id;
	aString = result.belongs_to__application[0].app_name;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.belongs_to__application[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'is_pinned_on__release';
			$expand: {
				is_pinned_on__release: {}; // eslint-disable-line @typescript-eslint/ban-types
			};
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;

	// @ts-expect-error test case
	aNumber = result.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandReverseNavigationResourceString =
		PineClient.TypedResult<
			BalenaSdk.Device,
			{
				$select: 'id';
				$expand: {
					device_tag: {}; // eslint-disable-line @typescript-eslint/ban-types
				};
			}
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
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'id';
			$expand: {
				belongs_to__application: {
					$select: 'app_name';
				};
			};
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	aString = result.belongs_to__application[0].app_name;

	// @ts-expect-error test case
	aNumber = result.belongs_to__application[0].id;
	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.belongs_to__application[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'id';
			$expand: {
				is_pinned_on__release: {
					$select: 'commit';
				};
			};
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;

	// @ts-expect-error test case
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.is_pinned_on__release[1];
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandActorString = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$expand: {
				actor: {
					$select: 'id';
				};
			};
		}
	>;

	const result: deviceOptionsExpandActorString = {} as any;

	aNumber = result.id;
	aString = result.device_name;
	aNumber = result.actor[0].id;
	// @ts-expect-error test case
	aString = result.actor[0].created_at;
}

{
	type deviceOptionsExpandNavigationResourceString = PineClient.TypedResult<
		AnyObject,
		{
			$select: 'id';
			$expand: {
				is_pinned_on__release: {
					$select: 'commit';
				};
			};
		}
	>;

	const result: deviceOptionsExpandNavigationResourceString = {} as any;

	aNumber = result.id;
	// Errors, since it could be an OptionalNavigationResource
	// @ts-expect-error test case
	aStringOrUndefined = result.is_pinned_on__release[0].commit;
	aStringOrUndefined = result.is_pinned_on__release[0]?.commit;
	// @ts-expect-error test case
	aNumberOrUndefined = result.is_pinned_on__release[0]?.id;
	// This also works, since the typings don't know whether this is Navigation or a Reverse Navigation Resounce
	aAny = result.is_pinned_on__release[1].commit;

	// @ts-expect-error test case
	aString = result.device_name;
	// @ts-expect-error test case
	aAny = result.device_tag;
}

{
	type deviceOptionsExpandReverseNavigationResourceString =
		PineClient.TypedResult<
			BalenaSdk.Device,
			{
				$select: 'id';
				$expand: {
					device_tag: {
						$select: 'tag_key';
					};
				};
			}
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
	type deviceOptionsNoProps = PineClient.TypedResult<
		BalenaSdk.Device,
		{ $count: {} } // eslint-disable-line @typescript-eslint/ban-types
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result;
}

{
	type deviceOptionsNoProps = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'id';
			$expand: {
				belongs_to__application: {
					$count: {}; // eslint-disable-line @typescript-eslint/ban-types
				};
			};
		}
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aNumber = result.belongs_to__application;
}

{
	type deviceOptionsNoProps = PineClient.TypedResult<
		BalenaSdk.Device,
		{
			$select: 'id';
			$expand: {
				device_tag: {
					$count: {}; // eslint-disable-line @typescript-eslint/ban-types
				};
			};
		}
	>;

	const result: deviceOptionsNoProps = {} as any;

	aNumber = result.id;
	aNumber = result.device_tag;
}
