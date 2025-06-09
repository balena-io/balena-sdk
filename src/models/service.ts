/*
Copyright 2018 Balena

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

import * as errors from 'balena-errors';
import type { InjectedDependenciesParam } from '..';
import type { Service, ServiceEnvironmentVariable } from '../types/models';
import { mergePineOptions } from '../util';
import type { ODataOptionsWithoutCount } from 'pinejs-client-core';

const getServiceModel = ({
	pine,
	// Do not destructure sub-modules, to allow lazy loading only when needed.
	sdkInstance,
}: InjectedDependenciesParam) => {
	const { buildDependentResource } =
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');

	const varModel = buildDependentResource(
		{ pine },
		{
			resourceName: 'service_environment_variable',
			resourceKeyField: 'name',
			parentResourceName: 'service',
			async getResourceId(id) {
				if (id != null && typeof id === 'object') {
					if (
						Object.keys(id).length !== 2 ||
						!('application' in id) ||
						!('service_name' in id)
					) {
						throw new Error(
							`Unexpected type for id provided in service varModel getResourceId: ${typeof id}`,
						);
					}
					const alternateServiceKey = id as {
						application: number | string;
						service_name: string;
					};

					const [service] = await getAllByApplication(
						alternateServiceKey.application,
						{
							$select: 'id',
							$filter: {
								service_name: alternateServiceKey.service_name,
							},
						},
					);
					if (service == null) {
						throw new errors.BalenaServiceNotFound(
							alternateServiceKey.service_name,
						);
					}
					return service.id;
				}
				if (typeof id !== 'number') {
					throw new Error(
						`Unexpected type for id provided in service varModel getResourceId: ${typeof id}`,
					);
				}
				return (await get(id, { $select: 'id' })).id;
			},
		},
	);

	// Not exported for now, but we could document & export it in the future
	// if there are external use cases for this.
	const get = async (
		id: number,
		options: ODataOptionsWithoutCount<Service['Read']> = {},
	) => {
		const service = await pine.get({
			resource: 'service',
			id,
			options,
		});
		if (service == null) {
			throw new errors.BalenaServiceNotFound(id);
		}
		return service;
	};

	async function getAllByApplication(
		slugOrUuidOrId: string | number,
		options: ODataOptionsWithoutCount<Service['Read']> = {},
	): Promise<Array<Service['Read']>> {
		const { service } = await sdkInstance.models.application.get(
			slugOrUuidOrId,
			{
				$select: 'id',
				$expand: {
					service: options,
				},
			},
		);
		return service!;
	}

	const exports = {
		/**
		 * @summary Get all services from an application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.service
		 *
		 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - services
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.service.getAllByApplication('myorganization/myapp').then(function(services) {
		 * 	console.log(services);
		 * });
		 *
		 * @example
		 * balena.models.service.getAllByApplication(123).then(function(services) {
		 * 	console.log(services);
		 * });
		 */
		getAllByApplication,

		/**
		 * @namespace balena.models.service.var
		 * @memberof balena.models.service
		 */
		var: {
			/**
			 * @summary Get all variables for a service
			 * @name getAllByService
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number|Object} serviceIdOrNaturalKey - service id (number) or appliation-service_name pair
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.getAllByService(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.service.var.getAllByService({ application: 'myorganization/myapp', service_name: 'myservice' }).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			getAllByService: varModel.getAllByParent,

			/**
			 * @summary Get all service variables by application
			 * @name getAllByApplication
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {String|Number} slugOrUuidOrId - application slug (string), uuid (string) or id (number)
			 * @param {Object} [options={}] - extra pine options to use
			 * @fulfil {Object[]} - service variables
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.getAllByApplication('myorganization/myapp').then(function(vars) {
			 * 	console.log(vars);
			 * });
			 *
			 * @example
			 * balena.models.service.var.getAllByApplication(999999).then(function(vars) {
			 * 	console.log(vars);
			 * });
			 */
			async getAllByApplication(
				slugOrUuidOrId: string | number,
				options: ODataOptionsWithoutCount<
					ServiceEnvironmentVariable['Read']
				> = {},
			): Promise<Array<ServiceEnvironmentVariable['Read']>> {
				const { id } = await sdkInstance.models.application.get(
					slugOrUuidOrId,
					{
						$select: 'id',
					},
				);
				return varModel.getAll(
					mergePineOptions(
						{
							$filter: {
								service: {
									$any: {
										$alias: 's',
										$expr: {
											s: {
												application: id,
											},
										},
									},
								},
							},
							$orderby: { name: 'asc' },
						},
						options,
					),
				);
			},

			/**
			 * @summary Get the value of a specific service variable
			 * @name get
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number|Object} serviceIdOrNaturalKey - service id (number) or appliation-service_name pair
			 * @param {String} key - variable name
			 * @fulfil {String|undefined} - the variable value (or undefined)
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.get(999999, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 *
			 * @example
			 * balena.models.service.var.get({ application: 'myorganization/myapp', service_name: 'myservice' }, 'VAR').then(function(value) {
			 * 	console.log(value);
			 * });
			 */
			get: varModel.get,

			/**
			 * @summary Set the value of a specific service variable
			 * @name set
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number|Object} serviceIdOrNaturalKey - service id (number) or appliation-service_name pair
			 * @param {String} key - variable name
			 * @param {String} value - variable value
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.set(999999, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.service.var.set({ application: 'myorganization/myapp', service_name: 'myservice' }, 'VAR', 'newvalue').then(function() {
			 * 	...
			 * });
			 */
			set: varModel.set,

			/**
			 * @summary Clear the value of a specific service variable
			 * @name remove
			 * @public
			 * @function
			 * @memberof balena.models.service.var
			 *
			 * @param {Number|Object} serviceIdOrNaturalKey - service id (number) or appliation-service_name pair
			 * @param {String} key - variable name
			 * @returns {Promise}
			 *
			 * @example
			 * balena.models.service.var.remove(999999, 'VAR').then(function() {
			 * 	...
			 * });
			 *
			 * @example
			 * balena.models.service.var.remove({ application: 'myorganization/myapp', service_name: 'myservice' }, 'VAR').then(function() {
			 * 	...
			 * });
			 */
			remove: varModel.remove,
		},
	};

	return exports;
};

export default getServiceModel;
