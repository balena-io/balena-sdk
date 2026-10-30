// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FlatCompat } = require('@eslint/eslintrc');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const balenaLintConfig = require('@balena/lint/config/eslint.config');

const compat = new FlatCompat({
	baseDirectory: __dirname,
});
// @balena/lint exports its config as a promise, so ours has to be one too
module.exports = Promise.resolve(balenaLintConfig).then((baseConfig) => [
	...baseConfig,
	...compat.config({
		parserOptions: {
			project: './tsconfig.dev.json',
			sourceType: 'module',
		},
		env: {
			jest: true,
		},
		rules: {
			'no-restricted-imports': ['error', 'lodash'],
		},
	}),
]);
