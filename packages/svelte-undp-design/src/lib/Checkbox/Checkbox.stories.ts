import type { Meta, StoryObj } from '@storybook/svelte';

import Checkbox from './Checkbox.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Checkbox',
	component: Checkbox,
	tags: ['docsPage'],
	argTypes: {
		label: {
			type: 'string',
			description: 'Label to be shown in checkbox',
			defaultValue: undefined
		},
		checked: {
			type: 'boolean',
			description: 'State of checkbox',
			defaultValue: false
		}
	},
	parameters: {
		checked: {
			values: [true, false]
		}
	}
} satisfies Meta<Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		label: 'checkbox label',
		checked: true
	}
};
