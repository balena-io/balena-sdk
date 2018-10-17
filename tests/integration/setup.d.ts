import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as BalenaSdk from '../../typings/balena-sdk';

export const IS_BROWSER: boolean;

export const getSdk: BalenaSdk.SdkConstructor;

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

export const balena: BalenaSdk.BalenaSDK;

export const resetUser: () => Promise<void>;

export const givenLoggedInUserWithApiKey: () => void;

export const givenLoggedInUser: () => void;

export const loginPaidUser: () => Promise<void>;

export const givenMulticontainerApplication: () => void;
