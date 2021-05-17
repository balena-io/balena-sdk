import type * as BalenaRequest from '../../../../typings/balena-request';
import { DeviceActionsService } from '../device-actions-service';
import { AnyObject } from '../../../../typings/utils';

const OS_UPDATE_ACTION_NAME = 'resinhup';

// See: https://github.com/balena-io/balena-proxy/issues/51#issuecomment-274251469
export interface OsUpdateActionResult {
	status: 'idle' | 'in_progress' | 'done' | 'error' | 'configuring';
	parameters?: {
		target_version: string;
	};
	error?: string;
	fatal?: boolean;
}

export const getOsUpdateHelper = function (
	deviceUrlsBase: string,
	request: BalenaRequest.BalenaRequest,
) {
	const deviceActionsService = new DeviceActionsService(
		deviceUrlsBase,
		request,
	);

	// TODO: tighten up typings
	const startOsUpdate = async (pine: any, uuid: string, release: AnyObject) => {
		await pine.patch({
			resource: 'device',
			options: {
				$filter: {
					uuid,
				},
			},
			body: {
				should_be_operated_by__release: release.id,
			},
		});
		return deviceActionsService.startAction<OsUpdateActionResult>({
			uuid,
			actionName: OS_UPDATE_ACTION_NAME,
			params: {
				target_version: release.strippedVersion,
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
