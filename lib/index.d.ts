import BalenaAuth from 'balena-auth/lib/auth';

import * as BalenaPine from '../typings/balena-pine';
import * as BalenaRequest from '../typings/balena-request';
import * as BalenaSdk from '../typings/balena-sdk';
import { PubSub } from './util/pubsub';

export interface InjectedDependenciesParam {
	sdkInstance: BalenaSdk.BalenaSDK;
	settings: {
		get(key: string): Promise<string>;
		getAll(): Promise<{ [key: string]: string }>;
	};
	request: BalenaRequest.BalenaRequest;
	auth: BalenaAuth;
	pine: BalenaPine.Pine;
	pubsub: PubSub;
}

export interface InjectedOptionsParam extends BalenaSdk.SdkOptions {
	apiVersion: string;
}
