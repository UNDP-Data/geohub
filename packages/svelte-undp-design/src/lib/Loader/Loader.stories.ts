import type { Meta, StoryObj } from '@storybook/svelte';

import Loader from './Loader.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Loader',
	component: Loader,
	tags: ['autodocs'],
	argTypes: {
		size: {
			type: 'string',
			description: 'Size of the loader',
			defaultValue: 'medium',
			constrol: { type: 'select' },
			options: ['small', 'medium', 'large']
		}
	}
} satisfies Meta<Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		size: 'medium'
	}
};

export const Small: Story = {
	args: {
		size: 'small'
	}
};

export const Medium: Story = {
	args: {
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		size: 'large'
	}
};
