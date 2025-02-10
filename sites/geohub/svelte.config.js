import adapter from '@sveltejs/adapter-node';
import { sveltePreprocess } from 'svelte-preprocess';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({}),
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false,
			envPrefix: ''
		}),
		alias: {
			$components: resolve('./src/components'),
			$stores: resolve('./src/stores/index.ts'),
			'$api/*': './src/api/*',
			$api: './src/api/index'
		},
		version: {
			name: JSON.stringify({
				version: pkg.version,
				license: pkg.license,
				author: pkg.author,
				homepage: pkg.homepage
			})
		}
	},

	onwarn(warning, defaultHandler) {
		if (process.env.NODE_ENV === 'production') return;
		const warningCodeToIgnore = [
			'a11y-missing-content',
			'a11y-missing-attribute',
			'css-unused-selector'
		];
		if (warningCodeToIgnore.includes(warning.code)) return;

		defaultHandler(warning);
	},

	// this is required because CEEI code (layerHelper.ts) using svelte 4 component with new syntax
	compilerOptions: {
		compatibility: {
			componentApi: 4
		}
	}
};

export default config;
