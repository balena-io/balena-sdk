import type { AnyObject } from '../../typings/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- This interface is intentionally empty to allow recursive type definitions
export interface Partials extends Record<string, string[] | Partials> {}

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
	requires?: Contract[];
	provides?: Contract[];
	composedOf?: AnyObject;
	partials?: Partials;
}
