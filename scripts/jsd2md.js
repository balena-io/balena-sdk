/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const jsdoc2md = require('jsdoc-to-markdown');
const {
	writeFileSync,
	mkdirSync,
	existsSync,
	rmSync,
	readFileSync,
} = require('fs');
const { resolve } = require('path');

/* input and output paths */
const inputFiles = 'es2017/**/!(balena-browser*.js)';
const outputDir = resolve(__dirname, '../docs');
const introductionPath = resolve(outputDir, 'introduction.md');

const getRenderOpts = (data) => ({
	data,
	separators: true,
	'name-format': false,
	'no-gfm': true,
	'example-lang': 'js',
	'member-index-format': 'list',
	'heading-depth': 1,
	partial: resolve(__dirname, '../doc/partials/*.hbs'),
});

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

	if (existsSync(outputDir)) {
		rmSync(outputDir, { recursive: true });
	}

	mkdirSync(outputDir, { recursive: true });
	writeFileSync(
		introductionPath,
		readFileSync(resolve(__dirname, '../doc/DOCUMENTATION.hbs'), 'utf8'),
		{ recursive: true },
	);

	const pages = new Map();
	for (const item of templateData) {
		// Special cases. Handles:
		// - fromSharedOptions
		// - getSdk
		// - setSharedOptions
		// - listImagesFromTargetState
		if (
			item.memberof?.startsWith('module:') ||
			(!item.memberof && item.kind === 'function')
		) {
			if (!pages.has('miscellaneous')) {
				pages.set('miscellaneous', []);
			}
			pages.set('miscellaneous', [...pages.get('miscellaneous'), item.id]);
			continue;
		}
		if (!item.memberof) {
			pages.set(item.id, [item.id]);
			continue;
		}

		pages.set(item.memberof, [...(pages.get(item.memberof) ?? []), item.id]);
	}

	let runAgain;
	do {
		runAgain = false;
		pages.forEach((ids1, page1) => {
			pages.forEach((ids2, page2) => {
				if ([page1, 'balena', 'balena.models'].includes(page2)) {
					return;
				}
				if (ids2.includes(page1)) {
					pages.set(page2, [...ids2, ...ids1]);
					pages.delete(page1);
					runAgain = true;
				}
			});
		});
	} while (runAgain);

	for (const page of pages.get('balena')) {
		if (page === 'balena') {
			continue;
		}
		const pageItem = templateData.find((it) => it.id === page);
		const pageContents = await jsdoc2md.render(
			getRenderOpts([
				// content won't render if it has a parent but the parent is not included in the data
				// so we set memberof to undefined to make it think it has no parent and ensure it renders
				{ ...pageItem, memberof: undefined },
				...templateData.filter((it) => (pages.get(page) ?? []).includes(it.id)),
			]),
		);
		if (page === 'balena.models') {
			mkdirSync(resolve(outputDir, 'models'), { recursive: true });
			const models = pages.get('balena.models') ?? [];
			for (const model of models) {
				const modelItem = templateData.find((it) => it.id === model);
				const modelContent = await jsdoc2md.render(
					getRenderOpts([
						{
							...modelItem,
							memberof: undefined,
						},
						...templateData.filter((it) =>
							(pages.get(model) ?? []).includes(it.id),
						),
					]),
				);
				writeFileSync(
					resolve(outputDir, `models/${modelItem.name}.md`),
					modelContent,
					{
						recursive: true,
					},
				);
			}
			continue;
		}
		writeFileSync(
			resolve(
				outputDir,
				`${templateData.find((it) => it.id === page).name}.md`,
			),
			pageContents,
			{
				recursive: true,
			},
		);
	}

	const miscellaneousContents = await jsdoc2md.render({
		...getRenderOpts(
			(pages.get('miscellaneous') ?? []).map((page) => {
				const miscellaneousItem = templateData.find((it) => it.id === page);
				return {
					...miscellaneousItem,
					memberof: undefined,
				};
			}),
		),
		'heading-depth': 2,
	});
	writeFileSync(
		resolve(outputDir, 'miscellaneous.md'),
		'# Miscellaneous\n\n' + miscellaneousContents,
		{
			recursive: true,
		},
	);

	console.log('✓ DOCUMENTATION.md generated successfully.');
}

generateDocs().catch((error) => {
	console.error('\nFatal error:', error.message);
	process.exit(1);
});
