import type { Meta, StoryObj } from '@storybook/svelte';
import Accordion from './Accordion.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Accordion',
	component: Accordion,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'The title of the control',
			defaultValue: ''
		},
		isExpanded: {
			type: 'boolean',
			description: 'If true, accordion is expanded',
			defaultValue: undefined
		},
		isSelected: {
			type: 'boolean',
			description: 'If true, the state is changed as selected.',
			defaultValue: false
		},
		showHoveredColor: {
			type: 'boolean',
			description: 'If true, color on hover is changed',
			defaultValue: false
		}
	}
} satisfies Meta<Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'Accordion title',
		isExpanded: true,
		isSelected: false,
		showHoveredColor: false
	}
};

export const Selected: Story = {
	args: {
		title: 'Accordion title',
		isExpanded: true,
		isSelected: true,
		showHoveredColor: false
	}
};

export const HoveredColor: Story = {
	args: {
		title: 'Accordion title',
		isExpanded: true,
		isSelected: false,
		showHoveredColor: true
	}
};
