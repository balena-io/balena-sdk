export interface ServiceInfo {
	imageId: number;
	serviceName: string;
	image: string;
	running: boolean;
	environment: Record<string, string>;
	labels: Record<string, string>;
}

export interface AppInfo {
	name: string;
	commit?: string;
	releaseId?: number;
	services: Record<string, ServiceInfo>;
	volumes: any;
	networks: any;
}

export interface DependentAppInfo {
	name: string;
	parentApp: number;
	config: Record<string, string>;
	commit?: string;
	releaseId?: number;
	imageId?: number;
	image?: string;
}

export interface DeviceState {
	local: {
		name: string;
		config: Record<string, string>;
		apps: Record<string, AppInfo>;
	};
	dependent: {
		apps: Record<string, DependentAppInfo>;
		devices: Record<
			string,
			{
				name: string;
				apps: Record<
					string,
					{
						config: Record<string, string>;
						environment: Record<string, string>;
					}
				>;
			}
		>;
	};
}

export interface DeviceStateV3 {
	[deviceUuid: string]: {
		name?: string;
		config: Record<string, string>;
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
