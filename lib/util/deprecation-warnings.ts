import { stripIndent } from 'common-tags';
import * as _ from 'lodash';

export = _.mapValues(
	{
		pubNubDeprecated: () =>
			console.error(stripIndent`
				Warning: using legacy logging services, this will stop working shortly.
				Please update to ensure logs are correctly retrieved in future.
			`),
	},
	_.once,
);
