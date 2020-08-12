import type { AnyObject, PropsOfType, StringKeyof, Dictionary } from './utils';

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
export type NavigationResource<T = WithId> = [T] | PineDeferred;
export type OptionalNavigationResource<T = WithId> =
	| []
	| [T]
	| PineDeferred
	| null;

/**
 * When expanded holds an array, otherwise the property is not present.
 * Selecting is not suggested,
 * in that case it holds a deferred to the original resource.
 */
export type ReverseNavigationResource<T = WithId> = T[] | undefined;

export type AssociatedResource<T = WithId> =
	| NavigationResource<T>
	| OptionalNavigationResource<T>
	| ReverseNavigationResource<T>;

export type InferAssociatedResourceType<T> = T extends AssociatedResource &
	any[]
	? T[number]
	: never;

export type SelectableProps<T> =
	// This allows us to get proper results when T is any/AnyObject, otherwise this returned never
	PropsOfType<T, ReverseNavigationResource> extends StringKeyof<T>
		? StringKeyof<T>
		: Exclude<StringKeyof<T>, PropsOfType<T, ReverseNavigationResource>>; // This is the normal typed case

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
	'@'?: string;

	$raw?: RawFilter;

	$?: string | string[];

	$count?: Filter<T>;

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

export type ResourceExpand<T> = {
	[k in ExpandableProps<T>]?: ODataOptions<InferAssociatedResourceType<T[k]>>;
};

type ResourceExpandWithSelect<T> = {
	[k in ExpandableProps<T>]?: ODataOptionsWithSelect<
		InferAssociatedResourceType<T[k]>
	>;
};

type BaseExpand<T> = ResourceExpand<T> | ExpandableProps<T>;

export type Expand<T> = BaseExpand<T> | Array<BaseExpand<T>>;

type ExpandWithSelect<T> =
	| ResourceExpandWithSelect<T>
	| Array<ResourceExpandWithSelect<T>>;

export type ODataMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ODataOptionsWithoutCount<T> {
	$select?: Array<SelectableProps<T>> | SelectableProps<T> | '*';
	$filter?: Filter<T>;
	$expand?: Expand<T>;
	$orderby?: OrderBy;
	$top?: number;
	$skip?: number;
}
export interface ODataOptions<T> extends ODataOptionsWithoutCount<T> {
	$count?: ODataOptionsWithoutCount<T>;
}

export interface ODataOptionsWithSelect<T>
	extends Omit<ODataOptions<T>, '$select' | '$expand'> {
	$select: ODataOptions<T>['$select'];
	$expand?: ExpandWithSelect<T>;
}

export type ODataOptionsWithFilter<T> = ODataOptions<T> &
	Required<Pick<ODataOptions<T>, '$filter'>>;

export type SubmitBody<T> = {
	[k in keyof T]?: T[k] extends AssociatedResource ? number | null : T[k];
};

type BaseResourceId =
	| string
	| number
	| Date
	| {
			'@': string;
	  };
type ResourceId<T> =
	| BaseResourceId
	| {
			[key in keyof T]?: BaseResourceId;
	  };

export interface ParamsObj<T> {
	resource?: string;
	body?: SubmitBody<T>;
	id?: ResourceId<T>;
	options?: ODataOptions<T>;

	apiPrefix?: string;
	method?: ODataMethod;
	url?: string;
	passthrough?: AnyObject;
	passthroughByMethod?: { [method in ODataMethod]: AnyObject };
	customOptions?: AnyObject;
}

export interface ParamsObjWithId<T> extends ParamsObj<T> {
	id: ResourceId<T>;
}

export interface ParamsObjWithCount<T> extends ParamsObj<T> {
	options: { $count: NonNullable<ODataOptions<T>['$count']> };
}

export type ParamsObjWithSelect<T> = Omit<ParamsObj<T>, 'options'> & {
	options: ODataOptionsWithSelect<T>;
};

export interface ParamsObjWithFilter<T> extends ParamsObj<T> {
	options: ODataOptionsWithFilter<T>;
}

export interface UpsertParams<T>
	extends Omit<ParamsObj<T>, 'id' | 'method' | 'options'> {
	id: SubmitBody<T>;
	resource: string;
	body: SubmitBody<T>;
}

export declare type Primitive = null | string | number | boolean | Date;
export declare type ParameterAlias = Primitive;
export declare type PreparedFn<T extends Dictionary<ParameterAlias>, U, R> = (
	parameterAliases?: T,
	body?: ParamsObj<R>['body'],
	passthrough?: ParamsObj<R>['passthrough'],
) => U;

