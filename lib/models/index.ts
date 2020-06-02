import { InjectedDependenciesParam, InjectedOptionsParam } from '..';

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

const modelsTemplate = {
	/**
	 * @namespace application
	 * @memberof balena.models
	 */
	application: () => require('./application').default,

	/**
	 * @namespace device
	 * @memberof balena.models
	 */
	device: () => require('./device').default,

	/**
	 * @namespace apiKey
	 * @memberof balena.models
	 */
	apiKey: () => require('./api-key').default,

	/**
	 * @namespace key
	 * @memberof balena.models
	 */
	key: () => require('./key').default,

	/**
	 * @namespace organization
	 * @memberof balena.models
	 */
	organization: () => require('./organization').default,

	/**
	 * @namespace os
	 * @memberof balena.models
	 */
	os: () => require('./os').default,

	/**
	 * @namespace config
	 * @memberof balena.models
	 */
	config: () => require('./config').default,

	/**
	 * @namespace release
	 * @memberof balena.models
	 */
	release: () => require('./release').default,

	/**
	 * @namespace service
	 * @memberof balena.models
	 */
	service: () => require('./service').default,

	/**
	 * @namespace image
	 * @memberof balena.models
	 */
	image: () => require('./image').default,

	/**
	 * @namespace billing
	 * @memberof balena.models
	 * @description **Note!** The billing methods are available on Balena.io exclusively.
	 */
	billing: () => require('./billing').default,
};

export = (deps: InjectedDependenciesParam, opts: InjectedOptionsParam) => {
	const models = {};

	(Object.keys(modelsTemplate) as Array<keyof typeof modelsTemplate>).forEach(
		(moduleName) => {
			Object.defineProperty(models, moduleName, {
				enumerable: true,
				configurable: true,
				get() {
					const { addCallbackSupportToModule } = require('../util/callbacks');
					const moduleFactory = modelsTemplate[moduleName]();
					// We need the delete first as the current property is read-only
					// and the delete removes that restriction
					delete this[moduleName];
					return (this[moduleName] = addCallbackSupportToModule(
						moduleFactory(deps, opts),
					));
				},
			});
		},
	);

	return models;
};
