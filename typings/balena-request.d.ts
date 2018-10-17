import * as Promise from 'bluebird';

/* tslint:disable:no-namespace */
declare namespace BalenaRequest {
	interface BalenaRequestOptions {
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
		baseUrl?: string;
		url: string;
		apiKey?: string;
		body?: any;
	}

	interface BalenaRequestResponse extends Response {
		body: any;
	}

	interface BalenaRequest {
		send: (options: BalenaRequestOptions) => Promise<BalenaRequestResponse>;
	}
}

declare function BalenaRequest(options: object): BalenaRequest.BalenaRequest;

export = BalenaRequest;
