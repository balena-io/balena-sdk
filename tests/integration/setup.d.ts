import * as Bluebird from 'bluebird';
import type * as BalenaSdk from '../..';

export const IS_BROWSER: boolean;

export const getSdk: BalenaSdk.SdkConstructor;

export const sdkOpts: {
	apiUrl: string;
	dataDirectory: string;
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

export const resetUser: () => Bluebird<void>;

export const givenLoggedInUserWithApiKey: (
	beforeFn: Mocha.HookFunction,
) => void;

export const givenLoggedInUser: (beforeFn: Mocha.HookFunction) => void;

export const loginPaidUser: () => Bluebird<void>;

export const givenAnApplication: (beforeFn: Mocha.HookFunction) => void;
export const givenADevice: (beforeFn: Mocha.HookFunction) => void;
export const givenAnApplicationWithADevice: (
	beforeFn: Mocha.HookFunction,
) => void;
export const givenMulticontainerApplication: (
	beforeFn: Mocha.HookFunction,
) => void;
export const givenMulticontainerApplicationWithADevice: (
	beforeFn: Mocha.HookFunction,
) => void;
