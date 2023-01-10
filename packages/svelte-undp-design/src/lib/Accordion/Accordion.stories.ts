import type { Meta, StoryObj } from '@storybook/svelte';

import Accordion from './Accordion.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Accordion',
	component: Accordion,
	tags: ['docsPage'],
	argTypes: {
		headerTitle: {
			type: 'string',
			description: 'Header title to be shown in accordion',
			defaultValue: undefined
		},
		isExpanded: {
			type: 'boolean',
			description: 'State of whether accordion is opened or closed.',
			defaultValue: false
		},
		fontSize: {
			type: 'string',
			description: 'Font size of the accordion header title.',
			defaultValue: 'medium'
		}
	},
	parameters: {
		isExpanded: {
			values: [true, false]
		},
		fontSize: {
			values: ['small', 'medium']
		}
	}
} satisfies Meta<Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		headerTitle: 'title',
		isExpanded: false
	}
};
