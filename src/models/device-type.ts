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

import type { InjectedDependenciesParam } from '..';
import type { DeviceType } from '../types/models';
import type { Partials, Contract } from '../types/contract';
import { mergePineOptions } from '../util';
import * as errors from 'balena-errors';
import * as Handlebars from 'handlebars';
import cloneDeep from 'lodash/cloneDeep';

// REPLACE ONCE HOST OS CONTRACTS ARE GENERATED THROUGH YOCTO
import {
	aliases as contractAliases,
	BalenaOS as BalenaOsContract,
} from './balenaos-contract';
import type {
	ODataOptionsWithoutCount,
	OptionsToResponse,
} from 'pinejs-client-core';

const handlebarsRuntimeOptions = {
	helpers: {
		resolveContractAlias: (slug: string) => contractAliases[slug] ?? slug,
	},
};

const traversingCompile = (
	partials: Partials,
	initial: Contract,
	path: string[],
): Contract => {
	let interpolated: Contract = { ...initial };
	for (const partialKey of Object.keys(partials)) {
		const current = partials[partialKey];
		if (Array.isArray(current)) {
			let location: any = interpolated;
			for (const key of path) {
				location = location[key];
			}
			// if array of partials, compile the template
			location[partialKey] = current
				.flatMap((partial) =>
					Handlebars.compile(partial)(
						interpolated,
						handlebarsRuntimeOptions,
					).split(`\n`),
				)
				.map((n) => n.trim())
				.filter((n) => n);
		} else {
			// if it's another dictionary, keep traversing
			interpolated = traversingCompile(
				current,
				interpolated,
				path.concat([partialKey]),
			);
		}
	}
	return interpolated;
};

const interpolatedPartials = (contract: Contract): Contract => {
	if (contract.partials) {
		return traversingCompile(contract.partials, contract, ['partials']);
	} else {
		return contract;
	}
};

const calculateInstallMethod = (contract: Contract): string => {
	const flashProtocol = contract.data?.flashProtocol;
	const defaultBoot = contract.data?.media?.defaultBoot;
	if (flashProtocol) {
		if (flashProtocol === 'RPIBOOT') {
			return 'internalFlash';
		} else {
			return flashProtocol;
		}
	} else if (defaultBoot) {
		if (defaultBoot === 'image') {
			return 'image';
		} else if (defaultBoot === 'internal') {
			return 'externalFlash';
		} else {
			return 'externalBoot';
		}
	} else {
		throw new errors.BalenaError(
			`Unable to determine installation method for contract: ${contract.slug}`,
		);
	}
};

