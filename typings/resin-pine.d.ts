import * as Promise from 'bluebird';
import * as ResinSdk from './resin-sdk';

/* tslint:disable:no-namespace */
declare namespace ResinPine {
	interface Pine {
		delete<T>(
			params: ResinSdk.PineParamsWithIdFor<T> | ResinSdk.PineParamsFor<T>,
		): Promise<string>;
		get<T>(params: ResinSdk.PineParamsWithIdFor<T>): Promise<T>;
		get<T>(params: ResinSdk.PineParamsFor<T>): Promise<T[]>;
		get<T, Result>(params: ResinSdk.PineParamsFor<T>): Promise<Result>;
		post<T>(params: ResinSdk.PineParams): Promise<T>;
		patch<T>(params: ResinSdk.PineParams): Promise<T>;
	}
}

declare function ResinPine(options: object): ResinPine.Pine;

export = ResinPine;
