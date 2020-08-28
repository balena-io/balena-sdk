import type { Readable } from 'stream';
import { Interceptor } from './balena-sdk';

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
	signal?: any;
	timeout?: number;
}

interface BalenaRequestResponse extends Response {
	statusCode: number;
	body: any;
}

type BalenaRequestResponseOf<T> = Omit<BalenaRequestResponse, 'body'> & {
	body: T;
};

interface BalenaRequestSend {
	(options: BalenaRequestOptions): Promise<BalenaRequestResponse>;
	<T>(options: BalenaRequestOptions): Promise<BalenaRequestResponseOf<T>>;
}

interface BalenaRequestStreamResult extends Readable {
	mime: string;
}

interface BalenaRequest {
	send: BalenaRequestSend;
	stream: (options: BalenaRequestOptions) => Promise<BalenaRequestStreamResult>;
	interceptors: Interceptor[];
	refreshToken(options: { baseUrl: string }): Promise<string>;
}
