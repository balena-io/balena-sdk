import BalenaAuth from 'resin-auth/lib/auth';

import * as BalenaSdk from '../typings/balena-sdk';
import * as BalenaPine from '../typings/resin-pine';
import * as BalenaRequest from '../typings/resin-request';

export interface InjectedDependenciesParam {
	settings: {
		get(key: string): Promise<string>;
		getAll(): Promise<{ [key: string]: string }>;
	};
	request: BalenaRequest.BalenaRequest;
	auth: BalenaAuth;
	pine: BalenaPine.Pine;
}

export interface InjectedOptionsParam extends BalenaSdk.SdkOptions {
	apiVersion: string;
}
