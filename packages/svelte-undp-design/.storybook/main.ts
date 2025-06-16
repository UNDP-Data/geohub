import type { StorybookConfig } from '@storybook/sveltekit';
const config: StorybookConfig = {
	stories: ['../src/lib/**/*.mdx', '../src/lib/**/*.stories.@(js|jsx|ts|tsx|svelte)'],

	addons: ['@storybook/addon-links', '@storybook/addon-svelte-csf', '@storybook/addon-docs'],

	framework: {
		name: '@storybook/sveltekit',
		options: {}
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
	},

	core: {
		disableTelemetry: true
	}
};
export default config;
