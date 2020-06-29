import { Dictionary } from '../utils';

// tslint:disable-next-line:no-module
declare module './index' {
	/* types for the /device-types/v1 endppoints */
	export namespace DeviceTypeJson {
		interface DeviceType {
			slug: string;
			name: string;
			aliases: string[];

			arch: string;
			state?: string;
			community?: boolean;
			private?: boolean;

			isDependent?: boolean;
			imageDownloadAlerts?: DeviceTypeDownloadAlert[];
			instructions?: string[] | DeviceTypeInstructions;
			gettingStartedLink?: string | DeviceTypeGettingStartedLink;
			stateInstructions?: { [key: string]: string[] };
			options?: DeviceTypeOptions[];
			initialization?: {
				options?: DeviceInitializationOptions[];
				operations: Array<{
					command: string;
				}>;
			};
			supportsBlink?: boolean;
			yocto: {
				fstype?: string;
				deployArtifact: string;
			};
			/** Holds the latest balenaOS version */
			buildId?: string;
			logoUrl?: string;
		}

		interface DeviceTypeDownloadAlert {
			type: string;
			message: string;
		}

		interface DeviceTypeInstructions {
			linux: string[];
			osx: string[];
			windows: string[];
		}

		interface DeviceTypeGettingStartedLink {
			linux: string;
			osx: string;
			windows: string;
			[key: string]: string;
		}

		interface DeviceTypeOptions {
			options: DeviceTypeOptionsGroup[];
			collapsed: boolean;
			isCollapsible: boolean;
			isGroup: boolean;
			message: string;
			name: string;
		}

		interface DeviceInitializationOptions {
			message: string;
			type: string;
			name: string;
		}

		interface DeviceTypeOptionsGroup {
			default: number | string;
			message: string;
			name: string;
			type: string;
			min?: number;
			max?: number;
			hidden?: boolean;
			when?: Dictionary<number | string | boolean>;
			choices?: string[] | number[];
			choicesLabels?: Dictionary<string>;
		}
	}
}
