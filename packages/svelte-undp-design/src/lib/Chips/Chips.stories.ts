import type { Meta, StoryObj } from '@storybook/svelte';

import Chips from './Chips.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Chips',
	component: Chips,
	tags: ['autodocs'],
	argTypes: {
		label: {
			type: 'string',
			description: 'Label to be shown in chip',
			defaultValue: undefined
		},
		showDelete: {
			type: 'boolean',
			description: 'Show delete button if true',
			defaultValue: false
		}
	}
} satisfies Meta<Chips>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		label: 'Label',
		showDelete: false
	}
};

export const ShowClose: Story = {
	args: {
		label: 'Label',
		showDelete: true
	}
};
