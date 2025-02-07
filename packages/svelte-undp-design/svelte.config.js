import adapter from '@sveltejs/adapter-auto';
import { sveltePreprocess } from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess:
		process.env.STORYBOOK_BUILD === 'true'
			? vitePreprocess({ script: true })
			: sveltePreprocess({ scss: true }),

	kit: {
		adapter: adapter()
	}
};

export default config;
