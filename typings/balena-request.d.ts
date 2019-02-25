import * as Promise from 'bluebird';
import { Omit } from './utils';

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

	type BalenaRequestResponseOf<T> = Omit<BalenaRequestResponse, 'body'> & {
		body: T;
	};

	interface BalenaRequestSend {
		(options: BalenaRequestOptions): Promise<BalenaRequestResponse>;
		<T>(options: BalenaRequestOptions): Promise<BalenaRequestResponseOf<T>>;
	}

	interface BalenaRequest {
		send: BalenaRequestSend;
	}
}

declare function BalenaRequest(options: object): BalenaRequest.BalenaRequest;

export = BalenaRequest;
