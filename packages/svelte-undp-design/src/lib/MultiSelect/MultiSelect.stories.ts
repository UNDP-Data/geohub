import type { Meta, StoryObj } from '@storybook/svelte';

import MultiSelect from './MultiSelect.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/MultiSelect',
	component: MultiSelect,
	tags: ['autodocs'],
	argTypes: {
		category: {
			type: 'string',
			description: 'Main category of selectbox'
		},
		items: {
			description: 'The list of items of MultiSelectItem interface'
		},
		controlType: {
			type: 'string',
			description: 'Control type either checkbox or radio',
			defaultValue: 'checkbox',
			control: { type: 'select' },
			options: ['checkbox', 'radio']
		},
		isFixHeight: {
			type: 'boolean',
			description: 'If true, fix height of select box',
			defaultValue: false
		}
	}
} satisfies Meta<MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		category: 'Category',
		items: [
			{ id: 'category1', label: 'Category', checked: false, value: 'category1' },
			{ id: 'category2', label: 'Category', checked: false, value: 'category2' },
			{ id: 'category3', label: 'Category', checked: false, value: 'category3' },
			{ id: 'category4', label: 'Category', checked: false, value: 'category4' },
			{
				id: 'category5',
				label: 'Category',
				checked: true,
				value: 'category5',
				children: [
					{ id: 'category7', label: 'Category', checked: false, value: 'category7' },
					{ id: 'category8', label: 'Category', checked: false, value: 'category8' },
					{ id: 'category9', label: 'Category', checked: false, value: 'category9' }
				]
			},
			{
				id: 'category6',
				label: 'Category',
				checked: false,
				value: 'category6',
				children: [
					{ id: 'category10', label: 'Category', checked: false, value: 'category10' },
					{ id: 'category11', label: 'Category', checked: false, value: 'category11' },
					{ id: 'category12', label: 'Category', checked: false, value: 'category12' }
				]
			}
		]
	}
};
