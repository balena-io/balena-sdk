/// <reference types="node" />
import * as BalenaSdk from '../typings/balena-sdk';
import { InferAssociatedResourceType } from '../typings/pinejs-client-core';

// This file is in .prettierignore, since otherwise
// the $ExpectError commentswould move to the wrong place

export const unkown$selectProps: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$select: ['asdf', 'id', 'app_name', 'id'], // $ExpectError
};

export const unkown$selectPropsFixed: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$select: ['id', 'app_name'],
};

export const unkown$selectPropsInside$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: { // $ExpectError
		owns__device: {
			$select: ['asdf', 'note', 'device_name', 'uuid'],
		},
	},
};

export const unkown$expandProps: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		asdf: {}, // $ExpectError
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const unkownODataPropInside$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			asdf: {}, // $ExpectError
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const unkown$expandPropsFixed: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const unkown$selectPropInsideNested$expandWith$select: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$expand: {
				asdf: { // $ExpectError
					$select: ['asdf'],
				},
				device_environment_variable: {
					$select: ['name', 'value'],
				},
			},
		},
	},
};

export const unkown$selectPropInsideNested$expandWith$select2: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: { // $ExpectError
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
			$expand: {
				device_environment_variable: {
					$select: ['name', 'value', 'asdf'],
				},
			},
		},
	},
};

export const unkown$selectPropInsideNested$expandWith$select2Fixed: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
			$expand: {
				device_environment_variable: {
					$select: ['name', 'value'],
				},
			},
		},
	},
};

export const unkown$expandPropInArray$expands: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
		'asdf', // $ExpectError
	],
};

export const unkownODataPropInArray$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				asdf: {}, // $ExpectError
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unkown$selectPropInArray$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['asdf', 'note', 'device_name', 'uuid'], // $ExpectError
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unkownNested$expandPropInsideArray$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					asdf: {}, // $ExpectError
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unkownNested$expandWith$selectPropInsideArray$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					asdf: { // $ExpectError
						$select: ['id'],
					},
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unkown$selectPropInsideNestedArray$expand: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: { // $ExpectError
					device_environment_variable: {
						$select: ['name', 'value', 'asdf'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const nestedArray$expandWithManyErrors1: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['asdf', 'note', 'device_name', 'uuid'], // $ExpectError
				$expand: {
					asdf: { // $ExpectError
						$select: ['asdf'],
					},
					device_environment_variable: {
						$select: ['name', 'value', 'asdf'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const nestedArray$expandWithManyErrors2: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					asdf: { // $ExpectError
						$select: ['asdf'],
					},
					device_environment_variable: {
						$select: ['name', 'value', 'asdf'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const Nested$expandInArray$expandsFixed: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					device_config_variable: {
						$select: ['name', 'value'],
					},
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
			application_tag: {
				$select: 'id',
			},
		},
		'depends_on__application',
	],
};


// invalid filters
export const invalid$filterPropType: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		id: 'asdf', // $ExpectError
	},
};

export const invalid$filterPropType2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		app_name: 5, // $ExpectError
	},
};

export const invalid$filterOfReverseNavigationProp: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		application_type: 5,
		owns__device: 6, // $ExpectError-Skip
	},
};

export const unkownPropIn$filter: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		id: 1,
		app_name: 'test',
		slug: null,
		application_type: 5,
		asdf: 'asdf', // $ExpectError
	},
};

export const unkownPropIn$filterFixed: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		id: 1,
		app_name: 'test',
		slug: null,
		application_type: 5,
	},
};

export const unknown$any$filterPropInsideArray$expand: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					device_name: null,
					note: 'note',
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									asdf: 'asdf', // $ExpectError
								},
							},
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unknown$any$filterPropInsideArray$expandPlural: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					device_name: null,
					note: 'note',
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
									asdf: 'asdf', // $ExpectError
								},
							},
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unknown$any$filterPropInsideArray$expandFixed: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					device_name: null,
					note: 'note',
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
								},
							},
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const unknown$filterPropInsideNested$expand: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					device_name: null,
					note: 'note',
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
								},
							},
						},
					},
				},
				$expand: {
					device_environment_variable: {
						$filter: {
							name: 'name',
							value: null,
							asdf: 'asdf', // $ExpectError
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};

// this check that even though the unknown$any$filterPropInsideArray$expandPlural case doesn't work
// it will at least not silence other errors
export const unknown$filterPropInsideNested$expandWithUnknown$any$filterProp: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					device_name: null,
					note: 'note',
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
									asdf: 'asdf', // $ExpectError
								},
							},
						},
					},
				},
				$expand: {
					device_environment_variable: {
						$filter: {
							name: 'name',
							value: null,
							asdf: 'asdf', // $ExpectError
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};

// valid selects

export const appOptionsEValid1: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$select: ['app_name'],
};

export const deviceOptionsEValid2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Device
> = {
	$select: ['note', 'device_name', 'uuid'],
};

// valid expands

export const appOptionsEValid2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const appOptionsEValid4: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: {
		owns__device: {
			$expand: {
				device_environment_variable: {
					$select: ['name', 'value'],
				},
			},
		},
	},
};

export const appOptionsEValid5: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
			$expand: {
				device_environment_variable: {
					$select: ['name', 'value'],
				},
			},
		},
	},
};

export const appOptionsEValid20: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

// valid OptionalNavigationResource $selects & $expands

// $ExpectType "is_created_by__user" | "belongs_to__application" | "contains__image" | "should_be_running_on__application" | "is_running_on__device" | "should_be_running_on__device" | "release_tag"
export type ReleaseExpandableProps = BalenaSdk.PineExpandableProps<BalenaSdk.Release>;
// $ExpectType Release
export type DeviceIsRunningReleaseAssociatedResourceType = InferAssociatedResourceType<BalenaSdk.Device['is_running__release']>;

export const appOptionsEValid30: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid', 'is_running__release'],
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};

export const appOptionsEValid31: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					is_running__release: {
						$select: ['id', 'commit'],
					},
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'depends_on__application',
	],
};


// valid filters

export const appOptionsEValidf1: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		application_type: 5,
	},
};

export const appOptionsEValidf2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		application_type: {
			$any: {
				$alias: 'o',
				$expr: {
					o: {
						name: 'test',
					},
				},
			},
		},
		owns__device: {
			$any: {
				$alias: 'd',
				$expr: {
					d: {
						device_name: 'test',
					},
				},
			},
		},
		owns__release: {
			$any: {
				$alias: 'r',
				$expr: {
					1: 1,
				},
			},
		},
		$not: {
			owns__release: {
				$any: {
					$alias: 'r',
					$expr: {
						r: { commit: 'commit' },
					},
				},
			},
		},
	},
};

export const appOptionsEFValid1: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					device_name: null,
					note: 'note',
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
								},
							},
						},
					},
				},
				$expand: {
					device_environment_variable: {
						$filter: {
							name: 'name',
							value: null,
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};
