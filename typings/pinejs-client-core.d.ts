import { AnyObject, PropsOfType, StringKeyof } from './utils';

export interface WithId {
	id: number;
}

export interface PineDeferred {
	__id: number;
}

/**
 * When not selected-out holds a deferred.
 * When expanded hold an array with a single element.
 */
export type NavigationResource<T = WithId> = T[] | PineDeferred;

/**
 * When expanded holds an array, otherwise the property is not present.
 * Selecting is not suggested,
 * in that case it holds a deferred to the original resource.
 */
export type ReverseNavigationResource<T = WithId> = T[] | undefined;

export type AssociatedResource<T = WithId> =
	| NavigationResource<T>
	| ReverseNavigationResource<T>;

type InferAssociatedResourceType<T> = T extends (AssociatedResource & any[])
	? T[number]
	: never;

export type SelectableProps<T> = Exclude<
	StringKeyof<T>,
	PropsOfType<T, ReverseNavigationResource>
>;

export type ExpandableProps<T> = PropsOfType<T, AssociatedResource>;

// based on https://github.com/balena-io/pinejs-client-js/blob/master/core.d.ts

type RawFilter =
	| string
	| Array<string | Filter<any>>
	| { $string: string; [index: string]: Filter<any> | string };

type LambdaExpression<T> = {
	[alias: string]: Filter<T>;
};

type Lambda<T> = {
	$alias: string;
	$expr:
		| LambdaExpression<T>
		// It seems that TS atm mixes things up after adding the following UNION rules
		// and allows having secondary filter props inside the $expr:LambdaExpression<T>
		// that are not props of the T
		// See: https://github.com/balena-io/balena-sdk/issues/714
		| { 1: 1 }
		| { $and: Array<LambdaExpression<T>> }
		| { $or: Array<LambdaExpression<T>> }
		| { $not: LambdaExpression<T> };
};

type OrderByValues = 'asc' | 'desc';
type OrderBy = string | string[] | { [index: string]: OrderByValues };

type AssociatedResourceFilter<T> = T extends NonNullable<
	ReverseNavigationResource
>
	? FilterObj<InferAssociatedResourceType<T>>
	: (FilterObj<InferAssociatedResourceType<T>> | number | null);

type ResourceObjFilterPropValue<
	T,
	k extends keyof T
> = T[k] extends AssociatedResource
	? AssociatedResourceFilter<T[k]>
	: (T[k] | FilterExpressions<T[k]> | null);

type ResourceObjFilter<T> = {
	[k in keyof T]?: ResourceObjFilterPropValue<T, k>;
};

type Filter<T> = FilterObj<T>;
type FilterObj<T> = ResourceObjFilter<T> & FilterExpressions<T>;
type FilterBaseType = string | number | null | boolean | Date;
type NestedFilter<T> = FilterObj<T> | FilterArray<T> | FilterBaseType;

interface FilterArray<T> extends Array<NestedFilter<T>> {}

type FilterOperationValue<T> =
	| NestedFilter<T>
	| FilterFunctionExpressions<NestedFilter<T>>;
type FilterFunctionValue<T> = NestedFilter<T>;

type FilterFunctionExpressions<T> = Pick<
	FilterExpressions<T>,
	FilterFunctionKey
>;

type FilterOperationKey =
	| '$ne'
	| '$eq'
	| '$gt'
	| '$ge'
	| '$lt'
	| '$le'
	| '$add'
	| '$sub'
	| '$mul'
	| '$div'
	| '$mod';

type FilterFunctionKey =
	| '$contains'
	| '$endswith'
	| '$startswith'
	| '$length'
	| '$indexof'
	| '$substring'
	| '$tolower'
	| '$toupper'
	| '$trim'
	| '$concat'
	| '$year'
	| '$month'
	| '$day'
	| '$hour'
	| '$minute'
	| '$second'
	| '$fractionalseconds'
	| '$date'
	| '$time'
	| '$totaloffsetminutes'
	| '$now'
	| '$maxdatetime'
	| '$mindatetime'
	| '$totalseconds'
	| '$round'
	| '$floor'
	| '$ceiling'
	| '$isof'
	| '$cast';

type FilterExpressions<T> = {
	$raw?: RawFilter;

	$?: string | string[];

	$and?: NestedFilter<T>;
	$or?: NestedFilter<T>;

	$in?: NestedFilter<T>;

	$not?: NestedFilter<T>;

	$any?: Lambda<T>;
	$all?: Lambda<T>;

	// Filter operations
	$ne?: FilterOperationValue<T>;
	$eq?: FilterOperationValue<T>;
	$gt?: FilterOperationValue<T>;
	$ge?: FilterOperationValue<T>;
	$lt?: FilterOperationValue<T>;
	$le?: FilterOperationValue<T>;
	$add?: FilterOperationValue<T>;
	$sub?: FilterOperationValue<T>;
	$mul?: FilterOperationValue<T>;
	$div?: FilterOperationValue<T>;
	$mod?: FilterOperationValue<T>;

	// Filter functions
	$contains?: FilterFunctionValue<T>;
	$endswith?: FilterFunctionValue<T>;
	$startswith?: FilterFunctionValue<T>;
	$length?: FilterFunctionValue<T>;
	$indexof?: FilterFunctionValue<T>;
	$substring?: FilterFunctionValue<T>;
	$tolower?: FilterFunctionValue<T>;
	$toupper?: FilterFunctionValue<T>;
	$trim?: FilterFunctionValue<T>;
	$concat?: FilterFunctionValue<T>;
	$year?: FilterFunctionValue<T>;
	$month?: FilterFunctionValue<T>;
	$day?: FilterFunctionValue<T>;
	$hour?: FilterFunctionValue<T>;
	$minute?: FilterFunctionValue<T>;
	$second?: FilterFunctionValue<T>;
	$fractionalseconds?: FilterFunctionValue<T>;
	$date?: FilterFunctionValue<T>;
	$time?: FilterFunctionValue<T>;
	$totaloffsetminutes?: FilterFunctionValue<T>;
	$now?: FilterFunctionValue<T>;
	$maxdatetime?: FilterFunctionValue<T>;
	$mindatetime?: FilterFunctionValue<T>;
	$totalseconds?: FilterFunctionValue<T>;
	$round?: FilterFunctionValue<T>;
	$floor?: FilterFunctionValue<T>;
	$ceiling?: FilterFunctionValue<T>;
	$isof?: FilterFunctionValue<T>;
	$cast?: FilterFunctionValue<T>;
};

