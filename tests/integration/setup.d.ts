import * as Promise from 'bluebird';
import * as BalenaSdk from '../../typings/balena-sdk';

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

export { BalenaSdk };

export const balena: BalenaSdk.BalenaSDK & {
	models: {
		os: {
			_getDeviceTypes: typeof balena.models.config.getDeviceTypes;
			_getOsVersions: typeof balena.models.os.getSupportedVersions;
			_getDownloadSize: typeof balena.models.os.getDownloadSize;
			_getMaxSatisfyingVersion: (
				versionOrRange: string,
				osVersions: BalenaSdk.OsVersions,
			) => string | null;
			_clearDeviceTypesEndpointCaches: () => void;
		};
	};
};

export const resetUser: () => Promise<void>;

export const givenLoggedInUserWithApiKey: (
	beforeFn: Mocha.HookFunction,
) => void;

export const givenLoggedInUser: (beforeFn: Mocha.HookFunction) => void;

export const loginPaidUser: () => Promise<void>;

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
