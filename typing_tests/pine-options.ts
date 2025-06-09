/// <reference types="node" />
import type * as BalenaSdk from '..';
import type { AnyObject } from '../typings/utils';
import type { Equals } from './utils';
import { EqualsTrue } from './utils';

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

export const unkown$selectProps: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	// @ts-expect-error test case
	$select: ['asdf', 'id', 'app_name', 'id'],
};

export const unkown$selectPropsFixed: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$select: ['id', 'app_name'],
};

export const unkown$selectPropsInside$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	// @ts-expect-error test case
	$expand: {
		owns__device: {
			$select: ['asdf', 'note', 'device_name', 'uuid'],
		},
	},
};

export const unkown$expandProps: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$expand: {
		// @ts-expect-error test case
		asdf: {},
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const unkownODataPropInside$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$expand: {
		owns__device: {
			// // @ts-expect-error test case - new pine client is not able to detect invalid double expand
			asdf: {},
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const unkown$expandPropsFixed: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const unkown$selectPropInsideNested$expandWith$select: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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

export const unkown$selectPropInsideNested$expandWith$select2: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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

export const unkown$selectPropInsideNested$expandWith$select2Fixed: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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

export const unkown$expandPropInArray$expands: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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

		'organization',
		// @ts-expect-error test case
		'asdf',
	],
};

export const unkownODataPropInArray$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$expand: [
		{
			owns__device: {
				// TODO: this should error
				asdf: {},
				$select: ['note', 'device_name', 'uuid'],
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
		'organization',
	],
};

export const unkown$selectPropInArray$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

export const unkownNested$expandPropInsideArray$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

export const unkownNested$expandWith$selectPropInsideArray$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

export const unkown$selectPropInsideNestedArray$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

export const nestedArray$expandWithManyErrors1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

export const nestedArray$expandWithManyErrors2: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

export const Nested$expandInArray$expandsFixed: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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
		'organization',
	],
};

// invalid filters
export const invalid$filterPropType: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$filter: {
		// TODO: this should error
		id: 'asdf',
	},
};

export const invalid$filterPropType2: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$filter: {
		// TODO: this should error
		app_name: 5,
	},
};

export const invalid$filterOfReverseNavigationProp: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		application_type: 5,
		// TODO: The typings should prevent filtering RevenrseNavigationResources w/o $any
		// skip-ts-expect-error
		owns__device: 6,
	},
};

export const unkownPropIn$filter: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$filter: {
		id: 1,
		app_name: 'test',
		slug: null,
		application_type: 5,
		// @ts-expect-error test case
		asdf: 'asdf',
	},
};

export const unkownPropIn$filterFixed: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$filter: {
		id: 1,
		app_name: 'test',
		slug: null,
		application_type: 5,
	},
};

export const unknown$any$filterPropInsideArray$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
									// TODO: this should error
									asdf: 'asdf',
								},
							},
						},
					},
				},
			},
		},
		'organization',
	],
};

export const unknown$any$filterPropInsideArray$expandPlural: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
									// TODO: this should error
									asdf: 'asdf',
								},
							},
						},
					},
				},
			},
		},
		'organization',
	],
};

export const unknown$any$filterPropInsideArray$expandFixed: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
		'organization',
	],
};

export const unknown$filterPropInsideNested$expand: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
							// @ts-expect-error test case
							asdf: 'asdf',
						},
					},
				},
			},
		},
		'organization',
	],
};

// this check that even though the unknown$any$filterPropInsideArray$expandPlural case doesn't work
// it will at least not silence other errors
export const unknown$filterPropInsideNested$expandWithUnknown$any$filterProp: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
									// TODO: this should error
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
		'organization',
	],
};

export const string$OrderbyWoDirection: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	// TODO: this should error
	$orderby: 'id',
};

export const string$OrderbyWoPropPrefix: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	// @ts-expect-error test case
	$orderby: 'asc',
};

export const string$OrderbyInvalidDirection: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	// @ts-expect-error test case
	$orderby: 'id ascending',
};

export const string$OrderbyInvalidDirectionCase: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	// @ts-expect-error test case
	$orderby: 'id Asc',
};

export const string$OrderbyInvalidNestedPropertyPath: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Organization['Read']
> = {
	// @ts-expect-error test case
	$orderby: 'application_type/wrong_property asc',
};

// valid $select

export const appOptionsEValid1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$select: ['app_name'],
};

