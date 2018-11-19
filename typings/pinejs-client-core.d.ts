// backwards compatible alternative for: Extract<keyof T, string>
type StringKeyof<T> = keyof T & string;

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

// based on https://github.com/balena-io/pinejs-client-js/blob/master/core.d.ts

type RawFilter =
	| string
	| Array<string | Filter<any>>
	| { $string: string; [index: string]: Filter<any> | string };
type Lambda<T> = {
	$alias: string;
	$expr: Filter<T>;
};

type OrderByValues = 'asc' | 'desc';
type OrderBy = string | string[] | { [index: string]: OrderByValues };

type ResourceObjFilter<T> = {
	[k in keyof T]?: object | number | string | boolean
};

type Filter<T> = FilterObj<T>;
type FilterObj<T> = ResourceObjFilter<T> & FilterExpressions<T>;
type FilterBaseType = string | number | null | boolean | Date;
type NestedFilter<T> = FilterObj<T> | FilterArray<T> | FilterBaseType;

interface FilterArray<T> extends Array<NestedFilter<T>> {}

type FilterOperationValue<T> = NestedFilter<T>;
type FilterFunctionValue<T> = NestedFilter<T>;

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

type BaseExpandFor<T> = { [k in keyof T]?: object } | StringKeyof<T>;

export type Expand<T> = BaseExpandFor<T> | Array<BaseExpandFor<T>>;

export interface PineOptions {
	$select?: string[] | string | '*';
	$filter?: object;
	$expand?: object | string;
	$orderby?: OrderBy;
	$top?: number;
	$skip?: number;
}

export interface PineOptionsFor<T> extends PineOptions {
	$select?: Array<StringKeyof<T>> | StringKeyof<T> | '*';
	$filter?: Filter<T>;
	$expand?: Expand<T>;
}

export interface PineParams {
	resource: string;
	id?: number;
	body?: object;
	options?: PineOptions;
}

export interface PineParamsFor<T> extends PineParams {
	body?: Partial<T>;
	options?: PineOptionsFor<T>;
}

export interface PineParamsWithIdFor<T> extends PineParamsFor<T> {
	id: number;
}
