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

interface FilterArray<T> extends Array<Filter<T>> {}

type FilterExpressions<T> = {
	$raw?: RawFilter;

	$?: string | string[];

	$and?: Filter<T> | FilterArray<T>;
	$or?: Filter<T> | FilterArray<T>;

	$in?: Filter<T> | FilterArray<T>;

	$not?: Filter<T> | FilterArray<T>;

	$any?: Lambda<T>;
	$all?: Lambda<T>;
};

type Filter<T> = ResourceObjFilter<T> & FilterExpressions<T>;

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
