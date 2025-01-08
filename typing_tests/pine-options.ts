/// <reference types="node" />
import type * as BalenaSdk from '..';
import type * as PineClient from '../typings/pinejs-client-core';
import type { AnyObject } from '../typings/utils';
import type { Equals } from './utils';
import { EqualsTrue } from './utils';

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

export const unkown$selectProps: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$select: ['asdf', 'id', 'app_name', 'id'],
	};

export const unkown$selectPropsFixed: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$select: ['id', 'app_name'],
	};

export const unkown$selectPropsInside$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$expand: {
			owns__device: {
				$select: ['asdf', 'note', 'device_name', 'uuid'],
			},
		},
	};

export const unkown$expandProps: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: {
			// @ts-expect-error test case
			asdf: {},
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
			},
		},
	};

export const unkownODataPropInside$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: {
			owns__device: {
				// @ts-expect-error test case
				asdf: {},
				$select: ['note', 'device_name', 'uuid'],
			},
		},
	};

export const unkown$expandPropsFixed: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: {
			owns__device: {
				$select: ['note', 'device_name', 'uuid'],
			},
		},
	};

export const unkown$selectPropInsideNested$expandWith$select: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: {
			owns__device: {
				$expand: {
					// @ts-expect-error test case
					asdf: {
						$select: ['asdf'],
					},
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
	};

export const unkown$selectPropInsideNested$expandWith$select2: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$expand: {
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

export const unkown$selectPropInsideNested$expandWith$select2Fixed: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

export const unkown$expandPropInArray$expands: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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
			// @ts-expect-error test case
			'asdf',
		],
	};

export const unkownODataPropInArray$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					// @ts-expect-error test case
					asdf: {},
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

export const unkown$selectPropInArray$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					// @ts-expect-error test case
					$select: ['asdf', 'note', 'device_name', 'uuid'],
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

export const unkownNested$expandPropInsideArray$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					$select: ['note', 'device_name', 'uuid'],
					$expand: {
						// @ts-expect-error test case
						asdf: {},
						device_environment_variable: {
							$select: ['name', 'value'],
						},
					},
				},
			},
			'depends_on__application',
		],
	};

export const unkownNested$expandWith$selectPropInsideArray$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					$select: ['note', 'device_name', 'uuid'],
					$expand: {
						// @ts-expect-error test case
						asdf: {
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

export const unkown$selectPropInsideNestedArray$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					$select: ['note', 'device_name', 'uuid'],
					// @ts-expect-error test case
					$expand: {
						device_environment_variable: {
							$select: ['name', 'value', 'asdf'],
						},
					},
				},
			},
			'depends_on__application',
		],
	};

export const nestedArray$expandWithManyErrors1: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					// @ts-expect-error test case
					$select: ['asdf', 'note', 'device_name', 'uuid'],
					$expand: {
						// @ts-expect-error test case
						asdf: {
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

export const nestedArray$expandWithManyErrors2: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__device: {
					$select: ['note', 'device_name', 'uuid'],
					$expand: {
						// @ts-expect-error test case
						asdf: {
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

export const Nested$expandInArray$expandsFixed: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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
export const invalid$filterPropType: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			// @ts-expect-error test case
			id: 'asdf',
		},
	};

export const invalid$filterPropType2: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			// @ts-expect-error test case
			app_name: 5,
		},
	};

export const invalid$filterOfReverseNavigationProp: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			app_name: 'test',
			slug: null,
			application_type: 5,
			// TODO: The typings should prevent filtering RevenrseNavigationResources w/o $any
			// skip-ts-expect-error
			owns__device: 6,
		},
	};

export const unkownPropIn$filter: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			id: 1,
			app_name: 'test',
			slug: null,
			application_type: 5,
			// @ts-expect-error test case
			asdf: 'asdf',
		},
	};

export const unkownPropIn$filterFixed: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			id: 1,
			app_name: 'test',
			slug: null,
			application_type: 5,
		},
	};

