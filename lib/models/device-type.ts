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

import type { InjectedDependenciesParam, PineOptions } from '..';
import { DeviceType } from '../types/models';
import { mergePineOptions } from '../util';
import * as errors from 'balena-errors';

const getDeviceTypeModel = function (deps: InjectedDependenciesParam) {
	const { pine } = deps;

	const exports = {
		/**
		 * @summary Get a single deviceType
		 * @name get
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String|Number} idOrSlug - device type slug (string) or id
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns a single device type.
		 *
		 * @example
		 * balena.models.deviceType.get('raspberry-pi').then(function(deviceType) {
		 * 	console.log(deviceType);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.get('raspberry-pi', function(error, deviceType) {
		 * 	if (error) throw error;
		 * 	console.log(deviceType);
		 * });
		 */
		async get(
			idOrSlug: number | string,
			options?: PineOptions<DeviceType>,
		): Promise<DeviceType> {
			if (options == null) {
				options = {};
			}

			if (idOrSlug == null) {
				throw new errors.BalenaInvalidDeviceType(idOrSlug);
			}

			const deviceType = await pine.get({
				resource: 'device_type',
				id: typeof idOrSlug === 'string' ? { slug: idOrSlug } : idOrSlug,
				options,
			});

			if (deviceType == null) {
				throw new errors.BalenaInvalidDeviceType(idOrSlug.toString());
			}

			return deviceType;
		},
		/**
		 * @summary Get all deviceTypes
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all device types.
		 *
		 * @example
		 * balena.models.deviceType.getAll().then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getAll({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * })
		 *
		 * @example
		 * balena.models.deviceType.getAll(function(error, deviceTypes) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypes);
		 * });
		 */
		async getAll(options?: PineOptions<DeviceType>): Promise<DeviceType[]> {
			if (options == null) {
				options = {};
			}

			const deviceTypes = await pine.get({
				resource: 'device_type',
				options: mergePineOptions({ $orderby: 'name asc' }, options),
			});

			return deviceTypes;
		},

		/**
		 * @summary Get all supported deviceTypes
		 * @name getAllSupported
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @description
		 * This method returns all supported device types.
		 *
		 * @example
		 * balena.models.deviceType.getAllSupported().then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getAllSupported({ $select: ['name', 'slug'] }).then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * })
		 *
		 * @example
		 * balena.models.deviceType.getAllSupported(function(error, deviceTypes) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypes);
		 * });
		 */
		async getAllSupported(
			options?: PineOptions<DeviceType>,
		): Promise<DeviceType[]> {
			if (options == null) {
				options = {};
			}

			const deviceTypes = await exports.getAll(
				mergePineOptions(
					{
						$filter: {
							is_default_for__application: {
								$any: {
									$alias: 'idfa',
									$expr: {
										idfa: {
											is_host: true,
											is_archived: false,
										},
									},
								},
							},
						},
					},
					options,
				),
			);

			return deviceTypes;
		},

		/**
		 * @summary Get a deviceType by slug or name
		 * @name getBySlugOrName
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} slugOrName - deviceType slug
		 * @fulfil {Object} - device manifest
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getBySlugOrName('raspberry-pi').then(function(manifest) {
		 * 	console.log(manifest);
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getBySlugOrName('raspberry-pi', function(error, manifest) {
		 * 	if (error) throw error;
		 * 	console.log(manifest);
		 * });
		 */
		getBySlugOrName: async (
			slugOrName: string,
			options?: PineOptions<DeviceType>,
		): Promise<DeviceType> => {
			if (options == null) {
				options = {};
			}
			const [deviceType] = await exports.getAll(
				mergePineOptions(
					{
						$top: 1,
						$filter: { $or: { name: slugOrName, slug: slugOrName } },
					},
					options,
				),
			);
			if (deviceType == null) {
				throw new errors.BalenaInvalidDeviceType(slugOrName);
			}
			return deviceType;
		},

		/**
		 * @summary Get display name for a device
		 * @name getName
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @fulfil {String} - device display name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getName('raspberry-pi').then(function(deviceTypeName) {
		 * 	console.log(deviceTypeName);
		 * 	// Raspberry Pi
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getName('raspberry-pi', function(error, deviceTypeName) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypeName);
		 * 	// Raspberry Pi
		 * });
		 */
		getName: async (deviceTypeSlug: string): Promise<string> => {
			return (
				await exports.getBySlugOrName(deviceTypeSlug, { $select: 'name' })
			).name;
		},

		/**
		 * @summary Get device slug
		 * @name getSlugByName
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeName - device type name
		 * @fulfil {String} - device slug name
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getSlugByName('Raspberry Pi').then(function(deviceTypeSlug) {
		 * 	console.log(deviceTypeSlug);
		 * 	// raspberry-pi
		 * });
		 *
		 * @example
		 * balena.models.deviceType.getSlugByName('Raspberry Pi', function(error, deviceTypeSlug) {
		 * 	if (error) throw error;
		 * 	console.log(deviceTypeSlug);
		 * 	// raspberry-pi
		 * });
		 */
		getSlugByName: async (deviceTypeName: string): Promise<string> => {
			return (
				await exports.getBySlugOrName(deviceTypeName, { $select: 'slug' })
			).slug;
		},
	};

	return exports;
};

export { getDeviceTypeModel as default };
