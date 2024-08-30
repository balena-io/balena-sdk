import 'mjs-mocha';
import chai from 'chai';
const { expect } = chai;

describe('mjs imports', function () {
	it('should support using default imports', async function () {
		await import('./import_default.mjs');
	});

	it('should support using default imports', async function () {
		await import('./import_named.mjs');
	});

	[
		['default', async () => (await import('./import_default.mjs')).default],
		['named', async () => (await import('./import_named.mjs')).default],
	].forEach(([titlePart, loader]) => {
		describe(`${titlePart} imports`, function () {
			it('should include all exported methods', async function () {
				const sdkExports = await loader();
				const es2017Build = await import('../es2017/index.js');
				Object.keys(es2017Build)
					.filter(
						(exportedKey) =>
							exportedKey !== 'default' && !exportedKey.startsWith('__'),
					)
					.forEach((exportedKey) => {
						expect(sdkExports).to.have.property(exportedKey);
					});
			});

			it('should be able to use a method', async function () {
				const sdkExports = await loader();
				const sdk = sdkExports.getSdk();
				const isLoggedIn = await sdk.auth.isLoggedIn();
				expect(isLoggedIn).to.be.false;
			});
		});
	});
});
