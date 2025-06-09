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

import { EventEmitter } from 'events';
import { parse as ndjsonParse } from 'ndjson';
import { globalEnv } from './util/global-env';
import type { Device } from './types/models';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '.';

const AbortController: typeof window.AbortController =
	'AbortController' in globalEnv
		? globalEnv.AbortController
		: // eslint-disable-next-line @typescript-eslint/no-require-imports
			require('abortcontroller-polyfill/dist/cjs-ponyfill').AbortController;

export interface BaseLog {
	message: string;
	createdAt: number;
	timestamp: number;
	isStdErr: boolean;
}

export interface ServiceLog extends BaseLog {
	isSystem: false;
	serviceId: number;
}

export interface SystemLog extends BaseLog {
	isSystem: true;
}

export type LogMessage = ServiceLog | SystemLog;

export interface LogsSubscription extends EventEmitter {
	unsubscribe(): void;
}

export interface LogsOptions {
	start?: number | string;
	count?: number | 'all';
}

const getLogs = function (
	{
		request,
		// Do not destructure sub-modules, to allow lazy loading only when needed.
		sdkInstance,
	}: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const getLogsFromApi = async function (
		device: Device['Read'],
		options?: LogsOptions,
	) {
		const { body } = await request.send({
			url: `/device/v2/${device.uuid}/logs`,
			qs: options ?? {},
			baseUrl: opts.apiUrl,
		});
		return body;
	};

	const subscribeToApiLogs = function (
		device: Device['Read'],
		options?: LogsOptions,
	): LogsSubscription {
		options ??= {};
		const emitter = new EventEmitter() as LogsSubscription;
		const controller = new AbortController();
		const parser = ndjsonParse({ strict: opts.debug === true });

		request
			.stream({
				url: `/device/v2/${device.uuid}/logs`,
				qs: {
					...options,
					stream: 1,
				},
				baseUrl: opts.apiUrl,
				signal: controller.signal,
			})
			.then(function (stream) {
				// Forward request errors to the parser
				stream.on('error', (e) => {
					parser.emit('error', e);
				});

				parser.on('data', function (log) {
					if (!controller.signal.aborted) {
						emitter.emit('line', log);
					}
				});

				parser.on('error', function (err) {
					if (!controller.signal.aborted) {
						emitter.emit('error', err);
					}
				});

				return stream.pipe(parser);
			})
			.catch(function (e) {
				// Forward request setup errors
				if (!controller.signal.aborted) {
					emitter.emit('error', e);
				}
			});

		emitter.unsubscribe = function () {
			controller.abort();
			parser.destroy();
		};

		return emitter;
	};

	const exports = {
		/**
		 * @typedef LogSubscription
		 * @type {EventEmitter}
		 * @memberof balena.logs
		 *
		 * @description
		 * The log subscription emits events as log data arrives.
		 * You can get a LogSubscription for a given device by calling `balena.logs.subscribe(deviceId)`
		 */

		/**
		 * @summary Unsubscribe from device logs
		 * @name unsubscribe
		 * @function
		 * @public
		 * @memberof balena.logs.LogSubscription
		 *
		 * @description
		 * Disconnect from the logs feed and stop receiving any future events on this emitter.
		 *
		 * @example
		 * logs.unsubscribe();
		 */

		/**
		 * @summary Event fired when a new line of log output is available
		 * @event line
		 * @memberof balena.logs.LogSubscription
		 * @example
		 * logs.on('line', function(line) {
		 * 	console.log(line);
		 * });
		 */

		/**
		 * @summary Event fired when an error has occured reading the device logs
		 * @event error
		 * @memberof balena.logs.LogSubscription
		 * @example
		 * logs.on('error', function(error) {
		 * 	console.error(error);
		 * });
		 */

		/**
		 * @summary Subscribe to device logs
		 * @name subscribe
		 * @function
		 * @public
		 * @memberof balena.logs
		 *
		 * @description
		 * Connects to the stream of devices logs, returning a LogSubscription, which
		 * can be used to listen for logs as they appear, line by line.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options] - options
		 * @param {Number|'all'} [options.count=0] - number of historical messages to include (or 'all')
		 * @param {Number|String} [options.start] - the timestamp or ISO Date string after which to retrieve historical messages. When specified, the count parameter needs to also be provided.
		 * @fulfil {balena.logs.LogSubscription}
		 * @returns {Promise<LogSubscription>}
		 *
		 * @example
		 * balena.logs.subscribe('7cf02a6').then(function(logs) {
		 * 	logs.on('line', function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.logs.subscribe(123).then(function(logs) {
		 * 	logs.on('line', function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 */
		async subscribe(
			uuidOrId: string | number,
			options?: Pick<LogsOptions, 'count'> | Required<LogsOptions>,
		): Promise<LogsSubscription> {
			// TODO: We should consider making this a readable stream.
			if (
				options != null &&
				'start' in options &&
				options.start != null &&
				options.count == null
			) {
				throw new Error(
					'The count parameter is required when specifying the start parameter',
				);
			}

			const device = await sdkInstance.models.device.get(uuidOrId, {
				$select: 'uuid',
			});
			return subscribeToApiLogs(device, options);
		},

		/**
		 * @summary Get device logs history
		 * @name history
		 * @function
		 * @public
		 * @memberof balena.logs
		 *
		 * @description
		 * Get an array of the latest log messages for a given device.
		 *
		 * @param {String|Number} uuidOrId - device uuid (string) or id (number)
		 * @param {Object} [options] - options
		 * @param {Number|'all'} [options.count=1000] - number of log messages to return (or 'all')
		 * @param {Number|String} [options.start] - the timestamp or ISO Date string after which to retrieve historical messages
		 * @fulfil {Object[]} - history lines
		 * @returns {Promise}
		 *
		 * @example
		 * balena.logs.history('7cf02a6').then(function(lines) {
		 * 	lines.forEach(function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 *
		 * @example
		 * balena.logs.history(123).then(function(lines) {
		 * 	lines.forEach(function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 *
		 * @example
		 * const oneDayAgoTimestamp = Date.now() - 24*60*60*1000;
		 * balena.logs.history('7cf02a6', { start: oneDayAgoTimestamp }).then(function(lines) {
		 * 	lines.forEach(function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 *
		 * @example
		 * const oneDayAgoIsoDateString = new Date(Date.now() - 24*60*60*1000).toISOString();
		 * balena.logs.history('7cf02a6', { start: oneDayAgoIsoDateString }).then(function(lines) {
		 * 	lines.forEach(function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 */
		async history(
			uuidOrId: string | number,
			options?: LogsOptions,
		): Promise<LogMessage[]> {
			const device = await sdkInstance.models.device.get(uuidOrId, {
				$select: 'uuid',
			});
			return await getLogsFromApi(device, options);
		},
	};

	return exports;
};

export default getLogs;
