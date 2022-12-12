module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		node: true
	},
	rules: {
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/ban-ts-comment': 0,
		'@typescript-eslint/no-var-requires': 0
	}
};
