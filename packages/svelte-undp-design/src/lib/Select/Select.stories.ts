import type { Meta, StoryObj } from '@storybook/svelte';

import Select from './Select.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Select',
	component: Select,
	tags: ['autodocs'],
	argTypes: {
		placeholder: {
			type: 'string',
			description: 'Placeholder of selectbox'
		},
		items: {
			description: 'The list of items of SelectItem interface'
		}
	}
} satisfies Meta<Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		placeholder: 'Category',
		items: [
			{ label: 'All', value: 'default' },
			{ label: 'Pasto', value: 'pasto' },
			{ label: 'Dari', value: 'dari' },
			{ label: 'English', value: 'english' },
			{ label: 'Albanian', value: 'albanian' },
			{ label: 'Arabic', value: 'arabic' },
			{ label: 'Portuguese', value: 'portuguese' }
		]
	}
};
