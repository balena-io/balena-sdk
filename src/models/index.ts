import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';

/*
Copyright 2016 Balena

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* eslint-disable @typescript-eslint/no-require-imports */
const modelsTemplate = {
	/**
	 * @namespace application
	 * @memberof balena.models
	 */
	application: () =>
		(require('./application') as typeof import('./application')).default,

	/**
	 * @namespace device
	 * @memberof balena.models
	 */
	device: () => (require('./device') as typeof import('./device')).default,

	/**
	 * @namespace deviceType
	 * @memberof balena.models
	 */
	deviceType: () =>
		(require('./device-type') as typeof import('./device-type')).default,

	/**
	 * @namespace apiKey
	 * @memberof balena.models
	 */
	apiKey: () => (require('./api-key') as typeof import('./api-key')).default,

	/**
	 * @namespace key
	 * @memberof balena.models
	 */
	key: () => (require('./key') as typeof import('./key')).default,

	/**
	 * @namespace organization
	 * @memberof balena.models
	 */
	organization: () =>
		(require('./organization') as typeof import('./organization')).default,

	/**
	 * @namespace team
	 * @memberof balena.models
	 */
	team: () => (require('./team') as typeof import('./team')).default,

	/**
	 * @namespace os
	 * @memberof balena.models
	 */
	os: () => (require('./os') as typeof import('./os')).default,

	/**
	 * @namespace config
	 * @memberof balena.models
	 */
	config: () => (require('./config') as typeof import('./config')).default,

	/**
	 * @namespace release
	 * @memberof balena.models
	 */
	release: () => (require('./release') as typeof import('./release')).default,

	/**
	 * @namespace service
	 * @memberof balena.models
	 */
	service: () => (require('./service') as typeof import('./service')).default,

	/**
	 * @namespace image
	 * @memberof balena.models
	 */
	image: () => (require('./image') as typeof import('./image')).default,

	/**
	 * @namespace creditBundle
	 * @memberof balena.models
	 */
	creditBundle: () =>
		(require('./credit-bundle') as typeof import('./credit-bundle')).default,

	/**
	 * @namespace billing
	 * @memberof balena.models
	 * @description **Note!** The billing methods are available on Balena.io exclusively.
	 */
	billing: () => (require('./billing') as typeof import('./billing')).default,
};
/* eslint-enable @typescript-eslint/no-require-imports */

export = (deps: InjectedDependenciesParam, opts: InjectedOptionsParam) => {
	const models = {} as {
		[key in keyof typeof modelsTemplate]: ReturnType<
			ReturnType<(typeof modelsTemplate)[key]>
		>;
	};

	(Object.keys(modelsTemplate) as Array<keyof typeof modelsTemplate>).forEach(
		(moduleName) => {
			Object.defineProperty(models, moduleName, {
				enumerable: true,
				configurable: true,
				get() {
					const moduleFactory = modelsTemplate[moduleName]();
					// We need the delete first as the current property is read-only
					// and the delete removes that restriction
					delete this[moduleName];
					return (this[moduleName] = moduleFactory(deps, opts));
				},
			});
		},
	);

	return models;
};
