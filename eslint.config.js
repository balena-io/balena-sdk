// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
	baseDirectory: __dirname,
});
module.exports = [
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	...require('@balena/lint/config/eslint.config'),
	...compat.config({
		parserOptions: {
			project: './tsconfig.dev.json',
			sourceType: 'module',
		},
		env: {
			jest: true,
		},
		rules: {
			'no-restricted-imports': ['error', 'date-fns'],
		},
	}),
];
