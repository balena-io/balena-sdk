import {
	balena,
	givenADevice,
	givenAnApplication,
	givenLoggedInUser,
	sdkOpts,
} from './setup';
import { delay, timeSuite, waitFor } from '../util';
import { expect } from 'chai';
import type * as BalenaSdk from '../..';

type LogMessage = Awaited<ReturnType<typeof balena.logs.history>>[number];

const sendLogMessages = (
	uuid: string,
	deviceApiKey: string,
	messages: Array<{
		message: string;
		timestamp?: number;
	}>,
) =>
	balena.request.send({
		method: 'POST',
		url: `/device/v2/${uuid}/logs`,
		baseUrl: sdkOpts.apiUrl,
		sendToken: false,
		headers: { Authorization: `Bearer ${deviceApiKey}` },
		body: messages,
	});

const LOG_PROPAGATION_TIMEOUT = 5000;

describe('Logs', function () {
	this.timeout(60_000);
	timeSuite(before);
	givenLoggedInUser(before);
	givenAnApplication(before);

	function givenSomeWithSomeDeviceogs(beforeFn: Mocha.HookFunction) {
		beforeFn(async function () {
			await sendLogMessages(this.device.uuid, this.deviceApiKey, [
				{
					message: 'Old message',
					timestamp: Date.now(),
				},
			]);
			await delay(1000);
			this.pastTimeStamp = Date.now();
			await delay(1000);
			await sendLogMessages(this.device.uuid, this.deviceApiKey, [
				{
					message: `Newer message`,
					timestamp: Date.now(),
				},
			]);
		});
	}

	describe('given a device with some logs', function () {
		givenADevice(before);
		givenSomeWithSomeDeviceogs(before);

		describe('balena.logs.history()', function () {
			it('should successfully load historical logs', async function () {
				let lines: LogMessage[] = [];
				// Wait for both logs to propagate
				await waitFor(
					async () => {
						lines = await balena.logs.history(this.device.uuid);
						return lines.length >= 2;
					},
					{ timeout: LOG_PROPAGATION_TIMEOUT, onTimeout: 'log' },
				);
				expect(lines.map((l) => l.message)).to.deep.equal([
					'Old message',
					'Newer message',
				]);
			});

			it('should limit logs by count', async function () {
				const lines = await balena.logs.history(this.device.uuid, { count: 1 });
				expect(lines.map((l) => l.message)).to.deep.equal(['Newer message']);
			});

			it('should limit logs by start using a timestamp', async function () {
				const lines = await balena.logs.history(this.device.uuid, {
					start: this.pastTimeStamp,
				});
				expect(lines.map((l) => l.message)).to.deep.equal(['Newer message']);
			});

			it('should limit logs by start using an ISO date string', async function () {
				const lines = await balena.logs.history(this.device.uuid, {
					start: new Date(this.pastTimeStamp).toISOString(),
				});
				expect(lines.map((l) => l.message)).to.deep.equal(['Newer message']);
			});
		});

		describe('balena.logs.subscribe()', function () {
			async function expectLogLinesAndUnsubscribe(
				logSubscription: BalenaSdk.LogsSubscription,
				messages: string[],
			) {
				const lines: LogMessage[] = [];
				try {
					// eslint-disable-next-line no-async-promise-executor
					await new Promise(async function (resolve, reject) {
						logSubscription.on('line', (line) => {
							lines.push(line);
						});
						logSubscription.on('error', reject);

						// Wait for the expected number of logs (or more) to propagate
						await waitFor(() => lines.length >= messages.length, {
							onTimeout: 'log',
						});
						resolve(null);
					});
				} finally {
					logSubscription.unsubscribe();
				}
				expect(lines.map((l) => l.message)).to.deep.equal(messages);
			}

			it('should not load historical logs by default', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid);
				await expectLogLinesAndUnsubscribe(logs, []);
			});

			it('should load historical logs if requested', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					count: 'all',
				});
				await expectLogLinesAndUnsubscribe(logs, [
					'Old message',
					'Newer message',
				]);
			});

			it('should limit historical logs by count', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					count: 1,
				});
				await expectLogLinesAndUnsubscribe(logs, ['Newer message']);
			});

			it('should limit historical logs by start using a timestamp', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					start: this.pastTimeStamp,
					count: 'all',
				});
				await expectLogLinesAndUnsubscribe(logs, ['Newer message']);
			});

			it('should limit historical logs by start using an ISO date string', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					start: new Date(this.pastTimeStamp).toISOString(),
					count: 'all',
				});
				await expectLogLinesAndUnsubscribe(logs, ['Newer message']);
			});

			it('should stream new logs after historical logs', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					count: 100,
				});

				const lines: LogMessage[] = [];
				try {
					await new Promise((resolve, reject) => {
						logs.on('line', (line) => {
							lines.push(line);
							if (lines.length === 2) {
								resolve(null);
							}
						});
						logs.on('error', reject);
					});
					await sendLogMessages(this.device.uuid, this.deviceApiKey, [
						{
							message: 'Newest message',
							timestamp: Date.now(),
						},
					]);

					// Wait for all three logs to propagate
					await waitFor(() => lines.length >= 3, {
						timeout: LOG_PROPAGATION_TIMEOUT,
						onTimeout: 'log',
					});
				} finally {
					logs.unsubscribe();
				}

				expect(lines.map((l) => l.message)).to.deep.equal([
					'Old message',
					'Newer message',
					'Newest message',
				]);
			});

			it('should allow unsubscribing from logs', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid);
				await delay(1000); // Make sure we're connected

				// Unsubscribe before any messages are sent
				logs.unsubscribe();

				const lines: LogMessage[] = [];
				// eslint-disable-next-line no-async-promise-executor
				await new Promise(async (resolve, reject) => {
					logs.on('line', (line) => lines.push(line));
					logs.on('error', reject);

					await sendLogMessages(this.device.uuid, this.deviceApiKey, [
						{
							message: 'Message sent after unsubscribing',
							timestamp: Date.now(),
						},
					]);
					await delay(LOG_PROPAGATION_TIMEOUT);
					resolve(null);
				});

				expect(lines).to.deep.equal([]);
			});
		});
	});
});
