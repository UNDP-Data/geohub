import type { Meta, StoryObj } from '@storybook/svelte';

import Download from './Download.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Download',
	component: Download,
	tags: ['docsPage'],
	argTypes: {
		url: {
			type: 'string',
			description: 'URL for doanloaded file'
		},
		title: {
			type: 'string',
			description: 'Title for file',
			defaultValue: ''
		},
		bytes: {
			type: 'number',
			description: 'Content Length of file (unit is bytes)',
			defaultValue: undefined
		}
	}
} satisfies Meta<Download>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		url: 'assets/undp-logo-blue.svg',
		title: 'undp-logo-blue.svg',
		bytes: 1000000
	}
};