export const unknown$any$filterPropInsideArray$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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
										// @ts-expect-error test case
										asdf: 'asdf',
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

export const unknown$any$filterPropInsideArray$expandPlural: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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
										// @ts-expect-error test case
										asdf: 'asdf',
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

export const unknown$any$filterPropInsideArray$expandFixed: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

export const unknown$filterPropInsideNested$expand: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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
								// @ts-expect-error test case
								asdf: 'asdf',
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
export const unknown$filterPropInsideNested$expandWithUnknown$any$filterProp: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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
										// @ts-expect-error test case
										asdf: 'asdf',
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
								// @ts-expect-error test case
								asdf: 'asdf',
							},
						},
					},
				},
			},
			'depends_on__application',
		],
	};

export const string$OrderbyWoDirection: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$orderby: 'id',
	};

export const string$OrderbyWoPropPrefix: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$orderby: 'asc',
	};

export const string$OrderbyInvalidDirection: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$orderby: 'id ascending',
	};

export const string$OrderbyInvalidDirectionCase: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		// @ts-expect-error test case
		$orderby: 'id Asc',
	};

export const string$OrderbyInvalidNestedPropertyPath: BalenaSdk.PineOptions<BalenaSdk.Organization> =
	{
		// TODO: This should error
		$orderby: 'application_type/wrong_property asc',
	};

// valid $select

export const appOptionsEValid1: BalenaSdk.PineOptions<BalenaSdk.Application> = {
	$select: ['app_name'],
};

export const deviceOptionsEValid2: BalenaSdk.PineOptions<BalenaSdk.Device> = {
	$select: ['note', 'device_name', 'uuid'],
};

// valid $expand

export const appOptionsEValid2: BalenaSdk.PineOptions<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const appOptionsEValid4: BalenaSdk.PineOptions<BalenaSdk.Application> = {
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

export const appOptionsEValid5: BalenaSdk.PineOptions<BalenaSdk.Application> = {
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

export const appOptionsEValid20: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

type ReleaseExpandablePropsExpectation =
	| 'is_created_by__user'
	| 'belongs_to__application'
	| 'contains__image'
	| 'release_image'
	| 'should_be_running_on__application'
	| 'should_operate__device'
	| 'should_manage__device'
	| 'is_running_on__device'
	| 'is_pinned_to__device'
	| 'release_tag';
// @ts-expect-error test case

export const releaseExpandablePropsFailingTest1: Equals<
	BalenaSdk.PineExpandableProps<BalenaSdk.Release>,
	Exclude<ReleaseExpandablePropsExpectation, 'release_tag'>
> = EqualsTrue;
// @ts-expect-error test case

export const releaseExpandablePropsFailingTest2: Equals<
	BalenaSdk.PineExpandableProps<BalenaSdk.Release>,
	ReleaseExpandablePropsExpectation | 'id'
> = EqualsTrue;

export const releaseExpandablePropsTest: Equals<
	BalenaSdk.PineExpandableProps<BalenaSdk.Release>,
	ReleaseExpandablePropsExpectation
> = EqualsTrue;

type UserExpandablePropsExpectation =
	| 'actor'
	| 'organization_membership'
	| 'user_application_membership'
	| 'user_profile'
	| 'team_membership'
	| 'has_direct_access_to__application'
	| 'owns__social_service_account'
	| 'owns__saml_account';

export const userExpandablePropsTest: Equals<
	BalenaSdk.PineExpandableProps<BalenaSdk.User>,
	UserExpandablePropsExpectation
> = EqualsTrue;

export const deviceIsRunningReleaseAssociatedResourceType: Equals<
	PineClient.InferAssociatedResourceType<
		BalenaSdk.Device['is_running__release']
	>,
	BalenaSdk.Release
> = EqualsTrue;

export const appOptionsEValid30: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

export const appOptionsEValid31: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

// valid $filter

export const appOptionsEValidf1: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			app_name: 'test',
			slug: null,
			application_type: 5,
		},
	};

