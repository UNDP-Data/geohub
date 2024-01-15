import type { Meta, StoryObj } from '@storybook/svelte';

import Accordion from './Accordion.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Accordion',
	component: Accordion,
	tags: ['autodocs'],
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
			defaultValue: 'normal',
			control: { type: 'select' },
			options: ['small', 'normal', 'medium']
		},
		headerIcon: {
			type: 'string',
			description: 'Fontawesome icon class name',
			defaultValue: ''
		}
	}
} satisfies Meta<Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		headerTitle: 'title',
		isExpanded: false,
		headerIcon: '',
		fontSize: 'medium'
	}
};

export const Icon: Story = {
	args: {
		headerTitle: 'title with icon',
		isExpanded: false,
		headerIcon: 'fas fa-circle'
	}
};

export const Small: Story = {
	args: {
		headerTitle: 'small font size',
		isExpanded: false,
		fontSize: 'small'
	}
};
