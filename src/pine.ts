import * as url from 'url';
import * as errors from 'balena-errors';
import type { Params } from 'pinejs-client-core';
import { PinejsClientCore } from 'pinejs-client-core';
import type * as PineClient from '../typings/pinejs-client-core';
import type { ResourceTypeMap } from './types/models';
import type BalenaRequest from 'balena-request';
import type { BalenaRequestOptions } from 'balena-request';

type BalenaRequestSend = ReturnType<
	(typeof BalenaRequest)['getRequest']
>['send'];

interface BackendParams {
	apiUrl: string;
	apiVersion: string;
	apiKey?: string;
	request: {
		send: BalenaRequestSend;
	};
	auth: import('balena-auth').default;
}

/**
 * @class
 * @classdesc A PineJS Client subclass to communicate with balena.
 * @private
 *
 * @description
 * This subclass makes use of the [balena-request](https://github.com/balena-io-modules/balena-request) project.
 */
class PinejsClient extends PinejsClientCore<PinejsClient> {
	public API_URL: string;
	public API_VERSION: string;

	constructor(
		params: Params,
		public backendParams: BackendParams,
	) {
		super({
			...params,
			apiPrefix: url.resolve(
				backendParams.apiUrl,
				`/${backendParams.apiVersion}/`,
			),
		});

		this.backendParams = backendParams;
		this.API_URL = backendParams.apiUrl;
		this.API_VERSION = backendParams.apiVersion;
	}

	/**
	 * @summary Perform a network request to balena.
	 * @method
	 * @private
	 *
	 * @param {Object} options - request options
	 * @returns {Promise<any>} response body
	 *
	 * @todo Implement caching support.
	 */
	public async _request(
		options: BalenaRequestOptions & { method: string; anonymous?: unknown },
	) {
		const { apiKey, apiUrl, auth, request } = this.backendParams;

		const hasKey = await auth.hasKey();
		const authenticated = hasKey || (apiKey != null && apiKey.length > 0);

		options = {
			apiKey,
			baseUrl: apiUrl,
			sendToken: authenticated && !options.anonymous,
			...options,
		};

		try {
			const { body } = await request.send(options);
			return body;
		} catch (err) {
			if (err.statusCode !== 401) {
				throw err;
			}

			// Always return the API error when the anonymous flag is used.
			if (options.anonymous) {
				throw err;
			}

			// We want to allow unauthenticated users to make requests
			// to public resources, but still reject with a NotLoggedIn
			// error if the response ends up being a 401.
			if (!authenticated) {
				throw new errors.BalenaNotLoggedIn();
			}

			throw err;
		}
	}
}

export type Pine = PineClient.Pine<ResourceTypeMap>;
/**
 * A variant that makes $select mandatory, helping to create
 * requests that explicitly fetch only what your code needs.
 */
export type PineStrict = PineClient.PineStrict<ResourceTypeMap>;

export const createPinejsClient = (
	...args: ConstructorParameters<typeof PinejsClient>
) => {
	const pine = new PinejsClient(...args);
	// @ts-expect-error the SDK's typed pine client differs significantly from the original pine client.
	return pine as Pine;
};
