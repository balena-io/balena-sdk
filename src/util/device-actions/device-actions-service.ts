import type { BalenaRequest } from 'balena-request';

interface MakeActionRequestParams {
	uuid: string;
	actionNameOrId: string | number;
	params?: any;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
	extraOptions: any;
}

interface StartActionParams {
	uuid: string;
	actionName: string;
	params: any;
	extraOptions?: any;
}

interface GetActionStatusParams {
	uuid: string;
	actionId: string;
	extraOptions?: any;
}

export class DeviceActionsService {
	private actionsEndpoint: string;

	constructor(
		deviceUrlsBase: string,
		deviceActionsApiVersion: 'v1' | 'v2',
		private request: BalenaRequest,
	) {
		this.actionsEndpoint = `https://actions.${deviceUrlsBase}/${deviceActionsApiVersion}`;
	}

	public startAction = <T>({
		uuid,
		actionName,
		params,
		extraOptions,
	}: StartActionParams) =>
		this.makeActionRequest<T>({
			method: 'POST',
			uuid,
			actionNameOrId: actionName,
			params,
			extraOptions,
		});

	public getActionStatus = <T>({
		uuid,
		actionId,
		extraOptions,
	}: GetActionStatusParams) =>
		this.makeActionRequest<T>({
			method: 'GET',
			uuid,
			actionNameOrId: actionId,
			extraOptions,
		});

	private makeActionRequest = async <T>({
		method,
		uuid,
		actionNameOrId,
		params,
		extraOptions,
	}: MakeActionRequestParams): Promise<T> => {
		const data = params ? { parameters: params } : null;

		const { body } = await this.request.send<T>({
			method,
			url: `${this.actionsEndpoint}/${uuid}/${actionNameOrId}`,
			body: data,
			...extraOptions,
		});
		return body;
	};
}
