interface Dictionary<T> {
	[key: string]: T;
}

type DeviceTypeInstructions = {
	linux: string[];
	osx: string[];
	windows: string[];
};

type DeviceTypeGettingStartedLink = {
	linux: string;
	osx: string;
	windows: string;
	[key: string]: string;
};

interface DeviceTypeOptionsGroup {
	default: number | string;
	message: string;
	name: string;
	type: string;
	min?: number;
	choices?: string[] | number[];
	choicesLabels?: Dictionary<string>;
}

interface DeviceTypeOptions {
	options: DeviceTypeOptionsGroup[];
	collapsed: boolean;
	isCollapsible: boolean;
	isGroup: boolean;
	message: string;
	name: string;
}

type DeviceType = {
	slug: string;
	name: string;
	aliases: string[];

	isDependent?: boolean;
	instructions?: string[] | DeviceTypeInstructions;
	gettingStartedLink?: string | DeviceTypeGettingStartedLink;
	stateInstructions?: { [key: string]: string[] };
	options?: DeviceTypeOptions[];
	state?: string;
	supportsBlink?: boolean;
	yocto: {
		fstype?: string;
		deployArtifact: string;
	};
};
