import type * as PineClient from './pinejs-client-core';

export interface Pine {
	delete<T>(
		params: PineClient.ParamsObjWithId<T> | PineClient.ParamsObjWithFilter<T>,
	): Promise<'OK'>;
	get<T>(params: PineClient.ParamsObjWithId<T>): Promise<T>;
	get<T>(params: PineClient.ParamsObj<T>): Promise<T[]>;
	get<T, Result>(params: PineClient.ParamsObj<T>): Promise<Result>;
	post<T>(params: PineClient.ParamsObj<T>): Promise<T & { id: number }>;
	patch<T>(
		params: PineClient.ParamsObjWithId<T> | PineClient.ParamsObjWithFilter<T>,
	): Promise<'OK'>;
	upsert<T>(params: PineClient.UpsertParams<T>): Promise<T | 'OK'>;
}

/**
 * A variant that helps you not forget addins a $select, helping to
 * create requests explecitely fetch only what your code needs.
 */
export type PineWithSelectOnGet = Omit<Pine, 'get'> & {
	get<T>(
		params: PineClient.ParamsObjWithId<T> & PineClient.ParamsObjWithSelect<T>,
	): Promise<T>;
	get<T>(params: PineClient.ParamsObjWithSelect<T>): Promise<T[]>;
	get<T, Result extends number>(
		params: PineClient.ParamsObj<T>,
	): Promise<Result>;
	get<T, Result>(params: PineClient.ParamsObjWithSelect<T>): Promise<Result>;
};
