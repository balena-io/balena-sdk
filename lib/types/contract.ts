export interface Contract {
	slug: string;
	type: string;
	name?: string;
	version?: string;
	externalVersion?: string;
	contractVersion?: string;
	description?: string;
	aliases?: string[];
	tags?: string[];
	data?: object;
	assets?: object;
	requires?: string[];
	provides?: string[];
	composedOf?: object;
	partials?: string[];
}
