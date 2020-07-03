import * as Bluebird from 'bluebird';
import { Readable } from 'stream';
import { Omit } from './utils';

/* tslint:disable:no-namespace */
declare namespace BalenaRequest {
	interface BalenaRequestOptions {
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
		baseUrl?: string;
		url: string;
		apiKey?: string;
		sendToken?: boolean;
		body?: any;
		responseFormat?: 'none' | 'blob' | 'json' | 'text';
	}

	interface BalenaRequestResponse extends Response {
		body: any;
	}

	type BalenaRequestResponseOf<T> = Omit<BalenaRequestResponse, 'body'> & {
		body: T;
	};

	interface BalenaRequestSend {
		(options: BalenaRequestOptions): Bluebird<BalenaRequestResponse>;
		<T>(options: BalenaRequestOptions): Bluebird<BalenaRequestResponseOf<T>>;
	}

	interface BalenaRequestStreamResult extends Readable {
		mime: string;
	}

	interface BalenaRequest {
		send: BalenaRequestSend;
		stream: (
			options: BalenaRequestOptions,
		) => Bluebird<BalenaRequestStreamResult>;
	}
}

declare function BalenaRequest(options: object): BalenaRequest.BalenaRequest;

export = BalenaRequest;
