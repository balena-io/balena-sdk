import type { Dictionary } from '../../typings/utils';

export interface ServiceInfo {
	imageId: number;
	serviceName: string;
	image: string;
	running: boolean;
	environment: Dictionary<string>;
	labels: Dictionary<string>;
}

export interface AppInfo {
	name: string;
	commit?: string;
	releaseId?: number;
	services: Dictionary<ServiceInfo>;
	volumes: any;
	networks: any;
}

export interface DependentAppInfo {
	name: string;
	parentApp: number;
	config: Dictionary<string>;
	commit?: string;
	releaseId?: number;
	imageId?: number;
	image?: string;
}

export interface DeviceState {
	local: {
		name: string;
		config: Dictionary<string>;
		apps: Dictionary<AppInfo>;
	};
	dependent: {
		apps: Dictionary<DependentAppInfo>;
		devices: Dictionary<{
			name: string;
			apps: Dictionary<{
				config: Dictionary<string>;
				environment: Dictionary<string>;
			}>;
		}>;
	};
}

export interface DeviceStateV3 {
	[deviceUuid: string]: {
		name?: string;
		config: Dictionary<string>;
		apps: {
			[appUuid: string]: {
				release_uuid?: string;
				releases: {
					[releaseUuid: string]: {
						services: {
							[serviceName: string]: {
								image: string;
							};
						};
					};
				};
			};
		};
	};
}
