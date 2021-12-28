import * as url from 'url';
import * as errors from 'balena-errors';
import { AnyObject, Params, PinejsClientCore } from 'pinejs-client-core';
import type * as PineClient from '../typings/pinejs-client-core';
import type { ResourceTypeMap } from './types/models';

interface BackendParams {
	apiUrl: string;
	apiVersion: string;
	apiKey?: string;
	request: {
		// TODO: Should be the type of balena-request
		send: (options: AnyObject) => Promise<{ body: any }>;
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

	constructor(params: Params, public backendParams: BackendParams) {
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
	 * @returns {Promise<*>} response body
	 *
	 * @todo Implement caching support.
	 */
	public async _request(
		options: {
			method: string;
			url: string;
			body?: AnyObject;
		} & AnyObject,
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
	// @ts-expect-error
	return pine as Pine;
};
