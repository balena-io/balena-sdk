import 'mjs-mocha';
import chai from 'chai';
const { expect } = chai;

const IGNORED_EXPORT_KEYS = new Set([
	'default',
	'__esModule',
	'module',
	'module.exports',
]);

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
				expect(Object.keys(sdkExports).sort()).to.deep.equal(
					Object.keys(es2017Build)
						.filter(
							(exportedKey) =>
								!IGNORED_EXPORT_KEYS.has(exportedKey) &&
								!exportedKey.startsWith('__'),
						)
						.sort(),
				);
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
