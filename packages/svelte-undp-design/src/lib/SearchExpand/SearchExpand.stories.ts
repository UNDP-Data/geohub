import type { Meta, StoryObj } from '@storybook/svelte';

import SearchExpand from './SearchExpand.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/SearchExpand',
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
		},
		fontSize: {
			type: 'number',
			description: 'Font size. Value should be between 1 (3rem) and 7 (0.75rem).',
			defaultValue: 4
		},
		iconSize: {
			type: 'number',
			description: 'Icon size in pixel. Default is 24px.',
			defaultValue: 24
		},
		loading: {
			type: 'boolean',
			description: 'If true, switch search icon to loader',
			defaultValue: false
		},
		disabled: {
			type: 'boolean',
			description: 'If true, disable control',
			defaultValue: false
		}
	}
} satisfies Meta<SearchExpand>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {}
};

export const Large: Story = {
	args: {
		iconSize: 36,
		fontSize: 2
	}
};

export const Expand: Story = {
	args: {
		open: true
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: 'test'
	}
};

export const Loading: Story = {
	args: {
		disabled: true,
		loading: true,
		open: true,
		value: 'test'
	}
};
