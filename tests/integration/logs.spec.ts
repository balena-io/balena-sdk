import {
	balena,
	givenADevice,
	givenAnApplication,
	givenLoggedInUser,
	sdkOpts,
} from './setup';
import { delay, timeSuite } from '../util';
import { expect } from 'chai';

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

describe('Logs', function () {
	this.timeout(20_000);
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
			await delay(2000);
		});
	}

	describe('given a device with some logs', function () {
		givenADevice(before);
		givenSomeWithSomeDeviceogs(before);

		describe('balena.logs.history()', function () {
			it('should successfully load historical logs', async function () {
				const lines = await balena.logs.history(this.device.uuid);
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
			const LOG_SUBSCRIPTION_TIMEOUT = 5000;

			async function getLogLinesAndUnsubscribe(logs) {
				const lines: LogMessage[] = [];
				try {
					// eslint-disable-next-line no-async-promise-executor
					await new Promise(async function (resolve, reject) {
						logs.on('line', (line) => lines.push(line));
						logs.on('error', reject);

						await delay(LOG_SUBSCRIPTION_TIMEOUT);
						resolve(null);
					});
				} finally {
					logs.unsubscribe();
				}
				return lines;
			}

			it('should not load historical logs by default', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid);
				expect(await getLogLinesAndUnsubscribe(logs)).to.deep.equal([]);
			});

			it('should load historical logs if requested', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					count: 'all',
				});
				expect(
					(await getLogLinesAndUnsubscribe(logs)).map((l) => l.message),
				).to.deep.equal(['Old message', 'Newer message']);
			});

			it('should limit historical logs by count', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					count: 1,
				});
				expect(
					(await getLogLinesAndUnsubscribe(logs)).map((l) => l.message),
				).to.deep.equal(['Newer message']);
			});

			it('should limit historical logs by start using a timestamp', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					start: this.pastTimeStamp,
					count: 'all',
				});
				expect(
					(await getLogLinesAndUnsubscribe(logs)).map((l) => l.message),
				).to.deep.equal(['Newer message']);
			});

			it('should limit historical logs by start using an ISO date string', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					start: new Date(this.pastTimeStamp).toISOString(),
					count: 'all',
				});
				expect(
					(await getLogLinesAndUnsubscribe(logs)).map((l) => l.message),
				).to.deep.equal(['Newer message']);
			});

			it('should stream new logs after historical logs', async function () {
				const logs = await balena.logs.subscribe(this.device.uuid, {
					count: 100,
				});

				const lines: LogMessage[] = [];
				try {
					await new Promise((resolve, reject) => {
						logs.on('line', (line) => lines.push(line));
						logs.on('error', reject);

						// After we see the historical message, send a new one
						logs.once('line', async () => {
							try {
								await sendLogMessages(this.device.uuid, this.deviceApiKey, [
									{
										message: 'Newest message',
										timestamp: Date.now(),
									},
								]);
								await delay(LOG_SUBSCRIPTION_TIMEOUT);
								resolve(null);
							} catch (err) {
								reject(err as Error);
							}
						});
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
					await delay(LOG_SUBSCRIPTION_TIMEOUT);
					resolve(null);
				});

				expect(lines).to.deep.equal([]);
			});
		});
	});
});
