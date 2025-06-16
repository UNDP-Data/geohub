import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],

	addons: ['@storybook/addon-links', '@storybook/addon-svelte-csf', '@storybook/addon-docs'],

	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},

	staticDirs: ['../static'],

	refs: {
		'svelte-undp-design': {
			title: 'Svelte UNDP Design',
			url: 'https://svelte-undp-design.undpgeohub.org/'
		}
	}
};
export default config;