function getInstructionsFromContract(contract: Contract) {
	const installMethod = calculateInstallMethod(contract);
	const interpolatedDeviceType = {
		deviceType: interpolatedPartials(contract),
	};
	const interpolatedHostOS = interpolatedPartials({
		...cloneDeep(BalenaOsContract),
		...interpolatedDeviceType,
	});

	return interpolatedHostOS.partials?.[installMethod] as
		| Record<'Linux' | 'MacOS' | 'Windows', string[]>
		| string[]
		| undefined;
}

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
		 * @param {String|Number} idOrSlug - device type slug (string) or alias (string) or id
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
		 * balena.models.deviceType.get('raspberrypi').then(function(deviceType) {
		 * 	console.log('resolved alias:', deviceType);
		 * });
		 */
		async get<T extends ODataOptionsWithoutCount<DeviceType['Read']>>(
			idOrSlug: number | string,
			options?: T,
		) {
			if (idOrSlug == null) {
				throw new errors.BalenaInvalidDeviceType(idOrSlug);
			}

			let deviceType:
				| OptionsToResponse<DeviceType['Read'], T, undefined>[number]
				| undefined;
			if (typeof idOrSlug === 'string') {
				deviceType = (
					await exports.getAll(
						mergePineOptions(
							{
								$top: 1,
								$filter: {
									device_type_alias: {
										$any: {
											$alias: 'dta',
											$expr: {
												dta: {
													is_referenced_by__alias: idOrSlug,
												},
											},
										},
									},
								},
							},
							options,
						) as T,
					)
				)[0];
			} else {
				deviceType = await pine.get({
					resource: 'device_type',
					id: idOrSlug,
					options,
				});
			}

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
		 */
		async getAll<T extends ODataOptionsWithoutCount<DeviceType['Read']>>(
			options?: T,
		) {
			return await pine.get({
				resource: 'device_type',
				options: mergePineOptions({ $orderby: { name: 'asc' } }, options) as T,
			});
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
		 */
		async getAllSupported<
			T extends ODataOptionsWithoutCount<DeviceType['Read']>,
		>(options?: T) {
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
											owns__release: {
												$any: {
													$alias: 'r',
													$expr: {
														r: {
															status: 'success',
															is_final: true,
															is_invalidated: false,
														},
													},
												},
											},
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
		 * @fulfil {Object} - device type
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getBySlugOrName('raspberry-pi').then(function(deviceType) {
		 * 	console.log(deviceType);
		 * });
		 */
		getBySlugOrName: async <
			T extends ODataOptionsWithoutCount<DeviceType['Read']>,
		>(
			slugOrName: string,
			options?: T,
		) => {
			const [deviceType] = await exports.getAll(
				mergePineOptions(
					{
						$top: 1,
						$filter: { $or: { name: slugOrName, slug: slugOrName } },
					},
					options,
				) as T,
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
		 */
		getSlugByName: async (deviceTypeName: string): Promise<string> => {
			return (
				await exports.getBySlugOrName(deviceTypeName, { $select: 'slug' })
			).slug;
		},

		/**
		 * @summary Get a contract with resolved partial templates
		 * @name getInterpolatedPartials
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @fulfil {Contract} - device type contract with resolved partials
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getInterpolatedPartials('raspberry-pi').then(function(contract) {
		 *  for (const partial in contract.partials) {
		 *  	console.log(`${partial}: ${contract.partials[partial]}`);
		 *  }
		 * 	// bootDevice: ["Connect power to the Raspberry Pi (v1 / Zero / Zero W)"]
		 * });
		 */
		getInterpolatedPartials: async (
			deviceTypeSlug: string,
		): Promise<Contract> => {
			const { contract } = await exports.getBySlugOrName(deviceTypeSlug, {
				$select: 'contract',
			});
			if (!contract) {
				throw new Error(
					`Could not find contract for device type ${deviceTypeSlug}`,
				);
			}
			// @ts-expect-error - parsed contract will be a Contract
			const $contract = contract as Contract;
			return interpolatedPartials($contract);
		},

		/**
		 * @summary Get instructions for installing a host OS on a given device type
		 * @name getInstructions
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String|Object} deviceTypeSlugOrContract - device type slug or contract
		 * @fulfil {Object | String[]} - step by step instructions for installing the host OS to the device
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getInstructions('raspberry-pi').then(function(instructions) {
		 *  for (let instruction of instructions.values()) {
		 * 	 console.log(instruction);
		 *  }
		 *  // Insert the sdcard to the host machine.
		 *  // Write the BalenaOS file you downloaded to the sdcard. We recommend using <a href="https://etcher.balena.io/">Etcher</a>.
		 *  // Wait for writing of BalenaOS to complete.
		 *  // Remove the sdcard from the host machine.
		 *  // Insert the freshly flashed sdcard into the Raspberry Pi (v1 / Zero / Zero W).
		 *  // Connect power to the Raspberry Pi (v1 / Zero / Zero W) to boot the device.
		 * });
		 */
		getInstructions: async (
			deviceTypeSlugOrContract: string | Contract,
		): Promise<Record<'Linux' | 'MacOS' | 'Windows', string[]> | string[]> => {
			let contract: Contract | null;
			if (typeof deviceTypeSlugOrContract === 'string') {
				const { contract: $contract } = await exports.getBySlugOrName(
					deviceTypeSlugOrContract,
					{
						$select: 'contract',
					},
				);

				// @ts-expect-error - parsed contract will be a Contract
				contract = $contract as Contract;

				if (!contract?.partials) {
					throw new Error(
						`Instruction partials not defined for ${deviceTypeSlugOrContract}`,
					);
				}
			} else {
				contract = deviceTypeSlugOrContract;
			}
			return getInstructionsFromContract(contract)!;
		},

		/**
		 * @summary Get installation method on a given device type
		 * @name getInstallMethod
		 * @public
		 * @function
		 * @memberof balena.models.deviceType
		 *
		 * @param {String} deviceTypeSlug - device type slug
		 * @fulfil {String} - the installation method supported for the given device type slug
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.deviceType.getInstallMethod('raspberry-pi').then(function(method) {
		 * 	console.log(method);
		 *  // externalBoot
		 * });
		 */
		getInstallMethod: async (
			deviceTypeSlug: string,
		): Promise<string | null> => {
			const { contract: $contract } = await exports.getBySlugOrName(
				deviceTypeSlug,
				{
					$select: 'contract',
				},
			);
			if ($contract) {
				// @ts-expect-error - parsed contract will be a Contract
				const contract = $contract as Contract;
				return calculateInstallMethod(contract);
			} else {
				return null;
			}
		},
	};

	return exports;
};

export { getDeviceTypeModel as default };
