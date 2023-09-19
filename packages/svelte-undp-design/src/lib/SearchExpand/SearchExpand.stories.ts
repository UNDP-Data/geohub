import type { Meta, StoryObj } from '@storybook/svelte';

import SearchExpand from './SearchExpand.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/SearchExpand',
	component: SearchExpand,
	tags: ['autodocs'],
	argTypes: {
		value: {
			type: 'string',
			description: 'Input value in textbox',
			defaultValue: ''
		},
		minSearchLength: {
			type: 'number',
			description: 'Minimum length of character start seaching',
			defaultValue: 2
		},
		open: {
			type: 'boolean',
			description: 'If true, textbox is always expanded with underline.',
			defaultValue: false
		},
		placeholder: {
			type: 'string',
			description: 'Placeholder text for input element',
			defaultValue: 'type keywords to search'
		},
		timeout: {
			type: 'number',
			description: 'Timeout (ms) for debounce',
			defaultValue: 500
		}
	}
} satisfies Meta<SearchExpand>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {}
};
