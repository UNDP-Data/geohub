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
			'@watergis/svelte-maplibre-menu'
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
		threads: false,
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./setupTest.ts'],
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html']
		}
	}
});