interface PollOnObj {
	unsubscribe: () => void;
}
declare class Poll<T> {
	private intervalTime;
	private subscribers;
	private stopped;
	private pollInterval?;
	private requestFn;
	constructor(requestFn: () => Promise<T>, intervalTime?: number);
	setPollInterval(intervalTime: number): void;
	runRequest(): Promise<void>;
	on(name: 'data', fn: (response: Promise<T>) => void): PollOnObj;
	on(name: 'error', fn: (err: any) => void): PollOnObj;
	start(): void;
	stop(): void;
	destroy(): void;
	private restartTimeout;
}
export interface SubscribeParams<T> extends ParamsObj<T> {
	method?: 'GET';
	pollInterval?: number;
}
export interface SubscribeParamsWithCount<T> extends ParamsObjWithCount<T> {
	method?: 'GET';
	pollInterval?: number;
}
export interface SubscribeParamsWithId<T> extends ParamsObjWithId<T> {
	method?: 'GET';
	pollInterval?: number;
}

export interface Pine {
	delete<T>(params: ParamsObjWithId<T> | ParamsObjWithFilter<T>): Promise<'OK'>;
	get<T>(params: ParamsObjWithCount<T>): Promise<number>;
	get<T>(params: ParamsObjWithId<T>): Promise<T | undefined>;
	get<T>(params: ParamsObj<T>): Promise<T[]>;
	get<T, Result>(params: ParamsObj<T>): Promise<Result>;
	post<T>(params: ParamsObj<T>): Promise<T & { id: number }>;
	patch<T>(params: ParamsObjWithId<T> | ParamsObjWithFilter<T>): Promise<'OK'>;
	upsert<T>(params: UpsertParams<T>): Promise<T | 'OK'>;

	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObjWithCount<R> & {
			method?: 'GET';
		},
	): PreparedFn<T, Promise<number>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObjWithId<R> & {
			method?: 'GET';
		},
	): PreparedFn<T, Promise<R | undefined>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObj<R> & {
			method?: 'GET';
		},
	): PreparedFn<T, Promise<R[]>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObj<R> & {
			method: 'POST';
		},
	): PreparedFn<T, Promise<R & { id: number }>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObj<R> & {
			method: 'PATCH' | 'DELETE';
		},
	): PreparedFn<T, Promise<'OK'>, R>;

	subscribe<T>(
		params: SubscribeParamsWithCount<T> & {
			method?: 'GET';
		},
	): Poll<number>;
	subscribe<T>(
		params: SubscribeParamsWithId<T> & {
			method?: 'GET';
		},
	): Poll<T | undefined>;
	subscribe<T>(
		params: SubscribeParams<T> & {
			method?: 'GET';
		},
	): Poll<T[]>;
	subscribe<T>(
		params: SubscribeParams<T> & {
			method: 'POST';
		},
	): Poll<T & { id: number }>;
	subscribe<T>(
		params: SubscribeParams<T> & {
			method: 'PATCH' | 'DELETE';
		},
	): Poll<'OK'>;
}

/**
 * A variant that helps you not forget addins a $select, helping to
 * create requests explecitely fetch only what your code needs.
 */
export type PineWithSelectOnGet = Omit<
	Pine,
	'get' | 'prepare' | 'subscribe'
> & {
	get<T>(params: ParamsObjWithCount<T>): Promise<number>;
	get<T>(
		params: ParamsObjWithId<T> & ParamsObjWithSelect<T>,
	): Promise<T | undefined>;
	get<T>(params: ParamsObjWithSelect<T>): Promise<T[]>;
	get<T, Result extends number>(params: ParamsObj<T>): Promise<Result>;
	get<T, Result>(params: ParamsObjWithSelect<T>): Promise<Result>;

	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObjWithCount<R> & {
			method?: 'GET';
		},
	): PreparedFn<T, Promise<number>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObjWithId<R> &
			ParamsObjWithSelect<R> & {
				method?: 'GET';
			},
	): PreparedFn<T, Promise<R | undefined>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObj<R> &
			ParamsObjWithSelect<R> & {
				method?: 'GET';
			},
	): PreparedFn<T, Promise<R[]>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObj<R> & {
			method: 'POST';
		},
	): PreparedFn<T, Promise<R & { id: number }>, R>;
	prepare<T extends Dictionary<ParameterAlias>, R>(
		params: ParamsObj<R> & {
			method: 'PATCH' | 'DELETE';
		},
	): PreparedFn<T, Promise<'OK'>, R>;

	subscribe<T>(
		params: SubscribeParamsWithCount<T> & {
			method?: 'GET';
		},
	): Poll<number>;
	subscribe<T>(
		params: SubscribeParamsWithId<T> &
			ParamsObjWithSelect<T> & {
				method?: 'GET';
			},
	): Poll<T | undefined>;
	subscribe<T>(
		params: SubscribeParams<T> &
			ParamsObjWithSelect<T> & {
				method?: 'GET';
			},
	): Poll<T[]>;
	subscribe<T>(
		params: SubscribeParams<T> & {
			method: 'POST';
		},
	): Poll<T & { id: number }>;
	subscribe<T>(
		params: SubscribeParams<T> & {
			method: 'PATCH' | 'DELETE';
		},
	): Poll<'OK'>;
};
