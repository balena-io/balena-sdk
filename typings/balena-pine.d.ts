import * as Bluebird from 'bluebird';
import * as PineClient from './pinejs-client-core';

/* tslint:disable:no-namespace */
declare namespace BalenaPine {
	interface Pine {
		delete<T>(
			params: PineClient.ParamsObjWithId<T> | PineClient.ParamsObjWithFilter<T>,
		): Bluebird<'OK'>;
		get<T>(params: PineClient.ParamsObjWithId<T>): Bluebird<T>;
		get<T>(params: PineClient.ParamsObj<T>): Bluebird<T[]>;
		get<T, Result>(params: PineClient.ParamsObj<T>): Bluebird<Result>;
		post<T>(params: PineClient.ParamsObj<T>): Bluebird<T>;
		patch<T>(
			params: PineClient.ParamsObjWithId<T> | PineClient.ParamsObjWithFilter<T>,
		): Bluebird<'OK'>;
		upsert<T>(params: PineClient.UpsertParams<T>): Bluebird<T | 'OK'>;
	}
}

declare function BalenaPine(options: object): BalenaPine.Pine;

export = BalenaPine;
