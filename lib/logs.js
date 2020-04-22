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

import * as querystring from 'querystring';

import { EventEmitter } from 'events';
import * as ndjson from 'ndjson';
import { AbortController as AbortControllerPonyfill } from 'abortcontroller-polyfill/dist/cjs-ponyfill';
import { globalEnv } from './util/global-env';

const AbortController =
	'AbortController' in globalEnv
		? globalEnv.AbortController
		: AbortControllerPonyfill;

const getLogs = function (deps, opts) {
	const { request } = deps;

	const deviceModel = require('./models/device').default(deps, opts);

	const getLogsUrl = function (device, options) {
		const query = querystring.stringify(options);
		return `/device/v2/${device.uuid}/logs?${query}`;
	};

	const getLogsFromApi = function (device, options) {
		if (options == null) {
			options = {};
		}
		return request
			.send({
				url: getLogsUrl(device, options),
				baseUrl: opts.apiUrl,
			})
			.get('body');
	};

	const subscribeToApiLogs = function (device, options) {
		if (options == null) {
			options = {};
		}
		/** @type {any} */
		const emitter = new EventEmitter();
		const controller = new AbortController();
		const parser = ndjson();

		request
			.stream({
				url: getLogsUrl(device, Object.assign({}, options, { stream: 1 })),
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
		 *
		 * @example
		 * balena.logs.subscribe('7cf02a6', function(error, logs) {
		 * 	if (error) throw error;
		 *
		 * 	logs.on('line', function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 */
		subscribe(uuidOrId, options) {
			// TODO: We should consider making this a readable stream.

			return deviceModel
				.get(uuidOrId, { $select: 'uuid' })
				.then((device) => subscribeToApiLogs(device, options));
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
		 * balena.logs.history('7cf02a6', { count: 20 }, function(error, lines) {
		 * 	if (error) throw error;
		 *
		 * 	lines.forEach(function(line) {
		 * 		console.log(line);
		 * 	});
		 * });
		 */
		history(uuidOrId, options) {
			return deviceModel
				.get(uuidOrId, { $select: 'uuid' })
				.then((device) => getLogsFromApi(device, options));
		},
	};

	return exports;
};

export default getLogs;
