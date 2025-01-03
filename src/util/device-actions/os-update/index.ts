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
		| 'triggered'
		// Only used for OS >= vTODO which supports Supervisor managed HUP.
		| 'pinned';
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

	const getOsUpdateStatus = (uuid: string) => {
		return deviceActionsService.getActionStatus<OsUpdateActionResult>({
			uuid,
			// TODO: this is an assumption recorded here: https://github.com/resin-io/resin-proxy/issues/51#issuecomment-274087973
			actionId: OS_UPDATE_ACTION_NAME,
		});
	};

	return {
		startOsUpdate,
		getOsUpdateStatus,
	};
};
