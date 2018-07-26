import * as Promise from 'bluebird';
import * as PineClient from './pinejs-client-core';

/* tslint:disable:no-namespace */
declare namespace ResinPine {
	interface Pine {
		delete<T>(
			params: PineClient.PineParamsWithIdFor<T> | PineClient.PineParamsFor<T>,
		): Promise<string>;
		get<T>(params: PineClient.PineParamsWithIdFor<T>): Promise<T>;
		get<T>(params: PineClient.PineParamsFor<T>): Promise<T[]>;
		get<T, Result>(params: PineClient.PineParamsFor<T>): Promise<Result>;
		post<T>(params: PineClient.PineParams): Promise<T>;
		patch<T>(params: PineClient.PineParams): Promise<T>;
	}
}

declare function ResinPine(options: object): ResinPine.Pine;

export = ResinPine;
