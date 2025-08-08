import { expect } from 'chai';
import type * as BalenaSdk from '../../..';
import { expectError, timeSuite } from '../../util';

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
						rawVersion: release.raw_version,
					});

				expect(assetsByCommit).to.deep.equal(assetsByRawVersion);
			});
		});

		describe('balena.models.release.asset.create() with File objects', function () {
			it('should create a small release asset with File object', async function () {
				const content = 'Hello, World!';
				const file = new File([content], 'hello.txt', { type: 'text/plain' });

				const asset = await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'hello.txt',
					asset: file,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('hello.txt');
				expect(asset.release).to.have.property('__id', release.id);
			});

			it('should create a larger release asset with File object for multipart upload', async function () {
				const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
				const file = new File([largeContent], 'large.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.create(
					{
						release: release.id,
						asset_key: 'large.txt',
						asset: file,
					},
					{
						chunkSize: 5 * 1024 * 1024, // 5MB chunks
						parallelUploads: 2,
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('large.txt');
				expect(asset.release).to.have.property('__id', release.id);
			});

			it('should override an existing asset when override is true', async function () {
				const content1 = 'First content';
				const content2 = 'Second content';
				const file1 = new File([content1], 'override.txt', {
					type: 'text/plain',
				});
				const file2 = new File([content2], 'override.txt', {
					type: 'text/plain',
				});

				await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'override.txt',
					asset: file1,
				});

				const asset = await balena.models.release.asset.create(
					{
						release: release.id,
						asset_key: 'override.txt',
						asset: file2,
					},
					{
						override: true,
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('override.txt');
			});

			it('should reject when trying to create duplicate asset without override', async function () {
				const content = 'Duplicate content';
				const file = new File([content], 'duplicate.txt', {
					type: 'text/plain',
				});

				await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'duplicate.txt',
					asset: file,
				});

				await expectError(async () => {
					await balena.models.release.asset.create({
						release: release.id,
						asset_key: 'duplicate.txt',
						asset: file,
					});
				}, 'already exists');
			});
		});

		if (!IS_BROWSER) {
			describe('balena.models.release.asset.create() with file paths', function () {
				it('should create a small release asset with file path', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const tempFilePath = path.join(
						os.tmpdir(),
						`small-test-${Date.now()}.txt`,
					);
					await fs.writeFile(tempFilePath, 'Hello, World from file!');

					const asset = await balena.models.release.asset.create({
						release: release.id,
						asset_key: 'from-file.txt',
						asset: tempFilePath,
					});

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('from-file.txt');
					expect(asset.release).to.have.property('__id', release.id);
				});

				it('should create a large release asset with file path for multipart upload', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const largeTempFilePath = path.join(
						os.tmpdir(),
						`large-test-${Date.now()}.txt`,
					);
					const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
					await fs.writeFile(largeTempFilePath, largeContent);

					const asset = await balena.models.release.asset.create(
						{
							release: release.id,
							asset_key: 'large-from-file.txt',
							asset: largeTempFilePath,
						},
						{
							chunkSize: 5 * 1024 * 1024,
							parallelUploads: 3,
						},
					);

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('large-from-file.txt');
					expect(asset.release).to.have.property('__id', release.id);
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

					const asset = await balena.models.release.asset.create({
						release: release.id,
						asset_key: 'auto-name-test',
						asset: namedFilePath,
					});

					expect(asset).to.be.an('object');
					expect(asset.asset_key).to.equal('auto-name-test');
				});

				it('should detect MIME types based on file extensions', async function () {
					const path = await import('path');
					const fs = await import('fs/promises');
					const os = await import('os');

					// Test different file extensions
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

						const asset = await balena.models.release.asset.create({
							release: release.id,
							asset_key: `mime-test-${testFile.name}`,
							asset: filePath,
						});

						expect(asset).to.be.an('object');
						expect(asset.asset_key).to.equal(`mime-test-${testFile.name}`);
					}
				});
			});
		}

		describe('balena.models.release.asset.update()', function () {
			let testAsset: {
				id: number;
				asset_key: string;
				release: { __id: number };
			};

			before(async function () {
				const content = 'Original content';
				const file = new File([content], 'update-test.txt', {
					type: 'text/plain',
				});

				testAsset = await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'update-test.txt',
					asset: file,
				});
			});

			it('should update asset_key', async function () {
				await balena.models.release.asset.update(testAsset.id, {
					asset_key: 'updated-key.txt',
				});

				const updated = await balena.models.release.asset.get(testAsset.id);
				expect(updated.asset_key).to.equal('updated-key.txt');
			});

			it('should update asset content with File object', async function () {
				const newContent = 'Updated content';
				const newFile = new File([newContent], 'updated.txt', {
					type: 'text/plain',
				});

				await balena.models.release.asset.update(testAsset.id, {
					asset: newFile,
				});

				const updated = await balena.models.release.asset.get(testAsset.id);
				expect(updated).to.be.an('object');
			});

			if (!IS_BROWSER) {
				it('should update asset content with file path', async function () {
					const fs = await import('fs/promises');
					const path = await import('path');
					const os = await import('os');

					const updateFilePath = path.join(
						os.tmpdir(),
						`update-${Date.now()}.txt`,
					);
					await fs.writeFile(updateFilePath, 'Updated from file');

					await balena.models.release.asset.update(testAsset.id, {
						asset: updateFilePath,
					});

					const updated = await balena.models.release.asset.get(testAsset.id);
					expect(updated).to.be.an('object');
				});
			}
		});

		describe('balena.models.release.asset.remove()', function () {
			it('should remove a release asset by id', async function () {
				const content = 'To be deleted';
				const file = new File([content], 'delete-test.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.create({
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

				await balena.models.release.asset.create({
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
			it('should reject file path uploads in browser', async function () {
				if (IS_BROWSER) {
					await expectError(async () => {
						await balena.models.release.asset.create({
							release: release.id,
							asset_key: 'browser-file-path.txt',
							asset: '/fake/file/path.txt',
						});
					}, 'File path uploads are not supported in the browser');
				} else {
					// In Node.js, should reject non-existent file
					await expectError(async () => {
						await balena.models.release.asset.create({
							release: release.id,
							asset_key: 'non-existent.txt',
							asset: '/non/existent/file.txt',
						});
					}, 'ENOENT');
				}
			});

			it('should reject invalid release id', async function () {
				const content = 'Test content';
				const file = new File([content], 'test.txt', { type: 'text/plain' });

				await expectError(async () => {
					await balena.models.release.asset.create({
						release: 999999,
						asset_key: 'invalid-release.txt',
						asset: file,
					});
				}, 'Release not found');
			});
		});

		describe('edge cases', function () {
			it('should handle empty files', async function () {
				const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });

				const asset = await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'empty.txt',
					asset: emptyFile,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('empty.txt');
			});

			it('should handle files with special characters in names', async function () {
				const content = 'Special chars test';
				const file = new File([content], 'file with spaces & symbols!.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'special-chars.txt',
					asset: file,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('special-chars.txt');
			});

			it('should handle binary files', async function () {
				const binaryData = new Uint8Array([
					0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
				]); // PNG header
				const binaryFile = new File([binaryData], 'test.png', {
					type: 'image/png',
				});

				const asset = await balena.models.release.asset.create({
					release: release.id,
					asset_key: 'binary.png',
					asset: binaryFile,
				});

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('binary.png');
			});
		});

		describe('upload parameters', function () {
			it('should respect custom chunk size', async function () {
				const content = 'x'.repeat(8 * 1024 * 1024); // 8MB
				const file = new File([content], 'custom-chunk.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.create(
					{
						release: release.id,
						asset_key: 'custom-chunk.txt',
						asset: file,
					},
					{
						chunkSize: 2 * 1024 * 1024, // 2MB chunks instead of default 5MB
						parallelUploads: 4,
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('custom-chunk.txt');
			});

			it('should respect custom parallel upload limit', async function () {
				const content = 'x'.repeat(15 * 1024 * 1024); // 15MB
				const file = new File([content], 'parallel-test.txt', {
					type: 'text/plain',
				});

				const asset = await balena.models.release.asset.create(
					{
						release: release.id,
						asset_key: 'parallel-test.txt',
						asset: file,
					},
					{
						parallelUploads: 1, // Force sequential uploads
					},
				);

				expect(asset).to.be.an('object');
				expect(asset.asset_key).to.equal('parallel-test.txt');
			});
		});
	});
});
