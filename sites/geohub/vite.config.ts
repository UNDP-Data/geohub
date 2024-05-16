import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
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
			'@maptiler/geocoding-control'
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
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./setupTest.ts'],
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html']
		}
	}
});
