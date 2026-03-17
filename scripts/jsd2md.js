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

	const jsDocOpts = { files: inputFiles };

	console.log('Fetching template data...');
	const templateData = await jsdoc2md.getTemplateData(jsDocOpts);

	templateData.sort(function (a, b) {
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const nameA = (a.longname || '').toUpperCase();
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const nameB = (b.longname || '').toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
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
