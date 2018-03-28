import { PropsOfType } from './utils';

export interface WithId {
	id: number;
}

export interface Deferred {
	__id: number;
}

export type NavigationResource<T = WithId> = T[] | Deferred;
export type ReverseNavigationResource<T = WithId> = T[] | undefined;

export type AssociatedResource<T = WithId> = NavigationResource<T> | ReverseNavigationResource<T>;
export type InferAssociatedResourceType<T> = T extends AssociatedResource & any[] ? T[number] : never;

// based on https://github.com/resin-io/pinejs-client-js/blob/master/core.d.ts

type AnyObject = {
	[index: string]: any;
};

type RawFilter =
	| string
	| Array<string | Filter<any>>
	| {
			$string: string;
			[index: string]: Filter<any> | string;
	  };
type Lambda<T> = {
	$alias: string;
	$expr: Filter<T>;
};

type OrderByValues = 'asc' | 'desc';
type OrderBy =
	| string
	| string[]
	| {
			[index: string]: OrderByValues;
	  };

type ResourceObjFilter<T> = { [k in keyof T]?: object | number | string };

interface FilterArray<T> extends Array<Filter<T>> {}

interface FilterExpressions<T> {
	$raw?: RawFilter;

	$?: string | string[];

	$and?: Filter<T> | FilterArray<T>;
	$or?: Filter<T> | FilterArray<T>;

	$in?: Filter<T> | FilterArray<T>;

	$not?: Filter<T> | FilterArray<T>;

	$any?: Lambda<T>;
	$all?: Lambda<T>;
}

type Filter<T> = ResourceObjFilter<T> & FilterExpressions<T>;

type BaseExpandFor<T> = { [k in keyof T]?: object } | keyof T;

export type Expand<T> = BaseExpandFor<T> | Array<BaseExpandFor<T>>;

export type ODataMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ODataOptionsBase {
	$orderby?: OrderBy;
	$top?: string;
	$skip?: string;
	$select?: string | string[] | '*';
}

interface ODataOptions extends ODataOptionsBase {
	$filter?: object;
	$expand?: object | string;
}

export interface OptionsFor<T> extends ODataOptionsBase {
	$filter?: Filter<T>;
	$expand?: Expand<T> | string;
	$select?: Array<keyof T> | keyof T | '*';
}

interface ParamsBase {
	apiPrefix?: string;
	method?: ODataMethod;
	resource?: string;
	id?: number;
	url?: string;
	passthrough?: AnyObject;
	passthroughByMethod?: {
		GET: AnyObject;
		POST: AnyObject;
		PATCH: AnyObject;
		DELETE: AnyObject;
	};
	customOptions?: AnyObject;
}

interface Params extends ParamsBase {
	body?: AnyObject;
	options?: ODataOptions;
}

export type SubmitBody<T> = { [k in keyof T]?: T[k] extends AssociatedResource ? number | null : T[k] };

export interface ParamsFor<T> extends ParamsBase {
	body?: SubmitBody<T>;
	options?: OptionsFor<T>;
}
