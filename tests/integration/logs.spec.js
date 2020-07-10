import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	sdkOpts,
} from './setup';
import { assertDeepMatchAndLength } from '../util';

const delay = (ms) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const sendLogMessages = (uuid, deviceApiKey, messages) =>
	balena.request.send({
		method: 'POST',
		url: `/device/v2/${uuid}/logs`,
		baseUrl: sdkOpts.apiUrl,
		sendToken: false,
		headers: { Authorization: `Bearer ${deviceApiKey}` },
		body: messages,
	});

describe('Logs', function () {
	givenLoggedInUser(before);

	describe('given a device', function () {
		givenAnApplication(before);

		beforeEach(function () {
			this.uuid = balena.models.device.generateUniqueKey();
			return balena.models.device
				.register(this.application.id, this.uuid)
				.then((registrationInfo) => {
					return (this.deviceApiKey = registrationInfo.api_key);
				});
		});

		afterEach(function () {
			return balena.pine.delete({
				resource: 'device',
				options: {
					$filter: { uuid: this.uuid },
				},
			});
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
		});

		describe('balena.logs.subscribe()', function () {
			it('should not load historical logs by default', function () {
				return sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
					{
						message: 'Slightly newer message',
						timestamp: Date.now(),
					},
				])
					.then(() => {
						return balena.logs.subscribe(this.uuid);
					})
					.then((logs) =>
						new Promise(function (resolve, reject) {
							const lines = [];
							logs.on('line', (line) => lines.push(line));
							logs.on('error', reject);

							return delay(2000).then(() => resolve(lines));
						}).finally(logs.unsubscribe),
					)
					.then((lines) => assertDeepMatchAndLength(lines, []));
			});

			it('should load historical logs if requested', function () {
				return sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
					{
						message: 'Slightly newer message',
						timestamp: Date.now(),
					},
				])
					.then(() => {
						return balena.logs.subscribe(this.uuid, { count: 'all' });
					})
					.then((logs) =>
						new Promise(function (resolve, reject) {
							const lines = [];
							logs.on('line', (line) => lines.push(line));
							logs.on('error', reject);

							return delay(2000).then(() => resolve(lines));
						}).finally(logs.unsubscribe),
					)
					.then((lines) =>
						assertDeepMatchAndLength(lines, [
							{
								message: 'Old message',
							},
							{
								message: 'Slightly newer message',
							},
						]),
					);
			});

			it('should limit historical logs by count', function () {
				return sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Old message',
						timestamp: Date.now(),
					},
					{
						message: 'Slightly newer message',
						timestamp: Date.now(),
					},
				])
					.then(() => {
						return balena.logs.subscribe(this.uuid, { count: 1 });
					})
					.then((logs) =>
						new Promise(function (resolve, reject) {
							const lines = [];
							logs.on('line', (line) => lines.push(line));
							logs.on('error', reject);

							return delay(2000).then(() => resolve(lines));
						}).finally(logs.unsubscribe),
					)
					.then((lines) =>
						assertDeepMatchAndLength(lines, [
							{
								message: 'Slightly newer message',
							},
						]),
					);
			});

			it('should stream new logs after historical logs', async function () {
				await sendLogMessages(this.uuid, this.deviceApiKey, [
					{
						message: 'Existing message',
						timestamp: Date.now(),
					},
				]);
				const logs = await balena.logs.subscribe(this.uuid, { count: 100 });

				const lines = [];
				try {
					await new Promise((resolve, reject) => {
						logs.on('line', (line) => lines.push(line));
						logs.on('error', reject);

						// After we see the historical message, send a new one
						logs.once('line', () => {
							return sendLogMessages(this.uuid, this.deviceApiKey, [
								{
									message: 'New message',
									timestamp: Date.now(),
								},
							])
								.then(() => setTimeout(resolve, 2000))
								.catch(reject);
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

				const lines = [];
				await new Promise((resolve, reject) => {
					logs.on('line', (line) => lines.push(line));
					logs.on('error', reject);

					return sendLogMessages(this.uuid, this.deviceApiKey, [
						{
							message: 'New message',
							timestamp: Date.now(),
						},
					]).then(() => setTimeout(resolve, 2000));
				});

				assertDeepMatchAndLength(lines, []);
			});
		});
	});
});
