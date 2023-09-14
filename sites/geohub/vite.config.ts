import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { createWSSGlobalInstance, onHttpServerUpgrade } from './src/lib/server/webSocketUtils';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				createWSSGlobalInstance();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
			configurePreviewServer(server) {
				createWSSGlobalInstance();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			}
		}
	],
	ssr: {
		noExternal: [/^@material(?:-extra)?\//, 'vega-embed', 'svelte-carousel', 'simply-reactive']
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
