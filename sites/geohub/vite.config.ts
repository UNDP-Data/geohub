import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: [
			/^@material(?:-extra)?\//,
			'vega-embed',
			'svelte-carousel',
			'simply-reactive',
			'maplibre-gl',
			'@maptiler/geocoding-control',
			'@maplibre/maplibre-gl-geocoder',
			'@watergis/maplibre-gl-export',
			'@neodrag/svelte'
		]
	},
	resolve: {
		alias: {
			$components: resolve('./src/components'),
			$stores: resolve('./src/stores/index.ts')
		}
	},
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['../..']
		}
	}
});
