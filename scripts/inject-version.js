/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const nodeVersion = process.versions.node.split('.').map(Number);
if (nodeVersion[0] > 22 || (nodeVersion[0] === 22 && nodeVersion[1] >= 18)) {
	// TODO: Move this directly in the package.json once we drop support for node 20
	process.env.NODE_OPTIONS = '--no-experimental-strip-types';
}

const root = path.resolve(__dirname, '..');

function getBuildDir() {
	let buildDir = '';

	// Check for a specific argument pattern, like 'node inject-version.js --buildDir es2020'
	const args = process.argv.slice(2);
	const buildDirIndex = args.indexOf('--buildDir');

	if (buildDirIndex !== -1 && args.length > buildDirIndex + 1) {
		buildDir = args[buildDirIndex + 1];
	}

	if (!buildDir) {
		throw new Error('inject-version: No --buildDir parameter was provided');
	}

	return buildDir;
}

function injectVersion() {
	try {
		const buildDir = getBuildDir();
		const packageJSONPath = path.resolve(root, 'package.json');
		const packageJSON = require(packageJSONPath);
		const versionToInject = packageJSON.version;

		if (!versionToInject) {
			throw new Error('Could not find version in package.json.');
		}

		console.log(`inject-version: build directory: ${buildDir}`);
		console.log(
			`inject-version: Package version to inject: ${versionToInject}`,
		);

		const relativeTargetFile = 'util/sdk-version.js';
		const targetPath = path.join(root, buildDir, relativeTargetFile);
		const placeholder = '__REPLACE_WITH_PACKAGE_JSON_VERSION__';

		console.log(`inject-version: Target file path: ${targetPath}`);

		const originalContent = fs.readFileSync(targetPath, 'utf8');
		const newContent = originalContent.replace(placeholder, versionToInject);
		if (originalContent === newContent) {
			throw new Error(
				`inject-version: Placeholder string "${placeholder}" not found in the file.`,
			);
		}

		// Write the modified content back to the same file
		fs.writeFileSync(targetPath, newContent, 'utf8');

		console.log(
			'inject-version: Successfully injected version into the SDK file.',
		);
	} catch (error) {
		console.error('inject-version: Version injection failed!');
		console.error(error.message);
		process.exit(1); // Exit with a failure code
	}
}

injectVersion();
