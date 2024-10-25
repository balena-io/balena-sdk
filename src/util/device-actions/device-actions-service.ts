import type { BalenaRequest } from 'balena-request';

interface MakeActionRequestParams {
	uuid: string;
	actionNameOrId: string | number;
	deviceActionsApiVersion: 'v1' | 'v2';
	params?: any;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
	extraOptions: any;
}

interface StartActionParams {
	uuid: string;
	actionName: string;
	deviceActionsApiVersion: 'v1' | 'v2';
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
		private request: BalenaRequest,
	) {
		this.actionsEndpoint = `https://actions.${deviceUrlsBase}`;
	}

	public startAction = <T>({
		uuid,
		actionName,
		deviceActionsApiVersion,
		params,
		extraOptions,
	}: StartActionParams) =>
		this.makeActionRequest<T>({
			method: 'POST',
			uuid,
			actionNameOrId: actionName,
			deviceActionsApiVersion,
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
			deviceActionsApiVersion: 'v1',
			actionNameOrId: actionId,
			extraOptions,
		});

	private makeActionRequest = async <T>({
		method,
		uuid,
		actionNameOrId,
		deviceActionsApiVersion,
		params,
		extraOptions,
	}: MakeActionRequestParams): Promise<T> => {
		const data = params ? { parameters: params } : null;

		const { body } = await this.request.send<T>({
			method,
			url: `${this.actionsEndpoint}/${deviceActionsApiVersion}/${uuid}/${actionNameOrId}`,
			body: data,
			...extraOptions,
		});
		return body;
	};
}
