import type { InjectedDependenciesParam, InjectedOptionsParam } from '../';

export const loadSettingsClient = (opts: InjectedOptionsParam) => {
	// Even though we specify an alternative file for this in the package.json's `browser` field
	// we still need to handle the `isBrowser` case in the default file for the case that the
	// bundler doesn't support/use the `browser` field.
	/* eslint-disable @typescript-eslint/no-require-imports */
	if (opts.isBrowser) {
		return (
			require('./settings-client.browser') as typeof import('./settings-client.browser')
		).loadSettingsClient();
	}
	return require('balena-settings-client') as typeof import('balena-settings-client') as InjectedDependenciesParam['settings'];
	/* eslint-enable @typescript-eslint/no-require-imports */
};
