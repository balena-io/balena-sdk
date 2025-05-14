import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	sdkOpts,
} from './setup';
import { assertDeepMatchAndLength, timeSuite } from '../util';

const delay = (ms) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

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
	timeSuite(before);
	givenLoggedInUser(before);

	describe('given a device', function () {
		givenAnApplication(before);

		beforeEach(async function () {
			this.uuid = balena.models.device.generateUniqueKey();
			const registrationInfo = await balena.models.device.register(
				this.application.id,
				this.uuid,
			);
			this.deviceApiKey = registrationInfo.api_key;
		});

		describe('balena.logs.history()', function () {
			it('should successfully load historical logs', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'First message',
						timestamp: Date.now(),
					},
					{
						message: 'Second message',
						timestamp: Date.now(),
					},
				]);
				await delay(2000);

				const lines = await balena.logs.history(this.uuid);
				assertDeepMatchAndLength(lines, [
					{
						message: 'First message',
					},
					{
						message: 'Second message',
					},
				]);
			});

			it('should limit logs by count', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'First message',
						timestamp: Date.now(),
					},
					{
						message: 'Second message',
						timestamp: Date.now(),
					},
				]);
				await delay(2000);
				const lines = await balena.logs.history(this.uuid, { count: 1 });
				assertDeepMatchAndLength(lines, [
					{
						message: 'Second message',
					},
				]);
			});

			it('should limit logs by start', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
				]);
				await delay(1000);
				const pastTimeStamp = Date.now();
				await delay(1000);
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: `Newer message`,
						timestamp: Date.now(),
					},
				]);
				await delay(2000);
				let lines = await balena.logs.history(this.uuid, {
					start: pastTimeStamp,
				});
				assertDeepMatchAndLength(lines, [
					{
						message: 'Newer message',
					},
				]);

				lines = await balena.logs.history(this.uuid, {
					start: new Date(pastTimeStamp).toISOString(),
				});
				assertDeepMatchAndLength(lines, [
					{
						message: 'Newer message',
					},
				]);
			});
		});

		describe('balena.logs.subscribe()', function () {
			const LOG_SUBSCRIPTION_TIMEOUT = 5000;

			async function getLogLinesAndUnsubscribe(logs) {
				const lines: string[] = [];
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
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
					{
						message: 'Slightly newer message',
						timestamp: Date.now(),
					},
				]);
				const logs = await balena.logs.subscribe(this.uuid);
				assertDeepMatchAndLength(await getLogLinesAndUnsubscribe(logs), []);
			});

			it('should load historical logs if requested', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
					{
						message: 'Slightly newer message',
						timestamp: Date.now(),
					},
				]);
				const logs = await balena.logs.subscribe(this.uuid, { count: 'all' });
				assertDeepMatchAndLength(await getLogLinesAndUnsubscribe(logs), [
					{
						message: 'Old message',
					},
					{
						message: 'Slightly newer message',
					},
				]);
			});

			it('should limit historical logs by count', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
					{
						message: 'Slightly newer message',
						timestamp: Date.now(),
					},
				]);
				const logs = await balena.logs.subscribe(this.uuid, { count: 1 });
				assertDeepMatchAndLength(await getLogLinesAndUnsubscribe(logs), [
					{
						message: 'Slightly newer message',
					},
				]);
			});

			it('should limit historical logs by start', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
				]);
				await delay(1000);
				const pastTimeStamp = Date.now();
				await delay(1000);
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: `Newer message`,
						timestamp: Date.now(),
					},
				]);
				await delay(2000);
				let logs = await balena.logs.subscribe(this.uuid, {
					start: pastTimeStamp,
					count: 'all',
				});
				assertDeepMatchAndLength(await getLogLinesAndUnsubscribe(logs), [
					{
						message: 'Newer message',
					},
				]);

				logs = await balena.logs.subscribe(this.uuid, {
					start: new Date(pastTimeStamp).toISOString(),
					count: 'all',
				});
				assertDeepMatchAndLength(await getLogLinesAndUnsubscribe(logs), [
					{
						message: 'Newer message',
					},
				]);
			});

			it('should stream new logs after historical logs', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Existing message',
						timestamp: Date.now(),
					},
				]);
				const logs = await balena.logs.subscribe(this.uuid, { count: 100 });

				const lines: string[] = [];
				try {
					await new Promise((resolve, reject) => {
						logs.on('line', (line) => lines.push(line));
						logs.on('error', reject);

						// After we see the historical message, send a new one
						logs.once('line', async () => {
							try {
								await sendLogMessages(this.uuid, this.deviceApiKey, [
									{
										message: 'New message',
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

				assertDeepMatchAndLength(lines, [
					{
						message: 'Existing message',
					},
					{
						message: 'New message',
					},
				]);
			});

			it('should allow unsubscribing from logs', async function () {
				const logs = await balena.logs.subscribe(this.uuid);
				await delay(1000); // Make sure we're connected

				// Unsubscribe before any messages are sent
				logs.unsubscribe();

				const lines: string[] = [];
				// eslint-disable-next-line no-async-promise-executor
				await new Promise(async (resolve, reject) => {
					logs.on('line', (line) => lines.push(line));
					logs.on('error', reject);

					await sendLogMessages(this.uuid, this.deviceApiKey, [
						{
							message: 'New message',
							timestamp: Date.now(),
						},
					]);
					await delay(LOG_SUBSCRIPTION_TIMEOUT);
					resolve(null);
				});

				assertDeepMatchAndLength(lines, []);
			});
		});
	});
});
