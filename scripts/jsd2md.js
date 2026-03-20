/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const jsdoc2md = require('jsdoc-to-markdown');
const { writeFileSync, readFileSync } = require('fs');
const { resolve } = require('path');

/* input and output paths */
const inputFiles = 'es2017/**/!(balena-browser*.js)';
const outputDir = __dirname;

async function generateDocs() {
	await jsdoc2md.clear();
	const templateData = await jsdoc2md.getTemplateData({ files: inputFiles });

	// Define priority for "kinds"
	const kindOrder = {
		module: 1,
		function: 2, // Functions first within an object
		constant: 3,
		member: 3, // Sub-objects/models usually fall here
		namespace: 4,
		typedef: 5,
	};

	templateData.sort((a, b) => {
		// 1. Module Priority: Move all modules to the very top
		if (a.kind === 'module' && b.kind !== 'module') {
			return -1;
		}
		if (a.kind !== 'module' && b.kind === 'module') {
			return 1;
		}

		// 2. Group by Parent: Keep things belonging to 'models.application' together
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const parentA = a.memberof || '';
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const parentB = b.memberof || '';

		if (parentA !== parentB) {
			return parentA.localeCompare(parentB);
		}

		// 3. Kind Priority: Within 'application', put 'create()' (function) before 'apiKey' (member)
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const priorityA = kindOrder[a.kind] || 99;
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const priorityB = kindOrder[b.kind] || 99;

		if (priorityA !== priorityB) {
			return priorityA - priorityB;
		}

		// 4. Alphabetical Tie-breaker: create() vs get()
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		return (a.name || '').localeCompare(b.name || '');
	});

	const renderOpts = {
		data: templateData,
		template: readFileSync(
			resolve(__dirname, '../doc/DOCUMENTATION.hbs'),
			'utf8',
		),
		separators: true,
		'name-format': false,
		'no-gfm': true,
		'example-lang': 'js',
		'member-index-format': 'list',
	};

	console.log('Rendering markdown...');
	const output = await jsdoc2md.render(renderOpts);

	writeFileSync(resolve(outputDir, '../DOCUMENTATION.md'), output);
	console.log('✓ DOCUMENTATION.md generated successfully.');
}

generateDocs().catch((error) => {
	console.error('\nFatal error:', error.message);
	process.exit(1);
});
