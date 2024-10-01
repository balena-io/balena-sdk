module.exports = {
	extends: ['./node_modules/@balena/lint/config/.eslintrc.js'],
	parserOptions: {
		project: 'tsconfig.dev.json',
		sourceType: 'module',
	},
	env: {
		jest: true,
	},
	root: true,
	rules: {
		'no-restricted-imports': ['error', 'date-fns', 'lodash'],
	},
};
