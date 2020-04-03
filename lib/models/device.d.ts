import * as Bluebird from 'bluebird';
import { Dictionary } from '../../typings/utils';

export default function(
	deps: any,
	opts: any,
): {
	get: (uuidOrId: number | string, options: Dictionary<any>) => Bluebird<any>;
};
