import type { Meta, StoryObj } from '@storybook/svelte';
import FloatingPanel from './FloatingPanel.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/FloatingPanel',
	component: FloatingPanel,
	tags: ['autodocs'],
	argTypes: {
		title: {
			type: 'string',
			description: 'Title of panel'
		},
		isExpanded: {
			type: 'boolean',
			description: 'If true, expand the panel. Default is false',
			defaultValue: false
		}
	}
} satisfies Meta<FloatingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'Panel title',
		isExpanded: false
	}
};

export const Expanded: Story = {
	args: {
		title: 'Panel title',
		isExpanded: true
	}
};
