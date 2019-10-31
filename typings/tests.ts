import * as BalenaSdk from './balena-sdk';
import * as PineJsClient from './pinejs-client-core';

// test code that should fail

export const appOptionsE1: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$select: ['asdf', 'app_name'],
};

export const appOptionsE2: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		asdf: [],
		owns__device: {
			$select: ['is_on__commit', 'device_name', 'uuid'],
		},
	},
};

export const appOptionsE2b: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			asdf: [],
			$select: ['is_on__commit', 'device_name', 'uuid'],
		},
	},
};

export const appOptionsE3: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$select: ['asdf', 'is_on__commit', 'device_name', 'uuid'],
		},
	},
};

export const appOptionsE4: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$expand: {
				asdf: {
					$select: ['asdf'],
				},
				device_environment_variable: {
					$select: ['name', 'value', 'asdf'],
				},
			},
		},
	},
};

export const appOptionsE5: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$select: ['is_on__commit', 'device_name', 'uuid'],
			$expand: {
				device_environment_variable: {
					$select: ['name', 'value', 'asdf'],
				},
			},
		},
	},
};

export const appOptionsE20: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				asdf: [],
				$select: ['asdf', 'is_on__commit', 'device_name', 'uuid'],
				$expand: {
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

export const appOptionsE21: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['asdf', 'is_on__commit', 'device_name', 'uuid'],
				$expand: {
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

export const appOptionsE22: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['is_on__commit', 'device_name', 'uuid'],
				$expand: {
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

export const appOptionsE23: BalenaSdk.PineOptionsFor<BalenaSdk.Application> = {
	$expand: [
		{
			owns__device: {
				$select: ['is_on__commit', 'device_name', 'uuid'],
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

// invalid filters
export const appOptionsFInvalid1v5: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		user: 5,
		owns__device: 6,
	},
};
export const appOptionsFInvalid1v6: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$filter: {
		app_name: 'test',
		slug: null,
		organization: 5,
		owns__device: 6,
	},
};

export const appOptionsEFInvalid1: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					is_on__commit: 'commit',
					device_name: null,
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
									// this should be failing, but it isn't :(
									// See: https://github.com/microsoft/TypeScript/issues/32000
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

export const appOptionsEFInvalid2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					is_on__commit: 'commit',
					device_name: null,
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
							asdf: 'asdf',
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};
export const appOptionsEFInvalid3: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: [
		{
			owns__device: {
				$filter: {
					is_on__commit: 'commit',
					device_name: null,
					device_environment_variable: {
						$any: {
							$alias: 'dev',
							$expr: {
								dev: {
									name: 'name',
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
							asdf: 'asdf',
						},
					},
				},
			},
		},
		'depends_on__application',
	],
};

// should work

export const appOptionsEValid1: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$select: ['app_name'],
};

export const deviceOptionsEValid2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Device
> = {
	$select: ['is_on__commit', 'device_name', 'uuid'],
};

export const appOptionsEValid2: BalenaSdk.PineOptionsFor<
	BalenaSdk.Application
> = {
	$expand: {
		owns__device: {
			$select: ['is_on__commit', 'device_name', 'uuid'],
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
			$select: ['is_on__commit', 'device_name', 'uuid'],
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
				$select: ['is_on__commit', 'device_name', 'uuid'],
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
					is_on__commit: 'commit',
					device_name: null,
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

/************ playground tests ******/

type LambdaExpressionValue<T> =
	| BalenaSdk.PineFilterFor<T>
	// So that we can support { 1: 1 };
	| 1;

type LambdaExpression<T, Alias extends keyof any> = Record<
	Alias,
	LambdaExpressionValue<T>
>;

type Lambda<T> = {
	$alias: string;
	$expr:
		| LambdaExpression<T>
		| { $and: Array<LambdaExpression<T>> }
		| { $or: Array<LambdaExpression<T>> }
		| { $not: LambdaExpression<T> };
};

interface AliasObj<T extends string> {
	$alias: T;
}

type Expr<T, Alias extends keyof any> = {
	$expr:
		| LambdaExpression<T, Alias>
		| { $and: Array<LambdaExpression<T, Alias>> }
		| { $or: Array<LambdaExpression<T, Alias>> }
		| { $not: LambdaExpression<T, Alias> };
};

type LambdaTest<T> = AliasObj & Expr<T>;
// 	$expr:
// 	| Record<infer U extends string ? U : never, | BalenaSdk.PineFilterFor<T>
// 			// So that we can support { 1: 1 };
// 			| 1>
// 	| { $and: Array<LambdaExpression<T>> }
// 	| { $or: Array<LambdaExpression<T>> }
// 	| { $not: LambdaExpression<T> };
// 	$alias: U,
// };

type GetAlias<T> = T extends { $alias: infer U } ? U & string : never;

const il0: PineJsClient.Lambda<BalenaSdk.DeviceVariable> = {
	$alias: 'dev',
	$expr: {
		dev: {
			name: 'name',
		},
	},
};

const il1: LambdaTest<BalenaSdk.DeviceVariable> = {
	$alias: 'dev',
	$expr: {
		dev2: {
			name: 'name',
			asdf: 'asdf',
		},
	},
};

const il11: PineJsClient.FilterExpressions<BalenaSdk.DeviceVariable> = {
	$any: {
		$alias: 'dev',
		$expr: {
			dev: {
				name: 'name',
				asdf: 'asdf',
			},
		},
	},
};

const il2: Lambda<BalenaSdk.Release> = {
	$alias: 'dev',
	$expr: {
		1: 1,
	},
};

const il3: PineJsClient.LambdaExpression<BalenaSdk.DeviceVariable> = {
	dev: {
		name: 'name',
		asdf: 'asdf',
	},
};

const il4: BalenaSdk.PineFilterFor<BalenaSdk.User> = {
	id: { $ne: 3 },
	application: {
		$any: {
			$alias: 'a',
			$expr: {
				a: {
					asdf: 'asdf',
					user__is_member_of__application: {
						$any: {
							$alias: 'uma',
							$expr: {
								uma: {
									application_membership_role: {
										$any: {
											$alias: 'amr',
											$expr: {
												amr: {
													name: 'developer',
												},
											},
										},
									},
								},
							},
						},
					},
				},
				$not: {
					a: {
						asdf: 'asdf',
						owns__device: {
							$any: {
								$alias: 'd',
								$expr: {
									1: 1,
								},
							},
						},
					},
				},
			},
		},
	},
};

const accessibleDeviceFilter: BalenaSdk.PineFilterFor<BalenaSdk.Device> = {
	belongs_to__application: {
		$any: {
			$alias: 'bta',
			$expr: {
				$or: [
					{
						bta: {
							user: 3,
						},
					},
					{
						bta: {
							user__is_member_of__application: {
								$any: {
									$alias: 'uma',
									$expr: {
										uma: {
											user: 3,
										},
									},
								},
							},
						},
					},
				],
			},
		},
	},
};

const sdsdf: {
	x: { $or: string[] } | { $and: string[] } | { [key: string]: string[] };
} = {
	x: {
		$or: ['a'],
		asd: 3,
	},
};
