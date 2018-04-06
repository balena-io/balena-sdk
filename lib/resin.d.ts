import ResinAuth from 'resin-auth/lib/auth';
import * as ResinPine from '../typings/resin-pine';
import * as ResinRequest from '../typings/resin-request';
import * as ResinSdk from '../typings/resin-sdk';

export interface InjectedDependenciesParam {
	settings: {
		get(key: string): Promise<string>;
		getAll(): Promise<{ [key: string]: string }>;
	};
	request: ResinRequest.ResinRequest;
	auth: ResinAuth;
	pine: ResinPine.Pine;
}

export interface InjectedOptionsParam extends ResinSdk.SdkOptions {
	apiVersion: string;
}
