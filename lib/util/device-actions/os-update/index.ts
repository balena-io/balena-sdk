import * as BalenaRequest from '../../../../typings/balena-request';
import * as BalenaSdk from '../../../../typings/balena-sdk';
import { DeviceActionsService } from '../device-actions-service';

const OS_UPDATE_ACTION_NAME = 'resinhup';

export const getOsUpdateHelper = function (
	deviceUrlsBase: string,
	request: BalenaRequest.BalenaRequest,
) {
	const deviceActionsService = new DeviceActionsService(
		deviceUrlsBase,
		request,
	);

	const startOsUpdate = (uuid: string, targetOsVersion: string) => {
		return deviceActionsService.startAction<BalenaSdk.OsUpdateActionResult>({
			uuid,
			actionName: OS_UPDATE_ACTION_NAME,
			params: {
				target_version: targetOsVersion,
			},
		});
	};

	const getOsUpdateStatus = (uuid: string) => {
		return deviceActionsService.getActionStatus<BalenaSdk.OsUpdateActionResult>(
			{
				uuid,
				// TODO: this is an assumption recorded here: https://github.com/resin-io/resin-proxy/issues/51#issuecomment-274087973
				actionId: OS_UPDATE_ACTION_NAME,
			},
		);
	};

	return {
		startOsUpdate,
		getOsUpdateStatus,
	};
};
