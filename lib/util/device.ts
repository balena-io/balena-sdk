import isEmpty = require('lodash/isEmpty');
import * as BalenaSdk from '../../typings/balena-sdk';

export const isProvisioned = (
	device: Pick<
		BalenaSdk.Device,
		'supervisor_version' | 'last_connectivity_event'
	>,
) => {
	return (
		!isEmpty(device.supervisor_version) &&
		!isEmpty(device.last_connectivity_event)
	);
};
