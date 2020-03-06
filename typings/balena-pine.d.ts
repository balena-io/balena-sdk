import * as Promise from 'bluebird';
import * as PineClient from './pinejs-client-core';

/* tslint:disable:no-namespace */
declare namespace BalenaPine {
	interface Pine {
		delete<T>(
			params: PineClient.PineParamsWithId<T> | PineClient.PineParams<T>,
		): Promise<'OK'>;
		get<T>(params: PineClient.PineParamsWithId<T>): Promise<T>;
		get<T>(params: PineClient.PineParams<T>): Promise<T[]>;
		get<T, Result>(params: PineClient.PineParams<T>): Promise<Result>;
		post<T>(params: PineClient.PineParams<T>): Promise<T>;
		patch<T>(
			params: PineClient.PineParamsWithId<T> | PineClient.PineParams<T>,
		): Promise<'OK'>;
		upsert<T>(params: PineClient.UpsertPineParams<T>): Promise<T | 'OK'>;
	}
}

declare function BalenaPine(options: object): BalenaPine.Pine;

export = BalenaPine;
