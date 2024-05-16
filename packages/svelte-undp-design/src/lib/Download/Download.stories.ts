import type { Meta, StoryObj } from '@storybook/svelte';

import Download from './Download.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Download',
	component: Download,
	tags: ['autodocs'],
	argTypes: {
		url: {
			type: 'string',
			description: 'URL for doanloaded file'
		},
		title: {
			type: 'string',
			description: 'Title for file',
			defaultValue: ''
		}
	}
} satisfies Meta<Download>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		url: 'assets/undp-logo-blue.svg',
		title: 'undp-logo-blue.svg'
	}
};
