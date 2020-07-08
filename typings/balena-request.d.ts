import type * as Bluebird from 'bluebird';
import type { Readable } from 'stream';
import type { Omit } from './utils';

interface BalenaRequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
	baseUrl?: string;
	url: string;
	apiKey?: string;
	sendToken?: boolean;
	body?: any;
	responseFormat?: 'none' | 'blob' | 'json' | 'text';
	headers?: {
		[key: string]: string;
	};
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
