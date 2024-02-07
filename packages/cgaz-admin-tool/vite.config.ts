import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: 'maplibre-gl'
	},
	resolve: {
		alias: {
			$example: resolve('./src/example')
		}
	}
});
