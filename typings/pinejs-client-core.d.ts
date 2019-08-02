import { AnyObject, Omit, PropsOfType, StringKeyof } from './utils';

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

type InferAssociatedResourceType<T> = T extends AssociatedResource & any[]
	? T[number]
	: never;

export type SelectableProps<T> = Exclude<
	StringKeyof<T>,
	PropsOfType<T, ReverseNavigationResource>
>;

export type ExpandableProps<T> = PropsOfType<T, AssociatedResource> & string;

// based on https://github.com/balena-io/pinejs-client-js/blob/master/core.d.ts

type RawFilter =
	| string
	| Array<string | Filter<any>>
	| { $string: string; [index: string]: Filter<any> | string };

interface LambdaExpression<T> {
	[alias: string]: Filter<T>;
}

interface Lambda<T> {
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
}

type OrderByValues = 'asc' | 'desc';
type OrderBy = string | string[] | { [index: string]: OrderByValues };

type AssociatedResourceFilter<T> = T extends NonNullable<
	ReverseNavigationResource
>
	? FilterObj<InferAssociatedResourceType<T>>
	: FilterObj<InferAssociatedResourceType<T>> | number | null;

type ResourceObjFilterPropValue<
	T,
	k extends keyof T
> = T[k] extends AssociatedResource
	? AssociatedResourceFilter<T[k]>
	: T[k] | FilterExpressions<T[k]> | null;

type ResourceObjFilter<T> = {
	[k in keyof T]?: ResourceObjFilterPropValue<T, k>;
};

type Filter<T> = FilterObj<T>;
type FilterObj<T> = ResourceObjFilter<T> | FilterExpressions<T>;
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

interface FilterExpressions<T> {
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
}

export type ResourceExpandFor<T> = {
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

export interface UpsertPineParamsFor<T>
	extends Omit<PineParamsFor<T>, 'id' | 'method' | 'options'> {
	id: SubmitBody<T>;
	resource: string;
	body: SubmitBody<T>;
}
