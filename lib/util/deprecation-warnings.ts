import { stripIndent } from 'common-tags';
import * as _ from 'lodash';

export = _.mapValues(
	{
		resinRenameDeprecation: () =>
			console.error(stripIndent`
				Warning: 'resin-sdk' is now 'balena-sdk'.
				Please update your dependencies to continue receiving new updates.
			`),
	},
	_.once,
);