export const deviceOptionsEValid2: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Device['Read']
> = {
	$select: ['note', 'device_name', 'uuid'],
};

// valid $expand

export const appOptionsEValid2: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$expand: {
		owns__device: {
			$select: ['note', 'device_name', 'uuid'],
		},
	},
};

export const appOptionsEValid4: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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

export const appOptionsEValid5: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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

export const appOptionsEValid20: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
	],
};

// valid OptionalNavigationResource $selects & $expands

type ReleaseExpandablePropsExpectation =
	| 'belongs_to__application'
	| 'is_created_by__user'
	| 'release__has__tag_key'
	| 'release_tag'
	| 'image__is_part_of__release'
	| 'release_image'
	| 'contains__image'
	| 'should_be_running_on__application'
	| 'should_be_running_on__device'
	| 'is_running_on__device'
	| 'is_pinned_to__device'
	| 'should_operate__device'
	| 'should_manage__device'
	| 'provides__device__installs__image'
	| 'provides__image_install';

// @ts-expect-error test case
export const releaseExpandablePropsFailingTest1: Equals<
	BalenaSdk.Pine.ExpandableStringKeyOf<BalenaSdk.Release['Read']>,
	Exclude<ReleaseExpandablePropsExpectation, 'release_tag'>
> = EqualsTrue;
// @ts-expect-error test case

export const releaseExpandablePropsFailingTest2: Equals<
	BalenaSdk.Pine.ExpandableStringKeyOf<BalenaSdk.Release['Read']>,
	ReleaseExpandablePropsExpectation | 'id'
> = EqualsTrue;

export const releaseExpandablePropsTest: Equals<
	BalenaSdk.Pine.ExpandableStringKeyOf<BalenaSdk.Release['Read']>,
	ReleaseExpandablePropsExpectation
> = EqualsTrue;

type UserExpandablePropsExpectation =
	| 'actor'
	| 'has_legacy_link_to__organization'
	| 'user__has__public_key'
	| 'user_public_key'
	| 'user__is_member_of__organization'
	| 'organization_membership'
	| 'user__is_member_of__team'
	| 'team_membership'
	| 'user__is_member_of__application'
	| 'user_application_membership'
	| 'is_member_of__organization'
	| 'is_member_of__team'
	| 'is_member_of__application'
	| 'is_of__user__is_member_of__organization'
	| 'is_of__organization_membership'
	| 'is_of__user__is_member_of__application'
	| 'is_of__user_application_membership'
	| 'includes__user__is_member_of__organization'
	| 'includes__organization_membership'
	| 'includes__user__is_member_of__application'
	| 'includes__user_application_membership'
	| 'creates__invitee__is_invited_to__application'
	| 'creates__application_invite'
	| 'creates__invitee__is_invited_to__organization'
	| 'creates__organization_invite'
	| 'creates__release'
	| 'owns__social_service_account'
	| 'owns__device'
	| 'owns__recovery_two_factor'
	| 'owns__saml_account'
	| 'has_direct_access_to__application'
	| 'user_profile';

export const userExpandablePropsTest: Equals<
	BalenaSdk.Pine.ExpandableStringKeyOf<BalenaSdk.User['Read']>,
	UserExpandablePropsExpectation
> = EqualsTrue;

export const appOptionsEValid30: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
		'organization',
	],
};

export const appOptionsEValid31: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
		'organization',
	],
};

// valid $filter

export const appOptionsEValidf1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		application_type: 5,
	},
};

export const appOptionsEValidf2: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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

export const appOptionsFNullIdValid1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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

export const imageOptions$orValid1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Image['Read']
> = {
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

export const imageOptionsConditional$orValid1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Image['Read']
> = {
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

export const appOptionsEFValid1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
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
		'organization',
	],
};

export const appOptionsExpandResourceWoNumericIdEFValid1: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
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

export const anyObjectOptionsValid1: BalenaSdk.Pine.ODataOptions<AnyObject> = {
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

// unsafe $orderby

export const string$OrderbyAsc: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$orderby: { id: 'asc' },
};

export const string$OrderbyDesc: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Application['Read']
> = {
	$orderby: { id: 'asc' },
};

export const string$OrderbyNestedProp: BalenaSdk.Pine.ODataOptions<
	BalenaSdk.Organization['Read']
> = {
	// @ts-expect-error - prefer object notation for orderby
	$orderby: 'application_type/slug asc',
};
