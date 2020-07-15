import type * as Bluebird from 'bluebird';
import type * as PineClient from './pinejs-client-core';

export interface Pine {
	delete<T>(
		params: PineClient.ParamsObjWithId<T> | PineClient.ParamsObjWithFilter<T>,
	): Bluebird<'OK'>;
	get<T>(params: PineClient.ParamsObjWithId<T>): Bluebird<T>;
	get<T>(params: PineClient.ParamsObj<T>): Bluebird<T[]>;
	get<T, Result>(params: PineClient.ParamsObj<T>): Bluebird<Result>;
	post<T>(params: PineClient.ParamsObj<T>): Bluebird<T & { id: number }>;
	patch<T>(
		params: PineClient.ParamsObjWithId<T> | PineClient.ParamsObjWithFilter<T>,
	): Bluebird<'OK'>;
	upsert<T>(params: PineClient.UpsertParams<T>): Bluebird<T | 'OK'>;
}

/**
 * A variant that helps you not forget addins a $select, helping to
 * create requests explecitely fetch only what your code needs.
 */
export type PineWithSelectOnGet = Omit<Pine, 'get'> & {
	get<T>(
		params: PineClient.ParamsObjWithId<T> & PineClient.ParamsObjWithSelect<T>,
	): Bluebird<T>;
	get<T>(params: PineClient.ParamsObjWithSelect<T>): Bluebird<T[]>;
	get<T, Result extends number>(
		params: PineClient.ParamsObj<T>,
	): Bluebird<Result>;
	get<T, Result>(params: PineClient.ParamsObjWithSelect<T>): Bluebird<Result>;
};
