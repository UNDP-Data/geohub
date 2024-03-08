import type { StorybookConfig } from '@storybook/sveltekit';
const config: StorybookConfig = {
	stories: ['../src/lib/**/*.mdx', '../src/lib/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: 'tag'
	},
	staticDirs: ['../static'],
	refs: {
		'svelte-undp-components': {
			title: 'Svelte UNDP Components',
			url: 'https://svelte-components.undpgeohub.org/'
		},
		'design-system': {
			title: 'UNDP Design System',
			url: 'https://design.undp.org/'
		}
	}
};
export default config;
