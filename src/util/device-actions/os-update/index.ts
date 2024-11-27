import type { BalenaRequest } from 'balena-request';
import { DeviceActionsService } from '../device-actions-service';

const OS_UPDATE_ACTION_NAME = 'resinhup';

// See: https://github.com/balena-io/resin-proxy/issues/51#issuecomment-274251469
export interface OsUpdateActionResult {
	status:
		| 'idle'
		| 'in_progress'
		| 'done'
		| 'error'
		| 'configuring'
		| 'triggered';
	parameters?: {
		target_version: string;
	};
	error?: string;
	fatal?: boolean;
}

export const getOsUpdateHelper = function (
	deviceUrlsBase: string,
	request: BalenaRequest,
) {
	const deviceActionsService = new DeviceActionsService(
		deviceUrlsBase,
		request,
	);

	const startOsUpdate = (
		uuid: string,
		targetOsVersion: string,
		deviceActionsApiVersion: 'v1' | 'v2',
	) => {
		return deviceActionsService.startAction<OsUpdateActionResult>({
			uuid,
			actionName: OS_UPDATE_ACTION_NAME,
			deviceActionsApiVersion,
			params: {
				target_version: targetOsVersion,
			},
		});
	};

	return {
		startOsUpdate,
	};
};
