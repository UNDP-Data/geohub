import type { Meta, StoryObj } from '@storybook/svelte';

import Loader from './Loader.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Loader',
	component: Loader,
	tags: ['docsPage'],
	argTypes: {
		size: {
			type: 'string',
			description: 'Size of the loader',
			defaultValue: 'medium'
		},
		parameters: {
			size: {
				values: ['x-small', 'small', 'medium', 'large']
			}
		}
	}
} satisfies Meta<Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {}
};
