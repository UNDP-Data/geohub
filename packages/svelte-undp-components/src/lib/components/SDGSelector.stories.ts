import type { Meta, StoryObj } from '@storybook/svelte';
import SDGSelector from './SDGSelector.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/SDGSelector',
	component: SDGSelector,
	tags: ['autodocs'],
	argTypes: {
		selected: {
			description: 'An array of SDG goal number selected'
		},
		placeholder: {
			type: 'string',
			description: 'Placeholder of selectbox if no SDG is selected',
			defaultValue: 'Select SDG'
		}
	}
} satisfies Meta<SDGSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		selected: []
	}
};

export const Selected: Story = {
	args: {
		selected: [3, 6]
	}
};
