// based on https://github.com/resin-io/pinejs-client-js/blob/master/core.d.ts

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

type ResourceObjFilter<T> = { [k in keyof T]?: object | number | string };

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

type BaseExpandFor<T> = { [k in keyof T]?: object } | keyof T;

export type Expand<T> = BaseExpandFor<T> | Array<BaseExpandFor<T>>;
