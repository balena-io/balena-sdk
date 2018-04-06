import * as Promise from 'bluebird';

/* tslint:disable:no-namespace */
declare namespace ResinRequest {
	interface ResinRequestOptions {
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
		baseUrl?: string;
		url: string;
		apiKey?: string;
		body?: any;
	}

	interface ResinRequestResponse extends Response {
		body: any;
	}

	interface ResinRequest {
		send: (options: ResinRequestOptions) => Promise<ResinRequestResponse>;
	}
}

declare function ResinRequest(options: object): ResinRequest.ResinRequest;

export = ResinRequest;
