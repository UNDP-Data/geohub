import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	ssr: {
		noExternal: 'maplibre-gl'
	},
	resolve: {
		alias: {
			$example: resolve('./src/example')
		}
	}
};

export default config;
