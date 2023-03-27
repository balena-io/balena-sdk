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

const DEVICE_ACTIONS_API_VERSION = 'v1';

export class DeviceActionsService {
	private actionsEndpoint: string;

	constructor(deviceUrlsBase: string, private request: BalenaRequest) {
		this.actionsEndpoint = `https://actions.${deviceUrlsBase}/${DEVICE_ACTIONS_API_VERSION}`;
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
