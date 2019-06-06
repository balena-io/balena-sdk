import * as Promise from 'bluebird';
import * as PineClient from './pinejs-client-core';

/* tslint:disable:no-namespace */
declare namespace BalenaPine {
	interface Pine {
		delete<T>(
			params: PineClient.PineParamsWithIdFor<T> | PineClient.PineParamsFor<T>,
		): Promise<string>;
		get<T>(params: PineClient.PineParamsWithIdFor<T>): Promise<T>;
		get<T>(params: PineClient.PineParamsFor<T>): Promise<T[]>;
		get<T, Result>(params: PineClient.PineParamsFor<T>): Promise<Result>;
		post<T>(params: PineClient.PineParamsFor<T>): Promise<T>;
		patch<T>(
			params: PineClient.PineParamsWithIdFor<T> | PineClient.PineParamsFor<T>,
		): Promise<string>;
	}
}

declare function BalenaPine(options: object): BalenaPine.Pine;

export = BalenaPine;
