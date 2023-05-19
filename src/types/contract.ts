import { AnyObject, Dictionary } from '../../typings/utils';

export type Partials = Dictionary<string[] | Partials>;

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
	data?: AnyObject;
	assets?: AnyObject;
	requires?: string[];
	provides?: string[];
	composedOf?: AnyObject;
	partials?: Partials;
}
