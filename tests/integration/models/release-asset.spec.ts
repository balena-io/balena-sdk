import { expect } from 'chai';
import type * as BalenaSdk from '../../..';
import { delay, expectError, timeSuite } from '../../util';

import {
	balena,
	givenAnApplication,
	givenLoggedInUser,
	IS_BROWSER,
} from '../setup';

describe('Release Asset Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);

	describe('given an application with a release', function () {
		givenAnApplication(before);

		let ctx: Mocha.Context;
		let release: BalenaSdk.Release['Read'];

		before(async function () {
			ctx = this;

			const { id: userId } = await balena.auth.getUserInfo();
			const createdRelease = await balena.pine.post({
				resource: 'release',
				body: {
					belongs_to__application: ctx.application.id,
					is_created_by__user: userId,
					commit: 'abcdef123',
					semver: '1.0.0',
					status: 'success',
					source: 'cloud',
					is_final: true,
					composition: {},
					start_timestamp: new Date().toISOString(),
				},
			});
			release = await balena.models.release.get(createdRelease.id);
		});

		after(async function () {
			if (release) {
				await balena.pine.delete({
					resource: 'release',
					id: release.id,
				});
			}
		});

		describe('balena.models.release.asset.get()', function () {
			it('should be rejected if the release asset does not exist by id', async () => {
				await expectError(async () => {
					await balena.models.release.asset.get(999999);
				}, 'Release asset not found');
			});

			it('should be rejected if the release asset does not exist by asset_key and release', async () => {
				await expectError(async () => {
					await balena.models.release.asset.get({
						asset_key: 'non-existent-key',
						release: release.id,
					});
				}, 'Release asset not found');
			});
		});

		describe('balena.models.release.asset.getAllByRelease()', function () {
			it('should return an empty array for a release with no assets', async () => {
				const assets = await balena.models.release.asset.getAllByRelease(
					release.id,
				);
				expect(assets).to.be.an('array').with.lengthOf(0);
			});

			it('should work with different release identifiers', async () => {
				const assetsByCommit =
					await balena.models.release.asset.getAllByRelease(release.commit);
				const assetsByRawVersion =
					await balena.models.release.asset.getAllByRelease({
						application: ctx.application.id,
						rawVersion: '1.0.0',
					});

				expect(assetsByCommit).to.deep.equal(assetsByRawVersion);
			});
		});

		describe('balena.models.release.asset.upload() with File objects', function () {
			let createdAssets: number[] = [];

			afterEach(async function () {
				// Clean up created assets to stay within the 10-asset limit
				await Promise.all(
					createdAssets.map((assetId) =>
						balena.models.release.asset.remove(assetId),
					),
				);
				createdAssets = [];
			});

			it('should upload a small release asset with File object', async function () {
				const content = 'Hello, World!';
				const file = new File([content], 'hello.txt', { type: 'text/plain' });

				const asset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'hello.txt',
					asset: file,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('hello.txt');
				expect(asset.release).to.have.property('__id', release.id);
				createdAssets.push(asset.id);
			});

			it('should upload a larger release asset with File object for multipart upload', async function () {
				const largeContent = 'x'.repeat(9 * 1024 * 1024);
				const file = new File([largeContent], 'large-file-object.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.upload(
					{
						release: release.id,
						asset_key: 'large-file-object.txt',
						asset: file,
					},
					{
						chunkSize: 5 * 1024 * 1024,
						parallelUploads: 2,
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('large-file-object.txt');
				expect(asset.release).to.have.property('__id', release.id);
				createdAssets.push(asset.id);
			});

			it('should reject when trying to upload duplicate asset without overwrite', async function () {
				const content = 'Duplicate content';
				const file = new File([content], 'duplicate.txt', {
					type: 'text/plain',
				});

				const firstAsset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'duplicate.txt',
					asset: file,
				});
				createdAssets.push(firstAsset.id);

				await expectError(async () => {
					await balena.models.release.asset.upload({
						release: release.id,
						asset_key: 'duplicate.txt',
						asset: file,
					});
				}, 'already exists');
			});

			it('should overwrite duplicate asset when overwrite is true', async function () {
				const originalContent = 'Original content';
				const originalFile = new File([originalContent], 'overwrite-test.txt', {
					type: 'text/plain',
				});

				const firstAsset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'overwrite-test.txt',
					asset: originalFile,
				});
				createdAssets.push(firstAsset.id);

				const newContent = 'New content';
				const newFile = new File([newContent], 'overwrite-test.txt', {
					type: 'text/plain',
				});

				const overwrittenAsset = await balena.models.release.asset.upload(
					{
						release: release.id,
						asset_key: 'overwrite-test.txt',
						asset: newFile,
					},
					{ overwrite: true },
				);

				expect(overwrittenAsset).to.be.an('object');
				expect(overwrittenAsset.asset_key).to.equal('overwrite-test.txt');
				expect(overwrittenAsset.id).to.equal(firstAsset.id);
			});

			it('should call onUploadProgress callback for small file (multipart request)', async function () {
				const content = 'Small file for progress test';
				const file = new File([content], 'progress-small.txt', {
					type: 'text/plain',
				});

				const progressReports: Array<{
					total: number;
					uploaded: number;
				}> = [];

				const asset = await balena.models.release.asset.upload(
					{
						release: release.id,
						asset_key: 'progress-small.txt',
						asset: file,
					},
					{
						onUploadProgress: (progress) => {
							progressReports.push({ ...progress });
						},
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('progress-small.txt');
				createdAssets.push(asset.id);

				// For small files (multipart request), we expect exactly 2 progress calls:
				// 1. At start with uploaded: 0
				// 2. At end with uploaded: total
				expect(progressReports).to.have.lengthOf(2);

				expect(progressReports[0]).to.deep.equal({
					total: file.size,
					uploaded: 0,
				});

				expect(progressReports[1]).to.deep.equal({
					total: file.size,
					uploaded: file.size,
				});
			});

			it('should support async onUploadProgress callback', async function () {
				const content = 'Test async progress callback';
				const file = new File([content], 'progress-async.txt', {
					type: 'text/plain',
				});

				const progressReports: Array<{
					total: number;
					uploaded: number;
				}> = [];

				const asset = await balena.models.release.asset.upload(
					{
						release: release.id,
						asset_key: 'progress-async.txt',
						asset: file,
					},
					{
						onUploadProgress: async (progress) => {
							await delay(10);
							progressReports.push({ ...progress });
						},
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('progress-async.txt');
				createdAssets.push(asset.id);

				expect(progressReports).to.have.lengthOf(2);

				expect(progressReports[0]).to.deep.equal({
					total: file.size,
					uploaded: 0,
				});

				expect(progressReports[1]).to.deep.equal({
					total: file.size,
					uploaded: file.size,
				});
			});

			it('should call onUploadProgress callback for large file (multipart upload)', async function () {
				const largeContent = 'x'.repeat(9 * 1024 * 1024); // 9MiB
				const file = new File([largeContent], 'progress-large.txt', {
					type: 'text/plain',
				});

				const progressReports: Array<{
					total: number;
					uploaded: number;
				}> = [];

				const chunkSize = 5 * 1024 * 1024; // 5MiB chunks

				const asset = await balena.models.release.asset.upload(
					{
						release: release.id,
						asset_key: 'progress-large.txt',
						asset: file,
					},
					{
						chunkSize,
						parallelUploads: 1, // Sequential to ensure predictable order
						onUploadProgress: (progress) => {
							progressReports.push({ ...progress });
						},
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('progress-large.txt');
				createdAssets.push(asset.id);

				// For a 9MiB file with 5MiB chunks, we expect 2 progress calls (one per chunk)
				expect(progressReports).to.have.lengthOf(2);

				// First chunk
				expect(progressReports[0].total).to.equal(file.size);
				expect(progressReports[0].uploaded).to.equal(chunkSize);

				// Second chunk (remaining 4MiB)
				expect(progressReports[1].total).to.equal(file.size);
				expect(progressReports[1].uploaded).to.equal(file.size);
			});
		});

		describe('balena.models.release.asset.upload() with file paths', function () {
			if (IS_BROWSER) {
				it('should not be supported in browsers', async function () {
					await expectError(async () => {
						await balena.models.release.asset.upload({
							release: release.id,
							asset_key: 'browser-file-path.txt',
							asset: '/fake/file/path.txt',
						});
					}, 'File path uploads are not supported in the browser');
				});
				return;
			} else {
				let createdAssets: number[] = [];

				afterEach(async function () {
					// Clean up created assets to stay within the 10-asset limit
					await Promise.all(
						createdAssets.map((assetId) =>
							balena.models.release.asset.remove(assetId),
						),
					);
					createdAssets = [];
				});

				it('should upload a small release asset with file path', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const tempFilePath = path.join(
						os.tmpdir(),
						`small-test-${Date.now()}.txt`,
					);
					await fs.writeFile(tempFilePath, 'Hello, World from file!');

					const asset = await balena.models.release.asset.upload({
						release: release.id,
						asset_key: 'from-file.txt',
						asset: tempFilePath,
					});

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('from-file.txt');
					expect(asset.release).to.have.property('__id', release.id);
					createdAssets.push(asset.id);
				});

				it('should upload a large release asset with file path for multipart upload', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const largeTempFilePath = path.join(
						os.tmpdir(),
						`large-test-${Date.now()}.txt`,
					);
					const largeContent = 'x'.repeat(9 * 1024 * 1024);
					await fs.writeFile(largeTempFilePath, largeContent);

					const asset = await balena.models.release.asset.upload(
						{
							release: release.id,
							asset_key: 'large-file-path.txt',
							asset: largeTempFilePath,
						},
						{
							chunkSize: 5 * 1024 * 1024,
							parallelUploads: 3,
						},
					);

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('large-file-path.txt');
					expect(asset.release).to.have.property('__id', release.id);
					createdAssets.push(asset.id);
				});

				it('should automatically detect filename from file path', async function () {
					const path = await import('path');
					const fs = await import('fs/promises');
					const os = await import('os');

					const namedFilePath = path.join(
						os.tmpdir(),
						`auto-detected-name-${Date.now()}.json`,
					);
					await fs.writeFile(namedFilePath, '{"test": true}');

					const asset = await balena.models.release.asset.upload({
						release: release.id,
						asset_key: 'auto-name-test',
						asset: namedFilePath,
					});

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('auto-name-test');
					createdAssets.push(asset.id);
				});

				it('should detect MIME types based on file extensions', async function () {
					const path = await import('path');
					const fs = await import('fs/promises');
					const os = await import('os');

					const testFiles = [
						{
							name: 'test.json',
							content: '{"test": true}',
							expectedType: 'application/json',
						},
						{
							name: 'test.html',
							content: '<html><body>Test</body></html>',
							expectedType: 'text/html',
						},
						{
							name: 'test.js',
							content: 'console.log("test");',
							expectedType: 'application/javascript',
						},
					];

					for (const testFile of testFiles) {
						const filePath = path.join(
							os.tmpdir(),
							`${Date.now()}-${testFile.name}`,
						);
						await fs.writeFile(filePath, testFile.content);

						const asset = await balena.models.release.asset.upload({
							release: release.id,
							asset_key: `mime-test-${testFile.name}`,
							asset: filePath,
						});

						expect(asset).to.be.an('object');
						expect(asset.asset_key).to.equal(`mime-test-${testFile.name}`);
						createdAssets.push(asset.id);
					}
				});

				it('should call onUploadProgress callback for small file path', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const tempFilePath = path.join(
						os.tmpdir(),
						`progress-small-path-${Date.now()}.txt`,
					);
					const content = 'Small file path for progress test';
					await fs.writeFile(tempFilePath, content);

					const progressReports: Array<{
						total: number;
						uploaded: number;
					}> = [];

					const asset = await balena.models.release.asset.upload(
						{
							release: release.id,
							asset_key: 'progress-small-path.txt',
							asset: tempFilePath,
						},
						{
							onUploadProgress: (progress) => {
								progressReports.push({ ...progress });
							},
						},
					);

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('progress-small-path.txt');
					createdAssets.push(asset.id);

					// For small files (multipart request), we expect exactly 2 progress calls
					expect(progressReports).to.have.lengthOf(2);

					const fileSize = Buffer.byteLength(content);

					expect(progressReports[0]).to.deep.equal({
						total: fileSize,
						uploaded: 0,
					});

					expect(progressReports[1]).to.deep.equal({
						total: fileSize,
						uploaded: fileSize,
					});
				});

				it('should call onUploadProgress callback for large file path', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const tempFilePath = path.join(
						os.tmpdir(),
						`progress-large-path-${Date.now()}.txt`,
					);
					const largeContent = 'x'.repeat(9 * 1024 * 1024); // 9MiB
					await fs.writeFile(tempFilePath, largeContent);

					const progressReports: Array<{
						total: number;
						uploaded: number;
					}> = [];

					const chunkSize = 5 * 1024 * 1024; // 5MiB chunks

					const asset = await balena.models.release.asset.upload(
						{
							release: release.id,
							asset_key: 'progress-large-path.txt',
							asset: tempFilePath,
						},
						{
							chunkSize,
							parallelUploads: 1, // Sequential to ensure predictable order
							onUploadProgress: (progress) => {
								progressReports.push({ ...progress });
							},
						},
					);

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('progress-large-path.txt');
					createdAssets.push(asset.id);

					const fileSize = Buffer.byteLength(largeContent);

					// For a 9MiB file with 5MiB chunks, we expect 2 progress calls (one per chunk)
					expect(progressReports).to.have.lengthOf(2);

					expect(progressReports[0].total).to.equal(fileSize);
					expect(progressReports[0].uploaded).to.equal(chunkSize);

					expect(progressReports[1].total).to.equal(fileSize);
					expect(progressReports[1].uploaded).to.equal(fileSize);
				});
			}
		});

		describe('balena.models.release.asset.download()', function () {
			let downloadAsset: {
				id: number;
				asset_key: string;
				release: { __id: number };
			};

			before(async function () {
				const content = 'Hello, World! This is test content for download.';
				const file = new File([content], 'download-test.txt', {
					type: 'text/plain',
				});

				downloadAsset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'download-test.txt',
					asset: file,
				});
			});

			after(async function () {
				if (downloadAsset) {
					await balena.models.release.asset.remove(downloadAsset.id);
				}
			});

			it('should download a release asset by id', async function () {
				const stream = await balena.models.release.asset.download(
					downloadAsset.id,
				);

				expect(stream).to.be.an('object');
				expect(stream).to.have.property('pipe');
				expect(typeof stream.pipe).to.equal('function');

				let content = '';
				stream.on('data', (chunk: Buffer) => {
					content += chunk.toString();
				});

				await new Promise<void>((resolve, reject) => {
					stream.on('end', () => {
						try {
							expect(content).to.equal(
								'Hello, World! This is test content for download.',
							);
							resolve();
						} catch (error) {
							reject(error as Error);
						}
					});
					stream.on('error', reject);
				});
			});

			it('should download a release asset by asset_key and release', async function () {
				const stream = await balena.models.release.asset.download({
					asset_key: 'download-test.txt',
					release: release.id,
				});

				expect(stream).to.be.an('object');
				expect(stream).to.have.property('pipe');
				expect(typeof stream.pipe).to.equal('function');

				let dataReceived = false;
				stream.on('data', () => {
					dataReceived = true;
				});

				await new Promise<void>((resolve, reject) => {
					stream.on('end', () => {
						try {
							expect(dataReceived).to.be.true;
							resolve();
						} catch (error) {
							reject(error as Error);
						}
					});
					stream.on('error', reject);
				});
			});

			it('should download a release asset by asset_key and release commit', async function () {
				const stream = await balena.models.release.asset.download({
					asset_key: 'download-test.txt',
					release: release.commit,
				});

				expect(stream).to.be.an('object');
				expect(stream).to.have.property('pipe');
				expect(typeof stream.pipe).to.equal('function');
			});

			it('should be rejected if the release asset does not exist by id', async function () {
				await expectError(async () => {
					await balena.models.release.asset.download(999999);
				}, 'Release asset not found');
			});

			it('should be rejected if the release asset does not exist by asset_key and release', async function () {
				await expectError(async () => {
					await balena.models.release.asset.download({
						asset_key: 'non-existent-download.txt',
						release: release.id,
					});
				}, 'Release asset not found');
			});
		});

		describe('balena.models.release.asset.remove()', function () {
			it('should remove a release asset by id', async function () {
				const content = 'To be deleted';
				const file = new File([content], 'delete-test.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'delete-test.txt',
					asset: file,
				});

				await balena.models.release.asset.remove(asset.id);

				await expectError(async () => {
					await balena.models.release.asset.get(asset.id);
				}, 'Release asset not found');
			});

			it('should remove a release asset by asset_key and release', async function () {
				const content = 'To be deleted by key';
				const file = new File([content], 'delete-by-key.txt', {
					type: 'text/plain',
				});

				await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'delete-by-key.txt',
					asset: file,
				});

				await balena.models.release.asset.remove({
					asset_key: 'delete-by-key.txt',
					release: release.id,
				});

				await expectError(async () => {
					await balena.models.release.asset.get({
						asset_key: 'delete-by-key.txt',
						release: release.id,
					});
				}, 'Release asset not found');
			});
		});

		describe('error handling', function () {
			it('should reject file path uploads for non existing files', async function () {
				await expectError(
					async () => {
						await balena.models.release.asset.upload({
							release: release.id,
							asset_key: 'non-existent.txt',
							asset: '/non/existent/file.txt',
						});
					},
					IS_BROWSER
						? 'File path uploads are not supported in the browser'
						: 'ENOENT',
				);
			});

			it('should reject invalid release id', async function () {
				const content = 'Test content';
				const file = new File([content], 'test.txt', { type: 'text/plain' });

				await expectError(async () => {
					await balena.models.release.asset.upload({
						release: 999999,
						asset_key: 'invalid-release.txt',
						asset: file,
					});
				}, 'The request was unsuccessful');
			});
		});

		describe('edge cases', function () {
			let createdAssets: number[] = [];

			afterEach(async function () {
				await Promise.all(
					createdAssets.map((assetId) =>
						balena.models.release.asset.remove(assetId),
					),
				);
				createdAssets = [];
			});

			it('should handle empty files', async function () {
				const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });

				const asset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'empty.txt',
					asset: emptyFile,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('empty.txt');
				createdAssets.push(asset.id);
			});

			it('should handle files with special characters in names', async function () {
				const content = 'Special chars test';
				const file = new File([content], 'file with spaces & symbols!.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'special-chars.txt',
					asset: file,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('special-chars.txt');
				createdAssets.push(asset.id);
			});

			it('should handle binary files', async function () {
				const binaryData = new Uint8Array([
					0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
				]); // PNG header
				const binaryFile = new File([binaryData], 'test.png', {
					type: 'image/png',
				});

				const asset = await balena.models.release.asset.upload({
					release: release.id,
					asset_key: 'binary.png',
					asset: binaryFile,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('binary.png');
				createdAssets.push(asset.id);
			});
		});
	});
});