export const appOptionsEValidf2: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

export const appOptionsFNullIdValid1: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$filter: {
			can_use__application_as_host: {
				$any: {
					$alias: 'cuaah',
					$expr: {
						cuaah: {
							application: 5,
						},
					},
				},
			},
		},
	};

export const imageOptions$orValid1: BalenaSdk.PineOptions<BalenaSdk.Image> = {
	$filter: {
		status: 'success',
		release_image: {
			$any: {
				$alias: 'ri',
				$expr: {
					ri: {
						is_part_of__release: {
							$any: {
								$alias: 'ipor',
								$expr: {
									ipor: {
										status: 'success',
										belongs_to__application: {
											$any: {
												$alias: 'bta',
												$expr: {
													bta: {
														slug: 'fleetSlug',
													},
												},
											},
										},
										should_be_running_on__application: {
											$any: {
												$alias: 'sbroa',
												$expr: {
													sbroa: {
														slug: 'fleetSlug',
													},
												},
											},
										},
									},
									$or: [
										{ ipor: { commit: '50ff99284f6a4a36a70f9c4a2b37650f' } },
										{ ipor: { semver: '1.2.3', is_final: true } },
										{
											ipor: { raw_version: '1.2.3-123456789', is_final: false },
										},
									],
								},
							},
						},
					},
				},
			},
		},
		is_a_build_of__service: {
			$any: {
				$alias: 'iabos',
				$expr: {
					iabos: {
						service_name: 'main',
					},
				},
			},
		},
	},
};

export const imageOptionsConditional$orValid1: BalenaSdk.PineOptions<BalenaSdk.Image> =
	{
		$filter: {
			status: 'success',
			release_image: {
				$any: {
					$alias: 'ri',
					$expr: {
						ri: {
							is_part_of__release: {
								$any: {
									$alias: 'ipor',
									$expr: {
										ipor: {
											status: 'success',
											belongs_to__application: {
												$any: {
													$alias: 'bta',
													$expr: {
														bta: {
															slug: 'fleetSlug',
														},
													},
												},
											},
											should_be_running_on__application: {
												$any: {
													$alias: 'sbroa',
													$expr: {
														sbroa: {
															slug: 'fleetSlug',
														},
													},
												},
											},
										},
										...(Math.random() > 0.5 && {
											$or: [
												{
													ipor: { commit: '50ff99284f6a4a36a70f9c4a2b37650f' },
												},
												{ ipor: { semver: '1.2.3', is_final: true } },
												{
													ipor: {
														raw_version: '1.2.3-123456789',
														is_final: false,
													},
												},
											],
										}),
									},
								},
							},
						},
					},
				},
			},
			...(Math.random() > 0.5 && {
				is_a_build_of__service: {
					$any: {
						$alias: 'iabos',
						$expr: {
							iabos: {
								service_name: 'main',
							},
						},
					},
				},
			}),
		},
	};

export const appOptionsEFValid1: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
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

export const appOptionsExpandResourceWoNumericIdEFValid1: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$expand: [
			{
				owns__public_device: {
					$filter: {
						was_recently_online: true,
					},
				},
			},
		],
	};

export const anyObjectOptionsValid1: BalenaSdk.PineOptions<AnyObject> = {
	$select: ['id', 'app_name'],
	$expand: {
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
	$filter: {
		app_name: 'test',
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
	},
};

// valid $orderby

export const string$OrderbyAsc: BalenaSdk.PineOptions<BalenaSdk.Application> = {
	$orderby: 'id asc',
};

export const string$OrderbyDesc: BalenaSdk.PineOptions<BalenaSdk.Application> =
	{
		$orderby: 'id asc',
	};

export const string$OrderbyNestedProp: BalenaSdk.PineOptions<BalenaSdk.Organization> =
	{
		$orderby: 'application_type/slug asc',
	};
