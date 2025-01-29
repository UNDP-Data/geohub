import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/addon-svelte-csf',
		'@storybook/addon-mdx-gfm'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: true
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
