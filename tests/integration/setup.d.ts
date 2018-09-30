import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as ResinSdk from '../../typings/resin-sdk';

export const IS_BROWSER: boolean;

export const getSdk: ResinSdk.SdkConstructor;

export const sdkOpts: {
	apiUrl: string;
	imageMakerUrl: string;
	dataDirectory: string;
	apiKey: string | null;
	isBrowser: boolean;
	retries: number;
};

export const credentials: {
	email: string;
	password: string;
	username: string;
	paid: {
		email: string;
		password: string;
	};
	register: {
		email: string;
		password: string;
		username: string;
	};
};

export const resin: ResinSdk.ResinSDK;

export const resetUser: () => Promise<void>;

export const givenLoggedInUserWithApiKey: () => void;

export const givenLoggedInUser: () => void;

export const loginPaidUser: () => Promise<void>;

export const givenMulticontainerApplication: () => void;
