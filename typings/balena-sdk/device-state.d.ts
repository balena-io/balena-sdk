import { Dictionary } from '../utils';

// tslint:disable-next-line:no-module
declare module './index' {
	export namespace DeviceState {
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
	}
}
