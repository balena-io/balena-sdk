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
import * as errors from 'balena-errors';
import type { JSONSchema7 } from 'json-schema';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';
import type * as DeviceTypeJson from '../types/device-type-json';

export type { DeviceTypeJson };

export interface Config {
	deployment: string | null;
	deviceUrlsBase: string;
	adminUrl: string;
	gitServerUrl: string;
	ga?: GaConfig;
	mixpanelToken?: string;
	intercomAppId?: string;
	recurlyPublicKey?: string;
	stripePublicKey?: string;
	freezeBillingVersions?: string[];
	DEVICE_ONLINE_ICON: string;
	DEVICE_OFFLINE_ICON: string;
	signupCodeRequired: boolean;
	supportedSocialProviders: string[];
}

export type ConfigVarSchema = JSONSchema7 & {
	will_reboot?: boolean;
	warning?: string;
};

export interface ConfigVarDefinition {
	blackListedNames: string[];
	configVarSchema: ConfigVarSchema;
	invalidRegex: string;
	configVarInvalidRegex: string;
	reservedNames: string[];
	reservedNamespaces: string[];
	whiteListedNames: string[];
	whiteListedNamespaces: string[];
}

export interface GaConfig {
	site: string;
	id: string;
}

const getConfigModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { request } = deps;
	const { apiUrl } = opts;

	// TODO: Drop when `instructions` is no longer returned by the `/config` and `/device-types/v1` endpoints
	const normalizeDeviceTypes = (
		deviceTypes: Array<
			DeviceTypeJson.DeviceType & {
				instructions?: string[] | DeviceTypeJson.DeviceTypeInstructions;
			}
		>,
	): DeviceTypeJson.DeviceType[] =>
		deviceTypes.map(function (deviceType) {
			// Remove the device-type.json instructions to enforce
			// users to use the contract based ones.
			delete deviceType.instructions;
			return deviceType;
		});

	const exports = {
		/**
		 * @summary Get all configuration
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @fulfil {Object} - configuration
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getAll().then(function(config) {
		 * 	console.log(config);
		 * });
		 */
		getAll: async (): Promise<Config> => {
			const { body } = await request.send({
				method: 'GET',
				url: '/config',
				baseUrl: apiUrl,
				sendToken: false,
			});
			if ('deviceTypes' in body) {
				delete body.deviceTypes;
			}
			return body;
		},

		/**
		 * @summary Get device types
		 * @name getDeviceTypes
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @deprecated use balena.models.deviceType.getAll
		 * @fulfil {Object[]} - device types
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getDeviceTypes().then(function(deviceTypes) {
		 * 	console.log(deviceTypes);
		 * });
		 */
		getDeviceTypes: async (): Promise<DeviceTypeJson.DeviceType[]> => {
			const { body: deviceTypes } = await request.send({
				method: 'GET',
				url: '/device-types/v1',
				baseUrl: apiUrl,
			});
			if (deviceTypes == null) {
				throw new Error('No device types');
			}
			return normalizeDeviceTypes(deviceTypes);
		},

		/**
		 * @summary Get a device type manifest by slug
		 * @name getDeviceTypeManifestBySlug
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @deprecated use balena.models.deviceType.getBySlugOrName
		 * @param {String} slugOrName - device type slug
		 * @fulfil {Object} - device type manifest
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getDeviceTypeManifestBySlug('raspberry-pi').then(function(manifest) {
		 * 	console.log(manifest);
		 * });
		 */
		getDeviceTypeManifestBySlug: async (
			slugOrName: string,
		): Promise<DeviceTypeJson.DeviceType> => {
			const deviceTypes = await exports.getDeviceTypes();
			const deviceManifest = deviceTypes.find(
				(deviceType) =>
					deviceType.name === slugOrName ||
					deviceType.slug === slugOrName ||
					deviceType.aliases?.includes(slugOrName),
			);
			if (deviceManifest == null) {
				throw new errors.BalenaInvalidDeviceType(slugOrName);
			}
			return deviceManifest;
		},

		/**
		 * @summary Get configuration/initialization options for a device type
		 * @name getDeviceOptions
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @param {String} deviceType - device type slug
		 * @fulfil {Object[]} - configuration options
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getDeviceOptions('raspberry-pi').then(function(options) {
		 * 	console.log(options);
		 * });
		 */
		getDeviceOptions: async (
			deviceType: string,
		): Promise<
			Array<
				| DeviceTypeJson.DeviceTypeOptions
				| DeviceTypeJson.DeviceInitializationOptions
			>
		> => {
			const manifest = await exports.getDeviceTypeManifestBySlug(deviceType);
			return Array.from(
				new Set([
					...(manifest.options ?? []),
					...(manifest.initialization?.options ?? []),
				]),
			);
		},

		/**
		 * @summary Get configuration variables schema for a device type
		 * @name getConfigVarSchema
		 * @public
		 * @function
		 * @memberof balena.models.config
		 *
		 * @param {String} deviceType - device type slug
		 * @fulfil {Object[]} - configuration options
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.config.getConfigVarSchema('raspberry-pi').then(function(options) {
		 * 	console.log(options);
		 * });
		 */
		getConfigVarSchema: async (
			deviceType?: string,
		): Promise<ConfigVarDefinition> => {
			const { body } = await request.send({
				method: 'GET',
				url: `/config/vars${
					typeof deviceType === 'string' ? `?deviceType=${deviceType}` : ''
				}`,
				baseUrl: apiUrl,
				sendToken: typeof deviceType === 'string',
			});
			return body;
		},
	};

	return exports;
};

export default getConfigModel;