type ResourceExpandFor<T> = {
	[k in ExpandableProps<T>]?: PineOptionsFor<InferAssociatedResourceType<T[k]>>;
};

type BaseExpandFor<T> = ResourceExpandFor<T> | ExpandableProps<T>;

export type Expand<T> = BaseExpandFor<T> | Array<BaseExpandFor<T>>;

export type ODataMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ODataOptionsBase {
	$orderby?: OrderBy;
	$top?: number;
	$skip?: number;
	$select?: string | string[] | '*';
}

export interface PineOptions extends ODataOptionsBase {
	$filter?: object;
	$expand?: object | string;
}

export interface PineOptionsFor<T> extends ODataOptionsBase {
	$select?: Array<SelectableProps<T>> | SelectableProps<T> | '*';
	$filter?: Filter<T>;
	$expand?: Expand<T>;
}

interface PineParamsBase {
	apiPrefix?: string;
	method?: ODataMethod;
	resource?: string;
	id?: number;
	url?: string;
	passthrough?: AnyObject;
	passthroughByMethod?: { [method in ODataMethod]: AnyObject };
	customOptions?: AnyObject;
}

export interface PineParams extends PineParamsBase {
	body?: AnyObject;
	options?: PineOptions;
}

export type SubmitBody<T> = {
	[k in keyof T]?: T[k] extends AssociatedResource ? number | null : T[k];
};

export interface PineParamsFor<T> extends PineParamsBase {
	body?: SubmitBody<T>;
	options?: PineOptionsFor<T>;
}

export interface PineParamsWithIdFor<T> extends PineParamsFor<T> {
	id: number;
}

// interface Application {
// 	app_name: string;
// 	device_type: string;
// 	git_repository: string;
// 	commit: string;
// 	id: number;
// 	device_type_info?: any;
// 	has_dependent?: boolean;
// 	is_accessible_by_support_until__date: string;
// 	should_track_latest_release: boolean;

// 	depends_on__application: NavigationResource<Application>;

// 	owns__device: ReverseNavigationResource<Device>;
// 	is_depended_on_by__application: ReverseNavigationResource<Application>;
// }

// interface Device {
// 	is_on__commit: string;
// 	created_at: string;
// 	device_type: string;
// 	id: number;
// 	name: string;
// 	os_version: string;
// 	os_variant?: string;
// 	status_sort_index?: number;
// 	uuid: string;
// 	ip_address: string | null;
// 	vpn_address: string | null;
// 	last_connectivity_event: string;
// 	is_in_local_mode?: boolean;
// 	app_name?: string;
// 	state?: { key: string; name: string };
// 	status: string;
// 	provisioning_state: string;
// 	is_online: boolean;
// 	is_connected_to_vpn: boolean;
// 	is_locked_until__date: string;
// 	supervisor_version: string;
// 	should_be_managed_by__supervisor_release: number;
// 	is_web_accessible: boolean;
// 	has_dependent: boolean;
// 	note: string;
// 	location: string;
// 	latitude?: string;
// 	longitude?: string;
// 	custom_latitude?: string;
// 	custom_longitude?: string;
// 	is_accessible_by_support_until__date: string;
// 	download_progress?: number;
// 	provisioning_progress?: number;
// 	local_id?: string;

// 	belongs_to__application: NavigationResource<Application>;
// 	is_managed_by__device: NavigationResource<Device>;

// 	device_environment_variable: ReverseNavigationResource<
// 		DeviceEnvironmentVariable
// 	>;
// 	manages__device: ReverseNavigationResource<Device>;
// }

// interface EnvironmentVariableBase {
// 	id: number;
// 	name: string;
// 	value: string;
// }

// interface EnvironmentVariable extends EnvironmentVariableBase {
// 	application: NavigationResource<Application>;
// }

// interface DeviceEnvironmentVariable extends EnvironmentVariableBase {
// 	env_var_name: string;
// 	value: string;

// 	device: NavigationResource<Device>;
// }

// type exp1 = BaseExpandFor<Application>;
// type filt1 = ResourceObjFilterPropValue<Application, 'app_name'>;
// type filt2 = ResourceObjFilterPropValue<Application, 'owns__device'>;
// type l1 = Lambda<Application>;
