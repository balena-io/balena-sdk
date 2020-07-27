import type { Readable } from 'stream';

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
	(options: BalenaRequestOptions): Promise<BalenaRequestResponse>;
	<T>(options: BalenaRequestOptions): Promise<BalenaRequestResponseOf<T>>;
}

interface BalenaRequestStreamResult extends Readable {
	mime: string;
}

interface BalenaRequest {
	send: BalenaRequestSend;
	stream: (options: BalenaRequestOptions) => Promise<BalenaRequestStreamResult>;
}
